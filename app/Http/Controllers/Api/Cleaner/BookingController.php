<?php

namespace App\Http\Controllers\Api\Cleaner;

use App\Http\Controllers\Controller;
use App\Http\Requests\Booking\UpdateBookingStatusRequest;
use App\Models\Booking;
use App\Models\Cleaner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    /**
     * Get cleaner's assigned bookings
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $cleaner = Cleaner::where('user_id', $user->id)->first();

        if (!$cleaner) {
            return response()->json([
                'success' => false,
                'message' => 'Profil cleaner tidak ditemukan.',
            ], 404);
        }

        $query = Booking::with(['user', 'service', 'schedule'])
            ->forCleaner($cleaner->id);

        // Filter by status
        if ($request->has('status')) {
            $query->byStatus($request->status);
        }

        $bookings = $query->orderBy('created_at', 'desc')->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $bookings,
        ]);
    }

    /**
     * Get a specific booking
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $cleaner = Cleaner::where('user_id', $user->id)->first();

        if (!$cleaner) {
            return response()->json([
                'success' => false,
                'message' => 'Profil cleaner tidak ditemukan.',
            ], 404);
        }

        $booking = Booking::with(['user', 'service', 'schedule'])
            ->forCleaner($cleaner->id)
            ->find($id);

        if (!$booking) {
            return response()->json([
                'success' => false,
                'message' => 'Booking tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $booking,
        ]);
    }

    /**
     * Update booking status (Cleaner can set On Progress or Completed)
     */
    public function updateStatus(UpdateBookingStatusRequest $request, int $id): JsonResponse
    {
        $user = $request->user();
        $cleaner = Cleaner::where('user_id', $user->id)->first();

        if (!$cleaner) {
            return response()->json([
                'success' => false,
                'message' => 'Profil cleaner tidak ditemukan.',
            ], 404);
        }

        $booking = Booking::forCleaner($cleaner->id)->find($id);

        if (!$booking) {
            return response()->json([
                'success' => false,
                'message' => 'Booking tidak ditemukan.',
            ], 404);
        }

        // Cleaner can only set "on_progress" or "completed"
        $allowedStatuses = [Booking::STATUS_ON_PROGRESS, Booking::STATUS_COMPLETED];
        if (!in_array($request->status, $allowedStatuses)) {
            return response()->json([
                'success' => false,
                'message' => 'Anda hanya dapat mengubah status ke "On Progress" atau "Completed".',
            ], 422);
        }

        // Validate status transition
        if ($request->status === Booking::STATUS_ON_PROGRESS && $booking->status !== Booking::STATUS_APPROVED) {
            return response()->json([
                'success' => false,
                'message' => 'Booking harus di-approve terlebih dahulu.',
            ], 422);
        }

        if ($request->status === Booking::STATUS_COMPLETED && $booking->status !== Booking::STATUS_ON_PROGRESS) {
            return response()->json([
                'success' => false,
                'message' => 'Booking harus dalam status "On Progress" untuk diselesaikan.',
            ], 422);
        }

        $booking->update([
            'status' => $request->status,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Status booking berhasil diperbarui.',
            'data' => $booking->load(['user', 'service', 'schedule']),
        ]);
    }
}
