import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Table } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { Alert } from '../components/ui/Alert';
import { apiClient } from '../api/client';
import { Globe, Plus, RefreshCw, CheckCircle, AlertTriangle, Key, Shield, ExternalLink } from 'lucide-react';

export function DistributionPage() {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  // Form states
  const [providerHotelId, setProviderHotelId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');

  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);

  const fetchChannels = async () => {
    setLoading(true);
    try {
      const data = await apiClient('/distribution/channels');
      setChannels(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load distribution channels:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  const handleOpenConnect = (channel) => {
    setSelectedChannel(channel);
    setProviderHotelId('');
    setApiKey('');
    setApiSecret('');
    setIsConnectModalOpen(true);
  };

  const handleConnectChannel = async (e) => {
    e.preventDefault();
    if (!selectedChannel) return;
    setActionError(null);
    try {
      await apiClient(`/distribution/channels/${selectedChannel.id}/connect`, {
        method: 'POST',
        data: {
          hotel_id: providerHotelId,
          api_key: apiKey,
          api_secret: apiSecret,
        },
      });
      setActionSuccess(`Channel ${selectedChannel.name} authenticated and active.`);
      setIsConnectModalOpen(false);
      fetchChannels();
    } catch (err) {
      setActionError(err.message || 'Failed to authenticate channel');
    }
  };

  const handleSyncChannel = async (channel) => {
    setActionError(null);
    try {
      const res = await apiClient(`/distribution/channels/${channel.id}/sync`, { method: 'POST' });
      setActionSuccess(`Synchronized ${res.synced_allotments} inventory allotments to ${channel.name}.`);
      fetchChannels();
    } catch (err) {
      setActionError(err.message || 'Synchronization failed');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Channel Name',
      render: (val, row) => (
        <div>
          <div className="font-semibold text-slate-100 flex items-center gap-1.5">
            <span>{val}</span>
            <span className="text-[10px] text-slate-500 font-mono">({row.channel_code})</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">{row.api_endpoint}</div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Integration Status',
      render: (st) => {
        if (st === 'CONNECTED') {
          return <Badge variant="success" dot>Connected Live</Badge>;
        }
        if (st === 'NOT CONFIGURED') {
          return <Badge variant="danger" dot>Not Configured</Badge>;
        }
        return <Badge variant="warning">{st}</Badge>;
      },
    },
    {
      key: 'last_sync',
      label: 'Last Successful Sync',
      render: (val) => (
        <span className="font-mono text-xs text-slate-400">
          {val ? new Date(val).toLocaleString() : 'Never Synced'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          {row.status === 'CONNECTED' ? (
            <Button
              variant="secondary"
              size="xs"
              onClick={() => handleSyncChannel(row)}
              leftIcon={<RefreshCw className="w-3 h-3" />}
            >
              Push Inventory
            </Button>
          ) : (
            <Button
              variant="primary"
              size="xs"
              onClick={() => handleOpenConnect(row)}
              leftIcon={<Key className="w-3 h-3" />}
            >
              Configure Credentials
            </Button>
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
            <Globe className="w-5 h-5 text-indigo-400" />
            Channel Manager & OTA Distribution
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative two-way ARI (Availability, Rates & Inventory) synchronization across global travel networks
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={fetchChannels} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
          Refresh Feeds
        </Button>
      </div>

      {actionSuccess && (
        <Alert variant="success" icon={<CheckCircle className="w-4 h-4" />}>
          {actionSuccess}
        </Alert>
      )}
      {actionError && <Alert variant="danger">{actionError}</Alert>}

      {/* Zero-Mock Policy Compliance Notice */}
      <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-start gap-2.5 text-xs text-slate-400">
        <Shield className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-200">Permanent Real-Data Policy (Rule 6):</span>
          <p className="mt-0.5 text-slate-400">
            Unconfigured external OTA channels explicitly display <span className="text-rose-400 font-mono">STATUS = NOT CONFIGURED</span>.
            Channel connections require authentic partner API credentials and transmit real ARI updates.
          </p>
        </div>
      </div>

      {/* Channels Table */}
      <Card className="border-slate-800">
        <CardHeader>
          <CardTitle>Global Distribution Feeds</CardTitle>
          <CardDescription>Two-way XML/JSON OTA channel connections mapped to property room types</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Table
            columns={columns}
            data={channels}
            loading={loading}
            emptyTitle="No distribution channels found"
          />
        </CardContent>
      </Card>

      {/* Connect Credentials Modal */}
      {isConnectModalOpen && selectedChannel && (
        <Modal
          isOpen={isConnectModalOpen}
          onClose={() => setIsConnectModalOpen(false)}
          title={`Configure ${selectedChannel.name} Connection`}
          subtitle={`Provider endpoint: ${selectedChannel.api_endpoint}`}
        >
          <form onSubmit={handleConnectChannel} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                OTA Property / Hotel ID
              </label>
              <Input
                value={providerHotelId}
                onChange={(e) => setProviderHotelId(e.target.value)}
                placeholder="e.g. BCOM-98124501"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">API Key / Client ID</label>
              <Input
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Live Production API Key"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">API Secret / Token</label>
              <Input
                type="password"
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                placeholder="••••••••••••••••"
                required
              />
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setIsConnectModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Authenticate & Connect
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
