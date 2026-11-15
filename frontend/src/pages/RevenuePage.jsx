import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Table } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { Alert } from '../components/ui/Alert';
import { apiClient } from '../api/client';
import { TrendingUp, Plus, RefreshCw, CheckCircle, Sparkles, Sliders, ArrowUpRight } from 'lucide-react';

export function RevenuePage() {
  const [metrics, setMetrics] = useState(null);
  const [rules, setRules] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isNewRuleOpen, setIsNewRuleOpen] = useState(false);

  // Form states
  const [ruleName, setRuleName] = useState('');
  const [multiplier, setMultiplier] = useState('1.15');
  const [condition, setCondition] = useState('OCCUPANCY_GT_80');

  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);

  const fetchRevenueData = async () => {
    setLoading(true);
    try {
      const [met, rls, recs] = await Promise.all([
        apiClient('/revenue/metrics'),
        apiClient('/revenue/pricing-rules'),
        apiClient('/revenue/recommendations'),
      ]);
      setMetrics(met);
      setRules(Array.isArray(rls) ? rls : []);
      setRecommendations(Array.isArray(recs) ? recs : []);
    } catch (err) {
      console.error('Failed to load revenue data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueData();
  }, []);

  const handleToggleRule = async (rule) => {
    try {
      await apiClient(`/revenue/pricing-rules/${rule.id}/toggle`, { method: 'PATCH' });
      setActionSuccess(`Pricing rule "${rule.name}" toggled.`);
      fetchRevenueData();
    } catch (err) {
      setActionError(err.message || 'Failed to update rule');
    }
  };

  const handleApplyRecommendation = async (rec) => {
    try {
      await apiClient(`/revenue/recommendations/${rec.id}/apply`, { method: 'POST' });
      setActionSuccess(`Applied recommendation: "${rec.action}"`);
      fetchRevenueData();
    } catch (err) {
      setActionError(err.message || 'Failed to apply recommendation');
    }
  };

  const handleCreateRule = async (e) => {
    e.preventDefault();
    setActionError(null);
    try {
      await apiClient('/revenue/pricing-rules', {
        method: 'POST',
        data: {
          name: ruleName,
          multiplier: parseFloat(multiplier),
          condition,
        },
      });
      setActionSuccess(`Pricing rule "${ruleName}" created and active.`);
      setIsNewRuleOpen(false);
      setRuleName('');
      fetchRevenueData();
    } catch (err) {
      setActionError(err.message || 'Failed to create pricing rule');
    }
  };

  const ruleColumns = [
    {
      key: 'name',
      label: 'Rule Name',
      render: (val) => <span className="font-semibold text-slate-200">{val}</span>,
    },
    {
      key: 'condition',
      label: 'Trigger Condition',
      render: (val) => (
        <span className="font-mono text-xs text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/30">
          {val}
        </span>
      ),
    },
    {
      key: 'multiplier',
      label: 'Price Multiplier',
      render: (m) => (
        <span className="font-mono font-bold text-emerald-400">
          {m > 1 ? `+${((m - 1) * 100).toFixed(0)}%` : `-${((1 - m) * 100).toFixed(0)}%`} ({m}x)
        </span>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (active) =>
        active ? (
          <Badge variant="success" dot>Active Engine</Badge>
        ) : (
          <Badge variant="default">Paused</Badge>
        ),
    },
    {
      key: 'actions',
      label: 'Toggle',
      render: (_, row) => (
        <Button
          variant={row.is_active ? 'secondary' : 'primary'}
          size="xs"
          onClick={() => handleToggleRule(row)}
        >
          {row.is_active ? 'Pause' : 'Activate'}
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
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            Revenue Management & Dynamic Yield Pricing
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time calculated ADR, RevPAR, automated rate multipliers, and AI demand forecasting
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="secondary" size="sm" onClick={fetchRevenueData} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Refresh Rates
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsNewRuleOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            New Pricing Rule
          </Button>
        </div>
      </div>

      {actionSuccess && (
        <Alert variant="success" icon={<CheckCircle className="w-4 h-4" />}>
          {actionSuccess}
        </Alert>
      )}
      {actionError && <Alert variant="danger">{actionError}</Alert>}

      {/* Calculated KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400">Total Revenue (Ledger)</div>
          <div className="text-2xl font-bold font-mono text-slate-100 mt-1">
            ${metrics?.total_revenue?.toFixed(2) || '0.00'}
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-0.5 mt-1 font-mono">
            <ArrowUpRight className="w-3 h-3" /> Authoritative DB Sum
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400">ADR (Avg Daily Rate)</div>
          <div className="text-2xl font-bold font-mono text-indigo-400 mt-1">
            ${metrics?.adr?.toFixed(2) || '0.00'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">Rev / Occupied Rooms</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400">RevPAR</div>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
            ${metrics?.revpar?.toFixed(2) || '0.00'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">Rev / Available Rooms</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400">Occupancy Rate</div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
            {metrics?.occupancy_rate?.toFixed(1) || '0.0'}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">Occupied / Total Units</div>
        </div>
      </div>

      {/* AI Revenue Recommendations */}
      <Card className="border-indigo-900/50 bg-gradient-to-r from-slate-900 to-indigo-950/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <CardTitle>AI Dynamic Yield Recommendations</CardTitle>
          </div>
          <CardDescription>
            Algorithms analyze booking velocity, local event calendars, and compset rates to recommend rate adjustments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {recommendations.length > 0 ? (
            recommendations.map((rec) => (
              <div
                key={rec.id}
                className="p-3 bg-slate-950/70 border border-indigo-900/40 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-200">{rec.action}</span>
                    <Badge variant={rec.status === 'APPLIED' ? 'success' : 'primary'} size="xs">
                      {rec.status}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{rec.rationale}</p>
                </div>
                {rec.status !== 'APPLIED' && (
                  <Button
                    variant="primary"
                    size="xs"
                    onClick={() => handleApplyRecommendation(rec)}
                  >
                    Apply Rate Shift
                  </Button>
                )}
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500 italic">No pending revenue recommendations.</p>
          )}
        </CardContent>
      </Card>

      {/* Pricing Rules Engine */}
      <Card className="border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-slate-400" />
            Configured Yield Rules
          </CardTitle>
          <CardDescription>Automated rate plan adjustments triggered by real database occupancy conditions</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Table
            columns={ruleColumns}
            data={rules}
            loading={loading}
            emptyTitle="No pricing rules configured"
            emptyDescription="Create pricing rules to automate yield management."
          />
        </CardContent>
      </Card>

      {/* Create Pricing Rule Modal */}
      {isNewRuleOpen && (
        <Modal
          isOpen={isNewRuleOpen}
          onClose={() => setIsNewRuleOpen(false)}
          title="Create Dynamic Pricing Rule"
          subtitle="Configures automated multiplier rule on live room rates"
        >
          <form onSubmit={handleCreateRule} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Rule Name</label>
              <Input
                value={ruleName}
                onChange={(e) => setRuleName(e.target.value)}
                placeholder="e.g. Surge Pricing at 85% Occupancy"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Trigger Condition</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="OCCUPANCY_GT_80">Occupancy &gt; 80%</option>
                  <option value="OCCUPANCY_GT_90">Occupancy &gt; 90%</option>
                  <option value="WEEKEND_DEMAND">Friday / Saturday Stays</option>
                  <option value="LAST_MINUTE_UNDER_48H">Last Minute (&lt; 48 Hours)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Price Multiplier</label>
                <Input
                  type="number"
                  step="0.05"
                  min="0.5"
                  max="2.5"
                  value={multiplier}
                  onChange={(e) => setMultiplier(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setIsNewRuleOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save & Enable Rule
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
