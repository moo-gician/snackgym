# B.E.A.S.T. 프리미엄 디자인 시스템 (Iron & Ichor)

## 1. 브랜드 & 디자인 철학 (Brand & Style)
The design system is forged for the B.E.A.S.T. platform, targeting elite athletes and modern-day Spartans who demand intensity and precision. The brand personality is aggressive, uncompromising, and cinematic. It evokes the adrenaline of a battlefield and the discipline of a professional combat training facility.

The visual style is a fusion of **Neo-Brutalism** and **Cinematic High-Contrast**. It rejects the softness of modern SaaS interfaces in favor of raw, industrial strength. Key characteristics include:
- **Atmospheric Depth:** 깊고 어두운 심연(Abyss) 배경을 사용하여 콘텐츠가 어둠 속에서 떠오르는 듯한 압도적 몰입감을 줍니다.
- **Aggressive Typography:** 사용자 시선을 강탈하는 크고 강렬한 대형 타이틀 폰트를 무기처럼 사용합니다.
- **Weaponized Accents:** 메탈릭한 청동(Bronze)과 핏빛(Blood) 컬러를 진행도와 경고의 하이라이트로 무기화하여 배치합니다.
- **Video Game UI Influence:** 일반적인 웹/앱이 아닌, 무겁고 각진 테두리와 HUD 같은 디테일을 사용하여 하드코어 게임 UI의 감성을 냅니다.
- **Cognitive Balance (인지 부조화 방지):** 붉은색(Red)은 시각적 피로도와 에러/경고의 의미를 주므로, 목표 달성이나 긍정적 피드백에는 붉은색 대신 **Aged Bronze**를 주력으로 사용합니다. 붉은색은 화면의 5~10% 이내의 아드레날린 포인트로만 제한합니다.
- **Safe & Aggressive Animations:** 앱스토어 리젝 사유가 될 수 있는 폭력적인 애니메이션은 배제하고, 무거운 청동 방패가 부딪치며 불꽃이 튀는 **스파크(Spark)**나 묵직한 **맥박 펄스(Heartbeat Pulse)**로 타격감을 구현합니다.

## 2. 컬러 팔레트 (Color Palette - Tailwind 매핑)
스파르타 서사의 톤앤매너를 유지하기 위해 채도가 낮고 임팩트 있는 컬러들로 통제합니다. (Tailwind `theme.extend.colors` 에 매핑하여 사용)

- **배경 (The Void):** `abyss` (#0A0A0C) - 순수 블랙이 아닌 깊은 차콜 블랙. 시각적 피로도를 낮추고 텍스트 대비를 극대화하는 심연의 배경.
- **표면 (Surface):** `charcoal` (#16161A) - 컨테이너, 카드, 표면에 쓰이는 단단하고 낡은 철갑 느낌의 다크 그레이.
- **포인트 (Honor & Victory):** `bronze` (#C89A51) - 청동 방패의 질감을 띈 골드/브론즈. 주요 액션 버튼(CTA), 목표 달성, 진행 상태 바에 사용되는 핵심 긍정 컬러.
- **위험/강조 (Effort & Warning):** `blood` (#D91A1A) - 강렬한 핏빛 레드. 치명적 경고, 한계치, 혹은 최고 강도를 나타낼 때 화면의 5~10% 이내로만 아껴서 사용합니다.
- **메인 텍스트 (Bone):** `bone` (#F0EFEA) - 차가운 순백색이 아닌 뼈 질감의 따뜻한 화이트. 대형 헤드라인과 주요 텍스트에 사용하여 압도적인 가독성을 부여합니다.
- **보조 텍스트 (Ash):** `ash` (#8A8A93) - 재(Ash) 색상의 그레이. 시각적 계층 구조를 위해 보조 텍스트나 본문 설명에 사용합니다.

## 3. 타이포그래피 (Typography)
산업적이고 밀도 높은 **Oswald**와 실용적인 **Inter**의 극단적 대비를 활용합니다.

- **Display & Headlines (`Oswald`):** 크고 두꺼운 강렬한 폰트. 무조건 **대문자(Uppercase)**로 표기하며, 자간을 좁게(-1% ~ -2%) 세팅하여 거대한 바위 같은 단단한 블록 형태를 만듭니다.
- **Body & Timer Font (`Inter`):** 운동 설명서, 데이터 테이블, 숫자가 빠르게 변하는 타이머 등에는 가독성이 뛰어난 모던 산세리프 `Inter`를 철저히 사용하여 사용성을 보장합니다.
- **Instructional Labels:** HUD 스타일의 작은 라벨 데이터는 `Oswald`를 대문자 + 넓은 자간으로 표기하여 군사/전술 기기 화면처럼 연출합니다.

## 4. 입체감과 깊이 (Elevation & Depth)
전통적인 그림자(Drop-shadow) 대신 **빛(Illumination)과 야광(Glow)** 효과로 깊이를 표현합니다.

- **Tonal Layering:** 1차 배경은 Abyss, 2차 표면(카드)은 Charcoal로 톤을 분리합니다.
- **Inner/Outer Glows:** 카드가 활성화되거나 버튼을 누를 때, 그림자 대신 `box-shadow: 0 0 15px rgba(200, 154, 81, 0.2)` 형태의 **청동색 후광(Bronze Glow)**이나 **핏빛(Blood) 후광**을 은은하게 방출시킵니다.
- **Edge Highlighting:** 표면의 상단 테두리(Top-border)에만 미세하게 밝은 1px 선을 그어, 위에서 빛을 받는 무거운 물리적 질감을 표현합니다.
- **Zero Transparency (투명도 배제):** 트렌디한 글래스모피즘(투명 유리 효과)을 철저히 배제하고, 두껍고 무거운 강철/가죽 같은 불투명한 물리적 질감을 유지합니다.

## 5. 형태와 구조 (Shapes & Layout)
모든 컴포넌트는 **공격적이고 날카롭습니다.**

- **Corner Radius:** 둥글고 귀여운 UI를 배제하고, 모든 메인 컨테이너와 버튼은 **0px (Sharp)** 각진 모서리(`rounded-none`)를 유지합니다.
- **Structural Borders:** 여백으로만 구조를 나누기보다, 1px의 Charcoal 또는 Bronze 테두리를 직접 그어(Border) 화면을 전술 데이터 화면처럼 '무장'시킵니다.
- **Density:** 4px 기반의 리듬을 사용하되, 카드 내부 패딩은 타이트하게 잡아(16px~24px) 압박감과 긴장감을 줍니다.

## 6. 핵심 UI 컴포넌트 & 마이크로 인터랙션
- **버튼 (Action Buttons):** 일반 버튼은 Charcoal 배경을 쓰고 활성화 시 Bronze나 Blood 외곽선과 내부 글로우를 발산시킵니다. 
- **듀얼 바디 맵 플립 카드 (Body Map):** 전면/후면을 앞뒤로 뒤집는 싱글뷰 컴포넌트. 타겟 부위에 마우스를 올리면 서서히 Blood나 Bronze 컬러로 혈류가 차오르는 효과.
- **세션 컨트롤러 (스피너 & 체크버튼):**
  - 스피너 버튼 터치 영역은 엄지손가락 크기에 맞게 최소 `44px` 이상.
  - 탭/클릭 시 탄력적이고 짧은 `scale(0.95)` 스케일 축소 효과를 통해 물리적 타격감(Haptic feel)을 줍니다.
  - 완료 시 스파크 혹은 심장 박동(Pulse) 애니메이션을 터트려 성취감을 고조시킵니다.
