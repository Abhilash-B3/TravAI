import React from 'react';
import { AuthProvider } from '../store/authContext';
import { NotificationProvider } from '../store/notificationContext';

export function Providers({ children }) {
  return (
    <AuthProvider>
      <NotificationProvider>
        {children}
      </NotificationProvider>
    </AuthProvider>
  );
}
