"use client"
import React, { useState, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

// Client component that safely uses useSearchParams
const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSendOTP = async () => {
    setIsLoading(true);
    setStatus(null);
    try {
      const res = await fetch('/api/auth/generateOTP', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
        setStatus({ type: 'success', message: data.message });
      } else {
        setStatus({ type: 'error', message: data.error });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to send OTP' });
    }
    setIsLoading(false);
  };

  const handleVerifyOTP = async () => {
    setIsLoading(true);
    setStatus(null);
    try {
      const res = await fetch('/api/auth/verifyOTP', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus({ type: 'success', message: 'Login successful' });
        if (callbackUrl && data.token) {
          const encodedToken = encodeURIComponent(data.token);
          const redirectUrl = `${callbackUrl}?token=${encodedToken}`;
          console.log('Redirecting to:', redirectUrl);
          router.push(redirectUrl);
        } else {
          router.push('/');
        }
      } else {
        setStatus({ type: 'error', message: data.message });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to verify OTP' });
    }
    setIsLoading(false);
  };

  return (
    <Card className="max-w-md mx-auto mt-10 p-4 shadow-md">
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>
      <CardContent>
        {status && (
          <Alert className={`mb-4 ${status.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
            {status.message}
          </Alert>
        )}

        <Label>Email</Label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={otpSent || isLoading}
        />

        {otpSent && (
          <>
            <Label className="mt-4">Enter OTP</Label>
            <Input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              className="text-center text-lg tracking-wider"
              disabled={isLoading}
            />
          </>
        )}

        <Button
          className="mt-4 w-full"
          onClick={otpSent ? handleVerifyOTP : handleSendOTP}
          disabled={isLoading || (!otpSent && !email) || (otpSent && !otp)}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin mr-2" />
              {otpSent ? 'Verifying...' : 'Sending...'}
            </>
          ) : (
            otpSent ? 'Verify OTP' : 'Send OTP'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

// Loading fallback component
const LoginFormFallback = () => {
  return (
    <Card className="max-w-md mx-auto mt-10 p-4 shadow-md">
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center items-center py-8">
          <Loader2 className="animate-spin h-8 w-8" />
        </div>
      </CardContent>
    </Card>
  );
};

// Main page component with Suspense boundary
const ProfessorLogin = () => {
  return (
    <Suspense fallback={<LoginFormFallback />}>
      <LoginForm />
    </Suspense>
  );
};

export default ProfessorLogin;