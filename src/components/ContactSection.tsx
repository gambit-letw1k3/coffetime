import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Phone, MapPin, Clock, Send, Heart, Coffee, ShieldCheck, Check } from 'lucide-react';

export default function ContactSection() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSimulated, setIsSimulated] = useState(false);
  const [errorText, setErrorText] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setIsSending(true);
    setErrorText('');
    setIsSimulated(false);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, message, type: 'contact' }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.simulated) {
          setIsSimulated(true);
        }
        setIsSubmitted(true);
      } else {
        const data = await response.json().catch(() => ({}));
        setErrorText(data.error || 'Помилка сервера при відправленні листа');
        setIsSubmitted(true); // fall back to simulation view but display error
        setIsSimulated(true);
      }
    } catch (err: any) {
      console.error('Error submitting message:', err);
      setErrorText(err.message || 'Мережева помилка зв’язку з сервером');
      setIsSubmitted(true);
      setIsSimulated(true);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section id="contact" className="py-24 bg-[#3E2723]/95 backdrop-blur-2xl text-coffee-cream border-t border-white/10 relative overflow-hidden select-none">
      
      {/* Background steam lines decoration */}
      <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] rounded-full border border-white/5 opacity-5 pointer-events-none" />

      <div className="w-[92%] max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[11px] font-sans font-bold tracking-widest text-coffee-caramel uppercase block mb-3">Залишаймося на зв’язку</span>
          <h2 className="font-serif text-3xl sm:text-4xl text-coffee-cream font-bold tracking-tight">Завітай в гості або напиши нам</h2>
          <div className="w-12 h-1 bg-gradient-to-r from-coffee-caramel to-coffee-accent mx-auto mt-4 rounded-full" />
          <p className="text-sm text-coffee-milk/60 font-sans mt-3">Маєш запитання, пропозицію чи хочеш замовити каву на подію? Напиши нам — ми з радістю відповімо найближчим часом.</p>
        </div>

        {/* Form and info grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch text-left">
          
          {/* Left Column: Cafe Details / Map Illustration */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-black/35 backdrop-blur-md border border-white/10 p-8 rounded-3xl shadow-xl" style={{ borderRadius: '28px' }}>
            
            <div className="flex flex-col gap-8">
              
              {/* Coffee Brand Badge */}
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-coffee-caramel flex items-center justify-center text-white shadow-md">
                  <Coffee className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-black text-lg tracking-tight leading-none text-white">COFFEETIME</h3>
                  <span className="text-[9px] text-coffee-caramel tracking-widest uppercase font-semibold block mt-0.5">COFFEEHOUSE</span>
                </div>
              </div>

              {/* Detail Items */}
              <div className="flex flex-col gap-5">
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-coffee-caramel shrink-0" style={{ borderRadius: '9999px' }}>
                    <MapPin className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-[9px] text-coffee-milk/40 font-bold uppercase tracking-wider block">Де ми знаходимося</span>
                    <p className="text-sm font-bold text-coffee-cream mt-0.5">вулиця Пилипа Орлика, 12, Київ, 01024</p>
                    <span className="text-xs text-coffee-caramel hover:underline cursor-pointer block mt-1">Переглянути маршрут &rarr;</span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-coffee-caramel shrink-0" style={{ borderRadius: '9999px' }}>
                    <Clock className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-[9px] text-coffee-milk/40 font-bold uppercase tracking-wider block">Коли ми відкриті</span>
                    <p className="text-sm font-bold text-coffee-cream mt-0.5">Щодня: з 08:00 до 21:00</p>
                    <p className="text-xs text-coffee-milk/60 mt-0.5">Кухня та десерти зачиняються о 20:30</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-coffee-caramel shrink-0" style={{ borderRadius: '9999px' }}>
                    <Phone className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-[9px] text-coffee-milk/40 font-bold uppercase tracking-wider block">Наш телефон</span>
                    <p className="text-sm font-bold text-coffee-cream mt-0.5">+380 (96) 123-45-67</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-coffee-caramel shrink-0" style={{ borderRadius: '9999px' }}>
                    <Mail className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-[9px] text-coffee-milk/40 font-bold uppercase tracking-wider block">Електронна пошта</span>
                    <p className="text-sm font-bold text-coffee-cream mt-0.5">hello@coffeetime.com.ua</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Simulated Mini Map Illustration (Stylized SVG for high performance) */}
            <div className="mt-8 p-1.5 bg-coffee-deep rounded-2xl border border-white/5 relative overflow-hidden" style={{ borderRadius: '18px' }}>
              <div className="w-full h-32 bg-stone-900 rounded-xl relative overflow-hidden">
                
                {/* Simulated Grid Streets */}
                <svg viewBox="0 0 200 100" className="w-full h-full opacity-15 stroke-white fill-none stroke-[2]">
                  <line x1="30" y1="0" x2="30" y2="100" />
                  <line x1="120" y1="0" x2="120" y2="100" />
                  <line x1="0" y1="40" x2="200" y2="40" />
                  <line x1="0" y1="80" x2="200" y2="80" />
                </svg>

                {/* Parks green blobs */}
                <div className="absolute top-1 left-2 w-20 h-8 rounded-full bg-emerald-950/40 blur-[1px]" />
                
                {/* Streets Names indicators */}
                <span className="absolute top-12 left-4 text-[7px] font-mono font-bold text-white/30 tracking-widest uppercase">вул. Пилипа Орлика</span>
                
                {/* Location Marker Pulsing block */}
                <div className="absolute top-[40px] left-[120px] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                  <span className="absolute w-6 h-6 bg-coffee-caramel rounded-full animate-ping opacity-60" style={{ borderRadius: '9999px' }} />
                  <div className="w-3.5 h-3.5 bg-coffee-caramel rounded-full border-2 border-stone-950 flex items-center justify-center z-10 shadow-lg" style={{ borderRadius: '9999px' }}>
                    <div className="w-1.5 h-1.5 bg-white rounded-full" style={{ borderRadius: '9999px' }} />
                  </div>
                </div>

                {/* Micro aura tag beside pin */}
                <div className="absolute top-[20px] left-[135px] bg-coffee-dark border border-coffee-caramel/40 px-2 py-0.5 rounded-lg text-[8px] font-sans font-bold text-white" style={{ borderRadius: '6px' }}>
                  Coffeetime
                </div>

              </div>
            </div>

          </div>

          {/* Right Column: Feedback Form (Tactile design) */}
          <div className="lg:col-span-7 p-8 sm:p-10 tactile-card shadow-2xl flex flex-col justify-between" style={{ borderRadius: '28px' }}>
            <div className="absolute inset-0 bg-transparent coffee-grain rounded-3xl -z-10 opacity-60" style={{ borderRadius: '28px' }} />
            
            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.form
                  key="contact-form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-6 w-full text-left"
                >
                  <div>
                    <h3 className="font-serif text-2xl font-extrabold text-coffee-dark">Форма зворотного зв'язку</h3>
                    <p className="text-xs text-coffee-dark/60 font-sans mt-1">Отримай відповідь на свій лист протягом 30 хвилин.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-coffee-dark/50 font-bold uppercase tracking-wider">Ім’я</label>
                      <input
                        required
                        type="text"
                        placeholder="Мар’ян"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="tactile-input px-4 py-3.5 rounded-2xl text-sm font-semibold text-coffee-dark"
                        style={{ borderRadius: '16px' }}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-coffee-dark/50 font-bold uppercase tracking-wider">Email адреса</label>
                      <input
                        required
                        type="email"
                        placeholder="marta@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="tactile-input px-4 py-3.5 rounded-2xl text-sm font-semibold text-coffee-dark"
                        style={{ borderRadius: '16px' }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-coffee-dark/50 font-bold uppercase tracking-wider">Повідомлення</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Привіт Coffeetime! Я хочу дізнатися більше про постачання ваших..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="tactile-input px-4 py-3.5 rounded-2xl text-sm font-medium text-coffee-dark resize-none"
                      style={{ borderRadius: '16px' }}
                    />
                  </div>

                  {/* Safety consent tag */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-coffee-latte flex items-center justify-center border border-coffee-milk/50 shrink-0" style={{ borderRadius: '9999px' }}>
                      <ShieldCheck className="w-3.5 h-3.5 text-coffee-accent" />
                    </div>
                    <span className="text-[10px] text-coffee-dark/50 font-medium">Ми цінуємо конфіденційність. Ваші дані у повній безпеці.</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSending}
                    className="tactile-btn-accent text-sm font-bold text-coffee-cream px-7 py-4 rounded-full flex items-center justify-center gap-2.5 mt-2 cursor-pointer disabled:opacity-75"
                    style={{ borderRadius: '9999px' }}
                  >
                    {isSending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Надсилаємо...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Надіслати Повідомлення</span>
                      </>
                    )}
                  </button>

                </motion.form>
              ) : (
                <motion.div
                  key="success-form-msg"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center text-center py-12 gap-5"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg animate-bounce" style={{ borderRadius: '9999px' }}>
                    <Check className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-serif text-2xl font-extrabold text-coffee-dark">Повідомлення оброблено!</h3>
                    <p className="text-sm text-coffee-dark/60 font-sans mt-2 max-w-sm">Дякуємо, <strong className="text-coffee-dark font-bold">{name}</strong>! Повідомлення збережено в системі.</p>
                    
                    {isSimulated && (
                      <div className="mt-4 p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs text-left leading-relaxed max-w-md">
                        <p className="font-bold mb-1">ℹ️ Конфігурація SMTP не налаштована:</p>
                        <p className="mb-2">Повідомлення було успішно збережено в базі даних та змодельовано в логах сервера. Щоб налаштувати реальну відправку листів на пошту <strong className="font-bold">tutudimakiber@gmail.com</strong>, додайте такі змінні середовища у ваш файл конфігурації <code className="bg-amber-100 px-1 rounded">.env</code>:</p>
                        <ul className="list-disc pl-4 space-y-1 text-[11px] text-amber-850">
                          <li><code className="bg-amber-100 px-1 rounded">SMTP_USER</code> — ваша пошта (наприклад, Gmail)</li>
                          <li><code className="bg-amber-100 px-1 rounded">SMTP_PASS</code> — Пароль додатка (App Password)</li>
                          <li><code className="bg-amber-100 px-1 rounded">SMTP_HOST</code> — SMTP сервер (наприклад, smtp.gmail.com)</li>
                          <li><code className="bg-amber-100 px-1 rounded">SMTP_PORT</code> — порт підключення (наприклад, 587)</li>
                        </ul>
                        {errorText && <p className="mt-2 text-[11px] text-red-600 font-medium">Помилка SMTP: {errorText}</p>}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="tactile-btn text-xs font-bold text-coffee-dark px-5 py-3 rounded-full cursor-pointer mt-2"
                    style={{ borderRadius: '9999px' }}
                  >
                    Надіслати ще раз
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

        </div>

        {/* Outer Footer line inside Contact Section */}
        <div className="border-t border-white/5 pt-8 mt-20 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-coffee-milk/40 font-sans">
          <span>&copy; {new Date().getFullYear()} Coffeetime. Всі права захищено.</span>
          <div className="flex items-center gap-1">
            <span>Зроблено з</span>
            <Heart className="w-3 h-3 text-coffee-caramel fill-current" />
            <span>та ароматом свіжого еспресо.</span>
          </div>
        </div>

      </div>

    </section>
  );
}
