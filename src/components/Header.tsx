import React from 'react';
import { Link } from 'react-router-dom';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { Button } from '@/components/ui/button';

const Header = () => {
  const { user, signOut } = useUnifiedAuth();

  const handleSignOut = async () => {
    console.log('🔍 Sign out button clicked');
    try {
      await signOut();
      console.log('✅ Sign out completed');
    } catch (error) {
      console.error('❌ Sign out error:', error);
    }
  };

  return (
    <header className="bg-white">
      <div className="flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center">
          <img src="/reputation/images/contribo.png" alt="CONTRIBO" className="h-10 w-auto" />
        </Link>
        
        {user && (
          <Button
            onClick={handleSignOut}
            variant="ghost"
            className="text-black hover:text-black"
          >
            Sign out
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;
