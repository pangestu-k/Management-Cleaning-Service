<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Schedule\StoreScheduleRequest;
use App\Http\Requests\Schedule\UpdateScheduleRequest;
use App\Models\Schedule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ScheduleController extends Controller
{
    /**
     * Get all schedules
     */
    public function index(Request $request): JsonResponse
    {
        $query = Schedule::query();

        // Filter by date
        if ($request->has('date')) {
            $query->whereDate('date', $request->date);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter upcoming only
        if ($request->boolean('upcoming')) {
            $query->upcoming();
        }

        $schedules = $query->orderBy('date', 'asc')
            ->orderBy('start_time', 'asc')
            ->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $schedules,
        ]);
    }

    /**
     * Create a new schedule
     */
    public function store(StoreScheduleRequest $request): JsonResponse
    {
        $schedule = Schedule::create([
            'id' => time() . rand(100, 999),
            'date' => $request->date,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'capacity' => $request->capacity,
            'remaining_capacity' => $request->capacity,
            'status' => $request->status ?? Schedule::STATUS_AVAILABLE,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Jadwal berhasil dibuat.',
            'data' => $schedule,
        ], 201);
    }

    /**
     * Get a specific schedule
     */
    public function show(int $id): JsonResponse
    {
        $schedule = Schedule::with('bookings')->find($id);

        if (!$schedule) {
            return response()->json([
                'success' => false,
                'message' => 'Jadwal tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $schedule,
        ]);
    }

    /**
     * Update a schedule
     */
    public function update(UpdateScheduleRequest $request, int $id): JsonResponse
    {
        $schedule = Schedule::find($id);

        if (!$schedule) {
            return response()->json([
                'success' => false,
                'message' => 'Jadwal tidak ditemukan.',
            ], 404);
        }

        $schedule->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Jadwal berhasil diperbarui.',
            'data' => $schedule,
        ]);
    }

    /**
     * Delete a schedule
     */
    public function destroy(int $id): JsonResponse
    {
        $schedule = Schedule::find($id);

        if (!$schedule) {
            return response()->json([
                'success' => false,
                'message' => 'Jadwal tidak ditemukan.',
            ], 404);
        }

        // Check if schedule has bookings
        if ($schedule->bookings()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Jadwal tidak dapat dihapus karena memiliki booking.',
            ], 422);
        }

        $schedule->delete();

        return response()->json([
            'success' => true,
            'message' => 'Jadwal berhasil dihapus.',
        ]);
    }
}
