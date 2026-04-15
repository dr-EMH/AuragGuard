import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, LogIn } from 'lucide-react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { toast } from 'sonner';

export function Login() {
  const handleLogin = async () => {
    if (!auth) {
      toast.error("Firebase not configured");
      return;
    }
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success("Successfully logged in");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Failed to login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-brand-bg">
      <Card className="w-full max-w-md glass-card border-none">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl brand-gradient flex items-center justify-center">
            <Shield className="w-10 h-10 text-black" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold">AuraGuard</CardTitle>
            <CardDescription className="text-muted-foreground">
              Your intelligent safety companion.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-sm text-muted-foreground">
            Sign in to access your safety network and activate proactive protection.
          </p>
          <Button 
            className="w-full h-14 text-lg brand-gradient text-black font-bold"
            onClick={handleLogin}
          >
            <LogIn className="w-5 h-5 mr-2" />
            Continue with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
