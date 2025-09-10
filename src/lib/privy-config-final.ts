import { PrivyClientConfig } from '@privy-io/react-auth';
import { devLog } from '@/lib/utils';
import { config } from './config';

devLog('=== Final Privy Config ===');
devLog('Environment:', config.env);
devLog('Is Development:', config.isDevelopment);
devLog('Is Production:', config.isProduction);

// Use the same environment detection pattern as other services
const getPrivyAppId = () => {
  // In development, .env.local takes precedence (Vite behavior)
  // In production, .env is used
  // This matches your existing Supabase pattern
  return import.meta.env.VITE_PRIVY_APP_ID || '';
};

const privyAppId = getPrivyAppId();
devLog('Selected Privy App ID:', privyAppId);

export const privyConfigFinal = {
  appId: privyAppId,
  config: {
    embeddedWallets: { 
      ethereum: { 
        createOnLogin: 'all-users' 
      } 
    },
    appearance: { 
      showWalletLoginFirst: false,
    }
  },
}; 