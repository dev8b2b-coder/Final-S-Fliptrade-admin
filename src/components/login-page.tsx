import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAdmin } from './admin-context-new';
import Group1 from '../imports/Group1-47-1099';

export function LoginPage() {
  const { login, isLoading: contextLoading, setCurrentPage } = useAdmin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await login(email, password);
    } catch (err: any) {
      console.error('Login error:', err);
      // Better error handling
      let errorMessage = err.message || 'Login failed. Please check your credentials.';
      
      // Check for specific error types
      if (errorMessage.includes('ACCOUNT_DELETED') || errorMessage.includes('deleted by the administrator')) {
        errorMessage = 'Your account has been deleted. Please contact support for assistance.';
      } else if (errorMessage.includes('ACCOUNT_DEACTIVATED') || errorMessage.includes('deactivated')) {
        errorMessage = 'Your account has been deactivated. Please contact support to reactivate.';
      } else if (errorMessage.includes('Invalid login credentials') || errorMessage.includes('Invalid email or password')) {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#6a40ec] to-[#8b5cf6] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="backdrop-blur-md bg-white/95 shadow-2xl border-0">
          <CardHeader className="text-center pb-6">
            {/* Logo Placeholder - Add your logo here */}
            <div className="flex justify-center mb-4">
              <div className="w-56 h-16 flex items-center justify-center">
                <Group1 />
              </div>
            </div>
            <CardTitle className="text-2xl text-gray-800">Welcome Back</CardTitle>
            <CardDescription className="text-gray-600">
              Sign in to access the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email" className="mb-2 block">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password" className="mb-2 block">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setCurrentPage('forgot-password')}
                  className="text-[#6a40ec] hover:text-[#5a2fd9] transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <Button
                type="submit"
                className="w-full bg-[#6a40ec] hover:bg-[#5a2fd9] text-white"
                disabled={isLoading || contextLoading}
              >
                {isLoading || contextLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
                  <p className="text-red-600 text-sm font-medium">{error}</p>
                  {(error.includes('Invalid') || error.includes('credentials') || error.includes('password')) && (
                    <div className="mt-2 text-xs text-red-600 space-y-1">
                      <p>• Make sure you've created an account first</p>
                      <p>• Check if your email and password are correct</p>
                      <p>• Password is case-sensitive</p>
                    </div>
                  )}
                </div>
              )}

              <div className="text-center mt-4">
                <span className="text-gray-600 text-sm">Don't have an account? </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage('signup')}
                  className="text-[#6a40ec] hover:text-[#5a2fd9] text-sm font-medium"
                >
                  Sign Up
                </button>
              </div>

            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}