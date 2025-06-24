<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class EmailVerificationController extends Controller
{
    public function verify(Request $request)
    {
        Log::info('Entering verify method', [
            'request' => $request->all(),
            'id' => $request->id,
            'hash' => $request->hash,
            'signature' => $request->query('signature'),
            'email' => $request->user()?->email ?? 'No authenticated user',
        ]);

        $user = User::findOrFail($request->id);

        if (!hash_equals((string) $request->hash, sha1($user->getEmailForVerification()))) {
            Log::error('Invalid verification hash', [
                'user_id' => $user->id,
                'email' => $user->email,
                'provided_hash' => $request->hash,
                'expected_hash' => sha1($user->getEmailForVerification()),
            ]);
            return response()->json(['message' => 'Invalid verification link'], 403);
        }

        if ($user->hasVerifiedEmail()) {
            Log::info('Email already verified', ['user_id' => $user->id]);
            // Redirect to login even if already verified
            return redirect('https://medassisthms.netlify.app/login');
        }

        try {
            $user->email_verified_at = now();
            $user->save();

            event(new Verified($user));
            Log::info('Email verified successfully', ['user_id' => $user->id]);

            // Redirect to frontend login page
            return redirect('https://medassisthms.netlify.app/login');
        } catch (\Exception $e) {
            Log::error('Verification exception', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['message' => 'Verification failed: ' . $e->getMessage()], 500);
        }
    }

    public function resend(Request $request)
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email already verified'], 200);
        }

        $user->notify(new CustomVerifyEmail);

        Log::info('Verification email resent', ['user_id' => $user->id]);

        return response()->json(['message' => 'Verification email sent'], 200);
    }
}