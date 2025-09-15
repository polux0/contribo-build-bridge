import React from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LiveGigModules } from "@/components/LiveGigModules";

const LiveGig = () => {
  return (
    <div className="min-h-screen bg-white font-inter text-contribo-text">
      <Header />
      
      <main className="py-8">
        <LiveGigModules />
      </main>
      
      <Footer />
    </div>
  );
};

export default LiveGig;
