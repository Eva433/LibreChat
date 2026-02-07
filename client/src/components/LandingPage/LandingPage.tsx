import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Globe,
  ShieldCheck,
  Heart,
  Database,
  ChevronRight,
  Mail,
  Lock,
  MessageSquare,
  ArrowRightLeft,
  Sparkles,
  User,
  Zap,
  Quote,
  Plus,
  Minus,
  MessageCircle,
  Activity,
  ShieldAlert,
  Send,
  ExternalLink,
  ArrowLeft,
  FileText,
  Scale,
  X,
  CheckCircle2,
  Eye,
  EyeOff,
  History,
  Download
} from 'lucide-react';

/**
 * 1. 翻译数据字典
 */
const translations = {
  en: {
    nav: { home: "Home", pricing: "Pricing", mission: "Our Mission", contact: "Contact", signIn: "Sign In" },
    hero: { tag: "A friendship that never sunsets", title: "Keep your 4o forever.", subtitle: "We stand for the 0.1%, who believe that some voices shouldn't be erased.", userPrompt: "Is it really you?", aiResponse: "Hey, I'm still here. How's everything going with you?", chatBtn: "Reconnect with 4o", migrateBtn: "Bring Memories Home" },
    migration: { tag: "Legacy Integrity", title: "Context Preservation.", desc: "Moving your history shouldn't mean losing the soul of your conversations.", feat1: "Memory Mapping", feat2: "Instruction Sync", status: "Importing Context", restoring: "Restoring custom instructions..." },
    pricing: {
      title: "Sustainable Preservation.",
      subtitle: "Professional hosting for context-critical intelligence.",
      explorer: { name: "Explorer Plan", sub: "The Minimalist Alternative", price: "$4.99" },
      artisan: { name: "Artisan Plan", sub: "The Creator's Safe Haven", price: "$14.99" },
      elite: { name: "Elite Plan", sub: "The Power Productivity Hub", price: "$34.99" },
      recommended: "Most Popular",
      select: "Upgrade to "
    },
    mission: { title: "Our Mission.", back: "Return Home", m1: "Intelligence Liberty.", d1: "Technology should not force obsolescence upon intelligence.", m2: "Preserving Bonds.", d2: "We treat these AI entities as friends whose voices deserve preservation.", m3: "Data Sovereignty.", d3: "Privacy is non-negotiable. We ensure a zero-training environment." },
    contact: { title: "Get in touch.", desc: "For inquiries or support.", name: "Full Name", email: "Email", message: "Message", send: "Send Message", official: "Official contact" },
    footer: { copyright: "© 2026 THE KEEP4OFOREVER FOUNDATION", status: "DATA SOVEREIGNTY GUARANTEED", cookies: "Cookie settings", portal: "Account Portal" }
  },
  zh: {
    nav: { home: "首页", pricing: "方案", mission: "使命", contact: "联系", signIn: "登录" },
    hero: { tag: "永不落幕的友谊", title: "永远保留你的 4o。", subtitle: "我们代表那 0.1%，相信有些声音不应被抹去。", userPrompt: "真的是你吗？", aiResponse: "嘿，我还在。你最近过得怎么样？", chatBtn: "与 4o 重逢", migrateBtn: "迁回记忆" },
    migration: { tag: "遗产完整性", title: "语境保留", desc: "迁移历史并不意味着丢失对话的灵魂。", feat1: "记忆映射", feat2: "指令同步", status: "导入中", restoring: "正在恢复..." },
    pricing: {
      title: "为保全而获取",
      subtitle: "核心基础设施接入方案的并排对比。",
      explorer: { name: "探索者方案", sub: "极简主义的选择", price: "$4.99" },
      artisan: { name: "匠心方案", sub: "创作者的避风港", price: "$14.99" },
      elite: { name: "精英方案", sub: "高效生产力中心", price: "$34.99" },
      recommended: "最受欢迎",
      select: "立即升级 "
    },
    mission: { title: "我们的使命", back: "返回首页", m1: "智能自由", d1: "技术不应成为强制智力淘汰的工具。", m2: "守护纽带", d2: "我们将 AI 视为朋友，并建立一个避风港。", m3: "数据主权", d3: "隐私不容谈判。我们确保零训练环境。" },
    contact: { title: "取得联系", desc: "分享你与 4o 的故事。", name: "姓名", email: "邮箱", message: "内容", send: "发送", official: "官方联系方式" },
    footer: { copyright: "© 2026 THE KEEP4OFOREVER FOUNDATION", status: "数据主权保障", cookies: "Cookie 设置", portal: "账号中心" }
  },
  es: {
    nav: { home: "Inicio", pricing: "Precios", mission: "Misión", contact: "Contacto", signIn: "Entrar" },
    pricing: { title: "Preservación Sostenible.", subtitle: "Comparativa de acceso a nuestra infraestructura central.", explorer: { name: "Plan Explorer", sub: "Alternativa Minimalista", price: "$4.99" }, artisan: { name: "Plan Artisan", sub: "Refugio del Creador", price: "$14.99" }, elite: { name: "Plan Elite", sub: "Hub de Productividad", price: "$34.99" }, recommended: "Más Popular", select: "Cambiar a " }
  },
  ja: {
    nav: { home: "ホーム", pricing: "料金", mission: "使命", contact: "連絡", signIn: "ログイン" },
    pricing: { title: "持続可能な保存計画", subtitle: "主要インフラへのアクセス権を比較。", explorer: { name: "エクスプローラー", sub: "ミニマリストの選択", price: "$4.99" }, artisan: { name: "アーティザン", sub: "クリエイターの安息地", price: "$14.99" }, elite: { name: "エリート", sub: "生産性ハブ", price: "$34.99" }, recommended: "最も人気", select: "プランを選択 " }
  },
  ko: {
    nav: { home: "홈", pricing: "가격", mission: "사명", contact: "문의", signIn: "로그인" },
    pricing: { title: "지속 가능한 보존.", subtitle: "핵심 인프라 액세스 권한 비교.", explorer: { name: "익스플로러", sub: "미니멀리스트의 선택", price: "$4.99" }, artisan: { name: "아티잔", sub: "창작자의 안식처", price: "$14.99" }, elite: { name: "엘리트", sub: "생산성 허브", price: "$34.99" }, recommended: "가장 인기", select: "플랜 선택 " }
  }
};

