<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AppointmentReminder extends Model
{
    use HasFactory;

    protected $fillable = ['appointment_id', 'hours_before', 'sent_at'];

    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }
}