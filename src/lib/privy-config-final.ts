import { PrivyClientConfig } from '@privy-io/react-auth';
import { devLog } from '@/lib/utils';

devLog('=== Final Privy Config ===');
devLog('App ID:', import.meta.env.VITE_PRIVY_APP_ID);

export const privyConfigFinal = {
  appId: import.meta.env.VITE_PRIVY_APP_ID || '',
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