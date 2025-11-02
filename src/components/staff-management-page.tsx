import { useState, useMemo } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { 
  Search, 
  MoreHorizontal, 
  UserPlus, 
  Eye, 
  Edit, 
  Trash2,
  Filter,
  X,
  UserX,
  Shield,
  Save,
  User,
  Calendar
} from 'lucide-react';
import { useAdmin, Staff, UserRole } from './admin-context-new';
import * as api from '../utils/api';
import { toast } from 'sonner@2.0.3';
import { TablePagination } from './table-pagination';
import { AddStaffSheet } from './add-staff-sheet';
import { AddRoleSheet } from './add-role-sheet';
import { TableSkeleton } from './shimmer-skeleton';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from './ui/sheet';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

export function StaffManagementPage() {
  const { staff, setStaff, setCurrentPage, user, canViewAllEntries, addActivityLog, loadData, loadRoles, roles, isLoading } = useAdmin();

  // Permission checks for current user
  const getCurrentUserPermissions = () => {
    if (!user) return null;
    // Use user.permissions directly instead of looking in staff array
    return user.permissions?.staffManagement || null;
  };

  const canAddStaff = () => {
    const permissions = getCurrentUserPermissions();
    return permissions?.add || false;
  };

  const canEditStaff = (staffMember: Staff) => {
    const permissions = getCurrentUserPermissions();
    if (!permissions) return false;
    
    // Users with edit permission can edit others, but not themselves to prevent role escalation
    return permissions.edit && staffMember.id !== user?.id;
  };

  const canDeleteStaff = (staffMember: Staff) => {
    const permissions = getCurrentUserPermissions();
    if (!permissions) return false;
    
    // Users with delete permission can delete others, but not themselves
    return permissions.delete && staffMember.id !== user?.id;
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterRole, setFilterRole] = useState<UserRole | 'all'>('all');
  const [currentPage, setCurrentPageState] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedMember, setSelectedMember] = useState<Staff | null>(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [editPermissionsOpen, setEditPermissionsOpen] = useState(false);
  const [editingPermissions, setEditingPermissions] = useState<any>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editingProfile, setEditingProfile] = useState<{ name: string; email: string } | null>(null);
  
  // Loading states
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPermissions, setIsSavingPermissions] = useState(false);
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [isDeletingStaff, setIsDeletingStaff] = useState(false);
  const [isDeactivatingStaff, setIsDeactivatingStaff] = useState(false);
  
  // Delete confirmation state
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    staff: Staff | null;
  }>({
    isOpen: false,
    staff: null
  });

  const filteredStaff = useMemo(() => {
    return staff.filter((member) => {
      // Filter out archived members
      if (member.isArchived) return false;
      
      const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.role.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || member.status === filterStatus;
      const matchesRole = filterRole === 'all' || member.role === filterRole;
      return matchesSearch && matchesStatus && matchesRole;
    }).sort((a, b) => {
      // Sort by createdAt descending (most recent first)
      if (a.createdAt && b.createdAt) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      // Fallback: maintain original order
      return 0;
    });
  }, [staff, searchTerm, filterStatus, filterRole]);

  const paginatedStaff = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredStaff.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredStaff, currentPage, itemsPerPage]);

  // Get all unique roles from both added roles and existing staff
  const allAvailableRoles = useMemo(() => {
    const roleSet = new Set<string>();
    
    // Add roles from the roles list
    roles.forEach(role => roleSet.add(role.name));
    
    // Add roles from existing staff members
    staff.forEach(member => {
      if (member.role && !member.isArchived) {
        roleSet.add(member.role);
      }
    });
    
    return Array.from(roleSet).sort();
  }, [roles, staff]);

  const hasActiveFilters = searchTerm !== '' || filterStatus !== 'all' || filterRole !== 'all';

  const clearAllFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterRole('all');
    setCurrentPageState(1);
  };

  const handleStatusToggle = async (memberId: string) => {
    const staffMember = staff.find(s => s.id === memberId);
    if (!staffMember || isDeactivatingStaff) return;
    
    const newStatus = staffMember.status === 'active' ? 'inactive' : 'active';
    
    setIsDeactivatingStaff(true);
    try {
      // Update on backend
      await api.updateStaff(memberId, { status: newStatus });
      
      // Reload data from backend
      await loadData();
      
      toast.success('Staff status updated successfully');
    } catch (error: any) {
      console.error('Update status error:', error);
      toast.error(error.message || 'Failed to update status');
    } finally {
      setIsDeactivatingStaff(false);
    }
  };

  const handleDelete = (memberId: string) => {
    const staffMember = staff.find(s => s.id === memberId);
    if (!staffMember) return;

    // Show confirmation dialog
    setDeleteConfirmation({
      isOpen: true,
      staff: staffMember
    });
  };

  const confirmDeleteStaff = async () => {
    const staffMember = deleteConfirmation.staff;
    if (!staffMember || isDeletingStaff) return;

    setIsDeletingStaff(true);
    try {
      // Delete from backend
      await api.deleteStaff(staffMember.id);
      
      // Reload data from backend
      await loadData();
      
      setDeleteConfirmation({
        isOpen: false,
        staff: null
      });
      
      toast.success('Staff member deleted successfully');
    } catch (error: any) {
      console.error('Delete staff error:', error);
      toast.error(error.message || 'Failed to delete staff');
      
      setDeleteConfirmation({
        isOpen: false,
        staff: null
      });
    } finally {
      setIsDeletingStaff(false);
    }
  };

  const handleViewDetails = (member: Staff) => {
    setSelectedMember(member);
    setIsEditingProfile(false);
    setEditingProfile(null);
    setViewDetailsOpen(true);
  };

  const handleEditProfile = () => {
    if (selectedMember) {
      setEditingProfile({
        name: selectedMember.name,
        email: selectedMember.email,
      });
      setIsEditingProfile(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setEditingProfile(null);
  };

  const handleSaveProfile = async () => {
    if (!selectedMember || !editingProfile || isSavingProfile) return;

    setIsSavingProfile(true);
    try {
      // Update on backend
      await api.updateStaff(selectedMember.id, {
        name: editingProfile.name,
        email: editingProfile.email,
      });

      // Reload data from backend
      await loadData();

      setIsEditingProfile(false);
      setEditingProfile(null);
      setViewDetailsOpen(false);
      
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Update profile error:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleEditPermissions = (member: Staff) => {
    setSelectedMember(member);
    setEditingPermissions(JSON.parse(JSON.stringify(member.permissions))); // Deep copy
    setEditPermissionsOpen(true);
  };

  const handleRefreshPermissions = async () => {
    if (!user || user.role !== 'Super Admin') {
      toast.error('Only Super Admin can refresh permissions');
      return;
    }

    try {
      // Reload all data from backend
      await loadData();
      toast.success('All permissions refreshed successfully');
    } catch (error: any) {
      console.error('Refresh permissions error:', error);
      toast.error(error.message || 'Failed to refresh permissions');
    }
  };

  const updateMemberPermissions = async () => {
    if (!selectedMember || !editingPermissions || isSavingPermissions) return;

    setIsSavingPermissions(true);
    try {
      // Update on backend
      await api.updateStaff(selectedMember.id, { permissions: editingPermissions });
      
      // Reload data from backend
      await loadData();
      
      setEditPermissionsOpen(false);
      setSelectedMember(null);
      setEditingPermissions(null);
      toast.success('Permissions updated successfully');
    } catch (error: any) {
      console.error('Update permissions error:', error);
      toast.error(error.message || 'Failed to update permissions');
    } finally {
      setIsSavingPermissions(false);
    }
  };

  const updatePermission = (module: string, permission: string, value: boolean) => {
    if (editingPermissions) {
      setEditingPermissions({
        ...editingPermissions,
        [module]: {
          ...editingPermissions[module],
          [permission]: value
        }
      });
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
    ) : (
      <Badge variant="secondary" className="bg-red-100 text-red-800">Inactive</Badge>
    );
  };

  const getRoleBadge = (role: UserRole) => {
    const roleColors: Record<UserRole, string> = {
      'Super Admin': 'bg-purple-600 hover:bg-purple-600',
      'Admin': 'bg-[#6a40ec] hover:bg-[#6a40ec]',
      'Manager': 'bg-blue-500 hover:bg-blue-500', 
      'Accountant': 'bg-green-500 hover:bg-green-500',
      'Viewer': 'bg-gray-500 hover:bg-gray-500',
    };
    
    return (
      <Badge className={`${roleColors[role]} text-white`}>
        {role}
      </Badge>
    );
  };

  const getPermissionsSummary = (member: Staff) => {
    const permissions = [];
    if (member.permissions.dashboard.view) permissions.push('Dashboard');
    if (member.permissions.deposits.view) permissions.push('Deposits');
    if (member.permissions.bankDeposits.view) permissions.push('Banks');
    if (member.permissions.staffManagement.view) permissions.push('Staff');
    return permissions;
  };



  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-24 bg-gray-200 rounded-lg animate-shimmer relative overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-gray-200 via-white to-gray-200"></div>
        </div>
        <TableSkeleton rows={8} columns={5} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">Manage your team members and their role-based permissions.</p>
        </div>
        <div className="flex gap-2">
          {canAddStaff() && (
            <AddRoleSheet onRoleAdded={loadRoles} />
          )}
          {canAddStaff() ? (
            <AddStaffSheet />
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    disabled
                    className="bg-gray-300 cursor-not-allowed"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Staff Member
                  </Button>
                </TooltipTrigger>
                <TooltipContent>You don't have permission to add staff members</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filters</CardTitle>
          <CardDescription>Filter staff members by search term, status, and role</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search staff members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent className="max-h-[280px]">
                  <SelectItem value="all">All Roles</SelectItem>
                  {allAvailableRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  className="flex items-center space-x-1"
                >
                  <X className="h-4 w-4" />
                  <span>Clear Filters</span>
                </Button>
              )}
              <span className="text-sm text-gray-500">
                {filteredStaff.length} of {staff.length} staff
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Staff Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members ({filteredStaff.length})</CardTitle>
          <CardDescription>
            Manage your team members and their role-based access permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Module Access</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedStaff.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback className="bg-[#6a40ec] text-white">
                            {member.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-gray-500">{member.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getRoleBadge(member.role)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {getPermissionsSummary(member).slice(0, 3).map((permission) => (
                          <Badge key={permission} variant="outline" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                        {getPermissionsSummary(member).length > 3 && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="outline" className="text-xs cursor-help">
                                  +{getPermissionsSummary(member).length - 3}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="text-sm">
                                  <p className="font-medium mb-1">Additional permissions:</p>
                                  {getPermissionsSummary(member).slice(3).map((permission) => (
                                    <p key={permission}>• {permission}</p>
                                  ))}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(member.status)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {member.lastLogin ? new Date(member.lastLogin).toLocaleDateString() : 'Never'}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            className="cursor-pointer"
                            onClick={() => handleViewDetails(member)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {canEditStaff(member) && (
                            <DropdownMenuItem 
                              className="cursor-pointer"
                              onClick={() => handleEditPermissions(member)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Permissions
                            </DropdownMenuItem>
                          )}
                          {canEditStaff(member) && (
                            <DropdownMenuItem 
                              className="cursor-pointer"
                              onClick={() => handleStatusToggle(member.id)}
                            >
                              <UserX className="mr-2 h-4 w-4" />
                              {member.status === 'active' ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                          )}
                          {canDeleteStaff(member) && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem 
                                  className="cursor-pointer text-red-600"
                                  onSelect={(e) => e.preventDefault()}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Staff Member?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will delete {member.name} and remove them from the system. You can restore them later if needed.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDelete(member.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {paginatedStaff.length === 0 && filteredStaff.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No staff members found matching your criteria.</p>
              </div>
            )}
          </div>
          
          {filteredStaff.length > 0 && (
            <TablePagination
              totalItems={filteredStaff.length}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPageState}
              onItemsPerPageChange={(newItemsPerPage) => {
                setItemsPerPage(newItemsPerPage);
                setCurrentPageState(1);
              }}
            />
          )}
        </CardContent>
      </Card>



      {/* View/Edit Details Sheet */}
      <Sheet open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <SheetContent side="right" className="sm:max-w-[750px] overflow-y-auto p-0">
          <div className="sticky top-0 z-10 bg-white border-b px-6 py-4">
            <SheetTitle className="text-xl">
              {isEditingProfile ? 'Edit Profile' : 'Staff Member Details'}
            </SheetTitle>
            <SheetDescription className="mt-1">
              {isEditingProfile 
                ? `Update ${selectedMember?.name}'s profile information`
                : `Detailed information about ${selectedMember?.name}`
              }
            </SheetDescription>
          </div>
          
          {selectedMember && (
            <div className="px-6 py-6 space-y-5">
              {!isEditingProfile ? (
                <>
                  {/* View Mode */}
                  {/* Profile Section */}
                  <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
                    <div className="flex items-center gap-3 px-5 py-3.5 bg-gradient-to-r from-[#6a40ec]/5 to-transparent border-b">
                      <div className="w-9 h-9 rounded-lg bg-[#6a40ec] flex items-center justify-center flex-shrink-0">
                        <User className="w-4.5 h-4.5 text-white" />
                      </div>
                      <span className="font-semibold">Profile Information</span>
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-start gap-5 mb-6">
                        <Avatar className="w-20 h-20 border-2 border-gray-100">
                          <AvatarImage src={selectedMember.avatar} alt={selectedMember.name} />
                          <AvatarFallback className="bg-[#6a40ec] text-white text-xl">
                            {selectedMember.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{selectedMember.name}</h3>
                          <p className="text-sm text-gray-600 mb-3">{selectedMember.email}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            {getRoleBadge(selectedMember.role)}
                            {getStatusBadge(selectedMember.status)}
                          </div>
                        </div>
                      </div>

                      {canEditStaff(selectedMember) && (
                        <Button
                          onClick={handleEditProfile}
                          variant="outline"
                          className="w-full h-10 border-[#6a40ec] text-[#6a40ec] hover:bg-[#6a40ec] hover:text-white transition-colors"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Profile
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Account Information */}
                  <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
                    <div className="flex items-center gap-3 px-5 py-3.5 bg-gradient-to-r from-[#6a40ec]/5 to-transparent border-b">
                      <div className="w-9 h-9 rounded-lg bg-[#6a40ec] flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-4.5 h-4.5 text-white" />
                      </div>
                      <span className="font-semibold">Account Information</span>
                    </div>
                    
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <span className="text-sm text-gray-600 font-medium">Created Date</span>
                        <span className="text-sm text-gray-900 font-semibold">
                          {new Date(selectedMember.createdAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <span className="text-sm text-gray-600 font-medium">Last Login</span>
                        <span className="text-sm text-gray-900 font-semibold">
                          {selectedMember.lastLogin 
                            ? new Date(selectedMember.lastLogin).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })
                            : 'Never'
                          }
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-gray-600 font-medium">Account Status</span>
                        <span className="text-sm text-gray-900 font-semibold capitalize">
                          {selectedMember.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Module Permissions */}
                  <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
                    <div className="flex items-center gap-3 px-5 py-3.5 bg-gradient-to-r from-[#6a40ec]/5 to-transparent border-b">
                      <div className="w-9 h-9 rounded-lg bg-[#6a40ec] flex items-center justify-center flex-shrink-0">
                        <Shield className="w-4.5 h-4.5 text-white" />
                      </div>
                      <span className="font-semibold">Module Permissions</span>
                    </div>
                    
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <span className="text-sm text-gray-600 font-medium">Dashboard</span>
                        <Badge className={selectedMember.permissions.dashboard.view 
                          ? 'bg-green-100 text-green-700 hover:bg-green-100' 
                          : 'bg-red-100 text-red-700 hover:bg-red-100'
                        }>
                          {selectedMember.permissions.dashboard.view ? 'View Access' : 'No Access'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <span className="text-sm text-gray-600 font-medium">Deposits</span>
                        <Badge className={selectedMember.permissions.deposits.view 
                          ? 'bg-green-100 text-green-700 hover:bg-green-100' 
                          : 'bg-red-100 text-red-700 hover:bg-red-100'
                        }>
                          {selectedMember.permissions.deposits.view 
                            ? (selectedMember.permissions.deposits.add ? 'Full Access' : 'View Only')
                            : 'No Access'
                          }
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <span className="text-sm text-gray-600 font-medium">Bank Deposits</span>
                        <Badge className={selectedMember.permissions.bankDeposits.view 
                          ? 'bg-green-100 text-green-700 hover:bg-green-100' 
                          : 'bg-red-100 text-red-700 hover:bg-red-100'
                        }>
                          {selectedMember.permissions.bankDeposits.view 
                            ? (selectedMember.permissions.bankDeposits.add ? 'Full Access' : 'View Only')
                            : 'No Access'
                          }
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-gray-600 font-medium">Staff Management</span>
                        <Badge className={selectedMember.permissions.staffManagement.view 
                          ? 'bg-green-100 text-green-700 hover:bg-green-100' 
                          : 'bg-red-100 text-red-700 hover:bg-red-100'
                        }>
                          {selectedMember.permissions.staffManagement.view 
                            ? (selectedMember.permissions.staffManagement.add ? 'Full Access' : 'View Only')
                            : 'No Access'
                          }
                        </Badge>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Edit Mode */}
                  <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
                    <div className="flex items-center gap-3 px-5 py-3.5 bg-gradient-to-r from-[#6a40ec]/5 to-transparent border-b">
                      <div className="w-9 h-9 rounded-lg bg-[#6a40ec] flex items-center justify-center flex-shrink-0">
                        <User className="w-4.5 h-4.5 text-white" />
                      </div>
                      <span className="font-semibold">Edit Profile</span>
                    </div>
                    
                    <div className="p-6 space-y-5">
                      <div>
                        <Label htmlFor="edit-name" className="text-sm font-semibold mb-2 block text-gray-700">
                          Full Name
                        </Label>
                        <Input
                          id="edit-name"
                          value={editingProfile?.name || ''}
                          onChange={(e) => setEditingProfile(prev => prev ? { ...prev, name: e.target.value } : null)}
                          placeholder="Enter full name"
                          className="h-10"
                        />
                      </div>

                      <div>
                        <Label htmlFor="edit-email" className="text-sm font-semibold mb-2 block text-gray-700">
                          Email Address
                        </Label>
                        <Input
                          id="edit-email"
                          type="email"
                          value={editingProfile?.email || ''}
                          onChange={(e) => setEditingProfile(prev => prev ? { ...prev, email: e.target.value } : null)}
                          placeholder="Enter email address"
                          className="h-10"
                        />
                      </div>

                      <div className="pt-3 flex gap-3">
                        <Button
                          onClick={handleSaveProfile}
                          className="flex-1 h-10 bg-[#6a40ec] hover:bg-[#5a30dc]"
                          disabled={!editingProfile?.name || !editingProfile?.email || isSavingProfile}
                        >
                          {isSavingProfile ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Save Changes
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={handleCancelEdit}
                          variant="outline"
                          className="flex-1 h-10"
                          disabled={isSavingProfile}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Edit Permissions Sheet */}
      <Sheet open={editPermissionsOpen} onOpenChange={setEditPermissionsOpen}>
        <SheetContent side="right" className="sm:max-w-[750px] overflow-y-auto">
          <SheetHeader className="pb-4 border-b">
            <SheetTitle>Edit Permissions</SheetTitle>
            <SheetDescription>
              Modify {selectedMember?.name}'s access permissions
            </SheetDescription>
          </SheetHeader>
          {selectedMember && editingPermissions && (
            <div className="py-4">
              <div className="space-y-4">
                {/* Permissions Section */}
                <div className="bg-white border rounded-lg overflow-hidden">
                  <div className="flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-r from-[#6a40ec]/5 to-transparent border-b">
                    <div className="w-8 h-8 rounded-lg bg-[#6a40ec] flex items-center justify-center flex-shrink-0">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-semibold text-sm">Module Permissions</span>
                  </div>
                  
                  <div className="p-4">
                    <div className="text-xs text-gray-600 mb-3">
                      Adjust the permissions for each module and action type.
                    </div>
                    <div className="space-y-3">
                      {['dashboard', 'deposits', 'bankDeposits', 'staffManagement'].map((module) => {
                        const permissions = editingPermissions[module as keyof typeof editingPermissions];
                        if (!permissions) return null;
                        
                        return (
                          <div key={module} className="p-3 border rounded-lg bg-gray-50">
                            <div className="mb-2">
                              <span className="text-sm font-medium capitalize">
                                {module.replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                              {['view', 'add', 'edit', 'delete'].map((permission) => {
                                const value = permissions[permission as keyof typeof permissions];
                                if (permission === 'activity' || value === undefined) return null;
                                
                                return (
                                  <div key={permission} className="flex items-center justify-between p-1.5 bg-white rounded border">
                                    <span className="text-xs font-medium capitalize">
                                      {permission}
                                    </span>
                                    <Switch
                                      checked={value}
                                      onCheckedChange={(checked) => updatePermission(module, permission, checked)}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center justify-end pt-5 mt-5 border-t">
                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setEditPermissionsOpen(false)}
                    className="h-10 px-6"
                    disabled={isSavingPermissions}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="bg-[#6a40ec] hover:bg-[#5a2fd9] h-10 px-6"
                    onClick={updateMemberPermissions}
                    disabled={isSavingPermissions}
                  >
                    {isSavingPermissions ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={deleteConfirmation.isOpen} 
        onOpenChange={(isOpen) => 
          setDeleteConfirmation({
            isOpen,
            staff: null
          })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <UserX className="w-5 h-5 text-red-600" />
              Archive Staff Member
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive "{deleteConfirmation.staff?.name}"? This will remove them from active staff but preserve their data. This action can be undone later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingStaff}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteStaff}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              disabled={isDeletingStaff}
            >
              {isDeletingStaff ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Archiving...
                </>
              ) : (
                'Archive'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}