import { PrivyClientConfig } from '@privy-io/react-auth';

console.log('=== Final Privy Config ===');
console.log('App ID:', import.meta.env.VITE_PRIVY_APP_ID);

export const privyConfigFinal = {
  appId: import.meta.env.VITE_PRIVY_APP_ID || '',
  config: {
    embeddedWallets: { 
      ethereum: { 
        createOnLogin: 'users-without-wallets' 
      } 
    },
    appearance: { 
      walletList: ['metamask', 'coinbase_wallet', 'walletconnect', 'rainbow'] 
    },
    externalWallets: { 
      walletConnect: { 
        projectId: import.meta.env.VITE_WC_PROJECT_ID 
      } 
    }
  },
}; 