import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Table } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { Alert } from '../components/ui/Alert';
import { apiClient } from '../api/client';
import { Award, Plus, RefreshCw, CheckCircle, Gift, ShieldCheck, Hash } from 'lucide-react';

export function LoyaltyPage() {
  const [members, setMembers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isAwardModalOpen, setIsAwardModalOpen] = useState(false);

  // Form states
  const [awardMemberId, setAwardMemberId] = useState('');
  const [pointsAmount, setPointsAmount] = useState('500');
  const [awardReason, setAwardReason] = useState('Direct Booking Bonus');

  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);

  const fetchLoyaltyData = async () => {
    setLoading(true);
    try {
      const [mems, txns] = await Promise.all([
        apiClient('/loyalty/members'),
        apiClient('/loyalty/transactions'),
      ]);
      setMembers(Array.isArray(mems) ? mems : []);
      setTransactions(Array.isArray(txns) ? txns : []);
      if (mems && mems.length && !awardMemberId) {
        setAwardMemberId(mems[0].id);
      }
    } catch (err) {
      console.error('Failed to load loyalty data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoyaltyData();
  }, []);

  const handleAwardPoints = async (e) => {
    e.preventDefault();
    setActionError(null);
    try {
      const res = await apiClient('/loyalty/award', {
        method: 'POST',
        data: {
          member_id: awardMemberId,
          points: parseInt(pointsAmount, 10),
          reason: awardReason,
        },
      });

      setActionSuccess(`Awarded ${pointsAmount} points. Blockchain ledger hash: ${res.tx_hash.slice(0, 12)}...`);
      setIsAwardModalOpen(false);
      fetchLoyaltyData();
    } catch (err) {
      setActionError(err.message || 'Failed to award points');
    }
  };

  const getTierBadge = (t) => {
    switch (t) {
      case 'PLATINUM':
        return <Badge variant="purple">Platinum</Badge>;
      case 'GOLD':
        return <Badge variant="warning">Gold</Badge>;
      case 'SILVER':
        return <Badge variant="info">Silver</Badge>;
      default:
        return <Badge variant="default">Bronze</Badge>;
    }
  };

  const memberColumns = [
    {
      key: 'name',
      label: 'Member Name',
      render: (_, row) => (
        <div>
          <div className="font-semibold text-slate-100">{row.first_name} {row.last_name}</div>
          <div className="text-[11px] text-slate-400">{row.email}</div>
        </div>
      ),
    },
    {
      key: 'tier',
      label: 'Tier',
      render: (t) => getTierBadge(t),
    },
    {
      key: 'points_balance',
      label: 'Points Balance',
      render: (pts) => <span className="font-mono font-bold text-emerald-400">{pts.toLocaleString()} pts</span>,
    },
    {
      key: 'lifetime_points',
      label: 'Lifetime Earned',
      render: (pts) => <span className="font-mono text-slate-400">{pts.toLocaleString()}</span>,
    },
    {
      key: 'actions',
      label: 'Action',
      render: (_, row) => (
        <Button
          variant="secondary"
          size="xs"
          onClick={() => {
            setAwardMemberId(row.id);
            setIsAwardModalOpen(true);
          }}
          leftIcon={<Gift className="w-3 h-3" />}
        >
          Award Points
        </Button>
      ),
    },
  ];

  const txnColumns = [
    {
      key: 'created_at',
      label: 'Timestamp',
      render: (ts) => <span className="font-mono text-xs text-slate-400">{new Date(ts).toLocaleString()}</span>,
    },
    {
      key: 'member_name',
      label: 'Member',
      render: (val) => <span className="font-medium text-slate-200">{val}</span>,
    },
    {
      key: 'reason',
      label: 'Transaction Reason',
      render: (r) => <span className="text-xs text-slate-300">{r}</span>,
    },
    {
      key: 'points',
      label: 'Points Shift',
      render: (pts) => (
        <span
          className={`font-mono font-bold ${
            pts > 0 ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {pts > 0 ? `+${pts}` : pts}
        </span>
      ),
    },
    {
      key: 'tx_hash',
      label: 'Audit Integrity Hash',
      render: (h) => (
        <span className="font-mono text-[11px] text-indigo-400 flex items-center gap-1">
          <Hash className="w-3 h-3" /> {h.slice(0, 16)}...
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-400" />
            Guest Loyalty Program & Points Ledger
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative member tiers, cryptographic transaction ledger, and points rewards program
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="secondary" size="sm" onClick={fetchLoyaltyData} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Refresh Ledger
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAwardModalOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Award Points
          </Button>
        </div>
      </div>

      {actionSuccess && (
        <Alert variant="success" icon={<CheckCircle className="w-4 h-4" />}>
          {actionSuccess}
        </Alert>
      )}
      {actionError && <Alert variant="danger">{actionError}</Alert>}

      {/* Tier Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between">
            <Badge variant="default">Bronze</Badge>
            <span className="text-[11px] text-slate-500 font-mono">0 - 4,999 pts</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Standard member pricing, free high-speed Wi-Fi</p>
        </div>
        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between">
            <Badge variant="info">Silver</Badge>
            <span className="text-[11px] text-slate-500 font-mono">5,000+ pts</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Priority check-in lane, 10% dining discount</p>
        </div>
        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between">
            <Badge variant="warning">Gold</Badge>
            <span className="text-[11px] text-slate-500 font-mono">15,000+ pts</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Guaranteed 2pm late check-out, room upgrades</p>
        </div>
        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between">
            <Badge variant="purple">Platinum</Badge>
            <span className="text-[11px] text-slate-500 font-mono">30,000+ pts</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Executive lounge access, complimentary breakfast & spa</p>
        </div>
      </div>

      {/* Members Directory */}
      <Card className="border-slate-800">
        <CardHeader>
          <CardTitle>Loyalty Membership Register</CardTitle>
          <CardDescription>Enrolled guests with active point balances and tier qualifications</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Table
            columns={memberColumns}
            data={members}
            loading={loading}
            emptyTitle="No loyalty members found"
          />
        </CardContent>
      </Card>

      {/* Audit Transactions Ledger */}
      <Card className="border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Cryptographic Transaction Ledger
            </CardTitle>
            <CardDescription>
              SHA-256 verifiable audit records of all awarded and redeemed points
            </CardDescription>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {transactions.length} Ledger Records
          </span>
        </CardHeader>
        <CardContent className="pt-0">
          <Table
            columns={txnColumns}
            data={transactions}
            loading={loading}
            emptyTitle="No transactions recorded"
          />
        </CardContent>
      </Card>

      {/* Award Points Modal */}
      {isAwardModalOpen && (
        <Modal
          isOpen={isAwardModalOpen}
          onClose={() => setIsAwardModalOpen(false)}
          title="Award Loyalty Points"
          subtitle="Commits point credits with cryptographic hash verification"
        >
          <form onSubmit={handleAwardPoints} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Member</label>
              <select
                value={awardMemberId}
                onChange={(e) => setAwardMemberId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.first_name} {m.last_name} ({m.tier} • {m.points_balance} pts)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Points Amount</label>
              <Input
                type="number"
                min="10"
                step="10"
                value={pointsAmount}
                onChange={(e) => setPointsAmount(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Reason / Note</label>
              <Input
                value={awardReason}
                onChange={(e) => setAwardReason(e.target.value)}
                placeholder="e.g. VIP Welcome Gift, Stay Bonus, Service Apology"
                required
              />
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setIsAwardModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Commit & Hash Transaction
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
