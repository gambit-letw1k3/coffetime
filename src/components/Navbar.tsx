import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coffee, Menu, X, Phone, Heart, Lock } from 'lucide-react';

interface NavbarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  cart?: any[];
}

export default function Navbar({ activeSection, setActiveSection, cart }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const cartCount = cart?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const navItems = [
    { id: 'hero', label: 'Головна' },
    { id: 'about', label: 'Про нас' },
    { id: 'menu', label: 'Меню' },
    { id: 'configurator', label: 'Конструктор' },
    { id: 'gallery', label: 'Атмосфера' },
    { id: 'beans', label: 'Зерна' },
    { id: 'testimonials', label: 'Гості' },
    { id: 'contact', label: 'Контакти' },
    { id: 'cart', label: 'Кошик' }
  ];


  useEffect(() => {
    const handleScroll = () => {
      const isPast = window.scrollY > 50;
      setScrolled((prev) => (prev !== isPast ? isPast : prev));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (id: string) => {
    setActiveSection(id);
    setIsOpen(false);
  };

  return (
    <>
      <header className={`fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-[92%] max-w-7xl transition-all duration-300`}>
        <div 
          className={`w-full rounded-full px-6 py-3 flex items-center justify-between border transition-all duration-300
            ${scrolled 
              ? 'bg-[#FDFBF7]/65 backdrop-blur-xl border-[#ffffff]/50 shadow-lg shadow-coffee-deep/5' 
              : 'bg-[#FDFBF7]/40 backdrop-blur-md border-[#ffffff]/35 shadow-sm'
            }`}
          style={{ borderRadius: '9999px' }}
        >
          {/* Logo */}
          <div 
            onClick={() => handleNavClick('hero')} 
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-coffee-dark flex items-center justify-center shadow-md shadow-coffee-deep/10 group-hover:scale-105 transition-transform duration-300">
              <Coffee className="w-5 h-5 text-coffee-cream" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-coffee-dark tracking-tight leading-none text-base">COFFEETIME</span>
              <span className="font-sans text-[10px] text-coffee-caramel tracking-widest uppercase font-semibold leading-none">COFFEEHOUSE</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative px-4 py-1.5 rounded-full text-xs font-medium tracking-wide transition-colors duration-300 cursor-pointer
                    ${isActive ? 'text-coffee-cream' : 'text-coffee-dark/80 hover:text-coffee-dark hover:bg-coffee-latte/50'}`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="activeNavBg"
                      className="absolute inset-0 bg-coffee-dark rounded-full -z-10 shadow-md shadow-coffee-deep/10"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      style={{ borderRadius: '9999px' }}
                    />
                  )}
                  <span className="flex items-center gap-1">
                    {item.label}
                    {item.id === 'cart' && cartCount > 0 && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-sans font-black tracking-normal leading-none bg-coffee-accent text-white" style={{ borderRadius: '9999px' }}>
                        {cartCount}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden xl:flex items-center gap-2">
            <button 
              onClick={() => handleNavClick('contact')}
              className="tactile-btn text-xs font-semibold px-4 py-2 rounded-full text-coffee-dark flex items-center gap-1.5 cursor-pointer"
              style={{ borderRadius: '9999px' }}
            >
              <Phone className="w-3.5 h-3.5 text-coffee-caramel" />
              <span>Зв'язок</span>
            </button>

            <button 
              onClick={() => handleNavClick('admin')}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer border
                ${activeSection === 'admin' 
                  ? 'bg-coffee-dark text-coffee-cream border-coffee-dark' 
                  : 'bg-coffee-latte text-coffee-dark border-coffee-milk/30 hover:bg-coffee-milk/40'}`}
              style={{ borderRadius: '9999px' }}
              title="Панель адміністратора"
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="xl:hidden w-10 h-10 rounded-full bg-coffee-latte flex items-center justify-center border border-coffee-milk/40 hover:bg-coffee-milk/30 active:scale-95 transition-all cursor-pointer"
            style={{ borderRadius: '9999px' }}
          >
            {isOpen ? <X className="w-5 h-5 text-coffee-dark" /> : <Menu className="w-5 h-5 text-coffee-dark" />}
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-16 left-0 right-0 p-4 bg-[#FDFBF7]/70 backdrop-blur-xl rounded-3xl border border-[#ffffff]/60 shadow-xl shadow-coffee-deep/10 xl:hidden flex flex-col gap-2 z-40"
              style={{ borderRadius: '24px' }}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 py-2">
                {navItems.map((item) => {
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`px-4 py-3 rounded-2xl text-sm font-semibold tracking-wide text-left transition-all cursor-pointer flex items-center justify-between
                        ${isActive 
                          ? 'bg-coffee-dark text-coffee-cream shadow-md shadow-coffee-deep/10' 
                          : 'bg-coffee-latte/40 text-coffee-dark hover:bg-coffee-latte/80'}`}
                      style={{ borderRadius: '16px' }}
                    >
                      <span>{item.label}</span>
                      {item.id === 'cart' && cartCount > 0 && (
                        <span className="text-[10px] bg-coffee-accent text-white px-2 py-0.5 rounded-full font-sans font-black leading-none" style={{ borderRadius: '9999px' }}>
                          {cartCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              
              <div className="border-t border-coffee-milk/20 pt-4 mt-2 flex justify-between items-center px-2">
                <span className="text-[11px] font-sans text-coffee-caramel tracking-wider uppercase font-semibold flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 fill-current text-coffee-caramel animate-pulse" />
                  З любов'ю від Coffeetime
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleNavClick('admin')}
                    className={`w-9.5 h-9.5 rounded-full flex items-center justify-center border transition-all cursor-pointer
                      ${activeSection === 'admin'
                        ? 'bg-coffee-dark text-coffee-cream border-coffee-dark'
                        : 'bg-coffee-latte text-coffee-dark border-coffee-milk/30 hover:bg-coffee-milk/40'}`}
                    style={{ borderRadius: '9999px' }}
                    title="Панель адміністратора"
                  >
                    <Lock className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleNavClick('contact')}
                    className="tactile-btn text-xs font-bold px-4 py-2.5 rounded-full text-coffee-dark flex items-center gap-1.5 cursor-pointer"
                    style={{ borderRadius: '9999px' }}
                  >
                    <Phone className="w-3.5 h-3.5 text-coffee-accent" />
                    Зателефонувати
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
