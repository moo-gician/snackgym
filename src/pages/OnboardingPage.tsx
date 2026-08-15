import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { ArrowRight, ArrowLeft } from 'lucide-react';

type CourseType = 'MICRO' | 'COMPACT' | 'CIRCUIT' | null;
type SpotterType = 'SPARTAN' | 'TSUNDERE' | 'ANGEL' | 'PRO' | null;

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  
  // Persisted state via sessionStorage to prevent loss on refresh
  const [equipment, setEquipment] = useState<string[]>(() => {
    const saved = sessionStorage.getItem('ob_equipment');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [muscles, setMuscles] = useState<string[]>(() => {
    const saved = sessionStorage.getItem('ob_muscles');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [course, setCourse] = useState<CourseType>(() => {
    return (sessionStorage.getItem('ob_course') as CourseType) || null;
  });
  
  const [spotter, setSpotter] = useState<SpotterType>(() => {
    return (sessionStorage.getItem('ob_spotter') as SpotterType) || null;
  });

  useEffect(() => {
    sessionStorage.setItem('ob_equipment', JSON.stringify(equipment));
  }, [equipment]);

  useEffect(() => {
    sessionStorage.setItem('ob_muscles', JSON.stringify(muscles));
  }, [muscles]);

  useEffect(() => {
    if (course) sessionStorage.setItem('ob_course', course);
  }, [course]);

  useEffect(() => {
    if (spotter) sessionStorage.setItem('ob_spotter', spotter);
  }, [spotter]);

  const nextStep = () => setStep(s => Math.min(5, s + 1));
  const prevStep = () => setStep(s => Math.max(1, s - 1));

  const completeOnboarding = async () => {
    // 1. Ensure user is logged in
    const user = auth.currentUser;
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }
    
    // TODO: Save to Firestore
    console.log("Saving to Firestore...", { equipment, muscles, course, spotter });
    
    // 2. Generate Telegram deep link
    const telegramUrl = `https://t.me/SnackGymBot?start=${user.uid}`;
    window.location.href = telegramUrl; // 텔레그램으로 순간이동
  };

  return (
    <div className="min-h-screen pb-20 pt-8 px-4 flex flex-col max-w-md mx-auto">
      {/* Progress Bar */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3, 4, 5].map((idx) => (
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
            <p className="text-[var(--color-text-muted)]">없어도 괜찮아요. 맨몸 루틴이 준비되어 있습니다.</p>
            {/* TODO: Equipment Grid */}
            <div className="grid grid-cols-2 gap-3 mt-8">
              {['덤벨', '철봉', '매트', '밴드', '바벨', '벤치'].map(eq => (
                <button
                  key={eq}
                  onClick={() => setEquipment(prev => 
                    prev.includes(eq) ? prev.filter(i => i !== eq) : [...prev, eq]
                  )}
                  className={`p-4 rounded-2xl border text-left tap-scale transition-colors ${
                    equipment.includes(eq) 
                      ? 'border-[var(--color-primary)] bg-[#F0FCF2] text-[var(--color-text-heading)]'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <span className="font-medium">{eq}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">강화하고 싶은<br/>부위를 골라주세요</h1>
            <p className="text-[var(--color-text-muted)]">선택하지 않은 부위는 운동에서 배제됩니다.</p>
            {/* TODO: 3D Flip SVG BodyMap */}
            <div className="h-80 w-full glass-card rounded-3xl flex items-center justify-center mt-8">
              <span className="text-[var(--color-text-muted)]">Interactive Body Map Area</span>
            </div>
            <button onClick={() => setMuscles(['가슴', '등'])} className="text-sm underline text-blue-500">임시 부위 선택 테스트 (가슴, 등)</button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">나의 스낵 코스<br/>선택하기</h1>
            
            <div className="space-y-4 mt-8">
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
                <p className="text-sm text-[var(--color-text-body)]">자리에서 일어날 필요 없이 딱 1세트만 속전속결로 끝내고 복귀합니다.</p>
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
                <p className="text-sm text-[var(--color-text-body)]">쉬는 시간 0초. 2개 운동을 교차로 수행하여 짧은 시간에 펌핑을 극대화합니다.</p>
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
                <p className="text-sm text-[var(--color-text-body)]">다양한 운동을 순환하며 온몸의 에너지를 완벽하게 충전합니다.</p>
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">담당 스포터<br/>지정하기</h1>
            <p className="text-[var(--color-text-muted)]">나의 의지를 불태워줄 파트너를 고르세요.</p>
            {/* TODO: Spotter Selection Cards */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              {['SPARTAN', 'TSUNDERE', 'ANGEL', 'PRO'].map(sp => (
                <button
                  key={sp}
                  onClick={() => setSpotter(sp as SpotterType)}
                  className={`aspect-square rounded-3xl flex flex-col items-center justify-center border tap-scale ${
                    spotter === sp 
                      ? 'border-[var(--color-primary)] bg-[#F0FCF2] glow-hover' 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <span className="text-4xl mb-2">
                    {sp === 'SPARTAN' ? '🤬' : sp === 'TSUNDERE' ? '😒' : sp === 'ANGEL' ? '🥰' : '📋'}
                  </span>
                  <span className="font-bold text-sm">{sp}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6 flex flex-col items-center text-center pt-10">
            <h1 className="text-3xl font-bold mb-4">준비 완료!</h1>
            <p className="text-[var(--color-text-body)] mb-12">
              이제 텔레그램을 연결하여<br/>스낵짐 알림을 받아보세요.
            </p>
            
            <button
              onClick={completeOnboarding}
              className="w-full py-5 rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-2 tap-scale"
              style={{
                background: 'linear-gradient(135deg, #3CCF4E 0%, #189AB4 100%)',
                boxShadow: '0 8px 32px rgba(60, 207, 78, 0.4)'
              }}
            >
              스포터와 악수하기
              <ArrowRight size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      {step < 5 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent">
          <div className="max-w-md mx-auto flex gap-4">
            {step > 1 && (
              <button 
                onClick={prevStep}
                className="w-14 h-14 rounded-2xl border-2 border-gray-200 flex items-center justify-center text-gray-500 tap-scale bg-white"
              >
                <ArrowLeft size={24} />
              </button>
            )}
            
            <button 
              onClick={nextStep}
              disabled={
                (step === 2 && muscles.length === 0) ||
                (step === 3 && !course) ||
                (step === 4 && !spotter)
              }
              className="flex-1 h-14 rounded-2xl bg-[#1A2E1A] text-white font-bold flex items-center justify-center gap-2 tap-scale disabled:opacity-50 disabled:bg-gray-300"
            >
              다음 <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