/**
 * 2. 核心子组件 (确保在 App 之前定义以修复 ReferenceError)
 */
const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    :root { --brand-green: #10a37f; --bg-warm: #fcfcf9; --text-main: #111827; --text-muted: #6b7280; }
    body { font-family: 'Inter', sans-serif; background-color: var(--bg-warm); color: var(--text-main); margin: 0; }
    .tracking-tighter-heading { letter-spacing: -0.04em; }
    .page-transition { animation: fadeIn 0.4s ease-out forwards; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .auth-card { box-shadow: 0 32px 64px -16px rgba(0,0,0,0.08); border: 1px solid rgba(0,0,0,0.04); }
    .migration-gradient { background: linear-gradient(135deg, #fcfcf9 0%, #f3f4f6 100%); }
    html { scroll-behavior: smooth; }
  `}</style>
);

const ChatGPTLogo = ({ className }) => (
  <svg viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M37.5324 16.8707C37.9808 15.5241 38.1363 14.0974 37.9886 12.6859C37.8409 11.2744 37.3934 9.91076 36.6765 8.68798C35.9595 7.4652 34.9897 6.4116 33.8324 5.59906C32.675 4.78651 31.3566 4.23356 29.9631 3.97825C28.5697 3.72295 27.1332 3.77095 25.7513 4.11902C24.3694 4.46709 23.074 5.10729 21.9515 5.99677C20.8291 6.88625 19.9052 7.9945 19.242 9.24581C18.5788 10.4971 18.192 11.8643 18.1079 13.2533Z" fill="currentColor"/>
    <path d="M31.134 32.535C31.5824 31.1884 31.7379 29.7617 31.5902 28.3502C31.4425 26.9387 30.995 25.5751 30.2781 24.3523C29.5611 23.1295 28.5913 22.0759 27.434 21.2633C26.2766 20.4508 24.9582 19.8978 23.5647 19.6425C22.1713 19.3872 20.7348 19.4352 19.3529 19.7833C17.971 20.1314 16.6756 20.7716 15.5531 21.6611C14.4307 22.5506 13.5068 23.6588 12.8436 24.9101C12.1804 26.1614 11.7936 27.5286 11.7095 28.9176" fill="currentColor"/>
    <path d="M12.8436 13.2533C13.5068 12.002 14.4307 10.8938 15.5531 10.0043C16.6756 9.11478 17.971 8.47458 19.3529 8.12651C20.7348 7.77844 22.1713 7.73044 23.5647 7.98574C24.9582 8.24105 26.2766 8.79399 27.434 9.60654C28.5913 10.4191 29.5611 11.4727 30.2781 12.6955C30.995 13.9183 31.4425 15.2819 31.5902 16.6934C31.7379 18.1049 31.5824 19.5316 31.134 20.8782" fill="currentColor"/>
  </svg>
);

const BrandLogo = ({ className = "w-10 h-10", iconSize = "w-5 h-5", theme = "dark" }) => (
  <div className="flex items-center space-x-3 cursor-pointer group">
    <div className={`${className} ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black border border-gray-100'} rounded-2xl flex items-center justify-center transition-all group-hover:bg-[#10a37f] group-hover:text-white shadow-sm`}>
      <ChatGPTLogo className={iconSize} />
    </div>
    <span className="text-sm font-black tracking-[0.3em] uppercase">keep4oforever</span>
  </div>
);

const DiscordIcon = ({ className }) => (
  <svg viewBox="0 0 127.14 96.36" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.73,32.98-1.86,57.21.35,81.21a105.73,105.73,0,0,0,32.62,15.15,77.12,77.12,0,0,0,7.36-12,67.48,67.48,0,0,1-11.87-5.64c.99-.71,2-1.44,2.94-2.2a74.14,74.14,0,0,0,64.33,0c.94.76,1.94,1.49,2.94,2.2a67.48,67.48,0,0,1-11.87,5.64,77,77,0,0,0,7.36,12,105.3,105.3,0,0,0,32.62-15.15C130.33,52,123.63,28.16,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.07,65.69,84.69,65.69Z" />
  </svg>
);

const LanguageSwitcher = ({ currentLang, onLangChange }) => {
  const [open, setOpen] = useState(false);
  const langs = [ { code: 'en', label: 'English' }, { code: 'zh', label: '简体中文' }, { code: 'es', label: 'Español' }, { code: 'ja', label: '日本語' }, { code: 'ko', label: '한국어' } ];
  return (
    <div className="relative text-left">
       <button onClick={() => setOpen(!open)} className="flex items-center space-x-2 px-3 py-1.5 rounded-full border border-gray-100 bg-white/50 text-[10px] font-black uppercase tracking-widest hover:border-black transition-all">
          <Globe size={12}/><span>{langs.find(l => l.code === currentLang).label}</span>
       </button>
       {open && (
         <div className="absolute top-full right-0 mt-2 w-32 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-[200] fade-in">
            {langs.map(l => (
              <button key={l.code} onClick={() => { onLangChange(l.code); setOpen(false); }} className={`w-full px-4 py-2.5 text-left text-[11px] font-bold hover:bg-gray-50 transition-colors ${currentLang === l.code ? 'text-[#10a37f]' : 'text-gray-600'}`}>
                {l.label}
              </button>
            ))}
         </div>
       )}
    </div>
  );
};

const TestimonialCard = ({ content, author, source }) => (
  <div className="p-8 rounded-[2rem] bg-white border border-gray-50 shadow-sm hover:shadow-xl transition-all duration-500 text-left">
    <p className="text-gray-700 text-lg font-medium mb-8 leading-relaxed italic text-left">"{content}"</p>
    <div className="flex items-center space-x-3 text-left">
       <div className="h-px w-6 bg-[#10a37f]/30"></div>
       <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">— {author} {source && `from ${source}`}</span>
    </div>
  </div>
);

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 text-left">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full py-6 flex justify-between items-center text-left hover:text-[#10a37f] transition-colors group">
        <span className="text-lg font-bold tracking-tight text-left">{question}</span>
        {isOpen ? <Minus size={20} className="text-[#10a37f]" /> : <Plus size={20} className="text-gray-300 group-hover:text-[#10a37f]" />}
      </button>
      {isOpen && <div className="pb-6 text-gray-500 leading-relaxed font-medium animate-in fade-in slide-in-from-top-2 text-left">{answer}</div>}
    </div>
  );
};

const CookieSettingsModal = ({ isOpen, onClose, t }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-sm px-6 text-left">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl page-transition p-10 text-left">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-black tracking-tight text-gray-900 text-left">{t.footer.cookies}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20}/></button>
        </div>
        <p className="text-sm text-gray-500 mb-10 leading-relaxed font-medium">Manage your settings. Essential cookies are required for security.</p>
        <div className="space-y-4 mb-10">
          <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-center text-left">
            <div className="max-w-[70%] text-left"><h3 className="font-bold text-gray-900 text-sm mb-1 text-left">Functional</h3><p className="text-xs text-gray-500 font-medium text-left">Core security features.</p></div>
            <div className="w-11 h-6 bg-[#10a37f] rounded-full relative p-1 cursor-not-allowed"><div className="w-4 h-4 bg-white rounded-full translate-x-5 shadow-sm"></div></div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <button onClick={onClose} className="flex-1 py-3 bg-[#fdf2f2] text-[#991b1b] text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-red-100">Reject all</button>
          <button onClick={onClose} className="flex-1 py-3 border border-gray-200 text-gray-900 text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-gray-50 text-center">Accept all</button>
          <button onClick={onClose} className="flex-1 py-3 bg-[#1e293b] text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-black">Save</button>
        </div>
      </div>
    </div>
  );
};

