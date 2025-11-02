import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Checkbox } from './ui/checkbox';
import { Plus, UserPlus, Shield } from 'lucide-react';
import { useAdmin, Staff, UserRole, UserPermissions, ModulePermission } from './admin-context-new';
import { toast } from 'sonner@2.0.3';
import * as api from '../utils/api';

// No default permissions - all permissions start as false and must be manually assigned
const emptyPermissions: UserPermissions = {
  dashboard: { view: false, add: false, edit: false, delete: false },
  deposits: { view: false, add: false, edit: false, delete: false },
  bankDeposits: { view: false, add: false, edit: false, delete: false },
  staffManagement: { view: false, add: false, edit: false, delete: false },
};

interface AddStaffSheetProps {
  trigger?: React.ReactNode;
}

export function AddStaffSheet({ trigger }: AddStaffSheetProps) {
  const { staff, setStaff, addActivityLog, roles } = useAdmin();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '' as UserRole | '',
    permissions: {
      dashboard: { view: false, add: false, edit: false, delete: false },
      deposits: { view: false, add: false, edit: false, delete: false },
      bankDeposits: { view: false, add: false, edit: false, delete: false },
      staffManagement: { view: false, add: false, edit: false, delete: false },
    } as UserPermissions,
  });
  const [isLoading, setIsLoading] = useState(false);

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

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: '',
      permissions: emptyPermissions,
    });
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create account via backend signup API with manually assigned permissions
      const result = await api.signUp(
        formData.email,
        formData.password,
        formData.name,
        formData.role as UserRole,
        formData.permissions
      );

      if (result?.success) {
        toast.success('Staff member added successfully!');
        
        // Reload staff data to get the new staff member
        const staffData = await api.getStaff();
        if (staffData?.staff) {
          setStaff(staffData.staff);
        }
        
        setIsOpen(false);
        resetForm();
      }
    } catch (error: any) {
      console.error('Add staff error:', error);
      toast.error(error.message || 'Failed to add staff member');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = formData.name && formData.email && formData.password && formData.role;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button className="bg-[#6a40ec] hover:bg-[#5a2fd9]" onClick={resetForm}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add Staff Member
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="sm:max-w-[700px] p-0 flex flex-col">
        {/* Header - Fixed */}
        <SheetHeader className="px-6 py-4 border-b bg-white shrink-0">
          <SheetTitle className="text-xl">Add Staff Member</SheetTitle>
          <SheetDescription>Create a new team member account with role-based permissions</SheetDescription>
        </SheetHeader>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          <form id="add-staff-form" onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              {/* Basic Information Section */}
              <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
                <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-[#6a40ec]/5 to-transparent border-b">
                  <div className="w-8 h-8 rounded-lg bg-[#6a40ec] flex items-center justify-center flex-shrink-0">
                    <UserPlus className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-semibold text-base">Basic Information</span>
                </div>

                <div className="p-5">
                  <div className="space-y-4">
                    {/* Name Field */}
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center">
                        Full Name <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter full name"
                        required
                        className="h-10"
                      />
                    </div>

                    {/* Email Field */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center">
                        Email Address <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter email address"
                        required
                        className="h-10"
                      />
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center">
                        Temporary Password <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Enter temporary password"
                        required
                        className="h-10"
                      />
                      <p className="text-xs text-gray-500 mt-1">Staff will use this password to login</p>
                    </div>

                    {/* Role Dropdown */}
                    <div className="space-y-2">
                      <Label htmlFor="role" className="text-sm font-medium text-gray-700 flex items-center">
                        Role <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Select
                        value={formData.role}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as UserRole }))}
                        required
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[280px]">
                          {roles.map((role) => (
                            <SelectItem key={role.id} value={role.name} className="cursor-pointer">
                              <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-[#6a40ec]" />
                                <span>{role.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500 mt-1">Select the role for this staff member</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Module Permissions Section */}
              <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
                <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-[#6a40ec]/5 to-transparent border-b">
                  <div className="w-8 h-8 rounded-lg bg-[#6a40ec] flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-semibold text-base">Module Permissions</span>
                </div>

                <div className="p-5">
                  <div className="space-y-4">
                    {Object.entries(formData.permissions).map(([module, perms]) => (
                      <div key={module} className="border rounded-lg p-4 bg-gray-50/50">
                        <h4 className="font-semibold text-sm capitalize mb-3 text-gray-800">
                          {module.replace(/([A-Z])/g, ' $1').trim()}
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
                              <Label htmlFor={`${module}-${action}`} className="text-sm capitalize cursor-pointer font-medium">
                                {action}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer - Fixed at Bottom */}
        <div className="shrink-0 border-t bg-white px-6 py-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)} 
              className="h-10 px-6"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              form="add-staff-form"
              disabled={!isFormValid || isLoading}
              className="bg-[#6a40ec] hover:bg-[#5a2fd9] h-10 px-6"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Staff Member
                </>
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
