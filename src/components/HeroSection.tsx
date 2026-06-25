import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp, Sparkles, MapPin, Clock, RotateCw, Smile, Compass, Coffee, X } from 'lucide-react';

interface HeroProps {
  onOrderClick: () => void;
  onMenuClick?: () => void;
  onAboutClick?: () => void;
  texts?: {
    heroMiniTag?: string;
    heroTitle?: string;
    heroSubtitle?: string;
  };
  images?: {
    heroBg?: string;
  };
}

const coffeeQuotes = [
  "Кава — це не просто напій, це обійми в чашці.",
  "Життя занадто коротке для поганої кави.",
  "Ранок починається не з кави, а з Coffeetime.",
  "Кава робить складне простим, а ранок — затишним.",
  "Сьогодні ідеальний день для твоєї улюбленої чашки кави!"
];

const cupVariants = {
  idle: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    x: 0,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 20 }
  },
  sipping: {
    y: -40,
    rotate: -12,
    scale: 1.05,
    x: -8,
    transition: { duration: 0.4, ease: "easeOut" }
  },
  stirring: {
    x: [0, -6, 6, -6, 6, -4, 4, -2, 2, 0],
    y: [0, 4, -4, 4, -4, 3, -3, 1, -1, 0],
    rotate: [0, -4, 4, -4, 4, -2, 2, -1, 1, 0],
    transition: { duration: 1.5, ease: "easeInOut" }
  }
};

