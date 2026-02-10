import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { MobileHeader } from './MobileHeader';
import { MobileSidebar } from './MobileSidebar';
import { ProductTourOverlay } from './ProductTourOverlay';
import { ProductTourProvider } from '@/contexts/ProductTourContext';
import { Loader2 } from 'lucide-react';

export function AppLayout() {
  const { user, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center ocean-bg">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <ProductTourProvider>
      <div className="min-h-screen flex flex-col ocean-bg">
        <MobileHeader onMenuClick={() => setMobileMenuOpen(true)} />
        <MobileSidebar open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
        
        {/* Full-width header on top */}
        <AppHeader />
        
        <div className="flex-1 flex flex-row">
          <AppSidebar />
          
          {/* Main content offset by sidebar width on desktop */}
          <div className="flex-1 flex flex-col min-h-0 lg:ml-80">
            <main className="flex-1 overflow-auto p-4 lg:p-8 main-scroll">
              <div className="w-full">
                <Outlet />
              </div>
            </main>
          </div>
        </div>
        <ProductTourOverlay />
      </div>

      {/* Main area scrollbar styling */}
      <style>{`
        .main-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .main-scroll::-webkit-scrollbar-track {
          background: hsl(var(--background) / 0.5);
        }
        .main-scroll::-webkit-scrollbar-thumb {
          background: hsl(var(--border));
          border-radius: 4px;
        }
        .main-scroll::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--muted-foreground) / 0.4);
        }
      `}</style>
    </ProductTourProvider>
  );
}
