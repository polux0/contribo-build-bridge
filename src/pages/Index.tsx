import { Link } from "react-router-dom";
import Header from "@/components/Header";

const Index = () => {
  return (
    <div className="min-h-screen bg-white font-inter text-contribo-text">
      <Header />
      
      <main className="flex flex-col items-center justify-center min-h-screen text-center px-4 -mt-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">CONTRIBO</h1>
        <div className="w-24 h-0.5 bg-contribo-gold mb-4"></div>
        <div className="text-base mb-8 text-contribo-text">Stop Browsing. Start Building.</div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/opportunities"
            className="inline-flex items-center justify-center px-6 py-3 bg-contribo-black text-white font-medium rounded hover:bg-gray-800 transition-colors duration-200"
          >
            I'm Looking for Opportunities
          </Link>
          <Link
            to="/hiring"
            className="inline-flex items-center justify-center px-6 py-3 bg-white text-contribo-black border border-contribo-black font-medium rounded hover:bg-contribo-gray-light transition-colors duration-200"
          >
            I'm Looking for Talent
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Index;
