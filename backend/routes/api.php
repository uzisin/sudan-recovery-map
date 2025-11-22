<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\StoryController;

use App\Models\Report;
use App\Models\Story;

/*
|--------------------------------------------------------------------------
| Public Authentication Routes
|--------------------------------------------------------------------------
*/

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);


/*
|--------------------------------------------------------------------------
| Public Data (Anyone Can View)
|--------------------------------------------------------------------------
*/

// Reports for map loading
Route::get('/reports', [ReportController::class, 'index']);

// Stories (public viewing)
Route::get('/stories', [StoryController::class, 'index']);


/*
|--------------------------------------------------------------------------
| Public Dashboard APIs (No Login Required)
|--------------------------------------------------------------------------
*/

Route::get('/dashboard-summary', function () {

    return [
        'totalReports'     => Report::count(),
        'totalStories'     => Story::count(),
        'areasAssessed'    => Report::distinct('stateName')->count('stateName'),
        'servicesRestored' => 0,  // يمكنك تحديثها لاحقًا حسب جدول الخدمات
    ];
});


Route::get('/dashboard-updates', function () {
    return Report::latest()->take(10)->get();
});


/*
|--------------------------------------------------------------------------
| Protected Routes — Requires Token
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | User Profile
    |--------------------------------------------------------------------------
    */
    Route::get('/user',              [AuthController::class, 'user']);
    Route::put('/user',              [AuthController::class, 'updateProfile']);
    Route::put('/user/password',     [AuthController::class, 'updatePassword']);
    Route::post('/logout',           [AuthController::class, 'logout']);


    /*
    |--------------------------------------------------------------------------
    | Reports
    |--------------------------------------------------------------------------
    */
    Route::post('/reports',            [ReportController::class, 'store']);
    Route::get('/my-reports',          [ReportController::class, 'myReports']);
    Route::get('/reports/{id}',        [ReportController::class, 'show']);
    Route::put('/reports/{id}',        [ReportController::class, 'update']);
    Route::delete('/reports/{id}',     [ReportController::class, 'destroy']);


    /*
    |--------------------------------------------------------------------------
    | Stories
    |--------------------------------------------------------------------------
    */
    Route::post('/stories',                 [StoryController::class, 'store']);
    Route::post('/stories/{story}/vote',    [StoryController::class, 'vote']);

    Route::get('/my-stories',               [StoryController::class, 'myStories']);
    Route::put('/stories/{story}',          [StoryController::class, 'update']);
    Route::delete('/stories/{story}',       [StoryController::class, 'destroy']);
});
