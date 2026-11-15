import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Table } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { Alert } from '../components/ui/Alert';
import { apiClient } from '../api/client';
import { Users, UserPlus, RefreshCw, Search, Award, CheckCircle, Mail, Phone } from 'lucide-react';

export function GuestsPage() {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState(null);

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [nationality, setNationality] = useState('US');
  const [tier, setTier] = useState('BRONZE');
  const [isVip, setIsVip] = useState(false);

  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);

  const fetchGuests = async () => {
    setLoading(true);
    try {
      const data = await apiClient('/guests', {
        params: searchQuery ? { search: searchQuery } : {},
      });
      setGuests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load guests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, [searchQuery]);

  const handleCreateGuest = async (e) => {
    e.preventDefault();
    setActionError(null);
    try {
      const res = await apiClient('/guests', {
        method: 'POST',
        data: {
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
          nationality,
          loyalty_tier: tier,
          is_vip: isVip,
        },
      });

      setActionSuccess(`Guest profile for ${firstName} ${lastName} created.`);
      setIsAddModalOpen(false);
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      fetchGuests();
    } catch (err) {
      setActionError(err.message || 'Failed to create guest profile');
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

  const columns = [
    {
      key: 'name',
      label: 'Guest Name',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-slate-300">
            {row.first_name[0]}{row.last_name[0]}
          </div>
          <div>
            <div className="font-semibold text-slate-100 flex items-center gap-1.5">
              <span>{row.first_name} {row.last_name}</span>
              {row.is_vip && <Badge variant="warning" size="xs">VIP</Badge>}
            </div>
            <div className="text-[11px] text-slate-500">{row.nationality}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Contact',
      render: (val, row) => (
        <div className="text-xs">
          <div className="text-slate-300 flex items-center gap-1">
            <Mail className="w-3 h-3 text-slate-500" /> {val}
          </div>
          <div className="text-slate-400 flex items-center gap-1 text-[11px] mt-0.5">
            <Phone className="w-3 h-3 text-slate-500" /> {row.phone}
          </div>
        </div>
      ),
    },
    {
      key: 'loyalty_tier',
      label: 'Loyalty Tier',
      render: (val, row) => (
        <div className="flex items-center gap-1.5">
          {getTierBadge(val)}
          <span className="text-[11px] text-slate-400 font-mono">({row.loyalty_points || 0} pts)</span>
        </div>
      ),
    },
    {
      key: 'total_stays',
      label: 'Stays',
      render: (val) => <span className="font-mono text-slate-200">{val || 0} stays</span>,
    },
    {
      key: 'actions',
      label: 'Profile',
      render: (_, row) => (
        <Button variant="secondary" size="xs" onClick={() => setSelectedGuest(row)}>
          View Profile
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
            <Users className="w-5 h-5 text-indigo-400" />
            Guest Profiles & CRM
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative guest identity records, contact details, VIP preferences, and loyalty linkages
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="secondary" size="sm" onClick={fetchGuests} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            leftIcon={<UserPlus className="w-3.5 h-3.5" />}
          >
            New Guest Profile
          </Button>
        </div>
      </div>

      {actionSuccess && (
        <Alert variant="success" icon={<CheckCircle className="w-4 h-4" />}>
          {actionSuccess}
        </Alert>
      )}
      {actionError && <Alert variant="danger">{actionError}</Alert>}

      {/* Guest Directory Card */}
      <Card className="border-slate-800">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3">
          <div className="relative min-w-[260px]">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
            <Input
              placeholder="Search by name, email, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-xs py-1.5"
            />
          </div>
          <div className="text-xs text-slate-400 font-mono">
            {guests.length} Registered Guest Profiles
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Table
            columns={columns}
            data={guests}
            loading={loading}
            emptyTitle="No guest profiles found"
            emptyDescription="Create guest profiles to associate with reservations and loyalty accounts."
          />
        </CardContent>
      </Card>

      {/* View Guest Profile Modal */}
      {selectedGuest && (
        <Modal
          isOpen={Boolean(selectedGuest)}
          onClose={() => setSelectedGuest(null)}
          title={`Guest Profile: ${selectedGuest.first_name} ${selectedGuest.last_name}`}
          subtitle={`Profile ID: ${selectedGuest.id}`}
        >
          <div className="space-y-4 text-xs text-slate-300">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div>
                <span className="text-slate-500 block">Email Address</span>
                <span className="text-slate-100 font-medium">{selectedGuest.email}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Phone</span>
                <span className="text-slate-100 font-medium">{selectedGuest.phone}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Nationality</span>
                <span className="text-slate-100">{selectedGuest.nationality}</span>
              </div>
              <div>
                <span className="text-slate-500 block">VIP Status</span>
                <span className="text-slate-100">{selectedGuest.is_vip ? 'VIP Member' : 'Standard'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Loyalty Tier</span>
                <div className="mt-0.5">{getTierBadge(selectedGuest.loyalty_tier)}</div>
              </div>
              <div>
                <span className="text-slate-500 block">Loyalty Balance</span>
                <span className="font-mono text-emerald-400 font-bold">{selectedGuest.loyalty_points || 0} pts</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setSelectedGuest(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Guest Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Create New Guest Profile"
          subtitle="Stores persistent guest contact info and preferences in PostgreSQL"
        >
          <form onSubmit={handleCreateGuest} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">First Name</label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Eleanor"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Last Name</label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Rigby"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="eleanor@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Phone</label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 019-2834"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nationality</label>
                <Input
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  placeholder="US"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Initial Tier</label>
                <select
                  value={tier}
                  onChange={(e) => setTier(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="BRONZE">Bronze</option>
                  <option value="SILVER">Silver</option>
                  <option value="GOLD">Gold</option>
                  <option value="PLATINUM">Platinum</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isVipCheck"
                checked={isVip}
                onChange={(e) => setIsVip(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="isVipCheck" className="text-xs text-slate-300 font-medium cursor-pointer">
                Designate as VIP Guest (Priority check-in & complimentary amenities)
              </label>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save Guest Profile
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
