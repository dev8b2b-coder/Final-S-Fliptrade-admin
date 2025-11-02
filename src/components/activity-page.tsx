import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { TableSkeleton } from './shimmer-skeleton';
import { 
  Activity, 
  Search, 
  Filter, 
  Clock, 
  User, 
  MapPin,
  LogIn,
  LogOut,
  UserPlus,
  Edit,
  Trash2,
  Building2,
  DollarSign,
  FileText,
  TrendingUp
} from 'lucide-react';
import { useAdmin, type ActivityLog, type ActivityType } from './admin-context-new';
import { TablePagination } from './table-pagination';
import { format } from 'date-fns';

const getActivityIcon = (type: ActivityType) => {
  switch (type) {
    case 'login':
      return <LogIn className="w-4 h-4" />;
    case 'logout':
      return <LogOut className="w-4 h-4" />;
    case 'signup':
      return <UserPlus className="w-4 h-4" />;
    case 'add_staff':
      return <UserPlus className="w-4 h-4" />;
    case 'edit_staff':
      return <Edit className="w-4 h-4" />;
    case 'delete_staff':
      return <Trash2 className="w-4 h-4" />;
    case 'add_bank':
      return <Building2 className="w-4 h-4" />;
    case 'edit_bank':
      return <Edit className="w-4 h-4" />;
    case 'delete_bank':
      return <Trash2 className="w-4 h-4" />;
    case 'add_deposit':
      return <DollarSign className="w-4 h-4" />;
    case 'edit_deposit':
      return <Edit className="w-4 h-4" />;
    case 'delete_deposit':
      return <Trash2 className="w-4 h-4" />;
    case 'add_bank_deposit':
      return <Building2 className="w-4 h-4" />;
    case 'edit_bank_deposit':
      return <Edit className="w-4 h-4" />;
    case 'delete_bank_deposit':
      return <Trash2 className="w-4 h-4" />;
    case 'add_bank_transaction':
      return <TrendingUp className="w-4 h-4" />;
    case 'edit_bank_transaction':
      return <Edit className="w-4 h-4" />;
    case 'delete_bank_transaction':
      return <Trash2 className="w-4 h-4" />;
    default:
      return <Activity className="w-4 h-4" />;
  }
};

const getActivityColor = (type: ActivityType | string) => {
  if (!type) return 'bg-gray-100 text-gray-700 border-gray-200';
  if (type.includes('add')) return 'bg-green-100 text-green-700 border-green-200';
  if (type.includes('edit')) return 'bg-blue-100 text-blue-700 border-blue-200';
  if (type.includes('delete')) return 'bg-red-100 text-red-700 border-red-200';
  if (type === 'login') return 'bg-purple-100 text-purple-700 border-purple-200';
  if (type === 'logout') return 'bg-gray-100 text-gray-700 border-gray-200';
  return 'bg-gray-100 text-gray-700 border-gray-200';
};

const getActivityLabel = (type: ActivityType) => {
  const labels: Record<ActivityType, string> = {
    login: 'Login',
    logout: 'Logout',
    signup: 'Sign Up',
    add_staff: 'Add Staff',
    edit_staff: 'Edit Staff',
    delete_staff: 'Delete Staff',
    add_bank: 'Add Bank',
    edit_bank: 'Edit Bank',
    delete_bank: 'Delete Bank',
    add_deposit: 'Add Deposit',
    edit_deposit: 'Edit Deposit',
    delete_deposit: 'Delete Deposit',
    add_bank_deposit: 'Add Bank Deposit',
    edit_bank_deposit: 'Edit Bank Deposit',
    delete_bank_deposit: 'Delete Bank Deposit',
    add_bank_transaction: 'Add Bank Transaction',
    edit_bank_transaction: 'Edit Bank Transaction',
    delete_bank_transaction: 'Delete Bank Transaction',
  };
  return labels[type] || type;
};

export function ActivityPage() {
  const { activityLogs, isAdmin, staff, isLoading } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [activityTypeFilter, setActivityTypeFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter activities
  const filteredActivities = useMemo(() => {
    return activityLogs.filter((log) => {
      const matchesSearch = 
        log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesType = activityTypeFilter === 'all' || log.action === activityTypeFilter;
      const matchesUser = userFilter === 'all' || log.userId === userFilter;
      
      return matchesSearch && matchesType && matchesUser;
    }).sort((a, b) => {
      // Sort by timestamp descending (most recent first)
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }, [activityLogs, searchTerm, activityTypeFilter, userFilter]);

  // Pagination
  const paginatedActivities = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredActivities.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredActivities, currentPage, itemsPerPage]);

  const hasActiveFilters = searchTerm !== '' || activityTypeFilter !== 'all' || userFilter !== 'all';

  const clearAllFilters = () => {
    setSearchTerm('');
    setActivityTypeFilter('all');
    setUserFilter('all');
    setCurrentPage(1);
  };

  // Get unique activity types from logs
  const activityTypes: ActivityType[] = Array.from(new Set(activityLogs.map(log => log.action)));

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="h-24 bg-gray-200 rounded-lg animate-shimmer relative overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-gray-200 via-white to-gray-200"></div>
        </div>
        <TableSkeleton rows={10} columns={5} />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
                <Activity className="w-5 h-5 text-[#6a40ec]" />
                Activity Logs
              </CardTitle>
              <CardDescription className="text-sm">
                View all system activities, user actions, and login history
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search activities, users, descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Activity Type Filter */}
            <Select value={activityTypeFilter} onValueChange={setActivityTypeFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Activity Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activity Types</SelectItem>
                {activityTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {getActivityLabel(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* User Filter */}
            {isAdmin() && (
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {staff.filter(s => s.status === 'active').map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={clearAllFilters}
                className="text-gray-600 hover:text-gray-700"
              >
                Clear All
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Activity Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[140px]">Type</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead className="w-[180px]">User</TableHead>
                  <TableHead className="w-[140px]">IP Address</TableHead>
                  <TableHead className="w-[180px]">Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedActivities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      {hasActiveFilters ? 'No activities match your filters' : 'No activity logs found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedActivities.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md border text-xs ${getActivityColor(log.action)}`}>
                          {getActivityIcon(log.action)}
                          <span>{getActivityLabel(log.action)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm">{log.description}</div>
                          {log.details && (
                            <div className="text-xs text-gray-500 mt-1">{log.details}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{log.userName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          <span className="font-mono text-xs">{log.ipAddress || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          <div>{format(new Date(log.timestamp), 'MMM dd, yyyy')}</div>
                          <div className="text-xs text-gray-500">
                            {format(new Date(log.timestamp), 'hh:mm a')}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {filteredActivities.length > 0 && (
            <div className="mt-4">
              <TablePagination
                currentPage={currentPage}
                totalItems={filteredActivities.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(value) => {
                  setItemsPerPage(value);
                  setCurrentPage(1);
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
