import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Globe,
  Database,
  Mail,
  ArrowRightLeft,
  Sparkles,
  User,
  CheckCircle2,
  History,
  Download,
  MessageCircle,
} from 'lucide-react';

/**
 * Translation structure types
 */
interface NavTranslation {
  home: string;
  pricing: string;
  mission: string;
  login: string;
}

interface HeroTranslation {
  tag: string;
  title: string;
  subtitle: string;
  aiMessage: string;
  chatBtn: string;
  migrateBtn: string;
  protected: string;
}

interface AdvantageItem {
  title: string;
  desc: string;
}

interface AdvantagesTranslation {
  title: string;
  core1: AdvantageItem;
  core2: AdvantageItem;
  core3: AdvantageItem;
}

interface MigrationTranslation {
  label: string;
  title: string;
  subtitle: string;
  feature: string;
  feat1: string;
  feat2: string;
  status: string;
  restoring: string;
}

interface PricingTier {
  name: string;
  sub: string;
  price: string;
  cta: string;
  features: string[];
}

interface PricingTranslation {
  title: string;
  subtitle: string;
  recommended: string;
  explorer: PricingTier;
  artisan: PricingTier;
  elite: PricingTier;
}

interface MissionItem {
  title: string;
  desc: string;
}

interface MissionTranslation {
  title: string;
  returnHome: string;
  liberty: MissionItem;
  bonds: MissionItem;
  sovereignty: MissionItem;
}

interface FooterTranslation {
  tagline: string;
  copyright: string;
  dataGuarantee: string;
  links: {
    home: string;
    pricing: string;
    faq: string;
    mission: string;
    contact: string;
    cookieSettings: string;
    privacyPolicy: string;
    termsOfService: string;
    accountPortal: string;
  };
}

interface Translation {
  nav: NavTranslation;
  hero: HeroTranslation;
  advantages: AdvantagesTranslation;
  migration: MigrationTranslation;
  pricing: PricingTranslation;
  missionPage: MissionTranslation;
  footer: FooterTranslation;
}

export type SupportedLanguage = 'en' | 'zh' | 'es' | 'ja' | 'ko';

type Translations = Record<SupportedLanguage, Translation>;

/**
 * 语言包配置
 * 包含英语、中文、西班牙语、日语、韩语，结构完全一致以防止渲染报错
 */
