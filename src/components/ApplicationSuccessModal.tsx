import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Share2, Sparkles, Twitter } from 'lucide-react';
import Confetti from 'react-confetti';
import { toast } from '@/hooks/use-toast';
import { devLog } from '@/lib/utils';

interface ApplicationSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunityTitle?: string;
  companyName?: string;
}

const ApplicationSuccessModal: React.FC<ApplicationSuccessModalProps> = ({
  isOpen,
  onClose,
  opportunityTitle,
  companyName
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      // Stop confetti after 5 seconds
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleShare = async () => {
    const shareText = `I just applied for ${opportunityTitle} at ${companyName}! 🚀`;
    const shareUrl = 'https://contribo.xyz/opportunities';

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Application Submitted!',
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        devLog('Share cancelled or failed');
      }
    } else {
      // Fallback: copy to clipboard
      const fullText = `${shareText}\n\nCheck out opportunities at: ${shareUrl}`;
      try {
        await navigator.clipboard.writeText(fullText);
        toast({
          title: "Copied to clipboard!",
          description: "Share text has been copied to your clipboard.",
        });
      } catch (error) {
        toast({
          title: "Share failed",
          description: "Could not copy to clipboard. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleTwitterShare = () => {
    const shareText = `I just applied for ${opportunityTitle} at ${companyName}! 🚀`;
    const shareUrl = 'https://contribo.xyz/opportunities';
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank');
  };

  const handleFarcasterShare = () => {
    const shareText = `I just applied for ${opportunityTitle} at ${companyName}! 🚀`;
    const shareUrl = 'https://contribo.xyz/opportunities';
    const farcasterUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
    window.open(farcasterUrl, '_blank');
  };

  return (
    <>
      {showConfetti && (
        <Confetti
          width={windowDimensions.width}
          height={windowDimensions.height}
          recycle={false}
          numberOfPieces={200}
          colors={['#000000', '#666666', '#999999', '#CCCCCC']}
        />
      )}
      
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <DialogTitle className="text-2xl font-bold text-gray-900 text-center">
              Application Submitted!
            </DialogTitle>
          </DialogHeader>

          <div className="text-center space-y-6">
            <div className="space-y-4">
              <p className="text-gray-600 text-sm">
                We'll notify you about the status of your application shortly.
              </p>
              
              {opportunityTitle && companyName && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <Badge variant="outline" className="text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Applied Successfully
                  </Badge>
                  <div className="pt-2">
                    <p className="text-sm font-medium text-gray-900">
                      {opportunityTitle}
                    </p>
                    <p className="text-xs text-gray-500">
                      at {companyName}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={handleShare}
                className="w-full bg-contribo-black hover:bg-gray-800"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Your Achievement
              </Button>
              
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={handleTwitterShare}
                  className="flex-1"
                  size="sm"
                >
                  <Twitter className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={handleFarcasterShare}
                  className="flex-1"
                  size="sm"
                >
                  <img 
                    src="/farcaster.webp" 
                    alt="Farcaster" 
                    className="w-4 h-4"
                  />
                </Button>
              </div>
            </div>

            <div className="pt-2">
              <Button
                onClick={onClose}
                variant="ghost"
                className="w-full text-gray-500 hover:text-black"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ApplicationSuccessModal; 