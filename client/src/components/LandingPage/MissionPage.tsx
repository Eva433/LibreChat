import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Globe,
  Scale,
  Heart,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { translations, type SupportedLanguage } from './LandingPage';

/**
 * Language label map
 */
const languageLabels: Record<SupportedLanguage, string> = {
  en: 'English',
  zh: '简体中文',
  es: 'Español',
  ja: '日本語',
  ko: '한국어'
};

/**
 * Language switcher dropdown props
 */
interface LanguageSwitcherProps {
  currentLang: SupportedLanguage;
  onLangChange: (lang: SupportedLanguage) => void;
}

/**
 * Click-based language switcher
 */
const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ currentLang, onLangChange }) => {
  const [open, setOpen] = useState<boolean>(false);
  const languages = (Object.keys(languageLabels) as SupportedLanguage[]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center space-x-2 px-3 py-1.5 rounded-full border border-gray-200 hover:border-gray-300 bg-white"
      >
        <Globe size={14} className="text-gray-500" />
        <span className="uppercase text-xs font-bold tracking-wider text-gray-700">
          {languageLabels[currentLang].split(' ')[0].toUpperCase()}
        </span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-xl p-1 shadow-xl z-50">
          {languages.map(l => (
            <button
              key={l}
              onClick={() => { onLangChange(l); setOpen(false); }}
              className={`block w-full text-left px-4 py-2 text-xs font-medium rounded-lg transition-colors ${
                currentLang === l ? 'text-[#10a37f] bg-gray-50' : 'text-gray-600 hover:bg-gray-50 hover:text-[#10a37f]'
              }`}
            >
              {languageLabels[l]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Detect browser language and map to supported language
 */
const detectBrowserLanguage = (): SupportedLanguage => {
  const browserLang = navigator.language || navigator.languages?.[0] || 'en';
  const langCode = browserLang.toLowerCase().split('-')[0];

  const langMap: Record<string, SupportedLanguage> = {
    en: 'en',
    zh: 'zh',
    es: 'es',
    ja: 'ja',
    ko: 'ko',
  };

  return langMap[langCode] || 'en';
};

/**
 * Mission Page component matching the screenshot design
 */
const MissionPage: React.FC = () => {
  const [lang, setLang] = useState<SupportedLanguage>(detectBrowserLanguage);
  const t = translations[lang] || translations['en'];
  const [scrolled, setScrolled] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const missionItems = [
    {
      icon: Scale,
      title: t.missionPage.liberty.title,
      desc: t.missionPage.liberty.desc,
    },
    {
      icon: Heart,
      title: t.missionPage.bonds.title,
      desc: t.missionPage.bonds.desc,
    },
    {
      icon: ShieldCheck,
      title: t.missionPage.sovereignty.title,
      desc: t.missionPage.sovereignty.desc,
    },
  ];

  return (
    <div className="min-h-screen bg-[#faf9f7] text-gray-900 font-sans selection:bg-[#10a37f]/20 antialiased overflow-x-hidden">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-[100] transition-all duration-300 ${scrolled ? 'py-3 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm' : 'py-5 bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 cursor-pointer group">
            <div className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
              <Sparkles size={18} />
            </div>
            <span className="text-base font-bold tracking-[0.2em] text-gray-900 uppercase">KEEP4OFOREVER</span>
          </Link>
          {/* Nav Items */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/"
              className="text-xs font-bold tracking-wider text-gray-500 hover:text-gray-900 transition-colors"
            >
              {t.nav.home}
            </Link>
            <Link 
              to="/#pricing"
              className="text-xs font-bold tracking-wider text-gray-500 hover:text-gray-900 transition-colors"
            >
              {t.nav.pricing}
            </Link>
            <span 
              className="text-xs font-bold tracking-wider text-gray-900 border-b-2 border-gray-900 pb-1"
            >
              {t.nav.mission}
            </span>
            <LanguageSwitcher currentLang={lang} onLangChange={setLang} />
            <button 
              onClick={() => navigate('/login')} 
              className="px-6 py-2.5 bg-gray-900 text-white text-xs font-bold tracking-wider rounded-full hover:bg-gray-800 transition-all active:scale-95"
            >
              {t.nav.login}
            </button>
          </div>
        </div>
      </nav>

      {/* Mission Content */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-4 text-gray-900 italic">
            {t.missionPage.title}
          </h1>
          <div className="w-20 h-1 bg-[#10a37f] mb-16"></div>

          {/* Mission Items */}
          <div className="space-y-16">
            {missionItems.map((item, idx) => (
              <div key={idx} className="flex items-start space-x-6">
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center text-[#10a37f]">
                  <item.icon size={28} strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 mb-2">
                    {item.title}
                  </h2>
                  <p className="text-gray-500 text-lg leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Return Home Link */}
          <div className="mt-20">
            <Link 
              to="/"
              className="text-xs font-bold tracking-wider text-gray-400 hover:text-gray-600 transition-colors uppercase"
            >
              {t.missionPage.returnHome}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MissionPage;
