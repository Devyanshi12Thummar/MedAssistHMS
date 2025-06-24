<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\Appointment;

class AppointmentConfirmed extends Notification implements ShouldQueue
{
    use Queueable;

    protected $appointment;

    public function __construct(Appointment $appointment)
    {
        $this->appointment = $appointment;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Appointment Confirmed')
            ->greeting('Hello ' . $this->appointment->patient->patient->first_name . ',')
            ->line('Your appointment has been confirmed.')
            ->line('Doctor: ' . $this->appointment->doctor->doctor->full_name)
            ->line('Date: ' . $this->appointment->appointment_date->format('Y-m-d'))
            ->line('Time: ' . $this->appointment->start_time . ' - ' . $this->appointment->end_time)
            ->line('Notes: ' . ($this->appointment->notes ?? 'None'))
            ->action('View Appointment', url('/dashboard/appointments')) // Use url() helper
            ->line('Thank you for using MedAssist!');
    }

    public function toArray($notifiable)
    {
        return [
            'appointment_id' => $this->appointment->id,
            'doctor_name' => $this->appointment->doctor->doctor->full_name,
            'date' => $this->appointment->appointment_date->format('Y-m-d'),
            'start_time' => $this->appointment->start_time,
            'end_time' => $this->appointment->end_time,
        ];
    }
}