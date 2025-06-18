import React from 'react';
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex gap-8 text-sm">
      <Link 
        to="/" 
        className="text-contribo-gray-muted hover:underline transition-all duration-200"
      >
        Home
      </Link>
      <a 
        href="#how-it-works" 
        className="text-contribo-gray-muted hover:underline transition-all duration-200"
      >
        How it Works
      </a>
    </footer>
  );
};

export default Footer;
