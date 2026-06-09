import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { CartDrawer } from '@/features/cart/components/CartDrawer';
import { PWAInstallPrompt } from '@/shared/components/ui';
import { useOnlineStatus } from '@/shared/hooks/useOnlineStatus';
import { Wifi, WifiOff } from 'lucide-react';

function OnlineStatusIndicator() {
  const { isOnline, wasOffline } = useOnlineStatus();

  if (isOnline && wasOffline) {
    return (
      <div className="fixed top-0 left-0 right-0 bg-green-500 text-white text-center py-2 px-4 z-50 animate-fade-out">
        <div className="flex items-center justify-center gap-2">
          <Wifi className="w-4 h-4" />
          <span className="text-sm font-medium">Back online</span>
        </div>
      </div>
    );
  }

  if (!isOnline) {
    return (
      <div className="fixed top-0 left-0 right-0 bg-red-500 text-white text-center py-2 px-4 z-50">
        <div className="flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4" />
          <span className="text-sm font-medium">You are offline</span>
        </div>
      </div>
    );
  }

  return null;
}

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <OnlineStatusIndicator />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <PWAInstallPrompt />
    </div>
  );
}
