import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Alert } from '../components/ui/Alert';
import { ROUTES } from '../constants/routes';
import { apiClient } from '../api/client';
import { useTenant } from '../hooks/useTenant';
import { 
  Building2, 
  Layers, 
  Hotel, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Plus, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export function OnboardingPage({ onNavigate }) {
  const { property, refreshTenantContext } = useTenant();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: null, message: null });

  // Step 1: Property state
  const [propertyName, setPropertyName] = useState(property?.name || 'Grand Resort & Suites');
  const [propertyCity, setPropertyCity] = useState(property?.city || 'Miami');
  const [propertyCountry, setPropertyCountry] = useState(property?.country || 'United States');
  const [propertyTimezone, setPropertyTimezone] = useState('America/New_York');
  const [propertyCurrency, setPropertyCurrency] = useState('USD');

  // Step 2: Room Types state
  const [roomTypes, setRoomTypes] = useState([]);
  const [newRtName, setNewRtName] = useState('Deluxe King Suite');
  const [newRtRate, setNewRtRate] = useState('249');
  const [newRtCapacity, setNewRtCapacity] = useState('2');

  // Step 3: Physical Rooms state
  const [rooms, setRooms] = useState([]);
  const [newRoomNumber, setNewRoomNumber] = useState('101');
  const [newRoomFloor, setNewRoomFloor] = useState('1');
  const [selectedRtId, setSelectedRtId] = useState('');

  // Step 4: Rate Plans state
  const [ratePlans, setRatePlans] = useState([]);
  const [newRpName, setNewRpName] = useState('Best Available Flexible Rate');
  const [newRpPolicy, setNewRpPolicy] = useState('FLEXIBLE_24H');
  const [newRpDiscount, setNewRpDiscount] = useState('0');

  // Load existing configuration
  useEffect(() => {
    async function loadData() {
      try {
        const [rts, rms, rps] = await Promise.all([
          apiClient('/pms/room-types').catch(() => []),
          apiClient('/pms/rooms').catch(() => []),
          apiClient('/pms/rate-plans').catch(() => []),
        ]);
        setRoomTypes(Array.isArray(rts) ? rts : []);
        setRooms(Array.isArray(rms) ? rms : []);
        setRatePlans(Array.isArray(rps) ? rps : []);
        if (rts && rts.length) setSelectedRtId(rts[0].id);
      } catch (err) {
        console.error('Failed to load initial onboarding data:', err);
      }
    }
    loadData();
  }, []);

  // Step 1 submit: Save property
  const handleSaveProperty = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback({ type: null, message: null });
    try {
      await apiClient('/pms/properties', {
        method: 'POST',
        data: {
          name: propertyName,
          city: propertyCity,
          country: propertyCountry,
          timezone: propertyTimezone,
          currency: propertyCurrency,
        },
      });
      if (refreshTenantContext) await refreshTenantContext();
      setFeedback({ type: 'success', message: 'Property profile saved successfully.' });
      setCurrentStep(2);
    } catch (err) {
      setFeedback({ type: 'danger', message: err.message || 'Failed to update property profile.' });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Add Room Type
  const handleAddRoomType = async (e) => {
    e.preventDefault();
    if (!newRtName.trim()) return;
    setLoading(true);
    setFeedback({ type: null, message: null });
    try {
      const res = await apiClient('/pms/room-types', {
        method: 'POST',
        data: {
          name: newRtName,
          base_rate: parseFloat(newRtRate) || 200,
          base_capacity: parseInt(newRtCapacity, 10) || 2,
          max_capacity: (parseInt(newRtCapacity, 10) || 2) + 1,
        },
      });
      setRoomTypes((prev) => [...prev, res]);
      setSelectedRtId(res.id);
      setNewRtName('');
      setFeedback({ type: 'success', message: `Room category "${res.name}" registered.` });
    } catch (err) {
      setFeedback({ type: 'danger', message: err.message || 'Failed to create room type.' });
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Add Physical Room
  const handleAddRoom = async (e) => {
    e.preventDefault();
    if (!newRoomNumber.trim()) return;
    setLoading(true);
    setFeedback({ type: null, message: null });
    try {
      const res = await apiClient('/pms/rooms', {
        method: 'POST',
        data: {
          room_number: newRoomNumber,
          floor: parseInt(newRoomFloor, 10) || 1,
          room_type_id: selectedRtId || (roomTypes[0] ? roomTypes[0].id : null),
          status: 'VACANT_CLEAN',
        },
      });
      setRooms((prev) => [...prev, res]);
      // Increment room number automatically
      const nextNum = parseInt(newRoomNumber, 10) + 1;
      setNewRoomNumber(isNaN(nextNum) ? '' : String(nextNum));
      setFeedback({ type: 'success', message: `Room ${res.room_number} added to inventory.` });
    } catch (err) {
      setFeedback({ type: 'danger', message: err.message || 'Failed to add room.' });
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Add Rate Plan
  const handleAddRatePlan = async (e) => {
    e.preventDefault();
    if (!newRpName.trim()) return;
    setLoading(true);
    setFeedback({ type: null, message: null });
    try {
      const res = await apiClient('/pms/rate-plans', {
        method: 'POST',
        data: {
          name: newRpName,
          cancellation_policy: newRpPolicy,
          discount_percent: parseFloat(newRpDiscount) || 0,
        },
      });
      setRatePlans((prev) => [...prev, res]);
      setNewRpName('');
      setFeedback({ type: 'success', message: `Rate plan "${res.name}" published.` });
    } catch (err) {
      setFeedback({ type: 'danger', message: err.message || 'Failed to publish rate plan.' });
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, label: 'Property', icon: Building2 },
    { num: 2, label: 'Room Types', icon: Layers },
    { num: 3, label: 'Rooms', icon: Hotel },
    { num: 4, label: 'Rate Plans', icon: TrendingUp },
    { num: 5, label: 'Start PMS', icon: CheckCircle2 },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 mb-2 font-bold text-xl">
            N
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Welcome to Nexgile-TravAI</h1>
          <p className="text-sm text-slate-400">Set up your property in 5 simple operational steps</p>
        </div>

        {/* 5-Step Stepper Header */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="grid grid-cols-5 gap-2 text-center">
            {steps.map((s) => {
              const Icon = s.icon;
              const isDone = currentStep > s.num;
              const isCurrent = currentStep === s.num;
              return (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => setCurrentStep(s.num)}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-lg transition-colors ${
                    isCurrent
                      ? 'bg-indigo-600 text-white'
                      : isDone
                      ? 'text-emerald-400 hover:bg-slate-800'
                      : 'text-slate-500 hover:bg-slate-800/50'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    isCurrent ? 'bg-white text-indigo-600' : isDone ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {isDone ? '✓' : s.num}
                  </div>
                  <span className="text-[11px] font-medium truncate hidden sm:inline">{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback.message && (
          <Alert variant={feedback.type}>
            {feedback.message}
          </Alert>
        )}

        {/* Step 1: Property Details */}
        {currentStep === 1 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-400" />
                Step 1: Property Profile
              </h2>
              <p className="text-xs text-slate-400 mt-1">Configure your primary property identity and operational timezone</p>
            </div>

            <form onSubmit={handleSaveProperty} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Property Name</label>
                <Input
                  value={propertyName}
                  onChange={(e) => setPropertyName(e.target.value)}
                  placeholder="e.g. Grand Resort Miami"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">City</label>
                  <Input
                    value={propertyCity}
                    onChange={(e) => setPropertyCity(e.target.value)}
                    placeholder="Miami"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Country</label>
                  <Input
                    value={propertyCountry}
                    onChange={(e) => setPropertyCountry(e.target.value)}
                    placeholder="United States"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Timezone</label>
                  <Input
                    value={propertyTimezone}
                    onChange={(e) => setPropertyTimezone(e.target.value)}
                    placeholder="America/New_York"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Operating Currency</label>
                  <Input
                    value={propertyCurrency}
                    onChange={(e) => setPropertyCurrency(e.target.value)}
                    placeholder="USD"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  loading={loading}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Save & Continue to Room Types
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Step 2: Room Types */}
        {currentStep === 2 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-400" />
                  Step 2: Room Types
                </h2>
                <p className="text-xs text-slate-400 mt-1">Define categories with standard pricing and capacity</p>
              </div>
              <Badge variant="purple">{roomTypes.length} configured</Badge>
            </div>

            {/* List of existing room types */}
            {roomTypes.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-400">Configured Room Categories:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {roomTypes.map((rt) => (
                    <div key={rt.id} className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-200 text-sm">{rt.name}</div>
                        <div className="text-xs text-slate-400 font-mono">${rt.base_rate} / night · {rt.base_capacity} Guests</div>
                      </div>
                      <Badge variant="success">Active</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add room type form */}
            <form onSubmit={handleAddRoomType} className="pt-2 border-t border-slate-800 space-y-4">
              <div className="text-xs font-semibold text-slate-300">Add a Room Category:</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs text-slate-400 mb-1">Category Name</label>
                  <Input
                    value={newRtName}
                    onChange={(e) => setNewRtName(e.target.value)}
                    placeholder="e.g. Deluxe Ocean Suite"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Base Rate ($)</label>
                  <Input
                    type="number"
                    value={newRtRate}
                    onChange={(e) => setNewRtRate(e.target.value)}
                    placeholder="250"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button
                  type="submit"
                  variant="secondary"
                  size="sm"
                  loading={loading}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Add Category
                </Button>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentStep(1)}
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => setCurrentStep(3)}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Continue to Rooms
                  </Button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Step 3: Physical Rooms */}
        {currentStep === 3 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Hotel className="w-5 h-5 text-indigo-400" />
                  Step 3: Physical Rooms
                </h2>
                <p className="text-xs text-slate-400 mt-1">Add physical units to your PMS inventory</p>
              </div>
              <Badge variant="purple">{rooms.length} registered</Badge>
            </div>

            {/* List of existing rooms */}
            {rooms.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-400">Inventory Units:</div>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 bg-slate-950/70 border border-slate-800 rounded-lg">
                  {rooms.map((rm) => (
                    <div key={rm.id} className="px-2.5 py-1 bg-slate-800 rounded text-xs font-mono font-medium text-slate-200 border border-slate-700 flex items-center gap-1.5">
                      <span>Room {rm.room_number}</span>
                      <span className="text-[10px] text-emerald-400">●</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Room form */}
            <form onSubmit={handleAddRoom} className="pt-2 border-t border-slate-800 space-y-4">
              <div className="text-xs font-semibold text-slate-300">Add a Room:</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Room #</label>
                  <Input
                    value={newRoomNumber}
                    onChange={(e) => setNewRoomNumber(e.target.value)}
                    placeholder="101"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Floor</label>
                  <Input
                    type="number"
                    value={newRoomFloor}
                    onChange={(e) => setNewRoomFloor(e.target.value)}
                    placeholder="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Room Category</label>
                  <select
                    value={selectedRtId}
                    onChange={(e) => setSelectedRtId(e.target.value)}
                    className="w-full h-10 rounded-lg bg-slate-950/70 border border-slate-700 text-slate-100 text-xs px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {roomTypes.map((rt) => (
                      <option key={rt.id} value={rt.id}>
                        {rt.name} (${rt.base_rate})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button
                  type="submit"
                  variant="secondary"
                  size="sm"
                  loading={loading}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Add Room
                </Button>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentStep(2)}
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => setCurrentStep(4)}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Continue to Rate Plans
                  </Button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Step 4: Rate Plans */}
        {currentStep === 4 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-400" />
                  Step 4: Rate Plans
                </h2>
                <p className="text-xs text-slate-400 mt-1">Configure booking policies and pricing modifiers</p>
              </div>
              <Badge variant="purple">{ratePlans.length} plans</Badge>
            </div>

            {/* List of existing plans */}
            {ratePlans.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-400">Active Rate Plans:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ratePlans.map((rp) => (
                    <div key={rp.id} className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-200 text-sm">{rp.name}</div>
                        <div className="text-xs text-slate-400 font-mono">Policy: {rp.cancellation_policy}</div>
                      </div>
                      <Badge variant="primary">{rp.code}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Rate Plan form */}
            <form onSubmit={handleAddRatePlan} className="pt-2 border-t border-slate-800 space-y-4">
              <div className="text-xs font-semibold text-slate-300">Publish a Rate Plan:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Plan Name</label>
                  <Input
                    value={newRpName}
                    onChange={(e) => setNewRpName(e.target.value)}
                    placeholder="e.g. Non-Refundable Advance Purchase"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Cancellation Policy</label>
                  <select
                    value={newRpPolicy}
                    onChange={(e) => setNewRpPolicy(e.target.value)}
                    className="w-full h-10 rounded-lg bg-slate-950/70 border border-slate-700 text-slate-100 text-xs px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="FLEXIBLE_24H">Flexible (Cancel up to 24h before)</option>
                    <option value="NON_REFUNDABLE">Non-Refundable (100% deposit)</option>
                    <option value="MODERATE_7D">Moderate (Cancel up to 7 days before)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button
                  type="submit"
                  variant="secondary"
                  size="sm"
                  loading={loading}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Publish Plan
                </Button>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentStep(3)}
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => setCurrentStep(5)}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Continue to Launch
                  </Button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Step 5: Start using PMS */}
        {currentStep === 5 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 shadow-xl space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-100">Your Property is Ready for Operations</h2>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Initial property profile, room categories, inventory units, and rate policies have been persisted to PostgreSQL.
              </p>
            </div>

            {/* Checklist items */}
            <div className="max-w-md mx-auto bg-slate-950/70 border border-slate-800 rounded-lg p-4 space-y-2.5 text-left text-xs">
              <div className="flex items-center gap-2 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Property Profile Configured</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Room Categories Active ({roomTypes.length})</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Physical Inventory Units Registered ({rooms.length})</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Rate Plans & Policies Published ({ratePlans.length})</span>
              </div>
            </div>

            {/* Launch buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                variant="primary"
                onClick={() => onNavigate(ROUTES.FRONT_DESK)}
                className="w-full sm:w-auto"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Open Front Desk Operations
              </Button>
              <Button
                variant="secondary"
                onClick={() => onNavigate(ROUTES.DASHBOARD)}
                className="w-full sm:w-auto"
              >
                Go to Operations Dashboard
              </Button>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="text-center text-[11px] text-slate-600 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/70" />
          <span>PostgreSQL Multi-Tenant Isolation Active</span>
        </div>
      </div>
    </div>
  );
}
