import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const TransactionHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Mock transaction data
  const transactions = [
    {
      id: 'TXN-2025-001234',
      type: 'purchase',
      description: 'Professional Bundle - 5,000 Credits',
      amount: 49.99,
      credits: 5000,
      date: new Date('2025-01-02T14:30:00'),
      status: 'completed',
      paymentMethod: 'Visa •••• 4242'
    },
    {
      id: 'TXN-2025-001233',
      type: 'usage',
      description: 'AI Consultation - Technology Domain',
      amount: -0.15,
      credits: -25,
      date: new Date('2025-01-02T11:45:00'),
      status: 'completed',
      conversationId: 'CONV-789'
    },
    {
      id: 'TXN-2025-001232',
      type: 'usage',
      description: 'AI Consultation - Business Strategy',
      amount: -0.18,
      credits: -30,
      date: new Date('2025-01-02T09:20:00'),
      status: 'completed',
      conversationId: 'CONV-788'
    },
    {
      id: 'TXN-2025-001231',
      type: 'purchase',
      description: 'Starter Bundle - 1,000 Credits',
      amount: 12.99,
      credits: 1000,
      date: new Date('2024-12-28T16:15:00'),
      status: 'completed',
      paymentMethod: 'Visa •••• 4242'
    },
    {
      id: 'TXN-2025-001230',
      type: 'refund',
      description: 'Refund - Unused Credits',
      amount: 5.99,
      credits: 500,
      date: new Date('2024-12-25T10:30:00'),
      status: 'completed',
      paymentMethod: 'Visa •••• 4242'
    },
    {
      id: 'TXN-2025-001229',
      type: 'usage',
      description: 'AI Consultation - Healthcare',
      amount: -0.12,
      credits: -20,
      date: new Date('2024-12-24T14:45:00'),
      status: 'completed',
      conversationId: 'CONV-787'
    }
  ];

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'purchase': return 'Plus';
      case 'usage': return 'Minus';
      case 'refund': return 'RotateCcw';
      default: return 'DollarSign';
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'purchase': return 'text-success';
      case 'usage': return 'text-error';
      case 'refund': return 'text-primary';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { color: 'bg-success/10 text-success border-success/20', label: 'Completed' },
      pending: { color: 'bg-warning/10 text-warning border-warning/20', label: 'Pending' },
      failed: { color: 'bg-error/10 text-error border-error/20', label: 'Failed' }
    };
    
    const config = statusConfig?.[status] || statusConfig?.completed;
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium border ${config?.color}`}>
        {config?.label}
      </span>
    );
  };

  const filteredTransactions = transactions?.filter(transaction => {
    const matchesSearch = transaction?.description?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         transaction?.id?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    const matchesFilter = filterType === 'all' || transaction?.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredTransactions?.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions?.slice(startIndex, startIndex + itemsPerPage);

  const formatDate = (date) => {
    return date?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filterOptions = [
    { value: 'all', label: 'All Transactions' },
    { value: 'purchase', label: 'Purchases' },
    { value: 'usage', label: 'Usage' },
    { value: 'refund', label: 'Refunds' }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Transaction History</h3>
          <p className="text-sm text-muted-foreground">View all your credit purchases and usage</p>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          iconName="Download"
          iconPosition="left"
          className="mt-4 sm:mt-0"
        >
          Export CSV
        </Button>
      </div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value)}
            className="w-full"
          />
        </div>
        
        <div className="flex space-x-2">
          {filterOptions?.map((option) => (
            <Button
              key={option?.value}
              variant={filterType === option?.value ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilterType(option?.value)}
              className="whitespace-nowrap"
            >
              {option?.label}
            </Button>
          ))}
        </div>
      </div>
      {/* Transaction List */}
      <div className="space-y-3">
        {paginatedTransactions?.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="Receipt" size={48} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No transactions found</p>
          </div>
        ) : (
          paginatedTransactions?.map((transaction) => (
            <div key={transaction?.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center ${getTransactionColor(transaction?.type)}`}>
                  <Icon name={getTransactionIcon(transaction?.type)} size={20} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="font-medium text-foreground truncate">{transaction?.description}</p>
                    {getStatusBadge(transaction?.status)}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>{transaction?.id}</span>
                    <span>{formatDate(transaction?.date)}</span>
                    {transaction?.paymentMethod && (
                      <span>{transaction?.paymentMethod}</span>
                    )}
                    {transaction?.conversationId && (
                      <span>Conversation: {transaction?.conversationId}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className={`font-semibold ${getTransactionColor(transaction?.type)}`}>
                  {transaction?.type === 'usage' ? '-' : '+'}
                  {Math.abs(transaction?.credits)?.toLocaleString()} credits
                </div>
                <div className="text-xs text-muted-foreground">
                  ${Math.abs(transaction?.amount)?.toFixed(2)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredTransactions?.length)} of {filteredTransactions?.length} transactions
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              iconName="ChevronLeft"
            />
            
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              iconName="ChevronRight"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;