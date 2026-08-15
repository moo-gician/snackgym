import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db, auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { deactivateUser } from '../lib/firestore';
import type { UserProfile } from '../lib/firestore';
import { Settings as SettingsIcon, LogOut, Trash2, Share2, Activity, Home, BarChart2, BellOff } from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = auth.currentUser;
  
  const [activeTab, setActiveTab] = useState<'HOME' | 'PROGRESS' | 'SETTINGS'>('HOME');
  const [userData, setUserData] = useState<Partial<UserProfile>>({});
  const [isSnoozed, setIsSnoozed] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      if (!user) return;
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data() as Partial<UserProfile>;
        setUserData(data);
        
        if (data.snooze_until) {
          const snoozeTime = new Date(data.snooze_until).getTime();
          setIsSnoozed(snoozeTime > Date.now());
        }
      }
    }
    fetchUser();
  }, [user]);

  const toggleSnooze = async () => {
    if (!user) return;
    const newState = !isSnoozed;
    setIsSnoozed(newState);
    
    let snooze_until = null;
    if (newState) {
      const now = new Date();
      now.setHours(23, 59, 59, 999);
      snooze_until = now.toISOString();
    }
    
    await updateDoc(doc(db, 'users', user.uid), { snooze_until });
    setUserData(prev => ({ ...prev, snooze_until }));
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const handleSoftDelete = async () => {
    if (!user) return;
    if (window.confirm("Are you sure you want to surrender and delete your account?")) {
      try {
        await deactivateUser(user.uid);
        alert("Cowardice recorded. Account deleted.");
        await signOut(auth);
        navigate('/');
      } catch (e) {
        console.error("Error deleting account:", e);
        alert("An error occurred.");
      }
    }
  };

  const handleShare = () => {
    const text = `🤬 Spartan Spotter: "This lazy one just lifted 12kg dumbbells. Let's see how long this lasts. Who's in? [B.E.A.S.T. Link]"`;
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard! Share your glory.");
  };

  const handleFeedback = (level: string) => {
    console.log("Feedback recorded:", level);
    alert("Feedback recorded. Prepare for tomorrow's assault!");
    setShowFeedback(false);
  };

  const todaySessions = userData.todaySessions || 0;
  const sessionsPerDay = userData.sessionsPerDay || 6;
  const totalCalories = Math.floor(userData.totalCalories || 0);
  const streak = userData.currentStreak || 0;
  
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const progressPercent = Math.min(todaySessions / sessionsPerDay, 1);
  const strokeDashoffset = circumference - progressPercent * circumference;

  const donuts = Math.floor(totalCalories / 250);
  const beers = Math.floor(totalCalories / 150);

  return (
    <div className="min-h-screen bg-[var(--color-abyss)] text-[var(--color-ash)] pb-24 flex flex-col max-w-md mx-auto relative font-sans">
      
      {/* ----------------- HOME TAB ----------------- */}
      {activeTab === 'HOME' && (
        <div className="flex-1 px-4 pt-8 animate-fade-in-up">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold font-display tracking-wide uppercase text-[var(--color-bone)]">Hello, {user?.displayName?.split(' ')[0] || 'Spartan'}</h1>
              <p className="text-sm text-[var(--color-blood)] font-bold uppercase tracking-widest mt-1">Ready for your daily beating?</p>
            </div>
            <button 
              onClick={toggleSnooze}
              className={`flex items-center gap-2 px-3 py-2 rounded-none font-bold text-xs uppercase tracking-wider transition-all tap-scale shadow-sm border ${
                isSnoozed ? 'bg-[var(--color-charcoal)] text-[var(--color-ash)] border-[var(--color-ash)] opacity-50' : 'bg-[var(--color-blood)] text-[var(--color-abyss)] border-[var(--color-blood)] hover:bg-red-700'
              }`}
            >
              <BellOff size={16} className={isSnoozed ? 'text-[var(--color-ash)]' : 'text-[var(--color-abyss)]'} />
              {isSnoozed ? 'Snoozed 💤' : 'Snooze'}
            </button>
          </div>

          <div className="bg-[var(--color-charcoal)] border border-[var(--color-blood)] border-opacity-20 px-4 py-4 rounded-none w-full text-center mb-8 relative">
            <span className="absolute -top-5 -left-2 text-4xl">🤬</span>
            <p className="text-sm font-bold text-[var(--color-bone)] ml-4 italic">
              "Get up lazy bones! Time to crush it! No excuses!"
            </p>
          </div>

          {/* Daily Snack Ring & Quick Start */}
          <div className="flex justify-center items-center relative py-6">
            <svg className="w-[300px] h-[300px] transform -rotate-90">
              <circle
                cx="150" cy="150" r={radius}
                stroke="rgba(255,255,255,0.05)" strokeWidth="20" fill="transparent"
                strokeLinecap="round"
              />
              <circle
                cx="150" cy="150" r={radius}
                stroke="var(--color-bronze)" strokeWidth="20" fill="transparent"
                strokeLinecap="round"
                style={{
                  strokeDasharray: circumference,
                  strokeDashoffset: strokeDashoffset,
                  transition: 'stroke-dashoffset 1s ease-out'
                }}
              />
            </svg>
            
            <div className="absolute flex flex-col items-center justify-center text-center mt-2">
              <span className="text-[var(--color-ash)] text-xs font-bold uppercase tracking-widest mb-1">Today's Beating</span>
              <span className="text-6xl font-display font-black text-[var(--color-bone)] mb-4">{todaySessions}<span className="text-3xl text-[var(--color-ash)]">/{sessionsPerDay}</span></span>
              
              <Link 
                to="/session/manual-1" 
                className="px-6 py-3 rounded-none text-[var(--color-abyss)] bg-[var(--color-blood)] font-display font-bold uppercase tracking-widest text-lg flex items-center gap-2 tap-scale hover:bg-red-700 transition-colors"
              >
                <span className="text-xl">⚡</span> Quick Start
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8">
            <button onClick={handleShare} className="flex flex-col items-center justify-center p-4 bg-[var(--color-charcoal)] rounded-none border border-gray-800 hover:border-[var(--color-bronze)] tap-scale">
              <Share2 size={24} className="text-[var(--color-bronze)] mb-2" />
              <span className="text-xs font-bold text-[var(--color-bone)] uppercase tracking-wider">Share Glory</span>
            </button>
            <button onClick={() => setShowFeedback(true)} className="flex flex-col items-center justify-center p-4 bg-[var(--color-charcoal)] rounded-none border border-gray-800 hover:border-[var(--color-bronze)] tap-scale">
              <Activity size={24} className="text-[var(--color-blood)] mb-2" />
              <span className="text-xs font-bold text-[var(--color-bone)] uppercase tracking-wider">Feedback</span>
            </button>
          </div>
        </div>
      )}

      {/* ----------------- PROGRESS TAB ----------------- */}
      {activeTab === 'PROGRESS' && (
        <div className="flex-1 px-4 pt-8 animate-fade-in-up">
          <h1 className="text-3xl font-display font-bold mb-6 text-[var(--color-bone)] uppercase tracking-wide">Your Glory</h1>
          
          <div className="bg-[var(--color-charcoal)] p-6 rounded-none border-l-4 border-[var(--color-bronze)] mb-6 flex items-center gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-5 text-8xl font-display text-[var(--color-bronze)] translate-x-4 -translate-y-4">STREAK</div>
            <div className="flex-1 relative z-10">
              <h3 className="text-[var(--color-ash)] text-sm font-bold uppercase tracking-wider mb-1">Current Streak</h3>
              <div className="text-5xl font-display font-black text-[var(--color-bone)] flex items-baseline gap-2">
                🔥 {streak} <span className="text-lg text-[var(--color-ash)] font-sans">Days</span>
              </div>
              <p className="text-xs text-[var(--color-blood)] font-bold uppercase tracking-widest mt-2">Keep the fire burning!</p>
            </div>
          </div>

          <div className="bg-[var(--color-charcoal)] p-6 rounded-none border border-gray-800 mb-6 relative">
            <h3 className="text-[var(--color-bone)] font-bold font-display uppercase tracking-wider mb-2 flex items-center gap-2">
              <span>🍩</span> Spoils of War
            </h3>
            <p className="text-[var(--color-ash)] text-sm mb-4">
              You've burned an estimated <strong>{totalCalories} kcal</strong>. That's equivalent to:
            </p>
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-[var(--color-abyss)] p-4 rounded-none text-center border border-gray-800">
                <span className="text-4xl block mb-2">🍩</span>
                <span className="font-display font-bold text-3xl text-[var(--color-bone)] block leading-none mb-1">{donuts}</span>
                <span className="text-xs text-[var(--color-ash)] font-bold uppercase tracking-widest block">Donuts</span>
              </div>
              <div className="flex-1 bg-[var(--color-abyss)] p-4 rounded-none text-center border border-gray-800">
                <span className="text-4xl block mb-2">🍺</span>
                <span className="font-display font-bold text-3xl text-[var(--color-bone)] block leading-none mb-1">{beers}</span>
                <span className="text-xs text-[var(--color-ash)] font-bold uppercase tracking-widest block">Beers</span>
              </div>
            </div>
          </div>

          <div className="text-center py-10 opacity-30">
            <span className="text-4xl grayscale">⚔️</span>
            <p className="mt-4 font-bold text-[var(--color-bone)] uppercase tracking-widest">More carnage coming soon</p>
          </div>
        </div>
      )}

      {/* ----------------- SETTINGS TAB ----------------- */}
      {activeTab === 'SETTINGS' && (
        <div className="flex-1 px-4 pt-8 animate-fade-in-up">
          <h1 className="text-3xl font-display font-bold mb-6 text-[var(--color-bone)] uppercase tracking-wide">Armory Settings</h1>
          
          <div className="pt-2">
            <h3 className="text-xs font-bold text-[var(--color-blood)] uppercase tracking-widest mb-3">Battle Plan</h3>
            <div className="grid grid-cols-2 gap-3 mb-8">
              <button onClick={() => navigate('/onboarding?step=1')} className="p-3 bg-[var(--color-charcoal)] border border-gray-800 rounded-none flex items-center gap-3 hover:border-[var(--color-bronze)] tap-scale text-left">
                <span className="text-xl">🛠️</span>
                <span className="font-bold text-sm text-[var(--color-bone)] uppercase tracking-wider">Gear</span>
              </button>
              <button onClick={() => navigate('/onboarding?step=2')} className="p-3 bg-[var(--color-charcoal)] border border-gray-800 rounded-none flex items-center gap-3 hover:border-[var(--color-bronze)] tap-scale text-left">
                <span className="text-xl">🎯</span>
                <span className="font-bold text-sm text-[var(--color-bone)] uppercase tracking-wider">Targets</span>
              </button>
              <button onClick={() => navigate('/onboarding?step=3')} className="p-3 bg-[var(--color-charcoal)] border border-gray-800 rounded-none flex items-center gap-3 hover:border-[var(--color-bronze)] tap-scale text-left">
                <span className="text-xl">⚡</span>
                <span className="font-bold text-sm text-[var(--color-bone)] uppercase tracking-wider">Routine</span>
              </button>
              <button onClick={() => navigate('/onboarding?step=4')} className="p-3 bg-[var(--color-charcoal)] border border-gray-800 rounded-none flex items-center gap-3 hover:border-[var(--color-bronze)] tap-scale text-left">
                <span className="text-xl">⏰</span>
                <span className="font-bold text-sm text-[var(--color-bone)] uppercase tracking-wider">Schedule</span>
              </button>
              <button onClick={() => navigate('/onboarding?step=5')} className="p-3 bg-[var(--color-charcoal)] border border-gray-800 rounded-none flex items-center gap-3 hover:border-[var(--color-bronze)] tap-scale text-left">
                <span className="text-xl">💀</span>
                <span className="font-bold text-sm text-[var(--color-bone)] uppercase tracking-wider">Spotter</span>
              </button>
              <button onClick={() => navigate('/onboarding?step=6')} className="p-3 bg-[var(--color-charcoal)] border border-gray-800 rounded-none flex items-center gap-3 hover:border-[var(--color-bronze)] tap-scale text-left">
                <span className="text-xl">🚪</span>
                <span className="font-bold text-sm text-[var(--color-bone)] uppercase tracking-wider">Alerts</span>
              </button>
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[var(--color-blood)] uppercase tracking-widest mb-3">Desertion</h3>
            <button onClick={handleSoftDelete} className="w-full p-4 flex items-center justify-center gap-3 text-[var(--color-blood)] bg-[var(--color-charcoal)] rounded-none border border-gray-800 hover:border-[var(--color-blood)] transition-colors">
              <Trash2 size={20} />
              <span className="font-bold uppercase tracking-wider">Surrender & Delete</span>
            </button>
            <button onClick={handleLogout} className="w-full p-4 flex items-center justify-center gap-3 text-[var(--color-ash)] bg-[var(--color-charcoal)] rounded-none border border-gray-800 hover:text-[var(--color-bone)] transition-colors">
              <LogOut size={20} />
              <span className="font-bold uppercase tracking-wider">Retreat (Logout)</span>
            </button>
          </div>
        </div>
      )}

      {/* ----------------- BOTTOM NAV ----------------- */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[var(--color-charcoal)]/90 backdrop-blur-md border-t border-[var(--color-abyss)] pb-safe z-40">
        <div className="flex items-center justify-around p-2">
          <button 
            onClick={() => setActiveTab('HOME')} 
            className={`flex flex-col items-center p-2 transition-colors ${activeTab === 'HOME' ? 'text-[var(--color-bronze)]' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Home size={24} className="mb-1" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Home</span>
          </button>
          <button 
            onClick={() => setActiveTab('PROGRESS')} 
            className={`flex flex-col items-center p-2 transition-colors ${activeTab === 'PROGRESS' ? 'text-[var(--color-bronze)]' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <BarChart2 size={24} className="mb-1" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Glory</span>
          </button>
          <button 
            onClick={() => setActiveTab('SETTINGS')} 
            className={`flex flex-col items-center p-2 transition-colors ${activeTab === 'SETTINGS' ? 'text-[var(--color-bronze)]' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <SettingsIcon size={24} className="mb-1" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Armory</span>
          </button>
        </div>
      </div>

      {/* Daily Feedback Bottom Sheet */}
      {showFeedback && (
        <div className="fixed inset-0 bg-black/80 z-50 flex flex-col justify-end">
          <div className="bg-[var(--color-charcoal)] rounded-t-none p-6 pb-12 animate-fade-in-up border-t border-[var(--color-blood)] border-opacity-30">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-display uppercase tracking-wider text-[var(--color-bone)] font-bold">How was your assault?</h2>
              <button onClick={() => setShowFeedback(false)} className="text-[var(--color-ash)] hover:text-white font-bold p-2">✕</button>
            </div>
            <p className="text-sm text-[var(--color-ash)] mb-6">Your feedback will automatically adjust tomorrow's session difficulty (Progressive Overload).</p>
            
            <div className="grid grid-cols-3 gap-3">
              <button onClick={() => handleFeedback('easy')} className="p-4 rounded-none border border-gray-800 bg-[var(--color-abyss)] hover:border-[var(--color-bronze)] font-bold text-[var(--color-ash)] hover:text-[var(--color-bone)] flex flex-col items-center gap-2 transition-all">
                <span className="text-2xl opacity-50 grayscale">😎</span>
                <span className="uppercase text-xs tracking-widest">Too Easy</span>
              </button>
              <button onClick={() => handleFeedback('good')} className="p-4 rounded-none border border-[var(--color-bronze)] bg-[var(--color-abyss)] font-bold text-[var(--color-bronze)] flex flex-col items-center gap-2 shadow-[0_0_15px_rgba(200,154,81,0.2)]">
                <span className="text-2xl">🔥</span>
                <span className="uppercase text-xs tracking-widest">Bloody</span>
              </button>
              <button onClick={() => handleFeedback('hard')} className="p-4 rounded-none border border-gray-800 bg-[var(--color-abyss)] hover:border-[var(--color-blood)] font-bold text-[var(--color-ash)] hover:text-[var(--color-blood)] flex flex-col items-center gap-2 transition-all">
                <span className="text-2xl grayscale">💀</span>
                <span className="uppercase text-xs tracking-widest">Dead</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
