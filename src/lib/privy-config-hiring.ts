// Privy configuration for hiring page (Google, LinkedIn, GitHub)
export const privyConfigHiring = {
  appId: import.meta.env.VITE_PRIVY_APP_ID || '',
  config: {
    loginMethods: ['google', 'linkedin', 'github'],
    google: { scope: 'email profile' },
    linkedin: { scope: 'r_liteprofile r_emailaddress' },
    github: { scope: 'read:user user:email' },
    appearance: {
      theme: 'light',
      accentColor: '#000000',
      showWalletLoginFirst: false,
    },
  },
};
