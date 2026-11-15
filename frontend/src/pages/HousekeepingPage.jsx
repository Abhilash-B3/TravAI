import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Table } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { Alert } from '../components/ui/Alert';
import { apiClient } from '../api/client';
import { Sparkles, Plus, RefreshCw, CheckCircle, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

export function HousekeepingPage() {
  const [tasks, setTasks] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);

  // Form states
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [taskType, setTaskType] = useState('FULL_CLEAN');
  const [priority, setPriority] = useState('MEDIUM');
  const [assigneeName, setAssigneeName] = useState('Maria Gomez');

  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);

  const fetchHousekeeping = async () => {
    setLoading(true);
    try {
      const [tskList, rms] = await Promise.all([
        apiClient('/housekeeping/tasks', {
          params: statusFilter ? { status: statusFilter } : {},
        }),
        apiClient('/pms/rooms'),
      ]);
      setTasks(Array.isArray(tskList) ? tskList : []);
      setRooms(Array.isArray(rms) ? rms : []);
      if (rms && rms.length && !selectedRoomId) {
        setSelectedRoomId(rms[0].id);
      }
    } catch (err) {
      console.error('Failed to load housekeeping tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHousekeeping();
  }, [statusFilter]);

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    setActionError(null);
    try {
      await apiClient(`/housekeeping/tasks/${taskId}`, {
        method: 'PATCH',
        data: { status: newStatus },
      });
      setActionSuccess(`Task status updated to ${newStatus}. Inventory state updated.`);
      fetchHousekeeping();
    } catch (err) {
      setActionError(err.message || 'Failed to update task');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setActionError(null);
    try {
      await apiClient('/housekeeping/tasks', {
        method: 'POST',
        data: {
          room_id: selectedRoomId,
          task_type: taskType,
          priority,
          assignee_name: assigneeName,
        },
      });
      setActionSuccess('Cleaning dispatch task created.');
      setIsNewTaskModalOpen(false);
      fetchHousekeeping();
    } catch (err) {
      setActionError(err.message || 'Failed to create task');
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'PENDING':
        return <Badge variant="warning" dot>Pending</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="primary" dot>In Progress</Badge>;
      case 'COMPLETED':
        return <Badge variant="success" dot>Completed</Badge>;
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
      key: 'task_type',
      label: 'Service Type',
      render: (val) => (
        <span className="font-medium text-slate-200 text-xs">
          {val.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (p) => getPriorityBadge(p),
    },
    {
      key: 'assignee_name',
      label: 'Housekeeper',
      render: (val) => <span className="text-slate-300 text-xs">{val}</span>,
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
          {row.status === 'PENDING' && (
            <Button
              variant="primary"
              size="xs"
              onClick={() => handleUpdateTaskStatus(row.id, 'IN_PROGRESS')}
            >
              Start Cleaning
            </Button>
          )}
          {row.status === 'IN_PROGRESS' && (
            <Button
              variant="success"
              size="xs"
              onClick={() => handleUpdateTaskStatus(row.id, 'COMPLETED')}
            >
              Finish Clean
            </Button>
          )}
          {row.status === 'COMPLETED' && (
            <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Ready for Inspection
            </span>
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
            <Sparkles className="w-5 h-5 text-indigo-400" />
            Housekeeping & Cleanliness Turnover
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative room turnover board, inspection checkpoints, and staff task dispatch
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="secondary" size="sm" onClick={fetchHousekeeping} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsNewTaskModalOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Dispatch Task
          </Button>
        </div>
      </div>

      {actionSuccess && (
        <Alert variant="success" icon={<CheckCircle className="w-4 h-4" />}>
          {actionSuccess}
        </Alert>
      )}
      {actionError && <Alert variant="danger">{actionError}</Alert>}

      {/* Housekeeping Tasks Card */}
      <Card className="border-slate-800">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300">Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Tasks</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            {tasks.length} Active Turnover Tasks
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Table
            columns={columns}
            data={tasks}
            loading={loading}
            emptyTitle="No housekeeping tasks queued"
            emptyDescription="All rooms have been serviced or no turnover orders have been dispatched."
          />
        </CardContent>
      </Card>

      {/* Dispatch New Task Modal */}
      {isNewTaskModalOpen && (
        <Modal
          isOpen={isNewTaskModalOpen}
          onClose={() => setIsNewTaskModalOpen(false)}
          title="Dispatch Housekeeping Task"
          subtitle="Assigns a turnover task to operational staff in the active property"
        >
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Room Unit</label>
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
                <label className="block text-xs font-semibold text-slate-300 mb-1">Cleaning Type</label>
                <select
                  value={taskType}
                  onChange={(e) => setTaskType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="FULL_CLEAN">Full Turnover Clean</option>
                  <option value="STAYOVER">Stayover Refresh</option>
                  <option value="DEEP_CLEAN">Deep Sanitization</option>
                  <option value="TOUCH_UP">Pre-Arrival Touch Up</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent (VIP/Imminent Arrival)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Assigned Housekeeper</label>
              <Input
                value={assigneeName}
                onChange={(e) => setAssigneeName(e.target.value)}
                placeholder="Staff Member Name"
                required
              />
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setIsNewTaskModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Dispatch Order
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
