import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Table } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { Alert } from '../components/ui/Alert';
import { apiClient } from '../api/client';
import { CalendarDays, Plus, RefreshCw, CheckCircle, Search, User, CreditCard } from 'lucide-react';

export function ReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [guests, setGuests] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedResv, setSelectedResv] = useState(null);
  
  // Form fields
  const [selectedGuestId, setSelectedGuestId] = useState('');
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState('');
  const [checkInDate, setCheckInDate] = useState('2026-09-10');
  const [checkOutDate, setCheckOutDate] = useState('2026-09-14');
  const [adultsCount, setAdultsCount] = useState('2');
  const [assignedRoomId, setAssignedRoomId] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  
  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resvs, gstList, rts, rms] = await Promise.all([
        apiClient('/reservations', { params: statusFilter ? { status: statusFilter } : {} }),
        apiClient('/guests'),
        apiClient('/pms/room-types'),
        apiClient('/pms/rooms'),
      ]);
      setReservations(Array.isArray(resvs) ? resvs : []);
      setGuests(Array.isArray(gstList) ? gstList : []);
      setRoomTypes(Array.isArray(rts) ? rts : []);
      setRooms(Array.isArray(rms) ? rms : []);

      if (gstList && gstList.length && !selectedGuestId) {
        setSelectedGuestId(gstList[0].id);
      }
      if (rts && rts.length && !selectedRoomTypeId) {
        setSelectedRoomTypeId(rts[0].id);
      }
    } catch (err) {
      console.error('Failed to load reservations data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleCreateReservation = async (e) => {
    e.preventDefault();
    setActionError(null);
    try {
      const res = await apiClient('/reservations', {
        method: 'POST',
        data: {
          guest_id: selectedGuestId,
          room_type_id: selectedRoomTypeId,
          check_in_date: checkInDate,
          check_out_date: checkOutDate,
          adults: parseInt(adultsCount, 10),
          assigned_room_id: assignedRoomId || null,
          special_requests: specialRequests,
        },
      });

      setActionSuccess(`Reservation ${res?.confirmation_code} confirmed and added to live ledger.`);
      setIsNewModalOpen(false);
      setSpecialRequests('');
      fetchData();
    } catch (err) {
      setActionError(err.message || 'Failed to create reservation.');
    }
  };

  const handleStatusChange = async (resvId, newStatus) => {
    try {
      await apiClient(`/reservations/${resvId}`, {
        method: 'PATCH',
        data: { status: newStatus },
      });
      setActionSuccess(`Reservation status updated to ${newStatus}`);
      if (selectedResv) {
        setSelectedResv({ ...selectedResv, status: newStatus });
      }
      fetchData();
    } catch (err) {
      setActionError(err.message || 'Failed to update reservation');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return <Badge variant="primary" dot>Confirmed</Badge>;
      case 'CHECKED_IN':
        return <Badge variant="success" dot>Checked In</Badge>;
      case 'CHECKED_OUT':
        return <Badge variant="default">Checked Out</Badge>;
      case 'CANCELLED':
        return <Badge variant="danger">Cancelled</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const filteredReservations = reservations.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.confirmation_code.toLowerCase().includes(q) ||
      (r.guest_name && r.guest_name.toLowerCase().includes(q))
    );
  });

  const columns = [
    {
      key: 'confirmation_code',
      label: 'Confirmation',
      render: (val, row) => (
        <div>
          <span className="font-bold text-slate-100 font-mono">{val}</span>
          <div className="text-[11px] text-slate-500 font-sans">{row.source}</div>
        </div>
      ),
    },
    {
      key: 'guest_name',
      label: 'Guest',
      render: (val, row) => (
        <div>
          <div className="font-semibold text-slate-200">{val}</div>
          <div className="text-[11px] text-slate-400">{row.guest_email}</div>
        </div>
      ),
    },
    {
      key: 'dates',
      label: 'Stay Dates',
      render: (_, row) => (
        <div className="text-xs">
          <div className="text-slate-200 font-mono">
            {row.check_in_date} → {row.check_out_date}
          </div>
          <div className="text-[11px] text-slate-500">{row.total_nights} nights ({row.adults} adult{row.adults > 1 ? 's' : ''})</div>
        </div>
      ),
    },
    {
      key: 'room_number',
      label: 'Room',
      render: (val, row) => (
        <div>
          <span className="font-medium text-slate-300">
            {val !== 'Unassigned' ? `Room ${val}` : <span className="text-amber-400 italic">Unassigned</span>}
          </span>
          <div className="text-[11px] text-slate-500">{row.room_type_name}</div>
        </div>
      ),
    },
    {
      key: 'total_amount',
      label: 'Folio Total',
      render: (val) => <span className="font-bold font-mono text-slate-100">${val.toFixed(2)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (st) => getStatusBadge(st),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <Button
          variant="secondary"
          size="xs"
          onClick={() => setSelectedResv(row)}
        >
          Details
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
            <CalendarDays className="w-5 h-5 text-indigo-400" />
            Reservations & Bookings
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative transactional reservations linked to PostgreSQL guest accounts and room inventory
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="secondary" size="sm" onClick={fetchData} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsNewModalOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Create Reservation
          </Button>
        </div>
      </div>

      {actionSuccess && (
        <Alert variant="success" icon={<CheckCircle className="w-4 h-4" />}>
          {actionSuccess}
        </Alert>
      )}
      {actionError && <Alert variant="danger">{actionError}</Alert>}

      {/* Filter and Search Bar */}
      <Card className="border-slate-800">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
              <Input
                placeholder="Search confirmation or guest..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-xs py-1.5"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="CHECKED_IN">Checked In</option>
              <option value="CHECKED_OUT">Checked Out</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="text-xs text-slate-400">
            {filteredReservations.length} Active Booking Records
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <Table
            columns={columns}
            data={filteredReservations}
            loading={loading}
            emptyTitle="No reservations found"
            emptyDescription="Create a new reservation to record real guest bookings in the ledger."
          />
        </CardContent>
      </Card>

      {/* Reservation Details Modal */}
      {selectedResv && (
        <Modal
          isOpen={Boolean(selectedResv)}
          onClose={() => setSelectedResv(null)}
          title={`Booking ${selectedResv.confirmation_code}`}
          subtitle={`Guest: ${selectedResv.guest_name}`}
        >
          <div className="space-y-4 text-sm text-slate-300">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs">
              <div>
                <span className="text-slate-500 block">Check-in</span>
                <span className="font-mono text-slate-200 font-semibold">{selectedResv.check_in_date}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Check-out</span>
                <span className="font-mono text-slate-200 font-semibold">{selectedResv.check_out_date}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Duration</span>
                <span className="text-slate-200">{selectedResv.total_nights} Nights</span>
              </div>
              <div>
                <span className="text-slate-500 block">Total Rate</span>
                <span className="font-mono text-emerald-400 font-semibold">${selectedResv.total_amount?.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Assigned Room</span>
                <span className="text-slate-200">{selectedResv.room_number || 'None'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Status</span>
                <span className="mt-0.5 inline-block">{getStatusBadge(selectedResv.status)}</span>
              </div>
            </div>

            {selectedResv.special_requests && (
              <div className="text-xs">
                <span className="text-slate-400 font-semibold block mb-1">Special Requests:</span>
                <p className="p-2.5 bg-slate-950/70 border border-slate-800 rounded text-slate-300 italic">
                  "{selectedResv.special_requests}"
                </p>
              </div>
            )}

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              {selectedResv.status === 'CONFIRMED' && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleStatusChange(selectedResv.id, 'CANCELLED')}
                >
                  Cancel Booking
                </Button>
              )}
              {selectedResv.status === 'CANCELLED' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleStatusChange(selectedResv.id, 'CONFIRMED')}
                >
                  Re-Confirm Booking
                </Button>
              )}
              <Button variant="secondary" size="sm" onClick={() => setSelectedResv(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* New Reservation Modal */}
      {isNewModalOpen && (
        <Modal
          isOpen={isNewModalOpen}
          onClose={() => setIsNewModalOpen(false)}
          title="Create Authoritative Reservation"
          subtitle="Commits booking transaction, initializes folio, and locks inventory"
          size="lg"
        >
          <form onSubmit={handleCreateReservation} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Guest Profile</label>
                <select
                  value={selectedGuestId}
                  onChange={(e) => setSelectedGuestId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                >
                  {guests.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.first_name} {g.last_name} ({g.loyalty_tier})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Room Category</label>
                <select
                  value={selectedRoomTypeId}
                  onChange={(e) => setSelectedRoomTypeId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                >
                  {roomTypes.map((rt) => (
                    <option key={rt.id} value={rt.id}>
                      {rt.name} (${rt.base_rate}/nt)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Arrival Date</label>
                <Input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Departure Date</label>
                <Input
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Adults</label>
                <Input
                  type="number"
                  min="1"
                  max="6"
                  value={adultsCount}
                  onChange={(e) => setAdultsCount(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Assign Physical Room (Optional)
              </label>
              <select
                value={assignedRoomId}
                onChange={(e) => setAssignedRoomId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Leave Unassigned (Front Desk Auto-Assign)</option>
                {rooms
                  .filter((r) => r.status === 'VACANT_CLEAN' || r.status === 'INSPECTED')
                  .map((r) => (
                    <option key={r.id} value={r.id}>
                      Room {r.room_number} (Floor {r.floor} • {r.status})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Special Requests</label>
              <Input
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="High floor, extra towels, early check-in notes..."
              />
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setIsNewModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Confirm & Commit Reservation
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
