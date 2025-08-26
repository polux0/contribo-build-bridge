import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useUnifiedAuth } from "@/contexts/UnifiedAuthContext";
import { useResumeUpload } from "@/hooks/useResumeUpload";
import { useOpportunities } from "@/hooks/useOpportunities";
import OpportunityCard from "@/components/OpportunityCard";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Linkedin, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { trackPH } from "@/lib/posthog-script";

const Opportunities = () => {
  const { user, loading, signInWithPrivy, signOut } = useUnifiedAuth();
  const { opportunities, loading: opportunitiesLoading, error: opportunitiesError } = useOpportunities();
  const { uploadResume, uploading } = useResumeUpload();
  const [hasResume, setHasResume] = useState(false);
  const [checkingResume, setCheckingResume] = useState(false);

  // Add this debugging log
  console.log(' Opportunities page state:', {
    authLoading: loading,
    checkingResume,
    opportunitiesLoading,
    hasUser: !!user,
    opportunitiesCount: opportunities.length,
    opportunitiesError
  });

  const handleGitHubLogin = async () => {
    try {
      // Track ConnectClicked event
      trackPH("ConnectClicked", {
        page: "opportunities",
        opportunities_count: opportunities.length,
      });
      
      await signInWithPrivy('github');
    } catch (error) {
      console.error('GitHub login error:', error);
    }
  };

  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      console.log('Starting resume upload for file:', files[0].name);
      const success = await uploadResume(files[0]);
      if (success) {
        setHasResume(true);
        console.log('Resume upload successful');
      } else {
        console.log('Resume upload failed');
      }
    }
  };

  // Check if user already has a resume
  useEffect(() => {
    const checkUserResume = async () => {
      if (user) {
        setCheckingResume(true);
        try {
          let query;
          
          if (user.auth_provider === 'privy') {
            // For Privy users, query by privy_user_id in profiles table first
            const { data: profile } = await supabase
              .from('profiles')
              .select('id')
              .eq('privy_user_id', user.id)
              .single();
            
            if (profile) {
              // Then check resumes table using the profile id
              query = supabase
                .from('resumes')
                .select('id')
                .eq('user_id', profile.id)
                .limit(1);
            } else {
              // No profile found, so no resume
              setHasResume(false);
              setCheckingResume(false);
              return;
            }
          } else {
            // For Supabase users, query directly by user_id
            query = supabase
              .from('resumes')
              .select('id')
              .eq('user_id', user.id)
              .limit(1);
          }

          const { data, error } = await query;

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

  // Track GigViewed when opportunities are loaded
  useEffect(() => {
    if (!opportunitiesLoading && opportunities.length > 0) {
      // Track each opportunity as viewed
      opportunities.forEach((opportunity) => {
        trackPH("GigViewed", {
          opportunity_id: opportunity.id,
          opportunity_title: opportunity.title,
          page: "opportunities",
        });
      });
    }
  }, [opportunitiesLoading, opportunities]);

  if (loading || checkingResume || opportunitiesLoading) {
    console.log('🔍 Opportunities: Showing loading screen because:', {
      authLoading: loading,
      checkingResume,
      opportunitiesLoading
    });
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
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Available Opportunities
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
              Discover gig opportunities that match your skills and interests
            </p>
            
            {/* User Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              {!hasResume && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => document.getElementById('resumeInput')?.click()}
                    className="inline-flex items-center justify-center px-4 py-2 bg-contribo-black text-white text-sm font-medium rounded hover:bg-gray-800 transition-colors duration-200"
                    disabled={uploading}
                  >
                    {uploading ? 'Uploading...' : '📄 Upload Resume for Additional Context'}
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
            </div>
          </div>

          {opportunitiesError && (
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                <span>Error loading opportunities: {opportunitiesError}</span>
              </div>
            </div>
          )}

          {opportunities.length === 0 && !opportunitiesError ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold mb-4">
                No opportunities available at the moment
              </h2>
              <p className="text-gray-600 mb-8">
                We'll notify you as soon as new opportunities become available!
              </p>
            </div>
          ) : (
            <div className="space-y-6 max-w-4xl mx-auto">
              {opportunities.map((opportunity) => (
                <OpportunityCard key={opportunity.id} opportunity={opportunity} />
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <div className="text-xs text-contribo-gray-submuted max-w-xs mx-auto text-center">
              We use advanced analytics to match you with opportunities that align with your actual skills and background.
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
          Connect Your Profile. Discover Your Next Role
        </h2>
        
        <div className="flex flex-col gap-4 mb-6">
          <button
            onClick={handleGitHubLogin}
            className="inline-flex items-center justify-center px-6 py-3 bg-contribo-black text-white font-medium rounded hover:bg-gray-800 transition-colors duration-200 w-64"
          >
            <svg
              className="w-4 h-4 mr-2"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
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

export default Opportunities;
