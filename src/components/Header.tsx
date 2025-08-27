import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { devLog, devError } from '@/lib/utils';

const Header = () => {
  const { user, signOut } = useUnifiedAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    devLog('🔍 Sign out button clicked');
    try {
      await signOut();
      devLog('✅ Sign out completed');
    } catch (error) {
      devError('❌ Sign out error:', error);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Don't show back button on the home page
  const showBackButton = location.pathname !== '/';

  return (
    <header className="bg-white">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center">
            <img src="/reputation/images/contribo.png" alt="CONTRIBO" className="h-10 w-auto" />
          </Link>
          {showBackButton && (
            <Button
              onClick={handleBack}
              variant="ghost"
              size="sm"
              className="p-2 text-gray-600 hover:text-black hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
        </div>
        
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
