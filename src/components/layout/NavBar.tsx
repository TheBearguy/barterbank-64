import React, { useState, useEffect } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Menu, X, User, LogOut } from 'lucide-react';

const NavBar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'How It Works', path: '/#how-it-works' },
  ];
  
  if (!isAuthenticated || (user?.user_metadata?.role === 'lender')) {
    navLinks.push({ name: 'Loans', path: '/loans' });
  }

  if (isAuthenticated && user?.user_metadata?.role === 'borrower') {
    navLinks.push({ name: 'My Offers', path: '/offers' });
  }

  const authLinks = [
    { name: 'Dashboard', path: '/dashboard' },
  ];

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const userRole = user?.user_metadata?.role || 'user';

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/80 dark:bg-black/80 backdrop-blur-lg shadow-sm' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link 
            to="/" 
            className="flex items-center font-display text-xl font-semibold text-primary"
          >
            BarterBank
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-sm font-medium text-gray-700 hover:text-primary transition-colors"
              >
                {link.name}
              </Link>
            ))}
            
            {isAuthenticated && authLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-sm font-medium text-gray-700 hover:text-primary transition-colors"
              >
                {link.name}
              </Link>
            ))}

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <User size={18} />
                  </div>
                  <span className="text-sm font-medium">
                    {userName} ({userRole})
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={logout}
                  className="text-gray-700 hover:text-destructive"
                >
                  <LogOut size={18} className="mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login">
                  <Button variant="ghost" size="sm">Log in</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="button-shine">Sign up</Button>
                </Link>
              </div>
            )}
          </nav>

          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden glass animate-fade-in">
          <div className="px-4 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="block py-2 text-base font-medium text-gray-700 hover:text-primary"
              >
                {link.name}
              </Link>
            ))}
            
            {isAuthenticated && authLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="block py-2 text-base font-medium text-gray-700 hover:text-primary"
              >
                {link.name}
              </Link>
            ))}

            {isAuthenticated ? (
              <>
                <div className="py-2">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <User size={18} />
                    </div>
                    <span className="text-sm font-medium">
                      {userName} ({userRole})
                    </span>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-gray-700 hover:text-destructive"
                  onClick={logout}
                >
                  <LogOut size={18} className="mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <div className="pt-4 flex flex-col space-y-3">
                <Link to="/login" className="w-full">
                  <Button variant="outline" className="w-full">Log in</Button>
                </Link>
                <Link to="/register" className="w-full">
                  <Button className="w-full button-shine">Sign up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default NavBar;
