<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\DoctorController;
use App\Http\Controllers\AuthController;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\AppointmentController;
use Illuminate\Auth\Notifications\VerifyEmail;
use App\Http\Controllers\EmailVerificationController;
use App\Http\Controllers\PrescriptionController;

// Public routes
Route::post('/register', [UserController::class, 'register']);
Route::post('/login', [UserController::class, 'login']);

// Email verification routes
Route::prefix('email')->group(function () {
    Route::get('/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])
        ->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verify');

    Route::post('/verification-notification', [EmailVerificationController::class, 'resend'])
        ->middleware(['auth:sanctum', 'throttle:6,1'])
        ->name('verification.send');
});

// Password reset routes
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);

Route::post('/contact', [ContactController::class, 'store']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [UserController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Doctor routes
    Route::prefix('doctors')->group(function () {
        Route::get('/', [DoctorController::class, 'index']);
        Route::get('/profile', [DoctorController::class, 'getProfile']);
        Route::get('/{id}', [DoctorController::class, 'show']);
        Route::patch('/{id}', [DoctorController::class, 'update']);
        Route::delete('/{id}', [DoctorController::class, 'destroy']);
        Route::get('/search', [DoctorController::class, 'search']);
        Route::post('/availability', [DoctorController::class, 'setAvailability'])->middleware('role:doctor');
        Route::get('/available/{date}', [DoctorController::class, 'getAvailableDoctors']);
    });

    // Patient routes
    Route::prefix('patients')->middleware('role:patient')->group(function () {
        Route::get('/profile', [PatientController::class, 'getProfile']);
        Route::patch('/{id}', [PatientController::class, 'update']);
        Route::get('/{id}/medical-history', [PatientController::class, 'getMedicalHistory']);
    });

    // Appointment routes
    // Route::prefix('appointments')->group(function () {
    //     Route::post('/book', [AppointmentController::class, 'book'])->middleware('role:patient');
    //     Route::get('/my', [AppointmentController::class, 'patientAppointments'])->middleware('role:patient');
    //     Route::get('/requests', [AppointmentController::class, 'doctorRequests'])->middleware('role:doctor');
    //     Route::put('/respond/{id}', [AppointmentController::class, 'respond'])->middleware('role:doctor');
    //     Route::get('/', [AppointmentController::class, 'index']);
    //     Route::get('/{id}', [AppointmentController::class, 'show']);
    // });
// Appointment routes
Route::prefix('appointments')->group(function () {
    Route::post('/book', [AppointmentController::class, 'book'])->middleware('role:patient');
    Route::get('/', [AppointmentController::class, 'index'])->middleware('role:patient,doctor,admin');
    Route::get('/{id}', [AppointmentController::class, 'show'])->middleware('role:patient,doctor,admin');
    Route::get('/requests', [AppointmentController::class, 'getRequests'])->middleware('role:doctor');
    Route::put('/respond/{id}', [AppointmentController::class, 'respond'])->middleware('role:doctor');
    Route::get('/{id}/reminders', [AppointmentController::class, 'getReminders'])->middleware('role:patient,doctor');
});

    // Admin routes
    Route::middleware('role:admin')->group(function () {
        Route::get('/patients', [PatientController::class, 'getAllPatients']);
        Route::get('/patients/search', [PatientController::class, 'search']);
        Route::delete('/patients/{id}', [PatientController::class, 'destroy']);
        Route::post('/patients/{id}/medical-history', [PatientController::class, 'addMedicalHistory']);
        Route::delete('/doctors/{id}', [DoctorController::class, 'destroy']);
    });
});


Route::middleware('auth:api')->group(function () {
    Route::post('/prescriptions', [PrescriptionController::class, 'store']);
    Route::get('/prescriptions/doctor', [PrescriptionController::class, 'indexForDoctor']);
    Route::get('/prescriptions/patient', [PrescriptionController::class, 'indexForPatient']); // New endpoint
    Route::put('/prescriptions/{id}', [PrescriptionController::class, 'update']);
    Route::delete('/prescriptions/{id}', [PrescriptionController::class, 'destroy']);
});