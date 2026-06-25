/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import MenuSection from './components/MenuSection';
import ConfiguratorSection from './components/ConfiguratorSection';
import GallerySection from './components/GallerySection';
import BeansSection from './components/BeansSection';
import TestimonialsSection from './components/TestimonialsSection';
import ContactSection from './components/ContactSection';
import AdminSection from './components/AdminSection';
import CartSection from './components/CartSection';
import { CartItem } from './types';
import defaultDb from './data/coffeetime_db.json';

export default function App() {
  const [activeSection, setActiveSection] = useState('hero');
  const [dbData, setDbData] = useState<any>(defaultDb);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Fetch dynamic content on load and set up periodic polling for real-time synchronization across devices
  useEffect(() => {
    const fetchData = () => {
      fetch('/api/public/data')
        .then((res) => res.json())
        .then((res) => {
          if (res.success && res.data) {
            setDbData((currentData: any) => {
              if (JSON.stringify(currentData) !== JSON.stringify(res.data)) {
                return res.data;
              }
              return currentData;
            });
          }
        })
        .catch((err) => console.error('Error fetching dynamic coffee data:', err));
    };

    fetchData(); // Initial load

    // Poll every 4 seconds to synchronize admin edits across different devices
    const intervalId = setInterval(fetchData, 4000);
    return () => clearInterval(intervalId);
  }, []);

  // Mouse move parallax tracking for the background using CSS variables for maximum performance
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientWidth, clientHeight } = document.documentElement;
      const x = (e.clientX / clientWidth - 0.5) * 55; // increased from 20 for more noticeable parallax
      const y = (e.clientY / clientHeight - 0.5) * 55;
      document.documentElement.style.setProperty('--mouse-x', `${x}px`);
      document.documentElement.style.setProperty('--mouse-y', `${y}px`);
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Scroll to top automatically when active page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeSection]);

  const handleOrderRedirect = () => {
    setActiveSection('configurator');
  };

  const handleMenuRedirect = () => {
    setActiveSection('menu');
  };

  const handleAboutRedirect = () => {
    setActiveSection('about');
  };

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      if (exists) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i));
      }
      return [...prev, item];
    });
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const renderPage = () => {
    switch (activeSection) {
      case 'hero':
        return (
          <HeroSection 
            onOrderClick={handleOrderRedirect} 
            onMenuClick={handleMenuRedirect} 
            onAboutClick={handleAboutRedirect} 
            texts={dbData.texts}
            images={dbData.images}
          />
        );
      case 'about':
        return <AboutSection texts={dbData.texts} images={dbData.images} />;
      case 'menu':
        return (
          <MenuSection 
            menuItems={dbData.menuItems} 
            milkList={dbData.milk} 
            syrupList={dbData.syrups} 
            cart={cart}
            onAddToCart={addToCart}
            onGoToCart={() => setActiveSection('cart')}
          />
        );
      case 'configurator':
        return (
          <ConfiguratorSection 
            milkList={dbData.milk} 
            syrupList={dbData.syrups} 
            toppingsList={dbData.toppings} 
            onAddToCart={addToCart}
            onGoToCart={() => setActiveSection('cart')}
          />
        );
      case 'gallery':
        return <GallerySection />;
      case 'beans':
        return (
          <BeansSection 
            beansList={dbData.coffeeBeans} 
            texts={dbData.texts} 
            images={dbData.images} 
            onAddToCart={addToCart}
            onGoToCart={() => setActiveSection('cart')}
          />
        );
      case 'testimonials':
        return (
          <TestimonialsSection 
            reviewsList={dbData.reviews || []}
            onReviewSubmitted={(updatedReviews: any) => {
              setDbData((prev: any) => ({ ...prev, reviews: updatedReviews }));
            }}
          />
        );
      case 'contact':
        return <ContactSection />;
      case 'cart':
        return (
          <CartSection
            cart={cart}
            onUpdateQuantity={updateCartQuantity}
            onRemoveItem={removeFromCart}
            onClearCart={clearCart}
            onBackToMenu={() => setActiveSection('menu')}
          />
        );
      case 'admin':
        return <AdminSection dbData={dbData} onDataUpdate={setDbData} />;
      default:
        return (
          <HeroSection 
            onOrderClick={handleOrderRedirect} 
            onMenuClick={handleMenuRedirect} 
            onAboutClick={handleAboutRedirect} 
            texts={dbData.texts}
            images={dbData.images}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-coffee-dark font-sans selection:bg-coffee-caramel selection:text-white antialiased relative overflow-hidden">
      {/* Immersive background radial-gradient and decorative blurred blobs for Frosted Glass theme */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[10%] left-[-10%] w-[50vw] h-[50vw] max-w-[600px] rounded-full bg-gradient-to-tr from-coffee-caramel/10 to-coffee-milk/20 blur-[80px] opacity-80 animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[20%] right-[-10%] w-[60vw] h-[60vw] max-w-[700px] rounded-full bg-gradient-to-br from-coffee-milk/15 to-coffee-accent/10 blur-[100px] opacity-70 animate-pulse" style={{ animationDuration: '12s' }} />
        <div className="absolute top-[50%] left-[20%] w-[35vw] h-[35vw] max-w-[400px] rounded-full bg-gradient-to-r from-coffee-latte/20 to-coffee-cream/30 blur-[90px] opacity-60" />

        {/* Dynamic Interactive Floating Coffee Particles */}
        {[
          { id: 1, size: 'w-4 h-5', left: '8%', duration: 25, delay: 0, opacity: 0.12, type: 'bean' },
          { id: 2, size: 'w-5 h-6', left: '22%', duration: 32, delay: 3, opacity: 0.15, type: 'bean' },
          { id: 3, size: 'w-3 h-3', left: '38%', duration: 20, delay: 6, opacity: 0.2, type: 'bubble' },
          { id: 4, size: 'w-6 h-8', left: '52%', duration: 28, delay: 1, opacity: 0.1, type: 'bean' },
          { id: 5, size: 'w-4 h-4', left: '68%', duration: 35, delay: 4, opacity: 0.25, type: 'bubble' },
          { id: 6, size: 'w-5 h-6', left: '82%', duration: 24, delay: 2, opacity: 0.14, type: 'bean' },
          { id: 7, size: 'w-3 h-3', left: '94%', duration: 30, delay: 7, opacity: 0.18, type: 'bubble' },
          { id: 8, size: 'w-4 h-5', left: '45%', duration: 27, delay: 9, opacity: 0.13, type: 'bean' },
          { id: 9, size: 'w-6 h-6', left: '78%', duration: 38, delay: 5, opacity: 0.08, type: 'bean' },
          { id: 10, size: 'w-3 h-3', left: '14%', duration: 22, delay: 8, opacity: 0.22, type: 'bubble' },
        ].map((p) => (
          <div
            key={p.id}
            className="absolute pointer-events-none"
            style={{
              left: p.left,
              opacity: p.opacity,
              transform: `translate3d(calc(var(--mouse-x, 0px) * ${(p.id % 2 === 0 ? 1 : -1) * 0.8}), 0, 0)`,
              transition: 'transform 0.12s ease-out',
            }}
          >
            <motion.div
              initial={{ y: "110vh", rotate: 0 }}
              animate={{
                y: "-15vh",
                rotate: 360,
              }}
              transition={{
                y: {
                  duration: p.duration,
                  repeat: Infinity,
                  ease: "linear",
                  delay: p.delay,
                },
                rotate: {
                  duration: p.duration * 0.5,
                  repeat: Infinity,
                  ease: "linear",
                  delay: p.delay,
                }
              }}
            >
              {p.type === 'bean' ? (
                // Styled vector coffee bean silhouette shape
                <div 
                  className={`${p.size} bg-coffee-dark border border-coffee-caramel/20 relative shadow-inner`}
                  style={{ borderRadius: '60% 40% 60% 40% / 60% 60% 40% 40%' }}
                >
                  <div className="absolute inset-y-1 left-1/2 w-[1px] bg-coffee-milk/30 -translate-x-1/2 rounded-full rotate-[-15deg]" />
                </div>
              ) : (
                // Bubble / Steam Ring
                <div className={`${p.size} rounded-full border border-coffee-accent/40 bg-coffee-latte/10`} />
              )}
            </motion.div>
          </div>
        ))}
      </div>

      {/* Floating Pill Navigation - High z-index to prevent overlays */}
      <div className="relative z-[9999]">
        <Navbar activeSection={activeSection} setActiveSection={setActiveSection} cart={cart} />
      </div>

      {/* Main Multi-Page 8 Pages */}
      <main className="w-full relative z-10 pt-24 min-h-[calc(100vh-96px)] flex flex-col justify-start">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full"
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

