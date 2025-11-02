import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Plus, Edit, Trash2, Search, Filter, Calendar, X } from 'lucide-react';
import { useAdmin, type DepositEntry, type ClientIncentive } from './admin-context-new';
import { toast } from 'sonner@2.0.3';
import { TablePagination } from './table-pagination';
import { formatCurrency } from '../utils/currency';

const expenseTypes = ['Promotion', 'Salary', 'Miscellaneous', 'IB Commission', 'Travel Expense'] as const;

export function DepositsPage() {
  const { deposits, setDeposits, withdrawals, user, staff } = useAdmin();
  
  // Get current user permissions
  const getCurrentUserPermissions = () => {
    if (!user) return null;
    const currentStaff = staff.find(s => s.id === user.id);
    return currentStaff?.permissions.deposits || null;
  };
  
  const canAdd = getCurrentUserPermissions()?.add || false;
  const canEdit = getCurrentUserPermissions()?.edit || false;
  const canDelete = getCurrentUserPermissions()?.delete || false;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDeposit, setEditingDeposit] = useState<DepositEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [expenseTypeFilter, setExpenseTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    localDeposit: '',
    usdtDeposit: '',
    cashDeposit: '',
    clientIncentiveName: '',
    clientIncentiveAmount: '',
    companyExpense: '',
    expenseType: 'Miscellaneous' as const,
  });

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      localDeposit: '',
      usdtDeposit: '',
      cashDeposit: '',
      clientIncentiveName: '',
      clientIncentiveAmount: '',
      companyExpense: '',
      expenseType: 'Miscellaneous',
    });
    setEditingDeposit(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const depositData: DepositEntry = {
      id: editingDeposit?.id || Date.now().toString(),
      date: formData.date,
      localDeposit: parseFloat(formData.localDeposit) || 0,
      usdtDeposit: parseFloat(formData.usdtDeposit) || 0,
      cashDeposit: parseFloat(formData.cashDeposit) || 0,
      clientIncentive: {
        name: formData.clientIncentiveName,
        amount: parseFloat(formData.clientIncentiveAmount) || 0,
      },
      companyExpense: parseFloat(formData.companyExpense) || 0,
      expenseType: formData.expenseType,
    };

    if (editingDeposit) {
      setDeposits(deposits.map(d => d.id === editingDeposit.id ? depositData : d));
      toast.success('Deposit entry updated successfully');
    } else {
      setDeposits([...deposits, depositData]);
      toast.success('Deposit entry added successfully');
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (deposit: DepositEntry) => {
    setEditingDeposit(deposit);
    setFormData({
      date: deposit.date,
      localDeposit: deposit.localDeposit.toString(),
      usdtDeposit: deposit.usdtDeposit.toString(),
      cashDeposit: deposit.cashDeposit.toString(),
      clientIncentiveName: deposit.clientIncentive.name,
      clientIncentiveAmount: deposit.clientIncentive.amount.toString(),
      companyExpense: deposit.companyExpense.toString(),
      expenseType: deposit.expenseType,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeposits(deposits.filter(d => d.id !== id));
    toast.success('Deposit entry deleted successfully');
  };

  const calculateTotalDeposit = (deposit: DepositEntry) => {
    return deposit.localDeposit + deposit.usdtDeposit + deposit.cashDeposit;
  };

  const calculateTodaysBalance = (deposit: DepositEntry) => {
    const totalDeposit = calculateTotalDeposit(deposit);
    const todaysWithdrawals = withdrawals
      .filter(w => w.date === deposit.date)
      .reduce((sum, w) => sum + w.amount, 0);
    return totalDeposit - todaysWithdrawals;
  };

  // Filter deposits based on search and filters
  const filteredDeposits = useMemo(() => {
    return deposits.filter((deposit) => {
      const matchesSearch = 
        deposit.clientIncentive.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deposit.expenseType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deposit.date.includes(searchTerm);
      
      const matchesDate = dateFilter === 'all' || deposit.date === dateFilter;
      const matchesExpenseType = expenseTypeFilter === 'all' || deposit.expenseType === expenseTypeFilter;
      
      return matchesSearch && matchesDate && matchesExpenseType;
    });
  }, [deposits, searchTerm, dateFilter, expenseTypeFilter]);

  // Group filtered deposits by date for color coding
  const groupedDeposits = useMemo(() => {
    return filteredDeposits.reduce((acc, deposit) => {
      if (!acc[deposit.date]) {
        acc[deposit.date] = [];
      }
      acc[deposit.date].push(deposit);
      return acc;
    }, {} as Record<string, DepositEntry[]>);
  }, [filteredDeposits]);

  // Flatten grouped deposits for pagination
  const flattenedDeposits = useMemo(() => {
    return Object.entries(groupedDeposits).flatMap(([date, dateDeposits]) => 
      dateDeposits.map((deposit, index) => ({
        ...deposit,
        groupIndex: Object.keys(groupedDeposits).indexOf(date)
      }))
    );
  }, [groupedDeposits]);

  const paginatedDeposits = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return flattenedDeposits.slice(startIndex, startIndex + itemsPerPage);
  }, [flattenedDeposits, currentPage, itemsPerPage]);

  const hasActiveFilters = searchTerm !== '' || dateFilter !== 'all' || expenseTypeFilter !== 'all';

  const clearAllFilters = () => {
    setSearchTerm('');
    setDateFilter('all');
    setExpenseTypeFilter('all');
    setCurrentPage(1);
  };

  const dateColors = [
    'bg-blue-50 border-blue-200',
    'bg-green-50 border-green-200',
    'bg-purple-50 border-purple-200',
    'bg-orange-50 border-orange-200',
    'bg-pink-50 border-pink-200',
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Deposits Management</h1>
          <p className="text-gray-600 mt-1">Track daily deposits, client incentives, and company expenses</p>
        </div>
        {canAdd && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="bg-[#6a40ec] hover:bg-[#5a2fd9]">
                <Plus className="w-4 h-4 mr-2" />
                Add Deposit Entry
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingDeposit ? 'Edit' : 'Add'} Deposit Entry</DialogTitle>
              <DialogDescription>
                {editingDeposit ? 'Update the' : 'Enter the'} deposit details, client incentives, and company expenses.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date" className="mb-2 block">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="expenseType" className="mb-2 block">Expense Type</Label>
                  <Select value={formData.expenseType} onValueChange={(value: any) => setFormData({ ...formData, expenseType: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="localDeposit" className="mb-2 block">Local Deposit ($)</Label>
                  <Input
                    id="localDeposit"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.localDeposit}
                    onChange={(e) => setFormData({ ...formData, localDeposit: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="usdtDeposit" className="mb-2 block">USDT Deposit ($)</Label>
                  <Input
                    id="usdtDeposit"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.usdtDeposit}
                    onChange={(e) => setFormData({ ...formData, usdtDeposit: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cashDeposit" className="mb-2 block">Cash Deposit ($)</Label>
                  <Input
                    id="cashDeposit"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.cashDeposit}
                    onChange={(e) => setFormData({ ...formData, cashDeposit: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clientIncentiveName" className="mb-2 block">Client Incentive Name</Label>
                  <Input
                    id="clientIncentiveName"
                    placeholder="Client name"
                    value={formData.clientIncentiveName}
                    onChange={(e) => setFormData({ ...formData, clientIncentiveName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="clientIncentiveAmount" className="mb-2 block">Client Incentive Amount ($)</Label>
                  <Input
                    id="clientIncentiveAmount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.clientIncentiveAmount}
                    onChange={(e) => setFormData({ ...formData, clientIncentiveAmount: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="companyExpense" className="mb-2 block">Company Expense ($)</Label>
                <Input
                  id="companyExpense"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.companyExpense}
                  onChange={(e) => setFormData({ ...formData, companyExpense: e.target.value })}
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#6a40ec] hover:bg-[#5a2fd9]">
                  {editingDeposit ? 'Update' : 'Add'} Deposit
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        )}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filters</CardTitle>
          <CardDescription>Filter deposits by search term, date, and expense type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by client name, expense type, or date..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  {Array.from(new Set(deposits.map(d => d.date))).sort().reverse().map((date) => (
                    <SelectItem key={date} value={date}>
                      {new Date(date).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={expenseTypeFilter} onValueChange={setExpenseTypeFilter}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by expense type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Expense Types</SelectItem>
                  {expenseTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
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
                {filteredDeposits.length} of {deposits.length} entries
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deposits Table */}
      <Card>
        <CardHeader>
          <CardTitle>Deposit Entries</CardTitle>
          <CardDescription>All deposit entries grouped by date with color coding</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Local Deposit</TableHead>
                  <TableHead>USDT Deposit</TableHead>
                  <TableHead>Cash Deposit</TableHead>
                  <TableHead>Total Deposit</TableHead>
                  <TableHead>Client Incentive</TableHead>
                  <TableHead>Company Expense</TableHead>
                  <TableHead>Today's Balance</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedDeposits.map((deposit) => (
                  <TableRow
                    key={deposit.id}
                    className={`${dateColors[deposit.groupIndex % dateColors.length]} border-l-4`}
                  >
                      <TableCell className="font-medium">
                        {new Date(deposit.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{formatCurrency(deposit.localDeposit)}</TableCell>
                      <TableCell>{formatCurrency(deposit.usdtDeposit)}</TableCell>
                      <TableCell>{formatCurrency(deposit.cashDeposit)}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(calculateTotalDeposit(deposit))}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{deposit.clientIncentive.name}</div>
                          <div className="text-gray-500">{formatCurrency(deposit.clientIncentive.amount)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{formatCurrency(deposit.companyExpense)}</div>
                          <div className="text-gray-500">{deposit.expenseType}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(calculateTodaysBalance(deposit))}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {canEdit && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(deposit)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(deposit.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredDeposits.length > 0 && (
            <TablePagination
              totalItems={filteredDeposits.length}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(newItemsPerPage) => {
                setItemsPerPage(newItemsPerPage);
                setCurrentPage(1);
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}