import React, { useState } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useJobUpload } from "@/hooks/useJobUpload";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Linkedin } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Hiring = () => {
  const { user, loading } = useAuth();
  const { uploadJobDescription, uploading } = useJobUpload();

  const handleGitHubAuth = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/hiring`
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
        redirectTo: `${window.location.origin}/hiring`
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
        redirectTo: `${window.location.origin}/hiring`
      }
    });
    
    if (error) {
      console.error('Error with Google auth:', error);
    }
  };

  const handleJobDescriptionUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please connect with GitHub, LinkedIn, or Google to upload job descriptions.",
          variant: "destructive",
        });
        return;
      }

      await uploadJobDescription(files[0], user.email);
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
        
        <main className="flex flex-col items-center justify-center min-h-screen text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 max-w-2xl">
            Share your opportunity, and we'll contact you as soon as we find a suitable match
          </h2>
          
          <div className="flex flex-col items-center gap-4 max-w-sm w-full">
            <button
              onClick={() => document.getElementById('jobDescriptionInput')?.click()}
              className="inline-flex items-center justify-center px-6 py-3 bg-contribo-black text-white font-medium rounded hover:bg-gray-800 transition-colors duration-200 w-full disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={uploading}
            >
              {uploading ? 'Uploading Job Description...' : 'Find Talent Now'}
            </button>
            <input
              type="file"
              id="jobDescriptionInput"
              className="hidden"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleJobDescriptionUpload}
              disabled={uploading}
            />

            <button
              onClick={() => supabase.auth.signOut()}
              className="inline-flex items-center justify-center px-6 py-3 bg-contribo-black text-white font-medium rounded hover:bg-gray-800 transition-colors duration-200 w-full"
            >
              Sign Out
            </button>
          </div>

          <div className="text-xs text-contribo-gray-submuted mt-6 max-w-xs text-center">
            Upload your job or gig description and we'll find the perfect candidates for you.
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
            onClick={handleGitHubAuth}
            className="inline-flex items-center justify-center px-6 py-3 bg-contribo-black text-white font-medium rounded hover:bg-gray-800 transition-colors duration-200 w-64"
          >
            <svg
              className="w-4 h-4 mr-2"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            Connect with GitHub
          </button>

          <button
            onClick={handleLinkedInAuth}
            className="inline-flex items-center justify-center px-6 py-3 bg-contribo-black text-white font-medium rounded hover:bg-gray-800 transition-colors duration-200 w-64"
          >
            <svg
              className="w-4 h-4 mr-2"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
            Connect with LinkedIn
          </button>

          <button
            onClick={handleGoogleAuth}
            className="inline-flex items-center justify-center px-6 py-3 bg-contribo-black text-white font-medium rounded hover:bg-gray-800 transition-colors duration-200 w-64"
          >
            <svg
              className="w-4 h-4 mr-2"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
            </svg>
            Connect with Google
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
