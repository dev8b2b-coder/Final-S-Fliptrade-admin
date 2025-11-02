import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Plus, Shield } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import * as api from '../utils/api';

interface AddRoleSheetProps {
  trigger?: React.ReactNode;
  onRoleAdded?: () => void;
}

export function AddRoleSheet({ trigger, onRoleAdded }: AddRoleSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [roleName, setRoleName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setRoleName('');
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await api.addRole(roleName.trim());

      if (result?.success) {
        toast.success('Role added successfully!');
        setIsOpen(false);
        resetForm();
        if (onRoleAdded) {
          onRoleAdded();
        }
      }
    } catch (error: any) {
      console.error('Add role error:', error);
      toast.error(error.message || 'Failed to add role');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = roleName.trim().length > 0;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button 
            variant="outline"
            onClick={resetForm}
            className="border-[#6a40ec] text-[#6a40ec] hover:bg-[#6a40ec] hover:text-white"
          >
            <Shield className="w-4 h-4 mr-2" />
            Add Role
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="sm:max-w-[500px] p-0 flex flex-col">
        {/* Header - Fixed */}
        <SheetHeader className="px-6 py-4 border-b bg-white shrink-0">
          <SheetTitle className="text-xl">Add New Role</SheetTitle>
          <SheetDescription>Create a new role. Permissions will be assigned when creating staff members.</SheetDescription>
        </SheetHeader>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          <form id="add-role-form" onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              {/* Role Information Section */}
              <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
                <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-[#6a40ec]/5 to-transparent border-b">
                  <div className="w-8 h-8 rounded-lg bg-[#6a40ec] flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-semibold text-base">Role Information</span>
                </div>

                <div className="p-5">
                  <div className="space-y-2">
                    <Label htmlFor="roleName" className="text-sm font-medium text-gray-700 flex items-center">
                      Role Name <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="roleName"
                      value={roleName}
                      onChange={(e) => setRoleName(e.target.value)}
                      placeholder="e.g., Sales Manager, HR Executive"
                      required
                      className="h-10"
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter a unique name for this role</p>
                  </div>
                </div>
              </div>

              {/* Info Note */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-blue-900 mb-1">About Permissions</h4>
                    <p className="text-xs text-blue-700">
                      After creating this role, you can assign specific permissions to staff members when adding or editing them in the Staff Management section.
                    </p>
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
              form="add-role-form"
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
                  Add Role
                </>
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
