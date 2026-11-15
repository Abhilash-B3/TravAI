import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient, ApiError } from '../api/client';

const AuthContext = createContext(null);

export const SEED_PERSONAS = [
  {
    id: 'persona-chain-admin',
    email: 'admin@acmehotels.com',
    name: 'Sarah Connor',
    roleTitle: 'Chain Administrator (Organization Scope)',
    roleCode: 'ChainAdmin',
    orgName: 'Acme Hospitality Group',
    defaultOrgId: '11111111-1111-1111-1111-111111111111',
    defaultPropId: '22222222-2222-2222-2222-222222222222',
  },
  {
    id: 'persona-superadmin',
    email: 'superadmin@travai.nexgile.com',
    name: 'System Superadmin',
    roleTitle: 'Platform Administrator (Global Scope)',
    roleCode: 'PlatformAdmin',
    orgName: 'Global Platform',
    defaultOrgId: '11111111-1111-1111-1111-111111111111',
    defaultPropId: '22222222-2222-2222-2222-222222222222',
  },
  {
    id: 'persona-prop-admin',
    email: 'propadmin@grandresort.com',
    name: 'David Miller',
    roleTitle: 'Property Administrator (Grand Resort & Spa)',
    roleCode: 'PropertyAdmin',
    orgName: 'Acme Hospitality Group',
    defaultOrgId: '11111111-1111-1111-1111-111111111111',
    defaultPropId: '22222222-2222-2222-2222-222222222222',
  },
  {
    id: 'persona-frontdesk',
    email: 'frontdesk@grandresort.com',
    name: 'Emily Clark',
    roleTitle: 'Front Desk Lead (Grand Resort & Spa)',
    roleCode: 'FrontDesk',
    orgName: 'Acme Hospitality Group',
    defaultOrgId: '11111111-1111-1111-1111-111111111111',
    defaultPropId: '22222222-2222-2222-2222-222222222222',
  },
  {
    id: 'persona-revenue',
    email: 'revenue@acmehotels.com',
    name: 'Alex Vance',
    roleTitle: 'Revenue Director (Acme Group)',
    roleCode: 'RevenueManager',
    orgName: 'Acme Hospitality Group',
    defaultOrgId: '11111111-1111-1111-1111-111111111111',
    defaultPropId: '22222222-2222-2222-2222-222222222222',
  },
  {
    id: 'persona-corp',
    email: 'travelmgr@techcorp.com',
    name: 'Jordan Lee',
    roleTitle: 'Corporate Travel Lead (TechCorp Global)',
    roleCode: 'CorporateTravelManager',
    orgName: 'TechCorp Global Scope',
    defaultOrgId: '11111111-1111-1111-1111-111111111111',
    defaultPropId: null,
  },
  {
    id: 'persona-traveler',
    email: 'traveler@example.com',
    name: 'Michael Scott',
    roleTitle: 'Leisure Traveler (Self Scope)',
    roleCode: 'LeisureTraveler',
    orgName: 'Consumer Marketplace',
    defaultOrgId: null,
    defaultPropId: null,
  },
];

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('nexgile_access_token') || null);
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('nexgile_refresh_token') || null);
  const [user, setUser] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [properties, setProperties] = useState([]);
  const [activeOrgId, setActiveOrgId] = useState(null);
  const [activePropertyId, setActivePropertyId] = useState(null);
  const [activeCorporateId, setActiveCorporateId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync token to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('nexgile_access_token', token);
    } else {
      localStorage.removeItem('nexgile_access_token');
    }
  }, [token]);

  useEffect(() => {
    if (refreshToken) {
      localStorage.setItem('nexgile_refresh_token', refreshToken);
    } else {
      localStorage.removeItem('nexgile_refresh_token');
    }
  }, [refreshToken]);

  // Load user profile & authorized hierarchy
  const loadProfile = useCallback(async (authToken) => {
    try {
      const profile = await apiClient('/api/v1/me', { token: authToken });
      setUser(profile);

      // Fetch authorized orgs and properties
      const [orgs, props] = await Promise.all([
        apiClient('/api/v1/me/organizations', { token: authToken }).catch(() => []),
        apiClient('/api/v1/me/properties', { token: authToken }).catch(() => []),
      ]);

      setOrganizations(orgs || []);
      setProperties(props || []);

      const primaryOrgId = profile.active_organization_id || (orgs && orgs[0]?.id) || null;
      const primaryPropId = profile.active_property_id || (props && props[0]?.id) || null;
      const primaryCorpId = profile.active_corporate_account_id || null;

      setActiveOrgId(primaryOrgId);
      setActivePropertyId(primaryPropId);
      setActiveCorporateId(primaryCorpId);

      // Load sessions
      const activeSessions = await apiClient('/api/v1/auth/sessions', { token: authToken }).catch(() => []);
      setSessions(activeSessions || []);

      setError(null);
    } catch (err) {
      console.warn('Profile resolution failed:', err.message);
      // If token expired, clear
      if (err.status === 401) {
        setToken(null);
        setRefreshToken(null);
        setUser(null);
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Standard Login
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient('/api/v1/auth/login', {
        method: 'POST',
        data: { email, password },
      });
      setToken(res.access_token);
      setRefreshToken(res.refresh_token);
      await loadProfile(res.access_token);
      return res;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  // Switch persona using seed credentials
  const switchPersona = async (email) => {
    return login(email, 'Password123!@#');
  };

  // Switch active organization / property with server-side validation
  const switchContext = async (orgId, propId = null, corpId = null) => {
    if (!token) return;
    try {
      const res = await apiClient('/api/v1/me/context', {
        method: 'POST',
        token,
        data: {
          organization_id: orgId,
          property_id: propId,
          corporate_account_id: corpId,
        },
      });

      setActiveOrgId(orgId);
      setActivePropertyId(propId);
      setActiveCorporateId(corpId);

      // Re-fetch properties for the selected org
      const updatedProps = await apiClient('/api/v1/me/properties', {
        token,
        params: { organization_id: orgId },
      }).catch(() => []);
      setProperties(updatedProps || []);

      return res;
    } catch (err) {
      throw err;
    }
  };

  // Logout
  const logout = async () => {
    if (token) {
      try {
        await apiClient('/api/v1/auth/logout', {
          method: 'POST',
          token,
        });
      } catch (e) {
        // Ignore logout errors
      }
    }
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    setOrganizations([]);
    setProperties([]);
    setActiveOrgId(null);
    setActivePropertyId(null);
  };

  // Change Password
  const changePassword = async (currentPassword, newPassword) => {
    if (!token) throw new Error('Not authenticated');
    return apiClient('/api/v1/auth/change-password', {
      method: 'POST',
      token,
      data: {
        current_password: currentPassword,
        new_password: newPassword,
      },
    });
  };

  // Revoke Session
  const revokeSession = async (sessionId) => {
    if (!token) return;
    await apiClient(`/api/v1/auth/sessions/${sessionId}`, {
      method: 'DELETE',
      token,
    });
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  // Revoke All Sessions
  const revokeAllSessions = async () => {
    if (!token) return;
    await apiClient('/api/v1/auth/sessions/revoke-all', {
      method: 'POST',
      token,
    });
    setSessions((prev) => prev.filter((s) => s.is_current));
  };

  // Granular RBAC checks
  const hasPermission = (permissionCode) => {
    if (!user) return false;
    if (user.is_superadmin || user.permissions?.includes('*')) return true;
    return user.permissions?.includes(permissionCode);
  };

  const hasRole = (roleCode) => {
    if (!user) return false;
    if (user.is_superadmin) return true;
    return user.roles?.includes(roleCode);
  };

  // Initial authentication boot
  useEffect(() => {
    if (token) {
      loadProfile(token);
    } else {
      setLoading(false);
    }
  }, []);

  const activeOrg = organizations.find((o) => o.id === activeOrgId) || null;
  const activeProperty = properties.find((p) => p.id === activePropertyId) || null;

  const value = {
    token,
    user,
    organizations,
    properties,
    activeOrgId,
    activePropertyId,
    activeCorporateId,
    activeOrg,
    activeProperty,
    sessions,
    loading,
    error,
    login,
    logout,
    switchPersona,
    switchContext,
    changePassword,
    revokeSession,
    revokeAllSessions,
    refreshProfile: () => loadProfile(token),
    hasPermission,
    hasRole,
    isAuthenticated: Boolean(user),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
