import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Table } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { Alert } from '../components/ui/Alert';
import { apiClient } from '../api/client';
import { Wrench, Plus, RefreshCw, CheckCircle, AlertTriangle, Hammer, ShieldAlert } from 'lucide-react';

export function MaintenancePage() {
  const [orders, setOrders] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Form states
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [category, setCategory] = useState('HVAC');
  const [priority, setPriority] = useState('HIGH');
  const [description, setDescription] = useState('');
  const [setOutOfOrder, setSetOutOfOrder] = useState(true);

  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);

  const fetchMaintenance = async () => {
    setLoading(true);
    try {
      const [ords, rms] = await Promise.all([
        apiClient('/maintenance/work-orders', {
          params: statusFilter ? { status: statusFilter } : {},
        }),
        apiClient('/pms/rooms'),
      ]);
      setOrders(Array.isArray(ords) ? ords : []);
      setRooms(Array.isArray(rms) ? rms : []);
      if (rms && rms.length && !selectedRoomId) {
        setSelectedRoomId(rms[0].id);
      }
    } catch (err) {
      console.error('Failed to load maintenance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenance();
  }, [statusFilter]);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setActionError(null);
    try {
      await apiClient(`/maintenance/work-orders/${orderId}`, {
        method: 'PATCH',
        data: { status: newStatus },
      });
      setActionSuccess(`Work order status updated to ${newStatus}. Room state synced.`);
      fetchMaintenance();
    } catch (err) {
      setActionError(err.message || 'Failed to update work order');
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setActionError(null);
    try {
      await apiClient('/maintenance/work-orders', {
        method: 'POST',
        data: {
          room_id: selectedRoomId,
          category,
          priority,
          description,
          set_out_of_order: setOutOfOrder,
        },
      });
      setActionSuccess('Maintenance ticket logged. Room marked OUT_OF_ORDER.');
      setIsReportModalOpen(false);
      setDescription('');
      fetchMaintenance();
    } catch (err) {
      setActionError(err.message || 'Failed to file work order');
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'OPEN':
        return <Badge variant="danger" dot>Open</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="warning" dot>In Progress</Badge>;
      case 'RESOLVED':
        return <Badge variant="success" dot>Resolved</Badge>;
      default:
        return <Badge variant="default">{st}</Badge>;
    }
  };

  const getPriorityBadge = (p) => {
    switch (p) {
      case 'URGENT':
        return <Badge variant="danger">Urgent</Badge>;
      case 'HIGH':
        return <Badge variant="warning">High</Badge>;
      case 'MEDIUM':
        return <Badge variant="default">Medium</Badge>;
      default:
        return <Badge variant="outline">Low</Badge>;
    }
  };

  const columns = [
    {
      key: 'room_number',
      label: 'Room #',
      render: (val) => <span className="font-bold text-slate-100 font-mono">Room {val}</span>,
    },
    {
      key: 'category',
      label: 'Category',
      render: (cat) => <span className="font-medium text-slate-200">{cat}</span>,
    },
    {
      key: 'description',
      label: 'Issue Description',
      render: (desc) => <span className="text-xs text-slate-300 line-clamp-1">{desc}</span>,
    },
    {
      key: 'priority',
      label: 'Severity',
      render: (p) => getPriorityBadge(p),
    },
    {
      key: 'status',
      label: 'Status',
      render: (st) => getStatusBadge(st),
    },
    {
      key: 'actions',
      label: 'Action',
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          {row.status === 'OPEN' && (
            <Button
              variant="primary"
              size="xs"
              onClick={() => handleUpdateOrderStatus(row.id, 'IN_PROGRESS')}
            >
              Assign / Start
            </Button>
          )}
          {row.status === 'IN_PROGRESS' && (
            <Button
              variant="success"
              size="xs"
              onClick={() => handleUpdateOrderStatus(row.id, 'RESOLVED')}
            >
              Mark Resolved
            </Button>
          )}
          {row.status === 'RESOLVED' && (
            <span className="text-[11px] text-emerald-400 font-mono">Service Restored</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-indigo-400" />
            Engineering & Maintenance Work Orders
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative repair orders, equipment lifecycle tickets, and inventory out-of-order locks
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="secondary" size="sm" onClick={fetchMaintenance} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Refresh
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsReportModalOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Report Defect
          </Button>
        </div>
      </div>

      {actionSuccess && (
        <Alert variant="success" icon={<CheckCircle className="w-4 h-4" />}>
          {actionSuccess}
        </Alert>
      )}
      {actionError && <Alert variant="danger">{actionError}</Alert>}

      {/* Orders Table Card */}
      <Card className="border-slate-800">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300">Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Work Orders</option>
              <option value="OPEN">Open Defects</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            {orders.length} Maintenance Tickets
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Table
            columns={columns}
            data={orders}
            loading={loading}
            emptyTitle="No maintenance work orders"
            emptyDescription="All property equipment is operational and no open defects exist."
          />
        </CardContent>
      </Card>

      {/* Report Defect Modal */}
      {isReportModalOpen && (
        <Modal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          title="Report Equipment Defect / Work Order"
          subtitle="Logs engineering ticket and optionally locks room to OUT_OF_ORDER"
        >
          <form onSubmit={handleCreateOrder} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Affected Room Unit</label>
              <select
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              >
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    Room {r.room_number} (Floor {r.floor} • {r.status})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Trade / Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="HVAC">HVAC / Temperature</option>
                  <option value="Plumbing">Plumbing / Water</option>
                  <option value="Electrical">Electrical / Lighting</option>
                  <option value="Keycard Lock">Access / Lock</option>
                  <option value="Furniture">Furniture & Fixtures</option>
                  <option value="Appliance">In-Room Appliance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Urgency</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="LOW">Low (Minor cosmetic)</option>
                  <option value="MEDIUM">Medium (Non-blocking)</option>
                  <option value="HIGH">High (Guest impact)</option>
                  <option value="URGENT">Urgent (Safety / Inhabitable)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Issue Description</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. AC unit making buzzing noise and blowing ambient air"
                required
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="outOfOrderCheck"
                checked={setOutOfOrder}
                onChange={(e) => setSetOutOfOrder(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-rose-600 focus:ring-rose-500"
              />
              <label htmlFor="outOfOrderCheck" className="text-xs text-rose-300 font-medium cursor-pointer">
                Immediately lock room to OUT_OF_ORDER (Prevents front desk assignment)
              </label>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setIsReportModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="danger" size="sm">
                Log Work Order
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