export default function HeroSection({ onOrderClick, onMenuClick, onAboutClick, texts, images }: HeroProps) {
  // Interactive Sip and Stir states for the Cup
  const [sipPercent, setSipPercent] = useState(100);
  const [isStirring, setIsStirring] = useState(false);
  const [isSipping, setIsSipping] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [showSipTooltip, setShowSipTooltip] = useState(false);
  const [activeMood, setActiveMood] = useState<string | null>(null);
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const moreInfoRef = useRef<HTMLDivElement>(null);

  const handleToggleMoreInfo = () => {
    if (showMoreInfo) {
      setShowMoreInfo(false);
    } else {
      setShowMoreInfo(true);
      setTimeout(() => {
        moreInfoRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  };

  const handleTakeSip = () => {
    if (isSipping || isStirring) return;
    
    setIsSipping(true);
    
    if (sipPercent === 0) {
      // Empty, refill pouring animation
      setTimeout(() => {
        setSipPercent(100);
        setQuoteIndex((prev) => (prev + 1) % coffeeQuotes.length);
        setShowSipTooltip(true);
        setTimeout(() => setShowSipTooltip(false), 1500);
      }, 500); // peak of refill lift
      
      setTimeout(() => {
        setIsSipping(false);
      }, 1100);
    } else {
      // Regular sip
      setTimeout(() => {
        setSipPercent(prev => {
          const next = prev - 20;
          return next < 0 ? 0 : next;
        });
        setShowSipTooltip(true);
        setTimeout(() => setShowSipTooltip(false), 1500);
      }, 500); // peak of the tilt
      
      setTimeout(() => {
        setIsSipping(false);
      }, 1100);
    }
  };

  const handleStir = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSipping || isStirring) return;
    setIsStirring(true);
    setTimeout(() => setIsStirring(false), 1500);
  };

  const getMoodRecommendation = () => {
    switch (activeMood) {
      case 'strong':
        return {
          title: 'Подвійне Еспресо або Фільтр-кава (V60)',
          desc: 'Для максимального фокусу та потужного заряду енергії на весь день.'
        };
      case 'sweet':
        return {
          title: 'Coffeetime Халва-Кардамон або Лавандовий Раф',
          desc: 'Ніжний, оксамитовий смак із витонченою солодкістю для гарного настрою.'
        };
      case 'chill':
        return {
          title: 'Капучино на вівсяному молоці',
          desc: 'Збалансований класичний смак із м’якою молочною солодкістю для релаксу.'
        };
      case 'adventure':
        return {
          title: 'Еспресо-Тонік або Фірмовий Айс-Латте',
          desc: 'Освіжаючий, кислувато-солодкий вибух смаку для тих, хто шукає нові грані кави.'
        };
      default:
        return null;
    }
  };

  return (
    <section 
      id="hero" 
      className="relative min-h-screen flex flex-col justify-between pt-24 pb-8 overflow-hidden bg-transparent coffee-grain select-none"
    >
      {images?.heroBg && (
        <img 
          src={images.heroBg} 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover opacity-[0.07] pointer-events-none z-0" 
          referrerPolicy="no-referrer"
        />
      )}
      {/* Parallax Floating elements (Coffee Beans) */}
      <div 
        className="absolute top-1/4 left-[8%] w-12 h-12 bg-coffee-medium opacity-20 blur-[1px] pointer-events-none rounded-[40%] hidden md:block"
        style={{
          transform: `translate3d(calc(var(--mouse-x, 0px) * -1.8), calc(var(--mouse-y, 0px) * -1.8), 0)`,
          transition: 'transform 0.12s ease-out'
        }}
      >
        <motion.div 
          className="w-full h-full"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <div 
        className="absolute bottom-1/4 right-[10%] w-16 h-16 bg-coffee-dark opacity-15 blur-[0.5px] pointer-events-none rounded-[45%] hidden md:block"
        style={{
          transform: `translate3d(calc(var(--mouse-x, 0px) * 2.4), calc(var(--mouse-y, 0px) * 2.4), 0)`,
          transition: 'transform 0.12s ease-out'
        }}
      >
        <motion.div 
          className="w-full h-full"
          animate={{ rotate: [360, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <div 
        className="absolute top-[15%] right-[15%] w-8 h-8 bg-coffee-accent opacity-25 blur-[1px] pointer-events-none rounded-[35%] hidden sm:block"
        style={{
          transform: `translate3d(calc(var(--mouse-x, 0px) * 1.2), calc(var(--mouse-y, 0px) * -1.5), 0)`,
          transition: 'transform 0.12s ease-out'
        }}
      >
        <motion.div 
          className="w-full h-full"
          animate={{ rotate: [0, -360] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <div 
        className="absolute bottom-[15%] left-[20%] w-14 h-14 bg-coffee-accent opacity-20 blur-[2px] pointer-events-none rounded-[30%] hidden lg:block"
        style={{
          transform: `translate3d(calc(var(--mouse-x, 0px) * -3.0), calc(var(--mouse-y, 0px) * -3.0), 0)`,
          transition: 'transform 0.12s ease-out'
        }}
      >
        <motion.div 
          className="w-full h-full animate-pulse"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <div 
        className="absolute top-[8%] left-[45%] w-10 h-10 bg-coffee-caramel opacity-15 blur-[0.8px] pointer-events-none rounded-[50%] hidden md:block"
        style={{
          transform: `translate3d(calc(var(--mouse-x, 0px) * 1.9), calc(var(--mouse-y, 0px) * 1.9), 0)`,
          transition: 'transform 0.12s ease-out'
        }}
      >
        <motion.div 
          className="w-full h-full"
          animate={{ rotate: [360, 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Main Container */}
      <div className="w-[92%] max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10 my-auto">
        
        {/* Left column: Selling texts */}
        <div className="lg:col-span-7 flex flex-col items-start gap-6 text-left">
          
          {/* Subtle badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-2 bg-coffee-milk/30 border border-coffee-milk/40 px-3.5 py-1.5 rounded-full shadow-inner shadow-coffee-deep/5"
            style={{ borderRadius: '9999px' }}
          >
            <Sparkles className="w-3.5 h-3.5 text-coffee-accent animate-pulse" />
            <span className="text-[11px] font-sans font-bold tracking-wider uppercase text-coffee-accent">
              {texts?.heroMiniTag || "Свіже обсмаження • Твоя ідеальна чашка"}
            </span>
          </motion.div>

          {/* Majestic Typography Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-serif text-4xl sm:text-5xl md:text-6xl text-coffee-dark tracking-tight leading-[1.08] font-bold"
          >
            {texts?.heroTitle ? (
              <span className="whitespace-pre-line">{texts.heroTitle}</span>
            ) : (
              <>
                Твоя кава. <br />
                Твій момент спокою. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-coffee-accent to-coffee-caramel italic">
                  Твій Coffeetime.
                </span>
              </>
            )}
          </motion.h1>

          {/* Copywriting subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-sm sm:text-base text-coffee-dark/70 font-sans leading-relaxed max-w-xl"
          >
            {texts?.heroSubtitle || "Ми створюємо більше, ніж просто напій. Кожна чашка в кав'ярні Coffeetime — це витончене поєднання добірних зерен свіжого обсмаження, оксамитової текстури та нашої безмежної любові до кавової культури. Завітай за своїм натхненням."}
          </motion.p>

          {/* Interactive Quote Bubble */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            onClick={() => setQuoteIndex((prev) => (prev + 1) % coffeeQuotes.length)}
            className="w-full max-w-xl p-3.5 rounded-2xl bg-coffee-latte/30 border border-coffee-milk/15 text-left cursor-pointer hover:bg-coffee-latte/50 transition-all flex gap-3 items-center group relative shadow-inner"
            style={{ borderRadius: '16px' }}
          >
            <span className="text-xl">💭</span>
            <div>
              <p className="text-xs italic text-coffee-dark/80 font-serif">
                "{coffeeQuotes[quoteIndex]}"
              </p>
              <p className="text-[9px] text-coffee-accent font-bold uppercase mt-1 tracking-wider group-hover:underline">
                Клікни для нової цитати &rarr;
              </p>
            </div>
          </motion.div>

          {/* Info cards (Quick visual trust) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="grid grid-cols-2 gap-4 w-full sm:w-auto mt-2"
          >
            <div className="tactile-card rounded-2xl p-4 flex items-center gap-3 border border-coffee-milk/20" style={{ borderRadius: '20px' }}>
              <div className="w-9 h-9 rounded-full bg-coffee-latte flex items-center justify-center text-coffee-accent shadow-inner shadow-coffee-deep/5" style={{ borderRadius: '9999px' }}>
                <MapPin className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-[10px] text-coffee-accent font-semibold tracking-wider uppercase">Адреса кав'ярні</p>
                <p className="text-xs text-coffee-dark font-bold">вул. Пилипа Орлика, 12</p>
              </div>
            </div>

            <div className="tactile-card rounded-2xl p-4 flex items-center gap-3 border border-coffee-milk/20" style={{ borderRadius: '20px' }}>
              <div className="w-9 h-9 rounded-full bg-coffee-latte flex items-center justify-center text-coffee-accent shadow-inner shadow-coffee-deep/5" style={{ borderRadius: '9999px' }}>
                <Clock className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-[10px] text-coffee-accent font-semibold tracking-wider uppercase">Чекаємо щодня</p>
                <p className="text-xs text-coffee-dark font-bold">Пн-Нд: 08:00 - 21:00</p>
              </div>
            </div>
          </motion.div>

          {/* Action buttons with custom styles */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-2"
          >
            <button
              onClick={onOrderClick}
              className="tactile-btn-accent text-sm font-bold text-coffee-cream px-8 py-4 rounded-full flex items-center justify-center gap-2 group transition-all duration-300 shadow-md cursor-pointer"
              style={{ borderRadius: '9999px' }}
            >
              <span>Створити власну каву</span>
              <motion.span 
                animate={{ x: [0, 4, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              >
                &rarr;
              </motion.span>
            </button>
            <button
              onClick={() => {
                if (onMenuClick) {
                  onMenuClick();
                } else {
                  document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="tactile-btn text-sm font-bold text-coffee-dark px-7 py-4 rounded-full flex items-center justify-center gap-2 transition-all cursor-pointer"
              style={{ borderRadius: '9999px' }}
            >
              <span>Переглянути Меню</span>
            </button>
          </motion.div>

          {/* Interactive Coffee Mood Finder */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="w-full max-w-xl p-5 rounded-3xl bg-white/40 backdrop-blur-md border border-white/60 shadow-xl relative"
            style={{ borderRadius: '24px' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Smile className="w-4 h-4 text-coffee-accent" />
              <span className="text-[10px] font-sans font-black tracking-widest text-coffee-accent uppercase">
                Твій кавовий настрій
              </span>
            </div>
            <p className="text-xs text-coffee-dark/70 font-sans mb-3">
              Який настрій у тебе сьогодні? Обери, і ми підберемо ідеальний напій:
            </p>
            <div className="flex flex-wrap gap-2 mb-1">
              {[
                { id: 'strong', label: '⚡ Енергія' },
                { id: 'sweet', label: '🌸 Ніжність' },
                { id: 'chill', label: '☕ Релакс' },
                { id: 'adventure', label: '🎒 Нові смаки' }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setActiveMood(activeMood === m.id ? null : m.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeMood === m.id
                      ? 'bg-coffee-dark text-coffee-cream shadow-sm scale-[1.03]'
                      : 'bg-coffee-milk/20 text-coffee-dark/80 hover:bg-coffee-milk/40'
                  }`}
                  style={{ borderRadius: '9999px' }}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeMood && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mt-3 pt-3 border-t border-coffee-milk/20 text-left"
                >
                  <p className="text-[9px] font-extrabold text-coffee-accent uppercase tracking-wider mb-1">Рекомендуємо спробувати:</p>
                  <p className="text-xs sm:text-sm font-black text-coffee-dark">{getMoodRecommendation()?.title}</p>
                  <p className="text-[11px] text-coffee-dark/60 font-sans mt-0.5">{getMoodRecommendation()?.desc}</p>
                  <button
                    onClick={onOrderClick}
                    className="mt-2 text-[10px] font-bold text-coffee-accent underline hover:text-coffee-caramel flex items-center gap-1 cursor-pointer"
                  >
                    <Compass className="w-3 h-3" /> Налаштувати цей напій у Конструкторі &rarr;
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

        </div>

        {/* Right column: High-fidelity Skeuomorphic Interactive Coffee Cup! */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative min-h-[420px] md:min-h-[500px]">
          
          {/* Glowing Aura backdrop */}
          <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-coffee-caramel/20 to-coffee-milk/30 blur-3xl -z-10 animate-pulse" />

          {/* Skeuomorphic Coffee Cup Assemblage */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={isSipping ? "sipping" : isStirring ? "stirring" : "idle"}
            variants={cupVariants}
            whileHover={!isSipping && !isStirring ? { scale: 1.03, y: -4 } : {}}
            onClick={handleTakeSip}
            className="relative select-none skeuo-cup-shadow cursor-pointer z-30"
          >
            {/* Take a Sip / Refill Tooltip */}
            <AnimatePresence>
              {showSipTooltip && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: -10, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.8 }}
                  className="absolute -top-12 left-1/2 -translate-x-1/2 bg-coffee-dark border border-coffee-caramel text-white font-sans text-xs font-bold py-1 px-3 rounded-full shadow-lg z-50 pointer-events-none whitespace-nowrap"
                  style={{ borderRadius: '9999px' }}
                >
                  {sipPercent === 80 && "Ковток... М-м-м! 🌸"}
                  {sipPercent === 60 && "Чудовий смак! ✨"}
                  {sipPercent === 40 && "Бадьорість росте! ⚡"}
                  {sipPercent === 20 && "Останній ковток! ☕"}
                  {sipPercent === 0 && "Горнятко порожнє! 🐾"}
                  {sipPercent === 100 && "Наповнено наново! 🎉"}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Steam rising effect particles */}
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 flex gap-4 pointer-events-none z-30">
              <span className={`steam-particle w-2.5 h-10 bg-coffee-cream/30 rounded-full blur-[4px] transition-all ${isStirring ? 'animate-[spin_2s_linear_infinite]' : ''}`} style={{ animationDelay: '0s' }} />
              <span className={`steam-particle w-3 h-14 bg-coffee-milk/25 rounded-full blur-[5px] transition-all ${isStirring ? 'animate-[spin_2.5s_linear_infinite]' : ''}`} style={{ animationDelay: '1.2s' }} />
              <span className={`steam-particle w-2 h-12 bg-coffee-cream/20 rounded-full blur-[3.5px] transition-all ${isStirring ? 'animate-[spin_1.8s_linear_infinite]' : ''}`} style={{ animationDelay: '2.5s' }} />
            </div>

            {/* Cup plate (Saucer) */}
            <div 
              className="w-72 h-72 sm:w-80 sm:h-80 rounded-full bg-white/50 backdrop-blur-md border-2 border-white/55 flex items-center justify-center relative shadow-xl shadow-coffee-deep/15"
            >
              
              {/* Inner ring indent on saucer */}
              <div className="w-48 h-48 rounded-full border border-coffee-milk/40 bg-coffee-latte/30 shadow-inner flex items-center justify-center">
                
                {/* Ceramic coffee ring effect (coffee spill) */}
                <div className="absolute w-36 h-36 rounded-full border-[1.5px] border-coffee-accent/15 opacity-60 border-dashed pointer-events-none" />

              </div>

              {/* Realistic ceramic cup handle protruding */}
              <div className="absolute right-[-24px] top-1/2 -translate-y-1/2 w-14 h-24 border-[16px] border-coffee-cream rounded-r-3xl shadow-md -z-10 flex items-center justify-end">
                <div className="w-4 h-16 bg-coffee-milk/10 rounded-full shadow-inner" />
              </div>

              {/* The Cup body itself */}
              <div className="absolute w-52 h-52 sm:w-56 sm:h-56 rounded-full bg-white border border-coffee-milk/40 shadow-lg flex items-center justify-center p-6" style={{ boxShadow: 'inset -8px -8px 24px rgba(33,16,7,0.06), 0 10px 25px rgba(33,16,7,0.1)' }}>
                
                {/* Golden rim lining inside cup */}
                <div className="w-full h-full rounded-full border-[3px] border-coffee-caramel/20 bg-coffee-dark flex items-center justify-center relative overflow-hidden shadow-inner p-1">
                  
                  {/* Liquid surface inside the cup (Skeuomorphic coffee with latte art) */}
                  <div className="w-full h-full rounded-full bg-[#FAF6F0] flex items-center justify-center relative overflow-hidden shadow-inner">
                    
                    {/* Ceramic bottom glaze details & stains (visible when coffee is drunk) */}
                    <div className="absolute inset-4 rounded-full border border-coffee-caramel/10 pointer-events-none" />
                    <div className="absolute w-24 h-24 rounded-full border border-coffee-accent/15 opacity-40 blur-[1px] pointer-events-none" />
                    
                    {/* Faint coffee stains on the ceramic bottom */}
                    <AnimatePresence>
                      {sipPercent < 100 && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.35 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-8 rounded-full border-[2px] border-coffee-accent/40 border-dashed blur-[0.5px] pointer-events-none"
                        />
                      )}
                    </AnimatePresence>
                    
                    {/* The Actual Coffee Liquid Circle */}
                    <motion.div
                      className="absolute inset-0 rounded-full bg-gradient-to-br from-[#3D2213] via-[#4E2F1C] to-[#2B1408] shadow-md flex items-center justify-center overflow-hidden"
                      style={{ originX: 0.5, originY: 0.5 }}
                      animate={{ 
                        scale: sipPercent / 100,
                        x: isSipping ? -6 : 0,
                        y: isSipping ? 6 : 0,
                        rotate: isStirring ? 360 : 0
                      }}
                      transition={{ 
                        scale: { type: "spring", stiffness: 80, damping: 15 },
                        x: { duration: 0.4, ease: "easeOut" },
                        y: { duration: 0.4, ease: "easeOut" },
                        rotate: isStirring 
                          ? { duration: 1.5, ease: "linear", repeat: Infinity }
                          : { duration: 0.5 }
                      }}
                    >
                      {/* Inner dark rim for depth inside liquid */}
                      <div className="absolute inset-1 rounded-full border border-black/15 pointer-events-none" />
                      
                      {/* Crema / Foam outer ring */}
                      <div className="absolute inset-1.5 rounded-full border-[3px] border-coffee-caramel/30 opacity-70 blur-[0.5px] pointer-events-none" />
                      
                      {/* Latte Art SVG */}
                      <motion.svg 
                        viewBox="0 0 100 100" 
                        className="w-full h-full absolute inset-0 text-coffee-milk/95 fill-current opacity-90 select-none pointer-events-none"
                        animate={isStirring ? { rotate: 360 } : { rotate: 0 }}
                        transition={isStirring ? { duration: 1.5, ease: "linear", repeat: Infinity } : { duration: 0.5 }}
                      >
                        <path d="M 50,50 C 30,20 10,40 10,50 C 10,75 40,90 50,90 C 70,90 90,70 90,50 C 90,30 75,10 50,10 C 35,10 20,20 20,35 C 20,45 35,55 50,55 C 65,55 75,45 75,35" />
                        <circle cx="50" cy="50" r="1.5" className="text-white" />
                        {/* Swirly froth dots */}
                        <circle cx="35" cy="30" r="4" className="text-coffee-milk/50" />
                        <circle cx="65" cy="40" r="5" className="text-coffee-cream/70" />
                        <circle cx="45" cy="70" r="3" className="text-coffee-cream/60" />
                        <circle cx="52" cy="22" r="3" className="text-coffee-milk/40" />
                      </motion.svg>
                      
                      {/* Liquid swirl/whirlpool effect during stirring */}
                      {isStirring && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [0, 0.4, 0], scale: [0.8, 1.2, 1] }}
                          transition={{ duration: 1.5 }}
                          className="absolute inset-2 rounded-full border border-dashed border-coffee-cream/40 blur-[0.5px]"
                        />
                      )}

                      {/* Dynamic bubble particles during stirring/shaking */}
                      {isStirring && (
                        <>
                          <motion.div 
                            animate={{ x: [0, 15, -15, 0], y: [0, -15, 15, 0], scale: [0, 1.2, 0] }}
                            transition={{ duration: 1.2, repeat: Infinity }}
                            className="absolute w-2 h-2 rounded-full bg-coffee-cream/60 left-1/3 top-1/4"
                          />
                          <motion.div 
                            animate={{ x: [0, -20, 20, 0], y: [0, 20, -20, 0], scale: [0, 1, 0] }}
                            transition={{ duration: 1.4, repeat: Infinity, delay: 0.2 }}
                            className="absolute w-1.5 h-1.5 rounded-full bg-white/70 right-1/4 top-1/3"
                          />
                          <motion.div 
                            animate={{ x: [0, 10, -10, 0], y: [0, 15, -15, 0], scale: [0, 1.3, 0] }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                            className="absolute w-2.5 h-2.5 rounded-full bg-coffee-milk/50 left-1/2 bottom-1/4"
                          />
                        </>
                      )}
                    </motion.div>

                    {/* Reflection overlay (light gloss) */}
                    <div className="absolute top-1 left-2 w-24 h-12 rounded-full bg-white/10 rotate-[-25deg] blur-[2px] pointer-events-none" />

                  </div>

                </div>

              </div>

            </div>

            {/* Custom decorative coffee spoon beside the plate */}
            <motion.div 
              className="absolute bottom-2 left-[-30px] w-8 h-40 origin-center pointer-events-none hidden sm:block"
              style={{ rotate: '-40deg' }}
            >
              {/* Silver spoon skeuo */}
              <div className="w-full h-full flex flex-col items-center justify-between">
                <div className="w-6 h-12 rounded-full bg-slate-300 border border-slate-400 shadow-md shadow-coffee-deep/10 flex items-center justify-center">
                  <div className="w-3 h-8 rounded-full bg-slate-100/40" />
                </div>
                <div className="w-1.5 h-28 bg-gradient-to-r from-slate-400 to-slate-200 border border-slate-500 rounded-full" />
                <div className="w-3.5 h-6 bg-slate-300 border border-slate-400 rounded-b-full" />
              </div>
            </motion.div>

            {/* Interactive Saucer Buttons */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-40" onClick={(e) => e.stopPropagation()}>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleTakeSip();
                }}
                className="bg-white/90 border border-coffee-milk/30 hover:bg-coffee-dark hover:text-coffee-cream text-[10px] font-bold py-1.5 px-3.5 rounded-full shadow-md cursor-pointer transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95"
                style={{ borderRadius: '9999px' }}
              >
                <span>☕</span> {sipPercent === 20 ? 'Допити каву' : sipPercent === 0 ? 'Наповнити знову' : 'Зробити ковток'}
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleStir(e);
                }}
                className="bg-white/90 border border-coffee-milk/30 hover:bg-coffee-dark hover:text-coffee-cream text-[10px] font-bold py-1.5 px-3.5 rounded-full shadow-md cursor-pointer transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95"
                style={{ borderRadius: '9999px' }}
              >
                <RotateCw className={`w-3 h-3 text-coffee-accent ${isStirring ? 'animate-spin' : ''}`} />
                Збовтати
              </button>
            </div>
          </motion.div>

        </div>

      </div>

      {/* Down Arrow Indicator / Toggle More Info */}
      <div 
        className="flex flex-col items-center gap-1 cursor-pointer z-40 transition-all hover:scale-105 mt-auto mb-6" 
        onClick={handleToggleMoreInfo}
      >
        <span className="text-[10px] font-sans font-bold tracking-widest text-coffee-accent/80 uppercase">
          {showMoreInfo ? 'Приховати' : 'Детальніше'}
        </span>
        <motion.div
          animate={showMoreInfo ? { rotate: 180, y: 0 } : { y: [0, 5, 0] }}
          transition={showMoreInfo ? { duration: 0.3 } : { repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
        >
          <ChevronDown className="w-4 h-4 text-coffee-accent" />
        </motion.div>
      </div>

      {/* Expanded More Info Section (Embedded in Home Tab) */}
      <div className="w-full relative z-30">
        <div className="max-w-6xl mx-auto px-4">
          <AnimatePresence>
            {showMoreInfo && (
              <motion.div
                ref={moreInfoRef}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="w-full bg-[#FDFBF7]/95 backdrop-blur-lg border border-coffee-milk/30 rounded-3xl p-6 sm:p-10 shadow-2xl relative z-30 mb-12"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-coffee-accent/10 to-transparent rounded-full blur-2xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-coffee-caramel/10 to-transparent rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex justify-between items-start mb-6 border-b border-coffee-milk/15 pb-4">
                  <div>
                    <h3 className="font-serif text-2xl sm:text-3xl text-coffee-dark font-bold">
                      Простір Coffeetime
                    </h3>
                    <p className="text-xs text-coffee-accent font-sans uppercase tracking-wider mt-1">
                      Атмосфера, смак та затишок у кожній краплі
                    </p>
                  </div>
                  <button
                    onClick={() => setShowMoreInfo(false)}
                    className="p-2 rounded-full hover:bg-coffee-milk/20 transition-all text-coffee-dark/60 hover:text-coffee-dark cursor-pointer"
                    title="Закрити"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* 1. Наш фірмовий купаж */}
                  <div className="flex flex-col gap-3 p-5 rounded-2xl bg-white/60 border border-coffee-milk/10 hover:border-coffee-accent/20 hover:bg-white/80 transition-all duration-300">
                    <div className="w-10 h-10 rounded-xl bg-coffee-latte/60 flex items-center justify-center text-lg shadow-inner">
                      🌱
                    </div>
                    <h4 className="font-sans font-bold text-base text-coffee-dark">
                      Фірмовий купаж зерен
                    </h4>
                    <p className="text-xs text-coffee-dark/70 leading-relaxed">
                      Ми використовуємо виключно 100% високогірну арабіку класу Specialty (Бразилія, Ефіопія, Колумбія), обсмажену локально щотижня, щоб зберегти насичений аромат та солодкість карамелі.
                    </p>
                  </div>

                  {/* 2. Особливі привілеї */}
                  <div className="flex flex-col gap-3 p-5 rounded-2xl bg-white/60 border border-coffee-milk/10 hover:border-coffee-accent/20 hover:bg-white/80 transition-all duration-300">
                    <div className="w-10 h-10 rounded-xl bg-coffee-latte/60 flex items-center justify-center text-lg shadow-inner">
                      🎁
                    </div>
                    <h4 className="font-sans font-bold text-base text-coffee-dark">
                      Програма лояльності
                    </h4>
                    <p className="text-xs text-coffee-dark/70 leading-relaxed">
                      Кожна сьома кава — у подарунок за нашим додатком! А також отримуйте знижку <strong className="text-coffee-accent">-10%</strong>, якщо замовляєте напій у власну улюблену термочашку.
                    </p>
                  </div>

                  {/* 3. Години затишку */}
                  <div className="flex flex-col gap-3 p-5 rounded-2xl bg-white/60 border border-coffee-milk/10 hover:border-coffee-accent/20 hover:bg-white/80 transition-all duration-300">
                    <div className="w-10 h-10 rounded-xl bg-coffee-latte/60 flex items-center justify-center text-lg shadow-inner">
                      🕒
                    </div>
                    <h4 className="font-sans font-bold text-base text-coffee-dark">
                      Години роботи & Локація
                    </h4>
                    <p className="text-xs text-coffee-dark/70 leading-relaxed">
                      Чекаємо на вас за адресою вул. Пилипа Орлика, 12.<br />
                      <strong className="text-coffee-dark/80">Будні:</strong> 08:00 – 21:00<br />
                      <strong className="text-coffee-dark/80">Вихідні:</strong> 09:00 – 22:00
                    </p>
                  </div>
                </div>

                {/* extra banner */}
                <div className="mt-8 pt-6 border-t border-coffee-milk/15 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">✨</span>
                    <p className="text-xs text-coffee-dark/80 italic font-serif">
                      "Гарний день починається з посмішки бариста та гарячого еспресо."
                    </p>
                  </div>
                  <button
                    onClick={onOrderClick}
                    className="text-xs font-bold bg-coffee-accent text-white px-5 py-2.5 rounded-full shadow-lg hover:bg-coffee-dark transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    style={{ borderRadius: '9999px' }}
                  >
                    Створити свій напій ☕
                  </button>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

    </section>
  );
}
