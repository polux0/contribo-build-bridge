
import React, { useState } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useJobUpload } from "@/hooks/useJobUpload";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

const Hiring = () => {
  const [email, setEmail] = useState('');
  const { uploadJobDescription, uploading } = useJobUpload();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleJobDescriptionUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      if (!validateEmail(email)) {
        toast({
          title: "Invalid email",
          description: "Please enter a valid email address.",
          variant: "destructive",
        });
        return;
      }

      await uploadJobDescription(files[0], email);
    }
  };

  return (
    <div className="min-h-screen bg-white font-inter text-contribo-text">
      <Header />
      
      <main className="flex flex-col items-center justify-center min-h-screen pt-16 text-center px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 max-w-2xl">
          Share your opportunity, and we'll contact you as soon as we find a suitable match
        </h2>
        
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
            onClick={() => document.getElementById('jobDescriptionInput')?.click()}
            className="inline-flex items-center justify-center px-6 py-3 bg-contribo-black text-white font-medium rounded hover:bg-gray-800 transition-colors duration-200 w-full disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={uploading || !email.trim() || !validateEmail(email)}
          >
            {uploading ? 'Uploading Job Description...' : 'Find Talent Now'}
          </button>
          <input
            type="file"
            id="jobDescriptionInput"
            className="hidden"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleJobDescriptionUpload}
            disabled={uploading || !email.trim() || !validateEmail(email)}
          />
        </div>

        <div className="text-xs text-contribo-gray-submuted mt-6 max-w-xs text-center">
          Upload your job or gig description and we'll find the perfect candidates for you.
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Hiring;
