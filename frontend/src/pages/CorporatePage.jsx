import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Table } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { Alert } from '../components/ui/Alert';
import { apiClient } from '../api/client';
import { Building, Plus, RefreshCw, CheckCircle, FileText, Check, X, CreditCard } from 'lucide-react';

export function CorporatePage() {
  const [accounts, setAccounts] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitExpenseOpen, setIsSubmitExpenseOpen] = useState(false);

  // Form states
  const [employeeName, setEmployeeName] = useState('Michael Chang');
  const [selectedCorpId, setSelectedCorpId] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('185.00');
  const [expenseCategory, setExpenseCategory] = useState('LODGING');
  const [expenseDesc, setExpenseDesc] = useState('Executive suite overnight for Q3 partner review');

  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);

  const fetchCorporateData = async () => {
    setLoading(true);
    try {
      const [corps, exps] = await Promise.all([
        apiClient('/corporate/accounts'),
        apiClient('/corporate/expenses'),
      ]);
      setAccounts(Array.isArray(corps) ? corps : []);
      setExpenses(Array.isArray(exps) ? exps : []);
      if (corps && corps.length && !selectedCorpId) {
        setSelectedCorpId(corps[0].id);
      }
    } catch (err) {
      console.error('Failed to load corporate data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCorporateData();
  }, []);

  const handleExpenseDecision = async (expenseId, status) => {
    setActionError(null);
    try {
      await apiClient(`/corporate/expenses/${expenseId}`, {
        method: 'PATCH',
        data: { status },
      });
      setActionSuccess(`Expense claim marked as ${status}.`);
      fetchCorporateData();
    } catch (err) {
      setActionError(err.message || 'Failed to update expense');
    }
  };

  const handleSubmitExpense = async (e) => {
    e.preventDefault();
    setActionError(null);
    try {
      await apiClient('/corporate/expenses', {
        method: 'POST',
        data: {
          corporate_id: selectedCorpId,
          employee_name: employeeName,
          amount: parseFloat(expenseAmount),
          category: expenseCategory,
          description: expenseDesc,
        },
      });
      setActionSuccess('Expense report logged for corporate approval.');
      setIsSubmitExpenseOpen(false);
      fetchCorporateData();
    } catch (err) {
      setActionError(err.message || 'Failed to submit expense');
    }
  };

  const corpColumns = [
    {
      key: 'name',
      label: 'Corporate Account',
      render: (val, row) => (
        <div>
          <div className="font-semibold text-slate-100">{val}</div>
          <div className="text-[11px] text-slate-500 font-mono">Code: {row.account_code}</div>
        </div>
      ),
    },
    {
      key: 'credit_limit',
      label: 'Credit Line',
      render: (val) => <span className="font-mono text-slate-200">${val?.toLocaleString()}</span>,
    },
    {
      key: 'negotiated_discount',
      label: 'Discount Rate',
      render: (val) => <Badge variant="success" size="xs">{(val * 100).toFixed(0)}% Off Rack</Badge>,
    },
    {
      key: 'contact_email',
      label: 'Travel Manager',
      render: (val, row) => (
        <div className="text-xs">
          <div className="text-slate-200">{row.contact_name}</div>
          <div className="text-[11px] text-slate-400 font-mono">{val}</div>
        </div>
      ),
    },
  ];

  const expenseColumns = [
    {
      key: 'employee_name',
      label: 'Employee',
      render: (val, row) => (
        <div>
          <div className="font-semibold text-slate-200">{val}</div>
          <div className="text-[11px] text-slate-500">{row.corporate_name}</div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (c) => <Badge variant="primary" size="xs">{c}</Badge>,
    },
    {
      key: 'description',
      label: 'Business Purpose',
      render: (d) => <span className="text-xs text-slate-300">{d}</span>,
    },
    {
      key: 'amount',
      label: 'Claim Amount',
      render: (val) => <span className="font-mono font-bold text-slate-100">${val.toFixed(2)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (st) =>
        st === 'APPROVED' ? (
          <Badge variant="success" dot>Approved</Badge>
        ) : st === 'REJECTED' ? (
          <Badge variant="danger" dot>Rejected</Badge>
        ) : (
          <Badge variant="warning" dot>Pending Review</Badge>
        ),
    },
    {
      key: 'actions',
      label: 'Decision',
      render: (_, row) => (
        row.status === 'PENDING' ? (
          <div className="flex items-center gap-1.5">
            <Button
              variant="success"
              size="xs"
              onClick={() => handleExpenseDecision(row.id, 'APPROVED')}
              leftIcon={<Check className="w-3 h-3" />}
            >
              Approve
            </Button>
            <Button
              variant="danger"
              size="xs"
              onClick={() => handleExpenseDecision(row.id, 'REJECTED')}
              leftIcon={<X className="w-3 h-3" />}
            >
              Reject
            </Button>
          </div>
        ) : (
          <span className="text-[11px] text-slate-500 font-mono italic">Decided</span>
        )
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Building className="w-5 h-5 text-indigo-400" />
            Corporate Accounts & Travel Expense Governance
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative B2B corporate master accounts, direct billing credit limits, and travel policy compliance
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="secondary" size="sm" onClick={fetchCorporateData} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsSubmitExpenseOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Submit Expense Claim
          </Button>
        </div>
      </div>

      {actionSuccess && (
        <Alert variant="success" icon={<CheckCircle className="w-4 h-4" />}>
          {actionSuccess}
        </Alert>
      )}
      {actionError && <Alert variant="danger">{actionError}</Alert>}

      {/* Corporate Accounts Table */}
      <Card className="border-slate-800">
        <CardHeader>
          <CardTitle>Active Corporate Master Accounts</CardTitle>
          <CardDescription>Direct corporate billing contracts with approved line-of-credit limits</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Table
            columns={corpColumns}
            data={accounts}
            loading={loading}
            emptyTitle="No corporate accounts found"
          />
        </CardContent>
      </Card>

      {/* Expense Claims Table */}
      <Card className="border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Employee Travel Expense Claims</CardTitle>
            <CardDescription>Itemized claims submitted against corporate travel accounts</CardDescription>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {expenses.length} Expense Claims
          </span>
        </CardHeader>
        <CardContent className="pt-0">
          <Table
            columns={expenseColumns}
            data={expenses}
            loading={loading}
            emptyTitle="No expense claims submitted"
          />
        </CardContent>
      </Card>

      {/* Submit Expense Modal */}
      {isSubmitExpenseOpen && (
        <Modal
          isOpen={isSubmitExpenseOpen}
          onClose={() => setIsSubmitExpenseOpen(false)}
          title="File Corporate Expense Claim"
          subtitle="Routes claim through corporate policy budget verification"
        >
          <form onSubmit={handleSubmitExpense} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Corporate Account</label>
              <select
                value={selectedCorpId}
                onChange={(e) => setSelectedCorpId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} (Code: {a.account_code})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Employee Name</label>
                <Input
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Claim Category</label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="LODGING">Hotel Room & Tax</option>
                  <option value="FLIGHT">Airfare / Flight</option>
                  <option value="MEALS">Client Dining / Meals</option>
                  <option value="TRANSPORT">Ground Transportation</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Amount ($ USD)</label>
              <Input
                type="number"
                step="0.01"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Business Purpose</label>
              <Input
                value={expenseDesc}
                onChange={(e) => setExpenseDesc(e.target.value)}
                placeholder="Specific justification and project reference..."
                required
              />
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setIsSubmitExpenseOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Submit for Approval
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
