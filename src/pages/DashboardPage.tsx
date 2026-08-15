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
    if (window.confirm("Are you sure you want to delete your account?")) {
      try {
        await deactivateUser(user.uid);
        alert("Account deleted successfully.");
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
    alert("Copied to clipboard! Share it on Slack/Teams.");
  };

  const handleFeedback = (level: string) => {
    console.log("Feedback recorded:", level);
    alert("Feedback recorded. Tomorrow's session will adjust accordingly!");
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
    <div className="min-h-screen bg-gray-50 pb-24 flex flex-col max-w-md mx-auto relative font-sans">
      
      {/* ----------------- HOME TAB ----------------- */}
      {activeTab === 'HOME' && (
        <div className="flex-1 px-4 pt-8 animate-fade-in-up">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Hello, {user?.displayName?.split(' ')[0] || 'User'}</h1>
              <p className="text-sm text-gray-500">Ready for your daily beating?</p>
            </div>
            <button 
              onClick={toggleSnooze}
              className={`flex items-center gap-2 px-3 py-2 rounded-full font-bold text-sm transition-all tap-scale shadow-sm ${
                isSnoozed ? 'bg-[var(--color-primary)] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <BellOff size={16} className={isSnoozed ? 'text-white' : 'text-gray-400'} />
              {isSnoozed ? 'Snoozed 💤' : 'Snooze'}
            </button>
          </div>

          <div className="glass-card px-4 py-3 rounded-2xl w-full text-center mb-8 border border-gray-100 shadow-sm relative">
            <span className="absolute -top-4 -left-2 text-3xl">{userData.spotter === 'TSUNDERE' ? '😒' : userData.spotter === 'ANGEL' ? '🥰' : '🤬'}</span>
            <p className="text-sm font-bold text-gray-800 ml-4">
              {userData.spotter === 'TSUNDERE' ? "I guess you should start... Not that I care." 
                : userData.spotter === 'ANGEL' ? "You're doing amazing! Let's do one more!" 
                : "Get up lazy bones! Time to crush it!"}
            </p>
          </div>

          {/* Daily Snack Ring & Quick Start */}
          <div className="flex justify-center items-center relative py-6">
            <svg className="w-[300px] h-[300px] transform -rotate-90">
              <circle
                cx="150" cy="150" r={radius}
                stroke="#E5E7EB" strokeWidth="20" fill="transparent"
                strokeLinecap="round"
              />
              <circle
                cx="150" cy="150" r={radius}
                stroke="var(--color-primary)" strokeWidth="20" fill="transparent"
                strokeLinecap="round"
                style={{
                  strokeDasharray: circumference,
                  strokeDashoffset: strokeDashoffset,
                  transition: 'stroke-dashoffset 1s ease-out'
                }}
              />
            </svg>
            
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-1">Today</span>
              <span className="text-5xl font-black text-gray-800 mb-4">{todaySessions}<span className="text-2xl text-gray-400">/{sessionsPerDay}</span></span>
              
              <Link 
                to="/session/manual-1" 
                className="px-6 py-3 rounded-full text-white font-bold text-lg flex items-center gap-2 tap-scale shadow-lg shadow-green-200"
                style={{ background: 'linear-gradient(135deg, #3CCF4E 0%, #189AB4 100%)' }}
              >
                <span className="text-xl animate-bounce">⚡</span> Quick Start
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8">
            <button onClick={handleShare} className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-blue-200 tap-scale">
              <Share2 size={24} className="text-blue-500 mb-2" />
              <span className="text-xs font-bold text-gray-600">Share Score</span>
            </button>
            <button onClick={() => setShowFeedback(true)} className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-green-200 tap-scale">
              <Activity size={24} className="text-green-500 mb-2" />
              <span className="text-xs font-bold text-gray-600">Feedback</span>
            </button>
          </div>
        </div>
      )}

      {/* ----------------- PROGRESS TAB ----------------- */}
      {activeTab === 'PROGRESS' && (
        <div className="flex-1 px-4 pt-8 animate-fade-in-up">
          <h1 className="text-2xl font-bold mb-6">Your Progress</h1>
          
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-6 flex items-center gap-6">
            <div className="flex-1">
              <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Current Streak</h3>
              <div className="text-4xl font-black text-gray-800 flex items-center gap-2">
                🔥 {streak} <span className="text-lg text-gray-400 font-medium">Days</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">Keep the fire burning!</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-3xl shadow-sm border border-orange-100 mb-6">
            <h3 className="text-orange-800 font-bold mb-2 flex items-center gap-2">
              <span>🍩</span> Spoils of War
            </h3>
            <p className="text-orange-900 text-sm mb-4">
              You've burned an estimated <strong>{totalCalories} kcal</strong> so far. That's equivalent to:
            </p>
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-white/60 p-4 rounded-2xl text-center">
                <span className="text-4xl block mb-2">🍩</span>
                <span className="font-bold text-gray-800">{donuts}</span>
                <span className="text-xs text-gray-500 block">Donuts</span>
              </div>
              <div className="flex-1 bg-white/60 p-4 rounded-2xl text-center">
                <span className="text-4xl block mb-2">🍺</span>
                <span className="font-bold text-gray-800">{beers}</span>
                <span className="text-xs text-gray-500 block">Beers</span>
              </div>
            </div>
          </div>

          <div className="text-center py-10 opacity-50">
            <span className="text-4xl grayscale">💪</span>
            <p className="mt-4 font-bold text-gray-500">More charts coming soon!</p>
          </div>
        </div>
      )}

      {/* ----------------- SETTINGS TAB ----------------- */}
      {activeTab === 'SETTINGS' && (
        <div className="flex-1 px-4 pt-8 animate-fade-in-up">
          <h1 className="text-2xl font-bold mb-6">Settings</h1>
          
          <div className="pt-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Onboarding Settings</h3>
            <div className="grid grid-cols-2 gap-3 mb-8">
              <button onClick={() => navigate('/onboarding?step=1')} className="p-3 bg-white border border-gray-200 rounded-xl flex items-center gap-2 hover:border-blue-300 tap-scale text-left">
                <span className="text-xl">🏋️</span>
                <span className="font-bold text-sm text-gray-700">Equipment</span>
              </button>
              <button onClick={() => navigate('/onboarding?step=2')} className="p-3 bg-white border border-gray-200 rounded-xl flex items-center gap-2 hover:border-blue-300 tap-scale text-left">
                <span className="text-xl">💪</span>
                <span className="font-bold text-sm text-gray-700">Muscles</span>
              </button>
              <button onClick={() => navigate('/onboarding?step=3')} className="p-3 bg-white border border-gray-200 rounded-xl flex items-center gap-2 hover:border-blue-300 tap-scale text-left">
                <span className="text-xl">⚡</span>
                <span className="font-bold text-sm text-gray-700">Routine</span>
              </button>
              <button onClick={() => navigate('/onboarding?step=4')} className="p-3 bg-white border border-gray-200 rounded-xl flex items-center gap-2 hover:border-blue-300 tap-scale text-left">
                <span className="text-xl">⏰</span>
                <span className="font-bold text-sm text-gray-700">Time & Freq</span>
              </button>
              <button onClick={() => navigate('/onboarding?step=5')} className="p-3 bg-white border border-gray-200 rounded-xl flex items-center gap-2 hover:border-blue-300 tap-scale text-left">
                <span className="text-xl">🤬</span>
                <span className="font-bold text-sm text-gray-700">Spotter</span>
              </button>
              <button onClick={() => navigate('/onboarding?step=6')} className="p-3 bg-white border border-gray-200 rounded-xl flex items-center gap-2 hover:border-blue-300 tap-scale text-left">
                <span className="text-xl">🔔</span>
                <span className="font-bold text-sm text-gray-700">Alerts</span>
              </button>
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Account</h3>
            <button onClick={handleSoftDelete} className="w-full p-4 flex items-center justify-center gap-3 text-red-500 bg-white shadow-sm rounded-xl border border-gray-100 hover:bg-red-50 transition-colors">
              <Trash2 size={20} />
              <span className="font-bold">Delete Account</span>
            </button>
            <button onClick={handleLogout} className="w-full p-4 flex items-center justify-center gap-3 text-gray-600 bg-white shadow-sm rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
              <LogOut size={20} />
              <span className="font-bold">Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* ----------------- BOTTOM NAV ----------------- */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/80 backdrop-blur-md border-t border-gray-100 pb-safe z-40">
        <div className="flex items-center justify-around p-2">
          <button 
            onClick={() => setActiveTab('HOME')} 
            className={`flex flex-col items-center p-2 transition-colors ${activeTab === 'HOME' ? 'text-[var(--color-primary)]' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Home size={24} className="mb-1" />
            <span className="text-[10px] font-bold">Home</span>
          </button>
          <button 
            onClick={() => setActiveTab('PROGRESS')} 
            className={`flex flex-col items-center p-2 transition-colors ${activeTab === 'PROGRESS' ? 'text-[var(--color-primary)]' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <BarChart2 size={24} className="mb-1" />
            <span className="text-[10px] font-bold">Progress</span>
          </button>
          <button 
            onClick={() => setActiveTab('SETTINGS')} 
            className={`flex flex-col items-center p-2 transition-colors ${activeTab === 'SETTINGS' ? 'text-[var(--color-primary)]' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <SettingsIcon size={24} className="mb-1" />
            <span className="text-[10px] font-bold">Settings</span>
          </button>
        </div>
      </div>

      {/* Daily Feedback Bottom Sheet */}
      {showFeedback && (
        <div className="fixed inset-0 bg-black/50 z-50 flex flex-col justify-end">
          <div className="bg-white rounded-t-3xl p-6 pb-12 animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">How was your assault?</h2>
              <button onClick={() => setShowFeedback(false)} className="text-gray-400 font-bold p-2">✕</button>
            </div>
            <p className="text-sm text-gray-500 mb-6">Your feedback will automatically adjust tomorrow's session difficulty (Progressive Overload).</p>
            
            <div className="grid grid-cols-3 gap-3">
              <button onClick={() => handleFeedback('easy')} className="p-4 rounded-2xl border border-gray-200 hover:bg-green-50 hover:border-green-300 font-bold text-green-700 flex flex-col items-center gap-2">
                <span className="text-2xl">😎</span>
                Easy
              </button>
              <button onClick={() => handleFeedback('good')} className="p-4 rounded-2xl border border-blue-200 bg-blue-50 font-bold text-blue-700 flex flex-col items-center gap-2 shadow-sm">
                <span className="text-2xl">🔥</span>
                Good
              </button>
              <button onClick={() => handleFeedback('hard')} className="p-4 rounded-2xl border border-gray-200 hover:bg-red-50 hover:border-red-300 font-bold text-red-700 flex flex-col items-center gap-2">
                <span className="text-2xl">🥵</span>
                Hard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
