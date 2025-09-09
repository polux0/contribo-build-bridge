import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApplicationFlow } from '@/hooks/useApplicationFlow';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { useApplicationSubmission } from '@/hooks/useApplicationSubmission';
import { useOpportunities } from '@/hooks/useOpportunities';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, AlertCircle, Wallet, Github, Loader2, Mail, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import ApplicationSuccessModal from '@/components/ApplicationSuccessModal';
import { trackPH } from '@/lib/posthog-script';
import { devLog, devError } from '@/lib/utils';

const Apply: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Get opportunity data from URL parameters
  const opportunityId = searchParams.get('id');
  const opportunityTitle = searchParams.get('title');
  
  // Always call hooks in the same order
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

  const { signInWithPrivy, signOut, updateUserEmail } = useUnifiedAuth();
  const { opportunities } = useOpportunities();
  const { submitApplication } = useApplicationSubmission();

  // Get full opportunity data
  const opportunity = opportunities.find(opp => opp.id === opportunityId);

  useEffect(() => {
    // Show helpful message if user can't apply due to missing GitHub
    if (!loading && user && !hasGithub) {
      toast({
        title: "GitHub account required",
        description: "You need to connect your GitHub account to apply. You can add it to your existing account.",
        variant: "destructive",
      });
    }
  }, [loading, user, hasGithub]);

  // Handle continue to application button click
  const handleContinueToApplication = async () => {
    // Check if user has provided an email
    const hasEmail = user?.email || email.trim();
    
    devLog('🔍 Email validation check:', {
      userEmail: user?.email,
      inputEmail: email.trim(),
      hasEmail
    });
    
    if (!hasEmail) {
      toast({
        title: "Email required",
        description: "Please provide your email address to continue.",
        variant: "destructive",
      });
      return;
    }

    if (!hasWallet) {
      devLog(' User has no wallet, setting up wallet first...');
      
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
    devLog('🔍 Submitting application...');
    setIsSubmitting(true);
    
    try {
      let finalEmail = user?.email || email.trim();
      
      // If user has entered an email but it's not saved to their profile, save it first
      if (email.trim() && !user?.email) {
        devLog('🔍 Saving email to user profile...');
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
        
        // Use the email we just saved
        finalEmail = email.trim();
      }

      // Prepare application payload
      const payload = {
        user_email: finalEmail,
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
        devLog('✅ Application submitted, status should be refreshed');
      });

      if (success) {
        // Track ApplySubmitted event
        trackPH('ApplySubmitted', {
          opportunity_id: opportunityId,
          opportunity_title: opportunityTitle,
          user_email: finalEmail,
          github_username: user?.github_username,
          wallet_address: user?.wallet_address,
        });

        // Show success modal instead of toast
        setShowSuccessModal(true);
      }
    } catch (error) {
      devError('❌ Error in application submission:', error);
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

  // Render loading state
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

  // Render authentication required state
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

  // Render email required state
  const hasEmail = user?.email || email.trim();
  devLog('🔍 Render condition check:', {
    userEmail: user?.email,
    inputEmail: email.trim(),
    hasEmail,
    willShowEmailRequired: !hasEmail
  });
  
  if (!hasEmail) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Add some spacing to push the card lower */}
            <div className="h-20"></div>
            
            <Card className="w-full max-w-2xl mx-auto hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl font-semibold text-gray-900 mb-2">
                      Email Required
                    </CardTitle>
                    <CardDescription className="text-gray-600 mb-3">
                      We couldn't automatically retrieve your email from GitHub. Please provide it to continue with your application.
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="ml-4">
                    Required
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    <span>Contact Information</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    <span>Secure & Private</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Purpose:</span>
                    <span className="text-sm text-gray-600">Application status updates and communication</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Privacy:</span>
                    <span className="text-sm text-gray-600">Your email will only be used for application-related communications</span>
                  </div>

                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-md">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-orange-800 font-medium">
                          Email required to continue
                        </p>
                        <p className="text-sm text-orange-700 mt-1">
                          This is the primary way we'll contact you about your application status.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex gap-3">
                <div className="flex-1 space-y-3">
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
                </div>
              </CardFooter>

              <div className="px-6 pb-6">
                <div className="flex gap-3">
                  <Button 
                    onClick={() => navigate('/opportunities')}
                    variant="outline"
                    className="flex-1"
                  >
                    Back to Opportunities
                  </Button>
                  <Button 
                    onClick={handleContinueToApplication}
                    className="bg-contribo-black hover:bg-gray-800 flex-1"
                    disabled={!email.trim()}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Render GitHub required state
  if (!hasGithub) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6 max-w-4xl mx-auto">
            <Card className="w-full max-w-2xl mx-auto hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl font-semibold text-gray-900 mb-2">
                      GitHub Account Required
                    </CardTitle>
                    <CardDescription className="text-gray-600 mb-3">
                      You need to connect your GitHub account to apply for opportunities. This helps us verify your skills and experience.
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="ml-4">
                    Required
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Github className="w-4 h-4" />
                    <span>Developer Profile</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    <span>Skills Verification</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Purpose:</span>
                    <span className="text-sm text-gray-600">Verify your coding experience and skills</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Access:</span>
                    <span className="text-sm text-gray-600">Public repositories and profile information only</span>
                  </div>

                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-md">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-orange-800 font-medium">
                          GitHub connection required
                        </p>
                        <p className="text-sm text-orange-700 mt-1">
                          You can add GitHub to your existing account without losing your current login.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex gap-3">
                <Button 
                  onClick={async () => {
                    try {
                      await signInWithPrivy('github');
                    } catch (error) {
                      devError('GitHub connection error:', error);
                      toast({
                        title: "GitHub connection failed",
                        description: "Please try again or contact support.",
                        variant: "destructive",
                      });
                    }
                  }}
                  className="w-full bg-contribo-black hover:bg-gray-800"
                >
                  <Github className="w-4 h-4 mr-2" />
                  Connect GitHub Account
                </Button>
              </CardFooter>

              <div className="px-6 pb-6">
                <Button 
                  onClick={() => navigate('/opportunities')}
                  variant="outline"
                  className="w-full"
                >
                  Back to Opportunities
                </Button>
              </div>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Render application submission form
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6 max-w-4xl mx-auto">
          <Card className="w-full max-w-2xl mx-auto hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl font-semibold text-gray-900 mb-2">
                    Submit Application
                  </CardTitle>
                  <CardDescription className="text-gray-600 mb-3">
                    Review your information and submit your application for this opportunity.
                  </CardDescription>
                </div>
                <Badge variant="default" className="ml-4">
                  Ready
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Email:</span>
                  <span className="text-sm text-gray-600">{user?.email}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">GitHub:</span>
                  <span className="text-sm text-gray-600">@{user?.github_username}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Opportunity:</span>
                  <span className="text-sm text-gray-600">{opportunity?.title}</span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex gap-3">
              <Button 
                onClick={() => navigate('/opportunities')}
                variant="outline"
                className="flex-1"
              >
                Back to Opportunities
              </Button>
              <Button 
                onClick={handleContinueToApplication}
                className="bg-contribo-black hover:bg-gray-800 flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </CardFooter>
          </Card>
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