import React from 'react';
import { ClientPlatformProvider, useClientPlatform } from './context/ClientPlatformContext';
import { ClientAuthGate } from './components/ClientAuthGate';
import { DynamicClientShell } from './components/DynamicClientShell';

const ClientPlatformRunner: React.FC = () => {
  const { session } = useClientPlatform();

  if (!session.isAuthenticated) {
    return <ClientAuthGate />;
  }

  return <DynamicClientShell />;
};

export const ClientReceiverPlatformStandaloneView: React.FC = () => {
  return (
    <ClientPlatformProvider>
      <ClientPlatformRunner />
    </ClientPlatformProvider>
  );
};
