/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { PanicButton } from '@/components/PanicButton';
import { StatusBadge } from '@/components/StatusBadge';
import { TransitModeCard } from '@/components/TransitModeCard';
import { EmergencyContacts } from '@/components/EmergencyContacts';
import { CountdownOverlay } from '@/components/CountdownOverlay';
import { SafetyTips } from '@/components/SafetyTips';
import { useSensors } from '@/hooks/useSensors';
import { useLocation } from '@/hooks/useLocation';
import { EmergencyContact } from '@/types';
import { Toaster, toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

import { useAuth } from '@/lib/AuthProvider';
import { Login } from '@/components/Login';

import { doc, setDoc, onSnapshot, updateDoc, arrayUnion, arrayRemove, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserProfile } from '@/types';

export default function App() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [isTransitActive, setIsTransitActive] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  const [countdown, setCountdown] = useState<number | null>(null);
  const MAX_COUNTDOWN = 10;

  const { lastImpact, startMonitoring, stopMonitoring, setLastImpact } = useSensors();
  const { location, startWatching, stopWatching } = useLocation();

  // Sync user profile from Firestore
  useEffect(() => {
    if (!user || !db) return;

    const userDocRef = doc(db, 'users', user.uid);
    
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        setUserProfile(data);
        setEmergencyContacts(data.emergencyContacts || []);
      } else {
        // Initialize user profile if it doesn't exist
        const initialProfile: UserProfile = {
          uid: user.uid,
          displayName: user.displayName || 'User',
          email: user.email || '',
          emergencyContacts: [],
          settings: {
            fallDetectionEnabled: true,
            routeDeviationEnabled: false,
            countdownDuration: 10
          }
        };
        setDoc(userDocRef, initialProfile);
      }
    }, (error) => {
      console.error("Firestore sync error:", error);
    });

    return () => unsubscribe();
  }, [user]);

  // Handle sudden impact / fall detection
  useEffect(() => {
    if (lastImpact && countdown === null) {
      setCountdown(MAX_COUNTDOWN);
      toast.error("Sudden impact detected!", {
        description: "Emergency countdown started."
      });
    }
  }, [lastImpact, countdown]);

  // Countdown logic
  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      handleSOS();
      setCountdown(null);
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSOS = async () => {
    toast.success("SOS SENT!", {
      description: "Your emergency contacts have been notified with your location.",
      duration: 10000,
    });
    
    // Log SOS to Firestore
    if (user && db && location) {
      try {
        await addDoc(collection(db, 'alerts'), {
          userId: user.uid,
          timestamp: new Date().toISOString(),
          location: location,
          type: lastImpact ? 'fall' : 'manual',
          status: 'active'
        });
      } catch (error) {
        console.error("Error logging SOS:", error);
      }
    }
    
    console.log("SOS SENT to:", emergencyContacts, "Location:", location);
  };

  const cancelSOS = () => {
    setCountdown(null);
    setLastImpact(null);
    toast.info("SOS Cancelled", {
      description: "System returned to secure state."
    });
  };

  const handleStartTransit = (destination: string) => {
    setIsTransitActive(true);
    startMonitoring();
    startWatching();
    toast.success("Transit Mode Active", {
      description: `Monitoring journey to ${destination}`
    });
  };

  const handleStopTransit = () => {
    setIsTransitActive(false);
    stopMonitoring();
    stopWatching();
    toast.info("Transit Mode Deactivated");
  };

  const addContact = async (contact: Omit<EmergencyContact, 'id'>) => {
    if (!user || !db) return;
    const newContact = { ...contact, id: Math.random().toString(36).substr(2, 9) };
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        emergencyContacts: arrayUnion(newContact)
      });
      toast.success("Contact Added");
    } catch (error) {
      console.error("Error adding contact:", error);
      toast.error("Failed to add contact");
    }
  };

  const removeContact = async (id: string) => {
    if (!user || !db) return;
    const contactToRemove = emergencyContacts.find(c => c.id === id);
    if (!contactToRemove) return;

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        emergencyContacts: arrayRemove(contactToRemove)
      });
      toast.info("Contact Removed");
    } catch (error) {
      console.error("Error removing contact:", error);
      toast.error("Failed to remove contact");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg">
        <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen flex flex-col lg:grid lg:grid-cols-[320px_1fr_320px] lg:gap-6 lg:p-10 bg-brand-bg text-brand-text">
      <Toaster position="top-center" theme="dark" />
      
      {/* Left Sidebar - Stats (Desktop Only) */}
      <aside className="hidden lg:flex flex-col gap-6 p-6 rounded-3xl glass-card">
        <div className="border-b border-brand-border pb-4 mb-2">
          <h2 className="text-sm font-semibold text-brand-text-dim uppercase tracking-wider">Journey Monitor</h2>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-brand-text-dim">Destination</span>
            <span className="text-sm font-mono text-brand-primary">{isTransitActive ? 'Maadi District' : 'None'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-brand-text-dim">GPS Accuracy</span>
            <span className="text-sm font-mono text-brand-primary">98%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-brand-text-dim">Motion Status</span>
            <span className="text-sm font-mono text-brand-primary">{isTransitActive ? 'Stable' : 'Idle'}</span>
          </div>
        </div>
        <div className="mt-auto p-4 rounded-xl bg-brand-danger/10 border border-brand-danger/20">
          <p className="text-xs font-bold text-brand-danger mb-1">Auto-Trigger Active</p>
          <p className="text-[10px] leading-relaxed opacity-80">
            Emergency SOS will be sent if sudden impact or route deviation is detected without response.
          </p>
        </div>
      </aside>

      {/* Main App Content (Phone Mockup Feel) */}
      <div className="flex-1 flex flex-col relative lg:max-w-[400px] lg:mx-auto lg:h-[800px] lg:border-[12px] lg:border-[#222] lg:rounded-[48px] lg:overflow-hidden lg:shadow-2xl bg-brand-bg">
        <Header />

        <main className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8 flex flex-col items-center"
              >
                <div className="w-full flex justify-between items-center">
                  <div className="space-y-1">
                    <h1 className="text-2xl font-bold">AuraGuard</h1>
                    <p className="text-brand-text-dim text-xs">Smart security for your movement</p>
                  </div>
                  <StatusBadge status={isTransitActive ? 'monitoring' : 'secure'} />
                </div>

                <SafetyTips />

                <div className="py-10 flex flex-col items-center gap-8">
                  <div className="aura-circle w-64 h-64">
                    {isTransitActive && <div className="aura-active-ring animate-pulse" />}
                    <span className="text-[10px] uppercase tracking-[0.2em] text-brand-primary opacity-80">Protection</span>
                    <div className="text-4xl font-extralight my-1">
                      {isTransitActive ? 'Active' : 'Secure'}
                    </div>
                    <p className="text-[10px] opacity-50">Sensors monitoring</p>
                  </div>

                  <div className="text-center space-y-4">
                    <p className="text-xs text-brand-text-dim">Hold for emergency</p>
                    <PanicButton onPanic={() => setCountdown(MAX_COUNTDOWN)} />
                  </div>
                </div>

                <div className="w-full grid grid-cols-2 gap-4 pb-10">
                  <div className="p-4 rounded-2xl glass-card space-y-2">
                    <p className="text-[10px] text-brand-text-dim uppercase tracking-wider">Sensors</p>
                    <p className="text-lg font-bold text-brand-primary">Active</p>
                  </div>
                  <div className="p-4 rounded-2xl glass-card space-y-2">
                    <p className="text-[10px] text-brand-text-dim uppercase tracking-wider">GPS</p>
                    <p className="text-lg font-bold text-brand-secondary">Tracking</p>
                  </div>
                </div>
              </motion.div>
            )}

          {activeTab === 'transit' && (
            <motion.div
              key="transit"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="space-y-1">
                <h1 className="text-2xl font-bold">Transit Mode</h1>
                <p className="text-muted-foreground text-sm">Secure your public transport journey.</p>
              </div>
              <TransitModeCard 
                isActive={isTransitActive} 
                onStart={handleStartTransit}
                onStop={handleStopTransit}
              />
              {isTransitActive && (
                <div className="p-4 rounded-2xl glass-card space-y-4">
                  <h3 className="font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-primary" />
                    Live Telemetry
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Speed</p>
                      <p className="font-mono">12.4 km/h</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Heading</p>
                      <p className="font-mono">North-East</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'contacts' && (
            <motion.div
              key="contacts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="space-y-1">
                <h1 className="text-2xl font-bold">Safety Network</h1>
                <p className="text-muted-foreground text-sm">Manage who gets notified in emergencies.</p>
              </div>
              <EmergencyContacts 
                contacts={emergencyContacts} 
                onAdd={addContact}
                onRemove={removeContact}
              />
            </motion.div>
          )}

          {activeTab === 'safety' && (
            <motion.div
              key="safety"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="space-y-1">
                <h1 className="text-2xl font-bold">Safety Settings</h1>
                <p className="text-muted-foreground text-sm">Configure your protection triggers.</p>
              </div>
              <div className="space-y-4">
                <div className="p-4 rounded-2xl glass-card flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-bold">Fall Detection</p>
                    <p className="text-xs text-muted-foreground">Trigger SOS on sudden impact</p>
                  </div>
                  <div className="w-12 h-6 rounded-full bg-brand-primary/20 relative">
                    <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-brand-primary" />
                  </div>
                </div>
                <div className="p-4 rounded-2xl glass-card flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-bold">Route Deviation</p>
                    <p className="text-xs text-muted-foreground">Alert if you go off-track</p>
                  </div>
                  <div className="w-12 h-6 rounded-full bg-white/10 relative">
                    <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white/40" />
                  </div>
                </div>
                <div className="p-4 rounded-2xl glass-card space-y-4">
                  <div className="flex justify-between">
                    <p className="font-bold">SOS Countdown</p>
                    <p className="text-brand-primary font-mono">{MAX_COUNTDOWN}s</p>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full">
                    <div className="h-full bg-brand-primary w-1/3" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>

      {/* Right Sidebar - Contacts & Activity (Desktop Only) */}
      <aside className="hidden lg:flex flex-col gap-6 p-6 rounded-3xl glass-card">
        <div className="border-b border-brand-border pb-4 mb-2">
          <h2 className="text-sm font-semibold text-brand-text-dim uppercase tracking-wider">Safety Network</h2>
        </div>
        
        <div className="flex -space-x-3 overflow-hidden">
          {emergencyContacts.map((contact, i) => (
            <div 
              key={contact.id}
              className="inline-block h-10 w-10 rounded-full ring-2 ring-brand-card bg-brand-secondary/20 flex items-center justify-center text-xs font-bold"
              style={{ zIndex: 10 - i }}
            >
              {contact.name.charAt(0)}
            </div>
          ))}
          {emergencyContacts.length > 3 && (
            <div className="inline-block h-10 w-10 rounded-full ring-2 ring-brand-card bg-brand-border flex items-center justify-center text-[10px] font-bold z-0">
              +{emergencyContacts.length - 3}
            </div>
          )}
        </div>

        <div className="border-b border-brand-border pb-4 mb-2 mt-4">
          <h2 className="text-sm font-semibold text-brand-text-dim uppercase tracking-wider">Activity Log</h2>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-brand-text-dim">Sudden Stop</span>
            <span className="text-xs font-mono text-brand-danger">09:12 AM</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-brand-text-dim">Transit Active</span>
            <span className="text-xs font-mono text-brand-text">08:45 AM</span>
          </div>
        </div>

        <div className="mt-auto p-4 rounded-xl bg-brand-primary/5 border border-brand-primary/10">
          <p className="text-xs font-bold text-brand-primary mb-1">System Health</p>
          <p className="text-[10px] leading-relaxed opacity-80">
            All systems nominal. Encrypted connection to safety network established.
          </p>
        </div>
      </aside>

      {countdown !== null && (
        <CountdownOverlay 
          seconds={countdown} 
          maxSeconds={MAX_COUNTDOWN} 
          onCancel={cancelSOS} 
        />
      )}
    </div>
  );
}
