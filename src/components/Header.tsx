import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-white">
      <div className="flex items-center justify-between px-6 py-4">
        <Link to="/" className="text-xl font-bold text-contribo-text">
          Contribo
        </Link>
      </div>
    </header>
  );
};

export default Header;
