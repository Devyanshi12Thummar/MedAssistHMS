<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Log;

class CustomVerifyEmail extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct()
    {
        Log::info('CustomVerifyEmail notification instantiated');
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        // Generate the signed backend verification URL
        $backendUrl = URL::temporarySignedRoute(
            'verification.verify',
            Carbon::now()->addMinutes(60),
            [
                'id' => $notifiable->getKey(),
                'hash' => sha1($notifiable->getEmailForVerification()),
            ],
            true // Ensure absolute URL
        );

        // Log the generated URL
        Log::info('Generated verification URL', [
            'user_id' => $notifiable->getKey(),
            'email' => $notifiable->getEmailForVerification(),
            'backend_url' => $backendUrl,
        ]);

        // Debug email content
        Log::info('Email content', [
            'subject' => 'Verify Your MedAssist Account',
            'action_url' => $backendUrl,
        ]);

        return (new MailMessage)
            ->subject('Verify Your MedAssist Account')
            ->greeting('Welcome to MedAssist!')
            ->line('Thank you for registering with MedAssist. Please verify your email address to activate your account.')
            ->action('Verify Email', $backendUrl)
            ->line('If you did not create an account, please ignore this email.')
            ->salutation('Best regards, The MedAssist Team');
    }

    public function toArray($notifiable)
    {
        return [];
    }
}