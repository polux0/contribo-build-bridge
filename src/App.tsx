import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import DynamicPrivyProvider from '@/components/DynamicPrivyProvider';
import { UnifiedAuthProvider } from '@/contexts/UnifiedAuthContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import './lib/posthog-script'; // Initialize PostHog with UTM tracking
import Index from "./pages/Index";
import Opportunities from "./pages/Opportunities";
import Hiring from "./pages/Hiring";
import Apply from "./pages/Apply";
import NotFound from "./pages/NotFound";
import { Analytics } from './components/Analytics';

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <DynamicPrivyProvider>
          <UnifiedAuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/opportunities" element={<Opportunities />} />
                <Route path="/hiring" element={<Hiring />} />
                <Route path="/apply" element={<Apply />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </TooltipProvider>
          </UnifiedAuthProvider>
        </DynamicPrivyProvider>
      </BrowserRouter>
      <Analytics />
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;