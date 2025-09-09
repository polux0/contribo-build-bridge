import { devLog } from '@/lib/utils';
import { config } from './config';

// Privy configuration for hiring page (Google, LinkedIn, GitHub)
const getPrivyAppId = () => {
  // In development, .env.local takes precedence (Vite behavior)
  // In production, .env is used
  return import.meta.env.VITE_PRIVY_APP_ID || '';
};

const privyAppId = getPrivyAppId();
devLog('=== Hiring Privy Config ===');
devLog('Environment:', config.env);
devLog('Selected Privy App ID:', privyAppId);

export const privyConfigHiring = {
  appId: privyAppId,
  config: {
    loginMethods: ['google', 'linkedin', 'github'],
    google: { scope: 'email profile' },
    linkedin: { scope: 'r_liteprofile r_emailaddress' },
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
