import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, Mail, Lock, KeyRound } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import Group1 from '../imports/Group1-47-1099';

interface ForgotPasswordPageProps {
  onBackToLogin: () => void;
}

export function ForgotPasswordPage({ onBackToLogin }: ForgotPasswordPageProps) {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(3);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-63060bc2/forgot-password/send-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      toast.success('OTP sent to your email! Check your inbox.');
      
      // Show debug OTP if available (development only)
      if (data.debug_otp) {
        toast.info(`Development Mode - OTP: ${data.debug_otp}`, {
          duration: 10000,
        });
      }
      
      setStep('otp');
      setRemainingAttempts(3);
    } catch (error: any) {
      console.error('Send OTP error:', error);
      toast.error(error.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp) {
      toast.error('Please enter the OTP');
      return;
    }

    if (!newPassword) {
      toast.error('Please enter a new password');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-63060bc2/forgot-password/verify-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ email, otp, newPassword }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (data.remainingAttempts !== undefined) {
          setRemainingAttempts(data.remainingAttempts);
        }
        throw new Error(data.error || 'Failed to verify OTP');
      }

      toast.success('Password reset successfully! Redirecting to login...');
      
      setTimeout(() => {
        onBackToLogin();
      }, 2000);
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      toast.error(error.message || 'Failed to verify OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    await handleSendOTP(new Event('submit') as any);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#6a40ec] to-[#8b5cf6] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="backdrop-blur-md bg-white/95 shadow-2xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="w-56 h-16 flex items-center justify-center">
                <Group1 />
              </div>
            </div>
            <CardTitle className="text-2xl text-gray-800">Reset Password</CardTitle>
            <CardDescription className="text-gray-600">
              {step === 'email' 
                ? 'Enter your email to receive a verification code'
                : 'Enter the OTP sent to your email and set a new password'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 'email' ? (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      disabled={isLoading}
                      autoFocus
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#6a40ec] hover:bg-[#5a2fd9] text-white"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending OTP...' : 'Send OTP'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Verification Code (OTP)</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="pl-10 tracking-widest text-center"
                      disabled={isLoading}
                      autoFocus
                      maxLength={6}
                    />
                  </div>
                  {remainingAttempts < 3 && (
                    <p className="text-sm text-amber-600">
                      {remainingAttempts} attempt(s) remaining
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResendOTP}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    Resend OTP
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-[#6a40ec] hover:bg-[#5a2fd9] text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Verifying...' : 'Reset Password'}
                  </Button>
                </div>
              </form>
            )}

            <div className="flex justify-center mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={onBackToLogin}
                className="flex items-center gap-2 text-[#6a40ec] hover:text-[#5a2fd9] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Login</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
