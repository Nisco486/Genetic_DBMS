import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dna, Leaf, Shield, Users, ArrowRight, Loader2, User as UserIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { UserRole } from '@/types/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('user');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const { login, signUp, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const urlMode = searchParams.get('mode');
    if (urlMode === 'signup') {
      setMode('signup');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: 'Missing credentials',
        description: 'Please enter your email and password.',
        variant: 'destructive',
      });
      return;
    }

    if (mode === 'signin') {
      const result = await login(email, password, selectedRole);

      if (result.success) {
        toast({
          title: 'Welcome back!',
          description: `Logged in as ${selectedRole === 'admin' ? 'Administrator' : 'Researcher'}`,
        });
        navigate(selectedRole === 'admin' ? '/admin/dashboard' : '/dashboard');
      } else {
        toast({
          title: 'Login failed',
          description: result.message ?? 'Invalid credentials. Please try again.',
          variant: 'destructive',
        });
      }
      return;
    }

    // Signup validation
    if (!fullName || !username) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Password mismatch',
        description: 'Passwords do not match.',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: 'Weak password',
        description: 'Password must be at least 8 characters long.',
        variant: 'destructive',
      });
      return;
    }

    if (selectedRole === 'admin') {
      if (!/^AD-\d{3}$/.test(username)) {
        toast({
          title: 'Invalid username',
          description: 'Admin username must be in format AD-### (e.g., AD-101)',
          variant: 'destructive',
        });
        return;
      }
    } else if (username.length < 6) {
      toast({
        title: 'Invalid username',
        description: 'Username must be at least 6 characters.',
        variant: 'destructive',
      });
      return;
    }

    const result = await signUp({
      email,
      password,
      role: selectedRole,
      username,
      full_name: fullName
    });

    if (result.success) {
      toast({
        title: 'Account created',
        description: 'Your account has been created successfully. Please sign in.',
      });
      setMode('signin');
    } else {
      toast({
        title: 'Could not create account',
        description: result.message ?? 'Please check your details and try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-muted/30">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center gap-6 mb-8">
          <img src="/rvce-logo.png" alt="RVCE Logo" className="h-20 w-auto" />
        </div>

        <Card variant="elevated" className="border border-border shadow-xl bg-background">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold">
              {mode === 'signin' ? 'Welcome back' : 'Create your account'}
            </CardTitle>
            <CardDescription>
              {mode === 'signin' ? 'Sign in to access your dashboard' : 'Get started with your research account'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={mode} onValueChange={(v) => setMode(v as 'signin' | 'signup')} className="mb-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Get Started</TabsTrigger>
              </TabsList>
            </Tabs>

            <Tabs value={selectedRole} onValueChange={(v) => setSelectedRole(v as UserRole)} className="mb-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="user" className="gap-2 text-sm">
                  <Users className="w-4 h-4" />
                  Researcher
                </TabsTrigger>
                <TabsTrigger value="admin" className="gap-2 text-sm">
                  <Shield className="w-4 h-4" />
                  Admin
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="h-11"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">
                      {selectedRole === 'admin' ? 'Admin Username (AD-###)' : 'Username'}
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder={selectedRole === 'admin' ? 'AD-101' : 'username'}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="h-11"
                      required
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11"
                  required
                />
              </div>

              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-11"
                    required
                  />
                </div>
              )}

              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full mt-6"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {mode === 'signin' ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>

            {mode === 'signup' && (
              <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border space-y-2">
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  Passwords must be at least 8 characters long.
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-primary" />
                  Admin usernames must be in format "AD-###" (e.g., AD-101).
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