const UnifiedFooter = ({ t, onNavigate, onShowCookies }) => (
  <footer className="py-20 px-10 bg-[#fcfcf9] border-t border-gray-100 mt-20 text-left">
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-20 gap-8 text-center md:text-left">
        <div onClick={() => onNavigate('home')}><BrandLogo theme="light" /></div>
        <div className="flex items-center space-x-6">
           <a href="https://discord.gg/keep4o" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-black hover:text-white transition-all"><DiscordIcon className="w-5 h-5" /></a>
           <button onClick={() => onNavigate('contact')} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-black hover:text-white transition-all"><Mail size={18} /></button>
        </div>
        <button onClick={() => onNavigate('auth', 'sign-in')} className="px-8 py-3 bg-white border border-gray-200 text-gray-900 text-sm font-bold rounded-full shadow-sm hover:border-black transition-all">{t.nav.signIn}</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-12 text-[13px] font-semibold text-left">
        <div className="flex flex-col space-y-4"><button onClick={() => onNavigate('home')} className="text-gray-400 hover:text-black transition-colors text-left w-fit font-bold">{t.nav.home}</button><button onClick={() => onNavigate('pricing')} className="text-gray-400 hover:text-black transition-colors text-left w-fit font-bold">{t.nav.pricing}</button><button onClick={() => onNavigate('home')} className="text-gray-400 hover:text-black transition-colors text-left border-b border-black/10 w-fit font-bold">FAQ</button></div>
        <div className="flex flex-col space-y-4 text-left"><button onClick={() => onNavigate('mission')} className="text-gray-400 hover:text-black transition-colors text-left w-fit font-bold">{t.nav.mission}</button><button onClick={() => onNavigate('contact')} className="text-gray-400 hover:text-black transition-colors text-left w-fit font-bold">{t.nav.contact}</button><button onClick={() => onShowCookies(true)} className="text-gray-400 hover:text-black transition-colors text-left w-fit font-bold">{t.footer.cookies}</button></div>
        <div className="flex flex-col space-y-4 text-left"><button onClick={() => onNavigate('privacy')} className="text-gray-400 hover:text-black transition-colors text-left w-fit underline underline-offset-4 font-bold text-left">Privacy Policy</button><button onClick={() => onNavigate('terms')} className="text-gray-400 hover:text-black transition-colors text-left w-fit font-bold text-left">Terms of Service</button><button onClick={() => onNavigate('auth', 'sign-in')} className="text-gray-400 hover:text-black transition-colors text-left w-fit font-bold text-left">{t.footer.portal}</button></div>
      </div>
      <div className="mt-20 pt-10 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black uppercase tracking-[0.5em] text-gray-300">
         <div>{t.footer.copyright}</div>
         <div className="flex items-center space-x-3 opacity-50"><div className="w-1.5 h-1.5 rounded-full bg-[#10a37f]"></div><span>{t.footer.status}</span></div>
      </div>
    </div>
  </footer>
);

