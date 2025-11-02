import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { AlertCircle, CheckCircle, Shield } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

export function PermissionFixPage() {
  const [isFixing, setIsFixing] = useState(false);
  const [isFixed, setIsFixed] = useState(false);
  const [error, setError] = useState('');

  const handleFixPermissions = async () => {
    setIsFixing(true);
    setError('');

    try {
      // Get current session token
      const token = localStorage.getItem('supabase.auth.token');
      
      if (!token) {
        throw new Error('No authentication token found. Please try logging in again.');
      }

      // Parse the token JSON
      const tokenData = JSON.parse(token);
      const accessToken = tokenData?.currentSession?.access_token;

      if (!accessToken) {
        throw new Error('Invalid token format. Please try logging in again.');
      }

      // Call the fix permissions endpoint
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-63060bc2/fix-admin-permissions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'Only the first user can use this endpoint') {
          throw new Error('Only the first registered user can fix permissions automatically. Please contact the administrator.');
        }
        throw new Error(data.error || 'Failed to fix permissions');
      }

      setIsFixed(true);
      toast.success('Permissions fixed successfully! Please refresh the page.');
      
      // Reload page after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (err: any) {
      console.error('Fix permissions error:', err);
      setError(err.message || 'Failed to fix permissions');
      toast.error(err.message || 'Failed to fix permissions');
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#6a40ec] to-[#8b5cf6] flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Permission Error</CardTitle>
          <CardDescription>
            Your account doesn't have the required permissions to access the system.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {isFixed && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-green-800">
                    Permissions fixed successfully! Refreshing page...
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#6a40ec]" />
              How to Fix This Issue:
            </h3>
            
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-[#6a40ec] text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs">
                  1
                </div>
                <div>
                  <p className="font-medium mb-1">For First User (Automatic Fix):</p>
                  <p className="text-gray-600">
                    If you're the first user who created this account, click the button below to automatically fix your permissions.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 bg-[#6a40ec] text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs">
                  2
                </div>
                <div>
                  <p className="font-medium mb-1">For Other Users (Manual Fix):</p>
                  <p className="text-gray-600">
                    Contact your administrator to update your permissions. The admin can run the SQL script located at <code className="bg-gray-100 px-1 py-0.5 rounded">/database/fix-user-permissions.sql</code> in the Supabase SQL Editor.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 bg-[#6a40ec] text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs">
                  3
                </div>
                <div>
                  <p className="font-medium mb-1">Manual SQL Fix:</p>
                  <p className="text-gray-600 mb-2">
                    Go to Supabase Dashboard → SQL Editor and run:
                  </p>
                  <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
{`UPDATE kv_store_63060bc2
SET value = jsonb_set(
  value, '{permissions}',
  -- Full permissions JSON here
)
WHERE value->>'email' = 'your-email@domain.com';`}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleFixPermissions}
              disabled={isFixing || isFixed}
              className="w-full bg-[#6a40ec] hover:bg-[#5a2fd9]"
            >
              {isFixing ? 'Fixing Permissions...' : 'Fix My Permissions (First User Only)'}
            </Button>

            <Button
              onClick={() => window.location.href = '/'}
              variant="outline"
              className="w-full"
            >
              Back to Login
            </Button>
          </div>

          {/* Additional Help */}
          <div className="text-center text-sm text-gray-600">
            <p>Need help? Contact your system administrator.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
