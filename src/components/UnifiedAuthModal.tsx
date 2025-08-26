import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { Github } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface UnifiedAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectTo?: string;
}

export const UnifiedAuthModal: React.FC<UnifiedAuthModalProps> = ({
  isOpen,
  onClose,
  redirectTo,
}) => {
  const { signInWithPrivy } = useUnifiedAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleGitHubLogin = async () => {
    setIsLoading(true);
    try {
      // Use the current path as redirect destination
      const currentPath = window.location.pathname;
      await signInWithPrivy('github');
      onClose();
    } catch (error) {
      console.error('Error with GitHub login:', error);
      toast({
        title: "Login failed",
        description: "Failed to sign in with GitHub. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">
            Sign in to Contribo
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* GitHub Login Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 text-center">
              Continue with GitHub
            </h3>
            <Button
              variant="outline"
              className="w-full bg-gray-900 hover:bg-gray-800 text-white flex items-center justify-center gap-2"
              onClick={handleGitHubLogin}
              disabled={isLoading}
            >
              <Github className="h-4 w-4" />
              {isLoading ? 'Connecting...' : 'Continue with GitHub'}
            </Button>
          </div>

          {/* Info Section */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-blue-700 text-center">
              <strong>Why GitHub?</strong> GitHub is the standard for developers and allows us to 
              verify your coding experience and connect you with relevant opportunities.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 