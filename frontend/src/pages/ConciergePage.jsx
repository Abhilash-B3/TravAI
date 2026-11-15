import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Table } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { Alert } from '../components/ui/Alert';
import { apiClient } from '../api/client';
import { MessageSquare, Sparkles, Send, Plus, RefreshCw, CheckCircle, Clock, Bot, User, Bell } from 'lucide-react';

export function ConciergePage() {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'tickets'
  
  // Chat state
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Welcome to Nexgile-TravAI Digital Concierge. I am your property AI assistant. I can assist with local dining recommendations, hotel amenities, spa scheduling, or submit housekeeping requests directly to our front desk ledger. How may I assist you today?',
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState('ACTIVE');
  const chatBottomRef = useRef(null);

  // Tickets state
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  
  // Ticket form
  const [ticketGuestName, setTicketGuestName] = useState('Alexandra Vance');
  const [ticketRoomNumber, setTicketRoomNumber] = useState('101');
  const [ticketCategory, setTicketCategory] = useState('Towels');
  const [ticketDescription, setTicketDescription] = useState('Need 2 extra bath towels and bathrobes');

  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);

  const fetchTickets = async () => {
    setTicketsLoading(true);
    try {
      const data = await apiClient('/concierge/tickets');
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load concierge tickets:', err);
    } finally {
      setTicketsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    if (activeTab === 'chat' && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputPrompt.trim() || chatLoading) return;

    const userMsg = { role: 'user', content: inputPrompt };
    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setChatLoading(true);

    try {
      const res = await apiClient('/concierge/chat', {
        method: 'POST',
        data: {
          prompt: userMsg.content,
          context: { property: 'Grand Resort & Spa', room: '101' },
        },
      });

      if (res && res.response) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: res.response, model: res.model },
        ]);
        if (res.ai_status) {
          setAiStatus(res.ai_status);
        }
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I apologize, but our server-side concierge service encountered an error. Please contact the front desk.',
          isError: true,
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setActionError(null);
    try {
      await apiClient('/concierge/tickets', {
        method: 'POST',
        data: {
          guest_name: ticketGuestName,
          room_number: ticketRoomNumber,
          category: ticketCategory,
          description: ticketDescription,
        },
      });
      setActionSuccess('Service ticket submitted directly to operational queues.');
      setIsNewTicketOpen(false);
      fetchTickets();
    } catch (err) {
      setActionError(err.message || 'Failed to submit ticket');
    }
  };

  const handleUpdateTicketStatus = async (ticketId, status) => {
    try {
      await apiClient(`/concierge/tickets/${ticketId}`, {
        method: 'PATCH',
        data: { status },
      });
      setActionSuccess(`Ticket status updated to ${status}.`);
      fetchTickets();
    } catch (err) {
      setActionError(err.message || 'Failed to update ticket status');
    }
  };

  const ticketColumns = [
    {
      key: 'room_number',
      label: 'Room #',
      render: (val) => <span className="font-bold text-slate-100 font-mono">Room {val}</span>,
    },
    {
      key: 'guest_name',
      label: 'Guest',
      render: (val) => <span className="text-slate-200 font-medium">{val}</span>,
    },
    {
      key: 'category',
      label: 'Category',
      render: (c) => <Badge variant="primary" size="xs">{c}</Badge>,
    },
    {
      key: 'description',
      label: 'Request Details',
      render: (desc) => <span className="text-xs text-slate-300">{desc}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (st) =>
        st === 'FULFILLED' ? (
          <Badge variant="success" dot>Fulfilled</Badge>
        ) : st === 'ACKNOWLEDGED' ? (
          <Badge variant="primary" dot>In Transit</Badge>
        ) : (
          <Badge variant="warning" dot>Pending</Badge>
        ),
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
              onClick={() => handleUpdateTicketStatus(row.id, 'ACKNOWLEDGED')}
            >
              Acknowledge
            </Button>
          )}
          {row.status === 'ACKNOWLEDGED' && (
            <Button
              variant="success"
              size="xs"
              onClick={() => handleUpdateTicketStatus(row.id, 'FULFILLED')}
            >
              Complete
            </Button>
          )}
          {row.status === 'FULFILLED' && (
            <span className="text-[11px] text-emerald-400 font-mono">Fulfilled</span>
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
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            AI Concierge & Guest Service Desk
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Server-side AI assistant grounded in hotel directory, local knowledge, and dispatch ticketing
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant={activeTab === 'chat' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveTab('chat')}
            leftIcon={<Bot className="w-3.5 h-3.5" />}
          >
            AI Concierge Chat
          </Button>
          <Button
            variant={activeTab === 'tickets' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveTab('tickets')}
            leftIcon={<Bell className="w-3.5 h-3.5" />}
          >
            Service Tickets ({tickets.filter((t) => t.status !== 'FULFILLED').length})
          </Button>
        </div>
      </div>

      {actionSuccess && (
        <Alert variant="success" icon={<CheckCircle className="w-4 h-4" />}>
          {actionSuccess}
        </Alert>
      )}
      {actionError && <Alert variant="danger">{actionError}</Alert>}

      {/* AI Chat Tab */}
      {activeTab === 'chat' && (
        <Card className="border-slate-800 flex flex-col h-[600px]">
          <CardHeader className="border-b border-slate-800 py-3 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <CardTitle className="text-sm">Nexgile-TravAI Grounded Concierge</CardTitle>
                <div className="text-[11px] text-slate-400">Powered by server-side Gemini & hospitality RAG logic</div>
              </div>
            </div>
            <Badge variant="success" size="xs">
              AI Status: {aiStatus}
            </Badge>
          </CardHeader>

          {/* Chat Transcript Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 text-xs leading-relaxed max-w-[85%] ${
                  m.role === 'user' ? 'ml-auto flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                    m.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-indigo-400 border border-slate-700'
                  }`}
                >
                  {m.role === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                </div>
                <div
                  className={`p-3 rounded-xl border ${
                    m.role === 'user'
                      ? 'bg-indigo-600/30 border-indigo-500/40 text-slate-100 rounded-tr-none'
                      : m.isError
                      ? 'bg-rose-950/40 border-rose-500/40 text-rose-200 rounded-tl-none'
                      : 'bg-slate-900 border-slate-800 text-slate-200 rounded-tl-none'
                  }`}
                >
                  <p>{m.content}</p>
                  {m.model && (
                    <div className="text-[10px] text-slate-500 mt-1 font-mono">Engine: {m.model}</div>
                  )}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex gap-3 text-xs text-slate-400 items-center">
                <div className="w-7 h-7 rounded-full bg-slate-800 text-indigo-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 animate-spin" />
                </div>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl rounded-tl-none font-mono">
                  Synthesizing property concierge recommendation...
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 border-t border-slate-800 bg-slate-950/50 flex gap-2"
          >
            <Input
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Ask about dining, breakfast hours, pool cabanas, or request extra pillows..."
              className="text-xs"
              disabled={chatLoading}
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={chatLoading}
              leftIcon={<Send className="w-3.5 h-3.5" />}
            >
              Send
            </Button>
          </form>
        </Card>
      )}

      {/* Tickets Tab */}
      {activeTab === 'tickets' && (
        <Card className="border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>In-Room Guest Service Tickets</CardTitle>
              <CardDescription>
                Live operational requests routed directly to housekeeping, front desk, and room service
              </CardDescription>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsNewTicketOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Submit Service Request
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            <Table
              columns={ticketColumns}
              data={tickets}
              loading={ticketsLoading}
              emptyTitle="No service requests pending"
              emptyDescription="All guest requests have been fulfilled or none are currently logged."
            />
          </CardContent>
        </Card>
      )}

      {/* Submit Service Request Modal */}
      {isNewTicketOpen && (
        <Modal
          isOpen={isNewTicketOpen}
          onClose={() => setIsNewTicketOpen(false)}
          title="Submit Guest Service Request"
          subtitle="Directly notifies staff and tracks delivery status"
        >
          <form onSubmit={handleCreateTicket} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Guest Full Name</label>
                <Input
                  value={ticketGuestName}
                  onChange={(e) => setTicketGuestName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Room Number</label>
                <Input
                  value={ticketRoomNumber}
                  onChange={(e) => setTicketRoomNumber(e.target.value)}
                  placeholder="e.g. 101"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Request Category</label>
              <select
                value={ticketCategory}
                onChange={(e) => setTicketCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Towels">Extra Towels & Linens</option>
                <option value="Toiletries">Luxury Toiletries / Amenities</option>
                <option value="Housekeeping">Turn Down Service</option>
                <option value="Luggage">Luggage Assistance / Bellman</option>
                <option value="Late Check-Out">Late Check-Out Request</option>
                <option value="Dining">In-Room Dining Delivery</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Request Description</label>
              <Input
                value={ticketDescription}
                onChange={(e) => setTicketDescription(e.target.value)}
                placeholder="Specific instructions for staff..."
                required
              />
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setIsNewTicketOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Submit Request
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
