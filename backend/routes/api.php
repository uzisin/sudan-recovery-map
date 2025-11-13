<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\AuthController;

// -------- Public Auth --------
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// -------- Public Reports (for map) --------
Route::get('/reports', [ReportController::class, 'index']);

// -------- Protected (Sanctum) --------
Route::middleware('auth:sanctum')->group(function () {

    // User
    Route::get('/user',            [AuthController::class, 'user']);
    Route::put('/user',            [AuthController::class, 'updateProfile']);
    Route::put('/user/password',   [AuthController::class, 'updatePassword']);
    Route::post('/logout',         [AuthController::class, 'logout']);

    // Reports (owned by user)
    Route::post('/reports',           [ReportController::class, 'store']);   // موجود من قبل
    Route::get('/my-reports',         [ReportController::class, 'myReports']);
    Route::get('/reports/{id}',       [ReportController::class, 'show']);
    Route::put('/reports/{id}',       [ReportController::class, 'update']);
    Route::delete('/reports/{id}',    [ReportController::class, 'destroy']);
});
