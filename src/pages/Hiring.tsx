import React, { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useUnifiedAuth } from "@/contexts/UnifiedAuthContext";
import { useJobUpload } from "@/hooks/useJobUpload";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Linkedin, Mail, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { trackPH } from "@/lib/posthog-script";
import { devLog, devError } from "@/lib/utils";

const Hiring = () => {
  const { user, loading, updateUserEmail } = useUnifiedAuth();
  const { login } = usePrivy();
  const { uploadJobDescription, uploading } = useJobUpload();
  const [email, setEmail] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Check if user needs to provide email
  useEffect(() => {
    devLog('🔍 Hiring page - User state changed:', {
      hasUser: !!user,
      userEmail: user?.email,
      showEmailInput,
      userObject: user
    });
    
    if (user && !user.email && !showEmailInput) {
      devLog('🔍 Showing email input - no email in user object');
      setShowEmailInput(true);
    } else if (user && user.email && showEmailInput) {
      devLog('🔍 Hiding email input - email found in user object:', user.email);
      setShowEmailInput(false);
    }
  }, [user, showEmailInput]);

  const handleConnect = () => {
    try {
      // Track HireConnectClicked event
      trackPH("HireConnectClicked", {
        page: "hiring",
        userAuthenticated: !!user,
      });

      // Directly open Privy modal with the hiring page configuration
      login();
    } catch (error) {
      devError('Error opening Privy modal:', error);
      toast({
        title: "Authentication failed",
        description: "Failed to open authentication modal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      setSelectedFile(files[0]);
      
      // If user has no email, show email input
      if (!user?.email) {
        setShowEmailInput(true);
      }
    }
  };

  const handleJobDescriptionUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a job description file to upload.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please connect with GitHub, LinkedIn, or Google to upload job descriptions.",
        variant: "destructive",
      });
      return;
    }

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

    // If email input is showing but no email is entered, prevent submission
    if (showEmailInput && !email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address before uploading.",
        variant: "destructive",
      });
      return;
    }

    // Track HireApplyClicked event
    trackPH("HireApplyClicked", {
      destination: "job_upload",
      user_email: user.email || email.trim(),
      file_name: selectedFile.name,
      file_size: selectedFile.size,
    });

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
        return;
      }
    }

    const success = await uploadJobDescription(selectedFile, user.email || email.trim());
    
    if (success) {
      // Track HireApplySubmitted event
      trackPH("HireApplySubmitted", {
        user_email: user.email || email.trim(),
        file_name: selectedFile.name,
        file_size: selectedFile.size,
      });

      // Reset form
      setSelectedFile(null);
      setEmail('');
      setShowEmailInput(false);
      
      // Clear the file input
      const fileInput = document.getElementById('jobDescriptionInput') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    }
  };

  useEffect(() => {
    trackPH('HireViewed');
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white font-inter text-contribo-text flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-white font-inter text-contribo-text">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Share your opportunity
              </h1>
              <p className="text-lg text-gray-600">
                Upload your job description and we'll contact you as soon as we find a suitable match
              </p>
            </div>

            {/* Email Input Section */}
            {showEmailInput && !user.email && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <Mail className="w-5 h-5 text-orange-600" />
                    Email Required
                  </CardTitle>
                  <CardDescription>
                    We couldn't automatically retrieve your email. Please provide it so we can contact you about potential matches.
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
            )}

            {/* File Upload Section */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
                <CardDescription>
                  Upload your job or gig description file (PDF, DOC, DOCX, or TXT)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="jobDescriptionInput">Select File</Label>
                  <Input
                    id="jobDescriptionInput"
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileSelect}
                    disabled={uploading}
                  />
                </div>
                {selectedFile && (
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                    <p className="text-sm text-gray-700">
                      <strong>Selected file:</strong> {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upload Button */}
            <div className="flex justify-center">
              <Button 
                onClick={handleJobDescriptionUpload}
                className="bg-contribo-black hover:bg-gray-800"
                disabled={!selectedFile || uploading || (!user?.email && !email.trim())}
              >
                {uploading ? (
                  'File is uploading...'
                ) : !user?.email && !email.trim() ? (
                  "Email Required"
                ) : !selectedFile ? (
                  "Select File First"
                ) : (
                  "Upload Job Description"
                )}
              </Button>
            </div>

            <div className="text-xs text-contribo-gray-submuted mt-6 text-center">
              Upload your job or gig description and we'll find the perfect candidates for you.
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-inter text-contribo-text">
      <Header />
      
      <main className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 max-w-2xl">
          Describe your opportunity. We'll find matching talent and notify you
        </h2>
        
        <div className="flex flex-col gap-4 mb-6">
          <button
            onClick={handleConnect}
            className="inline-flex items-center justify-center px-6 py-3 bg-contribo-black text-white font-medium rounded hover:bg-gray-800 transition-colors duration-200 w-64"
          >
            Connect
          </button>
        </div>

        <div className="text-xs text-contribo-gray-submuted mt-6 max-w-xs text-center">
          We use advanced analytics to match you with opportunities that align with your actual skills and background.
        </div>
      </main>
    </div>
  );
};

export default Hiring;
