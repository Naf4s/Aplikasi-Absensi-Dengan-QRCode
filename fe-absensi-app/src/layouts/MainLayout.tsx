import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import MainNavbar from '../components/navigation/MainNavbar';
import MainFooter from '../components/navigation/MainFooter';

const MainLayout: React.FC = () => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const isHomePage = location.pathname === '/';

  // Handle scroll effect for transparent navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <MainNavbar 
        isTransparent={isHomePage && !isScrolled} 
      />
      <main className="flex-grow">
        <Outlet />
      </main>
      <MainFooter />
    </div>
  );
};

export default MainLayout;