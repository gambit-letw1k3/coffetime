import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Camera, Coffee, Sparkles, BookOpen, Sun, Dog, MessageSquare, Send, User } from 'lucide-react';

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  tag: string;
  emoji: string;
  icon: any;
  color: string;
}

export default function GallerySection() {
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({});
  
  // Guestbook states
  const [messages, setMessages] = useState([
    { name: 'Марія', text: 'Найкраща вівсяна лате в місті! Затишок просто зачаровує 🌿', avatar: '🐱', date: 'Сьогодні' },
    { name: 'Олександр', text: 'Тут неймовірно зручно працювати за ноутбуком. Рекомендую фільтр-каву Colombia!', avatar: '☕', date: 'Вчора' },
    { name: 'Ірина', text: 'Приходжу сюди з песиком щонеділі. Зона для тварин — це любов 🐶🐾', avatar: '2 дні тому' }
  ]);
  const [newName, setNewName] = useState('');
  const [newText, setNewText] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('☕');

  const items: GalleryItem[] = [
    {
      id: 'g1',
      title: 'Куточок натхнення',
      description: 'М’які крісла, обійми теплого світла торшерів та наша величезна бібліотека книг про каву, подорожі та мистецтво.',
      tag: 'Затишок',
      emoji: '📚',
      icon: BookOpen,
      color: 'from-amber-100 to-amber-200/50'
    },
    {
      id: 'g2',
      title: 'Кавова лабораторія',
      description: 'Серце Coffeetime. Тут відбуваються експерименти з обсмаженням, каппінги та зароджуються нові авторські смаки.',
      tag: 'Майстерність',
      emoji: '🧪',
      icon: Coffee,
      color: 'from-orange-100 to-orange-200/50'
    },
    {
      id: 'g3',
      title: 'Літня кавова тераса',
      description: 'Простір, наповнений сонячними променями та свіжим повітрям. Ідеально для холодного Колд Брю влітку.',
      tag: 'Тераса',
      emoji: '☀️',
      icon: Sun,
      color: 'from-yellow-50 to-yellow-100/50'
    },
    {
      id: 'g4',
      title: 'Pet Friendly Зона',
      description: 'Ми обожнюємо твоїх чотирилапих друзів! Завжди свіжа вода та безкоштовні песикові ласощі у формі кісточок.',
      tag: 'Дружелюбність',
      emoji: '🐶',
      icon: Dog,
      color: 'from-stone-100 to-stone-200/50'
    }
  ];

  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newText.trim()) return;

    const newMsg = {
      name: newName,
      text: newText,
      avatar: selectedAvatar,
      date: 'Щойно'
    };

    setMessages(prev => [newMsg, ...prev]);
    setNewName('');
    setNewText('');
  };

  return (
    <section id="gallery" className="py-24 bg-transparent coffee-grain relative overflow-hidden select-none">
      
      <div className="w-[92%] max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="text-left">
            <span className="text-[11px] font-sans font-extrabold tracking-widest text-coffee-accent uppercase block mb-3">Естетика кав'ярні</span>
            <h2 className="font-serif text-3xl sm:text-4xl text-coffee-dark font-bold tracking-tight">Атмосфера затишку Coffeetime</h2>
            <p className="text-sm text-coffee-dark/60 font-sans mt-2 max-w-lg">Ми створили простір, де кожна деталь інтер’єру, відтінок дерева та звук вінілу підібрані для твого гармонійного відпочинку.</p>
          </div>

          <div className="flex items-center gap-2 bg-white/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/50 self-start md:self-auto shadow-sm" style={{ borderRadius: '16px' }}>
            <Camera className="w-4.5 h-4.5 text-coffee-accent animate-pulse" />
            <span className="text-xs text-coffee-dark font-bold">@coffeetime_ua</span>
          </div>
        </div>

        {/* Bento Grid layout of high-fidelity stylized graphics representing cafe areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 items-stretch">
          
          {items.map((item, idx) => {
            const Icon = item.icon;
            const isLiked = likedItems[item.id];
            
            // Layout classes for bento look
            const colSpan = idx === 0 || idx === 3 ? 'lg:col-span-7' : 'lg:col-span-5';

            return (
              <motion.div
                key={item.id}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3 }}
                className={`${colSpan} tactile-card rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden border border-coffee-milk/35 group`}
                style={{ borderRadius: '28px' }}
              >
                {/* Background decorative gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-40 -z-10 group-hover:opacity-60 transition-opacity duration-500`} />
                
                {/* Top header on card */}
                <div className="flex items-center justify-between gap-4 mb-8">
                  <span className="bg-coffee-cream border border-coffee-milk/40 px-3 py-1 rounded-full text-[10px] font-sans font-bold text-coffee-accent tracking-wider uppercase" style={{ borderRadius: '9999px' }}>
                    {item.tag}
                  </span>
                  
                  {/* Like Button */}
                  <button
                    onClick={(e) => handleLike(item.id, e)}
                    className={`w-9 h-9 rounded-full bg-coffee-cream flex items-center justify-center border border-coffee-milk/30 shadow-sm transition-all cursor-pointer
                      ${isLiked ? 'scale-110 border-red-200 bg-red-50 text-red-500' : 'text-coffee-dark/50 hover:text-red-500'}`}
                    style={{ borderRadius: '9999px' }}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Central Illustration Area (Skeuomorphic Vector Art block) */}
                <div className="my-4 p-8 rounded-2xl bg-white/40 border border-white/60 flex items-center justify-center min-h-[140px] relative shadow-inner" style={{ borderRadius: '20px' }}>
                  
                  {/* Floating particles */}
                  <motion.div 
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="absolute top-4 left-6 text-2xl select-none"
                  >
                    ✨
                  </motion.div>
                  <motion.div 
                    animate={{ y: [0, 6, 0] }}
                    transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                    className="absolute bottom-4 right-6 text-2xl select-none"
                  >
                    ☕
                  </motion.div>

                  {/* Aesthetic Vector Drawing */}
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-coffee-dark flex items-center justify-center text-coffee-cream shadow-md shadow-coffee-deep/15 relative" style={{ borderRadius: '16px' }}>
                      <Icon className="w-8 h-8" />
                      {/* Badge count */}
                      <span className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-coffee-caramel flex items-center justify-center text-xs font-bold border-2 border-white text-white" style={{ borderRadius: '9999px' }}>
                        {item.emoji}
                      </span>
                    </div>
                  </div>

                </div>

                {/* Content Block */}
                <div className="mt-6 text-left">
                  <h3 className="font-serif text-xl font-bold text-coffee-dark tracking-tight mb-2 flex items-center gap-2">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-coffee-dark/70 font-sans leading-relaxed">
                    {item.description}
                  </p>
                </div>

              </motion.div>
            );
          })}

        </div>

        {/* Live Guestbook Section */}
        <div className="mt-16 bg-white/40 backdrop-blur-md border border-white/50 rounded-3xl p-8 shadow-xl shadow-coffee-deep/5 max-w-4xl mx-auto" style={{ borderRadius: '28px' }}>
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-coffee-accent" />
            <h3 className="font-serif text-xl sm:text-2xl text-coffee-dark font-bold">Віртуальна Книга Відгуків та Гостей</h3>
          </div>
          
          <p className="text-xs sm:text-sm text-coffee-dark/70 mb-8 font-sans text-left">
            Поділіться своїм настроєм або залиште побажання нашій команді бариста! Текст миттєво з’явиться на дошці відгуків Coffeetime.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Guestbook submission form */}
            <form onSubmit={handleAddMessage} className="md:col-span-5 flex flex-col gap-4 text-left">
              <span className="text-[10px] font-sans font-bold text-coffee-accent tracking-widest uppercase">Залишити слід в історії</span>
              
              {/* Name Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-coffee-dark/50 uppercase tracking-wider">Ваше Ім'я</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee-dark/40" />
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Введіть ваше ім'я..."
                    className="w-full pl-9 pr-4 py-2.5 bg-white/70 border border-coffee-milk/30 rounded-xl text-xs text-coffee-dark font-semibold focus:outline-none focus:border-coffee-accent placeholder:text-coffee-dark/30"
                    style={{ borderRadius: '12px' }}
                  />
                </div>
              </div>

              {/* Avatar Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-coffee-dark/50 uppercase tracking-wider">Оберіть Аватарку</label>
                <div className="flex gap-2">
                  {['☕', '🐱', '🍪', '🥐', '🥑', '✨'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setSelectedAvatar(emoji)}
                      className={`w-9 h-9 rounded-full bg-white border flex items-center justify-center text-lg cursor-pointer transition-all hover:scale-105
                        ${selectedAvatar === emoji ? 'border-coffee-accent bg-coffee-cream shadow-sm scale-110' : 'border-coffee-milk/20'}`}
                      style={{ borderRadius: '9999px' }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message text */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-coffee-dark/50 uppercase tracking-wider">Ваші враження</label>
                <textarea
                  required
                  rows={3}
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="Напишіть нам щось тепле..."
                  className="w-full p-3 bg-white/70 border border-coffee-milk/30 rounded-xl text-xs text-coffee-dark font-medium focus:outline-none focus:border-coffee-accent placeholder:text-coffee-dark/30 resize-none"
                  style={{ borderRadius: '12px' }}
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="tactile-btn-accent text-xs font-bold text-coffee-cream py-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                style={{ borderRadius: '12px' }}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Надіслати на дошку</span>
              </button>
            </form>

            {/* Guestbook messages display feed */}
            <div className="md:col-span-7 flex flex-col gap-3 max-h-[360px] overflow-y-auto pr-2 text-left">
              <span className="text-[10px] font-sans font-bold text-coffee-accent tracking-widest uppercase mb-1">Свіжі відгуки гостей</span>
              
              <AnimatePresence initial={false}>
                {messages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                    className="bg-white/50 border border-coffee-milk/25 p-4 rounded-2xl flex gap-3 shadow-sm hover:bg-white/75 transition-colors"
                    style={{ borderRadius: '16px' }}
                  >
                    <div className="w-10 h-10 rounded-full bg-coffee-cream border border-coffee-milk/20 flex items-center justify-center text-xl shrink-0" style={{ borderRadius: '9999px' }}>
                      {msg.avatar}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-coffee-dark">{msg.name}</span>
                        <span className="text-[9px] font-sans font-bold text-coffee-dark/30">{msg.date}</span>
                      </div>
                      <p className="text-xs text-coffee-dark/80 font-sans mt-1 leading-normal">
                        {msg.text}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

          </div>
        </div>

      </div>

    </section>
  );
}
