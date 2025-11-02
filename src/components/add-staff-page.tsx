import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { ArrowLeft, Mail, UserPlus, Shield } from 'lucide-react';
import { useAdmin, Staff, UserRole, UserPermissions, ModulePermission } from './admin-context-new';
import { toast } from 'sonner@2.0.3';
import { CredentialsDialog } from './credentials-dialog';

const defaultPermissions: Record<UserRole, UserPermissions> = {
  'Super Admin': {
    dashboard: { view: true, add: false, edit: false, delete: false },
    deposits: { view: true, add: true, edit: true, delete: true },
    bankDeposits: { view: true, add: true, edit: true, delete: true },
    staffManagement: { view: true, add: true, edit: true, delete: true },
  },
  'Admin': {
    dashboard: { view: true, add: false, edit: false, delete: false },
    deposits: { view: true, add: true, edit: true, delete: false },
    bankDeposits: { view: true, add: true, edit: false, delete: false },
    staffManagement: { view: true, add: true, edit: true, delete: false },
  },
  'Manager': {
    dashboard: { view: true, add: false, edit: false, delete: false },
    deposits: { view: true, add: true, edit: true, delete: false },
    bankDeposits: { view: true, add: true, edit: false, delete: false },
    staffManagement: { view: true, add: true, edit: true, delete: false },
  },
  'Accountant': {
    dashboard: { view: true, add: false, edit: false, delete: false },
    deposits: { view: true, add: true, edit: true, delete: false },
    bankDeposits: { view: true, add: true, edit: true, delete: false },
    staffManagement: { view: false, add: false, edit: false, delete: false },
  },
  'Viewer': {
    dashboard: { view: true, add: false, edit: false, delete: false },
    deposits: { view: true, add: false, edit: false, delete: false },
    bankDeposits: { view: true, add: false, edit: false, delete: false },
    staffManagement: { view: false, add: false, edit: false, delete: false },
  },
};

export function AddStaffPage() {
  const { setCurrentPage, staff, setStaff, signup, loadData } = useAdmin();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '' as UserRole | '',
    permissions: {
      dashboard: { view: false, add: false, edit: false, delete: false },
      deposits: { view: false, add: false, edit: false, delete: false },
      bankDeposits: { view: false, add: false, edit: false, delete: false },
      staffManagement: { view: false, add: false, edit: false, delete: false },
    } as UserPermissions,
    sendEmail: true,
    emailMessage: 'Welcome to our team! Your admin account has been created. You will receive login credentials shortly.',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [staffCredentials, setStaffCredentials] = useState({ email: '', password: '', name: '' });

  const handleRoleChange = (role: UserRole) => {
    setFormData(prev => ({
      ...prev,
      role,
      permissions: defaultPermissions[role],
    }));
  };

  const handlePermissionChange = (module: keyof UserPermissions, action: keyof ModulePermission, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: {
          ...prev.permissions[module],
          [action]: value,
        },
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Generate a default password - in production this should be more secure
      const defaultPassword = 'Password123!';
      
      await signup(formData.email, defaultPassword, formData.name, formData.role as UserRole);
      
      // Reload staff data
      await loadData();
      
      // Show credentials dialog instead of just toast
      setStaffCredentials({
        email: formData.email,
        password: defaultPassword,
        name: formData.name,
      });
      setShowCredentials(true);
      
      toast.success(`Staff member "${formData.name}" added successfully!`);
      
      // Don't navigate immediately - let user see and copy credentials first
      // Navigation will happen when they close the dialog
    } catch (error: any) {
      console.error('Add staff error:', error);
      toast.error(error.message || 'Failed to add staff member');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseCredentials = () => {
    setShowCredentials(false);
    setCurrentPage('staff-management');
  };

  const isFormValid = formData.name && formData.email && formData.role;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={() => setCurrentPage('staff-management')}
          className="p-2"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add Staff Member</h1>
          <p className="text-gray-600 mt-1">Create a new team member account with role-based permissions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserPlus className="w-5 h-5 mr-2 text-[#6a40ec]" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Enter the basic details for the new staff member
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter full name"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="role">Role *</Label>
                <Select value={formData.role} onValueChange={handleRoleChange}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Super Admin">Super Admin</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Accountant">Accountant</SelectItem>
                    <SelectItem value="Viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
                {formData.role && (
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.role === 'Super Admin' && 'Full access to all modules and operations'}
                    {formData.role === 'Admin' && 'Access to most modules with limited delete permissions'}
                    {formData.role === 'Manager' && 'Managerial access with editing capabilities'}
                    {formData.role === 'Accountant' && 'Financial modules access only'}
                    {formData.role === 'Viewer' && 'Read-only access to permitted modules'}
                  </p>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Permissions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2 text-[#6a40ec]" />
              Module Permissions
            </CardTitle>
            <CardDescription>
              Customize permissions for each module (auto-set based on role)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.entries(formData.permissions).map(([module, perms]) => (
                <div key={module} className="border rounded-lg p-4">
                  <h4 className="font-medium capitalize mb-3">{module.replace(/([A-Z])/g, ' $1').trim()}</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(perms)
                      .filter(([action]) => action !== 'activity')
                      .map(([action, enabled]) => (
                      <div key={action} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${module}-${action}`}
                          checked={enabled}
                          onCheckedChange={(checked) => 
                            handlePermissionChange(
                              module as keyof UserPermissions, 
                              action as keyof ModulePermission, 
                              !!checked
                            )
                          }
                        />
                        <Label htmlFor={`${module}-${action}`} className="text-sm capitalize">
                          {action}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Email Notification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="w-5 h-5 mr-2 text-[#6a40ec]" />
            Email Notification
          </CardTitle>
          <CardDescription>
            Configure the welcome email for the new staff member
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="send-email"
              checked={formData.sendEmail}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, sendEmail: checked }))}
            />
            <Label htmlFor="send-email">Send welcome email to new staff member</Label>
          </div>

          {formData.sendEmail && (
            <div>
              <Label htmlFor="email-message">Welcome Message</Label>
              <Textarea
                id="email-message"
                value={formData.emailMessage}
                onChange={(e) => setFormData(prev => ({ ...prev, emailMessage: e.target.value }))}
                placeholder="Enter a welcome message..."
                className="mt-1 min-h-[100px]"
              />
              <p className="text-xs text-gray-500 mt-1">
                This message will be included in the welcome email along with login credentials.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <Button
          variant="outline"
          onClick={() => setCurrentPage('staff-management')}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!isFormValid || isLoading}
          className="bg-[#6a40ec] hover:bg-[#5a2fd9] text-white"
        >
          {isLoading ? 'Adding Staff Member...' : 'Add Staff Member'}
        </Button>
      </div>

      {/* Summary Card */}
      {isFormValid && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Name:</strong> {formData.name}
              </div>
              <div>
                <strong>Email:</strong> {formData.email}
              </div>
              <div>
                <strong>Role:</strong> {formData.role}
              </div>
              <div>
                <strong>Email Notification:</strong> {formData.sendEmail ? 'Yes' : 'No'}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Credentials Dialog */}
      <CredentialsDialog
        isOpen={showCredentials}
        onClose={handleCloseCredentials}
        email={staffCredentials.email}
        password={staffCredentials.password}
        name={staffCredentials.name}
      />
    </div>
  );
}