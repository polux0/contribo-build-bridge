# Application Flow Implementation

This document describes the implementation of the new application flow that automatically handles wallet creation and connection when users apply for opportunities.

## Overview

The new application flow implements the following sequence:

1. **Detect login** via `supabase.auth.onAuthStateChange` and `getSession()` on mount
2. **Create wallet in background** by calling `createWallet()` (embedded) — no modal required
3. **When user clicks apply**:
   - If you want to offer MetaMask first, call `connectWallet()`
   - If the user closes/ignores it, fallback to `createWallet()` (using Privy) after a small delay
4. **Checks requirements**: `hasGithub` (Supabase) + `hasWallet` (Privy)
5. **Tries external first, silently falls back to embedded**
6. **Opens `/apply` route** for the application process

## Implementation Details

### 1. Updated UnifiedAuthContext

The `UnifiedAuthContext` has been enhanced with new methods and functionality:

#### New Interface Properties
```typescript
interface UnifiedAuthContextType {
  // ... existing properties
  createWallet: () => Promise<boolean>;
  connectWallet: () => Promise<boolean>;
  hasGithub: boolean;
  hasWallet: boolean;
  handleApply: () => Promise<void>;
}
```

#### Background Wallet Creation
```typescript
// Background wallet creation for Supabase users
useEffect(() => {
  if (isSupabaseUser && user && !user.wallet_address && privyReady) {
    // Create embedded wallet in background for Supabase users
    createWallet().catch((error) => {
      console.error('Background wallet creation failed:', error);
    });
  }
}, [isSupabaseUser, user, privyReady, createWallet]);
```

#### Application Flow Handler
```typescript
const handleApply = async (): Promise<void> => {
  if (!user) {
    toast({
      title: "Authentication required",
      description: "Please sign in to apply for opportunities.",
      variant: "destructive",
    });
    return;
  }

  // Check if user has GitHub and wallet
  if (!hasGithub) {
    toast({
      title: "GitHub required",
      description: "Please connect your GitHub account to apply.",
      variant: "destructive",
    });
    return;
  }

  if (!hasWallet) {
    // Try external wallet first (MetaMask)
    const externalConnected = await connectExternalWallet();
    
    if (!externalConnected) {
      // Fallback to embedded wallet after small delay
      setTimeout(async () => {
        await createEmbeddedWallet();
      }, 1000);
    }
  }

  // Navigate to apply route
  window.location.href = '/apply';
};
```

### 2. New useApplicationFlow Hook

A dedicated hook provides a clean interface for the application flow:

```typescript
export const useApplicationFlow = () => {
  const {
    user, 
    loading, 
    hasGithub, 
    hasWallet, 
    canApply, 
    requirementsStatus,
    statusMessage,
    handleApply,
    createWallet,
    connectWallet,
  } = useUnifiedAuth();

  // ... implementation details

  return {
    // State
    user,
    loading,
    hasGithub,
    hasWallet,
    
    // Computed values
    canApply: canApply(),
    requirementsStatus: getRequirementsStatus(),
    statusMessage: getStatusMessage(),
    
    // Actions
    handleApply,
    createWallet: createWalletManually,
    connectWallet: connectWalletManually,
  };
};
```

### 3. Updated OpportunityCard Component

The `OpportunityCard` component now uses the new application flow:

```typescript
const OpportunityCard: React.FC<OpportunityCardProps> = ({ opportunity }) => {
  const { handleApply, canApply, statusMessage } = useApplicationFlow();

  const handleApplyClick = async () => {
    await handleApply();
  };

  return (
    // ... card content
    <Button 
      onClick={handleApplyClick}
      disabled={!canApply}
      className="flex-1 bg-contribo-black hover:bg-gray-800 disabled:bg-gray-400"
      title={statusMessage}
    >
      <GitBranch className="w-4 h-4 mr-2" />
      Apply Now
    </Button>
  );
};
```

### 4. New Apply Page

A dedicated `/apply` route handles the application process:

