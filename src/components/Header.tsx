
import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-50">
      <div className="flex items-center justify-between px-6 py-4">
        <Link to="/" className="text-xl font-bold text-contribo-text">
          Contribo
        </Link>
        
        <nav className="flex items-center space-x-8">
          <Link 
            to="/opportunities" 
            className="text-contribo-text hover:text-contribo-accent transition-colors duration-200"
          >
            I'm looking for opportunities
          </Link>
          <Link 
            to="/hiring" 
            className="text-contribo-text hover:text-contribo-accent transition-colors duration-200"
          >
            I'm looking for talent
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
