import { devLog } from '@/lib/utils';
import { config } from './config';

// Privy configuration for opportunities page (GitHub only)
const getPrivyAppId = () => {
  // In development, .env.local takes precedence (Vite behavior)
  // In production, .env is used
  return import.meta.env.VITE_PRIVY_APP_ID || '';
};

const privyAppId = getPrivyAppId();
devLog('=== Opportunities Privy Config ===');
devLog('Environment:', config.env);
devLog('Selected Privy App ID:', privyAppId);

export const privyConfigOpportunities = {
  appId: privyAppId,
  config: {
    loginMethods: ['github'],
    github: { scope: 'read:user user:email' },
    embeddedWallets: { 
      ethereum: { 
        createOnLogin: 'all-users' 
      } 
    },
    appearance: {
      theme: 'light',
      accentColor: '#000000',
      showWalletLoginFirst: false,
    },
  },
};