```typescript
const Apply: React.FC = () => {
  const navigate = useNavigate();
  const { 
    user, 
    loading, 
    hasGithub, 
    hasWallet, 
    canApply, 
    requirementsStatus,
    statusMessage 
  } = useApplicationFlow();

  useEffect(() => {
    // Redirect if user can't apply
    if (!loading && !canApply) {
      toast({
        title: "Requirements not met",
        description: statusMessage,
        variant: "destructive",
      });
      navigate('/opportunities');
    }
  }, [loading, canApply, statusMessage, navigate]);

  // ... render application requirements and user info
};
```

## User Flow

### 1. Authentication
- User signs in via GitHub, Google, or LinkedIn
- Supabase authentication is detected via `onAuthStateChange`
- User profile is created/updated in the database

### 2. Background Wallet Creation
- For Supabase users, an embedded wallet is automatically created in the background
- No user interaction required
- Wallet information is stored in the user profile

### 3. Application Process
When user clicks "Apply Now":

1. **Check Requirements**:
   - User must be authenticated
   - User must have GitHub account connected
   - Wallet will be created/connected automatically if needed

2. **Wallet Connection Flow**:
   - Try to connect external wallet (MetaMask) first
   - If user cancels or no external wallet available, create embedded wallet
   - Small delay (1 second) before fallback to embedded wallet

3. **Navigation**:
   - Redirect to `/apply` route
   - Show application requirements status
   - Allow user to proceed with application

### 4. Application Page
- Displays user requirements status
- Shows user profile information
- Provides clear next steps for application
- Handles edge cases (no authentication, missing requirements)

## Database Schema

The implementation uses the existing `profiles` table with wallet support:

```sql
-- Wallet support fields (already added via migration)
ALTER TABLE public.profiles 
ADD COLUMN wallet_address text NULL,
ADD COLUMN wallet_type text NULL,
ADD COLUMN privy_user_id text NULL;
```

## Configuration

### Privy Configuration
The implementation uses the existing Privy configuration with embedded wallets enabled:

```typescript
export const privyConfig: PrivyConfig = {
  config: {
    embeddedWallets: {
      createOnLogin: 'users-without-wallets',
      noPromptOnSignature: true,
    },
    // ... other config
  },
};
```

### Environment Variables
Ensure the following environment variables are set:

```env
# Privy Web3 Authentication
VITE_PRIVY_APP_ID=your_privy_app_id_here

# Supabase OAuth (for GitHub, Google, LinkedIn)
SUPABASE_AUTH_EXTERNAL_GITHUB_CLIENT_ID=your_github_client_id
SUPABASE_AUTH_EXTERNAL_GITHUB_SECRET=your_github_client_secret
# ... other OAuth providers
```

## Error Handling

The implementation includes comprehensive error handling:

1. **Authentication Errors**: Toast notifications for failed sign-ins
2. **Wallet Creation Errors**: Graceful fallback to embedded wallets
3. **Requirements Validation**: Clear messages about missing requirements
4. **Network Errors**: Retry mechanisms and user-friendly error messages

## Testing

To test the implementation:

1. **Start the application**: `npm run dev:local`
2. **Sign in with GitHub**: Verify wallet is created in background
3. **Click "Apply Now"**: Test the application flow
4. **Check requirements**: Verify GitHub and wallet status
5. **Test fallback**: Try without MetaMask to test embedded wallet creation

## Future Enhancements

Potential improvements for the application flow:

1. **Wallet Selection**: Allow users to choose preferred wallet type
2. **Application Tracking**: Track application status and history
3. **Multi-chain Support**: Support for different blockchain networks
4. **Application Templates**: Pre-filled application forms
5. **Notification System**: Updates on application status

## Troubleshooting

### Common Issues

1. **Wallet not created**: Check Privy configuration and network connectivity
2. **GitHub not connected**: Verify OAuth setup and user permissions
3. **Application flow stuck**: Check browser console for errors
4. **Requirements not met**: Verify user profile data in database

### Debug Information

Enable debug logging in development:

```typescript
// In privy-config.ts
export const privyConfig: PrivyConfig = {
  ...(import.meta.env.DEV && {
    debug: true,
  }),
  // ... rest of config
};
```

This implementation provides a seamless user experience for applying to opportunities while automatically handling the complexity of wallet creation and connection. 