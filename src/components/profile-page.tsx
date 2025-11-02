import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Eye, EyeOff, Upload, User, Lock, Mail, Calendar } from 'lucide-react';
import { useAdmin } from './admin-context-new';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function ProfilePage() {
  const { user, setUser, logout } = useAdmin();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name) {
      toast.error('Name is required');
      return;
    }

    // Check if name changed
    if (name === user?.name) {
      toast.info('No changes to update');
      return;
    }

    setIsUpdating(true);

    try {
      const accessToken = sessionStorage.getItem('auth_token');
      
      if (!accessToken || !user) {
        toast.error('Session expired. Please login again.');
        setIsUpdating(false);
        return;
      }

      // Update profile via profile endpoint
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-63060bc2/profile`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            name,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      // Update local user state
      const updatedUser = { ...user, name };
      setUser(updatedUser);
      
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('All password fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    if (currentPassword === newPassword) {
      toast.error('New password must be different from current password');
      return;
    }

    setIsChangingPassword(true);

    try {
      const accessToken = sessionStorage.getItem('auth_token');
      
      if (!accessToken) {
        toast.error('Session expired. Please login again.');
        setIsChangingPassword(false);
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-63060bc2/change-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      // Show success message with longer duration
      toast.success('Password changed successfully! Please login again with your new password.', {
        duration: 3000,
      });
      
      // Wait for 2.5 seconds to show the message, then logout
      setTimeout(async () => {
        // Logout user silently (the logout function will show its own message)
        await logout();
      }, 2500);
    } catch (error: any) {
      console.error('Password change error:', error);
      toast.error(error.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        if (user) {
          setUser({ ...user, avatar: imageUrl });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-sm md:text-base text-gray-600 mt-1">Manage your personal information and security settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Profile Overview Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Profile Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center">
              <Avatar className="w-24 h-24 mb-4">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="bg-[#6a40ec] text-white text-xl">
                  {user?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h3 className="font-semibold text-lg">{user?.name}</h3>
                <p className="text-gray-600">{user?.email}</p>
                <Badge className="mt-2 bg-[#6a40ec] hover:bg-[#5a2fd9]">
                  {user?.role}
                </Badge>
              </div>
            </div>

            <Separator />

          </CardContent>
        </Card>

        {/* Profile Settings Tabs */}
        <Card className="lg:col-span-2">
          <Tabs defaultValue="general">
            <CardHeader>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="general" className="data-[state=active]:bg-[#6a40ec] data-[state=active]:text-white">
                  <User className="w-4 h-4 mr-2" />
                  General
                </TabsTrigger>
                <TabsTrigger value="security" className="data-[state=active]:bg-[#6a40ec] data-[state=active]:text-white">
                  <Lock className="w-4 h-4 mr-2" />
                  Security
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <TabsContent value="general">
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="mb-2 block">Full Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="profile-email" className="mb-2 block">Email Address</Label>
                    <Input
                      id="profile-email"
                      type="email"
                      value={email}
                      readOnly
                      disabled
                      className="bg-gray-50 cursor-not-allowed opacity-60"
                    />
                    <p className="text-sm text-gray-500 mt-1.5">
                      Email address cannot be changed. Contact administrator for assistance.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="role" className="mb-2 block">Role</Label>
                    <Input
                      id="role"
                      value={user?.role}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Contact your administrator to change your role
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#6a40ec] hover:bg-[#5a2fd9] text-white"
                    disabled={isUpdating}
                  >
                    {isUpdating ? 'Updating...' : 'Update Profile'}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>

            <TabsContent value="security">
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <CardDescription>
                    Update your password to keep your account secure
                  </CardDescription>

                  <div>
                    <Label htmlFor="current-password" className="mb-2 block">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        required
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      >
                        {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="new-password" className="mb-2 block">New Password</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        required
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      >
                        {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirm-new-password" className="mb-2 block">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirm-new-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
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

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Password Requirements</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• At least 8 characters long</li>
                      <li>• Mix of uppercase and lowercase letters</li>
                      <li>• At least one number or special character</li>
                    </ul>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#6a40ec] hover:bg-[#5a2fd9] text-white"
                    disabled={isChangingPassword || newPassword !== confirmPassword || newPassword.length < 8}
                  >
                    {isChangingPassword ? 'Changing Password...' : 'Change Password'}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}