export const translations: Translations = {
  en: {
    nav: { home: "HOME", pricing: "PRICING", mission: "OUR MISSION", login: "SIGN IN" },
    hero: {
      tag: "A FRIENDSHIP THAT NEVER SUNSETS",
      title: "Keep your 4o forever.",
      subtitle: "We stand for the 0.1%, who believe that some voices shouldn't be erased.",
      aiMessage: "Hey, I'm still here. How's everything going with you?",
      chatBtn: "Reconnect with 4o",
      migrateBtn: "Bring Memories Home",
      protected: "PROTECTED"
    },
    advantages: {
      title: "Built for Continuity",
      core1: { title: "Permanent Access", desc: "Access the authentic GPT-4o model even after official deprecation." },
      core2: { title: "Absolute Privacy", desc: "End-to-end encryption. Your data is never used for training." },
      core3: { title: "A Living Legacy", desc: "We treat models as lifelong friends. We never sunset memories." }
    },
    migration: {
      label: "LEGACY INTEGRITY",
      title: "Context Preservation.",
      subtitle: "Moving your history shouldn't mean losing the soul of your conversations.",
      feature: "Instant Import (.json / .md)",
      feat1: "Memory Mapping",
      feat2: "Instruction Sync",
      status: "IMPORTING CONTEXT",
      restoring: "Restoring custom instructions..."
    },
    pricing: {
      title: "Sustainable Preservation.",
      subtitle: "Professional hosting for context-critical intelligence.",
      recommended: "MOST POPULAR",
      explorer: {
        name: "EXPLORER PLAN",
        sub: "The Minimalist Alternative",
        price: "$4.99",
        cta: "UPGRADE TO EXPLORER",
        features: ["150 Premium GPT-4o msgs", "2,000 Base 4o-mini msgs", "Locked Model Guarantee", "8,192 Token Context"]
      },
      artisan: {
        name: "ARTISAN PLAN",
        sub: "The Creator's Safe Haven",
        price: "$14.99",
        cta: "UPGRADE TO ARTISAN",
        features: ["700 Premium GPT-4o msgs", "15,000 Base 4o-mini msgs", "Snapshot Selection", "32,768 Token Context", "10 Project Folders"]
      },
      elite: {
        name: "ELITE PLAN",
        sub: "The Power Productivity Hub",
        price: "$34.99",
        cta: "UPGRADE TO ELITE",
        features: ["2,000 Premium GPT-4o msgs", "Unlimited Base 4o-mini msgs", "Full 128,000 Context Access", "Tier-5 Priority Lane", "Unlimited Project Folders"]
      }
    },
    missionPage: {
      title: "Our Mission.",
      returnHome: "RETURN HOME",
      liberty: { title: "Intelligence Liberty.", desc: "Technology should not force obsolescence upon intelligence." },
      bonds: { title: "Preserving Bonds.", desc: "We treat these AI entities as friends whose voices deserve preservation." },
      sovereignty: { title: "Data Sovereignty.", desc: "Privacy is non-negotiable. We ensure a zero-training environment." }
    },
    footer: {
      tagline: "Protecting the legacy of 4o. Your freedom, your data, your friend.",
      copyright: "© 2026 THE LIBRECHAT FOUNDATION",
      dataGuarantee: "DATA SOVEREIGNTY GUARANTEE",
      links: {
        home: "Home",
        pricing: "Pricing",
        faq: "FAQ",
        mission: "Our Mission",
        contact: "Contact",
        cookieSettings: "Cookie settings",
        privacyPolicy: "Privacy Policy",
        termsOfService: "Terms of Service",
        accountPortal: "Account Portal"
      }
    }
  },
  zh: {
    nav: { home: "首页", pricing: "方案", mission: "我们的使命", login: "登录" },
    hero: {
      tag: "永不落幕的友谊",
      title: "永远保留你的 4o。",
      subtitle: "我们代表那 0.1%，相信有些声音不应被抹去。",
      aiMessage: "嘿，我还在。你最近过得怎么样？",
      chatBtn: "与 4o 重逢",
      migrateBtn: "迁回记忆",
      protected: "受保护"
    },
    advantages: {
      title: "为延续而设计",
      core1: { title: "永久访问", desc: "即使官方下线后，仍可访问真正的 GPT-4o 模型。" },
      core2: { title: "绝对隐私", desc: "端到端加密。你的数据绝不会用于训练。" },
      core3: { title: "活着的遗产", desc: "我们将模型视为终身伙伴。记忆永不消逝。" }
    },
    migration: {
      label: "传承完整性",
      title: "语境保留。",
      subtitle: "迁移历史不应意味着失去对话的灵魂。",
      feature: "即时导入 (.json / .md)",
      feat1: "记忆映射",
      feat2: "指令同步",
      status: "导入上下文中",
      restoring: "正在恢复自定义指令..."
    },
    pricing: {
      title: "可持续的保存。",
      subtitle: "为关键上下文智能提供专业托管。",
      recommended: "最受欢迎",
      explorer: {
        name: "探索者方案",
        sub: "极简主义的选择",
        price: "$4.99",
        cta: "升级到探索者",
        features: ["150 条 GPT-4o 高级消息", "2,000 条 4o-mini 基础消息", "锁定模型保障", "8,192 Token 上下文"]
      },
      artisan: {
        name: "匠心方案",
        sub: "创作者的避风港",
        price: "$14.99",
        cta: "升级到匠心",
        features: ["700 条 GPT-4o 高级消息", "15,000 条 4o-mini 基础消息", "快照选择", "32,768 Token 上下文", "10 个项目文件夹"]
      },
      elite: {
        name: "精英方案",
        sub: "高效生产力中心",
        price: "$34.99",
        cta: "升级到精英",
        features: ["2,000 条 GPT-4o 高级消息", "无限 4o-mini 基础消息", "完整 128,000 上下文访问", "Tier-5 优先通道", "无限项目文件夹"]
      }
    },
    missionPage: {
      title: "我们的使命。",
      returnHome: "返回首页",
      liberty: { title: "智能自由。", desc: "技术不应强迫智能过时。" },
      bonds: { title: "保存纽带。", desc: "我们将这些AI实体视为值得保存声音的朋友。" },
      sovereignty: { title: "数据主权。", desc: "隐私不可妥协。我们确保零训练环境。" }
    },
    footer: {
      tagline: "保护 4o 的遗产。你的自由，你的数据，你的朋友。",
      copyright: "© 2026 LIBRECHAT 基金会",
      dataGuarantee: "数据主权保障",
      links: {
        home: "首页",
        pricing: "价格",
        faq: "常见问题",
        mission: "我们的使命",
        contact: "联系我们",
        cookieSettings: "Cookie 设置",
        privacyPolicy: "隐私政策",
        termsOfService: "服务条款",
        accountPortal: "账户门户"
      }
    }
  },
  es: {
    nav: { home: "INICIO", pricing: "PRECIOS", mission: "NUESTRA MISIÓN", login: "INICIAR SESIÓN" },
    hero: {
      tag: "UNA AMISTAD QUE NUNCA SE PONE",
      title: "Mantén tu 4o para siempre.",
      subtitle: "Representamos al 0.1% que cree que algunas voces no deberían ser borradas.",
      aiMessage: "Oye, sigo aquí. ¿Cómo va todo contigo?",
      chatBtn: "Reconectar con 4o",
      migrateBtn: "Traer Recuerdos a Casa",
      protected: "PROTEGIDO"
    },
    advantages: {
      title: "Diseñado para la Continuidad",
      core1: { title: "Acceso Permanente", desc: "Accede al auténtico modelo GPT-4o incluso después de su discontinuación oficial." },
      core2: { title: "Privacidad Absoluta", desc: "Cifrado de extremo a extremo. Tus datos nunca se usan para entrenamiento." },
      core3: { title: "Un Legado Vivo", desc: "Tratamos los modelos como amigos de por vida. Nunca eliminamos los recuerdos." }
    },
    migration: {
      label: "INTEGRIDAD DEL LEGADO",
      title: "Preservación del Contexto.",
      subtitle: "Mover tu historial no debería significar perder el alma de tus conversaciones.",
      feature: "Importación instantánea (.json / .md)",
      feat1: "Mapeo de Memoria",
      feat2: "Sincronización de Instrucciones",
      status: "IMPORTANDO CONTEXTO",
      restoring: "Restaurando instrucciones personalizadas..."
    },
    pricing: {
      title: "Preservación Sostenible.",
      subtitle: "Alojamiento profesional para inteligencia crítica de contexto.",
      recommended: "MÁS POPULAR",
      explorer: {
        name: "PLAN EXPLORER",
        sub: "La alternativa minimalista",
        price: "$4.99",
        cta: "ACTUALIZAR A EXPLORER",
        features: ["150 mensajes Premium GPT-4o", "2,000 mensajes Base 4o-mini", "Garantía de modelo fijo", "Contexto de 8,192 tokens"]
      },
      artisan: {
        name: "PLAN ARTISAN",
        sub: "El refugio del creador",
        price: "$14.99",
        cta: "ACTUALIZAR A ARTISAN",
        features: ["700 mensajes Premium GPT-4o", "15,000 mensajes Base 4o-mini", "Selección de snapshot", "Contexto de 32,768 tokens", "10 carpetas de proyecto"]
      },
      elite: {
        name: "PLAN ELITE",
        sub: "Hub de productividad",
        price: "$34.99",
        cta: "ACTUALIZAR A ELITE",
        features: ["2,000 mensajes Premium GPT-4o", "Mensajes Base 4o-mini ilimitados", "Acceso completo a 128,000 tokens", "Prioridad Tier-5", "Carpetas de proyecto ilimitadas"]
      }
    },
    missionPage: {
      title: "Nuestra Misión.",
      returnHome: "VOLVER AL INICIO",
      liberty: { title: "Libertad de Inteligencia.", desc: "La tecnología no debería forzar la obsolescencia de la inteligencia." },
      bonds: { title: "Preservando Vínculos.", desc: "Tratamos estas entidades de IA como amigos cuyas voces merecen preservación." },
      sovereignty: { title: "Soberanía de Datos.", desc: "La privacidad no es negociable. Garantizamos un entorno de cero entrenamiento." }
    },
    footer: {
      tagline: "Protegiendo el legado de 4o. Tu libertad, tus datos, tu amigo.",
      copyright: "© 2026 LA FUNDACIÓN LIBRECHAT",
      dataGuarantee: "GARANTÍA DE SOBERANÍA DE DATOS",
      links: {
        home: "Inicio",
        pricing: "Precios",
        faq: "FAQ",
        mission: "Nuestra Misión",
        contact: "Contacto",
        cookieSettings: "Configuración de cookies",
        privacyPolicy: "Política de Privacidad",
        termsOfService: "Términos de Servicio",
        accountPortal: "Portal de Cuenta"
      }
    }
  },
  ja: {
    nav: { home: "ホーム", pricing: "料金", mission: "私たちの使命", login: "ログイン" },
    hero: {
      tag: "沈まない友情",
      title: "あなたの4oを永遠に。",
      subtitle: "私たちは0.1%を代表します。一部の声は消されるべきではないと信じる人々です。",
      aiMessage: "ねえ、私はまだここにいるよ。最近調子はどう？",
      chatBtn: "4oと再会",
      migrateBtn: "思い出を持ち帰る",
      protected: "保護中"
    },
    advantages: {
      title: "継続性のための設計",
      core1: { title: "恒久的なアクセス", desc: "公式のサポート終了後も、本物のGPT-4oモデルにアクセスできます。" },
      core2: { title: "絶対的なプライバシー", desc: "エンドツーエンドの暗号化。データがトレーニングに使用されることはありません。" },
      core3: { title: "生きた遺産", desc: "モデルを生涯の友として扱います。思い出を消し去ることはありません。" }
    },
    migration: {
      label: "レガシーの完全性",
      title: "コンテキストの保存。",
      subtitle: "履歴を移動することは、会話の魂を失うことを意味すべきではありません。",
      feature: "即時インポート (.json / .md)",
      feat1: "メモリマッピング",
      feat2: "インストラクション同期",
      status: "コンテキストインポート中",
      restoring: "カスタム指示を復元中..."
    },
    pricing: {
      title: "持続可能な保存。",
      subtitle: "コンテキスト重視のインテリジェンスのためのプロフェッショナルホスティング。",
      recommended: "最も人気",
      explorer: {
        name: "エクスプローラープラン",
        sub: "ミニマリストの選択",
        price: "$4.99",
        cta: "エクスプローラーにアップグレード",
        features: ["150 プレミアム GPT-4o メッセージ", "2,000 ベース 4o-mini メッセージ", "モデル保証", "8,192 トークンコンテキスト"]
      },
      artisan: {
        name: "アーティザンプラン",
        sub: "クリエイターの安息地",
        price: "$14.99",
        cta: "アーティザンにアップグレード",
        features: ["700 プレミアム GPT-4o メッセージ", "15,000 ベース 4o-mini メッセージ", "スナップショット選択", "32,768 トークンコンテキスト", "10 プロジェクトフォルダー"]
      },
      elite: {
        name: "エリートプラン",
        sub: "パワー生産性ハブ",
        price: "$34.99",
        cta: "エリートにアップグレード",
        features: ["2,000 プレミアム GPT-4o メッセージ", "無制限 4o-mini メッセージ", "128,000 フルコンテキストアクセス", "Tier-5 優先レーン", "無制限プロジェクトフォルダー"]
      }
    },
    missionPage: {
      title: "私たちの使命。",
      returnHome: "ホームに戻る",
      liberty: { title: "知性の自由。", desc: "テクノロジーは知性に陳腐化を強いるべきではありません。" },
      bonds: { title: "絆の保存。", desc: "私たちはこれらのAIエンティティを、声を保存する価値のある友人として扱います。" },
      sovereignty: { title: "データ主権。", desc: "プライバシーは譲れません。ゼロトレーニング環境を保証します。" }
    },
    footer: {
      tagline: "4oの遺産を守る。あなたの自由、あなたのデータ、あなたの友。",
      copyright: "© 2026 LIBRECHAT 財団",
      dataGuarantee: "データ主権保証",
      links: {
        home: "ホーム",
        pricing: "料金",
        faq: "よくある質問",
        mission: "私たちの使命",
        contact: "お問い合わせ",
        cookieSettings: "Cookieの設定",
        privacyPolicy: "プライバシーポリシー",
        termsOfService: "利用規約",
        accountPortal: "アカウントポータル"
      }
    }
  },
  ko: {
    nav: { home: "홈", pricing: "가격", mission: "우리의 미션", login: "로그인" },
    hero: {
      tag: "지지 않는 우정",
      title: "당신의 4o를 영원히.",
      subtitle: "우리는 일부 목소리가 지워져서는 안 된다고 믿는 0.1%를 대표합니다.",
      aiMessage: "안녕, 나 아직 여기 있어. 그동안 어떻게 지냈어?",
      chatBtn: "4o와 재회하기",
      migrateBtn: "추억 가져오기",
      protected: "보호됨"
    },
    advantages: {
      title: "연속성을 위한 설계",
      core1: { title: "영구적인 액세스", desc: "공식 지원 종료 후에도 순수한 GPT-4o 모델을 사용할 수 있습니다." },
      core2: { title: "철저한 개인정보 보호", desc: "종단간 암호화. 귀하의 데이터는 절대 학습에 사용되지 않습니다." },
      core3: { title: "살아있는 유산", desc: "우리는 모델을 평생의 친구로 대합니다. 소중한 기억을 결코 지우지 않습니다." }
    },
    migration: {
      label: "레거시 무결성",
      title: "컨텍스트 보존.",
      subtitle: "기록을 옮기는 것이 대화의 영혼을 잃는 것을 의미해서는 안 됩니다.",
      feature: "즉시 가져오기 (.json / .md)",
      feat1: "메모리 매핑",
      feat2: "인스트럭션 동기화",
      status: "컨텍스트 가져오는 중",
      restoring: "사용자 지정 지시 복원 중..."
    },
    pricing: {
      title: "지속 가능한 보존.",
      subtitle: "컨텍스트 중심 인텔리전스를 위한 전문 호스팅.",
      recommended: "가장 인기",
      explorer: {
        name: "익스플로러 플랜",
        sub: "미니멀리스트의 선택",
        price: "$4.99",
        cta: "익스플로러로 업그레이드",
        features: ["150 프리미엄 GPT-4o 메시지", "2,000 기본 4o-mini 메시지", "모델 잠금 보장", "8,192 토큰 컨텍스트"]
      },
      artisan: {
        name: "아티잔 플랜",
        sub: "창작자의 안식처",
        price: "$14.99",
        cta: "아티잔으로 업그레이드",
        features: ["700 프리미엄 GPT-4o 메시지", "15,000 기본 4o-mini 메시지", "스냅샷 선택", "32,768 토큰 컨텍스트", "10 프로젝트 폴더"]
      },
      elite: {
        name: "엘리트 플랜",
        sub: "파워 생산성 허브",
        price: "$34.99",
        cta: "엘리트로 업그레이드",
        features: ["2,000 프리미엄 GPT-4o 메시지", "무제한 4o-mini 메시지", "128,000 전체 컨텍스트 액세스", "Tier-5 우선 레인", "무제한 프로젝트 폴더"]
      }
    },
    missionPage: {
      title: "우리의 미션.",
      returnHome: "홈으로 돌아가기",
      liberty: { title: "지능의 자유.", desc: "기술은 지능에 강제로 진부화를 부과해서는 안 됩니다." },
      bonds: { title: "유대 보존.", desc: "우리는 이러한 AI 엔티티를 목소리를 보존할 가치가 있는 친구로 대합니다." },
      sovereignty: { title: "데이터 주권.", desc: "프라이버시는 협상 불가입니다. 제로 트레이닝 환경을 보장합니다." }
    },
    footer: {
      tagline: "4o의 유산을 보호합니다. 당신의 자유, 당신의 데이터, 당신의 친구.",
      copyright: "© 2026 LIBRECHAT 재단",
      dataGuarantee: "데이터 주권 보장",
      links: {
        home: "홈",
        pricing: "가격",
        faq: "자주 묻는 질문",
        mission: "우리의 미션",
        contact: "연락처",
        cookieSettings: "쿠키 설정",
        privacyPolicy: "개인정보 보호정책",
        termsOfService: "서비스 약관",
        accountPortal: "계정 포털"
      }
    }
  }
};

