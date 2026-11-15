import { apiClient } from './client';

export const apiService = {
  // System Health
  getHealth: () => apiClient('/health'),
  getHealthReady: () => apiClient('/health/ready'),
  getSystemInfo: () => apiClient('/system/info'),

  // Identity & Auth Foundation
  getUserContext: (token) => apiClient('/auth/context', { token }),
  
  // Tenant Context Resolution
  getTenantContext: (options = {}) => apiClient('/tenancy/context', options),
};
