import React from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LiveGigModules } from "@/components/LiveGigModules";

const LiveGig = () => {
  return (
    <div className="min-h-screen bg-white font-inter text-contribo-text">
      <Header />
      
      <main className="py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-4">Live Gig Test</h1>
          <p className="text-lg">If you can see this, the route is working!</p>
          
          {/* Test the component import */}
          <div className="mt-8 p-6 bg-gray-100 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Testing LiveGigModules Import</h2>
            <p>About to render the component...</p>
            <LiveGigModules />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default LiveGig;
