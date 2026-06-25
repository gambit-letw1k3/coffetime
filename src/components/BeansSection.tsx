import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CoffeeBean } from '../types';
import { Coffee, Flame, ShoppingBag, Sliders, Check, BookOpen, Sparkles, Scale, Thermometer, Timer, ShoppingCart } from 'lucide-react';

type GrindType = 'whole' | 'espresso' | 'filter' | 'turkish';

interface BeansProps {
  beansList?: CoffeeBean[];
  texts?: {
    beansTag?: string;
    beansTitle?: string;
    beansSubtitle?: string;
  };
  images?: {
    beansBg?: string;
    beanPack?: string;
  };
  cart?: any[];
  onAddToCart?: (item: any) => void;
  onGoToCart?: () => void;
}

export default function BeansSection({ beansList, texts, images, cart, onAddToCart, onGoToCart }: BeansProps = {}) {
  const [selectedGrinds, setSelectedGrinds] = useState<Record<string, GrindType>>({});
  const [addedToCart, setAddedToCart] = useState<Record<string, boolean>>({});

  // Brewer Guide & Profiler state
  const [brewMethod, setBrewMethod] = useState<'turk' | 'espresso' | 'filter' | 'french'>('filter');
  const [flavorProfile, setFlavorProfile] = useState<'floral' | 'chocolate' | 'bitter'>('chocolate');
  const [recommendation, setRecommendation] = useState<any | null>(null);

  const defaultBeans: CoffeeBean[] = [
    {
      id: 'b1',
      name: 'Ethiopia Yirgacheffe',
      origin: 'Ефіопія (Регіон Йиргачеффе)',
      process: 'Митий (Washed)',
      roastLevel: 'light',
      notes: ['Жасмин', 'Персик', 'Лимонна трава', 'Бергамот'],
      price: 240,
      weight: '250 г',
      altitude: '1850 - 2100 м'
    },
    {
      id: 'b2',
      name: 'Colombia Supremo',
      origin: 'Колумбія (Андський хребет)',
      process: 'Натуральний (Natural)',
      roastLevel: 'medium',
      notes: ['Червоне яблуко', 'Молочний шоколад', 'Карамель', 'Фундук'],
      price: 220,
      weight: '250 г',
      altitude: '1600 - 1800 м'
    },
    {
      id: 'b3',
      name: 'Brazil Cerrado',
      origin: 'Бразилія (Регіон Серрадо)',
      process: 'Сухий (Natural-pulped)',
      roastLevel: 'dark',
      notes: ['Темний шоколад', 'Какао боби', 'Смажений мигдаль', 'Тютюн'],
      price: 195,
      weight: '250 г',
      altitude: '900 - 1100 м'
    }
  ];

  const beans = beansList || defaultBeans;

  const handleGrindChange = (beanId: string, grind: GrindType) => {
    setSelectedGrinds(prev => ({ ...prev, [beanId]: grind }));
    setAddedToCart(prev => ({ ...prev, [beanId]: false })); // Reset added state on grind change
  };

  const handleAddToCart = (beanId: string) => {
    const bean = beans.find(b => b.id === beanId);
    if (!bean) return;

    const currentGrind = selectedGrinds[beanId] || 'whole';
    const grindLabels: Record<string, string> = {
      whole: 'Ціле зерно',
      turkish: 'Для турки',
      espresso: 'Для еспресо',
      filter: 'Для фільтра'
    };
    const grindLabel = grindLabels[currentGrind] || 'Ціле зерно';

    if (onAddToCart) {
      onAddToCart({
        id: `bean-${beanId}-${currentGrind}`,
        type: 'bean',
        name: `Крафтові зерна «${bean.name}» 🎒`,
        price: bean.price,
        quantity: 1,
        details: `Помел: ${grindLabel} | Вага: ${bean.weight} | Обробка: ${bean.process}`
      });
    }

    setAddedToCart(prev => ({ ...prev, [beanId]: true }));
    setTimeout(() => {
      setAddedToCart(prev => ({ ...prev, [beanId]: false }));
    }, 3000);
  };

  const handleFindMyCoffee = () => {
    let name = "Ethiopia Yirgacheffe";
    let desc = "Тонкі квіткові та цитрусові тони з чудовою чайною консистенцією. Ідеально підходить для легкого заварювання!";
    let ratio = "15 г кави на 225 мл води (1:15)";
    let temp = "92°C — 93°C";
    let time = "2 хв 45 сек";
    let grindText = "Середній помел (схожий на велику сіль)";
    let steps = [
      "Змочіть паперовий фільтр гарячою водою, щоб прибрати паперовий присмак.",
      "Змеліть каву та засипте її у фільтр, вирівнюючи кавову таблетку.",
      "Зробіть перше змочування: залийте 40 мл води та почекайте 30 секунд.",
      "Повільно круговими рухами влийте залишок води до позначки 225 мл."
    ];

    if (flavorProfile === 'chocolate' || brewMethod === 'espresso') {
      name = "Colombia Supremo";
      desc = "М'який, чудово збалансований солодкий смак з карамельним тілом і нотами молочного шоколаду.";
      ratio = "16 г кави на 250 мл води (1:16)";
      temp = "94°C";
      time = "3 хв 00 сек";
      grindText = "Дрібний або середньо-дрібний помел";
      steps = [
        "Підігрійте посудину для заварювання або портафільтр.",
        "Засипте каву рівномірно. Для еспресо утрамбуйте темпером.",
        "Почніть заварювання. Залийте водою 94°C під тиском або проливом.",
        "Слідкуйте за насиченим карамельним кольором струменя."
      ];
    } else if (flavorProfile === 'bitter' || brewMethod === 'turk' || brewMethod === 'french') {
      name = "Brazil Cerrado";
      desc = "Повнотіла, густа кава з виразною гіркотою темного шоколаду та смаженого мигдалю.";
      ratio = "18 г кави на 180 мл води (1:10)";
      temp = "95°C";
      time = "4 хв 00 сек";
      grindText = "Ультрадрібний (для турки) або грубий (для френч-пресу)";
      steps = [
        "Для турки: змішайте каву з холодною водою і поставте на повільний вогонь.",
        "Для френч-пресу: залийте каву гарячою водою 95°C.",
        "Дочекайтеся утворення пінки в турці (не доводячи до кипіння) або зачекайте 4 хв у френч-пресі.",
        "Зніміть з вогню та дайте осісти кавовій гущі протягом 1 хвилини перед наливанням."
      ];
    }

    setRecommendation({ name, desc, ratio, temp, time, grindText, steps });
  };

  return (
    <section id="beans" className="py-24 bg-transparent relative overflow-hidden select-none">
      
      {/* Decorative coffee-leaf paths */}
      <div className="absolute top-[20%] right-[-5%] w-80 h-80 rounded-full border border-dashed border-coffee-milk/30 opacity-40 pointer-events-none" />

      <div className="w-[92%] max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[11px] font-sans font-extrabold tracking-widest text-coffee-accent uppercase block mb-3">
            {texts?.beansTag || "Власна кава вдома"}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-coffee-dark font-bold tracking-tight">
            {texts?.beansTitle || "Свіжообсмажена Крафтова Кава"}
          </h2>
          <div className="w-12 h-1 bg-gradient-to-r from-coffee-caramel to-coffee-accent mx-auto mt-4 rounded-full" />
          <p className="text-sm text-coffee-dark/60 font-sans mt-3">
            {texts?.beansSubtitle || "Візьми частинку Coffeetime із собою. Ми обсмажуємо ці зерна щовівторка дрібними партіями. Обирай зручний помел під твій метод заварювання."}
          </p>
        </div>

        {/* Beans Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {beans.map((bean) => {
            const currentGrind = selectedGrinds[bean.id] || 'whole';
            const isAdded = addedToCart[bean.id];

            return (
              <motion.div
                key={bean.id}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3 }}
                className="tactile-card rounded-3xl p-6 sm:p-8 border border-coffee-milk/35 flex flex-col justify-between text-left group"
                style={{ borderRadius: '28px' }}
              >
                <div>
                  
                  {/* Skeuomorphic Craft Coffee Bag Visualization */}
                  <div className="mb-6 p-6 rounded-2xl bg-coffee-cream/80 border border-coffee-milk/20 flex flex-col items-center justify-center relative shadow-inner overflow-hidden" style={{ borderRadius: '20px' }}>
                    
                    {/* Coffee stains texture inside wrapper */}
                    <div className="absolute w-32 h-32 rounded-full border border-coffee-milk/10 top-[-30px] left-[-30px]" />
                    
                    {/* 3D-styled coffee package wrapper */}
                    <div className="w-24 h-36 bg-[#E1C6A6] rounded-t-lg rounded-b-2xl border-2 border-coffee-milk relative shadow-lg flex flex-col items-center justify-between p-2.5" style={{ boxShadow: 'inset -6px -6px 12px rgba(33,16,7,0.08), 0 8px 20px rgba(33,16,7,0.1)' }}>
                      
                      {/* Top clip seal */}
                      <div className="w-28 h-3.5 bg-coffee-dark rounded-full absolute top-[-5px] shadow-sm flex items-center justify-center">
                        <span className="w-14 h-1 bg-white/20 rounded-full" />
                      </div>

                      {/* Package Label */}
                      <div className="w-full bg-white border border-coffee-milk/50 rounded-lg p-1 text-center mt-3 flex flex-col items-center shadow-inner" style={{ borderRadius: '8px' }}>
                        <Coffee className="w-4 h-4 text-coffee-accent" />
                        <span className="font-serif text-[10px] font-black text-coffee-dark uppercase tracking-tight leading-none mt-1">COFFEETIME</span>
                        <span className="font-sans text-[6px] text-coffee-caramel tracking-widest font-bold leading-none mt-0.5">ROASTED</span>
                        <div className="w-full h-[1px] bg-coffee-milk/30 my-1" />
                        <span className="text-[7px] text-coffee-accent font-black tracking-tighter max-w-[70px] truncate block leading-none">{bean.name.split(' ')[0]}</span>
                      </div>

                      {/* Roast Level Indicator Dot inside Bag */}
                      <div className="flex gap-1 items-center mt-2">
                        <span className={`w-2 h-2 rounded-full ${bean.roastLevel === 'light' ? 'bg-amber-400' : bean.roastLevel === 'medium' ? 'bg-coffee-caramel' : 'bg-coffee-deep'}`} style={{ borderRadius: '9999px' }} />
                        <span className="text-[7px] font-sans font-bold text-coffee-dark/60 uppercase">
                          {bean.roastLevel === 'light' ? 'Light' : bean.roastLevel === 'medium' ? 'Medium' : 'Dark'}
                        </span>
                      </div>

                    </div>

                    {/* Weight tag pill */}
                    <span className="bg-coffee-dark text-coffee-cream text-[9px] font-sans font-bold px-2 py-0.5 rounded-full absolute bottom-4 right-4" style={{ borderRadius: '9999px' }}>
                      {bean.weight}
                    </span>

                  </div>

                  {/* Coffee Details */}
                  <span className="text-[10px] font-sans font-bold text-coffee-accent tracking-widest uppercase block mb-1">
                    {bean.origin}
                  </span>
                  <h3 className="font-serif text-2xl font-black text-coffee-dark leading-none mb-3">
                    {bean.name}
                  </h3>

                  <div className="flex flex-col gap-2.5 text-xs text-coffee-dark/80 font-sans mb-6">
                    <div className="flex justify-between border-b border-coffee-milk/20 pb-1.5">
                      <span className="text-coffee-dark/60 font-medium">Спосіб обробки:</span>
                      <span className="font-bold text-coffee-dark">{bean.process}</span>
                    </div>
                    <div className="flex justify-between border-b border-coffee-milk/20 pb-1.5">
                      <span className="text-coffee-dark/60 font-medium">Висота зростання:</span>
                      <span className="font-bold text-coffee-dark">{bean.altitude}</span>
                    </div>
                    
                    {/* Taste profile tags */}
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {bean.notes.map((note, idx) => (
                        <span 
                          key={idx} 
                          className="bg-coffee-cream border border-coffee-milk/40 text-coffee-dark text-[10px] font-semibold px-2.5 py-1 rounded-full"
                          style={{ borderRadius: '9999px' }}
                        >
                          • {note}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Grind Type Selector */}
                <div className="flex flex-col gap-2 mt-2">
                  <span className="text-[9px] text-coffee-dark/40 font-extrabold uppercase tracking-widest flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-coffee-accent" /> Оберіть Помел
                  </span>
                  
                  <div className="grid grid-cols-4 gap-1 p-1 bg-coffee-cream border border-coffee-milk/30 rounded-2xl" style={{ borderRadius: '14px' }}>
                    {[
                      { id: 'whole', label: 'Зерно' },
                      { id: 'turkish', label: 'Турка' },
                      { id: 'espresso', label: 'Еспресо' },
                      { id: 'filter', label: 'Фільтр' }
                    ].map((gr) => (
                      <button
                        key={gr.id}
                        onClick={() => handleGrindChange(bean.id, gr.id as GrindType)}
                        className={`text-[9px] sm:text-[10px] py-1.5 font-bold rounded-xl transition-all cursor-pointer
                          ${currentGrind === gr.id 
                            ? 'bg-coffee-dark text-coffee-cream shadow-sm' 
                            : 'text-coffee-dark/70 hover:text-coffee-dark hover:bg-coffee-latte/50'}`}
                        style={{ borderRadius: '10px' }}
                      >
                        {gr.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bottom line: Price & Cart */}
                <div className="border-t border-coffee-milk/20 pt-5 mt-6 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-coffee-dark/40 font-bold uppercase tracking-wider">Ціна пачки</span>
                    <span className="font-serif text-2xl font-extrabold text-coffee-accent">{bean.price} ₴</span>
                  </div>

                  <AnimatePresence mode="wait">
                    {!isAdded ? (
                      <motion.button
                        key="add"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        onClick={() => handleAddToCart(bean.id)}
                        className="tactile-btn-accent text-xs font-bold text-coffee-cream px-5 py-3.5 rounded-full flex items-center gap-2 cursor-pointer"
                        style={{ borderRadius: '9999px' }}
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>У кошик</span>
                      </motion.button>
                    ) : (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 text-[11px] font-bold py-3.5 px-4 rounded-full flex items-center gap-1.5"
                        style={{ borderRadius: '9999px' }}
                      >
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Додано!</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </motion.div>
            );
          })}
        </div>

        {/* Home Brewing Wizard Widget */}
        <div className="mt-16 bg-white/40 backdrop-blur-md border border-white/50 rounded-3xl p-8 shadow-xl shadow-coffee-deep/5 max-w-4xl mx-auto" style={{ borderRadius: '28px' }}>
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="w-5 h-5 text-coffee-accent" />
            <h3 className="font-serif text-xl sm:text-2xl text-coffee-dark font-bold">Інтерактивний Гід по Заварюванню вдома</h3>
          </div>
          
          <p className="text-xs sm:text-sm text-coffee-dark/70 mb-8 font-sans">
            Оберіть ваш улюблений смак та інвентар, який є у вас вдома, а наш віртуальний бариста миттєво підбере сорт кави та розрахує ідеальні пропорції та покроковий рецепт заварювання.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left mb-8">
            {/* Step A: Choose brewer method */}
            <div className="flex flex-col gap-3">
              <label className="text-[11px] font-extrabold text-coffee-dark tracking-widest uppercase">1. Ваш домашній інвентар</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'filter', label: 'Фільтр / V60' },
                  { id: 'espresso', label: 'Еспресо-машина' },
                  { id: 'turk', label: 'Турка / Джезва' },
                  { id: 'french', label: 'Френч-Прес' }
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { setBrewMethod(m.id as any); setRecommendation(null); }}
                    className={`tactile-btn p-3 rounded-2xl text-center flex flex-col items-center justify-center cursor-pointer transition-all text-xs font-bold
                      ${brewMethod === m.id ? 'tactile-btn-pressed bg-coffee-milk/40 border-coffee-caramel font-black' : ''}`}
                    style={{ borderRadius: '16px' }}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Step B: Choose taste preference */}
            <div className="flex flex-col gap-3">
              <label className="text-[11px] font-extrabold text-coffee-dark tracking-widest uppercase">2. Чому ви віддаєте перевагу?</label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: 'floral', label: '🌸 Квітково-цитрусовий (яскраві фрукти)' },
                  { id: 'chocolate', label: '🍫 Карамельно-шоколадний (баланс солодкого)' },
                  { id: 'bitter', label: '☕ Класичний міцний (какао та горіхи)' }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => { setFlavorProfile(f.id as any); setRecommendation(null); }}
                    className={`tactile-btn p-3 rounded-2xl text-left px-4 cursor-pointer transition-all text-xs font-bold
                      ${flavorProfile === f.id ? 'tactile-btn-pressed bg-coffee-milk/40 border-coffee-caramel font-black' : ''}`}
                    style={{ borderRadius: '16px' }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-center mb-8">
            <button
              onClick={handleFindMyCoffee}
              className="tactile-btn-accent text-sm font-bold text-coffee-cream px-8 py-4 rounded-full flex items-center justify-center gap-2 cursor-pointer shadow-md animate-pulse"
              style={{ borderRadius: '9999px' }}
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Підібрати та Розрахувати Пропорції</span>
            </button>
          </div>

          {/* Recipe output card */}
          <AnimatePresence>
            {recommendation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden border-t border-coffee-milk/30 pt-8"
              >
                <div className="bg-coffee-cream/70 rounded-2xl p-6 border border-coffee-milk/30 text-left" style={{ borderRadius: '20px' }}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                    <div>
                      <span className="text-[10px] font-sans font-bold text-coffee-accent tracking-widest uppercase">Твій ідеальний вибір кави</span>
                      <h4 className="font-serif text-xl sm:text-2xl font-black text-coffee-dark">{recommendation.name}</h4>
                    </div>
                    <span className="bg-coffee-dark text-coffee-cream text-[11px] font-bold px-3 py-1 rounded-full animate-bounce" style={{ borderRadius: '9999px' }}>
                      Рекомендовано баристою
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-coffee-dark/80 font-sans mb-6 italic leading-relaxed">
                    «{recommendation.desc}»
                  </p>

                  {/* Brew Parameters Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white/60 p-3.5 rounded-xl border border-coffee-milk/20 flex items-center gap-3" style={{ borderRadius: '12px' }}>
                      <Scale className="w-5 h-5 text-coffee-accent" />
                      <div>
                        <p className="text-[9px] text-coffee-dark/40 font-bold uppercase leading-tight">Пропорція кави</p>
                        <p className="text-xs font-black text-coffee-dark">{recommendation.ratio}</p>
                      </div>
                    </div>

                    <div className="bg-white/60 p-3.5 rounded-xl border border-coffee-milk/20 flex items-center gap-3" style={{ borderRadius: '12px' }}>
                      <Thermometer className="w-5 h-5 text-coffee-accent" />
                      <div>
                        <p className="text-[9px] text-coffee-dark/40 font-bold uppercase leading-tight">Температура води</p>
                        <p className="text-xs font-black text-coffee-dark">{recommendation.temp}</p>
                      </div>
                    </div>

                    <div className="bg-white/60 p-3.5 rounded-xl border border-coffee-milk/20 flex items-center gap-3" style={{ borderRadius: '12px' }}>
                      <Timer className="w-5 h-5 text-coffee-accent" />
                      <div>
                        <p className="text-[9px] text-coffee-dark/40 font-bold uppercase leading-tight">Час контакту</p>
                        <p className="text-xs font-black text-coffee-dark">{recommendation.time}</p>
                      </div>
                    </div>
                  </div>

                  {/* Brewing steps list */}
                  <div className="flex flex-col gap-2">
                    <p className="text-xs font-black text-coffee-dark uppercase tracking-widest mb-1">Рекомендований помел: <span className="text-coffee-accent normal-case">{recommendation.grindText}</span></p>
                    <p className="text-xs font-black text-coffee-dark uppercase tracking-widest mb-2">Крок за кроком:</p>
                    <div className="flex flex-col gap-3">
                      {recommendation.steps.map((step: string, idx: number) => (
                        <div key={idx} className="flex gap-3 items-start">
                          <span className="w-5 h-5 rounded-full bg-coffee-accent/15 border border-coffee-accent/30 text-coffee-accent text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5" style={{ borderRadius: '9999px' }}>
                            {idx + 1}
                          </span>
                          <p className="text-xs sm:text-sm text-coffee-dark/80 font-sans leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dynamic Cart Navigation Banner */}
        <AnimatePresence>
          {((onAddToCart ? cart : [])?.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="mt-16 p-6 rounded-2xl bg-white/50 backdrop-blur-md border border-coffee-milk/15 shadow-lg text-left flex flex-col sm:flex-row items-center justify-between gap-4"
              style={{ borderRadius: '20px' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-coffee-latte text-coffee-accent flex items-center justify-center shrink-0">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif text-base font-black text-coffee-dark">У вашому кошику є товари</h4>
                  <p className="text-xs text-coffee-dark/60">
                    Всього товарів: <span className="font-bold text-coffee-accent">{cart?.reduce((sum: number, i: any) => sum + i.quantity, 0)}</span> | Сума: <span className="font-bold text-coffee-accent">{cart?.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0)} ₴</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  if (onGoToCart) {
                    onGoToCart();
                  }
                }}
                className="tactile-btn-accent text-xs font-bold text-coffee-cream px-5 py-3 rounded-full flex items-center gap-1.5 cursor-pointer w-full sm:w-auto justify-center"
                style={{ borderRadius: '9999px' }}
              >
                <span>Перейти до кошика 🛒</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </section>
  );
}
