import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { Alert } from '../components/ui/Alert';
import { apiClient } from '../api/client';
import { LogIn, LogOut, Users, RefreshCw, CheckCircle, AlertCircle, Key, ArrowRight } from 'lucide-react';

export function FrontDeskPage() {
  const [activeTab, setActiveTab] = useState('arrivals'); // 'arrivals' | 'inhouse' | 'departures'
  const [arrivals, setArrivals] = useState([]);
  const [departures, setDepartures] = useState([]);
  const [inHouse, setInHouse] = useState([]);
  const [vacantRooms, setVacantRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  // Check-in modal state
  const [checkInTarget, setCheckInTarget] = useState(null);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  
  // Feedback
  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);

  const fetchFrontDeskData = async () => {
    setLoading(true);
    try {
      const [arr, dep, allResvs, rms] = await Promise.all([
        apiClient('/frontdesk/arrivals'),
        apiClient('/frontdesk/departures'),
        apiClient('/reservations', { params: { status: 'CHECKED_IN' } }),
        apiClient('/pms/rooms', { params: { status: 'VACANT_CLEAN' } }),
      ]);
      setArrivals(Array.isArray(arr) ? arr : []);
      setDepartures(Array.isArray(dep) ? dep : []);
      setInHouse(Array.isArray(allResvs) ? allResvs : []);
      setVacantRooms(Array.isArray(rms) ? rms : []);
    } catch (err) {
      console.error('Failed to load front desk state:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFrontDeskData();
  }, []);

  const handleOpenCheckInModal = (resv) => {
    setCheckInTarget(resv);
    setSelectedRoomId(resv.assigned_room_id || (vacantRooms[0] ? vacantRooms[0].id : ''));
    setActionError(null);
  };

  const handleExecuteCheckIn = async (e) => {
    e.preventDefault();
    if (!checkInTarget) return;
    setActionError(null);
    try {
      const res = await apiClient(`/frontdesk/check-in/${checkInTarget.id}`, {
        method: 'POST',
        data: {
          assigned_room_id: selectedRoomId,
          id_verified: true,
          key_card_issued: true,
        },
      });

      setActionSuccess(`Guest ${checkInTarget.guest_name} successfully checked into Room ${res.room_number || ''}.`);
      setCheckInTarget(null);
      fetchFrontDeskData();
    } catch (err) {
      setActionError(err.message || 'Check-in transaction failed');
    }
  };

  const handleExecuteCheckOut = async (resv) => {
    setActionError(null);
    try {
      await apiClient(`/frontdesk/check-out/${resv.id}`, {
        method: 'POST',
      });
      setActionSuccess(`Guest ${resv.guest_name} checked out. Room dispatched to housekeeping queue.`);
      fetchFrontDeskData();
    } catch (err) {
      setActionError(err.message || 'Check-out failed. Check folio balance.');
    }
  };

  const arrivalsColumns = [
    {
      key: 'confirmation_code',
      label: 'Confirmation',
      render: (val) => <span className="font-mono font-bold text-slate-100">{val}</span>,
    },
    {
      key: 'guest_name',
      label: 'Guest Name',
      render: (val, row) => (
        <div>
          <div className="font-semibold text-slate-200">{val}</div>
          <div className="text-[11px] text-slate-400">{row.guest_email}</div>
        </div>
      ),
    },
    {
      key: 'room_type_name',
      label: 'Reserved Category',
    },
    {
      key: 'assigned_room',
      label: 'Assigned Unit',
      render: (_, row) => (
        row.room_number ? (
          <Badge variant="success">Room {row.room_number}</Badge>
        ) : (
          <Badge variant="warning">Pending Assignment</Badge>
        )
      ),
    },
    {
      key: 'total_amount',
      label: 'Est. Total',
      render: (val) => <span className="font-mono text-slate-200">${val.toFixed(2)}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <Button
          variant="primary"
          size="xs"
          leftIcon={<Key className="w-3.5 h-3.5" />}
          onClick={() => handleOpenCheckInModal(row)}
        >
          Check In
        </Button>
      ),
    },
  ];

  const departuresColumns = [
    {
      key: 'confirmation_code',
      label: 'Confirmation',
      render: (val) => <span className="font-mono font-bold text-slate-100">{val}</span>,
    },
    {
      key: 'guest_name',
      label: 'Guest Name',
      render: (val, row) => (
        <div>
          <div className="font-semibold text-slate-200">{val}</div>
          <div className="text-[11px] text-slate-400">Departing today ({row.check_out_date})</div>
        </div>
      ),
    },
    {
      key: 'room_number',
      label: 'Occupied Unit',
      render: (val) => <span className="font-bold font-mono text-indigo-400">Room {val}</span>,
    },
    {
      key: 'total_amount',
      label: 'Folio Total',
      render: (val) => <span className="font-mono text-slate-200">${val.toFixed(2)}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <Button
          variant="danger"
          size="xs"
          leftIcon={<LogOut className="w-3.5 h-3.5" />}
          onClick={() => handleExecuteCheckOut(row)}
        >
          Complete Check-Out
        </Button>
      ),
    },
  ];

  const inHouseColumns = [
    {
      key: 'room_number',
      label: 'Room #',
      render: (val) => <span className="font-bold text-slate-100 font-mono">Room {val}</span>,
    },
    {
      key: 'guest_name',
      label: 'Guest Name',
      render: (val, row) => (
        <div>
          <div className="font-semibold text-slate-200">{val}</div>
          <div className="text-[11px] text-slate-400">{row.guest_email}</div>
        </div>
      ),
    },
    {
      key: 'stay',
      label: 'Stay Window',
      render: (_, row) => (
        <span className="text-xs font-mono text-slate-300">
          {row.check_in_date} → {row.check_out_date}
        </span>
      ),
    },
    {
      key: 'confirmation_code',
      label: 'Booking Code',
      render: (val) => <span className="font-mono text-xs text-slate-400">{val}</span>,
    },
    {
      key: 'actions',
      label: 'Depart',
      render: (_, row) => (
        <Button
          variant="secondary"
          size="xs"
          onClick={() => handleExecuteCheckOut(row)}
        >
          Check-Out
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
            Front Desk Operations
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time guest arrival intake, key issuance, room state machine locks, and folio departures
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={fetchFrontDeskData} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
          Refresh Queue
        </Button>
      </div>

      {actionSuccess && (
        <Alert variant="success" icon={<CheckCircle className="w-4 h-4" />}>
          {actionSuccess}
        </Alert>
      )}
      {actionError && <Alert variant="danger" icon={<AlertCircle className="w-4 h-4" />}>{actionError}</Alert>}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => setActiveTab('arrivals')}
          className={`p-4 rounded-xl border text-left transition-all ${
            activeTab === 'arrivals'
              ? 'border-indigo-500 bg-indigo-950/40'
              : 'border-slate-800 bg-slate-900 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
              <LogIn className="w-4 h-4 text-emerald-400" /> Expected Arrivals
            </span>
            <span className="text-xl font-bold text-slate-100 font-mono">{arrivals.length}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2">Check-in eligible today</div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('inhouse')}
          className={`p-4 rounded-xl border text-left transition-all ${
            activeTab === 'inhouse'
              ? 'border-indigo-500 bg-indigo-950/40'
              : 'border-slate-800 bg-slate-900 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
              <Users className="w-4 h-4 text-indigo-400" /> In-House Stays
            </span>
            <span className="text-xl font-bold text-slate-100 font-mono">{inHouse.length}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2">Active checked-in rooms</div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('departures')}
          className={`p-4 rounded-xl border text-left transition-all ${
            activeTab === 'departures'
              ? 'border-indigo-500 bg-indigo-950/40'
              : 'border-slate-800 bg-slate-900 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
              <LogOut className="w-4 h-4 text-rose-400" /> Pending Departures
            </span>
            <span className="text-xl font-bold text-slate-100 font-mono">{departures.length}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2">Scheduled check-outs today</div>
        </button>
      </div>

      {/* Active Tab View */}
      <Card className="border-slate-800">
        <CardHeader>
          <CardTitle>
            {activeTab === 'arrivals' && 'Today’s Arrival Manifest'}
            {activeTab === 'inhouse' && 'Active In-House Directory'}
            {activeTab === 'departures' && 'Today’s Departure Manifest'}
          </CardTitle>
          <CardDescription>
            {activeTab === 'arrivals' && 'Assign clean inventory, verify guest identity, and issue room access'}
            {activeTab === 'inhouse' && 'Currently registered guests occupying property inventory'}
            {activeTab === 'departures' && 'Review final charges, close folio balances, and notify housekeeping'}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {activeTab === 'arrivals' && (
            <Table
              columns={arrivalsColumns}
              data={arrivals}
              loading={loading}
              emptyTitle="No arrivals remaining today"
              emptyDescription="All scheduled arrivals have checked in or no bookings are scheduled."
            />
          )}

          {activeTab === 'inhouse' && (
            <Table
              columns={inHouseColumns}
              data={inHouse}
              loading={loading}
              emptyTitle="No guests currently in-house"
              emptyDescription="Check in arriving guests to populate the active in-house register."
            />
          )}

          {activeTab === 'departures' && (
            <Table
              columns={departuresColumns}
              data={departures}
              loading={loading}
              emptyTitle="No departures scheduled today"
              emptyDescription="All departures have been processed or none are due today."
            />
          )}
        </CardContent>
      </Card>

      {/* Check In Modal */}
      {checkInTarget && (
        <Modal
          isOpen={Boolean(checkInTarget)}
          onClose={() => setCheckInTarget(null)}
          title={`Check In Guest: ${checkInTarget.guest_name}`}
          subtitle={`Booking Code: ${checkInTarget.confirmation_code}`}
        >
          <form onSubmit={handleExecuteCheckIn} className="space-y-4">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Reserved Room Type:</span>
                <span className="font-semibold text-slate-200">{checkInTarget.room_type_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Stay Duration:</span>
                <span className="text-slate-200">{checkInTarget.check_in_date} to {checkInTarget.check_out_date}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Assign Clean Room Unit
              </label>
              <select
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              >
                {checkInTarget.assigned_room_id && (
                  <option value={checkInTarget.assigned_room_id}>
                    Pre-assigned: Room {checkInTarget.room_number}
                  </option>
                )}
                {vacantRooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    Room {r.room_number} (Floor {r.floor} • {r.room_type_name})
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 bg-indigo-950/30 border border-indigo-500/30 rounded-lg text-xs text-indigo-300 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold">
                <CheckCircle className="w-4 h-4 text-indigo-400" /> Verified Requirements:
              </div>
              <p className="text-[11px] text-indigo-200/80">
                Government ID checked, credit card tokenized on folio, digital room key ready.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setCheckInTarget(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" leftIcon={<Key className="w-3.5 h-3.5" />}>
                Authorize & Check In
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
