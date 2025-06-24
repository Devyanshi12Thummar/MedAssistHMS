<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\Appointment;
use Carbon\Carbon;

class AppointmentReminder extends Notification implements ShouldQueue
{
    use Queueable;

    protected $appointment;
    protected $hoursBefore;

    public function __construct(Appointment $appointment, $hoursBefore)
    {
        $this->appointment = $appointment;
        $this->hoursBefore = $hoursBefore;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        // Safely parse appointment date and time
        try {
            $appointmentTime = Carbon::createFromFormat(
                'Y-m-d H:i:s',
                $this->appointment->appointment_date->format('Y-m-d') . ' ' . $this->appointment->start_time
            );
        } catch (\Exception $e) {
            // Fallback if parsing fails
            $appointmentTime = Carbon::now();
            \Log::error('Failed to parse appointment time', [
                'appointment_id' => $this->appointment->id,
                'date' => $this->appointment->appointment_date,
                'start_time' => $this->appointment->start_time,
                'error' => $e->getMessage(),
            ]);
        }

        $subject = $this->hoursBefore === 'post_confirmation'
            ? 'Post-Confirmation Appointment Reminder'
            : 'Appointment Reminder: ' . $this->hoursBefore . ' Hours to Go';

        // Handle null relationships
        $patientName = $this->appointment->patient->first_name ?? 'Patient';
        $doctorName = ($this->appointment->doctor->first_name ?? 'Doctor') . ' ' . ($this->appointment->doctor->last_name ?? '');

        return (new MailMessage)
            ->subject($subject)
            ->greeting('Hello ' . $patientName . ',')
            ->line($this->hoursBefore === 'post_confirmation'
                ? 'Your appointment has been confirmed! This is a reminder of your upcoming appointment.'
                : 'This is a reminder for your upcoming appointment.')
            ->line('Doctor: ' . $doctorName)
            ->line('Date: ' . $appointmentTime->format('Y-m-d'))
            ->line('Time: ' . $this->appointment->start_time . ' - ' . $this->appointment->end_time)
            ->line('Notes: ' . ($this->appointment->notes ?? 'None'))
            ->action('View Appointment', url('/dashboard/appointments'))
            ->line('Please arrive on time. Thank you for using MedAssist!');
    }

    public function toArray($notifiable)
    {
        $doctorName = ($this->appointment->doctor->first_name ?? 'Doctor') . ' ' . ($this->appointment->doctor->last_name ?? '');
        return [
            'appointment_id' => $this->appointment->id,
            'doctor_name' => $doctorName,
            'date' => $this->appointment->appointment_date->format('Y-m-d'),
            'start_time' => $this->appointment->start_time,
            'end_time' => $this->appointment->end_time,
            'hours_before' => $this->hoursBefore,
        ];
    }
}