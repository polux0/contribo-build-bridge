
import React, { useState } from 'react';
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useResumeUpload } from "@/hooks/useResumeUpload";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const Opportunities = () => {
  const { user, loading } = useAuth();
  const { uploadResume, uploading } = useResumeUpload();

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

  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      await uploadResume(files[0]);
    }
  };

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
        
        <main className="flex flex-col items-center justify-center min-h-screen pt-16 text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 max-w-2xl">
            Welcome back! Ready to find your next opportunity?
          </h2>
          
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Signed in as: {user.email}</p>
            <Button
              onClick={() => supabase.auth.signOut()}
              variant="outline"
              size="sm"
            >
              Sign Out
            </Button>
          </div>

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

        <div className="text-base text-contribo-text mb-2">or</div>

        <div className="text-sm flex items-center gap-2">
          <button
            onClick={handleLinkedInAuth}
            className="text-contribo-text hover:underline transition-all duration-200"
          >
            LinkedIn
          </button>
          <span className="text-contribo-gray-muted">•</span>
          <button
            onClick={() => document.getElementById('resumeInput')?.click()}
            className="text-contribo-text hover:underline transition-all duration-200"
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Resume'}
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

        <div className="text-xs text-contribo-gray-submuted mt-6 max-w-xs text-center">
          Our AI finds the best matches based on your real skills and experience.
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Opportunities;
