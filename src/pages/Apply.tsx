import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApplicationFlow } from '@/hooks/useApplicationFlow';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { useApplicationSubmission } from '@/hooks/useApplicationSubmission';
import { useOpportunities } from '@/hooks/useOpportunities';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, AlertCircle, Wallet, Github, Loader2, Mail } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import ApplicationSuccessModal from '@/components/ApplicationSuccessModal';
import { trackPH } from '@/lib/posthog-script';

const Apply: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Get opportunity data from URL parameters
  const opportunityId = searchParams.get('id');
  const opportunityTitle = searchParams.get('title');
  
  const { 
    user, 
    loading, 
    hasGithub, 
    hasWallet, 
    canApply, 
    requirementsStatus,
    statusMessage,
    setupWalletForApplication
  } = useApplicationFlow();

  const { opportunities } = useOpportunities();
  const { updateUserEmail } = useUnifiedAuth();
  const { submitApplication } = useApplicationSubmission();

  // Get full opportunity data
  const opportunity = opportunities.find(opp => opp.id === opportunityId);

  // Check if user needs to provide email
  useEffect(() => {
    if (user && !user.email && !showEmailInput) {
      setShowEmailInput(true);
    } else if (user && user.email && showEmailInput) {
      setShowEmailInput(false);
    }
  }, [user, showEmailInput]);

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

  // Handle continue to application button click
  const handleContinueToApplication = async () => {
    // Check if user needs to provide email first
    if (!user?.email && !email.trim()) {
      toast({
        title: "Email required",
        description: "Please provide your email address to continue.",
        variant: "destructive",
      });
      setShowEmailInput(true);
      return;
    }

    // If user has no email and hasn't entered one, force them to provide it
    if (!user?.email && !email.trim()) {
      toast({
        title: "Email required",
        description: "You must provide an email address to submit your application.",
        variant: "destructive",
      });
      setShowEmailInput(true);
      return;
    }

    // If email input is showing but no email is entered, prevent submission
    if (showEmailInput && !email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address before submitting.",
        variant: "destructive",
      });
      return;
    }

    if (!hasWallet) {
      console.log(' User has no wallet, setting up wallet first...');
      
      // Set up wallet (opens Privy modal, creates embedded if user closes modal)
      const walletSetup = await setupWalletForApplication();
      
      if (!walletSetup) {
        toast({
          title: "Wallet setup failed",
          description: "Please try again to continue with your application.",
          variant: "destructive",
        });
        return;
      }
    }
    
    // Check if we have opportunity data
    if (!opportunityId) {
      toast({
        title: "Missing opportunity data",
        description: "Please select an opportunity to apply for.",
        variant: "destructive",
      });
      navigate('/opportunities');
      return;
    }
    
    // Proceed with application submission
    console.log('🔍 Submitting application...');
    setIsSubmitting(true);
    
    try {
      // If user has entered an email but it's not saved to their profile, save it first
      if (email.trim() && !user?.email) {
        console.log('🔍 Saving email to user profile...');
        const emailSaved = await updateUserEmail(email.trim());
        if (!emailSaved) {
          toast({
            title: "Email save failed",
            description: "Failed to save your email. Please try again.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
      }

      // Prepare application payload
      const payload = {
        user_email: user?.email || email.trim(), // Use entered email if user email is not available
        github_username: user?.github_username,
        wallet_address: user?.wallet_address,
        wallet_type: user?.wallet_type,
        submitted_at: new Date().toISOString()
      };

      // Submit application to database
      const success = await submitApplication({
        opportunity_id: opportunityId,
        payload: payload
      }, () => {
        // Success callback - could be used to refresh application status
        console.log('✅ Application submitted, status should be refreshed');
      });

      if (success) {
        // Track ApplySubmitted event
        trackPH('ApplySubmitted', {
          opportunity_id: opportunityId,
          opportunity_title: opportunityTitle,
          user_email: user?.email || email.trim(),
          github_username: user?.github_username,
          wallet_address: user?.wallet_address,
        });

        // Show success modal instead of toast
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error('❌ Error in application submission:', error);
      toast({
        title: "Submission failed",
        description: "Failed to submit your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    // Navigate back to opportunities after modal is closed
    navigate('/opportunities');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Loading application requirements...</span>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-center">Authentication Required</CardTitle>
                <CardDescription className="text-center">
                  Please sign in to apply for opportunities.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => navigate('/opportunities')}
                  className="w-full"
                >
                  Back to Opportunities
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {opportunityTitle ? `Application for: ${opportunityTitle}` : 'Application Requirements'}
            </h1>
            <p className="text-gray-600">
              Review your application requirements and proceed to apply for opportunities.
            </p>
          </div>

          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>
                Information from your connected accounts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-700">Email:</span>
                <p className="text-sm text-gray-600">
                  {user.email ? (
                    user.email
                  ) : (
                    <span className="text-orange-600 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      Not provided - Please add below
                    </span>
                  )}
                </p>
              </div>
              {user.github_username && (
                <div>
                  <span className="text-sm font-medium text-gray-700">GitHub:</span>
                  <p className="text-sm text-gray-600">@{user.github_username}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Email Input Section */}
          {showEmailInput && !user.email && (
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <Mail className="w-5 h-5 text-orange-600" />
                    Email Required
                  </CardTitle>
                  <CardDescription>
                    We couldn't automatically retrieve your email from GitHub. Please provide it to continue with your application. That's the way for us to contact you about application status.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4 justify-center">
            <Button 
              onClick={() => navigate('/opportunities')}
              variant="outline"
            >
              Back to Opportunities
            </Button>
            
            <Button 
              onClick={handleContinueToApplication}
              className="bg-contribo-black hover:bg-gray-800"
              disabled={!canApply || isSubmitting || (!user?.email && !email.trim())}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : !user?.email && !email.trim() ? (
                "Email Required"
              ) : (
                hasWallet ? "Submit Application" : "Set Up Wallet & Submit"
              )}
            </Button>
          </div>
        </div>
      </div>
      <Footer />
      <ApplicationSuccessModal
        isOpen={showSuccessModal}
        onClose={handleCloseSuccessModal}
        opportunityTitle={opportunity?.title}
        companyName={opportunity?.company_name}
      />
    </div>
  );
};

export default Apply; 