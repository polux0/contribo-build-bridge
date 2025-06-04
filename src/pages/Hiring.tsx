
import React, { useState } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UploadModal from "@/components/UploadModal";

const Hiring = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-inter text-contribo-text">
      <Header />
      
      <main className="flex flex-col items-center justify-center min-h-screen pt-16 text-center px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 max-w-2xl">
          Describe Your Ideal Candidate. Meet Them Instantly.
        </h2>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <a
            href="#"
            className="inline-flex items-center justify-center px-6 py-3 bg-contribo-black text-white font-medium rounded hover:bg-gray-800 transition-colors duration-200"
          >
            Find Talent Now
          </a>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-sm text-contribo-text hover:underline transition-all duration-200"
          >
            Or upload job description
          </button>
        </div>
      </main>

      <Footer />
      
      <UploadModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default Hiring;
