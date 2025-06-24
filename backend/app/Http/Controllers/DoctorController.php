<?php

namespace App\Http\Controllers;

use App\Models\Doctor;
use App\Models\User;
use App\Models\Availability;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class DoctorController extends Controller
{
    public function index()
    {
        try {
            $doctors = Doctor::with('user')->latest()->paginate(10);
            return response()->json([
                'status' => 'success',
                'data' => $doctors
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch doctors',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show(string $id)
    {
        try {
            $doctor = Doctor::with('user')->findOrFail($id);
            return response()->json([
                'status' => 'success',
                'data' => $doctor
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Doctor not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    public function update(Request $request, string $id)
    {
        try {
            DB::beginTransaction();

            $doctor = Doctor::findOrFail($id);

            Log::info('Doctor update request', [
                'doctor_id' => $id,
                'data' => $request->all(),
                'files' => array_keys($request->files->all()),
            ]);

            // Validate the request
            $validator = Validator::make($request->all(), [
                'first_name' => 'sometimes|string|max:255|regex:/^[A-Za-z\s]+$/',
                'last_name' => 'sometimes|string|max:255|regex:/^[A-Za-z\s]+$/',
                'date_of_birth' => 'sometimes|date|before_or_equal:today',
                'gender' => 'sometimes|in:male,female,other',
                'contact_number' => 'sometimes|string|max:15|regex:/^[0-9]+$/',
                'email' => ['sometimes', 'email', Rule::unique('doctors')->ignore($id)],
                'registration_number' => 'sometimes|string|max:50',
                'specialization' => 'sometimes|string|in:cardiology,dermatology,neurology,orthopedics,pediatrics,psychiatry,gynecology',
                'experience' => 'sometimes|integer|min:0',
                'consultation_fees' => 'sometimes|numeric|min:0',
                'clinic_name' => 'sometimes|string|max:255',
                'clinic_address' => 'sometimes|string|max:255',
                'clinic_city' => 'sometimes|string|max:100',
                'clinic_state' => 'sometimes|string|max:100',
                'clinic_postal_code' => 'sometimes|string|max:10',
                'clinic_country' => 'sometimes|string|max:100',
                'telemedicine_support' => 'sometimes|boolean',
                'clinic_opening_time' => 'sometimes|date_format:H:i',
                'clinic_closing_time' => 'sometimes|date_format:H:i|after:clinic_opening_time',
                'working_days' => 'sometimes|json',
                'profile_photo' => 'sometimes|image|mimes:jpeg,png,jpg|max:2048',
                'medical_license' => 'sometimes|mimes:pdf,jpeg,png,jpg|max:5120',
                'degree_certificate' => 'sometimes|mimes:pdf,jpeg,png,jpg|max:5120',
                'id_proof' => 'sometimes|mimes:pdf,jpeg,png,jpg|max:5120',
                // Prevent direct updates to file path fields
                'profile_photo_path' => 'prohibited',
                'medical_license_path' => 'prohibited',
                'degree_certificate_path' => 'prohibited',
                'id_proof_path' => 'prohibited',
            ], [
                'profile_photo_path.prohibited' => 'Direct updates to profile_photo_path are not allowed. Use profile_photo file upload.',
                'medical_license_path.prohibited' => 'Direct updates to medical_license_path are not allowed. Use medical_license file upload.',
                'degree_certificate_path.prohibited' => 'Direct updates to degree_certificate_path are not allowed. Use degree_certificate file upload.',
                'id_proof_path.prohibited' => 'Direct updates to id_proof_path are not allowed. Use id_proof file upload.',
            ]);

            if ($validator->fails()) {
                Log::error('Validation failed for doctor update', [
                    'doctor_id' => $id,
                    'errors' => $validator->errors()->all(),
                ]);
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $updateData = $request->except([
                'profile_photo',
                'medical_license',
                'degree_certificate',
                'id_proof',
                'working_days',
                'clinic_opening_time',
                'clinic_closing_time',
                'profile_photo_path',
                'medical_license_path',
                'degree_certificate_path',
                'id_proof_path',
            ]);

            // Handle clinic hours and working days
            if ($request->has('clinic_opening_time')) {
                $updateData['clinic_opening_time'] = $request->clinic_opening_time;
            }
            if ($request->has('clinic_closing_time')) {
                $updateData['clinic_closing_time'] = $request->clinic_closing_time;
            }
            if ($request->has('working_days')) {
                $updateData['working_days'] = json_decode($request->working_days, true);
                if (!is_array($updateData['working_days'])) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Invalid working_days format',
                    ], 422);
                }
            }

            // Handle profile photo
            if ($request->hasFile('profile_photo')) {
                $file = $request->file('profile_photo');
                if ($doctor->profile_photo) {
                    Storage::disk('public')->delete($doctor->profile_photo);
                    Log::info('Deleted old profile photo', ['path' => $doctor->profile_photo]);
                }
                $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('doctors/profile-photos', $filename, 'public');
                $updateData['profile_photo'] = $path;
                Log::info('Profile photo uploaded', ['path' => $path]);
            }

            // Handle documents with correct database column names
            if ($request->hasFile('medical_license')) {
                $file = $request->file('medical_license');
                if ($doctor->medical_license_path) {
                    Storage::disk('public')->delete($doctor->medical_license_path);
                    Log::info('Deleted old medical license', ['path' => $doctor->medical_license_path]);
                }
                $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('doctors/documents/medical_licenses', $filename, 'public');
                $updateData['medical_license_path'] = $path;
                Log::info('Medical license uploaded', ['path' => $path]);
            }

            if ($request->hasFile('degree_certificate')) {
                $file = $request->file('degree_certificate');
                if ($doctor->degree_certificate_path) {
                    Storage::disk('public')->delete($doctor->degree_certificate_path);
                    Log::info('Deleted old degree certificate', ['path' => $doctor->degree_certificate_path]);
                }
                $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('doctors/documents/degree_certificates', $filename, 'public');
                $updateData['degree_certificate_path'] = $path;
                Log::info('Degree certificate uploaded', ['path' => $path]);
            }

            if ($request->hasFile('id_proof')) {
                $file = $request->file('id_proof');
                if ($doctor->id_proof_path) {
                    Storage::disk('public')->delete($doctor->id_proof_path);
                    Log::info('Deleted old ID proof', ['path' => $doctor->id_proof_path]);
                }
                $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('doctors/documents/id_proofs', $filename, 'public');
                $updateData['id_proof_path'] = $path;
                Log::info('ID proof uploaded', ['path' => $path]);
            }

            // Update doctor data
            $doctor->update($updateData);

            DB::commit();

            $doctor->refresh();

            return response()->json([
                'status' => 'success',
                'message' => 'Profile updated successfully',
                'data' => $doctor->load('user'),
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Doctor update failed', [
                'doctor_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update profile: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(string $id)
    {
        try {
            DB::beginTransaction();
            
            $doctor = Doctor::findOrFail($id);
            $doctor->delete();
            
            DB::commit();
            
            return response()->json([
                'status' => 'success',
                'message' => 'Doctor deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete doctor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function search(Request $request)
    {
        try {
            $query = Doctor::with('user');

            if ($request->has('name')) {
                $name = $request->name;
                $query->where(function($q) use ($name) {
                    $q->where('first_name', 'LIKE', "%{$name}%")
                      ->orWhere('last_name', 'LIKE', "%{$name}%");
                });
            }

            if ($request->has('specialization')) {
                $query->where('specialization', $request->specialization);
            }

            if ($request->has('city')) {
                $query->where('clinic_city', 'LIKE', "%{$request->city}%");
            }

            if ($request->has('fees_range')) {
                $query->whereBetween('consultation_fees', $request->fees_range);
            }

            $doctors = $query->paginate(10);

            return response()->json([
                'status' => 'success',
                'data' => $doctors
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to search doctors',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getProfile(Request $request)
    {
        try {
            $doctor = Doctor::with('user')
                          ->where('user_id', $request->user()->id)
                          ->firstOrFail();
            
            return response()->json([
                'status' => 'success',
                'data' => $doctor
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch doctor profile',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    public function setAvailability(Request $request)
    {
        try {
            DB::beginTransaction();
    
            $doctor = Doctor::where('user_id', $request->user()->id)->first();
            
            if (!$doctor) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Doctor not found'
                ], 404);
            }
    
            $validator = Validator::make($request->all(), [
                'date' => 'required|date|after_or_equal:today',
                'time_slots' => 'required|array',
                'time_slots.*.start_time' => 'required',
                'time_slots.*.end_time' => 'required'
            ]);
    
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
    
            Availability::where('doctor_id', $doctor->user_id)
                       ->where('date', $request->date)
                       ->delete();
    
            foreach ($request->time_slots as $slot) {
                Availability::create([
                    'doctor_id' => $doctor->user_id,
                    'date' => $request->date,
                    'start_time' => $slot['start_time'],
                    'end_time' => $slot['end_time'],
                    'is_booked' => false
                ]);
            }
    
            DB::commit();
    
            return response()->json([
                'status' => 'success',
                'message' => 'Availability set successfully'
            ]);
    
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Availability Error: ' . $e->getMessage());
    
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to set availability',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getAvailableDoctors(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'date' => 'date|after_or_equal:today',
            ]);
    
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
    
            $availableDoctors = Doctor::with(['user', 'availabilities' => function($query) use ($request) {
                $query->where('date', $request->date)
                      ->where('is_booked', false);
            }])
            ->whereHas('availabilities', function($query) use ($request) {
                $query->where('date', $request->date)
                      ->where('is_booked', false);
            })
            ->get();
    
            return response()->json([
                'status' => 'success',
                'data' => $availableDoctors
            ]);
    
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch available doctors',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}