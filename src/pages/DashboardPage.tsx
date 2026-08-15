import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { deactivateUser } from '../lib/firestore';
import { Settings, LogOut, Trash2, Share2, Activity } from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const [showSettings, setShowSettings] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const handleSoftDelete = async () => {
    if (!user) return;
    const confirmed = window.confirm("Are you sure you want to delete your account?");
    if (confirmed) {
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
    const text = "🤬 Spartan Spotter: \"This lazy one just lifted 12kg dumbbells. Let's see how long this lasts. Who's in? [SnackGym Link]\"";
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard! Share it on Slack/Teams.");
  };

  const [showFeedback, setShowFeedback] = useState(false);
  const handleFeedback = (level: string) => {
    console.log("Feedback recorded:", level);
    alert("Feedback recorded. Tomorrow's session will adjust accordingly!");
    setShowFeedback(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 pt-8 px-4 flex flex-col max-w-md mx-auto relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Hello, {user?.displayName?.split(' ')[0] || 'User'}</h1>
          <p className="text-sm text-gray-500">Ready for a snack?</p>
        </div>
        <button 
          onClick={() => setShowSettings(true)}
          className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100"
        >
          <Settings size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Main Action */}
      <div className="flex-1 flex flex-col justify-center items-center -mt-10">
        <Link to="/session/manual-1" className="w-full max-w-xs py-8 rounded-3xl text-white font-bold text-xl flex flex-col items-center gap-2 tap-scale mb-4 relative"
          style={{ background: 'linear-gradient(135deg, #3CCF4E 0%, #189AB4 100%)', boxShadow: '0 8px 32px rgba(60, 207, 78, 0.4)' }}
        >
          <span className="text-4xl animate-bounce">⚡</span>
          Start 1-min Snack Now
        </Link>
        <div className="glass-card px-4 py-3 rounded-2xl max-w-xs w-full text-center mb-8 border border-gray-100 shadow-sm">
          <p className="text-sm font-bold text-gray-800">"You moved on your own? Good. Now crush it!" - 🤬</p>
        </div>

        {/* Dashboard Actions */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
          <button onClick={handleShare} className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-blue-200 tap-scale">
            <Share2 size={24} className="text-blue-500 mb-2" />
            <span className="text-xs font-bold text-gray-600">Share on Slack/Teams</span>
          </button>
          <button onClick={() => setShowFeedback(true)} className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-green-200 tap-scale">
            <Activity size={24} className="text-green-500 mb-2" />
            <span className="text-xs font-bold text-gray-600">Daily Feedback</span>
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 z-50 flex flex-col justify-end">
          <div className="bg-white rounded-t-3xl p-6 animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Settings</h2>
              <button onClick={() => setShowSettings(false)} className="text-gray-400 font-bold p-2">✕</button>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl flex items-center justify-between">
                <span className="font-medium text-gray-700">Snooze alarms for today 💤</span>
                {/* Placeholder Toggle (Checked state) */}
                <div className="w-12 h-6 bg-[var(--color-primary)] rounded-full flex justify-end p-0.5 cursor-pointer">
                  <div className="w-5 h-5 bg-white rounded-full shadow-sm"></div>
                </div>
              </div>

              <div className="pt-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Onboarding Settings</h3>
                <div className="grid grid-cols-2 gap-3">
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
              
              <div className="pt-6 space-y-2">
                <button onClick={handleSoftDelete} className="w-full p-4 flex items-center justify-center gap-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors border border-transparent">
                  <Trash2 size={20} />
                  <span className="font-bold">Delete Account</span>
                </button>
                <button onClick={handleLogout} className="w-full p-4 flex items-center justify-center gap-3 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200">
                  <LogOut size={20} />
                  <span className="font-bold">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Daily Feedback Bottom Sheet */}
      {showFeedback && (
        <div className="fixed inset-0 bg-black/50 z-50 flex flex-col justify-end">
          <div className="bg-white rounded-t-3xl p-6 pb-12 animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">How was today's snack?</h2>
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
