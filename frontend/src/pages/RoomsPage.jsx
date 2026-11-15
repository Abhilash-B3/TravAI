import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Table } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { Alert } from '../components/ui/Alert';
import { apiClient } from '../api/client';
import { Hotel, Plus, RefreshCw, CheckCircle, AlertTriangle, Sparkles, Filter, Wrench } from 'lucide-react';

export function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newRoomFloor, setNewRoomFloor] = useState('1');
  const [newRoomType, setNewRoomType] = useState('');
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  const fetchRoomsAndTypes = async () => {
    setLoading(true);
    try {
      const [rms, rts] = await Promise.all([
        apiClient('/pms/rooms', { params: filterStatus ? { status: filterStatus } : {} }),
        apiClient('/pms/room-types'),
      ]);
      setRooms(Array.isArray(rms) ? rms : []);
      setRoomTypes(Array.isArray(rts) ? rts : []);
      if (rts && rts.length && !newRoomType) {
        setNewRoomType(rts[0].id);
      }
    } catch (err) {
      console.error('Failed to load rooms data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomsAndTypes();
  }, [filterStatus]);

  const handleStatusTransition = async (newStatus) => {
    if (!selectedRoom) return;
    setActionError(null);
    try {
      await apiClient(`/pms/rooms/${selectedRoom.id}/status`, {
        method: 'PATCH',
        data: { status: newStatus },
      });
      setActionSuccess(`Room ${selectedRoom.room_number} status updated to ${newStatus}`);
      setIsStatusModalOpen(false);
      fetchRoomsAndTypes();
    } catch (err) {
      setActionError(err.message || 'Failed to update room status');
    }
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    setActionError(null);
    try {
      await apiClient('/pms/rooms', {
        method: 'POST',
        data: {
          room_number: newRoomNumber,
          floor: parseInt(newRoomFloor, 10),
          room_type_id: newRoomType,
          building: 'Main Tower',
          status: 'VACANT_CLEAN',
        },
      });
      setActionSuccess(`Room ${newRoomNumber} successfully added.`);
      setIsAddRoomModalOpen(false);
      setNewRoomNumber('');
      fetchRoomsAndTypes();
    } catch (err) {
      setActionError(err.message || 'Failed to create room.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'VACANT_CLEAN':
        return <Badge variant="success" dot>Vacant Clean</Badge>;
      case 'VACANT_DIRTY':
        return <Badge variant="warning" dot>Vacant Dirty</Badge>;
      case 'OCCUPIED_CLEAN':
        return <Badge variant="primary" dot>Occupied Clean</Badge>;
      case 'OCCUPIED_DIRTY':
        return <Badge variant="warning" dot>Occupied Dirty</Badge>;
      case 'INSPECTED':
        return <Badge variant="purple" dot>Inspected</Badge>;
      case 'OUT_OF_ORDER':
        return <Badge variant="danger" dot>Out of Order</Badge>;
      case 'OUT_OF_SERVICE':
        return <Badge variant="default" dot>Out of Service</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const columns = [
    {
      key: 'room_number',
      label: 'Room #',
      render: (val, row) => (
        <div className="font-bold text-slate-100 flex items-center gap-2">
          <span>{val}</span>
          <span className="text-[11px] text-slate-500 font-normal">Fl {row.floor}</span>
        </div>
      ),
    },
    {
      key: 'room_type_name',
      label: 'Room Type',
      render: (val, row) => (
        <div>
          <div className="font-medium text-slate-200">{val}</div>
          <div className="text-[11px] text-slate-400 font-mono">${row.base_rate}/night</div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Operational Status',
      render: (status) => getStatusBadge(status),
    },
    {
      key: 'housekeeping_status',
      label: 'Cleanliness',
      render: (hk) => (
        <span className="text-xs text-slate-300 font-mono">
          {hk === 'CLEAN' ? '🧼 Clean' : hk === 'DIRTY' ? '🧹 Dirty' : '✨ Inspected'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <Button
          variant="secondary"
          size="xs"
          onClick={() => {
            setSelectedRoom(row);
            setIsStatusModalOpen(true);
          }}
        >
          Change Status
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
            <Hotel className="w-5 h-5 text-indigo-400" />
            Rooms & Inventory Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative PMS room statuses, physical turnover states, and maintenance availability
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchRoomsAndTypes}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddRoomModalOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Physical Room
          </Button>
        </div>
      </div>

      {actionSuccess && (
        <Alert variant="success" icon={<CheckCircle className="w-4 h-4" />}>
          {actionSuccess}
        </Alert>
      )}
      {actionError && <Alert variant="danger">{actionError}</Alert>}

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
          <div className="text-[11px] text-slate-400">Total Rooms</div>
          <div className="text-lg font-bold text-slate-100 font-mono mt-0.5">{rooms.length}</div>
        </div>
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
          <div className="text-[11px] text-emerald-400">Vacant Clean</div>
          <div className="text-lg font-bold text-emerald-300 font-mono mt-0.5">
            {rooms.filter((r) => r.status === 'VACANT_CLEAN').length}
          </div>
        </div>
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
          <div className="text-[11px] text-amber-400">Vacant Dirty</div>
          <div className="text-lg font-bold text-amber-300 font-mono mt-0.5">
            {rooms.filter((r) => r.status === 'VACANT_DIRTY').length}
          </div>
        </div>
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
          <div className="text-[11px] text-indigo-400">Occupied</div>
          <div className="text-lg font-bold text-indigo-300 font-mono mt-0.5">
            {rooms.filter((r) => r.status.startsWith('OCCUPIED')).length}
          </div>
        </div>
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
          <div className="text-[11px] text-rose-400">Out of Order</div>
          <div className="text-lg font-bold text-rose-300 font-mono mt-0.5">
            {rooms.filter((r) => r.status === 'OUT_OF_ORDER').length}
          </div>
        </div>
      </div>

      {/* Filter Bar & Table */}
      <Card className="border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-300">Filter By Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="VACANT_CLEAN">Vacant Clean</option>
              <option value="VACANT_DIRTY">Vacant Dirty</option>
              <option value="OCCUPIED_CLEAN">Occupied Clean</option>
              <option value="INSPECTED">Inspected</option>
              <option value="OUT_OF_ORDER">Out of Order</option>
            </select>
          </div>
          <div className="text-xs text-slate-400">Showing {rooms.length} physical room units</div>
        </CardHeader>
        <CardContent className="pt-0">
          <Table
            columns={columns}
            data={rooms}
            loading={loading}
            emptyTitle="No rooms found"
            emptyDescription="Create physical rooms or adjust your active filters."
          />
        </CardContent>
      </Card>

      {/* Room Status Transition Modal */}
      {isStatusModalOpen && selectedRoom && (
        <Modal
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          title={`Update Room ${selectedRoom.room_number} Status`}
          subtitle={`Current status: ${selectedRoom.status}`}
        >
          <div className="space-y-4 text-sm text-slate-300">
            <p className="text-xs text-slate-400 leading-relaxed">
              Select the new state machine status. Transitions immediately update the central database, trigger
              housekeeping turnover queues, and sync front desk availability.
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <Button
                variant="success"
                size="sm"
                onClick={() => handleStatusTransition('VACANT_CLEAN')}
                leftIcon={<Sparkles className="w-3.5 h-3.5" />}
              >
                Mark Vacant Clean
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleStatusTransition('VACANT_DIRTY')}
              >
                Mark Vacant Dirty
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleStatusTransition('INSPECTED')}
                leftIcon={<CheckCircle className="w-3.5 h-3.5" />}
              >
                Pass Inspection
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleStatusTransition('OUT_OF_ORDER')}
                leftIcon={<Wrench className="w-3.5 h-3.5" />}
              >
                Set Out of Order
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Room Modal */}
      {isAddRoomModalOpen && (
        <Modal
          isOpen={isAddRoomModalOpen}
          onClose={() => setIsAddRoomModalOpen(false)}
          title="Add Physical Room Unit"
          subtitle="Registers a new room under the active property scope"
        >
          <form onSubmit={handleAddRoom} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Room Number</label>
              <Input
                value={newRoomNumber}
                onChange={(e) => setNewRoomNumber(e.target.value)}
                placeholder="e.g. 301"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Floor</label>
                <Input
                  type="number"
                  value={newRoomFloor}
                  onChange={(e) => setNewRoomFloor(e.target.value)}
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Room Type</label>
                <select
                  value={newRoomType}
                  onChange={(e) => setNewRoomType(e.target.value)}
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
            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setIsAddRoomModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Create Room Record
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