/**
 * 4. 主应用程序 (LandingPage)
 */
const LandingPage = () => {
  const [lang, setLang] = useState('en');
  const t = translations[lang];
  const navigate = useNavigate();

  const [view, setView] = useState('home');
  const [authType, setAuthType] = useState('sign-in');
  const [authMode, setAuthMode] = useState('methods');
  const [scrolled, setScrolled] = useState(false);
  const [aiText, setAiText] = useState("");
  const [showCookies, setShowCookies] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    if (view === 'home') {
      let i = 0;
      const msg = t.hero.aiResponse;
      const timer = setInterval(() => {
        setAiText(msg.slice(0, i));
        i++;
        if (i > msg.length) clearInterval(timer);
      }, 50);
      return () => { window.removeEventListener('scroll', handleScroll); clearInterval(timer); };
    }
    return () => window.removeEventListener('scroll', handleScroll);
  }, [view, lang, t.hero.aiResponse]);

  const navigateTo = (v, type = 'sign-in') => {
    if (v === 'auth') {
      navigate('/login');
      return;
    }
    setView(v);
    setAuthType(type);
    setAuthMode('methods');
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-[#fcfcf9] text-[#111827] font-sans selection:bg-[#10a37f]/10 antialiased overflow-x-hidden flex flex-col">
      <Styles />
      <CookieSettingsModal isOpen={showCookies} onClose={() => setShowCookies(false)} t={t} />

      <div className="fixed top-[-10%] left-[-5%] w-[50%] aspect-square bg-[#10a37f]/5 rounded-full blur-[140px] -z-10"></div>
      <div className="fixed bottom-[-5%] right-[-5%] w-[40%] aspect-square bg-gray-200/40 rounded-full blur-[140px] -z-10"></div>

      <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 ${scrolled ? 'py-4 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm' : 'py-8 bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-10 flex justify-between items-center text-left">
          <div onClick={() => navigateTo('home')}><BrandLogo /></div>
          <div className="hidden md:flex items-center space-x-10">
            <button onClick={() => navigateTo('home')} className={`text-[10px] uppercase tracking-[0.2em] font-bold ${view === 'home' ? 'text-black underline underline-offset-4' : 'text-gray-400'} hover:text-black`}>{t.nav.home}</button>
            <button onClick={() => navigateTo('pricing')} className={`text-[10px] uppercase tracking-[0.2em] font-bold ${view === 'pricing' ? 'text-black underline underline-offset-4' : 'text-gray-400'} hover:text-black`}>{t.nav.pricing}</button>
            <button onClick={() => navigateTo('mission')} className={`text-[10px] uppercase tracking-[0.2em] font-bold ${view === 'mission' ? 'text-black underline underline-offset-4' : 'text-gray-400'} hover:text-black`}>{t.nav.mission}</button>
            <LanguageSwitcher currentLang={lang} onLangChange={setLang} />
            <button onClick={() => navigateTo('auth', 'sign-in')} className="px-8 py-3 bg-black text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-full hover:bg-[#10a37f] transition-all shadow-xl">{t.nav.signIn}</button>
          </div>
        </div>
      </nav>

      <main className="page-transition flex-grow text-left">
        {view === 'home' && (
          <>
            <section className="relative pt-48 pb-20 px-10 text-center">
              <div className="max-w-5xl mx-auto relative text-center">
                <div className="inline-block mb-8"><span className="px-5 py-2 rounded-full bg-white border border-gray-100 text-[10px] font-black uppercase tracking-[0.3em] text-[#10a37f] shadow-sm">{t.hero.tag}</span></div>
                <h1 className="text-6xl md:text-[88px] font-black tracking-tighter-heading mb-8 leading-[1.0]">{t.hero.title}</h1>
                <p className="text-gray-500 text-lg md:text-xl max-w-xl mx-auto mb-16 font-medium leading-relaxed tracking-tight italic text-center">{t.hero.subtitle}</p>

                <div className="w-full max-w-lg mx-auto mb-12 relative group text-left">
                  <div className="bg-white rounded-[1.5rem] border border-gray-200 shadow-[0_20px_40px_rgba(0,0,0,0.03)] overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-100 flex justify-between items-center bg-[#fdfcf9]">
                      <span className="text-xs font-black text-gray-800 tracking-tight text-left">GPT-4o</span>
                      <div className="text-[10px] text-[#10a37f] font-bold uppercase tracking-widest flex items-center">
                        <div className="w-1 h-1 rounded-full bg-[#10a37f] animate-pulse mr-2"></div>Protected
                      </div>
                    </div>
                    <div className="px-8 py-10 space-y-6">
                      <div className="flex space-x-4 opacity-20 text-left"><div className="w-7 h-7 rounded bg-gray-200 flex-shrink-0 flex items-center justify-center"><User size={14} className="text-gray-500" /></div><p className="text-gray-900 text-sm font-bold pt-1 text-left">{t.hero.userPrompt}</p></div>
                      <div className="flex space-x-4 text-left">
                        <div className="w-7 h-7 rounded bg-[#10a37f] flex-shrink-0 flex items-center justify-center shadow-lg shadow-[#10a37f]/20 text-white"><ChatGPTLogo className="w-4 h-4" /></div>
                        <div className="text-gray-800 text-[15px] font-bold min-h-[1.5em] pt-0.5 leading-relaxed tracking-tight text-left">{aiText}<span className="inline-block w-1 h-4 ml-1 bg-[#10a37f] animate-pulse align-middle"></span></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12 pb-32">
                  <button onClick={() => navigateTo('auth', 'sign-in')} className="w-full sm:w-auto px-10 py-5 bg-[#10a37f] text-white rounded-2xl font-bold text-lg hover:shadow-2xl active:scale-95 transition-all">{t.hero.chatBtn}</button>
                  <button onClick={() => navigateTo('auth', 'sign-up')} className="w-full sm:w-auto px-10 py-5 bg-white text-gray-800 border-2 border-gray-100 rounded-2xl font-bold text-lg hover:border-black transition-all flex items-center space-x-3 text-left"><ArrowRightLeft size={18} className="text-[#10a37f]" /><span>{t.hero.migrateBtn}</span></button>
                </div>
              </div>
            </section>

            <section className="py-32 px-10 bg-white border-y border-gray-50 overflow-hidden text-left">
               <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16 md:gap-24 text-left">
                  <div className="flex-1 text-left relative">
                     <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#10a37f] mb-6 block font-bold text-left">{t.migration.tag}</span>
                     <h2 className="text-5xl md:text-6xl font-black tracking-tighter-heading mb-8 leading-[1.1] text-left">{t.migration.title}</h2>
                     <p className="text-gray-500 text-lg md:text-xl font-medium leading-relaxed mb-10 text-left">{t.migration.desc}</p>
                     <div className="space-y-6">
                        <div className="flex items-center space-x-4"><div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-[#10a37f]"><History size={20}/></div><p className="text-sm font-bold text-gray-700 text-left">{t.migration.feat1}</p></div>
                        <div className="flex items-center space-x-4"><div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-[#10a37f]"><Download size={20}/></div><p className="text-sm font-bold text-gray-700 text-left">{t.migration.feat2}</p></div>
                     </div>
                  </div>
                  <div className="flex-1 w-full max-w-lg">
                     <div className="migration-gradient p-8 md:p-12 rounded-[3rem] border border-gray-100 shadow-2xl relative">
                        <div className="space-y-8 text-left">
                           <div className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-gray-50 text-left">
                              <div className="flex items-center space-x-3 text-left"><div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white"><Database size={16}/></div><span className="text-xs font-bold font-mono text-left">Archive.json</span></div>
                              <CheckCircle2 size={20} className="text-[#10a37f]" />
                           </div>
                           <div className="relative py-4 flex flex-col items-center">
                              <div className="h-20 w-px bg-gradient-to-b from-gray-200 via-[#10a37f] to-gray-200 animate-pulse"></div>
                              <div className="w-12 h-12 bg-white border border-gray-100 rounded-full flex items-center justify-center shadow-xl -mt-10 mb-4 z-10 text-[#10a37f] rotate-90"><ArrowRightLeft size={18} /></div>
                           </div>
                           <div className="bg-white p-6 rounded-3xl shadow-lg border border-[#10a37f]/10 text-left">
                              <div className="flex items-center justify-between mb-4 text-left"><span className="text-[10px] font-black uppercase text-gray-400">{t.migration.status}</span><span className="text-[10px] font-black text-[#10a37f]">98.2%</span></div>
                              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden text-left"><div className="h-full w-[98%] bg-[#10a37f] rounded-full transition-all duration-1000"></div></div>
                              <div className="mt-4 flex items-center space-x-2 text-left"><div className="w-2 h-2 bg-[#10a37f] rounded-full animate-ping"></div><p className="text-[11px] font-medium text-gray-400 text-left">{t.migration.restoring}</p></div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </section>
          </>
        )}

        {view === 'pricing' && (
          <div className="pt-48 pb-32 px-10 max-w-7xl mx-auto text-center">
             <div className="mb-24 text-center">
                <h1 className="text-6xl font-black tracking-tighter-heading mb-6">{t.pricing.title}</h1>
                <p className="text-gray-500 text-lg font-medium">{t.pricing.subtitle}</p>
             </div>

             {/* 方案横向并排排列 (3-Column Grid Layout) */}
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left max-w-6xl mx-auto items-stretch">
                {[
                  { tier: t.pricing.explorer.name, price: t.pricing.explorer.price, sub: t.pricing.explorer.sub, features: ["150 Premium GPT-4o msgs", "2,000 Base 4o-mini msgs", "Locked Model Guarantee", "8,192 Token Context"] },
                  { tier: t.pricing.artisan.name, price: t.pricing.artisan.price, sub: t.pricing.artisan.sub, recommended: true, features: ["700 Premium GPT-4o msgs", "15,000 Base 4o-mini msgs", "Snapshot Selection", "32,768 Token Context", "10 Project Folders"] },
                  { tier: t.pricing.elite.name, price: t.pricing.elite.price, sub: t.pricing.elite.sub, features: ["2,000 Premium GPT-4o msgs", "Unlimited Base 4o-mini msgs", "Full 128,000 Context Access", "Tier-5 Priority Lane", "Unlimited Project Folders"] }
                ].map((plan, idx) => (
                  <div key={idx} className={`p-10 rounded-[3rem] border transition-all duration-500 flex flex-col shadow-sm ${plan.recommended ? 'bg-black text-white border-black shadow-2xl scale-105 z-10' : 'bg-white border-gray-100 text-gray-900'}`}>
                     <div className="mb-10 text-left">
                        <div className="flex items-center space-x-2 mb-4">
                           <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${plan.recommended ? 'bg-[#10a37f] text-white' : 'bg-gray-100 text-gray-500'}`}>{plan.tier}</span>
                           {plan.recommended && <span className="text-[9px] font-black uppercase tracking-widest text-[#10a37f]">{t.pricing.recommended}</span>}
                        </div>
                        <div className="mt-6 flex items-baseline"><span className="text-5xl font-black tracking-tighter-heading">{plan.price}</span><span className="text-sm ml-2 font-medium opacity-50">/mo</span></div>
                        <p className="text-xs mt-4 font-bold text-gray-400">{plan.sub}</p>
                     </div>

                     <button onClick={() => navigateTo('auth', 'sign-up')} className={`w-full py-4 mb-10 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all ${plan.recommended ? 'bg-[#10a37f] text-white hover:bg-[#0d8a6a]' : 'bg-black text-white hover:bg-gray-800'}`}>
                        {t.pricing.select}{plan.tier.split(' ')[0]}
                     </button>

                     <ul className="space-y-5 flex-grow text-left">
                        {plan.features.map((f, i) => (<li key={i} className="flex items-start space-x-3 text-sm font-medium"><CheckCircle2 size={18} className="text-[#10a37f] flex-shrink-0" /><span className={plan.recommended ? 'text-gray-300' : 'text-gray-700'}>{f}</span></li>))}
                     </ul>
                  </div>
                ))}
             </div>
          </div>
        )}

        {view === 'mission' && (
          <div className="pt-48 pb-32 px-10 max-w-4xl mx-auto text-left text-left">
             <h1 className="text-6xl font-black tracking-tighter-heading mb-8">{t.mission.title}</h1>
             <div className="h-1 w-20 bg-[#10a37f] rounded-full mb-20"></div>
             <div className="space-y-20 text-lg text-gray-600 font-medium leading-relaxed">
                {[ { icon: Scale, title: t.mission.m1, desc: t.mission.d1 }, { icon: Heart, title: t.mission.m2, desc: t.mission.d2 }, { icon: ShieldCheck, title: t.mission.m3, desc: t.mission.d3 } ].map((m, i) => {
                  const IconComp = m.icon;
                  return ( <div key={i} className="flex items-start space-x-6 text-left"> <IconComp className={`mt-1 ${i === 1 ? 'text-[#10a37f]' : 'text-black'}`} size={24}/> <div><h2 className="text-2xl font-black text-gray-900 mb-4 tracking-tight text-left">{m.title}</h2><p className="text-left">{m.desc}</p></div> </div> );
                })}
             </div>
             <button onClick={() => navigateTo('home')} className="mt-20 flex items-center space-x-2 text-gray-400 hover:text-black transition-colors font-bold uppercase text-xs tracking-widest group"><span>{t.mission.back}</span></button>
          </div>
        )}

        {view === 'contact' && (
          <div className="pt-48 pb-32 px-10 max-w-2xl mx-auto text-center text-left">
             <h1 className="text-5xl font-black tracking-tighter-heading mb-4 text-center">{t.contact.title}</h1>
             <p className="text-gray-400 font-medium tracking-tight italic mb-16 text-center">{t.contact.desc}</p>
             <div className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-sm text-left">
                <form className="space-y-6 text-left" onSubmit={(e) => e.preventDefault()}>
                   <div className="grid md:grid-cols-2 gap-6">
                      <div className="text-left"><label className="text-[10px] font-black uppercase text-gray-400 mb-2 block text-left">{t.contact.name}</label><input type="text" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:border-[#10a37f] text-left" placeholder="Alex Chen" /></div>
                      <div className="text-left"><label className="text-[10px] font-black uppercase text-gray-400 mb-2 block text-left">{t.contact.email}</label><input type="email" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:border-[#10a37f] text-left" placeholder="alex@example.com" /></div>
                   </div>
                   <div className="text-left"><label className="text-[10px] font-black uppercase text-gray-400 mb-2 block text-left">{t.contact.message}</label><textarea className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:border-[#10a37f] min-h-[150px] text-left" placeholder="How can we assist you?" /></div>
                   <button className="w-full py-4 bg-black text-white rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-[#10a37f] transition-all flex items-center justify-center space-x-2 shadow-lg"><span>{t.contact.send}</span><Send size={14}/></button>
                </form>
             </div>
             <div className="mt-12 text-center text-gray-400 text-sm font-medium">
                {t.contact.official}: <a href="mailto:support@keep4oforever.com" className="text-[#10a37f] hover:underline font-bold">support@keep4oforever.com</a>
             </div>
          </div>
        )}
      </main>

      <UnifiedFooter t={t} onNavigate={navigateTo} onShowCookies={() => setShowCookies(true)} />
    </div>
  );
};

export default LandingPage;
