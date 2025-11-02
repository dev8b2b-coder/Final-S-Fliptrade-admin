import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { AlertCircle, CheckCircle, Wrench, User, Shield } from 'lucide-react';
import { projectId } from '../utils/supabase/info';
import { supabase } from './admin-context-new';
import { toast } from 'sonner@2.0.3';

export function FixPermissionsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [isFixed, setIsFixed] = useState(false);

  const checkCurrentUser = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        toast.error('Not logged in. Please login first.');
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-63060bc2/debug/me`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      const data = await response.json();
      
      if (response.ok) {
        setUserData(data);
        toast.success('User data loaded successfully');
      } else {
        toast.error(data.error || 'Failed to load user data');
      }
    } catch (error: any) {
      console.error('Check user error:', error);
      toast.error(error.message || 'Failed to check user');
    } finally {
      setIsLoading(false);
    }
  };

  const fixPermissions = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        toast.error('Not logged in. Please login first.');
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-63060bc2/fix-admin-permissions`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      const data = await response.json();
      
      if (response.ok) {
        setIsFixed(true);
        setUserData((prev: any) => ({ ...prev, staffData: data.user }));
        toast.success('✅ Permissions fixed successfully! Reload the page.');
      } else {
        toast.error(data.error || 'Failed to fix permissions');
      }
    } catch (error: any) {
      console.error('Fix permissions error:', error);
      toast.error(error.message || 'Failed to fix permissions');
    } finally {
      setIsLoading(false);
    }
  };

  const reloadPage = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            <Wrench className="w-10 h-10 inline-block mr-2 text-[#6a40ec]" />
            Permission Troubleshooting
          </h1>
          <p className="text-gray-600">
            Fix "No permission to view staff" error
          </p>
        </div>

        {/* Instructions Card */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              Quick Fix Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-blue-800">
              <li>Click "Check Current User" to see your data</li>
              <li>If you're the first user, click "Fix My Permissions"</li>
              <li>After fixing, click "Reload Page"</li>
              <li>Login again and everything should work!</li>
            </ol>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={checkCurrentUser}
            disabled={isLoading}
            className="bg-[#6a40ec] hover:bg-[#5a2fd9] text-white h-14"
          >
            <User className="w-5 h-5 mr-2" />
            {isLoading ? 'Loading...' : 'Check Current User'}
          </Button>

          <Button
            onClick={fixPermissions}
            disabled={isLoading || !userData || !userData.isFirstUser}
            className="bg-green-600 hover:bg-green-700 text-white h-14"
          >
            <Shield className="w-5 h-5 mr-2" />
            Fix My Permissions
          </Button>

          <Button
            onClick={reloadPage}
            disabled={!isFixed}
            variant="outline"
            className="h-14"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Reload Page
          </Button>
        </div>

        {/* User Data Display */}
        {userData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2 text-[#6a40ec]" />
                Current User Data
              </CardTitle>
              <CardDescription>
                Debug information about your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* User Info */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <strong>Email:</strong> {userData.user?.email || 'N/A'}
                  </div>
                  <div>
                    <strong>User ID:</strong> {userData.user?.id || 'N/A'}
                  </div>
                </div>

                {/* Is First User */}
                <div className={`p-4 rounded-lg ${userData.isFirstUser ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                  <strong>First User:</strong> {userData.isFirstUser ? '✅ Yes (you can fix permissions)' : '❌ No (contact admin)'}
                </div>

                {/* Staff Data */}
                {userData.staffData ? (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-bold mb-2">Staff Data:</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Name:</strong> {userData.staffData.name}</div>
                      <div><strong>Email:</strong> {userData.staffData.email}</div>
                      <div><strong>Role:</strong> {userData.staffData.role}</div>
                      <div><strong>Status:</strong> {userData.staffData.status}</div>
                      
                      <div className="mt-3">
                        <strong>Permissions:</strong>
                        <div className="ml-4 mt-1 space-y-1">
                          {userData.staffData.permissions ? (
                            <>
                              <div>
                                <strong>Staff Management → View:</strong>{' '}
                                {userData.staffData.permissions.staffManagement?.view ? (
                                  <span className="text-green-600">✅ Enabled</span>
                                ) : (
                                  <span className="text-red-600">❌ Disabled (This is the problem!)</span>
                                )}
                              </div>
                              <div>
                                <strong>Dashboard → View:</strong>{' '}
                                {userData.staffData.permissions.dashboard?.view ? (
                                  <span className="text-green-600">✅ Enabled</span>
                                ) : (
                                  <span className="text-red-600">❌ Disabled</span>
                                )}
                              </div>
                            </>
                          ) : (
                            <span className="text-red-600">❌ No permissions found!</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <strong className="text-red-700">⚠️ No staff data found!</strong>
                    <p className="text-sm text-red-600 mt-1">
                      This means your user was created but staff data wasn't saved properly.
                    </p>
                  </div>
                )}

                {/* Staff List */}
                {userData.staffList && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <strong>Staff List:</strong>
                    <div className="text-sm mt-1">
                      Total Staff: {userData.staffList.length}
                      {userData.staffList.length === 1 && (
                        <span className="text-green-600 ml-2">
                          ✅ You're the only user - you can fix this!
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success Message */}
        {isFixed && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <h3 className="font-bold text-green-900">Permissions Fixed Successfully!</h3>
                  <p className="text-green-700">Click "Reload Page" button to refresh the app.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Help Text */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>If you see "No permissions found":</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Make sure you're logged in</li>
                <li>Try clicking "Fix My Permissions" if you're the first user</li>
                <li>If you're not the first user, contact the admin</li>
              </ul>
              
              <p className="mt-4"><strong>If you're not the first user:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Contact the Super Admin to grant you permissions</li>
                <li>They can do this from Staff Management page</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
