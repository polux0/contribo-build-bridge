
import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useResumeUpload } from "@/hooks/useResumeUpload";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Linkedin } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Opportunities = () => {
  const { user, loading } = useAuth();
  const { uploadResume, uploading } = useResumeUpload();
  const [email, setEmail] = useState('');
  const [hasResume, setHasResume] = useState(false);
  const [checkingResume, setCheckingResume] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleGitHubAuth = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/opportunities`
      }
    });
    
    if (error) {
      console.error('Error with GitHub auth:', error);
    }
  };

  const handleLinkedInAuth = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'linkedin_oidc',
      options: {
        redirectTo: `${window.location.origin}/opportunities`
      }
    });
    
    if (error) {
      console.error('Error with LinkedIn auth:', error);
    }
  };

  const handleGoogleAuth = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/opportunities`
      }
    });
    
    if (error) {
      console.error('Error with Google auth:', error);
    }
  };

  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      console.log('User state:', user);
      console.log('Email value:', email);
      
      if (!user && (!email.trim() || !validateEmail(email))) {
        toast({
          title: "Invalid email",
          description: "Please enter a valid email address.",
          variant: "destructive",
        });
        return;
      }

      const emailToUse = user?.email || email;
      console.log('Email to use for upload:', emailToUse);
      
      const success = await uploadResume(files[0], emailToUse);
      if (success) {
        setHasResume(true);
      }
    }
  };

  // Check if user already has a resume
  useEffect(() => {
    const checkUserResume = async () => {
      if (user) {
        setCheckingResume(true);
        try {
          const { data, error } = await supabase
            .from('resumes')
            .select('id')
            .eq('user_id', user.id)
            .limit(1);

          if (error) {
            console.error('Error checking resume:', error);
          } else {
            setHasResume(data && data.length > 0);
          }
        } catch (error) {
          console.error('Error checking resume:', error);
        } finally {
          setCheckingResume(false);
        }
      }
    };

    checkUserResume();
  }, [user]);

  if (loading || checkingResume) {
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
        
        <main className="flex flex-col items-center justify-center min-h-screen pt-16 text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 max-w-2xl">
            Welcome back! Don't worry, we'll notify you as soon as we find the next opportunity, as we are doing things semi-automated at the moment!
          </h2>
          
          <div className="mb-6">
            <Button
              onClick={() => supabase.auth.signOut()}
              variant="outline"
              size="sm"
            >
              Sign Out
            </Button>
          </div>

          {!hasResume && (
            <div className="text-sm flex items-center gap-2">
              <button
                onClick={() => document.getElementById('resumeInput')?.click()}
                className="text-contribo-text hover:underline transition-all duration-200"
                disabled={uploading}
              >
                {uploading ? 'Uploading Resume...' : 'Upload Resume'}
              </button>
              <input
                type="file"
                id="resumeInput"
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeUpload}
                disabled={uploading}
              />
            </div>
          )}

          <div className="text-xs text-contribo-gray-submuted mt-6 max-w-xs text-center">
            Our AI finds the best matches based on your real skills and experience.
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-inter text-contribo-text">
      <Header />
      
      <main className="flex flex-col items-center justify-center min-h-screen pt-16 text-center px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 max-w-2xl">
          Connect Your Profile. Discover Your Next Role, Instantly.
        </h2>
        
        <div className="mb-6">
          <button
            onClick={handleGitHubAuth}
            className="inline-flex items-center justify-center px-6 py-3 bg-contribo-black text-white font-medium rounded hover:bg-gray-800 transition-colors duration-200"
          >
            <svg
              className="w-4 h-4 mr-2"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 .297C5.37.297 0 5.67 0 12.285c0 5.29 3.438 9.787 8.205 11.362.6.113.82-.263.82-.583 0-.288-.01-1.05-.015-2.06-3.338.725-4.042-1.61-4.042-1.61-.546-1.393-1.333-1.764-1.333-1.764-1.09-.744.083-.728.083-.728 1.205.085 1.84 1.24 1.84 1.24 1.07 1.835 2.807 1.305 3.49.997.108-.775.42-1.305.763-1.605-2.665-.307-5.467-1.333-5.467-5.93 0-1.31.47-2.38 1.236-3.22-.124-.306-.536-1.54.117-3.21 0 0 1.008-.324 3.3 1.23a11.48 11.48 0 0 1 3-.404c1.02.005 2.045.138 3 .404 2.29-1.554 3.297-1.23 3.297-1.23.653 1.67.242 2.904.118 3.21.77.84 1.235 1.91 1.235 3.22 0 4.61-2.807 5.62-5.48 5.92.43.37.815 1.096.815 2.21 0 1.596-.015 2.88-.015 3.27 0 .32.216.698.825.58C20.565 22.07 24 17.577 24 12.285 24 5.67 18.627.297 12 .297z" />
            </svg>
            Connect with GitHub
          </button>
        </div>

        <div className="text-base text-contribo-text mb-6">or</div>

        <div className="mb-6">
          <button
            onClick={handleLinkedInAuth}
            className="inline-flex items-center justify-center px-6 py-3 bg-contribo-black text-white font-medium rounded hover:bg-gray-800 transition-colors duration-200"
          >
            <Linkedin className="w-4 h-4 mr-2" />
            Connect with LinkedIn
          </button>
        </div>

        <div className="text-base text-contribo-text mb-6">or</div>

        <div className="mb-6">
          <button
            onClick={handleGoogleAuth}
            className="inline-flex items-center justify-center px-6 py-3 bg-contribo-black text-white font-medium rounded hover:bg-gray-800 transition-colors duration-200"
          >
            <svg
              className="w-4 h-4 mr-2"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Connect with Google
          </button>
        </div>

        <div className="text-base text-contribo-text mb-4">or</div>

        <div className="flex flex-col items-center gap-4 max-w-sm w-full">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full"
            required
          />
          <button
            onClick={() => document.getElementById('resumeInput')?.click()}
            className="inline-flex items-center justify-center px-6 py-3 bg-contribo-black text-white font-medium rounded hover:bg-gray-800 transition-colors duration-200 w-full disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={uploading || !email.trim() || !validateEmail(email)}
          >
            {uploading ? 'Uploading Resume...' : 'Upload Resume'}
          </button>
          <input
            type="file"
            id="resumeInput"
            className="hidden"
            accept=".pdf,.doc,.docx"
            onChange={handleResumeUpload}
            disabled={uploading || !email.trim() || !validateEmail(email)}
          />
        </div>

        <div className="text-xs text-contribo-gray-submuted mt-6 max-w-xs text-center">
          Our AI finds the best matches based on your real skills and experience.
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Opportunities;
