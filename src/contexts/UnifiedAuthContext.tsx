import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { usePrivy } from '@privy-io/react-auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { config } from '@/lib/config';
import { trackPH } from '@/lib/posthog-script';

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

interface UnifiedAuthContextType {
  user: UnifiedUser | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signInWithPrivy: (provider?: 'github') => void;
  isPrivyUser: boolean;
  isSupabaseUser: boolean;
  // New methods for wallet and application flow
  createWallet: () => Promise<boolean>;
  connectWallet: () => Promise<boolean>;
  hasGithub: boolean;
  hasWallet: boolean;
  handleApply: (opportunity?: { id: string; title: string }) => Promise<void>;
  updateUserEmail: (email: string) => Promise<boolean>;
}

const UnifiedAuthContext = createContext<UnifiedAuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  signInWithPrivy: () => {},
  isPrivyUser: false,
  isSupabaseUser: false,
  createWallet: async () => false,
  connectWallet: async () => false,
  hasGithub: false,
  hasWallet: false,
  handleApply: async () => {},
  updateUserEmail: async () => false,
});

export const useUnifiedAuth = () => {
  const context = useContext(UnifiedAuthContext);
  if (!context) {
    throw new Error('useUnifiedAuth must be used within a UnifiedAuthProvider');
  }
  return context;
};

