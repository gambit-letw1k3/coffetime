import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Testimonial } from '../types';
import { MessageSquareHeart, Star, PenTool, Check, Trash2 } from 'lucide-react';

interface TestimonialsSectionProps {
  reviewsList: Testimonial[];
  onReviewSubmitted: (updatedReviews: Testimonial[]) => void;
}

export default function TestimonialsSection({ reviewsList, onReviewSubmitted }: TestimonialsSectionProps) {
  // Retrieve or generate unique device ID
  const [deviceId] = useState(() => {
    let id = localStorage.getItem('coffeetime_device_id');
    if (!id) {
      id = `dev_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      localStorage.setItem('coffeetime_device_id', id);
    }
    return id;
  });

  // Check if this device has already left a review
  const myExistingReview = reviewsList.find(r => r.deviceId === deviceId);

  // Review submission state
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [showSubmitSuccess, setShowSubmitSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleOpenForm = () => {
    if (myExistingReview) {
      setNewReviewName(myExistingReview.name);
      setNewReviewText(myExistingReview.text);
      setNewReviewRating(myExistingReview.rating);
    } else {
      setNewReviewName('');
      setNewReviewText('');
      setNewReviewRating(5);
    }
    setIsFormOpen(true);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewText || !newReviewName) return;

    fetch('/api/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        deviceId,
        name: newReviewName,
        text: newReviewText,
        rating: newReviewRating
      })
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.reviews) {
          onReviewSubmitted(res.reviews);
          setSuccessMessage(
            myExistingReview
              ? 'Дякуємо! Ваш відгук успішно оновлено.'
              : 'Дякуємо! Ваш відгук успішно додано до гостьової книги.'
          );
          setShowSubmitSuccess(true);
          setIsFormOpen(false);
          setTimeout(() => {
            setShowSubmitSuccess(false);
          }, 4000);
        }
      })
      .catch((err) => console.error('Error submitting review:', err));
  };

  const handleDeleteReview = () => {
    fetch('/api/reviews', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ deviceId })
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.reviews) {
          onReviewSubmitted(res.reviews);
          setSuccessMessage('Ваш відгук успішно видалено.');
          setShowSubmitSuccess(true);
          setIsFormOpen(false);
          setNewReviewText('');
          setNewReviewName('');
          setTimeout(() => {
            setShowSubmitSuccess(false);
          }, 4000);
        }
      })
      .catch((err) => console.error('Error deleting review:', err));
  };

  return (
    <section id="testimonials" className="py-24 bg-transparent coffee-grain relative overflow-hidden select-none">
      
      {/* Absolute background stamp illustration */}
      <div className="absolute top-[10%] left-[-10%] w-[450px] h-[450px] rounded-full border border-dashed border-coffee-milk/20 pointer-events-none" />

      <div className="w-[92%] max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="text-left">
            <span className="text-[11px] font-sans font-extrabold tracking-widest text-coffee-accent uppercase block mb-3">Відгуки гостей</span>
            <h2 className="font-serif text-3xl sm:text-4xl text-coffee-dark font-bold tracking-tight">Книга Відгуків у Поляроїдах</h2>
            <p className="text-sm text-coffee-dark/60 font-sans mt-2 max-w-lg">Ми щиро вдячні кожному гостю за теплі слова. Твоя посмішка — наша найбільша нагорода.</p>
          </div>

          <button
            onClick={handleOpenForm}
            className="tactile-btn text-xs font-bold px-5 py-3.5 rounded-full text-coffee-dark flex items-center gap-1.5 cursor-pointer self-start md:self-auto"
            style={{ borderRadius: '9999px' }}
          >
            <PenTool className="w-4 h-4 text-coffee-accent" />
            <span>{myExistingReview ? 'Редагувати свій відгук' : 'Залишити свій відгук'}</span>
          </button>
        </div>

        {/* Dynamic Interactive Input Overlay Form */}
        <AnimatePresence>
          {isFormOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 40 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="w-full max-w-xl mx-auto bg-coffee-latte border border-coffee-milk/50 p-6 rounded-3xl overflow-hidden shadow-lg text-left"
              style={{ borderRadius: '24px' }}
            >
              <h3 className="font-serif text-lg font-bold text-coffee-dark mb-4 flex items-center gap-2">
                <MessageSquareHeart className="w-5 h-5 text-coffee-accent" />
                {myExistingReview ? 'Оновити свій відгук' : 'Поділися своїми враженнями'}
              </h3>

              <form onSubmit={handleSubmitReview} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-coffee-dark/60 font-bold uppercase tracking-wider">Ваше ім’я</label>
                    <input
                      required
                      type="text"
                      placeholder="Марта"
                      value={newReviewName}
                      onChange={(e) => setNewReviewName(e.target.value)}
                      className="tactile-input px-4 py-3 rounded-2xl text-sm font-semibold text-coffee-dark"
                      style={{ borderRadius: '16px' }}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-coffee-dark/60 font-bold uppercase tracking-wider">Оцінка (Зірки)</label>
                    <div className="flex gap-2 items-center h-[46px] bg-[#FAF6F0] rounded-2xl border border-coffee-milk/30 px-4" style={{ borderRadius: '16px' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewReviewRating(star)}
                          className="text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star className={`w-5 h-5 ${star <= newReviewRating ? 'fill-current' : ''}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-coffee-dark/60 font-bold uppercase tracking-wider">Ваш коментар</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Кава та десерти були чудовими..."
                    value={newReviewText}
                    onChange={(e) => setNewReviewText(e.target.value)}
                    className="tactile-input px-4 py-3 rounded-2xl text-sm font-medium text-coffee-dark resize-none"
                    style={{ borderRadius: '16px' }}
                  />
                </div>

                <div className="flex gap-3 justify-between items-center mt-2 w-full">
                  <div>
                    {myExistingReview && (
                      <button
                        type="button"
                        onClick={handleDeleteReview}
                        className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Видалити відгук
                      </button>
                    )}
                  </div>
                  <div className="flex gap-3 items-center">
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="text-xs font-bold text-coffee-dark/60 hover:text-coffee-dark"
                    >
                      Скасувати
                    </button>
                    <button
                      type="submit"
                      className="tactile-btn-accent text-xs font-bold text-coffee-cream px-5 py-3 rounded-full cursor-pointer"
                      style={{ borderRadius: '9999px' }}
                    >
                      {myExistingReview ? 'Зберегти зміни' : 'Опублікувати відгук'}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success toast block */}
        <AnimatePresence>
          {showSubmitSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 p-4 rounded-2xl text-center font-bold text-xs max-w-md mx-auto mb-8 flex items-center justify-center gap-2"
              style={{ borderRadius: '16px' }}
            >
              <Check className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Polaroid Table Layout (Grid of rotated polaroid cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 pt-4">
          {reviewsList.map((rev) => {
            const isMine = rev.deviceId === deviceId;
            return (
              <motion.div
                key={rev.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                style={{ rotate: `${rev.skew}deg` }}
                whileHover={{ rotate: 0, y: -10, scale: 1.03 }}
                transition={{ type: "spring", stiffness: 150, damping: 20 }}
                className={`bg-white border-12 border-white rounded-lg shadow-xl shadow-coffee-deep/10 p-5 flex flex-col justify-between text-left min-h-[340px] select-none relative ${
                  isMine ? 'ring-4 ring-coffee-accent/40 ring-offset-4' : ''
                }`}
              >
                {/* Polaroid Photo Box (Top Area with colored background & handwritten avatar) */}
                <div className="w-full h-40 rounded-sm bg-gradient-to-tr from-coffee-latte to-coffee-milk/35 flex flex-col justify-between p-4 relative overflow-hidden">
                  
                  {/* Coffee Stain overlay stamp */}
                  <div className="absolute w-28 h-28 rounded-full border border-coffee-accent/5 opacity-10 top-2 right-[-20px]" />

                  <div className="flex justify-between items-start">
                    <div className={`w-9 h-9 rounded-full ${rev.avatarColor} flex items-center justify-center font-serif text-sm font-black shadow-inner`} style={{ borderRadius: '9999px' }}>
                      {rev.name ? rev.name.charAt(0) : '?'}
                    </div>
                    
                    {/* Rating Stars */}
                    <div className="flex gap-0.5 text-amber-400">
                      {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col mt-4">
                    <span className="font-serif font-black text-coffee-dark tracking-tight leading-none text-base flex items-center gap-1.5">
                      {rev.name}
                      {isMine && (
                        <span className="bg-coffee-accent text-[8px] text-white font-extrabold uppercase px-1.5 py-0.5 rounded-full tracking-wider">
                          Ваш
                        </span>
                      )}
                    </span>
                    <span className="text-[9px] text-coffee-accent/80 font-bold uppercase tracking-wider mt-1">
                      {rev.role || 'Гість кав’ярні'}
                    </span>
                  </div>

                </div>

                {/* Polaroid Caption Area (Bottom Area with Handwritten font) */}
                <div className="mt-5 flex flex-col justify-between h-full">
                  <p className="font-hand text-xl text-coffee-dark/90 leading-[1.3] font-medium italic min-h-[80px]">
                    « {rev.text} »
                  </p>

                  <div className="border-t border-coffee-milk/10 pt-3 flex justify-between items-center text-[10px] font-mono text-coffee-dark/40 font-bold">
                    <span>
                      {isMine ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleOpenForm}
                            className="text-coffee-accent hover:underline flex items-center gap-0.5 font-bold cursor-pointer"
                          >
                            Редагувати
                          </button>
                          <span className="text-coffee-dark/20">|</span>
                          <button
                            onClick={handleDeleteReview}
                            className="text-red-500 hover:underline flex items-center gap-0.5 font-bold cursor-pointer"
                          >
                            Видалити
                          </button>
                        </div>
                      ) : (
                        'Coffeetime'
                      )}
                    </span>
                    <span>{rev.date}</span>
                  </div>
                </div>

              </motion.div>
            );
          })}
        </div>

      </div>

    </section>
  );
}
