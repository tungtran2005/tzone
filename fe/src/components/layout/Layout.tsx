import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import FloatingAIChatbox from '../ai/FloatingAIChatbox';

export default function Layout() {
  const location = useLocation();
  const hideFloatingChat = location.pathname === '/ai-advisor';

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      {!hideFloatingChat && <FloatingAIChatbox />}
    </div>
  );
}
