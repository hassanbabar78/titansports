

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { signInSchema, signUpSchema, emailSchema, friendlyError } from '@/lib/validation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isForgotPassword) {
        emailSchema.parse(email);
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success('Password reset email sent! Check your inbox.');
        setIsForgotPassword(false);
        setEmail('');
      } else if (isSignUp) {
        const parsed = signUpSchema.parse({ fullName, email, password });
        const { error } = await signUp(parsed.email, parsed.password, parsed.fullName);
        if (error) throw error;
        toast.success('Account created! Please check your email to verify.');
      } else {
        const parsed = signInSchema.parse({ email, password });
        const { error } = await signIn(parsed.email, parsed.password);
        if (error) throw error;
        toast.success('Welcome back!');
        navigate('/');
      }
    } catch (err) {
      toast.error(friendlyError(err, 'Authentication failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo.jpeg" alt="Titan Sports" className="h-16 w-16 rounded-full mx-auto mb-4" />
          <h1 className="text-2xl font-bold uppercase">
            {isForgotPassword ? 'Reset Password' : isSignUp ? 'Create Account' : 'Sign In'}
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            {isForgotPassword
              ? 'Enter your email and we will send you a reset link.'
              : isSignUp
              ? 'Join the fight. Create your account.'
              : 'Welcome back, fighter.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-card p-6 rounded-lg border">
          {isSignUp && !isForgotPassword && (
            <div>
              <Label>Full Name</Label>
              <Input required value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your name" />
            </div>
          )}

          <div>
            <Label>Email</Label>
            <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
          </div>
          {!isForgotPassword && (
            <div>
              <Label>Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={8}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {!isSignUp && (
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className="text-xs text-gold hover:underline mt-1 block"
                >
                  Forgot password?
                </button>
              )}
            </div>
          )}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gold text-gold-foreground hover:bg-gold/90 font-bold uppercase tracking-wide py-5"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Please wait...</span>
              </div>
            ) : isForgotPassword ? 'Send Reset Link' : isSignUp ? 'Create Account' : 'Sign In'}
          </Button>

          {isForgotPassword ? (
            <p className="text-center text-sm">
              <button
                type="button"
                onClick={() => { setIsForgotPassword(false); setEmail(''); }}
                className="text-gold font-medium hover:underline"
              >
                ← Back to Sign In
              </button>
            </p>
          ) : (
            <p className="text-center text-sm">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-gold font-medium hover:underline"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;
