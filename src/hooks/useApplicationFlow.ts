import { useCallback, useEffect, useState } from 'react';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { toast } from '@/hooks/use-toast';
import { devLog, devError } from '@/lib/utils';

export const useApplicationFlow = () => {
  const {
    user,
    loading,
    hasGithub,
    hasWallet,
    createWallet,
    connectWallet,
    handleApply,
  } = useUnifiedAuth();

  // Add local state to track when we have a valid user
  const [isReady, setIsReady] = useState(false);

  // Wait for user to be properly loaded
  useEffect(() => {
    if (!loading && user) {
      // Small delay to ensure user data is fully loaded
      const timeoutId = setTimeout(() => {
        setIsReady(true);
      }, 100);
      return () => clearTimeout(timeoutId);
    } else if (!loading && !user) {
      setIsReady(false);
    }
  }, [loading, user]);

  // Add debugging
  devLog(' useApplicationFlow: Debug info:', {
    hasUser: !!user,
    userEmail: user?.email,
    githubUsername: user?.github_username,
    hasGithub,
    hasWallet,
    loading,
    isReady
  });

  // Check if user meets all requirements for application
  const canApply = useCallback(() => {
    devLog('🔍 canApply check:', {
      hasUser: !!user,
      hasGithub,
      isReady,
      result: !!(user && hasGithub && isReady)
    });
    
    if (!user || !isReady) return false;
    if (!hasGithub) return false;
    return true; // Wallet will be handled during apply process
  }, [user, hasGithub, isReady]);

  // Get application requirements status
  const getRequirementsStatus = useCallback(() => {
    return {
      isAuthenticated: Boolean(user && isReady),
      hasGithub,
      hasWallet,
      canApply: canApply(),
    };
  }, [user, hasGithub, hasWallet, canApply, isReady]);

  // Handle wallet setup when user clicks apply
  const setupWalletForApplication = useCallback(async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to apply.",
        variant: "destructive",
      });
      return false;
    }

    devLog('🔍 Setting up wallet for application...');
    
    try {
      // Use the setupWallet function from UnifiedAuthContext
      const walletSetup = await createWallet(); // This is aliased to setupWallet
      
      if (walletSetup) {
        devLog('✅ Wallet setup completed successfully');
        return true;
      } else {
        devLog('⚠️ Wallet setup failed');
        toast({
          title: "Wallet setup failed",
          description: "Please try again or contact support.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      devError('❌ Error in wallet setup:', error);
      toast({
        title: "Wallet setup failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
      return false;
    }
  }, [user, createWallet]);

  // Get user-friendly status messages
  const getStatusMessage = useCallback(() => {
    if (loading || !isReady) return "Loading...";
    if (!user) return "Please sign in to apply";
    if (!hasGithub) return "GitHub account required";
    if (!hasWallet) return "Wallet will be set up when you apply";
    return "Ready to apply";
  }, [loading, user, hasGithub, hasWallet, isReady]);

  return {
    // State
    user,
    loading: loading || !isReady, // Show loading until user is ready
    hasGithub,
    hasWallet,
    
    // Computed values
    canApply: canApply(),
    requirementsStatus: getRequirementsStatus(),
    statusMessage: getStatusMessage(),
    
    // Actions
    handleApply,
    setupWalletForApplication, // New function for wallet setup
  };
}; 