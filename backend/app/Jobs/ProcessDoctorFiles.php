<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\Doctor;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class ProcessDoctorFiles implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $doctorId;
    protected $files;
    protected $oldPaths;

    public function __construct($doctorId, array $files, array $oldPaths = [])
    {
        $this->doctorId = $doctorId;
        $this->files = $files;
        $this->oldPaths = $oldPaths;
    }

    public function handle()
    {
        try {
            Log::info('Starting file processing job', [
                'doctor_id' => $this->doctorId,
                'files_received' => array_keys($this->files),
                'old_paths' => $this->oldPaths,
            ]);

            $doctor = Doctor::findOrFail($this->doctorId);
            $updateData = [];

            $fieldMap = [
                'profile_photo' => 'profile_photo',
                'medical_license' => 'medical_license_path',
                'degree_certificate' => 'degree_certificate_path',
                'id_proof' => 'id_proof_path',
            ];

            foreach ($this->files as $key => $file) {
                Log::info('Processing file', [
                    'key' => $key,
                    'doctor_id' => $this->doctorId,
                    'file_size' => $file->getSize(),
                    'file_type' => $file->getClientOriginalExtension(),
                ]);

                if (!array_key_exists($key, $fieldMap)) {
                    Log::warning('Unsupported file field', ['key' => $key, 'doctor_id' => $this->doctorId]);
                    continue;
                }

                if (!$file->isValid()) {
                    Log::error('Invalid file uploaded', ['key' => $key, 'doctor_id' => $this->doctorId]);
                    continue;
                }

                $rules = [
                    'profile_photo' => ['image', 'mimes:jpeg,png,jpg', 'max:2048'],
                    'medical_license' => ['mimes:pdf,jpeg,png,jpg', 'max:5120'],
                    'degree_certificate' => ['mimes:pdf,jpeg,png,jpg', 'max:5120'],
                    'id_proof' => ['mimes:pdf,jpeg,png,jpg', 'max:5120'],
                ];

                $validator = \Validator::make([$key => $file], [$key => $rules[$key]]);
                if ($validator->fails()) {
                    Log::error('File validation failed', [
                        'key' => $key,
                        'doctor_id' => $this->doctorId,
                        'errors' => $validator->errors()->all(),
                    ]);
                    continue;
                }

                if (isset($this->oldPaths[$key]) && Storage::disk('public')->exists($this->oldPaths[$key])) {
                    Storage::disk('public')->delete($this->oldPaths[$key]);
                    Log::info('Deleted old file', ['key' => $key, 'path' => $this->oldPaths[$key]]);
                }

                $paths = [
                    'profile_photo' => 'doctors/profile-photos',
                    'medical_license' => 'doctors/documents/medical_licenses',
                    'degree_certificate' => 'doctors/documents/degree_certificates',
                    'id_proof' => 'doctors/documents/id_proofs',
                ];

                $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs($paths[$key], $filename, 'public');
                $url = Storage::disk('public')->url($path);

                $updateData[$fieldMap[$key]] = $path;

                Log::info('File processed', [
                    'key' => $key,
                    'path' => $path,
                    'url' => $url,
                    'doctor_id' => $this->doctorId,
                ]);
            }

            if (!empty($updateData)) {
                $doctor->update($updateData);
                Log::info('Doctor files updated', [
                    'doctor_id' => $this->doctorId,
                    'files' => array_keys($updateData),
                ]);
            } else {
                Log::warning('No files updated', ['doctor_id' => $this->doctorId]);
            }

        } catch (\Exception $e) {
            Log::error('File processing failed', [
                'doctor_id' => $this->doctorId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            $this->fail($e);
        }
    }
}