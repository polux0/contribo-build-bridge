import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { PrivyProvider } from '@privy-io/react-auth';
import { privyConfigOpportunities } from '@/lib/privy-config-opportunities';
import { privyConfigHiring } from '@/lib/privy-config-hiring';

interface DynamicPrivyProviderProps {
  children: React.ReactNode;
}

const DynamicPrivyProvider: React.FC<DynamicPrivyProviderProps> = ({ children }) => {
  const location = useLocation();
  const [currentConfig, setCurrentConfig] = useState(privyConfigOpportunities);

  useEffect(() => {
    // Determine which config to use based on the current route
    if (location.pathname === '/hiring') {
      setCurrentConfig(privyConfigHiring);
    } else {
      setCurrentConfig(privyConfigOpportunities);
    }
  }, [location.pathname]);

  return (
    <PrivyProvider
      appId={currentConfig.appId}
      config={currentConfig.config}
    >
      {children}
    </PrivyProvider>
  );
};

export default DynamicPrivyProvider;
