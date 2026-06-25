import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, Key, Save, Plus, Trash2, Edit, Check, AlertCircle, 
  Coffee, Layers, RefreshCw, FileText, Image, Sliders, Sparkles, LogOut, Upload
} from 'lucide-react';

interface AdminSectionProps {
  dbData: any;
  onDataUpdate: (newData: any) => void;
}

const ImageUploadZone = ({ id, label, value, onChange, onUpload, isUploading }: {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  onUpload: (file: File) => void;
  isUploading: boolean;
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onUpload(file);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-bold text-coffee-dark/60 block">{label}</label>
      
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-2 flex flex-col items-center justify-center min-h-[160px] transition-all overflow-hidden bg-white/40 ${
          isDragOver 
            ? 'border-coffee-accent bg-coffee-latte/20 scale-[1.01]' 
            : 'border-coffee-milk/20 hover:border-coffee-milk/55 hover:bg-white/60'
        }`}
        style={{ borderRadius: '16px' }}
      >
        {value ? (
          <div className="absolute inset-0 w-full h-full group">
            <img src={value} alt={label} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-coffee-dark/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white">
              <Upload className="w-6 h-6 animate-bounce text-coffee-cream" />
              <p className="text-[10px] font-bold uppercase tracking-wider">Перетягніть нове фото сюди</p>
              <p className="text-[9px] text-coffee-cream/80 font-medium">або натисніть кнопку «Обрати файл»</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-coffee-dark/40 py-6">
            <Image className="w-8 h-8 text-coffee-milk/60" />
            <p className="text-xs font-semibold">Фото не завантажено</p>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-white/85 backdrop-blur-sm flex flex-col items-center justify-center gap-2 z-10">
            <RefreshCw className="w-6 h-6 text-coffee-accent animate-spin" />
            <span className="text-xs text-coffee-accent font-bold animate-pulse">Завантаження файлу...</span>
          </div>
        )}
      </div>

      <div className="flex gap-2 items-center mt-1">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Або введіть URL-посилання"
          className="flex-1 bg-white border border-coffee-milk/25 px-2.5 py-1.5 text-xs font-semibold text-coffee-dark rounded-lg focus:outline-none focus:ring-1 focus:ring-coffee-accent"
          style={{ borderRadius: '8px' }}
        />
        <label className="tactile-btn px-3 py-2 bg-coffee-dark text-[10px] font-bold text-white cursor-pointer flex items-center gap-1.5 hover:bg-coffee-dark/95 transition-all rounded-lg shrink-0" style={{ borderRadius: '8px' }}>
          <Upload className="w-3.5 h-3.5" />
          <span>Обрати файл</span>
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
            }} 
          />
        </label>
      </div>
    </div>
  );
};

export default function AdminSection({ dbData, onDataUpdate }: AdminSectionProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Tab control
  const [activeTab, setActiveTab] = useState<'menu' | 'beans' | 'options' | 'texts' | 'images' | 'credentials'>('menu');
  
  // Credentials edit state
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [credentialsStatus, setCredentialsStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  // Uploading state
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  // Temp working data for local mutations before saving
  const [localData, setLocalData] = useState<any>(null);
  const [lastSyncedDbData, setLastSyncedDbData] = useState<any>(null);
  
  // Success/Error notifications
  const [saveStatus, setSaveStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  // Check existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('coffeetime_admin_token');
    if (token === 'admin_token_2026') {
      setIsLoggedIn(true);
    }
  }, []);

  // Sync dbData with local editable state
  useEffect(() => {
    if (dbData) {
      const dbString = JSON.stringify(dbData);
      const lastSyncedString = lastSyncedDbData ? JSON.stringify(lastSyncedDbData) : '';
      
      if (!localData || dbString !== lastSyncedString) {
        const isLocallyModified = localData && lastSyncedDbData && JSON.stringify(localData) !== JSON.stringify(lastSyncedDbData);
        if (!isLocallyModified) {
          setLocalData(JSON.parse(JSON.stringify(dbData)));
        }
        setLastSyncedDbData(JSON.parse(JSON.stringify(dbData)));
      }
    }
  }, [dbData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        const result = await response.json();
        localStorage.setItem('coffeetime_admin_token', result.token);
        setIsLoggedIn(true);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setLoginError(errorData.error || 'Невірні дані для входу');
      }
    } catch (err) {
      setLoginError('Помилка підключення до сервера');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('coffeetime_admin_token');
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
  };

  // Fetch admin credentials when credentials tab is active
  useEffect(() => {
    if (isLoggedIn && activeTab === 'credentials') {
      const fetchCredentials = async () => {
        try {
          const token = localStorage.getItem('coffeetime_admin_token');
          const response = await fetch('/api/admin/credentials', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const result = await response.json();
            setAdminUsername(result.username);
            setAdminPassword(result.password);
          }
        } catch (err) {
          console.error('Error fetching admin credentials:', err);
        }
      };
      fetchCredentials();
    }
  }, [isLoggedIn, activeTab]);

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredentialsStatus(null);
    setIsLoading(true);

    try {
      const token = localStorage.getItem('coffeetime_admin_token');
      const response = await fetch('/api/admin/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username: adminUsername, password: adminPassword })
      });

      if (response.ok) {
        const result = await response.json();
        setCredentialsStatus({ success: true, message: result.message || 'Логін та пароль успішно змінено!' });
        setTimeout(() => setCredentialsStatus(null), 4000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setCredentialsStatus({ success: false, message: errorData.error || 'Помилка зміни паролю' });
      }
    } catch (err) {
      setCredentialsStatus({ success: false, message: 'Помилка підключення до сервера' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (key: string, file: File) => {
    setUploadingField(key);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64String = reader.result as string;
        const token = localStorage.getItem('coffeetime_admin_token');
        
        const response = await fetch('/api/admin/upload-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            image: base64String,
            fileName: file.name
          })
        });

        if (response.ok) {
          const result = await response.json();
          updateImageField(key, result.url);
        } else {
          const errorData = await response.json().catch(() => ({}));
          alert(errorData.error || 'Помилка завантаження файлу');
        }
        setUploadingField(null);
      };
      reader.onerror = () => {
        alert('Помилка зчитування файлу');
        setUploadingField(null);
      };
    } catch (err) {
      console.error('Error in handleImageUpload:', err);
      setUploadingField(null);
    }
  };

  const handleSaveAll = async () => {
    setSaveStatus(null);
    setIsLoading(true);

    try {
      const token = localStorage.getItem('coffeetime_admin_token');
      const response = await fetch('/api/admin/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(localData)
      });

      if (response.ok) {
        const result = await response.json();
        setSaveStatus({ success: true, message: result.message || 'Зміни успішно збережено!' });
        onDataUpdate(localData);
        setTimeout(() => setSaveStatus(null), 4000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setSaveStatus({ success: false, message: errorData.error || 'Помилка збереження даних' });
      }
    } catch (err) {
      setSaveStatus({ success: false, message: 'Помилка підключення до сервера' });
    } finally {
      setIsLoading(false);
    }
  };

  // State handlers
  const updateTextField = (key: string, value: string) => {
    setLocalData((prev: any) => ({
      ...prev,
      texts: {
        ...prev.texts,
        [key]: value
      }
    }));
  };

  const updateImageField = (key: string, value: string) => {
    setLocalData((prev: any) => ({
      ...prev,
      images: {
        ...prev.images,
        [key]: value
      }
    }));
  };

  // Options handlers (Milk, Syrups, Toppings)
  const handleAddOption = (type: 'milk' | 'syrups' | 'toppings') => {
    const newId = `${type}_${Date.now()}`;
    const newObj = type === 'milk' 
      ? { id: newId, label: 'Нове молоко', price: 15, color: '#A47F64' }
      : { id: newId, label: 'Нова позиція', price: 15 };

    setLocalData((prev: any) => ({
      ...prev,
      [type]: [...prev[type], newObj]
    }));
  };

  const handleUpdateOption = (type: 'milk' | 'syrups' | 'toppings', index: number, field: string, value: any) => {
    setLocalData((prev: any) => {
      const list = [...prev[type]];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, [type]: list };
    });
  };

  const handleRemoveOption = (type: 'milk' | 'syrups' | 'toppings', index: number) => {
    setLocalData((prev: any) => ({
      ...prev,
      [type]: prev[type].filter((_: any, i: number) => i !== index)
    }));
  };

  // Menu items handlers
  const handleAddMenuItem = () => {
    const newItem = {
      id: `m_${Date.now()}`,
      name: 'Новий напій',
      description: 'Опис нового напою та смакові нотки.',
      price: 60,
      category: 'classic',
      strength: 3,
      milkRatio: '—',
      volume: '250 мл',
      tags: ['Ніжний'],
      color: '#A36B3B'
    };

    setLocalData((prev: any) => ({
      ...prev,
      menuItems: [newItem, ...prev.menuItems]
    }));
  };

  const handleUpdateMenuItem = (index: number, field: string, value: any) => {
    setLocalData((prev: any) => {
      const list = [...prev.menuItems];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, menuItems: list };
    });
  };

  const handleRemoveMenuItem = (index: number) => {
    if (confirm('Ви впевнені, що хочете видалити цей напій з меню?')) {
      setLocalData((prev: any) => ({
        ...prev,
        menuItems: prev.menuItems.filter((_: any, i: number) => i !== index)
      }));
    }
  };

  // Coffee Beans handlers
  const handleAddCoffeeBean = () => {
    const newBean = {
      id: `b_${Date.now()}`,
      name: 'Новий сорт Specialty',
      origin: 'Країна (Регіон)',
      process: 'Митий / Натуральний',
      roastLevel: 'medium',
      notes: ['Ягоди', 'Горіхи'],
      price: 220,
      weight: '250 г',
      altitude: '1500 - 1800 м'
    };

    setLocalData((prev: any) => ({
      ...prev,
      coffeeBeans: [newBean, ...prev.coffeeBeans]
    }));
  };

  const handleUpdateCoffeeBean = (index: number, field: string, value: any) => {
    setLocalData((prev: any) => {
      const list = [...prev.coffeeBeans];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, coffeeBeans: list };
    });
  };

  const handleRemoveCoffeeBean = (index: number) => {
    if (confirm('Ви впевнені, що хочете видалити цей сорт зерна?')) {
      setLocalData((prev: any) => ({
        ...prev,
        coffeeBeans: prev.coffeeBeans.filter((_: any, i: number) => i !== index)
      }));
    }
  };

  if (!isLoggedIn) {
    return (
      <section className="py-24 px-4 min-h-[70vh] flex items-center justify-center relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-coffee-accent/5 blur-3xl pointer-events-none -z-10" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-[#FAF6F0]/80 backdrop-blur-md border border-[#ffffff]/50 rounded-[28px] p-8 shadow-2xl shadow-coffee-deep/10 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-coffee-cream coffee-grain opacity-20 -z-10" />
          
          <div className="w-14 h-14 rounded-full bg-coffee-dark flex items-center justify-center mx-auto mb-6 shadow-md shadow-coffee-deep/5">
            <Lock className="w-6 h-6 text-coffee-cream" />
          </div>

          <h2 className="font-serif text-2xl font-bold text-coffee-dark mb-2">Адміністративна панель</h2>
          <p className="text-xs text-coffee-dark/60 mb-6 font-medium">Будь ласка, введіть ваші реквізити для доступу до редагування</p>

          <form onSubmit={handleLogin} className="flex flex-col gap-4 text-left">
            <div>
              <label className="text-[10px] font-bold text-coffee-dark/60 uppercase tracking-wider block mb-1.5">Логін</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Введіть логін (напр. admin)" 
                className="w-full bg-white border border-coffee-milk/30 px-4 py-2.5 text-sm font-semibold text-coffee-dark rounded-xl focus:outline-none focus:ring-1 focus:ring-coffee-accent"
                style={{ borderRadius: '12px' }}
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-coffee-dark/60 uppercase tracking-wider block mb-1.5">Пароль</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введіть пароль" 
                className="w-full bg-white border border-coffee-milk/30 px-4 py-2.5 text-sm font-semibold text-coffee-dark rounded-xl focus:outline-none focus:ring-1 focus:ring-coffee-accent"
                style={{ borderRadius: '12px' }}
                required
              />
            </div>

            {loginError && (
              <div className="bg-red-50 text-red-600 text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 font-medium border border-red-100" style={{ borderRadius: '10px' }}>
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{loginError}</span>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="tactile-btn mt-4 w-full bg-coffee-dark hover:bg-coffee-dark/95 text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-transform duration-200"
              style={{ borderRadius: '12px' }}
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Key className="w-4 h-4 text-coffee-cream" />
                  <span>Увійти в кабінет</span>
                </>
              )}
            </button>
          </form>

          {/* Helpful tip about default credentials */}
          <div className="mt-6 p-4 rounded-xl bg-coffee-latte/35 border border-coffee-milk/15 text-left" style={{ borderRadius: '14px' }}>
            <span className="text-[10px] font-bold text-coffee-accent uppercase tracking-wider block mb-1">🔑 Дефолтні реквізити для входу:</span>
            <p className="text-xs text-coffee-dark/70 font-sans leading-relaxed">
              Логін: <strong className="text-coffee-dark font-extrabold">admin</strong><br />
              Пароль: <strong className="text-coffee-dark font-extrabold">admin</strong>
            </p>
            <p className="text-[10px] text-coffee-dark/50 font-sans mt-2 leading-relaxed">
              * Ви зможете змінити їх на будь-які інші у вкладці <strong>«Облікові дані»</strong> у панелі керування.
            </p>
          </div>

          <span className="text-[9px] font-mono text-coffee-dark/40 block mt-8 uppercase tracking-wider">Coffeetime Secure Gate v2.6</span>
        </motion.div>
      </section>
    );
  }

  if (!localData) {
    return (
      <div className="py-24 text-center">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-coffee-accent" />
        <p className="mt-4 text-sm text-coffee-dark/60 font-medium">Завантаження бази даних кав’ярні...</p>
      </div>
    );
  }

  return (
    <section className="py-12 px-4 max-w-6xl mx-auto text-left relative">
      
      {/* Admin Header Panel */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 bg-[#FAF6F0]/70 backdrop-blur-md border border-[#ffffff]/50 rounded-3xl p-6 shadow-lg shadow-coffee-deep/5" style={{ borderRadius: '24px' }}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-coffee-dark rounded-full flex items-center justify-center shadow-md shadow-coffee-deep/10">
            <Sliders className="w-5 h-5 text-coffee-cream" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-sans font-extrabold tracking-widest text-coffee-accent uppercase">Режим керування</span>
              <span className="bg-emerald-50 text-emerald-700 text-[8px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider border border-emerald-100">Авторизовано</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-coffee-dark">Панель керування контентом</h2>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={handleSaveAll}
            disabled={isLoading}
            className="tactile-btn flex-1 md:flex-none text-xs font-bold px-5 py-3 rounded-xl bg-coffee-accent hover:bg-coffee-accent/95 text-white flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-coffee-deep/5"
            style={{ borderRadius: '12px' }}
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Зберегти на сервері</span>
          </button>
          
          <button
            onClick={handleLogout}
            className="w-11 h-11 bg-white border border-coffee-milk/30 hover:bg-red-50 hover:text-red-600 rounded-xl flex items-center justify-center cursor-pointer transition-colors"
            style={{ borderRadius: '12px' }}
            title="Вийти з системи"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Save Notification */}
      <AnimatePresence>
        {saveStatus && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mb-6 p-4 rounded-2xl flex items-center gap-2.5 text-xs font-semibold border shadow-md ${
              saveStatus.success 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-100' 
                : 'bg-red-50 text-red-800 border-red-100'
            }`}
            style={{ borderRadius: '16px' }}
          >
            {saveStatus.success ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
            <span>{saveStatus.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-coffee-milk/15 pb-4">
        {[
          { id: 'menu', label: 'Меню напоїв', icon: Coffee },
          { id: 'beans', label: 'Кава в зернах', icon: Sparkles },
          { id: 'options', label: 'Інгредієнти & Ціни', icon: Layers },
          { id: 'texts', label: 'Тексти сайту', icon: FileText },
          { id: 'images', label: 'Зображення', icon: Image },
          { id: 'credentials', label: 'Логін & Пароль', icon: Lock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all border
                ${isActive 
                  ? 'bg-coffee-dark text-white border-coffee-dark shadow-md shadow-coffee-deep/5' 
                  : 'bg-white text-coffee-dark/70 border-coffee-milk/20 hover:bg-coffee-latte/35'}`}
              style={{ borderRadius: '12px' }}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="bg-white/40 backdrop-blur-md border border-white/50 rounded-[28px] p-6 shadow-xl shadow-coffee-deep/5 min-h-[400px] relative overflow-hidden" style={{ borderRadius: '28px' }}>
        <div className="absolute inset-0 bg-coffee-cream coffee-grain opacity-10 -z-10" />

        {/* 1. Menu Items Panel */}
        {activeTab === 'menu' && (
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center border-b border-coffee-milk/10 pb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-coffee-dark">Позиції меню напоїв та десертів</h3>
                <p className="text-xs text-coffee-dark/60 mt-0.5">Додавайте, редагуйте та керуйте кавовими шедеврами</p>
              </div>
              <button
                onClick={handleAddMenuItem}
                className="tactile-btn text-xs font-bold px-3 py-2 rounded-lg bg-coffee-dark hover:bg-coffee-dark/95 text-white flex items-center gap-1.5 cursor-pointer"
                style={{ borderRadius: '10px' }}
              >
                <Plus className="w-4 h-4 text-coffee-cream" />
                <span>Додати позицію</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {localData.menuItems.map((item: any, idx: number) => (
                <div key={item.id} className="bg-white/75 border border-coffee-milk/15 rounded-2xl p-5 shadow-sm text-left flex flex-col gap-4 relative" style={{ borderRadius: '18px' }}>
                  <button
                    onClick={() => handleRemoveMenuItem(idx)}
                    className="absolute top-4 right-4 w-7 h-7 text-coffee-dark/40 hover:text-red-500 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors cursor-pointer"
                    title="Видалити"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div className="col-span-2">
                      <label className="text-[8px] font-bold text-coffee-dark/50 uppercase block mb-1">Назва позиції</label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleUpdateMenuItem(idx, 'name', e.target.value)}
                        className="w-full bg-white border border-coffee-milk/25 px-2.5 py-1.5 text-xs font-semibold text-coffee-dark rounded-lg focus:outline-none focus:ring-1 focus:ring-coffee-accent"
                        style={{ borderRadius: '8px' }}
                      />
                    </div>

                    <div>
                      <label className="text-[8px] font-bold text-coffee-dark/50 uppercase block mb-1">Категорія</label>
                      <select
                        value={item.category}
                        onChange={(e) => handleUpdateMenuItem(idx, 'category', e.target.value)}
                        className="w-full bg-white border border-coffee-milk/25 px-2 py-1.5 text-xs font-semibold text-coffee-dark rounded-lg focus:outline-none focus:ring-1 focus:ring-coffee-accent"
                        style={{ borderRadius: '8px' }}
                      >
                        <option value="classic">Класика</option>
                        <option value="signature">Авторські</option>
                        <option value="brewed">Альтернатива</option>
                        <option value="desserts">Десерти</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[8px] font-bold text-coffee-dark/50 uppercase block mb-1">Ціна (₴)</label>
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => handleUpdateMenuItem(idx, 'price', parseInt(e.target.value) || 0)}
                        className="w-full bg-white border border-coffee-milk/25 px-2.5 py-1.5 text-xs font-semibold text-coffee-dark rounded-lg focus:outline-none focus:ring-1 focus:ring-coffee-accent"
                        style={{ borderRadius: '8px' }}
                      />
                    </div>

                    <div>
                      <label className="text-[8px] font-bold text-coffee-dark/50 uppercase block mb-1">Об'єм / Вага</label>
                      <input
                        type="text"
                        value={item.volume}
                        onChange={(e) => handleUpdateMenuItem(idx, 'volume', e.target.value)}
                        className="w-full bg-white border border-coffee-milk/25 px-2.5 py-1.5 text-xs font-semibold text-coffee-dark rounded-lg focus:outline-none focus:ring-1 focus:ring-coffee-accent"
                        style={{ borderRadius: '8px' }}
                      />
                    </div>

                    <div>
                      <label className="text-[8px] font-bold text-coffee-dark/50 uppercase block mb-1">Міцність кави (0-5)</label>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        value={item.strength}
                        onChange={(e) => handleUpdateMenuItem(idx, 'strength', parseInt(e.target.value) || 0)}
                        className="w-full bg-white border border-coffee-milk/25 px-2.5 py-1.5 text-xs font-semibold text-coffee-dark rounded-lg focus:outline-none focus:ring-1 focus:ring-coffee-accent"
                        style={{ borderRadius: '8px' }}
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="text-[8px] font-bold text-coffee-dark/50 uppercase block mb-1">Опис позиції</label>
                      <textarea
                        value={item.description}
                        onChange={(e) => handleUpdateMenuItem(idx, 'description', e.target.value)}
                        rows={2}
                        className="w-full bg-white border border-coffee-milk/25 px-2.5 py-1.5 text-xs font-semibold text-coffee-dark rounded-lg focus:outline-none focus:ring-1 focus:ring-coffee-accent resize-none"
                        style={{ borderRadius: '8px' }}
                      />
                    </div>

                    <div>
                      <label className="text-[8px] font-bold text-coffee-dark/50 uppercase block mb-1">Пропорція молока (якщо є)</label>
                      <input
                        type="text"
                        value={item.milkRatio || ''}
                        placeholder="Напр. 70% Молоко, 30% Еспресо"
                        onChange={(e) => handleUpdateMenuItem(idx, 'milkRatio', e.target.value)}
                        className="w-full bg-white border border-coffee-milk/25 px-2.5 py-1.5 text-xs font-semibold text-coffee-dark rounded-lg focus:outline-none focus:ring-1 focus:ring-coffee-accent"
                        style={{ borderRadius: '8px' }}
                      />
                    </div>

                    <div>
                      <label className="text-[8px] font-bold text-coffee-dark/50 uppercase block mb-1">Теги (через кому)</label>
                      <input
                        type="text"
                        value={item.tags.join(', ')}
                        onChange={(e) => handleUpdateMenuItem(idx, 'tags', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                        className="w-full bg-white border border-coffee-milk/25 px-2.5 py-1.5 text-xs font-semibold text-coffee-dark rounded-lg focus:outline-none focus:ring-1 focus:ring-coffee-accent"
                        style={{ borderRadius: '8px' }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. Coffee Beans Panel */}
        {activeTab === 'beans' && (
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center border-b border-coffee-milk/10 pb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-coffee-dark">Кавові зерна в пачках</h3>
                <p className="text-xs text-coffee-dark/60 mt-0.5">Керуйте ексклюзивними сортами Specialty кави на продаж</p>
              </div>
              <button
                onClick={handleAddCoffeeBean}
                className="tactile-btn text-xs font-bold px-3 py-2 rounded-lg bg-coffee-dark hover:bg-coffee-dark/95 text-white flex items-center gap-1.5 cursor-pointer"
                style={{ borderRadius: '10px' }}
              >
                <Plus className="w-4 h-4 text-coffee-cream" />
                <span>Додати сорт</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {localData.coffeeBeans.map((bean: any, idx: number) => (
                <div key={bean.id} className="bg-white/75 border border-coffee-milk/15 rounded-2xl p-5 shadow-sm text-left flex flex-col gap-4 relative" style={{ borderRadius: '18px' }}>
                  <button
                    onClick={() => handleRemoveCoffeeBean(idx)}
                    className="absolute top-4 right-4 w-7 h-7 text-coffee-dark/40 hover:text-red-500 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors cursor-pointer"
                    title="Видалити"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div className="col-span-2">
                      <label className="text-[8px] font-bold text-coffee-dark/50 uppercase block mb-1">Назва сорту</label>
                      <input
                        type="text"
                        value={bean.name}
                        onChange={(e) => handleUpdateCoffeeBean(idx, 'name', e.target.value)}
                        className="w-full bg-white border border-coffee-milk/25 px-2.5 py-1.5 text-xs font-semibold text-coffee-dark rounded-lg focus:outline-none focus:ring-1 focus:ring-coffee-accent"
                        style={{ borderRadius: '8px' }}
                      />
                    </div>

                    <div>
                      <label className="text-[8px] font-bold text-coffee-dark/50 uppercase block mb-1">Походження (Регіон)</label>
                      <input
                        type="text"
                        value={bean.origin}
                        onChange={(e) => handleUpdateCoffeeBean(idx, 'origin', e.target.value)}
                        className="w-full bg-white border border-coffee-milk/25 px-2.5 py-1.5 text-xs font-semibold text-coffee-dark rounded-lg focus:outline-none focus:ring-1 focus:ring-coffee-accent"
                        style={{ borderRadius: '8px' }}
                      />
                    </div>

                    <div>
                      <label className="text-[8px] font-bold text-coffee-dark/50 uppercase block mb-1">Обробка зерна</label>
                      <input
                        type="text"
                        value={bean.process}
                        onChange={(e) => handleUpdateCoffeeBean(idx, 'process', e.target.value)}
                        className="w-full bg-white border border-coffee-milk/25 px-2.5 py-1.5 text-xs font-semibold text-coffee-dark rounded-lg focus:outline-none focus:ring-1 focus:ring-coffee-accent"
                        style={{ borderRadius: '8px' }}
                      />
                    </div>

                    <div>
                      <label className="text-[8px] font-bold text-coffee-dark/50 uppercase block mb-1">Висота зростання</label>
                      <input
                        type="text"
                        value={bean.altitude}
                        onChange={(e) => handleUpdateCoffeeBean(idx, 'altitude', e.target.value)}
                        className="w-full bg-white border border-[#c6b6a3]/25 px-2.5 py-1.5 text-xs font-semibold text-coffee-dark rounded-lg focus:outline-none focus:ring-1 focus:ring-coffee-accent"
                        style={{ borderRadius: '8px' }}
                      />
                    </div>

                    <div>
                      <label className="text-[8px] font-bold text-coffee-dark/50 uppercase block mb-1">Вага упаковки</label>
                      <input
                        type="text"
                        value={bean.weight}
                        onChange={(e) => handleUpdateCoffeeBean(idx, 'weight', e.target.value)}
                        className="w-full bg-white border border-[#c6b6a3]/25 px-2.5 py-1.5 text-xs font-semibold text-coffee-dark rounded-lg focus:outline-none focus:ring-1 focus:ring-coffee-accent"
                        style={{ borderRadius: '8px' }}
                      />
                    </div>

                    <div>
                      <label className="text-[8px] font-bold text-coffee-dark/50 uppercase block mb-1">Ступінь обсмаження</label>
                      <select
                        value={bean.roastLevel}
                        onChange={(e) => handleUpdateCoffeeBean(idx, 'roastLevel', e.target.value)}
                        className="w-full bg-white border border-[#c6b6a3]/25 px-2.5 py-1.5 text-xs font-semibold text-coffee-dark rounded-lg focus:outline-none focus:ring-1 focus:ring-coffee-accent"
                        style={{ borderRadius: '8px' }}
                      >
                        <option value="light">Світле (Light)</option>
                        <option value="medium">Середнє (Medium)</option>
                        <option value="dark">Темне (Dark)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[8px] font-bold text-coffee-dark/50 uppercase block mb-1">Ціна (₴)</label>
                      <input
                        type="number"
                        value={bean.price}
                        onChange={(e) => handleUpdateCoffeeBean(idx, 'price', parseInt(e.target.value) || 0)}
                        className="w-full bg-white border border-[#c6b6a3]/25 px-2.5 py-1.5 text-xs font-semibold text-coffee-dark rounded-lg focus:outline-none focus:ring-1 focus:ring-coffee-accent"
                        style={{ borderRadius: '8px' }}
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="text-[8px] font-bold text-coffee-dark/50 uppercase block mb-1">Смакові дескриптори (через кому)</label>
                      <input
                        type="text"
                        value={bean.notes.join(', ')}
                        onChange={(e) => handleUpdateCoffeeBean(idx, 'notes', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                        className="w-full bg-white border border-[#c6b6a3]/25 px-2.5 py-1.5 text-xs font-semibold text-coffee-dark rounded-lg focus:outline-none focus:ring-1 focus:ring-coffee-accent"
                        style={{ borderRadius: '8px' }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Options Panel */}
        {activeTab === 'options' && (
          <div className="flex flex-col gap-8">
            {/* Milk Options */}
            <div>
              <div className="flex justify-between items-center border-b border-coffee-milk/10 pb-2 mb-4">
                <div>
                  <h4 className="font-serif text-base font-bold text-coffee-dark">Кавові основи та молоко</h4>
                  <p className="text-[10px] text-coffee-dark/50">Альтернативне та коров'яче молоко в конструкторі</p>
                </div>
                <button
                  onClick={() => handleAddOption('milk')}
                  className="px-2 py-1 bg-coffee-dark text-white text-[10px] font-bold rounded flex items-center gap-1 cursor-pointer hover:bg-coffee-dark/95"
                  style={{ borderRadius: '6px' }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Додати молоко</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {localData.milk.map((m: any, idx: number) => (
                  <div key={m.id} className="bg-white/60 p-3 rounded-xl border border-coffee-milk/15 flex items-center justify-between gap-3" style={{ borderRadius: '12px' }}>
                    <div className="flex flex-col gap-2 w-full">
                      <div className="flex gap-2">
                        <div className="w-1/2">
                          <label className="text-[8px] text-coffee-dark/50 font-bold block">Назва</label>
                          <input
                            type="text"
                            value={m.label}
                            onChange={(e) => handleUpdateOption('milk', idx, 'label', e.target.value)}
                            className="w-full bg-white border border-coffee-milk/20 px-1.5 py-0.5 text-xs font-semibold text-coffee-dark rounded"
                          />
                        </div>
                        <div className="w-1/4">
                          <label className="text-[8px] text-coffee-dark/50 font-bold block">Ціна (+₴)</label>
                          <input
                            type="number"
                            value={m.price}
                            onChange={(e) => handleUpdateOption('milk', idx, 'price', parseInt(e.target.value) || 0)}
                            className="w-full bg-white border border-coffee-milk/20 px-1 py-0.5 text-xs font-semibold text-coffee-dark rounded"
                          />
                        </div>
                        <div className="w-1/4">
                          <label className="text-[8px] text-coffee-dark/50 font-bold block">Колір рідини</label>
                          <input
                            type="color"
                            value={m.color || '#ffffff'}
                            onChange={(e) => handleUpdateOption('milk', idx, 'color', e.target.value)}
                            className="w-full bg-transparent h-7 border-0 p-0 cursor-pointer rounded"
                          />
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveOption('milk', idx)}
                      className="text-coffee-dark/40 hover:text-red-500 mt-3 p-1 rounded hover:bg-red-50 transition-colors cursor-pointer"
                      title="Видалити"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Syrup Options */}
            <div>
              <div className="flex justify-between items-center border-b border-coffee-milk/10 pb-2 mb-4">
                <div>
                  <h4 className="font-serif text-base font-bold text-coffee-dark">Натуральні сиропи</h4>
                  <p className="text-[10px] text-coffee-dark/50">Список сиропів для конструктора</p>
                </div>
                <button
                  onClick={() => handleAddOption('syrups')}
                  className="px-2 py-1 bg-coffee-dark text-white text-[10px] font-bold rounded flex items-center gap-1 cursor-pointer hover:bg-coffee-dark/95"
                  style={{ borderRadius: '6px' }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Додати сироп</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {localData.syrups.map((sy: any, idx: number) => (
                  <div key={sy.id} className="bg-white/60 p-3 rounded-xl border border-coffee-milk/15 flex items-center justify-between gap-3" style={{ borderRadius: '12px' }}>
                    <div className="flex gap-2 w-full">
                      <div className="w-2/3">
                        <label className="text-[8px] text-coffee-dark/50 font-bold block">Назва</label>
                        <input
                          type="text"
                          value={sy.label}
                          onChange={(e) => handleUpdateOption('syrups', idx, 'label', e.target.value)}
                          className="w-full bg-white border border-coffee-milk/20 px-1.5 py-0.5 text-xs font-semibold text-coffee-dark rounded"
                        />
                      </div>
                      <div className="w-1/3">
                        <label className="text-[8px] text-coffee-dark/50 font-bold block">Ціна (+₴)</label>
                        <input
                          type="number"
                          value={sy.price || 0}
                          onChange={(e) => handleUpdateOption('syrups', idx, 'price', parseInt(e.target.value) || 0)}
                          className="w-full bg-white border border-coffee-milk/20 px-1.5 py-0.5 text-xs font-semibold text-coffee-dark rounded"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveOption('syrups', idx)}
                      className="text-coffee-dark/40 hover:text-red-500 mt-3 p-1 rounded hover:bg-red-50 transition-colors cursor-pointer"
                      title="Видалити"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Toppings Options */}
            <div>
              <div className="flex justify-between items-center border-b border-coffee-milk/10 pb-2 mb-4">
                <div>
                  <h4 className="font-serif text-base font-bold text-coffee-dark">Авторські топінги & посипки</h4>
                  <p className="text-[10px] text-coffee-dark/50">Список топінгів для конструктора</p>
                </div>
                <button
                  onClick={() => handleAddOption('toppings')}
                  className="px-2 py-1 bg-coffee-dark text-white text-[10px] font-bold rounded flex items-center gap-1 cursor-pointer hover:bg-coffee-dark/95"
                  style={{ borderRadius: '6px' }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Додати топінг</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {localData.toppings.map((top: any, idx: number) => (
                  <div key={top.id} className="bg-white/60 p-3 rounded-xl border border-coffee-milk/15 flex items-center justify-between gap-3" style={{ borderRadius: '12px' }}>
                    <div className="flex gap-2 w-full">
                      <div className="w-2/3">
                        <label className="text-[8px] text-coffee-dark/50 font-bold block">Назва</label>
                        <input
                          type="text"
                          value={top.label}
                          onChange={(e) => handleUpdateOption('toppings', idx, 'label', e.target.value)}
                          className="w-full bg-white border border-coffee-milk/20 px-1.5 py-0.5 text-xs font-semibold text-coffee-dark rounded"
                        />
                      </div>
                      <div className="w-1/3">
                        <label className="text-[8px] text-coffee-dark/50 font-bold block">Ціна (+₴)</label>
                        <input
                          type="number"
                          value={top.price || 0}
                          onChange={(e) => handleUpdateOption('toppings', idx, 'price', parseInt(e.target.value) || 0)}
                          className="w-full bg-white border border-coffee-milk/20 px-1.5 py-0.5 text-xs font-semibold text-coffee-dark rounded"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveOption('toppings', idx)}
                      className="text-coffee-dark/40 hover:text-red-500 mt-3 p-1 rounded hover:bg-red-50 transition-colors cursor-pointer"
                      title="Видалити"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. Texts Panel */}
        {activeTab === 'texts' && (
          <div className="flex flex-col gap-6">
            <div className="border-b border-coffee-milk/10 pb-4">
              <h3 className="font-serif text-lg font-bold text-coffee-dark">Редагування текстового контенту</h3>
              <p className="text-xs text-coffee-dark/60 mt-0.5">Змінюйте тексти, заголовки, слогани на головній сторінці, у розділі "Про нас", тощо.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Hero Texts */}
              <div className="bg-white/60 border border-coffee-milk/15 rounded-2xl p-5 flex flex-col gap-4 text-left" style={{ borderRadius: '18px' }}>
                <h4 className="font-serif text-sm font-bold text-coffee-accent border-b border-coffee-milk/10 pb-2 flex items-center gap-1.5">
                  <Coffee className="w-4 h-4" />
                  Головний банер (Hero)
                </h4>

                <div>
                  <label className="text-[9px] font-bold text-coffee-dark/60 block mb-1">Міні-тег над заголовком</label>
                  <input
                    type="text"
                    value={localData.texts.heroMiniTag}
                    onChange={(e) => updateTextField('heroMiniTag', e.target.value)}
                    className="w-full bg-white border border-coffee-milk/25 px-2.5 py-1.5 text-xs font-semibold text-coffee-dark rounded-lg"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold text-coffee-dark/60 block mb-1">Головний заголовок</label>
                  <input
                    type="text"
                    value={localData.texts.heroTitle}
                    onChange={(e) => updateTextField('heroTitle', e.target.value)}
                    className="w-full bg-white border border-coffee-milk/25 px-2.5 py-1.5 text-xs font-semibold text-coffee-dark rounded-lg"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold text-coffee-dark/60 block mb-1">Підзаголовок сайту</label>
                  <textarea
                    value={localData.texts.heroSubtitle}
                    onChange={(e) => updateTextField('heroSubtitle', e.target.value)}
                    rows={3}
                    className="w-full bg-white border border-coffee-milk/25 px-2.5 py-1.5 text-xs font-semibold text-coffee-dark rounded-lg resize-none"
                  />
                </div>
              </div>

              {/* About Section Texts */}
              <div className="bg-white/60 border border-coffee-milk/15 rounded-2xl p-5 flex flex-col gap-4 text-left" style={{ borderRadius: '18px' }}>
                <h4 className="font-serif text-sm font-bold text-coffee-accent border-b border-coffee-milk/10 pb-2 flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  Про нас (About)
                </h4>

                <div>
                  <label className="text-[9px] font-bold text-coffee-dark/60 block mb-1">Міні-тег</label>
                  <input
                    type="text"
                    value={localData.texts.aboutTag}
                    onChange={(e) => updateTextField('aboutTag', e.target.value)}
                    className="w-full bg-white border border-coffee-milk/25 px-2.5 py-1.5 text-xs font-semibold text-coffee-dark rounded-lg"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold text-coffee-dark/60 block mb-1">Головний заголовок блоку</label>
                  <input
                    type="text"
                    value={localData.texts.aboutTitle}
                    onChange={(e) => updateTextField('aboutTitle', e.target.value)}
                    className="w-full bg-white border border-coffee-milk/25 px-2.5 py-1.5 text-xs font-semibold text-coffee-dark rounded-lg"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold text-coffee-dark/60 block mb-1">Перший абзац тексту</label>
                  <textarea
                    value={localData.texts.aboutText1}
                    onChange={(e) => updateTextField('aboutText1', e.target.value)}
                    rows={3}
                    className="w-full bg-white border border-coffee-milk/25 px-2.5 py-1.5 text-xs font-semibold text-coffee-dark rounded-lg resize-none"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold text-coffee-dark/60 block mb-1">Другий абзац тексту</label>
                  <textarea
                    value={localData.texts.aboutText2}
                    onChange={(e) => updateTextField('aboutText2', e.target.value)}
                    rows={3}
                    className="w-full bg-white border border-coffee-milk/25 px-2.5 py-1.5 text-xs font-semibold text-coffee-dark rounded-lg resize-none"
                  />
                </div>
              </div>

              {/* Menu & Beans Titles */}
              <div className="bg-white/60 border border-coffee-milk/15 rounded-2xl p-5 flex flex-col gap-4 text-left md:col-span-2" style={{ borderRadius: '18px' }}>
                <h4 className="font-serif text-sm font-bold text-coffee-accent border-b border-coffee-milk/10 pb-2 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  Заголовки Меню та Зерен
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-bold text-coffee-dark/60 block mb-1">Меню: Міні-тег</label>
                    <input
                      type="text"
                      value={localData.texts.menuTag}
                      onChange={(e) => updateTextField('menuTag', e.target.value)}
                      className="w-full bg-white border border-coffee-milk/25 px-2.5 py-1.5 text-xs font-semibold text-coffee-dark rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-coffee-dark/60 block mb-1">Меню: Заголовок</label>
                    <input
                      type="text"
                      value={localData.texts.menuTitle}
                      onChange={(e) => updateTextField('menuTitle', e.target.value)}
                      className="w-full bg-white border border-coffee-milk/25 px-2.5 py-1.5 text-xs font-semibold text-coffee-dark rounded-lg"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[9px] font-bold text-coffee-dark/60 block mb-1">Меню: Опис / Підзаголовок</label>
                    <input
                      type="text"
                      value={localData.texts.menuSubtitle}
                      onChange={(e) => updateTextField('menuSubtitle', e.target.value)}
                      className="w-full bg-white border border-coffee-milk/25 px-2.5 py-1.5 text-xs font-semibold text-coffee-dark rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-coffee-dark/60 block mb-1">Зерна: Міні-тег</label>
                    <input
                      type="text"
                      value={localData.texts.beansTag}
                      onChange={(e) => updateTextField('beansTag', e.target.value)}
                      className="w-full bg-white border border-coffee-milk/25 px-2.5 py-1.5 text-xs font-semibold text-coffee-dark rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-coffee-dark/60 block mb-1">Зерна: Заголовок</label>
                    <input
                      type="text"
                      value={localData.texts.beansTitle}
                      onChange={(e) => updateTextField('beansTitle', e.target.value)}
                      className="w-full bg-white border border-coffee-milk/25 px-2.5 py-1.5 text-xs font-semibold text-coffee-dark rounded-lg"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[9px] font-bold text-coffee-dark/60 block mb-1">Зерна: Опис / Підзаголовок</label>
                    <input
                      type="text"
                      value={localData.texts.beansSubtitle}
                      onChange={(e) => updateTextField('beansSubtitle', e.target.value)}
                      className="w-full bg-white border border-coffee-milk/25 px-2.5 py-1.5 text-xs font-semibold text-coffee-dark rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. Images Panel */}
        {activeTab === 'images' && (
          <div className="flex flex-col gap-6">
            <div className="border-b border-coffee-milk/10 pb-4">
              <h3 className="font-serif text-lg font-bold text-coffee-dark">Налаштування фото та зображень</h3>
              <p className="text-xs text-coffee-dark/60 mt-0.5">Ви можете ввести URL-посилання або завантажити власні файли зображень безпосередньо з вашого пристрою</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Image Inputs */}
              <div className="flex flex-col gap-6 text-left bg-white/60 border border-coffee-milk/15 rounded-2xl p-5" style={{ borderRadius: '18px' }}>
                <ImageUploadZone 
                  id="heroBg"
                  label="Головне фото банера (Hero Background)"
                  value={localData.images.heroBg}
                  onChange={(val) => updateImageField('heroBg', val)}
                  onUpload={(file) => handleImageUpload('heroBg', file)}
                  isUploading={uploadingField === 'heroBg'}
                />

                <ImageUploadZone 
                  id="aboutImg"
                  label="Фото у блоці «Про нас» (About Photo)"
                  value={localData.images.aboutImg}
                  onChange={(val) => updateImageField('aboutImg', val)}
                  onUpload={(file) => handleImageUpload('aboutImg', file)}
                  isUploading={uploadingField === 'aboutImg'}
                />
              </div>

              <div className="flex flex-col gap-6 text-left bg-white/60 border border-coffee-milk/15 rounded-2xl p-5" style={{ borderRadius: '18px' }}>
                <ImageUploadZone 
                  id="beansBg"
                  label="Фонове фото для блоку «Кава в зернах»"
                  value={localData.images.beansBg}
                  onChange={(val) => updateImageField('beansBg', val)}
                  onUpload={(file) => handleImageUpload('beansBg', file)}
                  isUploading={uploadingField === 'beansBg'}
                />

                <ImageUploadZone 
                  id="beanPack"
                  label="Фото упаковки зерен (Bean Pack Image)"
                  value={localData.images.beanPack}
                  onChange={(val) => updateImageField('beanPack', val)}
                  onUpload={(file) => handleImageUpload('beanPack', file)}
                  isUploading={uploadingField === 'beanPack'}
                />
              </div>
            </div>
          </div>
        )}

        {/* 6. Credentials Panel */}
        {activeTab === 'credentials' && (
          <div className="flex flex-col gap-6 max-w-md mx-auto">
            <div className="border-b border-coffee-milk/10 pb-4 text-center">
              <h3 className="font-serif text-lg font-bold text-coffee-dark">Зміна облікових даних</h3>
              <p className="text-xs text-coffee-dark/60 mt-0.5">Встановіть новий логін та пароль для входу в панель адміністратора</p>
            </div>

            {credentialsStatus && (
              <div className={`p-4 rounded-2xl flex items-center gap-2.5 text-xs font-semibold border shadow-md ${
                credentialsStatus.success 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-100' 
                  : 'bg-red-50 text-red-800 border-red-100'
              }`} style={{ borderRadius: '16px' }}>
                {credentialsStatus.success ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
                <span>{credentialsStatus.message}</span>
              </div>
            )}

            <form onSubmit={handleSaveCredentials} className="flex flex-col gap-4 text-left bg-white/60 border border-coffee-milk/15 rounded-2xl p-5" style={{ borderRadius: '18px' }}>
              <div>
                <label className="text-[10px] font-bold text-coffee-dark/60 block mb-1">Новий логін (Username)</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-coffee-dark/40" />
                  <input
                    type="text"
                    required
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    className="w-full bg-white border border-coffee-milk/25 pl-10 pr-3 py-2 text-xs font-semibold text-coffee-dark rounded-xl"
                    style={{ borderRadius: '12px' }}
                    placeholder="Введіть новий логін"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-coffee-dark/60 block mb-1">Новий пароль (Password)</label>
                <div className="relative">
                  <Key className="absolute left-3 top-2.5 w-4 h-4 text-coffee-dark/40" />
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full bg-white border border-coffee-milk/25 pl-10 pr-3 py-2 text-xs font-semibold text-coffee-dark rounded-xl"
                    style={{ borderRadius: '12px' }}
                    placeholder="Введіть новий пароль"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="tactile-btn mt-2 w-full py-3 rounded-xl bg-coffee-dark hover:bg-coffee-dark/95 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                style={{ borderRadius: '12px' }}
              >
                <Save className="w-4 h-4" />
                <span>{isLoading ? "Збереження..." : "Зберегти нові дані"}</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
