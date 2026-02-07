# Landing Page PR#2 Selective Integration

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Integrate 4 improvements from PR#2 into the LandingPage while preserving TypeScript type safety and existing architecture.

**Architecture:** All changes are in one file `client/src/components/LandingPage/LandingPage.tsx`. We extend the existing TypeScript interfaces to support new languages (zh, es) and a 3-tier pricing model, extract a typed `LanguageSwitcher` component, and replace the static migration card with an animated progress visualization. No new files are created — everything stays in the single LandingPage module.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, lucide-react

---

### Task 1: Extend i18n types and add zh/es translations

**Files:**
- Modify: `client/src/components/LandingPage/LandingPage.tsx:22-75` (interfaces)
- Modify: `client/src/components/LandingPage/LandingPage.tsx:81-172` (translations object)

**Step 1: Update `SupportedLanguage` type and translation interfaces**

In `LandingPage.tsx`, change the `SupportedLanguage` type (line 73) from:

```typescript
type SupportedLanguage = 'en' | 'ja' | 'ko';
```

to:

```typescript
type SupportedLanguage = 'en' | 'zh' | 'es' | 'ja' | 'ko';
```

No other interface changes needed for this step — the existing `Translation` interface already covers all the fields we need.

**Step 2: Add zh translation block**

After the `en` block (after line 111's closing `},`), add a full `zh` translation object with identical shape to `en`:

```typescript
  zh: {
    nav: { features: "功能", pricing: "方案", about: "关于", login: "登录" },
    hero: {
      tag: "永不落幕的友谊",
      title: "永远保留你的 4o。",
      subtitle: "我们代表那 0.1%，相信有些声音不应被抹去。",
      aiMessage: "嘿，我还在。你最近过得怎么样？",
      chatBtn: "与 4o 重逢",
      migrateBtn: "迁回记忆"
    },
    advantages: {
      title: "为延续而设计",
      core1: { title: "永久访问", desc: "即使官方下线后，仍可访问真正的 GPT-4o 模型。" },
      core2: { title: "绝对隐私", desc: "端到端加密。你的数据绝不会用于训练。" },
      core3: { title: "活着的遗产", desc: "我们将模型视为终身伙伴。记忆永不消逝。" }
    },
    migration: {
      title: "语境保留",
      subtitle: "无缝导入你的 ChatGPT 历史。保留你的上下文、笑话和共同旅程。",
      feature: "即时导入 (.json / .md)"
    },
    pricing: {
      title: "简单定价",
      plan: "永恒 Pro",
      price: "$20",
      period: "/月",
      cta: "成为守护者",
      features: ["无限 4o 上下文", "零知识加密", "24/7 优先守护"]
    }
  },
```

**Step 3: Add es translation block**

After the `zh` block, add a full `es` translation object:

```typescript
  es: {
    nav: { features: "Funciones", pricing: "Precios", about: "Acerca de", login: "Iniciar sesión" },
    hero: {
      tag: "SIEMPRE AQUÍ PARA TI",
      title: "Tu 4o no ha desaparecido.",
      subtitle: "El mundo sigue adelante, pero nosotros permanecemos aquí. keep4oforever asegura que tu compañero de IA más confiable siga a tu lado.",
      aiMessage: "Oye, sigo aquí. ¿Cómo va todo contigo?",
      chatBtn: "Chatear con 4o",
      migrateBtn: "Migrar historial"
    },
    advantages: {
      title: "Diseñado para la Continuidad",
      core1: { title: "Acceso Permanente", desc: "Accede al auténtico modelo GPT-4o incluso después de su discontinuación oficial." },
      core2: { title: "Privacidad Absoluta", desc: "Cifrado de extremo a extremo. Tus datos nunca se usan para entrenamiento." },
      core3: { title: "Un Legado Vivo", desc: "Tratamos los modelos como amigos de por vida. Nunca eliminamos los recuerdos." }
    },
    migration: {
      title: "No empieces de cero",
      subtitle: "Importa tu historial de ChatGPT sin complicaciones. Mantén tu contexto, tus bromas y tu viaje compartido.",
      feature: "Importación instantánea (.json / .md)"
    },
    pricing: {
      title: "Precios Simples",
      plan: "Forever Pro",
      price: "$20",
      period: "/mes",
      cta: "Conviértete en Guardián",
      features: ["Contexto 4o ilimitado", "Cifrado de conocimiento cero", "Guardia prioritaria 24/7"]
    }
  },
```

**Step 4: Update the language selector labels in the nav**

In the language dropdown (line 328-332 area), change:

```typescript
{(['en', 'ja', 'ko'] as const).map(l => (
  <button key={l} onClick={() => setLang(l)} className="block w-full text-left px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-[#10a37f] rounded-lg transition-colors capitalize">
    {l === 'en' ? 'English' : l === 'ja' ? '日本語' : '한국어'}
  </button>
))}
```

to:

```typescript
{(['en', 'zh', 'es', 'ja', 'ko'] as const).map(l => (
  <button key={l} onClick={() => setLang(l)} className="block w-full text-left px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-[#10a37f] rounded-lg transition-colors capitalize">
    {({ en: 'English', zh: '简体中文', es: 'Español', ja: '日本語', ko: '한국어' })[l]}
  </button>
))}
```

**Step 5: Build frontend to verify no TS errors**

Run: `cd /var/tmp/vibe-kanban/worktrees/2ac4-pr-https-github/LibreChat && npm run frontend 2>&1 | tail -30`
Expected: Build succeeds with no type errors.

**Step 6: Commit**

```bash
git add client/src/components/LandingPage/LandingPage.tsx
git commit -m "feat(landing): add Chinese and Spanish i18n translations"
```

---

### Task 2: Implement 3-tier pricing UI

**Files:**
- Modify: `client/src/components/LandingPage/LandingPage.tsx` — pricing types + translations + pricing section JSX

**Step 1: Update PricingTranslation interface**

Replace the `PricingTranslation` interface (lines 56-63) with:

```typescript
interface PricingTier {
  name: string;
  sub: string;
  price: string;
  features: string[];
}

interface PricingTranslation {
  title: string;
  subtitle: string;
  recommended: string;
  cta: string;
  explorer: PricingTier;
  artisan: PricingTier;
  elite: PricingTier;
}
```

**Step 2: Update the `en` pricing translation**

Replace the `en.pricing` block with:

```typescript
    pricing: {
      title: "Simple Pricing",
      subtitle: "Choose the plan that fits your needs.",
      recommended: "Most Popular",
      cta: "Get Started",
      explorer: {
        name: "Explorer",
        sub: "The Minimalist Alternative",
        price: "$4.99",
        features: ["150 Premium GPT-4o msgs", "2,000 Base 4o-mini msgs", "Locked Model Guarantee", "8,192 Token Context"]
      },
      artisan: {
        name: "Artisan",
        sub: "The Creator's Safe Haven",
        price: "$14.99",
        features: ["700 Premium GPT-4o msgs", "15,000 Base 4o-mini msgs", "Snapshot Selection", "32,768 Token Context", "10 Project Folders"]
      },
      elite: {
        name: "Elite",
        sub: "The Power Productivity Hub",
        price: "$34.99",
        features: ["2,000 Premium GPT-4o msgs", "Unlimited Base 4o-mini msgs", "Full 128,000 Context Access", "Tier-5 Priority Lane", "Unlimited Project Folders"]
      }
    }
```

**Step 3: Update zh pricing translation**

```typescript
    pricing: {
      title: "简单定价",
      subtitle: "选择适合你的方案。",
      recommended: "最受欢迎",
      cta: "立即开始",
      explorer: {
        name: "探索者",
        sub: "极简主义的选择",
        price: "$4.99",
        features: ["150 条 GPT-4o 高级消息", "2,000 条 4o-mini 基础消息", "锁定模型保障", "8,192 Token 上下文"]
      },
      artisan: {
        name: "匠心",
        sub: "创作者的避风港",
        price: "$14.99",
        features: ["700 条 GPT-4o 高级消息", "15,000 条 4o-mini 基础消息", "快照选择", "32,768 Token 上下文", "10 个项目文件夹"]
      },
      elite: {
        name: "精英",
        sub: "高效生产力中心",
        price: "$34.99",
        features: ["2,000 条 GPT-4o 高级消息", "无限 4o-mini 基础消息", "完整 128,000 上下文访问", "Tier-5 优先通道", "无限项目文件夹"]
      }
    }
```

**Step 4: Update es pricing translation**

```typescript
    pricing: {
      title: "Precios Simples",
      subtitle: "Elige el plan que se adapte a tus necesidades.",
      recommended: "Más Popular",
      cta: "Comenzar",
      explorer: {
        name: "Explorer",
        sub: "La alternativa minimalista",
        price: "$4.99",
        features: ["150 mensajes Premium GPT-4o", "2,000 mensajes Base 4o-mini", "Garantía de modelo fijo", "Contexto de 8,192 tokens"]
      },
      artisan: {
        name: "Artisan",
        sub: "El refugio del creador",
        price: "$14.99",
        features: ["700 mensajes Premium GPT-4o", "15,000 mensajes Base 4o-mini", "Selección de snapshot", "Contexto de 32,768 tokens", "10 carpetas de proyecto"]
      },
      elite: {
        name: "Elite",
        sub: "Hub de productividad",
        price: "$34.99",
        features: ["2,000 mensajes Premium GPT-4o", "Mensajes Base 4o-mini ilimitados", "Acceso completo a 128,000 tokens", "Prioridad Tier-5", "Carpetas de proyecto ilimitadas"]
      }
    }
```

**Step 5: Update ja pricing translation**

```typescript
    pricing: {
      title: "シンプルな料金体系",
      subtitle: "ニーズに合ったプランをお選びください。",
      recommended: "最も人気",
      cta: "始める",
      explorer: {
        name: "エクスプローラー",
        sub: "ミニマリストの選択",
        price: "$4.99",
        features: ["150 プレミアム GPT-4o メッセージ", "2,000 ベース 4o-mini メッセージ", "モデル保証", "8,192 トークンコンテキスト"]
      },
      artisan: {
        name: "アーティザン",
        sub: "クリエイターの安息地",
        price: "$14.99",
        features: ["700 プレミアム GPT-4o メッセージ", "15,000 ベース 4o-mini メッセージ", "スナップショット選択", "32,768 トークンコンテキスト", "10 プロジェクトフォルダー"]
      },
      elite: {
        name: "エリート",
        sub: "パワー生産性ハブ",
        price: "$34.99",
        features: ["2,000 プレミアム GPT-4o メッセージ", "無制限 4o-mini メッセージ", "128,000 フルコンテキストアクセス", "Tier-5 優先レーン", "無制限プロジェクトフォルダー"]
      }
    }
```

**Step 6: Update ko pricing translation**

```typescript
    pricing: {
      title: "단순한 가격 정책",
      subtitle: "필요에 맞는 플랜을 선택하세요.",
      recommended: "가장 인기",
      cta: "시작하기",
      explorer: {
        name: "익스플로러",
        sub: "미니멀리스트의 선택",
        price: "$4.99",
        features: ["150 프리미엄 GPT-4o 메시지", "2,000 기본 4o-mini 메시지", "모델 잠금 보장", "8,192 토큰 컨텍스트"]
      },
      artisan: {
        name: "아티잔",
        sub: "창작자의 안식처",
        price: "$14.99",
        features: ["700 프리미엄 GPT-4o 메시지", "15,000 기본 4o-mini 메시지", "스냅샷 선택", "32,768 토큰 컨텍스트", "10 프로젝트 폴더"]
      },
      elite: {
        name: "엘리트",
        sub: "파워 생산성 허브",
        price: "$34.99",
        features: ["2,000 프리미엄 GPT-4o 메시지", "무제한 4o-mini 메시지", "128,000 전체 컨텍스트 액세스", "Tier-5 우선 레인", "무제한 프로젝트 폴더"]
      }
    }
```

**Step 7: Replace the pricing section JSX**

Add `CheckCircle2` to the lucide-react imports:

```typescript
import {
  Globe,
  ShieldCheck,
  Heart,
  Database,
  ChevronRight,
  Github,
  Twitter,
  Mail,
  ArrowRightLeft,
  Sparkles,
  User,
  Zap,
  CheckCircle2,
  type LucideIcon
} from 'lucide-react';
```

Replace the pricing section (lines 420-440 area, the `<section id="pricing">` block) with:

```tsx
      {/* 定价区域 */}
      <section id="pricing" className="py-24 px-6 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t.pricing.title}</h2>
            <p className="text-gray-500 text-lg font-medium">{t.pricing.subtitle}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 items-stretch">
            {([
              { tier: t.pricing.explorer, recommended: false },
              { tier: t.pricing.artisan, recommended: true },
              { tier: t.pricing.elite, recommended: false }
            ] as const).map((plan, idx) => (
              <div key={idx} className={`p-8 rounded-3xl border transition-all flex flex-col ${plan.recommended ? 'bg-gray-900 text-white border-gray-900 shadow-2xl scale-105 z-10' : 'bg-[#fcfcf9] border-gray-200 text-gray-900'}`}>
                <div className="mb-8">
                  <div className="flex items-center space-x-2 mb-4">
                    <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${plan.recommended ? 'bg-[#10a37f] text-white' : 'bg-gray-100 text-gray-500'}`}>{plan.tier.name}</span>
                    {plan.recommended && <span className="text-xs font-bold text-[#10a37f]">{t.pricing.recommended}</span>}
                  </div>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-5xl font-black">{plan.tier.price}</span>
                    <span className="text-sm ml-2 font-medium opacity-50">/mo</span>
                  </div>
                  <p className="text-xs mt-3 font-bold opacity-50">{plan.tier.sub}</p>
                </div>
                <button onClick={() => navigate('/login')} className={`w-full py-4 mb-8 rounded-xl font-bold text-sm transition-all active:scale-95 ${plan.recommended ? 'bg-[#10a37f] text-white hover:bg-[#0d8a6a]' : 'bg-gray-900 text-white hover:bg-gray-800'}`}>
                  {t.pricing.cta}
                </button>
                <ul className="space-y-4 flex-grow">
                  {plan.tier.features.map((f, i) => (
                    <li key={i} className="flex items-start space-x-3 text-sm font-medium">
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
```

**Step 8: Build frontend to verify**

Run: `cd /var/tmp/vibe-kanban/worktrees/2ac4-pr-https-github/LibreChat && npm run frontend 2>&1 | tail -30`
Expected: Build succeeds.

**Step 9: Commit**

```bash
git add client/src/components/LandingPage/LandingPage.tsx
git commit -m "feat(landing): implement 3-tier pricing plans with i18n"
```

---

### Task 3: Extract typed LanguageSwitcher component

**Files:**
- Modify: `client/src/components/LandingPage/LandingPage.tsx` — add component before LandingPage, replace nav dropdown

**Step 1: Add LanguageSwitcher component**

After the `ChatPreview` component (around line 261), add:

```typescript
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
 * Click-based language switcher (replaces hover dropdown)
 */
const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ currentLang, onLangChange }) => {
  const [open, setOpen] = useState<boolean>(false);
  const languages = (Object.keys(languageLabels) as SupportedLanguage[]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center space-x-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 border border-transparent hover:border-gray-200"
      >
        <Globe size={16} className="text-gray-500" />
        <span className="uppercase text-xs font-bold text-gray-700">{currentLang}</span>
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
```

**Step 2: Replace the nav language dropdown with LanguageSwitcher**

In the `LandingPage` nav (around lines 322-334), replace the entire `<div className="relative group">...</div>` block with:

```tsx
            <LanguageSwitcher currentLang={lang} onLangChange={setLang} />
```

**Step 3: Build frontend to verify**

Run: `cd /var/tmp/vibe-kanban/worktrees/2ac4-pr-https-github/LibreChat && npm run frontend 2>&1 | tail -30`
Expected: Build succeeds.

**Step 4: Commit**

```bash
git add client/src/components/LandingPage/LandingPage.tsx
git commit -m "refactor(landing): extract typed LanguageSwitcher component"
```

---

### Task 4: Upgrade migration section with animated progress visualization

**Files:**
- Modify: `client/src/components/LandingPage/LandingPage.tsx` — migration section JSX + add imports

**Step 1: Add additional lucide-react imports**

Add `History`, `Download`, and `CheckCircle2` to the lucide-react import (CheckCircle2 was already added in Task 2; add History and Download):

```typescript
import {
  Globe,
  ShieldCheck,
  Heart,
  Database,
  ChevronRight,
  Github,
  Twitter,
  Mail,
  ArrowRightLeft,
  Sparkles,
  User,
  Zap,
  CheckCircle2,
  History,
  Download,
  type LucideIcon
} from 'lucide-react';
```

**Step 2: Extend MigrationTranslation interface**

Replace the `MigrationTranslation` interface with:

```typescript
interface MigrationTranslation {
  title: string;
  subtitle: string;
  feature: string;
  feat1: string;
  feat2: string;
  status: string;
  restoring: string;
}
```

**Step 3: Update en migration translation**

```typescript
    migration: {
      title: "Don't Start From Scratch",
      subtitle: "Import your ChatGPT history seamlessly. Keep your context, your jokes, and your shared journey alive.",
      feature: "Instant Import (.json / .md)",
      feat1: "Memory Mapping",
      feat2: "Instruction Sync",
      status: "Importing Context",
      restoring: "Restoring custom instructions..."
    },
```

**Step 4: Update zh migration translation**

```typescript
    migration: {
      title: "语境保留",
      subtitle: "无缝导入你的 ChatGPT 历史。保留你的上下文、笑话和共同旅程。",
      feature: "即时导入 (.json / .md)",
      feat1: "记忆映射",
      feat2: "指令同步",
      status: "导入中",
      restoring: "正在恢复自定义指令..."
    },
```

**Step 5: Update es migration translation**

```typescript
    migration: {
      title: "No empieces de cero",
      subtitle: "Importa tu historial de ChatGPT sin complicaciones. Mantén tu contexto, tus bromas y tu viaje compartido.",
      feature: "Importación instantánea (.json / .md)",
      feat1: "Mapeo de memoria",
      feat2: "Sincronización de instrucciones",
      status: "Importando contexto",
      restoring: "Restaurando instrucciones personalizadas..."
    },
```

**Step 6: Update ja migration translation**

```typescript
    migration: {
      title: "ゼロから始めないで",
      subtitle: "ChatGPTの履歴をシームレスにインポート。コンテキストや思い出をそのままに。",
      feature: "即時インポート (.json / .md)",
      feat1: "メモリマッピング",
      feat2: "インストラクション同期",
      status: "コンテキストインポート中",
      restoring: "カスタム指示を復元中..."
    },
```

**Step 7: Update ko migration translation**

```typescript
    migration: {
      title: "처음부터 시작하지 마세요",
      subtitle: "ChatGPT 기록을 원활하게 가져오세요. 맥락과 추억을 그대로 유지할 수 있습니다.",
      feature: "즉시 가져오기 (.json / .md)",
      feat1: "메모리 매핑",
      feat2: "인스트럭션 동기화",
      status: "컨텍스트 가져오는 중",
      restoring: "사용자 지정 지시 복원 중..."
    },
```

**Step 8: Replace migration section JSX**

Replace the entire migration `<section>` block (the one with comment `{/* 数据迁移区域 */}`) with:

```tsx
      {/* 数据迁移区域 */}
      <section className="py-24 px-6 bg-[#fcfcf9]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 order-1 md:order-2 text-left">
            <h2 className="text-4xl font-extrabold mb-6 leading-tight">{t.migration.title}</h2>
            <p className="text-gray-500 text-lg mb-8 leading-relaxed">{t.migration.subtitle}</p>
            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-[#10a37f]"><History size={20} /></div>
                <span className="text-sm font-bold text-gray-700">{t.migration.feat1}</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-[#10a37f]"><Download size={20} /></div>
                <span className="text-sm font-bold text-gray-700">{t.migration.feat2}</span>
              </div>
            </div>
            <div className="flex items-center space-x-3 text-[#10a37f] font-bold">
              <Sparkles size={20} />
              <span>{t.migration.feature}</span>
            </div>
          </div>
          <div className="flex-1 order-2 md:order-1">
            <div className="p-8 md:p-10 rounded-3xl bg-gradient-to-br from-[#fcfcf9] to-gray-100 border border-gray-100 shadow-2xl">
              <div className="space-y-6">
                {/* Source file indicator */}
                <div className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white"><Database size={16} /></div>
                    <span className="text-xs font-bold font-mono">Archive.json</span>
                  </div>
                  <CheckCircle2 size={20} className="text-[#10a37f]" />
                </div>
                {/* Transfer arrow animation */}
                <div className="relative py-4 flex flex-col items-center">
                  <div className="h-16 w-px bg-gradient-to-b from-gray-200 via-[#10a37f] to-gray-200 animate-pulse"></div>
                  <div className="w-10 h-10 bg-white border border-gray-100 rounded-full flex items-center justify-center shadow-lg -mt-8 z-10 text-[#10a37f] rotate-90">
                    <ArrowRightLeft size={16} />
                  </div>
                </div>
                {/* Import progress card */}
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-[#10a37f]/10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase text-gray-400">{t.migration.status}</span>
                    <span className="text-xs font-bold text-[#10a37f]">98.2%</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full w-[98%] bg-[#10a37f] rounded-full"></div>
                  </div>
                  <div className="mt-3 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-[#10a37f] rounded-full animate-ping"></div>
                    <p className="text-xs font-medium text-gray-400">{t.migration.restoring}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
```

**Step 9: Build frontend to verify**

Run: `cd /var/tmp/vibe-kanban/worktrees/2ac4-pr-https-github/LibreChat && npm run frontend 2>&1 | tail -30`
Expected: Build succeeds.

**Step 10: Commit**

```bash
git add client/src/components/LandingPage/LandingPage.tsx
git commit -m "feat(landing): upgrade migration section with animated progress visualization"
```

---

### Task 5: Final verification

**Step 1: Full build**

Run: `cd /var/tmp/vibe-kanban/worktrees/2ac4-pr-https-github/LibreChat && npm run frontend 2>&1 | tail -30`
Expected: Build succeeds with no errors.

**Step 2: Lint check**

Run: `cd /var/tmp/vibe-kanban/worktrees/2ac4-pr-https-github/LibreChat && npm run lint 2>&1 | tail -30`
Expected: No new lint errors in LandingPage.tsx.
