import { useAuthContext } from '../store/authContext';

export function useAuth() {
  const context = useAuthContext();
  return {
    user: context.user,
    token: context.token,
    isAuthenticated: context.isAuthenticated,
    loading: context.loading,
    error: context.error,
    login: context.login,
    logout: context.logout,
    switchPersona: context.switchPersona,
    switchContext: context.switchContext,
    changePassword: context.changePassword,
    sessions: context.sessions,
    revokeSession: context.revokeSession,
    revokeAllSessions: context.revokeAllSessions,
    refreshProfile: context.refreshProfile,
    hasPermission: context.hasPermission,
    hasRole: context.hasRole,
    organizations: context.organizations,
    properties: context.properties,
    activeOrg: context.activeOrg,
    activeProperty: context.activeProperty,
  };
}
