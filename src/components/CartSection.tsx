import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CartItem } from '../types';
import { ShoppingCart, Trash2, Plus, Minus, CheckCircle, Clock, Phone, Heart, ArrowLeft, Gift } from 'lucide-react';

interface CartSectionProps {
  cart: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onBackToMenu: () => void;
}

export default function CartSection({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onBackToMenu
}: CartSectionProps) {
  const [tipPercent, setTipPercent] = useState(10);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [isSimulated, setIsSimulated] = useState(false);
  const [errorText, setErrorText] = useState('');

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tipAmount = Math.round((subtotal * tipPercent) / 100);
  const total = subtotal + tipAmount;

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;

    // Trigger phone call if supported, or simulate
    window.location.href = "tel:+380961234567";
    setIsSubmittingOrder(true);
    setIsSimulated(false);
    setErrorText('');

    try {
      const orderDetails = {
        customerName: customerName || "Гість",
        customerPhone: customerPhone || "Не вказано",
        items: cart.map(item => ({
          name: item.name,
          category: item.category || item.type,
          price: item.price,
          quantity: item.quantity,
          details: item.details
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
      console.error('Error sending order to backend:', err);
      setErrorText(err.message || 'Помилка підключення до сервера');
      setIsSimulated(true);
    } finally {
      setIsSubmittingOrder(false);
      setOrderSuccess(true);
      onClearCart();
    }
  };

  return (
    <section id="cart-section" className="py-12 bg-transparent relative min-h-[70vh]">
      <div className="w-[92%] max-w-4xl mx-auto relative z-10 text-left">
        
        {/* Back Button */}
        <button
          onClick={onBackToMenu}
          className="tactile-btn mb-8 px-4 py-2 bg-white/40 text-xs font-bold text-coffee-dark hover:bg-coffee-milk/30 flex items-center gap-1.5 cursor-pointer rounded-full"
          style={{ borderRadius: '9999px' }}
        >
          <ArrowLeft className="w-4 h-4 text-coffee-caramel" />
          <span>Повернутися до меню</span>
        </button>

        <AnimatePresence mode="wait">
          {orderSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="p-8 sm:p-12 rounded-3xl bg-white/50 backdrop-blur-md border border-white/60 shadow-xl text-center relative overflow-hidden"
              style={{ borderRadius: '28px' }}
            >
              <div className="absolute inset-0 bg-transparent coffee-grain -z-10 opacity-30" />
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center mb-6 border border-emerald-500/30 mx-auto">
                <CheckCircle className="w-8 h-8 animate-bounce" />
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-black text-coffee-dark mb-3">Замовлення прийнято! ☕</h3>
              <p className="text-sm sm:text-base text-coffee-dark/70 max-w-lg mb-8 leading-relaxed mx-auto">
                Бариста вже отримав ваше замовлення та розпочав приготування кави та підготовку товарів. Все буде свіжим та гарячим до вашого приходу!
              </p>

              <div className="bg-coffee-latte/40 border border-coffee-milk/25 rounded-2xl p-4 flex items-center gap-3 mb-8 max-w-md mx-auto text-left">
                <Clock className="w-6 h-6 text-coffee-accent shrink-0" />
                <div className="text-xs">
                  <p className="font-extrabold text-coffee-dark">Адреса кав'ярні та час приготування:</p>
                  <p className="text-coffee-dark/60 mt-0.5">вул. Пилипа Орлика, 12 | Очікування: ~ 7-10 хвилин</p>
                </div>
              </div>



              {isSimulated && (
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs text-left leading-relaxed max-w-md mx-auto">
                  <p className="font-bold mb-1 text-center sm:text-left">ℹ️ Конфігурація SMTP не налаштована:</p>
                  <p className="mb-2 text-[11px]">Замовлення змодельовано в логах сервера. Для реального надсилання листів на <strong className="font-bold">tutudimakiber@gmail.com</strong> налаштуйте змінні середовища у файлі <code className="bg-amber-100 px-1 rounded">.env</code>:</p>
                  <div className="text-[11px] font-mono bg-amber-100/60 p-2 rounded-lg mb-2">
                    • SMTP_USER = ваша пошта
                    <br />• SMTP_PASS = пароль додатку
                    <br />• SMTP_HOST = smtp.gmail.com
                    <br />• SMTP_PORT = 587
                  </div>
                  {errorText && <p className="text-[11px] text-red-600 font-bold mt-1">Помилка SMTP: {errorText}</p>}
                </div>
              )}

              <button
                onClick={() => {
                  setOrderSuccess(false);
                  onBackToMenu();
                }}
                className="tactile-btn-accent text-xs font-bold text-coffee-cream px-6 py-3.5 rounded-full cursor-pointer mt-6 inline-block"
                style={{ borderRadius: '9999px' }}
              >
                Повернутися до меню
              </button>
            </motion.div>
          ) : cart.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16 bg-white/40 backdrop-blur-md rounded-3xl border border-white/50 p-8"
              style={{ borderRadius: '28px' }}
            >
              <div className="w-16 h-16 rounded-full bg-coffee-latte text-coffee-accent flex items-center justify-center mb-6 mx-auto">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-coffee-dark mb-1">Ваш кошик порожній</h3>
              <p className="text-sm text-coffee-dark/60 max-w-sm mx-auto mb-8">
                Додайте напої з меню, створіть власний рецепт у конструкторі або виберіть крафтові зерна додому!
              </p>
              <button
                onClick={onBackToMenu}
                className="tactile-btn-accent text-xs font-bold text-coffee-cream px-6 py-3.5 rounded-full cursor-pointer inline-block"
                style={{ borderRadius: '9999px' }}
              >
                Перейти до Меню
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              {/* Left Column: Cart Items list */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-serif text-xl font-bold text-coffee-dark flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-coffee-accent" />
                    <span>Товари у вашому кошику</span>
                  </h3>
                  <button
                    onClick={onClearCart}
                    className="text-xs font-bold text-red-600/70 hover:text-red-600 flex items-center gap-1 cursor-pointer hover:underline"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Очистити кошик</span>
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white/50 backdrop-blur-md border border-coffee-milk/15 shadow-sm"
                      style={{ borderRadius: '18px' }}
                    >
                      <div className="text-left max-w-[65%] sm:max-w-[70%]">
                        <span className="text-[9px] font-bold text-coffee-accent uppercase tracking-wider bg-coffee-latte px-2 py-0.5 rounded-full border border-coffee-milk/10 inline-block mb-1">
                          {item.type === 'menu' ? 'Напій / Десерт' : item.type === 'custom' ? 'Власний рецепт' : 'Кавові зерна'}
                        </span>
                        <h4 className="font-serif text-sm sm:text-base font-black text-coffee-dark">{item.name}</h4>
                        <p className="text-[10px] sm:text-xs text-coffee-dark/60 mt-1 leading-relaxed font-medium">
                          {item.details}
                        </p>
                        <p className="text-xs text-coffee-accent font-black mt-1.5">{item.price} ₴ / шт.</p>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <div className="flex items-center bg-white border border-coffee-milk/25 rounded-xl">
                          <button
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-coffee-milk/10 transition-all rounded-l-xl cursor-pointer"
                          >
                            <Minus className="w-3 h-3 text-coffee-dark" />
                          </button>
                          <span className="text-xs font-bold text-coffee-dark px-2">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-coffee-milk/10 transition-all rounded-r-xl cursor-pointer"
                          >
                            <Plus className="w-3 h-3 text-coffee-dark" />
                          </button>
                        </div>

                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center cursor-pointer"
                          style={{ borderRadius: '12px' }}
                          title="Видалити з кошика"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Aesthetic banner promo */}
                <div className="bg-coffee-latte/30 border border-coffee-milk/15 rounded-2xl p-4 flex gap-3.5 items-center mt-2" style={{ borderRadius: '18px' }}>
                  <div className="w-10 h-10 rounded-full bg-coffee-dark flex items-center justify-center text-coffee-cream shrink-0">
                    <Gift className="w-5 h-5 text-coffee-caramel animate-bounce" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-coffee-dark">Подарунок за перше передзамовлення!</h5>
                    <p className="text-[10px] text-coffee-dark/60 mt-0.5 leading-snug">
                      Бариста безкоштовно пригостить вас фірмовою вівсяною печиво-сендвічем при отриманні цього замовлення.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Calculations & Checkout details */}
              <div className="lg:col-span-5 flex flex-col gap-5">
                <h3 className="font-serif text-xl font-bold text-coffee-dark mb-1">
                  Оформлення передзамовлення
                </h3>

                <div className="p-5 sm:p-6 rounded-3xl bg-white/50 backdrop-blur-md border border-coffee-milk/20 shadow-lg text-left" style={{ borderRadius: '24px' }}>
                  <span className="text-[9px] font-black text-coffee-accent uppercase tracking-wider block mb-4">Розрахунок вартості</span>

                  <div className="flex flex-col gap-2.5 mb-4 pb-4 border-b border-coffee-milk/15">
                    <div className="flex justify-between text-xs text-coffee-dark">
                      <span>Сума товарів:</span>
                      <span className="font-extrabold">{subtotal} ₴</span>
                    </div>

                    {/* Tips */}
                    <div className="flex flex-col gap-1.5 pt-1">
                      <div className="flex justify-between text-xs text-coffee-dark">
                        <span className="flex items-center gap-1">☕ Чайові баристі ({tipPercent}%):</span>
                        <span className="font-extrabold">{tipAmount} ₴</span>
                      </div>
                      <div className="flex gap-1.5 mt-1">
                        {[0, 10, 15, 20].map((percent) => (
                          <button
                            key={percent}
                            onClick={() => setTipPercent(percent)}
                            className={`px-3 py-1 text-[10px] font-bold rounded-lg cursor-pointer transition-all ${
                              tipPercent === percent
                                ? 'bg-coffee-dark text-coffee-cream'
                                : 'bg-white text-coffee-dark border border-coffee-milk/15 hover:bg-coffee-milk/10'
                            }`}
                            style={{ borderRadius: '6px' }}
                          >
                            {percent}%
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Customer Information Form */}
                  <div className="flex flex-col gap-3 mb-6">
                    <span className="text-[9px] font-bold text-coffee-accent uppercase tracking-wider block">Контакти для бариста</span>
                    
                    <div>
                      <label className="text-[9px] text-coffee-dark/60 font-bold uppercase tracking-wider block mb-1">Ваше ім'я</label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Напр. Олексій"
                        className="w-full bg-white border border-coffee-milk/25 px-3 py-2 text-xs font-semibold text-coffee-dark rounded-xl focus:outline-none focus:ring-1 focus:ring-coffee-accent"
                        style={{ borderRadius: '10px' }}
                      />
                    </div>

                    <div>
                      <label className="text-[9px] text-coffee-dark/60 font-bold uppercase tracking-wider block mb-1">Телефон для зв'язку</label>
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="+380..."
                        className="w-full bg-white border border-coffee-milk/25 px-3 py-2 text-xs font-semibold text-coffee-dark rounded-xl focus:outline-none focus:ring-1 focus:ring-coffee-accent"
                        style={{ borderRadius: '10px' }}
                      />
                    </div>
                  </div>

                  {/* Grand Total */}
                  <div className="flex justify-between text-base text-coffee-dark font-black mb-6 border-t border-coffee-milk/15 pt-4">
                    <span>Загалом до сплати:</span>
                    <span className="text-coffee-accent font-serif text-xl sm:text-2xl">{total} ₴</span>
                  </div>

                  <button
                    onClick={handlePlaceOrder}
                    disabled={isSubmittingOrder || !customerName || !customerPhone}
                    className="w-full bg-coffee-dark hover:bg-coffee-accent text-coffee-cream font-bold py-3.5 px-6 rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                    style={{ borderRadius: '9999px' }}
                  >
                    {isSubmittingOrder ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Набираємо номер...</span>
                      </>
                    ) : (
                      <>
                        <Phone className="w-4 h-4 text-coffee-caramel animate-pulse" />
                        <span>Замовити за телефоном</span>
                      </>
                    )}
                  </button>

                  <p className="text-[9px] text-coffee-dark/40 text-center mt-3.5 font-sans leading-snug">
                    Сплата здійснюється готівкою або карткою на касі при отриманні замовлення.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