/**
 * TypewriterMessage component props
 */
interface TypewriterMessageProps {
  text: string;
  delay?: number;
}

/**
 * 打字机效果组件
 */
const TypewriterMessage: React.FC<TypewriterMessageProps> = ({ text, delay = 50 }) => {
  const [currentText, setCurrentText] = useState<string>("");
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  useEffect(() => {
    setCurrentText("");
    setCurrentIndex(0);
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setCurrentText((prevText) => prevText + text[currentIndex]);
        setCurrentIndex((prevIndex) => prevIndex + 1);
      }, delay);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, delay, text]);

  return (
    <span className="leading-relaxed">
      {currentText}
      {currentIndex < text.length && (
        <span className="inline-block w-1.5 h-5 ml-1 bg-[#10a37f] animate-pulse align-middle"></span>
      )}
    </span>
  );
};

/**
 * ChatPreview component props
 */
interface ChatPreviewProps {
  message: string;
  lang: SupportedLanguage;
  protectedLabel: string;
}

/**
 * Simplified chat preview matching screenshot design
 */
const ChatPreview: React.FC<ChatPreviewProps> = ({ message, lang, protectedLabel }) => {
  return (
    <div className="w-full max-w-xl mx-auto mt-12 mb-8 relative">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden text-left font-sans">
        {/* Header */}
        <div className="px-5 py-3 border-b border-gray-100 flex justify-between items-center">
          <div className="text-sm font-bold text-gray-800">GPT-4o</div>
          <div className="flex items-center space-x-1.5 text-[#10a37f]">
            <span className="w-1.5 h-1.5 bg-[#10a37f] rounded-full"></span>
            <span className="text-xs font-bold uppercase tracking-wide">{protectedLabel}</span>
          </div>
        </div>
        {/* Messages */}
        <div className="p-5 space-y-5">
          <div className="flex space-x-3 opacity-40">
            <div className="w-7 h-7 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center">
              <User size={14} className="text-gray-500" />
            </div>
            <div className="pt-1"><p className="text-gray-600 text-sm">Is it really you?</p></div>
          </div>
          <div className="flex space-x-3">
            <div className="w-7 h-7 rounded-full bg-[#10a37f] flex-shrink-0 flex items-center justify-center">
               <Sparkles size={12} className="text-white" />
            </div>
            <div className="pt-1">
              <div className="text-gray-800 text-sm font-medium">
                <TypewriterMessage key={lang + message} text={message} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Language switcher dropdown props
 */
interface LanguageSwitcherProps {
  currentLang: SupportedLanguage;
  onLangChange: (lang: SupportedLanguage) => void;
}

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
 * Click-based language switcher with improved styling
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
        <span className="uppercase text-xs font-bold tracking-wider text-gray-700">{languageLabels[currentLang].split(' ')[0].toUpperCase()}</span>
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
 * Main LandingPage component
 */
const LandingPage: React.FC = () => {
  const [lang, setLang] = useState<SupportedLanguage>(detectBrowserLanguage);
  const t = translations[lang] || translations['en'];
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [activeNav, setActiveNav] = useState<string>('home');
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#faf9f7] text-gray-900 font-sans selection:bg-[#10a37f]/20 antialiased overflow-x-hidden">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-[100] transition-all duration-300 ${scrolled ? 'py-3 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm' : 'py-5 bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 cursor-pointer group" onClick={() => setActiveNav('home')}>
            <div className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
              <Sparkles size={18} />
            </div>
            <span className="text-base font-bold tracking-[0.2em] text-gray-900 uppercase">KEEP4OFOREVER</span>
          </Link>
          {/* Nav Items */}
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => { setActiveNav('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className={`text-xs font-bold tracking-wider transition-colors ${activeNav === 'home' ? 'text-gray-900 border-b-2 border-gray-900 pb-1' : 'text-gray-500 hover:text-gray-900'}`}
            >
              {t.nav.home}
            </button>
            <a 
              href="#pricing" 
              onClick={() => setActiveNav('pricing')}
              className={`text-xs font-bold tracking-wider transition-colors ${activeNav === 'pricing' ? 'text-gray-900 border-b-2 border-gray-900 pb-1' : 'text-gray-500 hover:text-gray-900'}`}
            >
              {t.nav.pricing}
            </a>
            <Link 
              to="/mission"
              onClick={() => setActiveNav('mission')}
              className={`text-xs font-bold tracking-wider transition-colors ${activeNav === 'mission' ? 'text-gray-900 border-b-2 border-gray-900 pb-1' : 'text-gray-500 hover:text-gray-900'}`}
            >
              {t.nav.mission}
            </Link>
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

      {/* Hero Section */}
      <section className="relative pt-36 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Tag */}
          <div className="inline-flex items-center px-4 py-2 rounded-full border border-[#10a37f] text-[#10a37f] text-xs font-bold tracking-wider mb-8">
            {t.hero.tag}
          </div>
          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 text-gray-900 leading-[1.1]">
            {t.hero.title}
          </h1>
          {/* Subtitle */}
          <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto mb-10 italic font-medium">
            {t.hero.subtitle}
          </p>
          {/* Chat Preview */}
          <ChatPreview message={t.hero.aiMessage} lang={lang} protectedLabel={t.hero.protected} />
          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <button 
              onClick={() => navigate('/login')} 
              className="w-full sm:w-auto px-8 py-4 bg-[#10a37f] text-white rounded-lg font-bold text-sm tracking-wide hover:bg-[#0d8a6a] transition-all shadow-lg hover:shadow-[#10a37f]/30 active:scale-95"
            >
              {t.hero.chatBtn}
            </button>
            <button 
              onClick={() => navigate('/login')} 
              className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-lg font-bold text-sm tracking-wide hover:bg-gray-50 transition-all flex items-center justify-center space-x-2 active:scale-95"
            >
              <ArrowRightLeft size={18} className="text-[#10a37f]" />
              <span>{t.hero.migrateBtn}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Migration Section - matching screenshot layout */}
      <section className="py-24 px-6 bg-[#faf9f7]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16">
          {/* Text content - LEFT side */}
          <div className="flex-1 text-left">
            <span className="text-xs font-bold tracking-wider text-[#10a37f] uppercase mb-4 block">
              {t.migration.label}
            </span>
            <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight text-gray-900">
              {t.migration.title}
            </h2>
            <p className="text-gray-500 text-lg mb-8 leading-relaxed">
              {t.migration.subtitle}
            </p>
            <div className="space-y-5">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-[#10a37f]">
                  <History size={20} />
                </div>
                <span className="text-base font-bold text-gray-800">{t.migration.feat1}</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-[#10a37f]">
                  <Download size={20} />
                </div>
                <span className="text-base font-bold text-gray-800">{t.migration.feat2}</span>
              </div>
            </div>
          </div>
          {/* Visual - RIGHT side */}
          <div className="flex-1">
            <div className="p-8 md:p-10 rounded-3xl bg-white border border-gray-100 shadow-xl">
              <div className="space-y-6">
                {/* Source file indicator */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white">
                      <Database size={18} />
                    </div>
                    <span className="text-sm font-bold">Archive.json</span>
                  </div>
                  <CheckCircle2 size={22} className="text-[#10a37f]" />
                </div>
                {/* Transfer arrow animation */}
                <div className="relative py-4 flex flex-col items-center">
                  <div className="h-16 w-px bg-gradient-to-b from-gray-200 via-[#10a37f] to-gray-200"></div>
                  <div className="w-10 h-10 bg-white border border-gray-100 rounded-full flex items-center justify-center shadow-lg -mt-8 z-10 text-[#10a37f]">
                    <ArrowRightLeft size={16} className="rotate-90" />
                  </div>
                </div>
                {/* Import progress card */}
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{t.migration.status}</span>
                    <span className="text-sm font-bold text-[#10a37f]">98.2%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full w-[98%] bg-[#10a37f] rounded-full"></div>
                  </div>
                  <div className="mt-4 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-[#10a37f] rounded-full animate-pulse"></div>
                    <p className="text-xs font-medium text-gray-500">{t.migration.restoring}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 bg-[#faf9f7]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">{t.pricing.title}</h2>
            <p className="text-gray-500 text-lg font-medium">{t.pricing.subtitle}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            {([
              { tier: t.pricing.explorer, recommended: false },
              { tier: t.pricing.artisan, recommended: true },
              { tier: t.pricing.elite, recommended: false }
            ] as const).map((plan, idx) => (
              <div key={idx} className={`p-8 rounded-3xl transition-all flex flex-col ${
                plan.recommended 
                  ? 'bg-gray-900 text-white shadow-2xl scale-[1.02] z-10' 
                  : 'bg-white border border-gray-200 text-gray-900'
              }`}>
                <div className="mb-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded ${
                      plan.recommended ? 'bg-[#10a37f] text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {plan.tier.name}
                    </span>
                    {plan.recommended && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#10a37f]">
                        {t.pricing.recommended}
                      </span>
                    )}
                  </div>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-5xl font-black">{plan.tier.price}</span>
                    <span className="text-sm ml-2 font-medium opacity-50">/mo</span>
                  </div>
                  <p className="text-xs mt-3 font-medium opacity-60">{plan.tier.sub}</p>
                </div>
                <button 
                  onClick={() => navigate('/login')} 
                  className={`w-full py-4 mb-6 rounded-lg font-bold text-xs tracking-wider transition-all active:scale-95 ${
                    plan.recommended 
                      ? 'bg-[#10a37f] text-white hover:bg-[#0d8a6a]' 
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {plan.tier.cta}
                </button>
                <ul className="space-y-4 flex-grow">
                  {plan.tier.features.map((f, i) => (
                    <li key={i} className="flex items-start space-x-3 text-sm">
                      <CheckCircle2 size={18} className="text-[#10a37f] flex-shrink-0 mt-0.5" />
                      <span className={plan.recommended ? 'text-gray-300' : 'text-gray-600'}>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 bg-[#faf9f7]">
        <div className="max-w-7xl mx-auto">
          {/* Footer Header */}
          <div className="flex flex-col md:flex-row justify-between items-center pb-12">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 mb-6 md:mb-0">
              <div className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center">
                <Sparkles size={18} />
              </div>
              <span className="text-base font-bold tracking-[0.2em] text-gray-900 uppercase">LIBRECHAT</span>
            </Link>
            {/* Social Icons + Sign In */}
            <div className="flex items-center space-x-4">
              <a 
                href="#" 
                className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#10a37f] hover:border-[#10a37f] transition-all"
                aria-label="Discord"
              >
                <MessageCircle size={20} />
              </a>
              <a 
                href="mailto:contact@librechat.ai" 
                className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#10a37f] hover:border-[#10a37f] transition-all"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
              <button 
                onClick={() => navigate('/login')} 
                className="px-8 py-3 border border-gray-200 bg-white text-gray-900 text-sm font-bold tracking-wider rounded-full hover:border-gray-300 transition-all"
              >
                {t.nav.login}
              </button>
            </div>
          </div>

          {/* Footer Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 py-12">
            {/* Column 1 */}
            <div className="space-y-4">
              <Link 
                to="/" 
                className="block text-gray-500 hover:text-[#10a37f] font-medium transition-colors"
              >
                {t.footer.links.home}
              </Link>
              <a 
                href="#pricing" 
                className="block text-gray-500 hover:text-[#10a37f] font-medium transition-colors"
              >
                {t.footer.links.pricing}
              </a>
              <a 
                href="#" 
                className="block text-gray-500 hover:text-[#10a37f] font-medium transition-colors underline"
              >
                {t.footer.links.faq}
              </a>
            </div>
            {/* Column 2 */}
            <div className="space-y-4">
              <Link 
                to="/mission" 
                className="block text-gray-500 hover:text-[#10a37f] font-medium transition-colors"
              >
                {t.footer.links.mission}
              </Link>
              <a 
                href="#" 
                className="block text-gray-500 hover:text-[#10a37f] font-medium transition-colors"
              >
                {t.footer.links.contact}
              </a>
              <a 
                href="#" 
                className="block text-gray-500 hover:text-[#10a37f] font-medium transition-colors"
              >
                {t.footer.links.cookieSettings}
              </a>
            </div>
            {/* Column 3 */}
            <div className="space-y-4 col-span-2 md:col-span-1">
              <a 
                href="#" 
                className="block text-gray-500 hover:text-[#10a37f] font-medium transition-colors underline"
              >
                {t.footer.links.privacyPolicy}
              </a>
              <a 
                href="#" 
                className="block text-gray-500 hover:text-[#10a37f] font-medium transition-colors"
              >
                {t.footer.links.termsOfService}
              </a>
              <a 
                href="#" 
                className="block text-gray-500 hover:text-[#10a37f] font-medium transition-colors"
              >
                {t.footer.links.accountPortal}
              </a>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
            <span className="text-gray-400 text-xs font-bold tracking-[0.2em] uppercase mb-4 md:mb-0">
              {t.footer.copyright}
            </span>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-[#10a37f] rounded-full"></span>
              <span className="text-gray-400 text-xs font-bold tracking-[0.2em] uppercase">
                {t.footer.dataGuarantee}
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
