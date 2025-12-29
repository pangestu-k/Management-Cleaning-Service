<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// SPA fallback - all routes handled by React Router
Route::get('/{any?}', function () {
    return view('app');
})->where('any', '.*');