export const UnifiedAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UnifiedUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPrivyUser, setIsPrivyUser] = useState(false);
  const [isSupabaseUser, setIsSupabaseUser] = useState(false);
  const [intendedDestination, setIntendedDestination] = useState<string | null>(null);
  const [hasAuthenticated, setHasAuthenticated] = useState(false);

  console.log('UnifiedAuthProvider: Initializing with loading:', loading);
  console.log('Config check:', { 
    supabaseUrl: !!config.supabase.url, 
    supabaseKey: !!config.supabase.anonKey,
    privyAppId: !!import.meta.env.VITE_PRIVY_APP_ID 
  });

  // Privy hooks
  const {
    authenticated: privyAuthenticated,
    user: privyUser,
    login: privyLogin,
    logout: privyLogout,
    ready: privyReady,
    createWallet,
    connectWallet,
  } = usePrivy();

  console.log('Privy state:', { privyReady, privyAuthenticated, hasUser: !!privyUser });

  // Immediate loading state check
  useEffect(() => {
    if (privyReady && !privyAuthenticated) {
      console.log('Privy ready and no user authenticated, setting loading to false immediately');
      setLoading(false);
    }
  }, [privyReady, privyAuthenticated]);

  // Handle case where user is already authenticated but Privy is not ready
  useEffect(() => {
    if (session && !privyReady) {
      console.log('User authenticated with Supabase but Privy not ready, setting loading to false');
      setLoading(false);
    }
  }, [session, privyReady]);

  // Computed properties for application requirements
  const hasGithub = Boolean(user?.github_username);
  const hasWallet = Boolean(user?.wallet_address);

  // Fetch user profile from database
  const fetchUserProfile = useCallback(async (userId: string, authProvider: 'supabase' | 'privy') => {
    try {
      console.log('🔍 fetchUserProfile: Starting query for userId:', userId, 'authProvider:', authProvider);
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout after 2 seconds')), 2000);
      });

      const queryPromise = supabase
        .from('profiles')
        .select('*')
        .eq(authProvider === 'privy' ? 'privy_user_id' : 'user_id', userId)
        .single();

      const { data: profile, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      console.log('🔍 fetchUserProfile: Query result:', { profile, error });

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('❌ Error fetching profile:', error);
        return null;
      }

      console.log('🔍 fetchUserProfile: Returning profile:', profile);
      return profile;
    } catch (error) {
      console.error('❌ Error fetching user profile:', error);
      return null;
    }
  }, []);

  // Update user email in database
  const updateUserEmail = useCallback(async (email: string) => {
    if (!user) {
      console.error('❌ No user available to update email');
      return false;
    }

    try {
      console.log('🔍 Updating user email:', email);
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          email: email,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating email:', error);
        return false;
      }

      console.log('✅ Email updated successfully:', data);
      
      // Update the local user state
      setUser(prevUser => prevUser ? { ...prevUser, email } : null);
      
      return true;
    } catch (error) {
      console.error('❌ Error updating email:', error);
      return false;
    }
  }, [user]);

  // Create or update user profile in Supabase
  const createOrUpdateProfile = useCallback(async (userData: UnifiedUser, authProvider: 'supabase' | 'privy' = 'supabase') => {
    try {
      console.log('🔍 createOrUpdateProfile: Starting for userData:', userData, 'authProvider:', authProvider);
      
      // Set the appropriate user ID fields based on auth provider
      let user_id: string | null = null;
      let privy_user_id: string | null = null;
      
      if (authProvider === 'privy') {
        privy_user_id = userData.id;
        user_id = null;
      } else {
        user_id = userData.id;
        privy_user_id = null;
      }

      // Check if we have existing profile data to preserve email
      let existingEmail: string | null = null;
      if (!userData.email) {
        console.log('🔍 No email in userData, checking existing profile...');
        try {
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', userData.id)
            .single();
          
          if (existingProfile?.email) {
            existingEmail = existingProfile.email;
            console.log('🔍 Found existing email in database:', existingEmail);
          }
        } catch (error) {
          console.log('🔍 No existing profile found or error fetching:', error);
        }
      }

      const profileData = {
        id: userData.id,
        user_id: user_id,
        privy_user_id: privy_user_id,
        email: userData.email || existingEmail, // Preserve existing email if new data doesn't have it
        name: userData.name,
        avatar_url: userData.avatar_url,
        github_username: userData.github_username,
        linkedin_profile: userData.linkedin_profile,
        wallet_address: userData.wallet_address,
        wallet_type: userData.wallet_type,
        auth_provider: authProvider,
        updated_at: new Date().toISOString(),
      };

      console.log('🔍 Profile data to upsert:', profileData);

      // Use upsert to handle both insert and update cases
      const { data, error } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' })
        .select()
        .single();

      if (error) {
        console.error('❌ Error upserting profile:', error);
        return null;
      }
      
      console.log('✅ Profile upserted successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Error creating/updating profile:', error);
      return null;
    }
  }, []);

  // Monitor Privy wallet creation and store in database
  useEffect(() => {
    console.log('🔍 Wallet monitoring useEffect triggered:', {
      hasPrivyUser: !!privyUser,
      hasWalletAddress: !!privyUser?.wallet?.address,
      hasUser: !!user,
      privyWalletAddress: privyUser?.wallet?.address,
      userWalletAddress: user?.wallet_address,
      privyWalletType: privyUser?.wallet?.walletClientType
    });

    if (!privyUser) {
      console.log('❌ No privyUser available for wallet monitoring');
      return;
    }

    if (!privyUser.wallet?.address) {
      console.log('❌ No wallet address in privyUser');
      return;
    }

    if (!user) {
      console.log('❌ No user available for wallet monitoring');
      return;
    }

    const storeWalletInDatabase = async () => {
      try {
        console.log('🔍 Detected wallet creation, storing in database...');
        console.log('Wallet details:', {
          address: privyUser.wallet.address,
          type: privyUser.wallet.walletClientType || 'embedded',
          userId: user.id,
          userEmail: user.email
        });

        const walletAddress = privyUser.wallet.address;
        const walletType = privyUser.wallet.walletClientType || 'embedded';

        console.log('🔍 About to update database with wallet info:', {
          table: 'profiles',
          wallet_address: walletAddress,
          wallet_type: walletType,
          user_id: user.id
        });

        // Update database with wallet information
        const { data, error } = await supabase
          .from('profiles')
          .update({
            wallet_address: walletAddress,
            wallet_type: walletType,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)
          .select(); // Add select to see what was updated

        console.log('🔍 Database update result:', { data, error });

        if (error) {
          console.error('❌ Error storing wallet in database:', error);
        } else {
          console.log('✅ Wallet stored in database successfully');
          console.log('Updated profile data:', data);
          
          // Update local user state
          setUser(prevUser => {
            const updatedUser = prevUser ? {
              ...prevUser,
              wallet_address: walletAddress,
              wallet_type: walletType,
            } : null;
            console.log('🔍 Updated local user state:', updatedUser);
            return updatedUser;
          });

          toast({
            title: "Wallet created",
            description: `Your ${walletType} wallet has been created and stored.`,
          });
        }
      } catch (error) {
        console.error('❌ Error in storeWalletInDatabase:', error);
      }
    };

    // Only store if we don't already have this wallet address stored
    if (user.wallet_address !== privyUser.wallet.address) {
      console.log('🔍 Wallet address changed, storing in database:', {
        oldAddress: user.wallet_address,
        newAddress: privyUser.wallet.address
      });
      storeWalletInDatabase();
    } else {
      console.log('🔍 Wallet address already stored, skipping database update');
    }
  }, [privyUser?.wallet?.address, user]);

  // Add a separate useEffect to log Privy user changes
  useEffect(() => {
    console.log('🔍 Privy user changed:', {
      hasPrivyUser: !!privyUser,
      privyUserId: privyUser?.id,
      privyEmail: privyUser?.email?.address,
      hasWallet: !!privyUser?.wallet?.address,
      walletAddress: privyUser?.wallet?.address,
      walletType: privyUser?.wallet?.walletClientType,
      authenticated: privyAuthenticated,
      ready: privyReady
    });
  }, [privyUser, privyAuthenticated, privyReady]);

  // Add a separate useEffect to log user state changes
  useEffect(() => {
    console.log('🔍 User state changed:', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      hasWallet: !!user?.wallet_address,
      walletAddress: user?.wallet_address,
      walletType: user?.wallet_type,
      authProvider: user?.auth_provider
    });
  }, [user]);

  // Function to fetch GitHub user data including email
  const fetchGitHubUserData = useCallback(async (githubUsername: string) => {
    try {
      console.log('🔍 Fetching GitHub data for:', githubUsername);
      
      // Fetch user data from GitHub API
      const response = await fetch(`https://api.github.com/users/${githubUsername}`);
      console.log('🔍 GitHub API response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }
      
      const userData = await response.json();
      console.log('🔍 GitHub user data:', userData);
      
      // Check if email is available
      if (userData.email) {
        console.log('🔍 Email found in GitHub data:', userData.email);
      } else {
        console.log('🔍 No email in GitHub data - user might have private email');
      }
      
      return {
        email: userData.email,
        name: userData.name || userData.login,
        avatar_url: userData.avatar_url,
        github_username: userData.login,
      };
    } catch (error) {
      console.error('❌ Error fetching GitHub data:', error);
      return null;
    }
  }, []);

  // Function to fetch GitHub user data including email with authentication
  const fetchGitHubUserDataWithAuth = useCallback(async (githubAccount: any) => {
    try {
      console.log('🔍 Fetching GitHub data with auth for account:', githubAccount);
      console.log('🔍 GitHub account access token:', githubAccount.accessToken ? 'PRESENT' : 'MISSING');
      
      // Check if we have access token
      if (!githubAccount.accessToken) {
        console.log('🔍 No access token available, trying public API');
        return await fetchGitHubUserData(githubAccount.username);
      }

      // Try to get emails using authenticated GitHub API
      console.log('🔍 Fetching emails with GitHub access token...');
      console.log('🔍 Making request to: https://api.github.com/user/emails');
      console.log('🔍 Using token:', githubAccount.accessToken.substring(0, 10) + '...');
      
      const emailsResponse = await fetch('https://api.github.com/user/emails', {
        headers: { 
          Authorization: `Bearer ${githubAccount.accessToken}`, 
          Accept: 'application/vnd.github+json' 
        }
      });

      console.log('🔍 GitHub emails API response status:', emailsResponse.status);
      console.log('🔍 GitHub emails API response headers:', Object.fromEntries(emailsResponse.headers.entries()));
      
      if (emailsResponse.ok) {
        const emails = await emailsResponse.json();
        console.log('🔍 GitHub emails response (full):', emails);
        
        // Find the primary and verified email
        const primaryVerifiedEmail = emails.find((email: any) => email.primary && email.verified);
        const primaryEmail = emails.find((email: any) => email.primary);
        const verifiedEmail = emails.find((email: any) => email.verified);
        
        console.log('🔍 Email analysis:', {
          primaryVerifiedEmail: primaryVerifiedEmail?.email,
          primaryEmail: primaryEmail?.email,
          verifiedEmail: verifiedEmail?.email,
          totalEmails: emails.length,
          emailTypes: emails.map((e: any) => ({ email: e.email, primary: e.primary, verified: e.verified }))
        });
        
        if (primaryVerifiedEmail) {
          console.log('🔍 Found primary verified email:', primaryVerifiedEmail.email);
          return { email: primaryVerifiedEmail.email };
        } else if (primaryEmail) {
          console.log('🔍 Found primary email (not verified):', primaryEmail.email);
          return { email: primaryEmail.email };
        } else if (verifiedEmail) {
          console.log('🔍 Found verified email (not primary):', verifiedEmail.email);
          return { email: verifiedEmail.email };
        } else if (emails.length > 0) {
          console.log('🔍 Using first available email:', emails[0].email);
          return { email: emails[0].email };
        }
      } else {
        console.log('🔍 GitHub emails API error response:', await emailsResponse.text());
      }

      // Fallback to public API
      console.log('🔍 Falling back to public GitHub API...');
      return await fetchGitHubUserData(githubAccount.username);
      
    } catch (error) {
      console.error('❌ Error fetching GitHub data with auth:', error);
      // Fallback to public API
      return await fetchGitHubUserData(githubAccount.username);
    }
  }, []);

  // Monitor Privy user changes and fetch GitHub data
  useEffect(() => {
    if (!privyUser) return;

    const processPrivyUser = async () => {
      try {
        console.log('🔍 Processing Privy user with full data:', {
          id: privyUser.id,
          email: privyUser.email,
          linkedAccounts: privyUser.linkedAccounts,
          wallet: privyUser.wallet,
          // Log the full privyUser object to see what's available
          fullPrivyUser: privyUser,
        });

        // Log each linked account in detail
        if (privyUser.linkedAccounts && privyUser.linkedAccounts.length > 0) {
          console.log('🔍 Detailed linked accounts:');
          privyUser.linkedAccounts.forEach((account: any, index: number) => {
            console.log(`  Account ${index}:`, {
              type: account.type,
              username: account.username,
              accessToken: account.accessToken ? 'PRESENT' : 'MISSING',
              fullAccount: account,
            });
          });
        }

        let userEmail = null;
        let userName = null;
        let avatarUrl = null;
        let githubUsername = null;

        // Try to get email from Privy's email field first
        if (privyUser.email?.address) {
          userEmail = privyUser.email.address;
          console.log('🔍 Found email in Privy user:', userEmail);
        }

        // Find GitHub account in linked accounts using the new approach
        const gh = privyUser.linkedAccounts?.find((account: any) => account.type === 'github_oauth') as any;
        const token = gh?.accessToken;
        
        console.log('🔍 GitHub account detection:', {
          found: !!gh,
          username: gh?.username,
          hasToken: !!token,
          tokenPreview: token ? token.substring(0, 10) + '...' : 'NONE',
          accountType: gh?.type,
          fullAccount: gh,
        });
        
        if (gh) {
          githubUsername = gh.username;
          console.log('🔍 Found GitHub account:', {
            username: gh.username,
            type: gh.type,
            hasAccessToken: !!token,
            account: gh,
          });

          // Try to get additional data from GitHub API with authentication
          try {
            console.log('🔍 Fetching GitHub data with auth for username:', githubUsername);
            const githubData = await fetchGitHubUserDataWithAuth(gh);
            if (githubData) {
              console.log('🔍 GitHub API response:', githubData);
              // Use GitHub data to fill in missing fields
              if (!userEmail && githubData.email) {
                userEmail = githubData.email;
                console.log('🔍 Got email from GitHub API:', userEmail);
              }
              // Only try to access name and avatar_url if they exist (from public API fallback)
              if (!userName && 'name' in githubData && githubData.name) {
                userName = githubData.name;
              }
              if (!avatarUrl && 'avatar_url' in githubData && githubData.avatar_url) {
                avatarUrl = githubData.avatar_url;
              }
            }
          } catch (error) {
            console.log('🔍 Could not fetch GitHub data, using fallback:', error);
          }
        } else {
          console.log('🔍 No GitHub account found in linked accounts');
        }

        // Fallback values if we still don't have data
        if (!userEmail) {
          console.log('❌ No email found in Privy user or GitHub data');
          console.log('🔍 Privy user email field:', privyUser.email);
          console.log('🔍 Privy user linked accounts:', privyUser.linkedAccounts);
          // For now, let's continue without email but log it
        }

        if (!userName) {
          userName = githubUsername || userEmail?.split('@')[0] || 'User';
        }

        // Create unified user
        const unifiedUser: UnifiedUser = {
          id: privyUser.id,
          email: userEmail,
          name: userName,
          avatar_url: avatarUrl,
          github_username: githubUsername,
          linkedin_profile: (privyUser.linkedAccounts?.find((account: any) => 
            account.type === 'linkedin' || 
            account.type === 'linkedin_oauth'
          ) as any)?.username || null,
          wallet_address: privyUser.wallet?.address || null,
          wallet_type: privyUser.wallet?.walletClientType || null,
          auth_provider: 'privy',
        };

        console.log('🔍 Created unified user:', unifiedUser);

        // Update the user state
        setUser(unifiedUser);
        setIsPrivyUser(true);
        setIsSupabaseUser(false);

        // Create/update profile in database
        const profileData = await createOrUpdateProfile(unifiedUser, 'privy');
        
        // If the profile data has an email that we didn't have, update the user state
        if (profileData?.email && !userEmail) {
          console.log('🔍 Updating user state with email from database:', profileData.email);
          setUser(prevUser => prevUser ? { ...prevUser, email: profileData.email } : null);
        }

      } catch (error) {
        console.error('❌ Error processing Privy user:', error);
      }
    };

    processPrivyUser();
  }, [privyUser, fetchGitHubUserDataWithAuth, createOrUpdateProfile]);

  // Update the existing Privy user change handler
  useEffect(() => {
    console.log('🔍 Privy user changed:', {
      hasPrivyUser: !!privyUser,
      privyUserId: privyUser?.id,
      privyEmail: privyUser?.email,
      hasWallet: !!privyUser?.wallet?.address,
      walletAddress: privyUser?.wallet?.address,
      walletType: privyUser?.wallet?.walletClientType,
      linkedAccounts: privyUser?.linkedAccounts,
    });

    if (!privyUser) {
      setIsPrivyUser(false);
      return;
    }

          // Only process if we haven't already set up the user
      if (!user || user.id !== privyUser.id) {
        console.log('🔍 Processing new Privy user...');
        
        // If user has GitHub account, the other useEffect will handle it
        const hasGitHub = privyUser.linkedAccounts?.some((account: any) => account.type === 'github_oauth');
        if (!hasGitHub) {
          // Fallback for users without GitHub
          const fallbackUser: UnifiedUser = {
            id: privyUser.id,
            email: privyUser.email?.address || null,
            name: privyUser.email?.address?.split('@')[0] || 'User',
            avatar_url: null,
            github_username: null,
                         linkedin_profile: (privyUser.linkedAccounts?.find((account: any) => account.type === 'linkedin_oauth') as any)?.username || null,
            wallet_address: privyUser.wallet?.address || null,
            wallet_type: privyUser.wallet?.walletClientType || null,
            auth_provider: 'privy',
          };

          setUser(fallbackUser);
          setIsPrivyUser(true);
          setIsSupabaseUser(false);

          createOrUpdateProfile(fallbackUser, 'privy');
        }
      }
  }, [privyUser, user, createOrUpdateProfile]);

  // Handle Privy authentication
  useEffect(() => {
    if (!privyReady) return;

    if (privyAuthenticated && privyUser) {
      setIsPrivyUser(true);
      setIsSupabaseUser(false);

      const unifiedUser: UnifiedUser = {
        id: privyUser.id,
        email: privyUser.email?.address,
        name: privyUser.google?.name || privyUser.github?.name || privyUser.linkedin?.name || 'User',
        avatar_url: undefined, // Will be set from profile if available
        github_username: privyUser.github?.username,
        linkedin_profile: undefined, // Will be set from profile if available
        wallet_address: privyUser.wallet?.address,
        wallet_type: privyUser.wallet?.walletClientType,
        auth_provider: 'privy',
        privy_user_id: privyUser.id,
      };

      setUser(unifiedUser);
      setSession(null); // Privy doesn't use Supabase sessions
      setLoading(false); // Set loading to false immediately when Privy user is authenticated

      // Track Connected event for opportunities page
      trackPH('Connected', {
        provider: 'privy',
        userId: unifiedUser.id,
        hasGithub: !!unifiedUser.github_username,
        hasWallet: !!unifiedUser.wallet_address,
      });

      // Track HireConnected event for hiring page
      trackPH('HireConnected', {
        provider: 'privy',
        userId: unifiedUser.id,
        hasGithub: !!unifiedUser.github_username,
        hasWallet: !!unifiedUser.wallet_address,
      });

      // Create or update profile in database
      createOrUpdateProfile(unifiedUser, 'privy').catch(console.error);
    } else if (!privyAuthenticated) {
      setIsPrivyUser(false);
      if (!isSupabaseUser) {
        setUser(null);
        setSession(null);
        setLoading(false);
      }
    }
  }, [privyAuthenticated, privyUser, privyReady, isSupabaseUser, createOrUpdateProfile]);

  // Handle Supabase authentication
  useEffect(() => {
    if (isPrivyUser) return; // Don't handle Supabase if Privy user is active

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔍 Supabase auth state changed:', event, session?.user?.email);
        
        if (session?.user) {
          console.log('🔍 Processing authenticated session...');
          setIsSupabaseUser(true);
          setIsPrivyUser(false);

          // Create unified user directly from session data (skip database operations)
          const unifiedUser: UnifiedUser = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
            avatar_url: session.user.user_metadata?.avatar_url,
            github_username: session.user.user_metadata?.user_name,
            linkedin_profile: session.user.user_metadata?.linkedin_profile,
            wallet_address: null, // Will be created later if needed
            wallet_type: null,
            auth_provider: 'supabase',
          };

          console.log('🔍 Setting unified user from session:', unifiedUser);
          setUser(unifiedUser);
          setSession(session);
          setLoading(false);
          setHasAuthenticated(true);
          console.log('✅ Authentication successful, loading set to false');

          // Handle redirect after successful authentication
          const intendedDestination = localStorage.getItem('intendedDestination');
          if (intendedDestination && intendedDestination !== window.location.pathname) {
            console.log(`Redirecting to intended destination: ${intendedDestination}`);
            localStorage.removeItem('intendedDestination');
            setTimeout(() => {
              window.location.href = intendedDestination;
            }, 100);
          }
        } else {
          console.log('🔍 No session, clearing user state');
          setIsSupabaseUser(false);
          setUser(null);
          setSession(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Supabase session check result:', { hasSession: !!session, isPrivyUser });
      if (session && !isPrivyUser) {
        setSession(session);
        setLoading(false);
      } else if (!isPrivyUser) {
        console.log('No Supabase session and not Privy user, setting loading to false');
        setLoading(false);
      }
    }).catch((error) => {
      console.error('Error getting session:', error);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [isPrivyUser]);

  // Fallback to ensure loading is set to false
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('Setting loading to false due to timeout');
        setLoading(false);
      }
    }, 3000); // 3 second timeout

    return () => clearTimeout(timeout);
  }, [loading]);

  // Additional fallback for Privy ready state
  useEffect(() => {
    if (privyReady && !privyAuthenticated && !isSupabaseUser) {
      console.log('Privy ready but no user authenticated, setting loading to false');
      setLoading(false);
    }
  }, [privyReady, privyAuthenticated, isSupabaseUser]);

  // Fallback that doesn't depend on Privy ready state
  useEffect(() => {
    if (!privyReady && !isSupabaseUser && !session) {
      console.log('Neither Privy nor Supabase user authenticated, setting loading to false');
      setLoading(false);
    }
  }, [privyReady, isSupabaseUser, session]);

  // Emergency fallback - ensure loading is never stuck for more than 5 seconds
  useEffect(() => {
    const emergencyTimeout = setTimeout(() => {
      if (loading) {
        console.warn('Emergency: Setting loading to false after 5 seconds');
        setLoading(false);
      }
    }, 5000);

    return () => clearTimeout(emergencyTimeout);
  }, [loading]);

  // Force loading to false if user is authenticated but loading is still true
  useEffect(() => {
    if (loading && (user || session)) {
      console.log('User is authenticated but loading is still true, forcing loading to false');
      setLoading(false);
    }
  }, [loading, user, session]);

  // Prevent loading from being set to true if user has already authenticated
  useEffect(() => {
    if (hasAuthenticated && loading) {
      console.log('User has already authenticated, preventing loading from being true');
      setLoading(false);
    }
  }, [hasAuthenticated, loading]);

  // Debug loading state changes
  useEffect(() => {
    console.log('Loading state changed:', { loading, hasUser: !!user, hasSession: !!session });
  }, [loading, user, session]);

  // Add timeout to force sign out if loading takes too long
  useEffect(() => {
    if (loading) {
      const timeoutId = setTimeout(async () => {
        console.warn('⚠️ Loading timeout reached (1 seconds), forcing sign out');
        try {
          await supabase.auth.signOut();
          setLoading(false);
          setUser(null);
          setSession(null);
          setIsSupabaseUser(false);
          setIsPrivyUser(false);
          console.log('✅ Forced sign out completed');
        } catch (error) {
          console.error('❌ Error during forced sign out:', error);
          setLoading(false);
        }
      }, 1000); // 1 second timeout

      return () => {
        console.log('🔍 Clearing loading timeout');
        clearTimeout(timeoutId);
      };
    }
  }, [loading]);

  const signInWithPrivy = (provider?: 'github') => {
    try {
      // Store the intended destination in localStorage
      const destination = window.location.pathname;
      localStorage.setItem('intendedDestination', destination);
      setIntendedDestination(destination);
      
      console.log(`Signing in with Privy${provider ? ` (${provider})` : ''}, intended destination: ${destination}`);

      if (provider) {
        // Use specific provider login
        privyLogin();
      } else {
        // Use general login (will show modal with all options)
        privyLogin();
      }
    } catch (error) {
      console.error(`Error with Privy auth:`, error);
      toast({
        title: "Authentication failed",
        description: `Failed to sign in. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const signOut = async () => {
    console.log('🔍 signOut function called');
    try {
      console.log('🔍 Signing out user:', {
        isPrivyUser,
        isSupabaseUser,
        hasUser: !!user,
        userEmail: user?.email,
        privyReady,
        privyAuthenticated
      });

      if (isPrivyUser) {
        console.log('🔍 Signing out from Privy...');
        await privyLogout();
        console.log('✅ Privy logout successful');
      } else if (isSupabaseUser) {
        console.log('🔍 Signing out from Supabase...');
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('❌ Error signing out from Supabase:', error);
        } else {
          console.log('✅ Supabase logout successful');
        }
      } else {
        console.log('⚠️ No specific auth provider detected, clearing state anyway');
      }
      
      // Clear all local state
      console.log('🔍 Clearing local state...');
      setUser(null);
      setSession(null);
      setIsPrivyUser(false);
      setIsSupabaseUser(false);
      setHasAuthenticated(false);
      
      // Clear localStorage
      localStorage.removeItem('intendedDestination');
      
      console.log('✅ Sign out completed successfully');
      
      // Show success toast
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      console.error('❌ Error during sign out:', error);
      toast({
        title: "Sign out failed",
        description: "There was an error signing you out. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Manual wallet setup function - simplified to work with Privy's automatic creation
  const setupWallet = useCallback(async () => {
    console.log('🔍 setupWallet called with:', {
      hasUser: !!user,
      userEmail: user?.email,
      privyReady,
      hasPrivyUser: !!privyUser,
      currentWalletAddress: user?.wallet_address
    });

    if (!user) {
      console.error('❌ No user available for wallet setup');
      return false;
    }

    if (!privyReady) {
      console.error('❌ Privy not ready for wallet setup');
      return false;
    }

    console.log('🔍 Setting up wallet for user:', user.email);
    
    try {
      // First, try to connect an external wallet (this opens the Privy modal)
      console.log('🔍 Attempting to connect external wallet...');
      await connectWallet();
      console.log('🔍 connectWallet() completed');
      
      // Wait a bit for the user to interact with the modal
      console.log('🔍 Waiting 3 seconds for user interaction...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Check if user connected an external wallet
      console.log('🔍 Checking wallet status after modal:', {
        hasPrivyUser: !!privyUser,
        hasWalletAddress: !!privyUser?.wallet?.address,
        walletAddress: privyUser?.wallet?.address,
        walletType: privyUser?.wallet?.walletClientType
      });

      if (privyUser?.wallet?.address) {
        console.log('✅ User connected external wallet:', privyUser.wallet.address);
        
        // The wallet will be automatically stored by the useEffect above
        toast({
          title: "Wallet connected",
          description: "Your external wallet has been connected successfully.",
        });
        
        return true;
      } else {
        console.log(' User didn\'t connect external wallet, Privy will create embedded wallet automatically');
        
        // Privy will automatically create an embedded wallet for users without wallets
        // We just need to wait for it to be created
        toast({
          title: "Wallet setup",
          description: "An embedded wallet will be created for you automatically.",
        });
        
        // Wait a bit more for Privy to create the embedded wallet
        console.log('🔍 Waiting 2 more seconds for embedded wallet creation...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check again if wallet was created
        console.log('🔍 Final wallet check:', {
          hasPrivyUser: !!privyUser,
          hasWalletAddress: !!privyUser?.wallet?.address,
          walletAddress: privyUser?.wallet?.address,
          walletType: privyUser?.wallet?.walletClientType
        });

        if (privyUser?.wallet?.address) {
          console.log('✅ Embedded wallet created:', privyUser.wallet.address);
          return true;
        }
        
        console.log('⚠️ No wallet created yet, but Privy should handle it automatically');
        return true; // Return true since Privy will handle the wallet creation
      }
    } catch (error) {
      console.error('❌ Error in wallet setup:', error);
      return false;
    }
  }, [user, privyReady, privyUser, connectWallet]);

  // Handle apply button click with wallet flow
  const handleApply = async (opportunity?: { id: string; title: string }): Promise<void> => {
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
      connectWallet();
      
      // Fallback to embedded wallet after small delay
      setTimeout(async () => {
        await createWallet();
      }, 1000);
    }

    // Navigate to apply route with opportunity data
    if (opportunity) {
      const params = new URLSearchParams({
        id: opportunity.id,
        title: opportunity.title
      });
      window.location.href = `/apply?${params.toString()}`;
    } else {
      window.location.href = '/apply';
    }
  };

  // Create a wrapper function for connectWallet that returns a Promise<boolean>
  const connectWalletWrapper = async (): Promise<boolean> => {
    try {
      connectWallet();
      return true;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      return false;
    }
  };

  return (
    <UnifiedAuthContext.Provider value={{
      user,
      session,
      loading,
      signOut,
      signInWithPrivy,
      isPrivyUser,
      isSupabaseUser,
      createWallet: setupWallet, // Use the new setup function
      connectWallet: connectWalletWrapper,
      hasGithub,
      hasWallet,
      handleApply,
      updateUserEmail,
    }}>
      {children}
    </UnifiedAuthContext.Provider>
  );
};