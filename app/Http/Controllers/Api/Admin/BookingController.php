<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Booking\AssignCleanerRequest;
use App\Http\Requests\Booking\UpdateBookingStatusRequest;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    /**
     * Get all bookings
     */
    public function index(Request $request): JsonResponse
    {
        $query = Booking::with(['user', 'service', 'schedule', 'cleaner.user']);

        // Search by booking code
        if ($request->has('search')) {
            $query->where('booking_code', 'like', '%' . $request->search . '%');
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by date range
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('created_at', [$request->start_date, $request->end_date]);
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
    public function show(int $id): JsonResponse
    {
        $booking = Booking::with(['user', 'service', 'schedule', 'cleaner.user'])->find($id);

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
     * Update booking status (Admin)
     */
    public function updateStatus(UpdateBookingStatusRequest $request, int $id): JsonResponse
    {
        $booking = Booking::find($id);

        if (!$booking) {
            return response()->json([
                'success' => false,
                'message' => 'Booking tidak ditemukan.',
            ], 404);
        }

        $booking->update([
            'status' => $request->status,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Status booking berhasil diperbarui.',
            'data' => $booking->load(['user', 'service', 'schedule', 'cleaner.user']),
        ]);
    }

    /**
     * Assign cleaner to booking
     */
    public function assignCleaner(AssignCleanerRequest $request, int $id): JsonResponse
    {
        $booking = Booking::find($id);

        if (!$booking) {
            return response()->json([
                'success' => false,
                'message' => 'Booking tidak ditemukan.',
            ], 404);
        }

        $booking->update([
            'cleaner_id' => $request->cleaner_id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Cleaner berhasil di-assign.',
            'data' => $booking->load(['user', 'service', 'schedule', 'cleaner.user']),
        ]);
    }
}
