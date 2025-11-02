import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAdmin, UserRole } from './admin-context-new';
import Group1 from '../imports/Group1-47-1099';

export function SignupPage() {
  const { signup, isLoading: contextLoading, setCurrentPage, roles, loadRoles } = useAdmin();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Admin' as UserRole,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      await signup(formData.email, formData.password, formData.name, formData.role);
      // Redirect to login page after successful signup
      setCurrentPage('login');
    } catch (err: any) {
      console.error('Signup error:', err);
      // Better error handling
      let errorMessage = err.message || 'Signup failed. Please try again.';
      
      // Check for specific error types
      if (errorMessage.includes('already been registered') || errorMessage.includes('User already registered')) {
        errorMessage = 'This email is already registered. Please login or use a different email.';
      } else if (errorMessage.includes('Invalid email')) {
        errorMessage = 'Please enter a valid email address.';
      } else if (errorMessage.includes('weak password')) {
        errorMessage = 'Password is too weak. Use a stronger password with at least 6 characters.';
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
            {/* Logo */}
            <div className="flex justify-center mb-4">
              <div className="w-56 h-16 flex items-center justify-center">
                <Group1 />
              </div>
            </div>
            <CardTitle className="text-2xl text-gray-800">Create Account</CardTitle>
            <CardDescription className="text-gray-600">
              Sign up to get started with the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <Label htmlFor="name" className="mb-2 block">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email" className="mb-2 block">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <Label htmlFor="role" className="mb-2 block">Role</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[280px]">
                    {roles.length > 0 ? (
                      roles.map((role) => (
                        <SelectItem key={role.id} value={role.name}>
                          {role.name}
                        </SelectItem>
                      ))
                    ) : (
                      <>
                        <SelectItem value="Super Admin">Super Admin</SelectItem>
                        <SelectItem value="Admin">Admin</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="password" className="mb-2 block">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

              <div>
                <Label htmlFor="confirmPassword" className="mb-2 block">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Confirm your password"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#6a40ec] hover:bg-[#5a2fd9] text-white"
                disabled={isLoading || contextLoading}
              >
                {isLoading || contextLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Sign Up'
                )}
              </Button>
              
              {error && (
                <div className="text-red-500 text-sm text-center mt-2">
                  {error}
                </div>
              )}

              <div className="text-center mt-4">
                <span className="text-gray-600 text-sm">Already have an account? </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage('login')}
                  className="text-[#6a40ec] hover:text-[#5a2fd9] text-sm font-medium"
                >
                  Sign In
                </button>
              </div>

            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
