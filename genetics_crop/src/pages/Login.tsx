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
  const [username, setUsername] = useState('');
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

    const result = await signUp({ email, password, role: selectedRole, username });
    if (result.success) {
      toast({
        title: 'Account created',
        description: selectedRole === 'admin' ? 'Admin account ready.' : 'Welcome to Genetic Crop.',
      });
      navigate(selectedRole === 'admin' ? '/admin/dashboard' : '/dashboard');
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
            <CardTitle className="text-2xl font-bold">{mode === 'signin' ? 'Welcome back' : 'Create your account'}</CardTitle>
            <CardDescription>
              {mode === 'signin' ? 'Sign in to access your dashboard' : 'Get started to save your credentials'}
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
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11"
                />
              </div>

              {mode === 'signup' && selectedRole === 'admin' && (
                <div className="space-y-2">
                  <Label htmlFor="username">Admin Username (must start with AD-)</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="AD-lead01"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-11"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11"
                />
              </div>

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

            <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border space-y-2">
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                Passwords for new accounts must be at least 8 characters.
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-primary" />
                Admin usernames must start with "AD-" plus at least 5 characters.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
