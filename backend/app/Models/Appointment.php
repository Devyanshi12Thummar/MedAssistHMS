<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Appointment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'doctor_id', 
        'patient_id', 
        'availability_id', 
        'appointment_date', 
        'start_time',
        'end_time',
        'request_status', 
        'appointment_status', 
        'notes', 
    ];

    protected $casts = [
        'appointment_date' => 'date',
    ];

    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    public function patient()
    {
        return $this->belongsTo(User::class, 'patient_id');
    }

    public function availability()
    {
        return $this->belongsTo(Availability::class);
    }
    public function reminders()
{
    return $this->hasMany(AppointmentReminder::class);
}
}