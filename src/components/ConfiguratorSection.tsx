import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coffee, RotateCcw, Sparkles, Check, Flame, GlassWater, Phone, ShoppingCart } from 'lucide-react';

type CupSize = 'small' | 'medium' | 'large';
type RoastType = 'light' | 'medium' | 'dark';

interface ConfiguratorProps {
  milkList?: { id: string; label: string; price: number; color?: string }[];
  syrupList?: { id: string; label: string; price: number }[];
  toppingsList?: { id: string; label: string; price: number }[];
  cart?: any[];
  onAddToCart?: (item: any) => void;
  onGoToCart?: () => void;
}

export default function ConfiguratorSection({ milkList, syrupList, toppingsList, cart, onAddToCart, onGoToCart }: ConfiguratorProps = {}) {
  const [size, setSize] = useState<CupSize>('medium');
  const [roast, setRoast] = useState<RoastType>('medium');
  const [milk, setMilk] = useState<string>('oat');
  const [syrup, setSyrup] = useState<string>('none');
  const [toppings, setToppings] = useState<string[]>([]);
  const [fluidLevel, setFluidLevel] = useState(78);
  const [isOrdered, setIsOrdered] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSimulated, setIsSimulated] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isAddedToCart, setIsAddedToCart] = useState(false);

  const handleOrderCustomCoffee = async () => {
    window.location.href = "tel:+380961234567";
    setIsSending(true);
    setIsSimulated(false);
    setErrorText('');
    try {
      const customOrder = {
        isCustomCoffee: true,
        customerName: customerName || "Гість",
        customerPhone: customerPhone || "Не вказано",
        size,
        roast,
        milk,
        syrup,
        selectedAddons: toppings,
        totalPrice,
      };

      const response = await fetch('/api/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customOrder),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.simulated) {
          setIsSimulated(true);
        }
        if (data.error) {
          setErrorText(data.error);
        }
      } else {
        const data = await response.json().catch(() => ({}));
        setErrorText(data.error || 'Помилка надсилання на сервер');
        setIsSimulated(true);
      }
    } catch (err: any) {
      console.error('Error sending custom order to backend:', err);
      setErrorText(err.message || 'Помилка підключення до сервера');
      setIsSimulated(true);
    } finally {
      setIsSending(false);
      setIsOrdered(true);
      // Let it stay longer if simulated so the user has time to read the instructions
    }
  };

  const handleAddToCart = () => {
    const selectedMilkObj = milkList?.find(m => m.id === milk);
    const selectedSyrupObj = syrupList?.find(s => s.id === syrup);

    const milkLabel = selectedMilkObj ? selectedMilkObj.label : (milk === 'none' ? 'Без молока' : (milk === 'cow' ? 'Коров’яче' : milk === 'oat' ? 'Вівсяне' : milk === 'almond' ? 'Мигдалеве' : 'Кокосове'));
    const syrupLabel = selectedSyrupObj ? selectedSyrupObj.label : (syrup === 'none' ? 'Без сиропу' : (syrup === 'caramel' ? 'Карамель' : syrup === 'vanilla' ? 'Ваніль' : 'Лісовий горіх'));

    const toppingsLabels = toppings.map(tid => {
      const found = toppingsList?.find(t => t.id === tid);
      return found ? found.label : tid;
    });

    const detailsParts = [
      `Розмір: ${size === 'small' ? 'Малий' : size === 'medium' ? 'Середній' : 'Великий'}`,
      `Обсмаження: ${roast === 'light' ? 'Світле' : roast === 'medium' ? 'Середнє' : 'Темне'}`,
      `Молоко: ${milkLabel}`
    ];
    if (syrup !== 'none') {
      detailsParts.push(`Сироп: ${syrupLabel}`);
    }
    if (toppingsLabels.length > 0) {
      detailsParts.push(`Топінги: ${toppingsLabels.join(', ')}`);
    }

    const cartId = `custom-${size}-${roast}-${milk}-${syrup}-${toppings.sort().join('_')}`;

    if (onAddToCart) {
      onAddToCart({
        id: cartId,
        type: 'custom',
        name: 'Конструктор кави ☕',
        price: totalPrice,
        quantity: 1,
        details: detailsParts.join(' | ')
      });

      setIsAddedToCart(true);
      setTimeout(() => setIsAddedToCart(false), 3000);
    }
  };

  // Prices
  const basePrice = 50;
  const sizeSurcharge = size === 'small' ? 0 : size === 'medium' ? 15 : 25;
  
  // Dynamic milk surcharge
  const selectedMilkObj = milkList?.find(m => m.id === milk);
  const milkSurcharge = selectedMilkObj ? selectedMilkObj.price : (milk === 'none' ? 0 : (milk === 'cow' ? 15 : 25));

  // Dynamic syrup surcharge
  const selectedSyrupObj = syrupList?.find(s => s.id === syrup);
  const syrupSurcharge = selectedSyrupObj ? selectedSyrupObj.price : (syrup === 'none' ? 0 : 15);

  // Dynamic toppings surcharge
  const toppingsSurcharge = toppings.reduce((acc, tid) => {
    const found = toppingsList?.find(t => t.id === tid);
    return acc + (found ? found.price : 10);
  }, 0);

  const totalPrice = basePrice + sizeSurcharge + milkSurcharge + syrupSurcharge + toppingsSurcharge;

  // Fluid color based on milk choice
  const getFluidColor = () => {
    if (selectedMilkObj?.color) {
      return selectedMilkObj.color;
    }
    if (milk === 'none') {
      return '#201007'; // Pure black espresso
    }
    if (milk === 'cow') {
      return '#A47F64'; // Standard light brown milk coffee
    }
    if (milk === 'oat') {
      return '#B39178'; // Slightly creamy warm oat
    }
    if (milk === 'almond') {
      return '#C2A38C'; // Almond milk (paler)
    }
    if (milk === 'coconut') {
      return '#D6BEAD'; // Coconut milk (lightest creamy)
    }
    return '#4E2F1C';
  };

  // Helper to find the closest cup size based on fluid level percentage
  const getClosestSize = (level: number): CupSize => {
    const targets: { size: CupSize; val: number }[] = [
      { size: 'small', val: 55 },
      { size: 'medium', val: 78 },
      { size: 'large', val: 95 }
    ];
    let closest = targets[0];
    let minDiff = Math.abs(level - targets[0].val);
    for (let i = 1; i < targets.length; i++) {
      const diff = Math.abs(level - targets[i].val);
      if (diff < minDiff) {
        minDiff = diff;
        closest = targets[i];
      }
    }
    return closest.size;
  };

  // Fluid height percentage based on slider selection
  const getFluidHeight = () => {
    return `${fluidLevel}%`;
  };

  const handleReset = () => {
    setSize('medium');
    setRoast('medium');
    setMilk('oat');
    setSyrup('none');
    setToppings([]);
    setFluidLevel(78);
    setIsOrdered(false);
  };

  return (
    <section id="configurator" className="py-24 bg-transparent relative overflow-hidden select-none">
      
      {/* Abstract coffee rings decoration */}
      <div className="absolute top-1/2 left-[-10%] w-[350px] h-[350px] rounded-full border border-coffee-milk/20 pointer-events-none" />
      <div className="absolute bottom-10 right-[-5%] w-[250px] h-[250px] rounded-full border border-coffee-milk/20 pointer-events-none" />

      <div className="w-[92%] max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[11px] font-sans font-extrabold tracking-widest text-coffee-accent uppercase block mb-3">Кавовий архітектор</span>
          <h2 className="font-serif text-3xl sm:text-4xl text-coffee-dark font-bold tracking-tight">Калькулятор та Конструктор Смаку</h2>
          <div className="w-12 h-1 bg-gradient-to-r from-coffee-caramel to-coffee-accent mx-auto mt-4 rounded-full" />
          <p className="text-sm text-coffee-dark/60 font-sans mt-3">Створи свій унікальний напій, обравши інгредієнти. Ми приготуємо його точно за рецептом.</p>
        </div>

        {/* Builder Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Visual Skeuomorphic Coffee Cup Representation */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center bg-white/40 backdrop-blur-md border border-white/50 rounded-3xl p-8 shadow-xl shadow-coffee-deep/5 min-h-[460px] relative" style={{ borderRadius: '28px' }}>
            <div className="absolute inset-0 bg-coffee-cream coffee-grain rounded-3xl -z-10 opacity-60" style={{ borderRadius: '28px' }} />
            
            <span className="text-[10px] font-sans font-bold text-coffee-accent/60 tracking-wider uppercase absolute top-6 left-6">Жива симуляція напою</span>
            
            {/* Interactive reset icon */}
            <button 
              onClick={handleReset}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-coffee-latte hover:bg-coffee-milk/40 flex items-center justify-center transition-all border border-coffee-milk/30 cursor-pointer"
              title="Скинути"
              style={{ borderRadius: '9999px' }}
            >
              <RotateCcw className="w-4 h-4 text-coffee-dark" />
            </button>

            {/* Simulated Cup Widget */}
            <div className="relative w-64 h-64 flex items-center justify-center mt-6">
              
              {/* Cup background aura */}
              <div className="absolute w-52 h-52 rounded-full bg-coffee-milk/20 blur-2xl -z-10" />

              {/* Skeuomorphic clear glass mug */}
              <div className="relative w-44 h-52 border-4 border-white/95 rounded-b-[40px] rounded-t-lg bg-white/20 backdrop-blur-[1px] shadow-2xl flex flex-col justify-end overflow-hidden p-1.5" style={{ boxShadow: 'inset 0 0 16px rgba(255,255,255,0.4), 0 15px 30px rgba(33, 16, 7, 0.1)' }}>
                
                {/* Coffee Fluid inside mug - uses Framer Motion to smoothly animate height and color changes */}
                <motion.div
                  animate={{ 
                    height: getFluidHeight(),
                    backgroundColor: getFluidColor()
                  }}
                  transition={{ type: "spring", stiffness: 80, damping: 15 }}
                  className="w-full rounded-b-[30px] relative flex flex-col justify-start overflow-hidden shadow-inner"
                >
                  {/* Froth layer (White foam texture at top of the fluid) */}
                  <div className="w-full h-4 bg-white/30 backdrop-blur-[2px] absolute top-0 left-0 flex items-center justify-around opacity-90">
                    <span className="w-3 h-1.5 bg-white/50 rounded-full blur-[1px]" />
                    <span className="w-6 h-2 bg-white/40 rounded-full blur-[1.5px]" />
                    <span className="w-2 h-1 bg-white/60 rounded-full" />
                  </div>

                  {/* Bubbles floating inside coffee */}
                  <div className="absolute inset-x-0 bottom-4 flex justify-around opacity-30 pointer-events-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <span className="w-1 h-1 rounded-full bg-white animate-pulse" style={{ animationDelay: '0.7s' }} />
                    <span className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '1.4s' }} />
                  </div>

                  {/* Syrup Layer at the very bottom (different colors) */}
                  {syrup !== 'none' && (
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: 16 }}
                      className={`w-full absolute bottom-0 left-0 opacity-75 blur-[1px]
                        ${syrup === 'caramel' ? 'bg-[#FF9900]' : syrup === 'vanilla' ? 'bg-[#FFF2B2]' : 'bg-[#805020]'}`}
                    />
                  )}

                </motion.div>

                {/* Internal measurements markers */}
                <div className="absolute left-3 top-1/4 bottom-1/4 flex flex-col justify-between text-[8px] font-mono text-coffee-dark/30 font-bold">
                  <span>- 400ml</span>
                  <span>- 300ml</span>
                  <span>- 200ml</span>
                </div>

              </div>

              {/* Glass Handle */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-24 border-[6px] border-white/95 rounded-r-2xl shadow-md -z-10" />

              {/* Wooden Coaster Plate beneath glass */}
              <div className="absolute bottom-[-10px] w-52 h-5 bg-amber-800/80 rounded-full border border-amber-900/30 shadow-md shadow-coffee-deep/20" />

            </div>

            {/* Live Stats summary labels */}
            <div className="flex gap-4 mt-8 text-xs font-sans text-coffee-dark/60 font-medium">
              <span className="flex items-center gap-1">
                <GlassWater className="w-3.5 h-3.5 text-coffee-accent" />
                {Math.round(fluidLevel * 4)} мл
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-coffee-accent" />
                {roast === 'light' ? 'Світле' : roast === 'medium' ? 'Середнє' : 'Темне'}
              </span>
              <span>•</span>
              <span className="capitalize">{milk === 'none' ? 'Без молока' : `${milk === 'cow' ? 'коров’яче' : milk === 'oat' ? 'вівсяне' : milk === 'almond' ? 'мигдалеве' : 'кокосове'} молоко`}</span>
            </div>

            {/* Live interactive fluid level slider */}
            <div className="w-full mt-6 px-4 text-left">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-coffee-dark/50 font-black uppercase tracking-wider">Рівень рідини у склянці</span>
                <span className="text-xs font-serif font-black text-coffee-accent">{fluidLevel}% ({Math.round(fluidLevel * 4)} мл)</span>
              </div>
              <input 
                type="range" 
                min="35" 
                max="100" 
                value={fluidLevel} 
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setFluidLevel(val);
                  setIsOrdered(false);
                  setSize(getClosestSize(val));
                }}
                className="w-full accent-coffee-accent cursor-pointer bg-coffee-milk/30 h-1.5 rounded-lg"
              />
            </div>

          </div>

          {/* Right Column: Customizer Controls */}
          <div className="lg:col-span-7 flex flex-col gap-8 text-left">
            
            {/* Control 1: Cup Size */}
            <div className="flex flex-col gap-3">
              <label className="text-xs font-extrabold text-coffee-dark tracking-widest uppercase">1. Оберіть Об'єм</label>
              <div className="grid grid-cols-3 gap-3">
                {(['small', 'medium', 'large'] as CupSize[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setSize(s);
                      setIsOrdered(false);
                      // Instantly update fluid level state based on cup size selection for visual response
                      if (s === 'small') setFluidLevel(55);
                      else if (s === 'medium') setFluidLevel(78);
                      else setFluidLevel(95);
                    }}
                    className={`tactile-btn p-4 rounded-2xl text-center flex flex-col items-center gap-1 cursor-pointer transition-all
                      ${size === s ? 'tactile-btn-pressed !bg-coffee-milk/50 !border-coffee-caramel font-bold scale-[0.98]' : ''}`}
                    style={{ borderRadius: '18px' }}
                  >
                    <span className="text-sm font-bold text-coffee-dark">
                      {s === 'small' ? 'Малий' : s === 'medium' ? 'Середній' : 'Великий'}
                    </span>
                    <span className="text-[10px] text-coffee-accent font-semibold">
                      {s === 'small' ? '200 мл' : s === 'medium' ? '300 мл (+15₴)' : '400 мл (+25₴)'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Control 2: Roast */}
            <div className="flex flex-col gap-3">
              <label className="text-xs font-extrabold text-coffee-dark tracking-widest uppercase">2. Обсмаження зерна</label>
              <div className="grid grid-cols-3 gap-3">
                {(['light', 'medium', 'dark'] as RoastType[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => { setRoast(r); setIsOrdered(false); }}
                    className={`tactile-btn p-4 rounded-2xl text-center flex flex-col items-center gap-1 cursor-pointer transition-all
                      ${roast === r ? 'tactile-btn-pressed !bg-coffee-milk/50 !border-coffee-caramel font-bold scale-[0.98]' : ''}`}
                    style={{ borderRadius: '18px' }}
                  >
                    <span className="text-sm font-bold text-coffee-dark">
                      {r === 'light' ? 'Світле' : r === 'medium' ? 'Середнє' : 'Темне'}
                    </span>
                    <span className="text-[10px] text-coffee-dark/60">
                      {r === 'light' ? 'Ягідне / М’яке' : r === 'medium' ? 'Шоколадно-горіхове' : 'Гірке / Міцне'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Control 3: Milk Type */}
            <div className="flex flex-col gap-3">
              <label className="text-xs font-extrabold text-coffee-dark tracking-widest uppercase">3. Основа / Молоко</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {milkList ? (
                  milkList.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => { setMilk(m.id); setIsOrdered(false); }}
                      className={`tactile-btn py-3 px-1 rounded-2xl text-center flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all
                        ${milk === m.id ? 'tactile-btn-pressed !bg-coffee-milk/50 !border-coffee-caramel font-bold scale-[0.98]' : ''}`}
                      style={{ borderRadius: '14px' }}
                    >
                      <span className="text-xs font-bold text-coffee-dark leading-tight">
                        {m.label}
                      </span>
                      <span className="text-[9px] text-coffee-accent font-semibold leading-none">
                        +{m.price}₴
                      </span>
                    </button>
                  ))
                ) : (
                  [
                    { id: 'none', label: 'Чорна', price: 0 },
                    { id: 'cow', label: 'Коров’яче', price: 15 },
                    { id: 'oat', label: 'Вівсяне', price: 25 },
                    { id: 'almond', label: 'Мигдалеве', price: 25 },
                    { id: 'coconut', label: 'Кокосове', price: 25 }
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => { setMilk(m.id); setIsOrdered(false); }}
                      className={`tactile-btn py-3.5 px-1 rounded-2xl text-center flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all
                        ${milk === m.id ? 'tactile-btn-pressed !bg-coffee-milk/50 !border-coffee-caramel font-bold scale-[0.98]' : ''}`}
                      style={{ borderRadius: '14px' }}
                    >
                      <span className="text-xs font-bold text-coffee-dark leading-tight">
                        {m.label}
                      </span>
                      <span className="text-[9px] text-coffee-accent font-semibold leading-none">
                        +{m.price}₴
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Control 4: Syrup */}
            <div className="flex flex-col gap-3">
              <label className="text-xs font-extrabold text-coffee-dark tracking-widest uppercase">4. Натуральні сиропи</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {syrupList ? (
                  syrupList.map((sy) => (
                    <button
                      key={sy.id}
                      onClick={() => { setSyrup(sy.id); setIsOrdered(false); }}
                      className={`tactile-btn py-3 px-1 rounded-2xl text-center flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all
                        ${syrup === sy.id ? 'tactile-btn-pressed !bg-coffee-milk/50 !border-coffee-caramel font-bold scale-[0.98]' : ''}`}
                      style={{ borderRadius: '14px' }}
                    >
                      <span className="text-xs font-bold text-coffee-dark">
                        {sy.label}
                      </span>
                      {sy.price > 0 && (
                        <span className="text-[9px] text-coffee-accent font-semibold block leading-none mt-0.5">
                          +{sy.price}₴
                        </span>
                      )}
                    </button>
                  ))
                ) : (
                  [
                    { id: 'none', label: 'Без сиропу', price: 0 },
                    { id: 'caramel', label: 'Карамель', price: 15 },
                    { id: 'vanilla', label: 'Ваніль', price: 15 },
                    { id: 'hazelnut', label: 'Лісовий горіх', price: 15 }
                  ].map((sy) => (
                    <button
                      key={sy.id}
                      onClick={() => { setSyrup(sy.id); setIsOrdered(false); }}
                      className={`tactile-btn py-3 px-1 rounded-2xl text-center flex flex-col items-center justify-center cursor-pointer transition-all
                        ${syrup === sy.id ? 'tactile-btn-pressed !bg-coffee-milk/50 !border-coffee-caramel font-bold scale-[0.98]' : ''}`}
                      style={{ borderRadius: '14px' }}
                    >
                      <span className="text-xs font-bold text-coffee-dark">
                        {sy.label}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Control 5: Toppings */}
            <div className="flex flex-col gap-3">
              <label className="text-xs font-extrabold text-coffee-dark tracking-widest uppercase">5. Авторські топінги</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {toppingsList ? (
                  toppingsList.map((top) => {
                    const isSelected = toppings.includes(top.id);
                    return (
                      <button
                        key={top.id}
                        onClick={() => {
                          setIsOrdered(false);
                          setToppings(prev => 
                            isSelected ? prev.filter(t => t !== top.id) : [...prev, top.id]
                          );
                        }}
                        className={`tactile-btn py-3 px-1 rounded-2xl text-center flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all text-xs font-semibold
                          ${isSelected ? 'tactile-btn-pressed !bg-coffee-milk/50 !border-coffee-caramel font-bold scale-[0.98]' : ''}`}
                        style={{ borderRadius: '14px' }}
                      >
                        <span className="font-bold text-coffee-dark">{top.label}</span>
                        <span className="text-[9px] text-coffee-accent font-semibold block leading-none mt-0.5">+{top.price}₴</span>
                      </button>
                    );
                  })
                ) : (
                  [
                    { id: 'cinnamon', label: 'Дрібка кориці' },
                    { id: 'chocolate', label: 'Тертий шоколад' },
                    { id: 'nutmeg', label: 'Мускатний горіх' },
                    { id: 'cream', label: 'Збиті вершки' }
                  ].map((top) => {
                    const isSelected = toppings.includes(top.id);
                    return (
                      <button
                        key={top.id}
                        onClick={() => {
                          setIsOrdered(false);
                          setToppings(prev => 
                            isSelected ? prev.filter(t => t !== top.id) : [...prev, top.id]
                          );
                        }}
                        className={`tactile-btn py-3 px-1.5 rounded-2xl text-center flex flex-col items-center justify-center cursor-pointer transition-all text-xs font-semibold
                          ${isSelected ? 'tactile-btn-pressed !bg-coffee-milk/50 !border-coffee-caramel font-bold scale-[0.98]' : ''}`}
                        style={{ borderRadius: '14px' }}
                      >
                        {top.label}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
 
            {/* Contact Fields */}
            <div className="bg-white/45 backdrop-blur-md border border-white/60 rounded-3xl p-5 mt-4 text-left" style={{ borderRadius: '24px' }}>
              <span className="text-[10px] font-bold text-coffee-accent uppercase tracking-wider block mb-3">Залишіть контакти, щоб бариста знав ваше ім'я</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] text-coffee-dark/60 font-bold uppercase tracking-wider block mb-1">Ваше ім'я</label>
                  <input 
                    type="text" 
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Напр. Олексій" 
                    className="w-full bg-white border border-coffee-milk/25 px-3 py-2 text-xs font-semibold text-coffee-dark rounded-xl focus:outline-none focus:ring-1 focus:ring-coffee-accent"
                    style={{ borderRadius: '10px' }}
                  />
                </div>
                <div>
                  <label className="text-[9px] text-coffee-dark/60 font-bold uppercase tracking-wider block mb-1">Телефон</label>
                  <input 
                    type="tel" 
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+380..." 
                    className="w-full bg-white border border-coffee-milk/25 px-3 py-2 text-xs font-semibold text-coffee-dark rounded-xl focus:outline-none focus:ring-1 focus:ring-coffee-accent"
                    style={{ borderRadius: '10px' }}
                  />
                </div>
              </div>
            </div>

            {/* Order/Checkout Tactile Plate */}
            <div className="tactile-card rounded-3xl p-6 mt-4 flex flex-col sm:flex-row items-center justify-between border border-coffee-milk/30 gap-6" style={{ borderRadius: '24px' }}>
              <div className="text-left w-full sm:w-auto">
                <span className="text-[10px] font-sans font-bold text-coffee-accent tracking-widest uppercase">Твій унікальний рецепт</span>
                <p className="text-xs text-coffee-dark/70 font-sans mt-1">
                  Кава {size === 'small' ? 'мала' : size === 'medium' ? 'середня' : 'велика'}, обсмаження {roast === 'light' ? 'світле' : roast === 'medium' ? 'середнє' : 'темне'}
                  {milk !== 'none' && `, на ${selectedMilkObj ? selectedMilkObj.label.toLowerCase() : (milk === 'cow' ? 'коров’ячому' : milk === 'oat' ? 'вівсяному' : milk === 'almond' ? 'мигдалевому' : 'кокосовому')} молоці`}
                  {syrup !== 'none' && `, із сиропом «${selectedSyrupObj ? selectedSyrupObj.label : (syrup === 'caramel' ? 'Карамель' : syrup === 'vanilla' ? 'Ваніль' : 'Лісовий горіх')}»`}
                  {toppings.length > 0 && `, топінги: ${toppings.map(t => {
                    const found = toppingsList?.find(top => top.id === t);
                    return found ? found.label.toLowerCase() : (t === 'cinnamon' ? 'кориця' : t === 'chocolate' ? 'шоколад' : t === 'nutmeg' ? 'мускатний горіх' : 'вершки');
                  }).join(', ')}`}.
                </p>
                <div className="flex items-baseline gap-2 mt-3">
                  <span className="text-[10px] text-coffee-dark/40 font-bold uppercase tracking-wider">Разом</span>
                  <span className="font-serif text-3xl font-extrabold text-coffee-accent">{totalPrice} ₴</span>
                </div>
              </div>

              <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3">
                <AnimatePresence mode="wait">
                  {!isOrdered ? (
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                      {onAddToCart && (
                        <motion.button
                          key="cart-btn"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          onClick={handleAddToCart}
                          className={`text-xs font-bold px-6 py-4 rounded-full flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer transition-all border
                            ${isAddedToCart 
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-700' 
                              : 'bg-white border-coffee-milk/35 text-coffee-dark hover:bg-coffee-latte/40'}`}
                          style={{ borderRadius: '9999px' }}
                        >
                          {isAddedToCart ? (
                            <>
                              <Check className="w-4 h-4 text-emerald-500 animate-bounce" />
                              <span>Додано в Кошик! 🛒</span>
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-4 h-4 text-coffee-accent" />
                              <span>Додати у кошик</span>
                            </>
                          )}
                        </motion.button>
                      )}

                      <motion.button
                        key="order-btn"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        disabled={isSending}
                        onClick={handleOrderCustomCoffee}
                        className="tactile-btn-accent text-xs font-bold text-coffee-cream px-6 py-4 rounded-full flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer disabled:opacity-75 whitespace-nowrap"
                        style={{ borderRadius: '9999px' }}
                      >
                        {isSending ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Набираємо...</span>
                          </>
                        ) : (
                          <>
                            <Phone className="w-4 h-4 animate-pulse" />
                            <span>Замовити телефоном</span>
                          </>
                        )}
                      </motion.button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-end gap-3 w-full sm:w-80">
                      <motion.div
                        key="success-msg"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-center gap-3 text-emerald-800 cursor-pointer w-full"
                        style={{ borderRadius: '18px' }}
                        onClick={() => {
                          window.location.href = "tel:+380961234567";
                        }}
                      >
                        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0" style={{ borderRadius: '9999px' }}>
                          <Phone className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-bold leading-tight">Набираємо номер...</p>
                          <p className="text-[10px] text-emerald-700 font-sans mt-0.5">Телефонуйте: +380 (96) 123-45-67</p>
                        </div>
                      </motion.div>

                      {isSimulated && (
                        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-[11px] leading-relaxed text-left w-full">
                          <p className="font-bold mb-1 text-amber-950">ℹ️ Налаштування SMTP:</p>
                          <p className="mb-1 text-[10px]">Щоб рецепт дійсно надіслався на пошту <strong className="font-semibold">tutudimakiber@gmail.com</strong>, додайте змінні у лівому меню Settings:</p>
                          <div className="font-mono text-[9px] bg-amber-100/50 p-1 rounded">
                            • SMTP_USER = ваша пошта
                            <br />• SMTP_PASS = пароль додатка
                          </div>
                          {errorText && <p className="text-red-600 font-bold mt-1 text-[9px]">Помилка: {errorText}</p>}
                        </div>
                      )}

                      <button
                        onClick={() => setIsOrdered(false)}
                        className="text-xs font-bold text-coffee-dark/60 hover:text-coffee-dark underline cursor-pointer self-center sm:self-end"
                      >
                        Скинути
                      </button>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
}
