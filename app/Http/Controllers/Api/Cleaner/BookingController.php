<?php

namespace App\Http\Controllers\Api\Cleaner;

use App\Http\Controllers\Controller;
use App\Http\Requests\Booking\UpdateBookingStatusRequest;
use App\Http\Requests\Booking\UploadEvidenceRequest;
use App\Models\Booking;
use App\Models\Cleaner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

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

        $updateData = [
            'status' => $request->status,
        ];

        // If changing to completed, handle evidence upload
        if ($request->status === Booking::STATUS_COMPLETED && $request->hasFile('evidence_cleaner')) {
            // Delete old evidence if exists
            if ($booking->evidence_cleaner && \Storage::disk('public')->exists($booking->evidence_cleaner)) {
                \Storage::disk('public')->delete($booking->evidence_cleaner);
            }

            // Store new evidence
            $file = $request->file('evidence_cleaner');
            $filename = 'evidence_' . $booking->id . '_' . time() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('evidence', $filename, 'public');

            $updateData['evidence_cleaner'] = $path;
        }

        $booking->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'Status booking berhasil diperbarui.',
            'data' => $booking->load(['user', 'service', 'schedule']),
        ]);
    }

    /**
     * Upload evidence for completed booking
     */
    public function uploadEvidence(UploadEvidenceRequest $request, int $id): JsonResponse
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

        if ($booking->status !== Booking::STATUS_ON_PROGRESS) {
            return response()->json([
                'success' => false,
                'message' => 'Hanya booking dengan status "On Progress" yang dapat mengupload evidence.',
            ], 422);
        }

        $booking->update([
            'evidence_cleaner' => $request->evidence_cleaner,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Evidence berhasil diupload.',
            'data' => $booking->load(['user', 'service', 'schedule']),
        ]);
    }

    /**
     * Get cleaner's schedule (bookings grouped by date)
     * Returns dates with bookings and bookings for a specific date
     */
    public function schedule(Request $request): JsonResponse
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
            ->forCleaner($cleaner->id)
            ->whereIn('status', [
                Booking::STATUS_APPROVED,
                Booking::STATUS_ON_PROGRESS,
                Booking::STATUS_COMPLETED,
            ]);

        // Filter by month/year
        if ($request->has('month') && $request->has('year')) {
            $month = $request->month;
            $year = $request->year;
            $query->whereHas('schedule', function ($q) use ($month, $year) {
                $q->whereYear('date', $year)
                    ->whereMonth('date', $month);
            });
        }

        // Filter by specific date
        if ($request->has('date')) {
            $query->whereHas('schedule', function ($q) use ($request) {
                $q->whereDate('date', $request->date);
            });
        }

        $bookings = $query->get();

        // Group bookings by date
        $datesWithBookings = [];
        $bookingsByDate = [];

        foreach ($bookings as $booking) {
            if ($booking->schedule) {
                $date = $booking->schedule->date;
                $dateKey = date('Y-m-d', strtotime($date));

                // Track dates that have bookings
                if (!in_array($dateKey, $datesWithBookings)) {
                    $datesWithBookings[] = $dateKey;
                }

                // Group bookings by date
                if (!isset($bookingsByDate[$dateKey])) {
                    $bookingsByDate[$dateKey] = [];
                }

                $bookingsByDate[$dateKey][] = [
                    'id' => $booking->id,
                    'booking_code' => $booking->booking_code,
                    'customer_name' => $booking->user->name,
                    'service_name' => $booking->service->name,
                    'start_time' => $booking->schedule->start_time,
                    'end_time' => $booking->schedule->end_time,
                    'address' => $booking->address,
                    'status' => $booking->status,
                    'total_price' => $booking->total_price,
                ];
            }
        }

        // Sort bookings by time for each date
        foreach ($bookingsByDate as $date => &$dateBookings) {
            usort($dateBookings, function ($a, $b) {
                $timeA = strtotime($a['start_time']);
                $timeB = strtotime($b['start_time']);
                return $timeA <=> $timeB;
            });
        }

        return response()->json([
            'success' => true,
            'data' => [
                'dates_with_bookings' => $datesWithBookings,
                'bookings_by_date' => $bookingsByDate,
            ],
        ]);
    }
}
