<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cleaner\StoreCleanerRequest;
use App\Http\Requests\Cleaner\UpdateCleanerRequest;
use App\Models\Cleaner;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class CleanerController extends Controller
{
    /**
     * Get all cleaners
     */
    public function index(Request $request): JsonResponse
    {
        $query = Cleaner::with('user');

        // Search by name or email
        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $cleaners = $query->orderBy('created_at', 'desc')->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $cleaners,
        ]);
    }

    /**
     * Create a new cleaner
     */
    public function store(StoreCleanerRequest $request): JsonResponse
    {
        try {
            DB::beginTransaction();

            // Create user with cleaner role
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => User::ROLE_CLEANER,
            ]);

            // Create cleaner profile
            $cleaner = Cleaner::create([
                'id' => time() . rand(100, 999),
                'user_id' => $user->id,
                'phone' => $request->phone,
                'status' => $request->status ?? Cleaner::STATUS_ACTIVE,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Cleaner berhasil dibuat.',
                'data' => $cleaner->load('user'),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat cleaner: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get a specific cleaner
     */
    public function show(int $id): JsonResponse
    {
        $cleaner = Cleaner::with('user')->find($id);

        if (!$cleaner) {
            return response()->json([
                'success' => false,
                'message' => 'Cleaner tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $cleaner,
        ]);
    }

    /**
     * Update a cleaner
     */
    public function update(UpdateCleanerRequest $request, int $id): JsonResponse
    {
        $cleaner = Cleaner::with('user')->find($id);

        if (!$cleaner) {
            return response()->json([
                'success' => false,
                'message' => 'Cleaner tidak ditemukan.',
            ], 404);
        }

        try {
            DB::beginTransaction();

            // Update user if applicable
            $userData = [];
            if ($request->has('name')) {
                $userData['name'] = $request->name;
            }
            if ($request->has('email')) {
                $userData['email'] = $request->email;
            }
            if ($request->has('password')) {
                $userData['password'] = Hash::make($request->password);
            }
            if (!empty($userData)) {
                $cleaner->user->update($userData);
            }

            // Update cleaner profile
            $cleanerData = [];
            if ($request->has('phone')) {
                $cleanerData['phone'] = $request->phone;
            }
            if ($request->has('status')) {
                $cleanerData['status'] = $request->status;
            }
            if (!empty($cleanerData)) {
                $cleaner->update($cleanerData);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Cleaner berhasil diperbarui.',
                'data' => $cleaner->fresh('user'),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui cleaner: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a cleaner
     */
    public function destroy(int $id): JsonResponse
    {
        $cleaner = Cleaner::find($id);

        if (!$cleaner) {
            return response()->json([
                'success' => false,
                'message' => 'Cleaner tidak ditemukan.',
            ], 404);
        }

        try {
            DB::beginTransaction();

            $user = $cleaner->user;
            $cleaner->delete();
            if ($user) {
                $user->delete();
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Cleaner berhasil dihapus.',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus cleaner: ' . $e->getMessage(),
            ], 500);
        }
    }
}
