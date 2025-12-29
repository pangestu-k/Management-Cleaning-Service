<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics
     */
    public function index(): JsonResponse
    {
        $totalOrders = Booking::count();
        $pendingOrders = Booking::where('status', Booking::STATUS_PENDING)->count();
        $approvedOrders = Booking::where('status', Booking::STATUS_APPROVED)->count();
        $onProgressOrders = Booking::where('status', Booking::STATUS_ON_PROGRESS)->count();
        $completedOrders = Booking::where('status', Booking::STATUS_COMPLETED)->count();
        $canceledOrders = Booking::where('status', Booking::STATUS_CANCELED)->count();

        $totalRevenue = Booking::where('status', Booking::STATUS_COMPLETED)
            ->sum('total_price');

        // Recent bookings
        $recentBookings = Booking::with(['user', 'service'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Today's orders
        $todayOrders = Booking::whereDate('created_at', today())->count();

        return response()->json([
            'success' => true,
            'data' => [
                'statistics' => [
                    'total_orders' => $totalOrders,
                    'pending_orders' => $pendingOrders,
                    'approved_orders' => $approvedOrders,
                    'on_progress_orders' => $onProgressOrders,
                    'completed_orders' => $completedOrders,
                    'canceled_orders' => $canceledOrders,
                    'today_orders' => $todayOrders,
                    'total_revenue' => $totalRevenue,
                ],
                'recent_bookings' => $recentBookings,
            ],
        ]);
    }
}
