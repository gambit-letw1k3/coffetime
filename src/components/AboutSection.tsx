import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Leaf, Award, Heart, ShieldCheck, Flame, Coffee } from 'lucide-react';

interface AboutProps {
  texts?: {
    aboutTag?: string;
    aboutTitle?: string;
    aboutText1?: string;
    aboutText2?: string;
  };
  images?: {
    aboutImg?: string;
  };
}

export default function AboutSection({ texts, images }: AboutProps) {
  const [activeTab, setActiveTab] = useState<'roasting' | 'sourcing' | 'philosophy'>('philosophy');

  const tabs = [
    { id: 'philosophy', label: 'Філософія', icon: Heart },
    { id: 'sourcing', label: 'Походження', icon: Leaf },
    { id: 'roasting', label: 'Обсмаження', icon: Flame },
  ];

  const content = {
    philosophy: {
      title: "Мистецтво уповільнення часу",
      subtitle: "Турбота про кожну краплю твого ранкового ритуалу",
      text: texts?.aboutText1 || "В епоху постійного поспіху ми створили простір Coffeetime, де час уповільнюється. Для нас кава — це не просто доза кофеїну, це медитативний ритуал, мить близькості з собою та джерело естетичного натхнення. Наша місія — дарувати бездоганність у кожному ковтку та створювати затишну атмосферу, яка надихає на великі справи.",
      additionalText: texts?.aboutText2 || "",
      bullets: [
        "Тільки свіжозмелена спешелті арабіка",
        "Професійні бариста з багаторічним досвідом",
        "Атмосфера затишку, що сприяє творчості"
      ],
      tagline: "Справжня кава починається з поваги до зерна."
    },
    sourcing: {
      title: "Прямі поставки з ферм світу",
      subtitle: "Зелене зерно з екологічно чистих плантацій",
      text: "Ми працюємо за принципом Direct Trade (Пряма Торгівля). Наш шеф-ростер особисто відбирає лоти у фермерів Ефіопії, Колумбії, Сальвадору та Кенії. Ми платимо чесну ціну за високу якість (миті та натуральні методи обробки), підтримуючи сталий розвиток дрібних фермерств та зберігаючи багатство природного смаку.",
      bullets: [
        "100% прозорість походження (Single-origin)",
        "Оцінка за шкалою Q-grader вище 84 балів",
        "Підтримка еко-стандартів вирощування"
      ],
      tagline: "Кожне зерно розповідає унікальну історію свого терруару."
    },
    roasting: {
      title: "Локальне авторське обсмаження",
      subtitle: "Розкриття унікального смакового профілю",
      text: "Ми обсмажуємо зерна невеликими партіями щотижня безпосередньо в кав'ярні на високотехнологічному ростері Giesen. Наш індивідуальний профіль обсмаження розкриває природні ноти ягідної кислотності, карамельної солодкості та глибокого шоколадного тіла кави без зайвої гіркоти.",
      bullets: [
        "Завжди свіже обсмаження (до 14 днів)",
        "Комп'ютерний контроль профілю термодинаміки",
        "Регулярні відкриті каппінги для гостей"
      ],
      tagline: "Ми знаходимо ідеальний баланс між солодкістю та кислотністю."
    }
  };

  const ActiveIcon = content[activeTab].bullets ? Coffee : Coffee;

  return (
    <section id="about" className="py-24 bg-transparent relative overflow-hidden select-none">
      
      {/* Background decoration representing steam path */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full border-[1.5px] border-coffee-milk/30 opacity-40 pointer-events-none" />
      <div className="absolute bottom-[-15%] left-[-5%] w-[400px] h-[400px] rounded-full border-[1px] border-coffee-milk/30 opacity-40 pointer-events-none" />

      <div className="w-[92%] max-w-5xl mx-auto relative z-10">
        
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[11px] font-sans font-extrabold tracking-widest text-coffee-accent uppercase block mb-3">
            {texts?.aboutTag || "Про кав'ярню"}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-coffee-dark font-bold tracking-tight">
            {texts?.aboutTitle || "Наша Історія та Філософія"}
          </h2>
          <div className="w-12 h-1 bg-gradient-to-r from-coffee-caramel to-coffee-accent mx-auto mt-4 rounded-full" />
        </div>

        {/* Tactile Tab bar */}
        <div className="flex justify-center mb-12">
          <div className="bg-white/40 backdrop-blur-md border border-white/50 p-1.5 rounded-full flex gap-1 shadow-inner shadow-coffee-deep/5 max-w-lg w-full sm:w-auto" style={{ borderRadius: '9999px' }}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all duration-300 flex-1 sm:flex-initial cursor-pointer
                    ${isActive 
                      ? 'bg-coffee-dark text-coffee-cream shadow-md shadow-coffee-deep/10' 
                      : 'text-coffee-dark/70 hover:text-coffee-dark hover:bg-coffee-milk/20'
                    }`}
                  style={{ borderRadius: '9999px' }}
                >
                  <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-coffee-caramel' : 'text-coffee-accent'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Box - Designed as a beautiful open notebook / clean paper sheet with rounded corners */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Block: Image Placeholder with warm styling / generated graphics */}
          <div className="md:col-span-5 flex flex-col justify-between p-8 rounded-3xl tactile-card shadow-xl relative" style={{ borderRadius: '28px' }}>
            <div className="absolute inset-0 bg-transparent coffee-grain rounded-3xl -z-10 opacity-60" style={{ borderRadius: '28px' }} />
            
            <div className="flex flex-col gap-4 h-full justify-between">
              
              {/* Graphic Coffee Roaster Schema or details */}
              <div className="flex justify-between items-start">
                <span className="font-serif italic text-3xl text-coffee-accent opacity-40 select-none">Est. 2024</span>
                <div className="w-12 h-12 rounded-2xl bg-coffee-milk/30 flex items-center justify-center shadow-inner" style={{ borderRadius: '14px' }}>
                  <Award className="w-6 h-6 text-coffee-accent" />
                </div>
              </div>

              {images?.aboutImg && (
                <div className="w-full h-36 rounded-2xl overflow-hidden my-2 border border-coffee-milk/10 shadow-sm">
                  <img src={images.aboutImg} alt="Coffeetime" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              )}

              {/* Central high-quality interactive widget illustrating roast level */}
              <div className="my-6 p-4 rounded-2xl bg-coffee-latte/40 border border-coffee-milk/20 flex flex-col gap-3 shadow-inner" style={{ borderRadius: '18px' }}>
                <span className="text-[10px] font-sans font-bold text-coffee-accent tracking-wider uppercase">Кавовий індикатор якості</span>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-coffee-dark font-medium">Ступінь очищення зерна:</span>
                  <span className="text-xs text-coffee-accent font-extrabold">99.8%</span>
                </div>
                <div className="w-full bg-coffee-milk/40 h-2 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: "0%" }}
                    animate={{ width: "99.8%" }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-coffee-caramel to-coffee-accent rounded-full"
                  />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-coffee-dark/60">Вологість: 11.2%</span>
                  <span className="text-[10px] text-coffee-dark/60">Свіжість: 10/10</span>
                </div>
              </div>

              {/* Minimal metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-left">
                  <span className="block font-serif text-3xl font-bold text-coffee-dark">100%</span>
                  <span className="text-[11px] text-coffee-dark/60 font-sans">Органічна Арабіка</span>
                </div>
                <div className="text-left">
                  <span className="block font-serif text-3xl font-bold text-coffee-dark">84+</span>
                  <span className="text-[11px] text-coffee-dark/60 font-sans">Рейтинг Specialty</span>
                </div>
              </div>

            </div>

          </div>

          {/* Right Block: Dynamic Content */}
          <div className="md:col-span-7 p-8 sm:p-10 rounded-3xl tactile-card shadow-xl flex flex-col justify-between" style={{ borderRadius: '28px' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-6 h-full justify-between"
              >
                <div>
                  <span className="text-xs text-coffee-caramel font-bold uppercase tracking-wider block mb-1">
                    {content[activeTab].subtitle}
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl text-coffee-dark font-extrabold leading-tight mb-4">
                    {content[activeTab].title}
                  </h3>
                  <p className="text-sm sm:text-base text-coffee-dark/75 leading-relaxed font-sans mb-6">
                    {content[activeTab].text}
                  </p>
                  {activeTab === 'philosophy' && (content[activeTab] as any).additionalText && (
                    <p className="text-sm sm:text-base text-coffee-dark/75 leading-relaxed font-sans mb-6 -mt-3">
                      {(content[activeTab] as any).additionalText}
                    </p>
                  )}

                  {/* Bullet points as tactile small labels */}
                  <div className="flex flex-col gap-3">
                    {content[activeTab].bullets.map((bullet, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-coffee-latte flex items-center justify-center border border-coffee-milk/50" style={{ borderRadius: '9999px' }}>
                          <ShieldCheck className="w-3.5 h-3.5 text-coffee-accent" />
                        </div>
                        <span className="text-xs sm:text-sm text-coffee-dark font-medium">{bullet}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-coffee-milk/25 pt-6 mt-6">
                  <p className="font-serif italic text-coffee-accent text-sm sm:text-base">
                    « {content[activeTab].tagline} »
                  </p>
                </div>

              </motion.div>
            </AnimatePresence>
          </div>

        </div>

        {/* Dynamic Interactive Coffee Trivia Widget */}
        <AboutSectionTrivia />

      </div>

    </section>
  );
}

const triviaQuestions = [
  {
    question: "З якої країни історично походить кавова культура та перші дикі дерева арабіки?",
    options: ["Бразилія", "Ефіопія", "Ємен", "Колумбія"],
    correctIdx: 1,
    fact: "Ефіопія є батьківщиною арабіки. Згідно з легендою, ефіопський пастух Калдім помітив, що його кози стають неймовірно енергійними після поїдання червоних ягід з кущів."
  },
  {
    question: "Яка країна споживає найбільше кави у світі на одну душу населення?",
    options: ["Італія", "Фінляндія", "Колумбія", "Бразилія"],
    correctIdx: 1,
    fact: "Фінляндія є світовим лідером: середньостатистичний фін випиває близько 12 кг кави на рік (це приблизно 4-5 чашок на день)!"
  },
  {
    question: "Що таке золотава пінка на поверхні свіжозвареного Еспресо?",
    options: ["Додані вершки", "Збите молоко", "Крема (природні емульговані олії)", "Кавовий цукор"],
    correctIdx: 2,
    fact: "Крема (Crema) складається з бульбашок вуглекислого газу та емульгованих кавових олій, що вивільняються під високим тиском води."
  }
];

function AboutSectionTrivia() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [score, setScore] = useState(0);

  const currentQuestion = triviaQuestions[currentIdx];

  const handleOptionClick = (idx: number) => {
    if (hasAnswered) return;
    setSelectedOpt(idx);
    setHasAnswered(true);
    if (idx === currentQuestion.correctIdx) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    setSelectedOpt(null);
    setHasAnswered(false);
    setCurrentIdx((prev) => (prev + 1) % triviaQuestions.length);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mt-16 p-6 sm:p-8 rounded-3xl bg-white/40 backdrop-blur-md border border-white/60 shadow-xl relative overflow-hidden"
      style={{ borderRadius: '28px' }}
    >
      <div className="absolute inset-0 bg-transparent coffee-grain -z-10 opacity-30" />
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-coffee-milk/20">
        <div>
          <span className="text-[10px] font-sans font-black tracking-widest text-coffee-accent uppercase block">Кавовий Клуб Ерудитів</span>
          <h4 className="font-serif text-lg sm:text-xl text-coffee-dark font-black">Кавова Міні-Вікторина 💭</h4>
        </div>
        <div className="bg-coffee-dark text-coffee-cream text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1.5" style={{ borderRadius: '9999px' }}>
          <span>Питання {currentIdx + 1}/{triviaQuestions.length}</span>
          <span className="text-coffee-caramel">•</span>
          <span>Бали: {score}</span>
        </div>
      </div>

      <div className="text-left mb-6">
        <p className="text-sm sm:text-base font-bold text-coffee-dark leading-snug">
          {currentQuestion.question}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {currentQuestion.options.map((opt, idx) => {
          const isCorrect = idx === currentQuestion.correctIdx;
          const isSelected = idx === selectedOpt;
          let btnStyle = "bg-white/50 border border-coffee-milk/30 hover:bg-coffee-milk/20 text-coffee-dark";

          if (hasAnswered) {
            if (isCorrect) {
              btnStyle = "bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-200";
            } else if (isSelected) {
              btnStyle = "bg-rose-50 text-rose-800 border-rose-300 ring-2 ring-rose-200";
            } else {
              btnStyle = "bg-white/20 border-transparent text-coffee-dark/40";
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleOptionClick(idx)}
              disabled={hasAnswered}
              className={`p-3.5 rounded-2xl text-xs sm:text-sm font-bold text-left transition-all cursor-pointer flex justify-between items-center ${btnStyle}`}
              style={{ borderRadius: '16px' }}
            >
              <span>{opt}</span>
              {hasAnswered && isCorrect && <span className="text-emerald-600">✓</span>}
              {hasAnswered && isSelected && !isCorrect && <span className="text-rose-600">✗</span>}
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {hasAnswered && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-2xl bg-coffee-latte/40 border border-coffee-milk/15 text-left mb-4 overflow-hidden"
            style={{ borderRadius: '16px' }}
          >
            <div className="flex gap-2 items-start text-xs text-coffee-dark/80">
              <span className="text-base">💡</span>
              <div>
                <strong className="text-coffee-accent font-black block mb-0.5">Цікавий факт:</strong>
                <p className="font-sans leading-relaxed">{currentQuestion.fact}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {hasAnswered && (
        <div className="flex justify-end">
          <button
            onClick={handleNext}
            className="bg-coffee-dark hover:bg-coffee-accent text-coffee-cream text-xs font-bold px-5 py-2.5 rounded-full transition-all flex items-center gap-1 cursor-pointer"
            style={{ borderRadius: '9999px' }}
          >
            <span>Наступне питання</span>
            <span>&rarr;</span>
          </button>
        </div>
      )}
    </motion.div>
  );
}
