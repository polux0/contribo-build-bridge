# Privy Web3 Authentication Integration

This document explains how to set up and use Privy for Web3 authentication in the Contribo application.

## Overview

Privy provides a unified authentication solution that supports both traditional social logins (GitHub, Google, LinkedIn) and Web3 wallet connections (MetaMask, Rainbow, WalletConnect, etc.). This integration allows users to:

1. **Social Authentication**: Sign in with GitHub, Google, or LinkedIn
2. **Web3 Authentication**: Connect with MetaMask, Rainbow, WalletConnect, and other wallets
3. **Unified User Experience**: All authentication methods work seamlessly together
4. **Profile Management**: User information is stored consistently regardless of login method

## Features

### Supported Authentication Methods

#### Social Logins
- **GitHub**: OAuth integration for developer profiles
- **Google**: Standard Google OAuth
- **LinkedIn**: Professional network integration

#### Web3 Wallets
- **MetaMask**: Most popular Ethereum wallet
- **Rainbow**: Mobile-first Ethereum wallet
- **WalletConnect**: Multi-wallet connection protocol
- **Coinbase Wallet**: Exchange-based wallet
- **Embedded Wallets**: Privy's built-in wallet solution

### User Profile Information

Regardless of authentication method, the system captures:

- **Email**: From social logins or wallet-associated emails
- **Name**: From social profiles or wallet display names
- **Avatar**: Profile pictures from social accounts
- **GitHub Username**: For developer verification
- **LinkedIn Profile**: Professional network link
- **Wallet Address**: For Web3 users
- **Wallet Type**: Type of wallet used (metamask, rainbow, etc.)

## Setup Instructions

### 1. Create Privy App

1. Go to [Privy Console](https://console.privy.io/)
2. Click "Create App"
3. Fill in app details:
   - **App Name**: `Contribo`
   - **Description**: `Technical hiring platform with Web3 integration`
4. Copy your **App ID** (you'll need this for environment variables)

### 2. Configure Authentication Methods

In the Privy Console, enable the following authentication methods:

#### Social Logins
- **GitHub**: Enable and configure OAuth app
- **Google**: Enable and configure OAuth credentials
- **LinkedIn**: Enable and configure OAuth app

#### Web3 Wallets
- **MetaMask**: Enable
- **Rainbow**: Enable
- **WalletConnect**: Enable
- **Coinbase Wallet**: Enable
- **Embedded Wallets**: Enable with "Create on login" option

### 3. Environment Variables

Add the following to your `.env.local`:

```env
# Privy Web3 Authentication
VITE_PRIVY_APP_ID=your_privy_app_id_here
```

### 4. Database Migration

Run the database migration to add wallet support:

```bash
supabase db push
```

This adds the following fields to the `profiles` table:
- `wallet_address`: Ethereum wallet address
- `wallet_type`: Type of wallet used
- `privy_user_id`: Privy's unique user identifier

## Usage

### For Users

#### Social Login
1. Click "Sign In" in the header
2. Choose a social provider (GitHub, Google, LinkedIn)
3. Complete OAuth flow
4. User profile is automatically created/updated

#### Web3 Login
1. Click "Sign In" in the header
2. Click "Connect with Web3 Wallet"
3. Choose your preferred wallet
4. Approve the connection
5. User profile is created with wallet information

### For Developers

#### Authentication Context

The app uses a unified authentication context that handles both social and Web3 authentication:

```typescript
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';

const { user, loading, signOut, signInWithSupabase, signInWithPrivy } = useUnifiedAuth();
```

#### User Object Structure

```typescript
interface UnifiedUser {
  id: string;
  email?: string | null;
  name?: string | null;
  avatar_url?: string | null;
  github_username?: string | null;
  linkedin_profile?: string | null;
  wallet_address?: string | null;
  wallet_type?: string | null;
  auth_provider: 'supabase' | 'privy';
  privy_user_id?: string | null;
}
```

#### Authentication Methods

```typescript
// Social authentication
await signInWithSupabase('github');
await signInWithSupabase('google');
await signInWithSupabase('linkedin_oidc');

// Web3 authentication
signInWithPrivy();

// Sign out (works for both types)
await signOut();
```

## Database Schema

### Profiles Table

The `profiles` table has been extended to support both authentication types:

```sql
CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NULL, -- For Supabase users
  privy_user_id text NULL, -- For Privy users
  email text NULL,
  name text NULL,
  github_username text NULL,
  linkedin_profile text NULL,
  avatar_url text NULL,
  wallet_address text NULL,
  wallet_type text NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_user_id_key UNIQUE (user_id),
  CONSTRAINT profiles_privy_user_id_key UNIQUE (privy_user_id)
);
```

### Key Features

- **Dual ID Support**: `user_id` for Supabase users, `privy_user_id` for Web3 users
- **Wallet Information**: Stores wallet address and type for Web3 users
- **Unified Profile**: Same profile structure regardless of authentication method
- **Unique Constraints**: Prevents duplicate profiles for each user type

## Security Considerations

### Wallet Security
- Users maintain full control of their private keys
- No private key storage in the application
- Wallet connections are temporary and can be revoked

### Data Privacy
- Only public wallet addresses are stored
- Social profile data is limited to public information
- Users can disconnect wallets at any time

### Authentication Flow
- OAuth tokens are handled securely by Privy
- No sensitive credentials stored in the application
- Session management follows security best practices

## Troubleshooting

### Common Issues

#### Wallet Connection Fails
- Ensure MetaMask/Rainbow is installed
- Check if wallet is on the correct network (Ethereum mainnet)
- Verify wallet is unlocked

#### Social Login Issues
- Check OAuth app configuration in Privy Console
- Verify redirect URIs are correct
- Ensure environment variables are set

#### Profile Not Created
- Check database migration was applied
- Verify Supabase connection
- Check browser console for errors

### Debug Mode

Enable debug logging by adding to your environment:

```env
VITE_DEBUG_AUTH=true
```

This will log authentication events to the browser console.

## Future Enhancements

### Planned Features
- **Multi-chain Support**: Support for Polygon, Optimism, Arbitrum
- **NFT Verification**: Verify NFT ownership for special features
- **DeFi Integration**: Connect to DeFi protocols for reputation
- **Decentralized Identity**: Support for DIDs and verifiable credentials

### API Extensions
- **Wallet Balance**: Display user's token balances
- **Transaction History**: Show relevant blockchain activity
- **Smart Contract Integration**: Direct interaction with blockchain contracts

## Support

For technical support:
1. Check the [Privy Documentation](https://docs.privy.io/)
2. Review browser console for error messages
3. Verify environment configuration
4. Test with different authentication methods

For user support:
1. Provide clear instructions for wallet setup
2. Offer alternative authentication methods
3. Guide users through the connection process 