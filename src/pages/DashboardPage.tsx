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
    const confirmed = window.confirm("정말 탈퇴하시겠습니까? (Soft Delete)");
    if (confirmed) {
      try {
        await deactivateUser(user.uid);
        alert("탈퇴 처리가 완료되었습니다.");
        await signOut(auth);
        navigate('/');
      } catch (e) {
        console.error("탈퇴 중 오류 발생:", e);
        alert("오류가 발생했습니다.");
      }
    }
  };

  const handleShare = () => {
    // 3인칭 클립보드 복사 바이럴 텍스트 (예: 스파르타 교관 톤)
    const text = "🤬 스파르타 교관: \"이 게으른 자식이 덤벨 12kg을 들고 거들먹거린다. 몇 주나 가는지 보자. 같이 할 사람? [스낵짐 링크]\"";
    navigator.clipboard.writeText(text);
    alert("클립보드에 복사되었습니다! 사내 메신저(슬랙/팀즈)에 자랑해보세요.");
  };

  const [showFeedback, setShowFeedback] = useState(false);
  const handleFeedback = (level: string) => {
    // TODO: Firestore 피드백 저장 및 내일의 Progressive Overload 난이도 오토 스케일링 로직 호출
    console.log("Feedback recorded:", level);
    alert("피드백이 기록되었습니다. 내일 세션 난이도에 반영됩니다!");
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
          지금 바로 1분 스낵하기
        </Link>
        <div className="glass-card px-4 py-3 rounded-2xl max-w-xs w-full text-center mb-8 border border-gray-100 shadow-sm">
          <p className="text-sm font-bold text-gray-800">"스스로 움직이다니 기특하군. 당장 조져라!" - 🤬</p>
        </div>

        {/* Dashboard Actions */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
          <button onClick={handleShare} className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-blue-200 tap-scale">
            <Share2 size={24} className="text-blue-500 mb-2" />
            <span className="text-xs font-bold text-gray-600">슬랙/팀즈 공유</span>
          </button>
          <button onClick={() => setShowFeedback(true)} className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-green-200 tap-scale">
            <Activity size={24} className="text-green-500 mb-2" />
            <span className="text-xs font-bold text-gray-600">일일 난이도 평가</span>
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 z-50 flex flex-col justify-end">
          <div className="bg-white rounded-t-3xl p-6 animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">설정</h2>
              <button onClick={() => setShowSettings(false)} className="text-gray-400 font-bold p-2">✕</button>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl flex items-center justify-between">
                <span className="font-medium text-gray-700">오늘 하루 알림 끄기 (Snooze) 💤</span>
                {/* Placeholder Toggle (Checked state) */}
                <div className="w-12 h-6 bg-[var(--color-primary)] rounded-full flex justify-end p-0.5 cursor-pointer">
                  <div className="w-5 h-5 bg-white rounded-full shadow-sm"></div>
                </div>
              </div>
              
              <button onClick={handleLogout} className="w-full p-4 flex items-center gap-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                <LogOut size={20} />
                <span className="font-medium">로그아웃</span>
              </button>
              
              <button onClick={handleSoftDelete} className="w-full p-4 flex items-center gap-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors mt-8">
                <Trash2 size={20} />
                <span className="font-medium">서비스 탈퇴 (소프트 딜리트)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Daily Feedback Bottom Sheet */}
      {showFeedback && (
        <div className="fixed inset-0 bg-black/50 z-50 flex flex-col justify-end">
          <div className="bg-white rounded-t-3xl p-6 pb-12 animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">오늘 스낵 강도는 어떠셨나요?</h2>
              <button onClick={() => setShowFeedback(false)} className="text-gray-400 font-bold p-2">✕</button>
            </div>
            <p className="text-sm text-gray-500 mb-6">입력해주신 피드백을 바탕으로 내일 세션의 중량과 횟수가 자동으로 조절(Progressive Overload)됩니다.</p>
            
            <div className="grid grid-cols-3 gap-3">
              <button onClick={() => handleFeedback('easy')} className="p-4 rounded-2xl border border-gray-200 hover:bg-green-50 hover:border-green-300 font-bold text-green-700 flex flex-col items-center gap-2">
                <span className="text-2xl">😎</span>
                쉬움
              </button>
              <button onClick={() => handleFeedback('good')} className="p-4 rounded-2xl border border-blue-200 bg-blue-50 font-bold text-blue-700 flex flex-col items-center gap-2 shadow-sm">
                <span className="text-2xl">🔥</span>
                적당함
              </button>
              <button onClick={() => handleFeedback('hard')} className="p-4 rounded-2xl border border-gray-200 hover:bg-red-50 hover:border-red-300 font-bold text-red-700 flex flex-col items-center gap-2">
                <span className="text-2xl">🥵</span>
                어려움
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
