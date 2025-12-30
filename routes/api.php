<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Admin\BookingController as AdminBookingController;
use App\Http\Controllers\Api\Admin\CleanerController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\ScheduleController;
use App\Http\Controllers\Api\Admin\ServiceController;
use App\Http\Controllers\Api\Customer\BookingController as CustomerBookingController;
use App\Http\Controllers\Api\Cleaner\BookingController as CleanerBookingController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/register', [AuthController::class, 'register']); // Customer registration
Route::post('/register/admin', [AuthController::class, 'registerAdmin']); // Admin registration (requires secret key)
Route::post('/login', [AuthController::class, 'login']);

// Public services list
Route::get('/services', [CustomerBookingController::class, 'services']);

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);

    // Admin routes
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        // Dashboard
        Route::get('/dashboard', [DashboardController::class, 'index']);

        // Services CRUD
        Route::apiResource('services', ServiceController::class);

        // Cleaners CRUD
        Route::apiResource('cleaners', CleanerController::class);

        // Schedules CRUD
        Route::apiResource('schedules', ScheduleController::class);

        // Bookings management
        Route::get('/bookings', [AdminBookingController::class, 'index']);
        Route::get('/bookings/{id}', [AdminBookingController::class, 'show']);
        Route::put('/bookings/{id}/status', [AdminBookingController::class, 'updateStatus']);
        Route::put('/bookings/{id}/assign-cleaner', [AdminBookingController::class, 'assignCleaner']);
    });

    // Customer routes
    Route::middleware('role:customer')->prefix('customer')->group(function () {
        // Available schedules
        Route::get('/schedules', [CustomerBookingController::class, 'schedules']);

        // Bookings
        Route::get('/bookings', [CustomerBookingController::class, 'index']);
        Route::post('/bookings', [CustomerBookingController::class, 'store']);
        Route::get('/bookings/{id}', [CustomerBookingController::class, 'show']);
        Route::post('/bookings/{id}/complaint', [CustomerBookingController::class, 'submitComplaint']);
    });

    // Cleaner routes
    Route::middleware('role:cleaner')->prefix('cleaner')->group(function () {
        // Schedule
        Route::get('/schedule', [CleanerBookingController::class, 'schedule']);
        
        // Assigned bookings
        Route::get('/bookings', [CleanerBookingController::class, 'index']);
        Route::get('/bookings/{id}', [CleanerBookingController::class, 'show']);
        Route::put('/bookings/{id}/status', [CleanerBookingController::class, 'updateStatus']);
        Route::post('/bookings/{id}/evidence', [CleanerBookingController::class, 'uploadEvidence']);
    });
});
