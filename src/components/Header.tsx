import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-white">
      <div className="flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center">
          <img src="/reputation/images/contribo.png" alt="CONTRIBO" className="h-10 w-auto" />
        </Link>
      </div>
    </header>
  );
};

export default Header;
