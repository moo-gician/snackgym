import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db, auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { deactivateUser, skipSession } from '../lib/firestore';
import type { UserProfile } from '../lib/firestore';
import { LogOut, Trash2, Share2, Activity, BellOff, User, SkipForward, Play } from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = auth.currentUser;
  
  const [activeTab, setActiveTab] = useState<'HOME' | 'PROGRESS' | 'SETTINGS'>('HOME');
  const [userData, setUserData] = useState<Partial<UserProfile>>({});
  const [isSnoozed, setIsSnoozed] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  
  const [nextSessionTime, setNextSessionTime] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('--:--:--');

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

  // Calculate Next Session Time
  useEffect(() => {
    if (!userData.alarmTimes || userData.alarmTimes.length === 0) return;
    
    const { completedAlarms = [], skippedAlarms = [] } = userData;

    // Find the first alarm time that is not completed and not skipped
    let next = null;
    for (const timeStr of userData.alarmTimes) {
      if (completedAlarms.includes(timeStr) || skippedAlarms.includes(timeStr)) continue;
      
      // Even if the time has passed, if it hasn't been completed or skipped, it is the 'next' overdue session.
      // Alternatively, we strictly take the next future one. But usually, if it's past due, you still need to do it or skip it.
      // So we just take the first uncompleted/unskipped one in the list.
      next = timeStr;
      break;
    }
    setNextSessionTime(next);
  }, [userData]);

  // Countdown Timer Update
  useEffect(() => {
    if (!nextSessionTime) {
      setTimeLeft('NO SESSIONS');
      return;
    }

    const intervalId = setInterval(() => {
      const now = new Date();
      const [nH, nM] = nextSessionTime.split(':').map(Number);
      const targetDate = new Date();
      targetDate.setHours(nH, nM, 0, 0);

      let diff = targetDate.getTime() - now.getTime();
      
      if (diff < 0) {
        setTimeLeft('OVERDUE');
      } else {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [nextSessionTime]);

  const handleSkipSession = async () => {
    if (!user || !nextSessionTime) return;
    if (window.confirm("Skip this session? Your spotter will remember this cowardice.")) {
      await skipSession(user.uid, nextSessionTime);
      // Refresh user data to recalculate
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      setUserData(userDoc.data() as Partial<UserProfile>);
    }
  };

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

  const sessionsPerDay = userData.alarmTimes ? userData.alarmTimes.length : (userData.sessionsPerDay || 6);
  // Re-calculate todaySessions based on completedAlarms array length if possible to ensure perfect sync
  const todaySessions = userData.completedAlarms ? userData.completedAlarms.length : (userData.todaySessions || 0);
  const totalCalories = Math.floor(userData.totalCalories || 0);
  const streak = userData.currentStreak || 0;
  
  const progressPercent = Math.min(todaySessions / sessionsPerDay, 1);
  const donuts = Math.floor(totalCalories / 250);
  const beers = Math.floor(totalCalories / 150);

  return (
    <div className="min-h-screen bg-[var(--color-abyss)] text-[var(--color-ash)] pb-24 flex flex-col font-sans">
      
      {/* HEADER */}
      <header className="fixed top-0 inset-x-0 z-50 bg-[var(--color-abyss)]/80 backdrop-blur-xl pt-safe">
        <div className="h-16 px-4 flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center gap-2">
            <img alt="B.E.A.S.T. Logo" className="h-8 w-auto object-contain" src="https://lh3.googleusercontent.com/aida/AP1WRLvL3hsJ2y4za4DRON2I13kxqT-k84HauYfDzQw6W6u3cozHNVsMbONuPLoKkpVT9dK2a1_u0uo5vksj3dc0-FFdlJ-HgueDt5Cr7wA0Nbke59Hpo54CjjZVI1U9V7fLylSFWlbOuYQr89qYPV01DmM5z23_uMNsQEX5cTcUVnv7nVqkVilcjqh6NlXdPTs3E1aAlwUkt9IGCc1g546aHK--oY8-vDnNFeA2ALgnjZJX0QPTTSslf65rvyo" />
            <span className="font-display font-bold text-[16px] uppercase tracking-wider text-[var(--color-bronze)] leading-none mt-1">Camp Dashboard</span>
          </div>
          <button onClick={handleLogout} className="w-8 h-8 rounded-none border border-[var(--color-bronze)] bg-[var(--color-abyss)] flex items-center justify-center shadow-[0_0_10px_rgba(200,154,81,0.2)] hover:bg-[var(--color-charcoal)] transition-colors">
            <User size={18} className="text-[var(--color-bronze)]" />
          </button>
        </div>
      </header>

      <main className="flex-1 relative w-full pt-16 max-w-md mx-auto h-full flex flex-col">
        {/* Decorative Grid */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0" style={{ backgroundImage: 'linear-gradient(#c8c5cb 1px, transparent 1px), linear-gradient(90deg, #c8c5cb 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

        {/* ----------------- HOME TAB ----------------- */}
        {activeTab === 'HOME' && (
          <div className="flex-1 w-full flex flex-col animate-fade-in-up z-10">
            {/* Top Bar */}
            <div className="w-full px-4 py-4 flex items-center justify-between z-10 border-b border-gray-800 bg-[var(--color-charcoal)]/50 backdrop-blur-md">
              <div className="flex items-center gap-2 text-[var(--color-bronze)]">
                <span className="text-xl">⚔️</span>
                <h2 className="font-display font-bold text-xl uppercase tracking-wider text-[var(--color-bone)] mt-1">Day {streak || 1} in the Phalanx</h2>
              </div>
              <button 
                onClick={toggleSnooze}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-none border transition-colors ${
                  isSnoozed 
                    ? 'bg-red-900/20 border-red-500 text-red-500' 
                    : 'bg-gray-800 border-gray-700 text-[var(--color-ash)] hover:bg-gray-700'
                }`}
              >
                <BellOff size={14} />
                <span className="font-display font-bold text-sm uppercase mt-0.5">{isSnoozed ? 'Snoozed' : 'Snooze'}</span>
              </button>
            </div>
            
            {/* Spotter Bubble */}
            <div className={`px-4 z-10 mt-6 transition-all duration-700 ${isSnoozed ? 'grayscale opacity-70' : ''}`}>
              <div className="relative bg-[var(--color-charcoal)] border border-[var(--color-blood)]/30 p-4 rounded-none shadow-[0_0_20px_rgba(217,26,26,0.15)] overflow-hidden">
                <div className="absolute top-0 right-0 w-2 h-2 bg-[var(--color-blood)]"></div>
                <div className="absolute top-0 left-0 right-2 h-[1px] bg-gradient-to-r from-[var(--color-blood)]/50 to-transparent"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(217,26,26,0.03)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px] pointer-events-none"></div>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-14 h-14 bg-[var(--color-abyss)] border border-[var(--color-blood)] rounded-full flex items-center justify-center shrink-0 overflow-hidden shadow-[0_0_15px_rgba(217,26,26,0.3)]">
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuD51FeObMtC6z6ZBtJD8p6aNUgd5xOxJmaxBhjMam0av-ygMXreK223xu94s9zt2p0xexAYJZAN4j31JplRuwrkCgLsWb8f83fxT7FPPVmbI5JuNU5V6i1OMfNdTD7agx2yArUXmxHdaESYc-KnNuwfRu_b86KMi9AsmxCZG_jUf5rrpUhP3VE8saA2CZO1DXeM24KLHR-xUTzAOY3yJ88F9Ct03InCCfqxmjaoHErs8D0xqnq108-0" alt="Spartan Spotter" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="font-headline-md text-[var(--color-blood)] uppercase tracking-wider block mb-1">Spartan Spotter</span>
                    <p className={`font-body-md text-[var(--color-bone)] italic leading-snug ${!isSnoozed ? 'animate-pulse' : ''}`}>
                      {isSnoozed 
                        ? `"Snoozing, ${auth.currentUser?.displayName?.split(' ')[0] || 'Recruit'}? I guess weakness is your new PR. Turn that off and get back to work!"`
                        : `"${auth.currentUser?.displayName?.split(' ')[0] || 'Recruit'}, your chair is making you soft. Drop and give me 20. Excuses burn zero calories."`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Progress Ring */}
            <div className={`flex-1 flex flex-col items-center justify-center relative p-4 mt-6 transition-all duration-700 ${isSnoozed ? 'grayscale opacity-50' : ''}`}>
              <div className={`absolute inset-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-[var(--color-bronze)]/10 blur-[60px] pointer-events-none ${!isSnoozed ? 'animate-pulse' : ''}`}></div>
              <div className="relative w-72 h-72 flex items-center justify-center">
                <svg className={`absolute inset-0 w-full h-full -rotate-90 drop-shadow-[0_0_15px_rgba(200,154,81,0.3)] ${!isSnoozed ? 'animate-[spin_20s_linear_infinite_reverse]' : ''}`} viewBox="0 0 100 100">
                  <circle cx="50" cy="50" fill="none" r="42" stroke="#33343c" strokeWidth="8"></circle>
                  <defs>
                    <linearGradient id="ringHeat" x1="0%" x2="100%" y1="0%" y2="100%">
                      <stop offset="0%" stopColor="var(--color-blood)"></stop>
                      <stop offset="100%" stopColor="var(--color-bronze)"></stop>
                    </linearGradient>
                  </defs>
                  <circle 
                    cx="50" cy="50" fill="none" r="42" stroke="url(#ringHeat)" 
                    strokeDasharray="264" 
                    strokeDashoffset={264 - (progressPercent * 264)} 
                    strokeLinecap="butt" strokeWidth="8"
                    className="transition-all duration-1000 ease-out"
                  ></circle>
                </svg>
                
                <div className="flex flex-col items-center justify-center text-center p-4">
                  <span className="font-display font-bold text-xs text-[var(--color-ash)] uppercase tracking-[0.1em] mb-1">Completed Assaults</span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-display font-black text-6xl leading-none text-[var(--color-bone)]">{todaySessions}</span>
                    <span className="font-display font-bold text-2xl text-[var(--color-ash)]">/ {sessionsPerDay}</span>
                  </div>
                  <span className="font-display font-bold text-xs text-[var(--color-ash)] uppercase mt-2 tracking-widest">Strikes</span>
                </div>
                
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-1 bg-[var(--color-bronze)]"></div>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-4 h-1 bg-gray-600"></div>
                <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-4 bg-[var(--color-bronze)]"></div>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1 h-4 bg-gray-600"></div>
              </div>
            </div>


            {/* Countdown & Action Buttons */}
            <div className="px-4 mb-8 z-10 flex flex-col items-center">
              <div className="mb-4 text-center">
                <span className="font-display font-bold text-xs uppercase tracking-[0.2em] text-[var(--color-ash)] block mb-1">Next Strike In</span>
                <div className={`font-display font-black text-4xl tracking-wider ${isSnoozed ? 'text-gray-600' : 'text-[var(--color-bone)] drop-shadow-[0_0_10px_rgba(230,225,216,0.3)]'}`}>
                  {timeLeft}
                </div>
              </div>

              <div className="flex gap-3 w-full">
                <button 
                  onClick={handleSkipSession}
                  disabled={!nextSessionTime || isSnoozed}
                  className="flex-1 bg-[var(--color-charcoal)] border border-gray-700 hover:border-[var(--color-ash)] text-[var(--color-ash)] py-3 px-2 flex items-center justify-center gap-2 rounded-none transition-all disabled:opacity-50"
                >
                  <SkipForward size={18} />
                  <span className="font-display font-bold text-sm uppercase tracking-wider mt-0.5">Skip Session</span>
                </button>
                
                <button 
                  onClick={() => nextSessionTime && navigate(`/session/scheduled?time=${nextSessionTime}`)}
                  disabled={!nextSessionTime || isSnoozed}
                  className="flex-[2] relative group overflow-hidden bg-[var(--color-bronze)] py-3 px-4 flex items-center justify-center gap-2 border border-yellow-600 shadow-[0_0_15px_rgba(200,154,81,0.2)] hover:shadow-[0_0_25px_rgba(200,154,81,0.4)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale"
                >
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIwLjIiLz48L3N2Zz4=')] opacity-20 group-hover:opacity-40 transition-opacity"></div>
                  <span className="font-display font-bold text-[15px] text-[var(--color-abyss)] uppercase tracking-widest relative z-10 flex items-center gap-2 mt-0.5">
                    Start Scheduled
                    <Play size={16} className="fill-current -mt-0.5" />
                  </span>
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-white/30 z-10"></div>
                </button>
              </div>

              <Link to="/session/manual" className="mt-4 text-xs font-bold text-gray-500 hover:text-[var(--color-ash)] uppercase tracking-widest underline underline-offset-4">
                Start Manual Assault Instead
              </Link>
            </div>
          </div>
        )}

        {/* ----------------- PROGRESS TAB ----------------- */}
        {activeTab === 'PROGRESS' && (
          <div className="flex-1 px-4 pt-8 animate-fade-in-up z-10">
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
              <div className="absolute top-0 right-0 w-2 h-2 bg-[var(--color-bronze)]"></div>
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

        {/* ----------------- SETTINGS TAB ----------------- */}
        {activeTab === 'SETTINGS' && (
          <div className="flex-1 px-4 pt-8 animate-fade-in-up z-10">
            <h1 className="text-3xl font-display font-bold mb-6 text-[var(--color-bone)] uppercase tracking-wide">Armory Settings</h1>
            
            <div className="pt-2">
              <h3 className="text-xs font-bold text-[var(--color-blood)] uppercase tracking-widest mb-3">Battle Plan</h3>
              <div className="grid grid-cols-2 gap-3 mb-8">
                <button onClick={() => navigate('/onboarding?step=1')} className="p-3 bg-[var(--color-charcoal)] border border-gray-800 rounded-none flex items-center gap-3 hover:border-[var(--color-bronze)] tap-scale text-left">
                  <span className="text-xl">🛠️</span>
                  <span className="font-bold text-sm text-[var(--color-bone)] uppercase tracking-wider mt-0.5">Gear</span>
                </button>
                <button onClick={() => navigate('/onboarding?step=2')} className="p-3 bg-[var(--color-charcoal)] border border-gray-800 rounded-none flex items-center gap-3 hover:border-[var(--color-bronze)] tap-scale text-left">
                  <span className="text-xl">🎯</span>
                  <span className="font-bold text-sm text-[var(--color-bone)] uppercase tracking-wider mt-0.5">Targets</span>
                </button>
                <button onClick={() => navigate('/onboarding?step=3')} className="p-3 bg-[var(--color-charcoal)] border border-gray-800 rounded-none flex items-center gap-3 hover:border-[var(--color-bronze)] tap-scale text-left">
                  <span className="text-xl">⚡</span>
                  <span className="font-bold text-sm text-[var(--color-bone)] uppercase tracking-wider mt-0.5">Routine</span>
                </button>
                <button onClick={() => navigate('/onboarding?step=4')} className="p-3 bg-[var(--color-charcoal)] border border-gray-800 rounded-none flex items-center gap-3 hover:border-[var(--color-bronze)] tap-scale text-left">
                  <span className="text-xl">⏰</span>
                  <span className="font-bold text-sm text-[var(--color-bone)] uppercase tracking-wider mt-0.5">Schedule</span>
                </button>
                <button onClick={() => navigate('/onboarding?step=5')} className="p-3 bg-[var(--color-charcoal)] border border-gray-800 rounded-none flex items-center gap-3 hover:border-[var(--color-bronze)] tap-scale text-left">
                  <span className="text-xl">💀</span>
                  <span className="font-bold text-sm text-[var(--color-bone)] uppercase tracking-wider mt-0.5">Spotter</span>
                </button>
                <button onClick={() => navigate('/onboarding?step=6')} className="p-3 bg-[var(--color-charcoal)] border border-gray-800 rounded-none flex items-center gap-3 hover:border-[var(--color-bronze)] tap-scale text-left">
                  <span className="text-xl">🚪</span>
                  <span className="font-bold text-sm text-[var(--color-bone)] uppercase tracking-wider mt-0.5">Alerts</span>
                </button>
              </div>
            </div>
            
            <div className="space-y-3 relative">
              <h3 className="text-xs font-bold text-[var(--color-blood)] uppercase tracking-widest mb-3">Desertion</h3>
              <button onClick={handleSoftDelete} className="w-full p-4 flex items-center justify-center gap-3 text-[var(--color-blood)] bg-[var(--color-charcoal)] rounded-none border border-gray-800 hover:border-[var(--color-blood)] transition-colors">
                <Trash2 size={20} />
                <span className="font-display font-bold uppercase tracking-wider mt-1">Surrender & Delete</span>
              </button>
              <button onClick={handleLogout} className="w-full p-4 flex items-center justify-center gap-3 text-[var(--color-ash)] bg-[var(--color-charcoal)] rounded-none border border-gray-800 hover:text-[var(--color-bone)] transition-colors">
                <LogOut size={20} />
                <span className="font-display font-bold uppercase tracking-wider mt-1">Retreat (Logout)</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ----------------- BOTTOM NAV ----------------- */}
      <footer className="fixed bottom-0 left-0 right-0 w-full bg-transparent pb-safe px-4 z-50">
        <div className="h-24 flex items-center justify-center pb-4">
          <div className="flex items-center bg-[var(--color-charcoal)]/90 backdrop-blur-md rounded-full p-2 border border-gray-800 shadow-2xl w-full max-w-md mx-auto h-[72px]">
            <button 
              onClick={() => setActiveTab('HOME')} 
              className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all duration-300 ${activeTab === 'HOME' ? 'text-[var(--color-bronze)]' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <span className={`text-2xl mb-1 ${activeTab === 'HOME' ? 'drop-shadow-[0_0_10px_rgba(200,154,81,0.5)] scale-110' : ''}`}>⚔️</span>
              <span className="font-display font-bold text-[10px] uppercase tracking-widest">Arena</span>
            </button>
            <button 
              onClick={() => setActiveTab('PROGRESS')} 
              className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all duration-300 ${activeTab === 'PROGRESS' ? 'text-[var(--color-bronze)]' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <span className={`text-2xl mb-1 ${activeTab === 'PROGRESS' ? 'drop-shadow-[0_0_10px_rgba(200,154,81,0.5)] scale-110' : ''}`}>🔥</span>
              <span className="font-display font-bold text-[10px] uppercase tracking-widest">History</span>
            </button>
            <button 
              onClick={() => setActiveTab('SETTINGS')} 
              className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all duration-300 ${activeTab === 'SETTINGS' ? 'text-[var(--color-bronze)]' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <span className={`text-2xl mb-1 ${activeTab === 'SETTINGS' ? 'drop-shadow-[0_0_10px_rgba(200,154,81,0.5)] scale-110' : ''}`}>⚙️</span>
              <span className="font-display font-bold text-[10px] uppercase tracking-widest">Settings</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Daily Feedback Bottom Sheet */}
      {showFeedback && (
        <div className="fixed inset-0 bg-black/80 z-50 flex flex-col justify-end">
          <div className="bg-[var(--color-charcoal)] rounded-t-none p-6 pb-24 animate-fade-in-up border-t border-[var(--color-blood)] border-opacity-30">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-display uppercase tracking-wider text-[var(--color-bone)] font-bold">How was your assault, {auth.currentUser?.displayName?.split(' ')[0] || 'Recruit'}?</h2>
              <button onClick={() => setShowFeedback(false)} className="text-[var(--color-ash)] hover:text-[var(--color-bone)] font-bold p-2 text-xl">✕</button>
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
