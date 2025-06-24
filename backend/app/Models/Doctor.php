<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Doctor extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'first_name',
        'last_name',
        'date_of_birth',
        'gender',
        'contact_number',
        'email',
        'registration_number',
        'specialization',
        'experience',
        'consultation_fees',
        'clinic_name',
        'clinic_address',
        'clinic_city',
        'clinic_state',
        'clinic_postal_code',
        'clinic_country',
        'telemedicine_support',
        'profile_photo',
        'medical_license_path',
        'degree_certificate_path',
        'id_proof_path',
        'clinic_opening_time',
        'clinic_closing_time',
        'working_days',
    ];

    protected $casts = [
        'telemedicine_support' => 'boolean',
        'working_days' => 'array',
        'clinic_opening_time' => 'datetime:H:i',
        'clinic_closing_time' => 'datetime:H:i',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function availabilities()
    {
        return $this->hasMany(Availability::class, 'doctor_id', 'user_id');
    }

    // URL Accessors for file fields
    public function getProfilePhotoUrlAttribute()
    {
        return $this->profile_photo
            ? Storage::disk('public')->url($this->profile_photo)
            : null;
    }

    public function getMedicalLicenseUrlAttribute()
    {
        return $this->medical_license_path
            ? Storage::disk('public')->url($this->medical_license_path)
            : null;
    }

    public function getDegreeCertificateUrlAttribute()
    {
        return $this->degree_certificate_path
            ? Storage::disk('public')->url($this->degree_certificate_path)
            : null;
    }

    public function getIdProofUrlAttribute()
    {
        return $this->id_proof_path
            ? Storage::disk('public')->url($this->id_proof_path)
            : null;
    }

    // Append URL attributes to JSON response
    protected $appends = [
        'profile_photo_url',
        'medical_license_url',
        'degree_certificate_url',
        'id_proof_url',
    ];
}