
import React from 'react';
import { Navigate } from 'react-router-dom';
import NavBar from '@/components/layout/NavBar';
import Footer from '@/components/layout/Footer';
import AuthForm from '@/components/auth/AuthForm';
import AnimatedGradient from '@/components/ui/AnimatedGradient';
import { useAuth } from '@/context/AuthContext';

const Register = () => {
  const { isAuthenticated } = useAuth();

  // Redirect if already logged in
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <div className="flex-grow relative flex items-center justify-center py-20">
        <AnimatedGradient variant="accent" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <AuthForm mode="register" />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Register;
