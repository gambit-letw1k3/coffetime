import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MenuItem } from '../types';
import { Sparkles, GlassWater, Eye, ShoppingCart, Search, Trash2, Plus, Minus, CheckCircle, Clock, Phone } from 'lucide-react';

interface CartItem {
  id: string; // Unique cart item ID (combines item.id + milk + syrup)
  item: MenuItem;
  quantity: number;
  milk: string;
  syrup: string;
}

interface MenuProps {
  menuItems?: MenuItem[];
  milkList?: { id: string; label: string; price: number; color?: string }[];
  syrupList?: { id: string; label: string; price: number }[];
  cart?: any[];
  onAddToCart?: (item: any) => void;
  onGoToCart?: () => void;
}

export default function MenuSection({ menuItems: propsMenuItems, milkList, syrupList, cart: globalCart, onAddToCart, onGoToCart }: MenuProps = {}) {
  const [activeCategory, setActiveCategory] = useState<'classic' | 'signature' | 'brewed' | 'desserts'>('classic');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  // Search and Cart state
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedMilk, setSelectedMilk] = useState('Класичне коров’яче');
  const [selectedSyrup, setSelectedSyrup] = useState('Без сиропу');
  const [tipPercent, setTipPercent] = useState(10);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [isSimulated, setIsSimulated] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Toast / Floating message
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const categories = [
    { id: 'classic', label: 'Класика' },
    { id: 'signature', label: 'Авторські' },
    { id: 'brewed', label: 'Альтернатива' },
    { id: 'desserts', label: 'Десерти' }
  ];

  const defaultMenuItems: MenuItem[] = [
    // Classic
    {
      id: 'm1',
      name: 'Еспресо',
      description: 'Густий, насичений шот кави з щільною золотистою пінкою крема та тривалим горіховим післясмаком.',
      price: 45,
      category: 'classic',
      strength: 5,
      volume: '30 мл',
      tags: ['Інтенсивний', 'Чорний'],
      color: '#211007'
    },
    {
      id: 'm2',
      name: 'Капучино',
      description: 'Класичний баланс міцного еспресо та оксамитової молочної мікропінки. Наш бестселер.',
      price: 65,
      category: 'classic',
      strength: 3,
      milkRatio: '60% Молоко, 20% Пінка, 20% Еспресо',
      volume: '240 мл',
      tags: ['Ніжний', 'Молочний'],
      color: '#A36B3B'
    },
    {
      id: 'm3',
      name: 'Лате',
      description: 'Максимально ніжний кавово-молочний напій, де еспресо м’яко поєднується з великою кількістю гарячого молока.',
      price: 70,
      category: 'classic',
      strength: 2,
      milkRatio: '80% Молоко, 10% Пінка, 10% Еспресо',
      volume: '340 мл',
      tags: ['Вершковий', 'М’який'],
      color: '#E6D5C3'
    },
    {
      id: 'm4',
      name: 'Флет Вайт',
      description: 'Подвійний еспресо з тонким шаром гарячого молока. Насичений кавовий смак із шовковистою текстурою.',
      price: 80,
      category: 'classic',
      strength: 4,
      milkRatio: '50% Молоко, 50% Еспресо',
      volume: '200 мл',
      tags: ['Кавовий', 'Міцний'],
      color: '#6F4E37'
    },

    // Signature
    {
      id: 'm5',
      name: 'Лавандовий Раф',
      description: 'Ніжний збитий напій на основі еспресо, вершків та натурального лавандового цукру власного приготування.',
      price: 90,
      category: 'signature',
      strength: 2,
      milkRatio: '80% Вершки, 20% Еспресо',
      volume: '300 мл',
      tags: ['Квітковий', 'Вершковий'],
      color: '#C08A58'
    },
    {
      id: 'm6',
      name: 'Апельсиновий Бамбл',
      description: 'Еспресо, що нашаровується на свіжовижатий апельсиновий сік з льодом та карамельним сиропом. Ідеальне освіження.',
      price: 95,
      category: 'signature',
      strength: 3,
      volume: '320 мл',
      tags: ['Цитрусовий', 'Холодний'],
      color: '#C08A58'
    },
    {
      id: 'm7',
      name: 'Coffeetime Халва-Кардамон',
      description: 'Наш фірмовий напій. Еспресо з додаванням талої халви, збитий з вершками та дрібкою ароматного кардамону.',
      price: 110,
      category: 'signature',
      strength: 3,
      milkRatio: '70% Вершки, 10% Халва, 20% Еспресо',
      volume: '280 мл',
      tags: ['Пряний', 'Фірмовий'],
      color: '#A36B3B'
    },

    // Brewed
    {
      id: 'm8',
      name: 'Фільтр-кава (V60)',
      description: 'Кава, заварена крапельним методом через паперовий фільтр. Розкриває всі тонкі квіткові та ягідні ноти сорту.',
      price: 60,
      category: 'brewed',
      strength: 3,
      volume: '250 мл',
      tags: ['Квітковий', 'Чистий смак'],
      color: '#3D2314'
    },
    {
      id: 'm9',
      name: 'Колд Брю',
      description: 'Кава холодного настоювання, що готується протягом 18 годин. Неймовірно м’який смак без гіркоти з високим вмістом кофеїну.',
      price: 75,
      category: 'brewed',
      strength: 4,
      volume: '300 мл',
      tags: ['Шоколадний', 'Холодний'],
      color: '#211007'
    },

    // Desserts
    {
      id: 'm10',
      name: 'Баскський Чізкейк',
      description: 'Ніжний всередині та карамелізований зверху чізкейк Сан-Себастьян. Справжній гастрономічний екстаз.',
      price: 120,
      category: 'desserts',
      strength: 0,
      volume: '150 г',
      tags: ['Солодкий', 'Ніжний'],
      color: '#FAF6F0'
    },
    {
      id: 'm11',
      name: 'Мигдалевий Круасан',
      description: 'Класичний французький круасан із щедрою мигдалевою начинкою (франжипаном) та пелюстками мигдалю зверху.',
      price: 85,
      category: 'desserts',
      strength: 0,
      volume: '120 г',
      tags: ['Хрусткий', 'Горіховий'],
      color: '#E6D5C3'
    }
  ];

  const menuItems = propsMenuItems || defaultMenuItems;

  const addToCart = (item: MenuItem, milk: string = 'Класичне коров’яче', syrup: string = 'Без сиропу') => {
    // If it's a dessert, it has no milk or syrup
    const actualMilk = item.category === 'desserts' ? '—' : milk;
    const actualSyrup = item.category === 'desserts' ? '—' : syrup;

    const cartId = `menu-${item.id}-${actualMilk}-${actualSyrup}`;

    // Parse milk & syrup prices if any
    let priceWithAddons = item.price;
    if (item.category !== 'desserts') {
      const selectedMilkClean = milk.split(' (+')[0];
      const milkObj = milkList?.find(m => m.label === selectedMilkClean);
      if (milkObj) {
        priceWithAddons += milkObj.price;
      } else if (milk.includes('+10')) {
        priceWithAddons += 10;
      } else if (milk.includes('+15')) {
        priceWithAddons += 15;
      }

      const selectedSyrupClean = syrup.split(' (+')[0];
      const syrupObj = syrupList?.find(s => s.label === selectedSyrupClean);
      if (syrupObj) {
        priceWithAddons += syrupObj.price;
      } else if (syrup.includes('+10')) {
        priceWithAddons += 10;
      } else if (syrup.includes('+15')) {
        priceWithAddons += 15;
      }
    }

    const detailsParts = [];
    if (item.category !== 'desserts') {
      if (actualMilk && actualMilk !== '—') detailsParts.push(`Молоко: ${actualMilk}`);
      if (actualSyrup && actualSyrup !== '—' && actualSyrup !== 'Без сиропу') detailsParts.push(`Сироп: ${actualSyrup}`);
    } else {
      detailsParts.push('Десерт');
    }
    const details = detailsParts.join(' | ') || 'Класичний рецепт';

    if (onAddToCart) {
      onAddToCart({
        id: cartId,
        type: 'menu',
        name: item.name,
        price: priceWithAddons,
        quantity: 1,
        details,
        category: item.category
      });

      // Show toast
      setToastMsg(`«${item.name}» додано в кошик!`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } else {
      setCart((prev) => {
        const exists = prev.find((i) => i.id === cartId);
        if (exists) {
          return prev.map((i) => (i.id === cartId ? { ...i, quantity: i.quantity + 1 } : i));
        }
        return [...prev, { id: cartId, item, quantity: 1, milk: actualMilk, syrup: actualSyrup }];
      });
    }
  };

  const updateCartQuantity = (cartId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => (i.id === cartId ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const removeFromCart = (cartId: string) => {
    setCart((prev) => prev.filter((i) => i.id !== cartId));
  };

  const handlePlaceOrder = async () => {
    window.location.href = "tel:+380961234567";
    setIsSubmittingOrder(true);
    setIsSimulated(false);
    setErrorText('');
    try {
      const orderDetails = {
        customerName: customerName || "Гість",
        customerPhone: customerPhone || "Не вказано",
        items: cart.map(c => ({
          name: c.item.name,
          category: c.item.category,
          price: c.item.price,
          quantity: c.quantity,
          milk: c.milk,
          syrup: c.syrup,
        })),
        totalAmount: total,
      };

      const response = await fetch('/api/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderDetails),
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
        setErrorText(data.error || 'Помилка надсилання замовлення на сервер');
        setIsSimulated(true);
      }
    } catch (err: any) {
      console.error('Error sending order details to backend:', err);
      setErrorText(err.message || 'Помилка підключення до сервера');
      setIsSimulated(true);
    } finally {
      setIsSubmittingOrder(false);
      setOrderSuccess(true);
      setCart([]);
      // keep the orderSuccess visual state active longer if simulated to let user read the guide
    }
  };

  const subtotal = cart.reduce((sum, i) => sum + i.item.price * i.quantity, 0);
  const tipAmount = Math.round((subtotal * tipPercent) / 100);
  const total = subtotal + tipAmount;

  // Filter items based on activeCategory AND searchQuery
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // If searching, search globally across all categories
    if (searchQuery) {
      return matchesSearch;
    }
    return item.category === activeCategory;
  });

  return (
    <section id="menu" className="py-24 bg-transparent coffee-grain relative select-none">
      
      <div className="w-[92%] max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="text-left">
            <span className="text-[11px] font-sans font-extrabold tracking-widest text-coffee-accent uppercase block mb-3">Кавова карта</span>
            <h2 className="font-serif text-3xl sm:text-4xl text-coffee-dark font-bold tracking-tight">Естетичне Меню Coffeetime</h2>
            <p className="text-sm text-coffee-dark/60 font-sans mt-2 max-w-md">Кожна позиція розроблена шеф-бариста для створення унікального смакового враження.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-stretch sm:items-center">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee-dark/40" />
              <input
                type="text"
                placeholder="Пошук кави чи десерту..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-coffee-milk/30 bg-white/50 text-xs font-semibold text-coffee-dark focus:outline-none focus:ring-2 focus:ring-coffee-accent transition-all placeholder:text-coffee-dark/30"
                style={{ borderRadius: '16px' }}
              />
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-1 bg-white/40 backdrop-blur-md p-1.5 rounded-3xl border border-white/50" style={{ borderRadius: '24px' }}>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id as any);
                    setSearchQuery(''); // Reset search when switching tab
                  }}
                  className={`px-4.5 py-2.5 rounded-2xl text-xs font-semibold tracking-wide transition-all cursor-pointer
                    ${activeCategory === cat.id && !searchQuery
                      ? 'bg-coffee-dark text-coffee-cream shadow-md shadow-coffee-deep/10' 
                      : 'text-coffee-dark/80 hover:text-coffee-dark hover:bg-coffee-milk/30'}`}
                  style={{ borderRadius: '16px' }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -15 }}
                transition={{ duration: 0.35 }}
                whileHover={{ y: -6, scale: 1.01 }}
                className="tactile-card rounded-3xl p-6 border border-coffee-milk/35 flex flex-col justify-between group cursor-pointer relative overflow-hidden"
                style={{ borderRadius: '24px' }}
              >
                {/* Decorative cup-stain circle in top-right */}
                <div className="absolute top-[-20px] right-[-20px] w-24 h-24 rounded-full border border-coffee-milk/10 group-hover:border-coffee-accent/10 transition-colors pointer-events-none" />

                <div>
                  {/* Top line */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="font-serif text-xl font-bold text-coffee-dark tracking-tight group-hover:text-coffee-accent transition-colors">
                      {item.name}
                    </h3>
                    <span className="font-serif text-lg font-extrabold text-coffee-accent whitespace-nowrap bg-coffee-latte/50 px-3 py-1 rounded-full border border-coffee-milk/25">
                      {item.price} ₴
                    </span>
                  </div>

                  {/* Volume/weight with glass icon */}
                  <div className="flex items-center gap-1.5 mb-4 text-[10px] text-coffee-accent font-bold tracking-wider uppercase">
                    <GlassWater className="w-3.5 h-3.5 text-coffee-caramel" />
                    <span>{item.volume}</span>
                    {item.milkRatio && (
                      <>
                        <span className="text-coffee-milk">•</span>
                        <span className="text-coffee-dark/60 lowercase">{item.milkRatio.split(',')[0]}</span>
                      </>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-coffee-dark/70 font-sans leading-relaxed mb-6">
                    {item.description}
                  </p>
                </div>

                {/* Bottom Stats & Interaction */}
                <div className="border-t border-coffee-milk/25 pt-4 flex items-center justify-between">
                  {/* Strength bean bar */}
                  <div className="flex flex-col gap-1">
                    {item.strength > 0 ? (
                      <>
                        <span className="text-[9px] text-coffee-dark/40 font-bold uppercase tracking-wider">Міцність</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <span 
                              key={level}
                              className={`w-2.5 h-2.5 rounded-full transition-all duration-300
                                ${level <= item.strength 
                                  ? 'bg-coffee-accent scale-100' 
                                  : 'bg-coffee-milk/30 scale-90'}`}
                              style={{ borderRadius: '9999px' }}
                            />
                          ))}
                        </div>
                      </>
                    ) : (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-700 font-bold px-2 py-0.5 rounded-full">без кофеїну</span>
                    )}
                  </div>

                  {/* Micro-interactive view detail & basket triggers */}
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItem(item);
                      }}
                      className="w-10 h-10 rounded-full bg-coffee-latte flex items-center justify-center border border-coffee-milk/40 hover:bg-coffee-dark hover:text-coffee-cream transition-all duration-300 shadow-sm cursor-pointer"
                      style={{ borderRadius: '9999px' }}
                      title="Детальніше"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(item);
                      }}
                      className="w-10 h-10 rounded-full bg-coffee-accent text-coffee-cream flex items-center justify-center border border-coffee-caramel/20 hover:bg-coffee-dark transition-all duration-300 shadow-sm cursor-pointer"
                      style={{ borderRadius: '9999px' }}
                      title="Додати у замовлення"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Detailed Modal/Drawer (Skeuomorphic inspect view) */}
        <AnimatePresence>
          {selectedItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Blur backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedItem(null)}
                className="absolute inset-0 bg-coffee-deep/60 backdrop-blur-sm"
              />

              {/* Modal Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 180 }}
                className="relative w-full max-w-lg bg-[#FDFBF7]/65 backdrop-blur-xl border border-white/55 p-8 rounded-3xl shadow-2xl z-10 overflow-hidden"
                style={{ borderRadius: '28px' }}
              >
                {/* Close button */}
                <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/45 backdrop-blur-md hover:bg-white/70 flex items-center justify-center transition-all border border-white/50 cursor-pointer"
                  style={{ borderRadius: '9999px' }}
                >
                  ✕
                </button>

                {/* Color-glowing splash behind */}
                <div 
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-16 blur-2xl opacity-20"
                  style={{ backgroundColor: selectedItem.color }}
                />

                <div className="flex flex-col gap-6 mt-2">
                  <div>
                    <span className="text-[10px] font-sans font-bold text-coffee-accent tracking-widest uppercase block mb-1">
                      {selectedItem.category === 'classic' ? 'Класичний напій' : selectedItem.category === 'signature' ? 'Авторський рецепт' : selectedItem.category === 'brewed' ? 'Альтернативне заварювання' : 'Свіжий десерт'}
                    </span>
                    <h3 className="font-serif text-3xl font-extrabold text-coffee-dark tracking-tight">
                      {selectedItem.name}
                    </h3>
                  </div>

                  <p className="text-sm text-coffee-dark/80 leading-relaxed font-sans">
                    {selectedItem.description}
                  </p>

                  {/* Interactive Composition Diagram */}
                  {selectedItem.milkRatio && (
                    <div className="p-4 rounded-2xl bg-white/35 backdrop-blur-md border border-white/40" style={{ borderRadius: '18px' }}>
                      <span className="text-[10px] font-bold text-coffee-accent uppercase tracking-wider block mb-2">Пропорція інгредієнтів</span>
                      <div className="flex h-4 rounded-full overflow-hidden w-full bg-coffee-milk/20">
                        {selectedItem.name === 'Капучино' ? (
                          <>
                            <div className="bg-[#E6D5C3] h-full" style={{ width: '60%' }} title="Молоко" />
                            <div className="bg-[#F5EFEB] h-full" style={{ width: '20%' }} title="Пінка" />
                            <div className="bg-[#3D2314] h-full" style={{ width: '20%' }} title="Еспресо" />
                          </>
                        ) : selectedItem.name === 'Лате' ? (
                          <>
                            <div className="bg-[#E6D5C3] h-full" style={{ width: '80%' }} title="Молоко" />
                            <div className="bg-[#F5EFEB] h-full" style={{ width: '10%' }} title="Пінка" />
                            <div className="bg-[#3D2314] h-full" style={{ width: '10%' }} title="Еспресо" />
                          </>
                        ) : (
                          <>
                            <div className="bg-[#E6D5C3] h-full" style={{ width: '50%' }} title="Молоко" />
                            <div className="bg-[#3D2314] h-full" style={{ width: '50%' }} title="Еспресо" />
                          </>
                        )}
                      </div>
                      <div className="flex gap-4 mt-2.5 text-[10px] font-sans text-coffee-dark/60 font-semibold">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#3D2314]" />Еспресо</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#E6D5C3]" />Молоко</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#F5EFEB]" />Пінка</span>
                      </div>
                    </div>
                  )}

                  {/* Customization Options inside Modal */}
                  {selectedItem.category !== 'desserts' && (
                    <div className="grid grid-cols-2 gap-4 border-t border-coffee-milk/15 pt-4">
                      <div className="text-left">
                        <label className="text-[9px] text-coffee-dark/50 font-bold uppercase tracking-wider block mb-1">Тип молока</label>
                        <select 
                          value={selectedMilk}
                          onChange={(e) => setSelectedMilk(e.target.value)}
                          className="w-full bg-white border border-coffee-milk/25 px-2 py-1.5 text-xs font-semibold text-coffee-dark rounded-xl focus:outline-none focus:ring-1 focus:ring-coffee-accent cursor-pointer"
                          style={{ borderRadius: '10px' }}
                        >
                          {milkList ? (
                            milkList.map((m) => (
                              <option key={m.id} value={m.price > 0 ? `${m.label} (+${m.price} ₴)` : m.label}>
                                {m.label} {m.price > 0 ? `(+${m.price} ₴)` : ''}
                              </option>
                            ))
                          ) : (
                            <>
                              <option value="Класичне коров’яче">Класичне коров’яче</option>
                              <option value="Безлактозне (+10 ₴)">Безлактозне (+10 ₴)</option>
                              <option value="Кокосове (+15 ₴)">Кокосове (+15 ₴)</option>
                              <option value="Вівсяне (+15 ₴)">Вівсяне (+15 ₴)</option>
                            </>
                          )}
                        </select>
                      </div>
                      <div className="text-left">
                        <label className="text-[9px] text-coffee-dark/50 font-bold uppercase tracking-wider block mb-1">Авторський сироп</label>
                        <select 
                          value={selectedSyrup}
                          onChange={(e) => setSelectedSyrup(e.target.value)}
                          className="w-full bg-white border border-coffee-milk/25 px-2 py-1.5 text-xs font-semibold text-coffee-dark rounded-xl focus:outline-none focus:ring-1 focus:ring-coffee-accent cursor-pointer"
                          style={{ borderRadius: '10px' }}
                        >
                          {syrupList ? (
                            <>
                              <option value="Без сиропу">Без сиропу</option>
                              {syrupList.map((sy) => (
                                <option key={sy.id} value={`${sy.label} (+${sy.price} ₴)`}>
                                  {sy.label} (+{sy.price} ₴)
                                </option>
                              ))}
                            </>
                          ) : (
                            <>
                              <option value="Без сиропу">Без сиропу</option>
                              <option value="Солона карамель (+10 ₴)">Солона карамель (+10 ₴)</option>
                              <option value="Макадамія (+10 ₴)">Макадамія (+10 ₴)</option>
                              <option value="Ваніль (+10 ₴)">Ваніль (+10 ₴)</option>
                            </>
                          )}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Bottom features list */}
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.tags.map((tag, idx) => (
                      <span key={idx} className="bg-coffee-milk/30 border border-coffee-milk/30 text-coffee-dark text-xs font-semibold px-3 py-1 rounded-full" style={{ borderRadius: '9999px' }}>
                        #{tag}
                      </span>
                    ))}
                    <span className="bg-coffee-latte text-coffee-accent text-xs font-bold px-3 py-1 rounded-full border border-coffee-milk/20 ml-auto" style={{ borderRadius: '9999px' }}>
                      Об'єм: {selectedItem.volume}
                    </span>
                  </div>

                  <div className="border-t border-coffee-milk/25 pt-6 mt-2 flex items-center justify-between">
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] text-coffee-dark/40 font-bold uppercase tracking-wider">Ціна</span>
                      <span className="font-serif text-3xl font-extrabold text-coffee-accent">{selectedItem.price} ₴</span>
                    </div>

                    <button
                      onClick={() => {
                        addToCart(selectedItem, selectedMilk, selectedSyrup);
                        setSelectedItem(null);
                        setSelectedMilk('Класичне коров’яче');
                        setSelectedSyrup('Без сиропу');
                      }}
                      className="tactile-btn-accent text-sm font-bold text-coffee-cream px-6 py-3.5 rounded-full flex items-center gap-2 cursor-pointer"
                      style={{ borderRadius: '9999px' }}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Додати у замовлення</span>
                    </button>
                  </div>

                </div>

              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Floating Toast Notification */}
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              className="fixed bottom-6 right-6 z-[10000] bg-coffee-dark/95 backdrop-blur-md border border-coffee-caramel/30 px-6 py-4 rounded-2xl shadow-xl flex items-center justify-between gap-6 max-w-sm"
              style={{ borderRadius: '16px' }}
            >
              <div className="flex items-center gap-2.5 text-left">
                <ShoppingCart className="w-5 h-5 text-coffee-caramel shrink-0" />
                <span className="text-xs font-bold text-coffee-cream leading-normal">{toastMsg}</span>
              </div>
              <button
                onClick={() => {
                  setShowToast(false);
                  if (onGoToCart) onGoToCart();
                }}
                className="text-[11px] font-black text-coffee-caramel hover:text-coffee-accent transition-colors shrink-0 uppercase tracking-wider underline cursor-pointer"
              >
                Кошик 🛒
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pre-order Basket / Cart Calculator */}
        <AnimatePresence>
          {((onAddToCart ? globalCart : cart)?.length > 0) && (
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
                    Всього товарів: <span className="font-bold text-coffee-accent">{(onAddToCart ? globalCart : cart).reduce((sum: number, i: any) => sum + i.quantity, 0)}</span> | Сума: <span className="font-bold text-coffee-accent">{(onAddToCart ? globalCart : cart).reduce((sum: number, i: any) => sum + i.price * i.quantity, 0)} ₴</span>
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
