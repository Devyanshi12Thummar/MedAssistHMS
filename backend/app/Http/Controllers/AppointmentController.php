<?php
namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Availability;
use App\Models\User;
use App\Notifications\AppointmentConfirmed;
use App\Notifications\AppointmentReminder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Notification;
use Carbon\Carbon;

class AppointmentController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware('role:patient')->only(['book']);
        $this->middleware('role:doctor')->only(['respond', 'getRequests']);
        $this->middleware('role:patient,doctor,admin')->only(['index', 'show']);
    }

    public function index(Request $request)
    {
        try {
            $query = Appointment::with(['doctor', 'patient', 'availability'])
                ->when(auth()->user()->role === 'patient', function ($q) {
                    return $q->where('patient_id', auth()->id());
                })
                ->when(auth()->user()->role === 'doctor', function ($q) {
                    return $q->where('doctor_id', auth()->id());
                });
    
            $appointments = $query->latest()->paginate(10);
    
            return response()->json([
                'status' => 'success',
                'data' => $appointments
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch appointments',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $appointment = Appointment::with(['doctor', 'patient', 'availability'])
                ->findOrFail($id);

            if (auth()->user()->role === 'patient' && $appointment->patient_id !== auth()->id()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized access'
                ], 403);
            }

            if (auth()->user()->role === 'doctor' && $appointment->doctor_id !== auth()->id()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized access'
                ], 403);
            }

            return response()->json([
                'status' => 'success',
                'data' => $appointment
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Appointment not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    public function book(Request $request)
    {
        try {
            DB::beginTransaction();

            $validator = Validator::make($request->all(), [
                'doctor_id' => 'required|exists:users,id',
                'availability_id' => 'required|exists:availabilities,id',
                'notes' => 'nullable|string|max:1000'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $availability = Availability::findOrFail($request->availability_id);

            if ($availability->is_booked) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'This time slot is already booked'
                ], 409);
            }

            if ($availability->doctor_id !== $request->doctor_id) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invalid doctor availability'
                ], 422);
            }

            $appointment = Appointment::create([
                'doctor_id' => $request->doctor_id,
                'patient_id' => auth()->id(),
                'availability_id' => $request->availability_id,
                'appointment_date' => $availability->date,
                'start_time' => $availability->start_time,
                'end_time' => $availability->end_time,
                'request_status' => 'pending',
                'notes' => $request->notes,
            ]);

            $availability->update(['is_booked' => true]);

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Appointment request created successfully',
                'data' => $appointment
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to book appointment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getRequests(Request $request)
    {
        try {
            $appointments = Appointment::with(['patient', 'availability'])
                ->where('doctor_id', auth()->id())
                ->where('request_status', 'pending')
                ->latest()
                ->paginate(10);

            return response()->json([
                'status' => 'success',
                'data' => $appointments
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch appointment requests',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function respond(Request $request, $id)
    {
        try {
            DB::beginTransaction();
    
            $validator = Validator::make($request->all(), [
                'status' => 'required|in:accepted,rejected',
                'start_time' => 'required_if:status,accepted',  // Removed date_format validation
                'end_time' => 'required_if:status,accepted',    // Removed date_format and after validation
                'notes' => 'nullable|string|max:1000'
            ]);
    
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
    
            $appointment = Appointment::with('availability')
                ->where('doctor_id', auth()->id())
                ->findOrFail($id);
    
            if ($appointment->request_status !== 'pending') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Appointment request already processed'
                ], 409);
            }
    
            $appointment->request_status = $request->status;
            
            if ($request->status === 'accepted') {
                $appointment->appointment_status = 'scheduled';
                $appointment->start_time = $request->start_time;
                $appointment->end_time = $request->end_time;
                
                if ($appointment->availability) {
                    $appointment->availability->update([
                        'start_time' => $request->start_time,
                        'end_time' => $request->end_time
                    ]);
                }
                
                // Send notification
                try {
                    Notification::send($appointment->patient, new AppointmentConfirmed($appointment));
                } catch (\Exception $e) {
                    \Log::error('Failed to send appointment notification: ' . $e->getMessage());
                }
            } else {
                if ($appointment->availability) {
                    $appointment->availability->update(['is_booked' => false]);
                }
                $appointment->appointment_status = 'cancelled';
            }
    
            if ($request->notes) {
                $appointment->notes = $request->notes;
            }
    
            $appointment->save();
    
            DB::commit();
    
            return response()->json([
                'status' => 'success',
                'message' => 'Appointment request processed successfully',
                'data' => $appointment
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to process appointment request',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}