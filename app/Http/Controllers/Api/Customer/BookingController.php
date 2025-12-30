<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Booking\StoreBookingRequest;
use App\Http\Requests\Booking\SubmitComplaintRequest;
use App\Models\Booking;
use App\Models\Schedule;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BookingController extends Controller
{
    /**
     * Get customer's bookings
     */
    public function index(Request $request): JsonResponse
    {
        $query = Booking::with(['service', 'schedule', 'cleaner.user'])
            ->forUser($request->user()->id);

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
     * Create a new booking
     */
    public function store(StoreBookingRequest $request): JsonResponse
    {
        $service = Service::find($request->service_id);
        $schedule = Schedule::find($request->schedule_id);

        // Validate service is active
        if (!$service || !$service->isActive()) {
            return response()->json([
                'success' => false,
                'message' => 'Layanan tidak tersedia.',
            ], 422);
        }

        // Validate schedule is available
        if (!$schedule || !$schedule->isAvailable()) {
            return response()->json([
                'success' => false,
                'message' => 'Jadwal tidak tersedia.',
            ], 422);
        }

        try {
            DB::beginTransaction();

            $booking = Booking::create([
                'id' => time() . rand(100, 999),
                'booking_code' => Booking::generateBookingCode(),
                'user_id' => $request->user()->id,
                'service_id' => $request->service_id,
                'schedule_id' => $request->schedule_id,
                'address' => $request->address,
                'status' => Booking::STATUS_PENDING,
                'total_price' => $service->price,
            ]);

            // Decrement schedule capacity
            $schedule->decrementCapacity();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Booking berhasil dibuat.',
                'data' => $booking->load(['service', 'schedule']),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat booking: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get a specific booking
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $booking = Booking::with(['service', 'schedule', 'cleaner.user'])
            ->forUser($request->user()->id)
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
     * Get available services (active only)
     */
    public function services(): JsonResponse
    {
        $services = Service::active()->get();

        return response()->json([
            'success' => true,
            'data' => $services,
        ]);
    }

    /**
     * Get available schedules
     */
    public function schedules(Request $request): JsonResponse
    {
        $query = Schedule::available()->upcoming();

        // Filter by date
        if ($request->has('date')) {
            $query->whereDate('date', $request->date);
        }

        $schedules = $query->orderBy('date', 'asc')
            ->orderBy('start_time', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $schedules,
        ]);
    }

    /**
     * Submit complaint for completed booking
     */
    public function submitComplaint(SubmitComplaintRequest $request, int $id): JsonResponse
    {
        $booking = Booking::with(['service', 'schedule', 'cleaner.user'])
            ->forUser($request->user()->id)
            ->find($id);

        if (!$booking) {
            return response()->json([
                'success' => false,
                'message' => 'Booking tidak ditemukan.',
            ], 404);
        }

        if ($booking->status !== Booking::STATUS_COMPLETED) {
            return response()->json([
                'success' => false,
                'message' => 'Hanya booking dengan status "Completed" yang dapat dikeluhkan.',
            ], 422);
        }

        $booking->update([
            'customer_complaint' => $request->customer_complaint,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Keluhan berhasil dikirim. Admin akan meninjau keluhan Anda.',
            'data' => $booking->load(['service', 'schedule', 'cleaner.user']),
        ]);
    }
}
