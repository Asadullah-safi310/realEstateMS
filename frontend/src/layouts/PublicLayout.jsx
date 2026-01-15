import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoginModal from '../components/auth/LoginModal';
import RegisterModal from '../components/auth/RegisterModal';
import ForgotPasswordModal from '../components/auth/ForgotPasswordModal';

const PublicLayout = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  const openLogin = () => {
    setIsRegisterOpen(false);
    setIsForgotPasswordOpen(false);
    setIsLoginOpen(true);
  };

  const openRegister = () => {
    setIsLoginOpen(false);
    setIsForgotPasswordOpen(false);
    setIsRegisterOpen(true);
  };

  const openForgotPassword = () => {
    setIsLoginOpen(false);
    setIsRegisterOpen(false);
    setIsForgotPasswordOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar onOpenLogin={openLogin} onOpenRegister={openRegister} />
      
      <main className="flex-grow">
        <Outlet context={{ openLogin, openRegister, openForgotPassword }} />
      </main>
      
      <Footer />

      {/* Auth Modals */}
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        onSwitchToRegister={openRegister}
        onForgotPassword={openForgotPassword}
      />
      <RegisterModal 
        isOpen={isRegisterOpen} 
        onClose={() => setIsRegisterOpen(false)} 
        onSwitchToLogin={openLogin}
      />
      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
        onSwitchToLogin={openLogin}
      />
    </div>
  );
};

export default PublicLayout;
