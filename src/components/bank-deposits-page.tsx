import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Plus, Building2, Trash2, Search, Filter, Calendar, X } from 'lucide-react';
import { useAdmin, type Bank, type BankTransaction } from './admin-context-new';
import { toast } from 'sonner@2.0.3';
import { TablePagination } from './table-pagination';
import { formatCurrency } from '../utils/currency';

export function BankDepositsPage() {
  const { 
    banks, 
    setBanks, 
    bankTransactions, 
    setBankTransactions, 
    getFilteredBankTransactions, 
    canViewAllEntries,
    user,
    staff
  } = useAdmin();
  
  // Get current user permissions
  const getCurrentUserPermissions = () => {
    if (!user) return null;
    const currentStaff = staff.find(s => s.id === user.id);
    return currentStaff?.permissions.bankDeposits || null;
  };
  
  const canAdd = getCurrentUserPermissions()?.add || false;
  const canEdit = getCurrentUserPermissions()?.edit || false;
  const canDelete = getCurrentUserPermissions()?.delete || false;
  const [isBankDialogOpen, setIsBankDialogOpen] = useState(false);
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [newBankName, setNewBankName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [bankFilter, setBankFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [transactionForm, setTransactionForm] = useState({
    date: new Date().toISOString().split('T')[0],
    bankId: 'none',
    deposit: '',
    withdraw: '',
  });

  // Searchable dropdown state
  const [bankSearchTerm, setBankSearchTerm] = useState('');
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleAddBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBankName.trim()) return;

    const newBank: Bank = {
      id: Date.now().toString(),
      name: newBankName.trim(),
    };

    setBanks([...banks, newBank]);
    setNewBankName('');
    setIsBankDialogOpen(false);
    toast.success('Bank added successfully');
  };

  const handleDeleteBank = (bankId: string) => {
    setBanks(banks.filter(b => b.id !== bankId));
    setBankTransactions(bankTransactions.filter(t => t.bankId !== bankId));
    toast.success('Bank and its transactions deleted successfully');
  };

  const calculateRemaining = (bankId: string, date: string, currentDeposit: number, currentWithdraw: number): number => {
    // Get all previous transactions for this bank up to this date
    const previousTransactions = bankTransactions
      .filter(t => t.bankId === bankId && t.date <= date)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let remaining = 0;
    for (const transaction of previousTransactions) {
      remaining = remaining + transaction.deposit - transaction.withdraw;
    }

    // Add current transaction
    remaining = remaining + currentDeposit - currentWithdraw;
    
    return remaining;
  };

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionForm.bankId || transactionForm.bankId === 'none') {
      toast.error('Please select a bank');
      return;
    }

    const deposit = parseFloat(transactionForm.deposit) || 0;
    const withdraw = parseFloat(transactionForm.withdraw) || 0;
    const remaining = calculateRemaining(transactionForm.bankId, transactionForm.date, deposit, withdraw);

    const newTransaction: BankTransaction = {
      id: Date.now().toString(),
      date: transactionForm.date,
      bankId: transactionForm.bankId,
      deposit,
      withdraw,
      remaining,
      submittedBy: user?.id || '',
      submittedByName: user?.name || '',
    };

    setBankTransactions([...bankTransactions, newTransaction]);
    setTransactionForm({
      date: new Date().toISOString().split('T')[0],
      bankId: 'none',
      deposit: '',
      withdraw: '',
    });
    setIsTransactionDialogOpen(false);
    toast.success('Transaction added successfully');
  };

  // Filter transactions based on search and filters with role-based access control
  const filteredTransactions = useMemo(() => {
    const userTransactions = getFilteredBankTransactions(); // Get transactions based on user role
    return userTransactions.filter((transaction) => {
      const bank = banks.find(b => b.id === transaction.bankId);
      const matchesSearch = 
        bank?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.date.includes(searchTerm) ||
        transaction.deposit.toString().includes(searchTerm) ||
        transaction.withdraw.toString().includes(searchTerm) ||
        transaction.submittedByName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDate = dateFilter === 'all' || transaction.date === dateFilter;
      const matchesBank = bankFilter === 'all' || transaction.bankId === bankFilter;
      
      return matchesSearch && matchesDate && matchesBank;
    });
  }, [getFilteredBankTransactions, banks, searchTerm, dateFilter, bankFilter]);

  // Group filtered transactions by date
  const groupedTransactions = useMemo(() => {
    return filteredTransactions.reduce((acc, transaction) => {
      if (!acc[transaction.date]) {
        acc[transaction.date] = {};
      }
      if (!acc[transaction.date][transaction.bankId]) {
        acc[transaction.date][transaction.bankId] = [];
      }
      acc[transaction.date][transaction.bankId].push(transaction);
      return acc;
    }, {} as Record<string, Record<string, BankTransaction[]>>);
  }, [filteredTransactions]);

  const sortedDates = useMemo(() => {
    return Object.keys(groupedTransactions).sort((a, b) => 
      new Date(b).getTime() - new Date(a).getTime()
    );
  }, [groupedTransactions]);

  const paginatedDates = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedDates.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedDates, currentPage, itemsPerPage]);

  const hasActiveFilters = searchTerm !== '' || dateFilter !== 'all' || bankFilter !== 'all';

  const clearAllFilters = () => {
    setSearchTerm('');
    setDateFilter('all');
    setBankFilter('all');
    setCurrentPage(1);
  };

  // Filtered banks for searchable dropdown
  const filteredBanks = useMemo(() => {
    if (!bankSearchTerm.trim()) return banks;
    return banks.filter(bank =>
      bank.name.toLowerCase().includes(bankSearchTerm.toLowerCase().trim())
    );
  }, [banks, bankSearchTerm]);

  // Handle bank selection from dropdown
  const handleBankSelect = (bank: Bank) => {
    setTransactionForm({ ...transactionForm, bankId: bank.id });
    setBankSearchTerm(bank.name);
    setShowBankDropdown(false);
  };

  // Handle adding new bank from dropdown
  const handleAddNewBank = (bankName: string) => {
    const trimmedName = bankName.trim();
    
    // Check for duplicate names (case-insensitive)
    const existingBank = banks.find(bank => 
      bank.name.toLowerCase() === trimmedName.toLowerCase()
    );
    
    if (existingBank) {
      toast.error('A bank with this name already exists');
      return;
    }

    if (!trimmedName) {
      toast.error('Bank name cannot be empty');
      return;
    }

    const newBank: Bank = {
      id: Date.now().toString(),
      name: trimmedName,
    };

    setBanks([...banks, newBank]);
    setTransactionForm({ ...transactionForm, bankId: newBank.id });
    setBankSearchTerm(trimmedName);
    setShowBankDropdown(false);
    toast.success(`Bank "${trimmedName}" added successfully`);
  };

  // Click outside handler to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowBankDropdown(false);
      }
    };

    if (showBankDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showBankDropdown]);

  // Reset bank search when dialog opens/closes
  useEffect(() => {
    if (!isTransactionDialogOpen) {
      setBankSearchTerm('');
      setShowBankDropdown(false);
    }
  }, [isTransactionDialogOpen]);

  // Update search term when bank is selected from form reset
  useEffect(() => {
    if (transactionForm.bankId === 'none') {
      setBankSearchTerm('');
    } else {
      const selectedBank = banks.find(bank => bank.id === transactionForm.bankId);
      if (selectedBank) {
        setBankSearchTerm(selectedBank.name);
      }
    }
  }, [transactionForm.bankId, banks]);

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
          <h1 className="text-3xl font-bold text-gray-900">Bank Deposits Management</h1>
          <p className="text-gray-600 mt-1">Track deposits and withdrawals across multiple banks</p>
        </div>
        <div className="flex space-x-3">
          {/* Add Bank Dialog - Only visible if user has add permission */}
          {canAdd && (
            <Dialog open={isBankDialogOpen} onOpenChange={setIsBankDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Building2 className="w-4 h-4 mr-2" />
                  Add Bank
                </Button>
              </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Bank</DialogTitle>
                <DialogDescription>
                  Enter the bank name to add it to the system.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddBank} className="space-y-4">
                <div>
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    placeholder="Enter bank name"
                    value={newBankName}
                    onChange={(e) => setNewBankName(e.target.value)}
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsBankDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-[#6a40ec] hover:bg-[#5a2fd9]">
                    Add Bank
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          )}

          {/* Add Transaction Dialog */}
          {canAdd ? (
            <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#6a40ec] hover:bg-[#5a2fd9]">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Transaction
                </Button>
              </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Bank Transaction</DialogTitle>
                <DialogDescription>
                  Add a new deposit or withdrawal transaction for a bank.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddTransaction} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="transactionDate">Date</Label>
                    <Input
                      id="transactionDate"
                      type="date"
                      value={transactionForm.date}
                      onChange={(e) => setTransactionForm({ ...transactionForm, date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="bank">Bank <span className="text-red-500">*</span></Label>
                    <div className="relative" ref={dropdownRef}>
                      <Input
                        id="bank"
                        placeholder="Search or add bank..."
                        value={bankSearchTerm}
                        onChange={(e) => setBankSearchTerm(e.target.value)}
                        onFocus={() => setShowBankDropdown(true)}
                        className="pr-10"
                        autoComplete="off"
                      />
                      <Building2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      
                      {showBankDropdown && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-[280px] overflow-auto">
                          {filteredBanks.length > 0 ? (
                            <>
                              {filteredBanks.map((bank) => (
                                <button
                                  key={bank.id}
                                  type="button"
                                  onClick={() => handleBankSelect(bank)}
                                  className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none flex items-center gap-2"
                                >
                                  <Building2 className="w-4 h-4 text-gray-400" />
                                  <span>{bank.name}</span>
                                  {transactionForm.bankId === bank.id && (
                                    <span className="ml-auto text-[#6a40ec] text-sm">✓</span>
                                  )}
                                </button>
                              ))}
                              {bankSearchTerm.trim() && !filteredBanks.some(bank => 
                                bank.name.toLowerCase() === bankSearchTerm.toLowerCase().trim()
                              ) && (
                                <div className="border-t border-gray-100">
                                  <button
                                    type="button"
                                    onClick={() => handleAddNewBank(bankSearchTerm.trim())}
                                    className="w-full px-3 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none flex items-center gap-2 text-[#6a40ec]"
                                  >
                                    <Plus className="w-4 h-4" />
                                    <span>Add "{bankSearchTerm.trim()}"</span>
                                  </button>
                                </div>
                              )}
                            </>
                          ) : bankSearchTerm.trim() ? (
                            <button
                              type="button"
                              onClick={() => handleAddNewBank(bankSearchTerm.trim())}
                              className="w-full px-3 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none flex items-center gap-2 text-[#6a40ec]"
                            >
                              <Plus className="w-4 h-4" />
                              <span>Add "{bankSearchTerm.trim()}"</span>
                            </button>
                          ) : (
                            <div className="px-3 py-2 text-gray-500 text-sm">
                              Start typing to search banks...
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="deposit">Deposit Amount ($)</Label>
                    <Input
                      id="deposit"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={transactionForm.deposit}
                      onChange={(e) => setTransactionForm({ ...transactionForm, deposit: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="withdraw">Withdraw Amount ($)</Label>
                    <Input
                      id="withdraw"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={transactionForm.withdraw}
                      onChange={(e) => setTransactionForm({ ...transactionForm, withdraw: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsTransactionDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-[#6a40ec] hover:bg-[#5a2fd9]">
                    Add Transaction
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          )}
        </div>
      </div>

      {/* Banks Overview */}
      <Card className="hidden">
        <CardHeader>
          <CardTitle>Registered Banks</CardTitle>
          <CardDescription>Manage banks in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {banks.map((bank) => {
              const bankTransactionsSum = bankTransactions
                .filter(t => t.bankId === bank.id)
                .reduce((sum, t) => sum + t.deposit - t.withdraw, 0);

              return (
                <div key={bank.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{bank.name}</h3>
                      <p className="text-sm text-gray-500">
                        Balance: <span className="font-medium">{formatCurrency(bankTransactionsSum)}</span>
                      </p>
                    </div>
                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBank(bank.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
            {banks.length === 0 && (
              <div className="col-span-3 text-center py-8 text-gray-500">
                No banks added yet. Click "Add Bank" to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filters</CardTitle>
          <CardDescription>Filter bank transactions by search term, date, and bank</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by bank name, date, or amount..."
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
                  {Array.from(new Set(bankTransactions.map(t => t.date))).sort().reverse().map((date) => (
                    <SelectItem key={date} value={date}>
                      {new Date(date).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={bankFilter} onValueChange={setBankFilter}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by bank" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Banks</SelectItem>
                  {banks.map((bank) => (
                    <SelectItem key={bank.id} value={bank.id}>{bank.name}</SelectItem>
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
                {filteredTransactions.length} of {bankTransactions.length} transactions
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Bank Transactions</CardTitle>
          <CardDescription>Dynamic table showing deposits and withdrawals for each bank, grouped by date</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Date</TableHead>
                  {banks.map((bank) => (
                    <TableHead key={`${bank.id}-header`} className="text-center" colSpan={3}>
                      {bank.name}
                    </TableHead>
                  ))}
                </TableRow>
                <TableRow>
                  <TableHead></TableHead>
                  {banks.map((bank) => (
                    <React.Fragment key={`${bank.id}-headers`}>
                      <TableHead className="text-center">Deposit</TableHead>
                      <TableHead className="text-center">Withdraw</TableHead>
                      <TableHead className="text-center">Remaining</TableHead>
                    </React.Fragment>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedDates.map((date, dateIndex) => (
                  <TableRow key={date} className={`${dateColors[dateIndex % dateColors.length]} border-l-4`}>
                    <TableCell className="font-medium">
                      {new Date(date).toLocaleDateString()}
                    </TableCell>
                    {banks.map((bank) => {
                      const bankTransactionsForDate = groupedTransactions[date]?.[bank.id] || [];
                      const totalDeposit = bankTransactionsForDate.reduce((sum, t) => sum + t.deposit, 0);
                      const totalWithdraw = bankTransactionsForDate.reduce((sum, t) => sum + t.withdraw, 0);
                      const remaining = bankTransactionsForDate.length > 0 
                        ? bankTransactionsForDate[bankTransactionsForDate.length - 1].remaining 
                        : 0;

                      return (
                        <React.Fragment key={`${bank.id}-${date}-cells`}>
                          <TableCell className="text-center">
                            {totalDeposit > 0 ? formatCurrency(totalDeposit) : '-'}
                          </TableCell>
                          <TableCell className="text-center">
                            {totalWithdraw > 0 ? formatCurrency(totalWithdraw) : '-'}
                          </TableCell>
                          <TableCell className="text-center font-medium">
                            {bankTransactionsForDate.length > 0 ? formatCurrency(remaining) : '-'}
                          </TableCell>
                        </React.Fragment>
                      );
                    })}
                  </TableRow>
                ))}
                {paginatedDates.length === 0 && sortedDates.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={1 + banks.length * 3} className="text-center py-8 text-gray-500">
                      No transactions recorded yet. Add some transactions to see them here.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {sortedDates.length > 0 && (
            <TablePagination
              totalItems={sortedDates.length}
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