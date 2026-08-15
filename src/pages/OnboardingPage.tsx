import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { saveOnboardingData } from '../lib/firestore';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import BodyMap from '../components/BodyMap';
import { IconBodyweight, IconDumbbell, IconPullupBar, IconMat, IconBand, IconBarbell, IconBench } from '../components/EquipmentIcons';

type CourseType = 'MICRO' | 'COMPACT' | 'CIRCUIT' | null;
type SpotterType = 'SPARTAN' | 'TSUNDERE' | 'ANGEL' | null;
type NotificationMethod = 'telegram' | 'email' | 'none' | null;

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  
  // Persisted state via sessionStorage to prevent loss on refresh
  const [equipment, setEquipment] = useState<string[]>(() => {
    const saved = sessionStorage.getItem('ob_equipment');
    const parsed = saved ? JSON.parse(saved) : [];
    return parsed.includes('맨몸') ? parsed : ['맨몸', ...parsed];
  });
  
  const [muscles, setMuscles] = useState<string[]>(() => {
    const saved = sessionStorage.getItem('ob_muscles');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [course, setCourse] = useState<CourseType>(() => {
    return (sessionStorage.getItem('ob_course') as CourseType) || null;
  });

  const [workStartTime, setWorkStartTime] = useState(() => sessionStorage.getItem('ob_workStart') || '09:00');
  const [workEndTime, setWorkEndTime] = useState(() => sessionStorage.getItem('ob_workEnd') || '18:00');
  const [sessionsPerDay, setSessionsPerDay] = useState(() => Number(sessionStorage.getItem('ob_sessions')) || 6);

  const [spotter, setSpotter] = useState<SpotterType>(() => {
    return (sessionStorage.getItem('ob_spotter') as SpotterType) || null;
  });

  const [notificationMethod, setNotificationMethod] = useState<NotificationMethod>(() => {
    return (sessionStorage.getItem('ob_notif') as NotificationMethod) || null;
  });

  useEffect(() => sessionStorage.setItem('ob_equipment', JSON.stringify(equipment)), [equipment]);
  useEffect(() => sessionStorage.setItem('ob_muscles', JSON.stringify(muscles)), [muscles]);
  useEffect(() => { if (course) sessionStorage.setItem('ob_course', course); }, [course]);
  useEffect(() => sessionStorage.setItem('ob_workStart', workStartTime), [workStartTime]);
  useEffect(() => sessionStorage.setItem('ob_workEnd', workEndTime), [workEndTime]);
  useEffect(() => sessionStorage.setItem('ob_sessions', sessionsPerDay.toString()), [sessionsPerDay]);
  useEffect(() => { if (spotter) sessionStorage.setItem('ob_spotter', spotter); }, [spotter]);
  useEffect(() => { if (notificationMethod) sessionStorage.setItem('ob_notif', notificationMethod); }, [notificationMethod]);

  const nextStep = () => setStep(s => Math.min(6, s + 1));
  const prevStep = () => setStep(s => Math.max(1, s - 1));

  const completeOnboarding = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }
    
    try {
      await saveOnboardingData(user.uid, {
        equipment,
        targetMuscles: muscles,
        course: course as any,
        workStartTime,
        workEndTime,
        sessionsPerDay,
        spotter: spotter as any,
        notificationMethod: notificationMethod as any
      });
      
      console.log("Onboarding data saved successfully!");
      
      // Cleanup session storage
      ['ob_equipment', 'ob_muscles', 'ob_course', 'ob_workStart', 'ob_workEnd', 'ob_sessions', 'ob_spotter', 'ob_notif'].forEach(k => sessionStorage.removeItem(k));

      if (notificationMethod === 'telegram') {
        const telegramUrl = `https://t.me/SnackGymBot?start=${user.uid}`;
        window.location.href = telegramUrl;
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error("Failed to save onboarding data:", error);
      alert("데이터 저장 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="min-h-screen pb-24 pt-8 px-4 flex flex-col max-w-md mx-auto">
      {/* Progress Bar */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <div 
            key={idx}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              step >= idx ? 'bg-[var(--color-primary)]' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      <div className="flex-1 animate-fade-in-up">
        {step === 1 && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">주변 장비를<br/>체크해주세요</h1>
            <p className="text-[var(--color-text-muted)]">없어도 괜찮아요. 맨몸 루틴이 상시 준비되어 있습니다.</p>
            <div className="grid grid-cols-2 gap-4 mt-8">
              {[
                { id: '맨몸', Icon: IconBodyweight, label: '맨몸 (항상)' },
                { id: '덤벨', Icon: IconDumbbell, label: '덤벨' },
                { id: '철봉', Icon: IconPullupBar, label: '철봉' },
                { id: '매트', Icon: IconMat, label: '매트' },
                { id: '밴드', Icon: IconBand, label: '밴드' },
                { id: '바벨', Icon: IconBarbell, label: '바벨' },
                { id: '벤치', Icon: IconBench, label: '벤치' },
              ].map(item => {
                const eq = item.id;
                const isSelected = equipment.includes(eq);
                return (
                  <button
                    key={eq}
                    disabled={eq === '맨몸'}
                    onClick={() => setEquipment(prev => 
                      prev.includes(eq) ? prev.filter(i => i !== eq) : [...prev, eq]
                    )}
                    className={`p-5 rounded-3xl border flex flex-col items-center justify-center text-center tap-scale transition-all ${
                      isSelected 
                        ? 'border-[var(--color-primary)] bg-[#F0FCF2] text-[var(--color-primary)] shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300 text-gray-500 hover:text-gray-800'
                    } ${eq === '맨몸' ? 'opacity-90' : ''}`}
                  >
                    <div className="mb-3">
                      <item.Icon />
                    </div>
                    <span className={`font-bold text-sm ${isSelected ? 'text-[var(--color-primary)]' : 'text-gray-700'}`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">강화하고 싶은<br/>부위를 골라주세요</h1>
            <p className="text-[var(--color-text-muted)]">선택하지 않은 부위는 패시브 가드(보호)가 발동됩니다.</p>
            <div className="mt-8">
              <BodyMap selectedMuscles={muscles} onChange={setMuscles} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">나의 스낵 코스와<br/>알림 설정</h1>
            
            <div className="space-y-4 mt-6">
              <button 
                onClick={() => setCourse('MICRO')}
                className={`w-full text-left p-5 rounded-2xl border hover-lift transition-colors ${
                  course === 'MICRO' ? 'border-[var(--color-primary)] bg-[#F0FCF2] shadow-sm' : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">⚡</span>
                  <h3 className="font-bold text-lg">마이크로 스낵 (1~2분)</h3>
                </div>
                <p className="text-sm text-[var(--color-text-body)]">의자 위에서 딱 1세트만 속전속결로 끝냅니다.</p>
              </button>

              <button 
                onClick={() => setCourse('COMPACT')}
                className={`w-full text-left p-5 rounded-2xl border hover-lift transition-colors relative overflow-hidden ${
                  course === 'COMPACT' ? 'border-[var(--color-primary)] bg-[#F0FCF2] shadow-sm' : 'border-gray-200 bg-white'
                }`}
              >
                {course === 'COMPACT' && (
                  <div className="absolute top-0 right-0 bg-[var(--color-primary)] text-white text-xs px-3 py-1 rounded-bl-lg font-bold">
                    RECOMMENDED
                  </div>
                )}
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🔥</span>
                  <h3 className="font-bold text-lg">컴팩트 타겟 (3~5분)</h3>
                </div>
                <p className="text-sm text-[var(--color-text-body)]">쉬는 시간 0초. 2개 운동을 교차 세트로 수행하여 펌핑을 극대화합니다.</p>
              </button>

              <button 
                onClick={() => setCourse('CIRCUIT')}
                className={`w-full text-left p-5 rounded-2xl border hover-lift transition-colors ${
                  course === 'CIRCUIT' ? 'border-[var(--color-primary)] bg-[#F0FCF2] shadow-sm' : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">👑</span>
                  <h3 className="font-bold text-lg">숏 서킷 (6~10분)</h3>
                </div>
                <p className="text-sm text-[var(--color-text-body)]">다차원 운동을 순환하며 에너지를 완벽하게 충전합니다.</p>
              </button>
            </div>

            <div className="mt-8 p-5 bg-gray-50 rounded-2xl border border-gray-100">
              <h3 className="font-bold text-base mb-4 text-[var(--color-text-heading)]">업무 시간 및 알림 횟수</h3>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">출근 시간</label>
                  <input type="time" value={workStartTime} onChange={e => setWorkStartTime(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[var(--color-primary)]" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">퇴근 시간</label>
                  <input type="time" value={workEndTime} onChange={e => setWorkEndTime(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[var(--color-primary)]" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">목표 횟수 (시스템 자동 분배)</label>
                <select value={sessionsPerDay} onChange={e => setSessionsPerDay(Number(e.target.value))} className="w-full p-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[var(--color-primary)]">
                  <option value={4}>하루 4회</option>
                  <option value={6}>하루 6회 (권장)</option>
                  <option value={8}>하루 8회</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">담당 스포터<br/>지정하기</h1>
            <p className="text-[var(--color-text-muted)]">나의 의지를 불태워줄 파트너를 고르세요.</p>
            <div className="grid grid-cols-2 gap-4 mt-8">
              {['SPARTAN', 'TSUNDERE', 'ANGEL'].map(sp => (
                <button
                  key={sp}
                  onClick={() => setSpotter(sp as SpotterType)}
                  className={`aspect-[3/4] rounded-3xl flex flex-col items-center justify-center border tap-scale ${
                    spotter === sp 
                      ? 'border-[var(--color-primary)] bg-[#F0FCF2] shadow-sm' 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <span className="text-5xl mb-4">
                    {sp === 'SPARTAN' ? '🤬' : sp === 'TSUNDERE' ? '😒' : '🥰'}
                  </span>
                  <span className="font-bold text-sm text-gray-800">{sp === 'SPARTAN' ? '스파르타 교관' : sp === 'TSUNDERE' ? '츤데레 조교' : '엔젤 코치'}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">알림 수단<br/>선택하기</h1>
            <p className="text-[var(--color-text-muted)]">회사 보안망을 뚫는 텔레그램 연동을 추천합니다.</p>
            
            <div className="space-y-4 mt-8">
              <button 
                onClick={() => setNotificationMethod('telegram')}
                className={`w-full text-left p-5 rounded-2xl border hover-lift transition-colors relative ${
                  notificationMethod === 'telegram' ? 'border-[#2AABEE] bg-[#E8F5FE]' : 'border-gray-200 bg-white'
                }`}
              >
                {notificationMethod === 'telegram' && <div className="absolute top-4 right-5 text-[#2AABEE]">✓</div>}
                <div className="font-bold text-lg text-[#2AABEE]">텔레그램 (추천)</div>
                <p className="text-sm text-gray-600 mt-1">사내 메신저처럼 눈치 보지 않고 안전하게 알림 수신</p>
              </button>

              <button 
                onClick={() => setNotificationMethod('email')}
                className={`w-full text-left p-5 rounded-2xl border hover-lift transition-colors relative ${
                  notificationMethod === 'email' ? 'border-[var(--color-primary)] bg-[#F0FCF2]' : 'border-gray-200 bg-white'
                }`}
              >
                {notificationMethod === 'email' && <div className="absolute top-4 right-5 text-[var(--color-primary)]">✓</div>}
                <div className="font-bold text-lg text-gray-800">이메일 알림</div>
                <p className="text-sm text-gray-600 mt-1">지정한 구글 이메일로 링크 수신</p>
              </button>

              <button 
                onClick={() => setNotificationMethod('none')}
                className={`w-full text-left p-5 rounded-2xl border hover-lift transition-colors relative ${
                  notificationMethod === 'none' ? 'border-gray-400 bg-gray-50' : 'border-gray-200 bg-white'
                }`}
              >
                {notificationMethod === 'none' && <div className="absolute top-4 right-5 text-gray-600">✓</div>}
                <div className="font-bold text-lg text-gray-600">알림 끄기 (인앱 전용)</div>
                <p className="text-sm text-gray-500 mt-1">알림 없이 원할 때만 앱에 직접 들어와서 진행</p>
              </button>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-6 flex flex-col items-center text-center pt-10">
            <h1 className="text-3xl font-bold mb-4">준비 완료!</h1>
            
            {notificationMethod === 'telegram' && (
              <>
                <p className="text-[var(--color-text-body)] mb-12">
                  마지막으로 스포터와 악수하고<br/>알림을 켜보세요.
                </p>
                <button
                  onClick={completeOnboarding}
                  className="w-full py-5 rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-2 tap-scale"
                  style={{ background: '#2AABEE', boxShadow: '0 8px 32px rgba(42, 171, 238, 0.4)' }}
                >
                  텔레그램 시작하기
                  <ArrowRight size={20} />
                </button>
              </>
            )}
            
            {notificationMethod !== 'telegram' && (
              <>
                <div className="glass-card p-6 rounded-2xl mb-12 w-full text-left">
                  <p className="font-bold text-lg mb-2 text-[var(--color-primary)] flex items-center gap-2">
                    <span>💡</span> 홈 화면에 앱 추가하기 (PWA)
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    브라우저 하단의 <strong>[공유]</strong> 아이콘을 누르고<br/>
                    <strong>[홈 화면에 추가]</strong>를 선택하면<br/>
                    일반 앱처럼 빠르고 편하게 쓸 수 있습니다!
                  </p>
                </div>
                <button
                  onClick={completeOnboarding}
                  className="w-full py-5 rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-2 tap-scale btn-cta"
                >
                  대시보드로 이동
                  <ArrowRight size={20} />
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      {step < 6 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent">
          <div className="max-w-md mx-auto flex gap-4">
            {step > 1 && (
              <button 
                onClick={prevStep}
                className="w-14 h-14 rounded-2xl border-2 border-gray-200 flex items-center justify-center text-gray-500 tap-scale bg-white hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
            )}
            
            <button 
              onClick={nextStep}
              disabled={
                (step === 2 && muscles.length === 0) ||
                (step === 3 && !course) ||
                (step === 4 && !spotter) ||
                (step === 5 && !notificationMethod)
              }
              className="flex-1 h-14 rounded-2xl bg-[#1A2E1A] text-white font-bold flex items-center justify-center gap-2 tap-scale disabled:opacity-50 disabled:bg-gray-300 transition-all shadow-lg shadow-black/10"
            >
              다음 <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
