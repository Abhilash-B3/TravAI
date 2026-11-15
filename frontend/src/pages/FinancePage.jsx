import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Table } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { Alert } from '../components/ui/Alert';
import { apiClient } from '../api/client';
import { DollarSign, Plus, RefreshCw, CreditCard, Receipt, CheckCircle, FileText } from 'lucide-react';

export function FinancePage() {
  const [folios, setFolios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFolio, setSelectedFolio] = useState(null);
  const [isAddChargeOpen, setIsAddChargeOpen] = useState(false);
  const [isPostPaymentOpen, setIsPostPaymentOpen] = useState(false);

  // Form states
  const [chargeDescription, setChargeDescription] = useState('Room Service Dining');
  const [chargeAmount, setChargeAmount] = useState('45.00');
  const [paymentAmount, setPaymentAmount] = useState('100.00');
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');

  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);

  const fetchFolios = async () => {
    setLoading(true);
    try {
      const data = await apiClient('/finance/folios');
      setFolios(Array.isArray(data) ? data : []);
      if (selectedFolio) {
        const refreshed = data.find((f) => f.id === selectedFolio.id);
        if (refreshed) setSelectedFolio(refreshed);
      }
    } catch (err) {
      console.error('Failed to load folios:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFolios();
  }, []);

  const handleAddCharge = async (e) => {
    e.preventDefault();
    if (!selectedFolio) return;
    setActionError(null);
    try {
      await apiClient(`/finance/folios/${selectedFolio.id}/charges`, {
        method: 'POST',
        data: {
          description: chargeDescription,
          amount: parseFloat(chargeAmount),
        },
      });
      setActionSuccess(`Posted charge of $${chargeAmount} to folio.`);
      setIsAddChargeOpen(false);
      fetchFolios();
    } catch (err) {
      setActionError(err.message || 'Failed to post charge');
    }
  };

  const handlePostPayment = async (e) => {
    e.preventDefault();
    if (!selectedFolio) return;
    setActionError(null);
    try {
      await apiClient(`/finance/folios/${selectedFolio.id}/payments`, {
        method: 'POST',
        data: {
          amount: parseFloat(paymentAmount),
          payment_method: paymentMethod,
        },
      });
      setActionSuccess(`Recorded payment of $${paymentAmount}.`);
      setIsPostPaymentOpen(false);
      fetchFolios();
    } catch (err) {
      setActionError(err.message || 'Failed to record payment');
    }
  };

  const columns = [
    {
      key: 'folio_number',
      label: 'Folio #',
      render: (val) => <span className="font-bold text-slate-100 font-mono">{val}</span>,
    },
    {
      key: 'guest_name',
      label: 'Guest / Resv Code',
      render: (val, row) => (
        <div>
          <div className="font-semibold text-slate-200">{val}</div>
          <div className="text-[11px] text-slate-500 font-mono">{row.reservation_code}</div>
        </div>
      ),
    },
    {
      key: 'total_charges',
      label: 'Total Charges',
      render: (val) => <span className="font-mono text-slate-200">${val.toFixed(2)}</span>,
    },
    {
      key: 'total_payments',
      label: 'Payments Made',
      render: (val) => <span className="font-mono text-emerald-400 font-medium">${val.toFixed(2)}</span>,
    },
    {
      key: 'balance',
      label: 'Outstanding Balance',
      render: (val) => (
        <span
          className={`font-mono font-bold ${
            val > 0 ? 'text-amber-400' : val === 0 ? 'text-emerald-400' : 'text-slate-400'
          }`}
        >
          ${val.toFixed(2)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (st) =>
        st === 'SETTLED' ? (
          <Badge variant="success" dot>Settled</Badge>
        ) : (
          <Badge variant="warning" dot>Open Active</Badge>
        ),
    },
    {
      key: 'actions',
      label: 'Ledger Detail',
      render: (_, row) => (
        <Button variant="secondary" size="xs" onClick={() => setSelectedFolio(row)}>
          View Ledger
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-indigo-400" />
            Guest Folios & Financial Ledger
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative transactional guest ledgers, line item charges, and payment reconciliations
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={fetchFolios} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
          Refresh Ledgers
        </Button>
      </div>

      {actionSuccess && (
        <Alert variant="success" icon={<CheckCircle className="w-4 h-4" />}>
          {actionSuccess}
        </Alert>
      )}
      {actionError && <Alert variant="danger">{actionError}</Alert>}

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400">Total Billed Charges</div>
          <div className="text-xl font-bold font-mono text-slate-100 mt-1">
            ${folios.reduce((sum, f) => sum + (f.total_charges || 0), 0).toFixed(2)}
          </div>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="text-xs text-emerald-400">Total Settled Receipts</div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
            ${folios.reduce((sum, f) => sum + (f.total_payments || 0), 0).toFixed(2)}
          </div>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="text-xs text-amber-400">Outstanding Accounts Receivable</div>
          <div className="text-xl font-bold font-mono text-amber-400 mt-1">
            ${folios.reduce((sum, f) => sum + (f.balance || 0), 0).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Folios Table */}
      <Card className="border-slate-800">
        <CardHeader>
          <CardTitle>Active Guest Folios</CardTitle>
          <CardDescription>Transactional itemized billing for all room and ancillary services</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Table
            columns={columns}
            data={folios}
            loading={loading}
            emptyTitle="No folios found"
            emptyDescription="Guest folios are automatically initialized upon reservation creation."
          />
        </CardContent>
      </Card>

      {/* Detailed Ledger Modal */}
      {selectedFolio && (
        <Modal
          isOpen={Boolean(selectedFolio)}
          onClose={() => setSelectedFolio(null)}
          title={`Folio Ledger: ${selectedFolio.folio_number}`}
          subtitle={`Guest: ${selectedFolio.guest_name} • Booking: ${selectedFolio.reservation_code}`}
          size="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-center p-3 bg-slate-950 border border-slate-800 rounded-lg">
              <div>
                <span className="text-slate-500 block">Current Balance</span>
                <span className="text-base font-bold font-mono text-amber-400">
                  ${selectedFolio.balance.toFixed(2)}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="xs"
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  onClick={() => setIsAddChargeOpen(true)}
                >
                  Post Charge
                </Button>
                <Button
                  variant="primary"
                  size="xs"
                  leftIcon={<CreditCard className="w-3.5 h-3.5" />}
                  onClick={() => setIsPostPaymentOpen(true)}
                >
                  Post Payment
                </Button>
              </div>
            </div>

            {/* Line Items Table */}
            <div>
              <h4 className="font-semibold text-slate-300 mb-2">Itemized Journal Transactions</h4>
              <div className="border border-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 text-[11px]">
                    <tr>
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2">Description</th>
                      <th className="px-3 py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {selectedFolio.items?.map((item) => (
                      <tr key={item.id}>
                        <td className="px-3 py-2 font-mono text-slate-400">{item.created_at.slice(0, 10)}</td>
                        <td className="px-3 py-2">{item.description}</td>
                        <td
                          className={`px-3 py-2 font-mono font-medium text-right ${
                            item.amount < 0 ? 'text-emerald-400' : 'text-slate-100'
                          }`}
                        >
                          ${item.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setSelectedFolio(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Charge Sub-Modal */}
      {isAddChargeOpen && (
        <Modal
          isOpen={isAddChargeOpen}
          onClose={() => setIsAddChargeOpen(false)}
          title="Post Line-Item Charge"
          subtitle={`Folio: ${selectedFolio?.folio_number}`}
        >
          <form onSubmit={handleAddCharge} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Charge Description</label>
              <Input
                value={chargeDescription}
                onChange={(e) => setChargeDescription(e.target.value)}
                placeholder="e.g. Minibar, Spa Massage, Laundry"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Amount ($ USD)</label>
              <Input
                type="number"
                step="0.01"
                value={chargeAmount}
                onChange={(e) => setChargeAmount(e.target.value)}
                required
              />
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setIsAddChargeOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Commit Charge to Ledger
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Post Payment Sub-Modal */}
      {isPostPaymentOpen && (
        <Modal
          isOpen={isPostPaymentOpen}
          onClose={() => setIsPostPaymentOpen(false)}
          title="Record Guest Payment"
          subtitle={`Folio: ${selectedFolio?.folio_number}`}
        >
          <form onSubmit={handlePostPayment} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="CREDIT_CARD">Credit Card (Stripe Terminal)</option>
                <option value="CASH">Cash Drawer</option>
                <option value="BANK_TRANSFER">Direct Wire / Corporate Account</option>
                <option value="POINTS">Loyalty Points Redemption</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Amount ($ USD)</label>
              <Input
                type="number"
                step="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                required
              />
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setIsPostPaymentOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="success" size="sm">
                Record Payment
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
