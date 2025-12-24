import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoginModal from '../components/auth/LoginModal';
import RegisterModal from '../components/auth/RegisterModal';

const PublicLayout = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const openLogin = () => {
    setIsRegisterOpen(false);
    setIsLoginOpen(true);
  };

  const openRegister = () => {
    setIsLoginOpen(false);
    setIsRegisterOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar onOpenLogin={openLogin} onOpenRegister={openRegister} />
      
      <main className="flex-grow">
        <Outlet context={{ openLogin, openRegister }} />
      </main>
      
      <Footer />

      {/* Auth Modals */}
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        onSwitchToRegister={openRegister}
      />
      <RegisterModal 
        isOpen={isRegisterOpen} 
        onClose={() => setIsRegisterOpen(false)} 
        onSwitchToLogin={openLogin}
      />
    </div>
  );
};

export default PublicLayout;
