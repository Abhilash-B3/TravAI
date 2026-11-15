import React from 'react';
import { Providers } from './providers';
import { AppRoutes } from '../routes/AppRoutes';

export function App() {
  return (
    <Providers>
      <AppRoutes />
    </Providers>
  );
}

export default App;
