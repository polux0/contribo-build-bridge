// Privy configuration for opportunities page (GitHub only)
export const privyConfigOpportunities = {
  appId: import.meta.env.VITE_PRIVY_APP_ID || '',
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
