
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { useAuth, UserRole } from '@/context/AuthContext';

type AuthFormMode = 'login' | 'register';

interface AuthFormProps {
  mode: AuthFormMode;
}

const AuthForm: React.FC<AuthFormProps> = ({ mode }) => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('borrower');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        toast.success('Logged in successfully');
      } else {
        await register(name, email, password, role);
        toast.success('Registered successfully');
      }
      navigate('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card max-w-md w-full mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold">
          {mode === 'login' ? 'Welcome Back' : 'Create Your Account'}
        </h2>
        <p className="text-sm text-gray-600 mt-2">
          {mode === 'login' 
            ? 'Log in to access your BarterBank account' 
            : 'Join BarterBank to exchange value flexibly'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {mode === 'register' && (
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="glass-input"
              placeholder="Enter your full name"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="glass-input"
            placeholder="Enter your email"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="glass-input"
            placeholder="Enter your password"
          />
        </div>

        {mode === 'register' && (
          <div className="space-y-2">
            <Label>I want to join as</Label>
            <RadioGroup value={role} onValueChange={(value) => setRole(value as UserRole)} className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="borrower" id="borrower" />
                <Label htmlFor="borrower">Borrower</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="lender" id="lender" />
                <Label htmlFor="lender">Lender</Label>
              </div>
            </RadioGroup>
          </div>
        )}

        <Button 
          type="submit" 
          disabled={loading}
          className="w-full button-shine"
        >
          {loading ? 'Processing...' : mode === 'login' ? 'Log In' : 'Create Account'}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        {mode === 'login' ? (
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        ) : (
          <p>
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Log in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthForm;
