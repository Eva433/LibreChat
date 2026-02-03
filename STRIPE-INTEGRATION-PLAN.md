# Stripe 付费充值集成实施方案

**项目目标**: 允许用户通过 Stripe 购买 Token Credits 充值到账户余额

**当前状态**:
- ✅ 余额系统已完整配置
- ✅ 交易记录系统已启用
- ✅ 用户注册和认证完成
- ✅ OpenAI API Key 已配置（真实 Key）

---

## 🎯 总体方案

### 核心流程

```
用户登录 → 查看余额 → 点击充值 → 选择套餐
    ↓
创建 Stripe Checkout Session → 跳转到 Stripe 支付页
    ↓
用户完成支付 → Stripe Webhook 通知 → 服务器验证支付
    ↓
创建交易记录 → 更新用户余额 → 发送确认
```

---

## 📐 第一阶段：配置调整（准备工作）

### 1.1 调整余额系统配置

**目标**: 关闭自动充值，改为手动付费充值

```yaml
# librechat.yaml
balance:
  enabled: true
  startBalance: 1000000        # 新用户赠送 $1.00 试用额度
  autoRefillEnabled: false     # ❌ 关闭自动充值
  # 删除以下配置（不再需要）
  # refillIntervalValue: 30
  # refillIntervalUnit: 'days'
  # refillAmount: 500000

transactions:
  enabled: true                # ✅ 保持交易记录启用
```

### 1.2 定义充值套餐

**推荐套餐定价**（可根据成本调整）:

| 套餐 | Token Credits | 等值 USD | 价格 USD | 用户优惠 |
|------|---------------|----------|----------|----------|
| 体验包 | 5,000,000 | $5.00 | $5.00 | 无 |
| 基础包 | 10,000,000 | $10.00 | $9.90 | 1% off |
| 标准包 | 25,000,000 | $25.00 | $24.00 | 4% off |
| 专业包 | 50,000,000 | $50.00 | $47.00 | 6% off |
| 企业包 | 100,000,000 | $100.00 | $90.00 | 10% off |

**套餐配置文件**:
```javascript
// api/server/config/pricing.js
const PRICING_TIERS = [
  {
    id: 'tier_5',
    name: '体验包',
    credits: 5000000,
    price: 500,           // Stripe 使用美分
    currency: 'usd',
    description: '适合轻度使用',
  },
  {
    id: 'tier_10',
    name: '基础包',
    credits: 10000000,
    price: 990,
    currency: 'usd',
    description: '节省 1%',
    popular: false,
  },
  {
    id: 'tier_25',
    name: '标准包',
    credits: 25000000,
    price: 2400,
    currency: 'usd',
    description: '节省 4%',
    popular: true,         // 推荐标记
  },
  {
    id: 'tier_50',
    name: '专业包',
    credits: 50000000,
    price: 4700,
    currency: 'usd',
    description: '节省 6%',
    popular: false,
  },
  {
    id: 'tier_100',
    name: '企业包',
    credits: 100000000,
    price: 9000,
    currency: 'usd',
    description: '节省 10%',
    popular: false,
  },
];

module.exports = { PRICING_TIERS };
```

---

## 📐 第二阶段：后端 API 开发

### 2.1 安装 Stripe SDK

```bash
npm install stripe --save
```

### 2.2 配置环境变量

```bash
# .env
# Stripe 配置
STRIPE_SECRET_KEY=sk_test_...              # Stripe 密钥
STRIPE_PUBLISHABLE_KEY=pk_test_...         # Stripe 公钥（前端使用）
STRIPE_WEBHOOK_SECRET=whsec_...            # Webhook 签名密钥
STRIPE_SUCCESS_URL=http://localhost:3080/payment/success
STRIPE_CANCEL_URL=http://localhost:3080/payment/cancel
```

### 2.3 创建 Stripe 路由

**文件**: `api/server/routes/stripe.js`

```javascript
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { requireJwtAuth } = require('~/server/middleware');
const { PRICING_TIERS } = require('~/server/config/pricing');
const { createTransaction } = require('~/models/Transaction');
const { logger } = require('@librechat/data-schemas');

// 1️⃣ 获取充值套餐列表
router.get('/pricing', requireJwtAuth, async (req, res) => {
  try {
    res.json({
      tiers: PRICING_TIERS,
      currency: 'usd',
    });
  } catch (error) {
    logger.error('[Stripe] Error fetching pricing', error);
    res.status(500).json({ error: 'Failed to fetch pricing' });
  }
});

// 2️⃣ 创建 Stripe Checkout Session
router.post('/create-checkout-session', requireJwtAuth, async (req, res) => {
  try {
    const { tierId } = req.body;
    const userId = req.user.id;

    // 查找套餐
    const tier = PRICING_TIERS.find(t => t.id === tierId);
    if (!tier) {
      return res.status(400).json({ error: 'Invalid tier' });
    }

    // 创建 Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: tier.currency,
            product_data: {
              name: `LibreChat ${tier.name}`,
              description: `充值 ${tier.credits.toLocaleString()} credits`,
            },
            unit_amount: tier.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.STRIPE_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: process.env.STRIPE_CANCEL_URL,
      client_reference_id: userId,
      metadata: {
        userId,
        tierId,
        credits: tier.credits,
      },
    });

    logger.info('[Stripe] Checkout session created', {
      userId,
      sessionId: session.id,
      tierId,
    });

    res.json({ url: session.url });
  } catch (error) {
    logger.error('[Stripe] Error creating checkout session', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// 3️⃣ Stripe Webhook 处理
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // 验证 Webhook 签名
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    logger.error('[Stripe] Webhook signature verification failed', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // 处理支付成功事件
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    try {
      const { userId, credits } = session.metadata;

      // 创建交易并更新余额
      const result = await createTransaction({
        user: userId,
        tokenType: 'credits',
        context: 'stripe_payment',
        rawAmount: parseInt(credits),
        metadata: {
          stripeSessionId: session.id,
          paymentIntentId: session.payment_intent,
          amountPaid: session.amount_total / 100,
          currency: session.currency,
        },
      });

      logger.info('[Stripe] Payment successful, balance updated', {
        userId,
        credits,
        newBalance: result.balance,
        sessionId: session.id,
      });

      res.json({ received: true });
    } catch (error) {
      logger.error('[Stripe] Error processing payment', error);
      res.status(500).json({ error: 'Failed to process payment' });
    }
  } else {
    res.json({ received: true });
  }
});

// 4️⃣ 获取支付历史
router.get('/payment-history', requireJwtAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const Transaction = require('~/models').Transaction;

    const transactions = await Transaction.find({
      user: userId,
      context: 'stripe_payment',
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    res.json({ transactions });
  } catch (error) {
    logger.error('[Stripe] Error fetching payment history', error);
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
});

module.exports = router;
```

### 2.4 注册路由

**文件**: `api/server/routes/index.js`

```javascript
// 在现有路由中添加
const stripeRouter = require('./stripe');

// 注册路由
router.use('/stripe', stripeRouter);
```

---

## 📐 第三阶段：前端界面开发

### 3.1 创建余额显示组件

**文件**: `client/src/components/Balance/BalanceDisplay.tsx`

```typescript
import React from 'react';
import { useGetUserBalance } from 'librechat-data-provider';

const BalanceDisplay: React.FC = () => {
  const { data: balance, isLoading } = useGetUserBalance();

  if (isLoading) {
    return <div>加载中...</div>;
  }

  const balanceUSD = (balance?.balance || 0) / 1000000;

  return (
    <div className="flex items-center gap-2 rounded-lg bg-surface-primary p-3">
      <div className="flex flex-col">
        <span className="text-xs text-text-secondary">账户余额</span>
        <span className="text-lg font-semibold text-text-primary">
          ${balanceUSD.toFixed(2)}
        </span>
        <span className="text-xs text-text-tertiary">
          {balance?.balance?.toLocaleString()} credits
        </span>
      </div>
    </div>
  );
};

export default BalanceDisplay;
```

### 3.2 创建充值按钮组件

**文件**: `client/src/components/Balance/RechargeButton.tsx`

```typescript
import React, { useState } from 'react';
import { Dialog } from '@radix-ui/react-dialog';
import PricingTiers from './PricingTiers';

const RechargeButton: React.FC = () => {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowDialog(true)}
        className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
      >
        充值
      </button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <PricingTiers onClose={() => setShowDialog(false)} />
      </Dialog>
    </>
  );
};

export default RechargeButton;
```

### 3.3 创建套餐选择组件

**文件**: `client/src/components/Balance/PricingTiers.tsx`

```typescript
import React, { useState } from 'react';
import { useRecoilValue } from 'recoil';
import store from '~/store';

interface PricingTier {
  id: string;
  name: string;
  credits: number;
  price: number;
  currency: string;
  description: string;
  popular?: boolean;
}

const PricingTiers: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  const handlePurchase = async (tierId: string) => {
    setLoading(true);
    setSelectedTier(tierId);

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tierId }),
      });

      const { url } = await response.json();

      // 跳转到 Stripe 支付页面
      window.location.href = url;
    } catch (error) {
      console.error('创建支付会话失败', error);
      alert('充值失败，请稍后重试');
      setLoading(false);
      setSelectedTier(null);
    }
  };

  // 从 API 获取套餐列表
  const [tiers, setTiers] = React.useState<PricingTier[]>([]);

  React.useEffect(() => {
    fetch('/api/stripe/pricing')
      .then(res => res.json())
      .then(data => setTiers(data.tiers))
      .catch(console.error);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-5xl rounded-lg bg-white p-8">
        <h2 className="mb-6 text-2xl font-bold">选择充值套餐</h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {tiers.map(tier => (
            <div
              key={tier.id}
              className={`relative rounded-lg border-2 p-6 ${
                tier.popular
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-green-500 px-3 py-1 text-xs text-white">
                  推荐
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-lg font-semibold">{tier.name}</h3>
                <p className="text-sm text-gray-600">{tier.description}</p>
              </div>

              <div className="mb-4">
                <div className="text-3xl font-bold">
                  ${(tier.price / 100).toFixed(2)}
                </div>
                <div className="text-sm text-gray-500">
                  {(tier.credits / 1000000).toLocaleString()} USD 等值
                </div>
              </div>

              <div className="mb-4 text-sm text-gray-600">
                {tier.credits.toLocaleString()} credits
              </div>

              <button
                onClick={() => handlePurchase(tier.id)}
                disabled={loading && selectedTier !== tier.id}
                className={`w-full rounded-lg px-4 py-2 text-white ${
                  tier.popular
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                } disabled:opacity-50`}
              >
                {loading && selectedTier === tier.id ? '处理中...' : '立即购买'}
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-6 text-gray-600 hover:text-gray-900"
        >
          取消
        </button>
      </div>
    </div>
  );
};

export default PricingTiers;
```

### 3.4 支付成功/失败页面

**文件**: `client/src/routes/PaymentSuccess.tsx`

```typescript
import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // 5秒后跳转回主页
    const timer = setTimeout(() => {
      navigate('/');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 text-6xl">✅</div>
        <h1 className="mb-2 text-2xl font-bold text-green-600">
          充值成功！
        </h1>
        <p className="mb-4 text-gray-600">
          您的账户余额已更新
        </p>
        <p className="text-sm text-gray-500">
          5秒后自动返回...
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 rounded-lg bg-green-600 px-6 py-2 text-white hover:bg-green-700"
        >
          立即返回
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
```

---

## 📐 第四阶段：Stripe 配置

### 4.1 注册 Stripe 账号

1. 访问 https://stripe.com
2. 注册账号并完成验证
3. 进入 Dashboard

### 4.2 获取 API 密钥

**开发环境**（测试模式）:
```
Dashboard → Developers → API keys
- Publishable key: pk_test_...
- Secret key: sk_test_...
```

**生产环境**:
```
切换到 Live mode
- Publishable key: pk_live_...
- Secret key: sk_live_...
```

### 4.3 配置 Webhook

1. Dashboard → Developers → Webhooks
2. 点击 "Add endpoint"
3. 填写 Endpoint URL:
   ```
   开发: http://localhost:3080/api/stripe/webhook
   生产: https://your-domain.com/api/stripe/webhook
   ```
4. 选择事件:
   - ✅ `checkout.session.completed`
5. 获取 Webhook 签名密钥: `whsec_...`

### 4.4 测试支付

使用 Stripe 测试卡号:
```
卡号: 4242 4242 4242 4242
过期: 任意未来日期
CVC: 任意3位数
ZIP: 任意邮编
```

---

## 📐 第五阶段：集成测试

### 5.1 测试流程

```bash
# 1. 启动开发服务器
npm run backend:dev   # 终端1
npm run frontend:dev  # 终端2

# 2. 测试步骤
1. 访问 http://localhost:3090
2. 注册/登录账户
3. 查看当前余额
4. 点击"充值"按钮
5. 选择套餐
6. 跳转到 Stripe 支付页
7. 使用测试卡号完成支付
8. 验证余额是否更新
9. 检查交易记录

# 3. 查看交易记录
node config/list-balances.js
```

### 5.2 Webhook 本地测试

使用 Stripe CLI:
```bash
# 安装 Stripe CLI
brew install stripe/stripe-cli/stripe  # macOS
# 或从 https://stripe.com/docs/stripe-cli 下载

# 登录
stripe login

# 转发 Webhook 到本地
stripe listen --forward-to localhost:3080/api/stripe/webhook

# 触发测试事件
stripe trigger checkout.session.completed
```

---

## 📊 数据库扩展（可选）

### 添加支付记录表

如果需要更详细的支付记录，可以创建专门的 Payment 模型：

**文件**: `api/models/Payment.js`

```javascript
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  stripeSessionId: {
    type: String,
    required: true,
    unique: true,
  },
  stripePaymentIntentId: String,
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'usd',
  },
  credits: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'succeeded', 'failed', 'refunded'],
    default: 'pending',
  },
  tierId: String,
  metadata: mongoose.Schema.Types.Mixed,
}, {
  timestamps: true,
});

module.exports = mongoose.model('Payment', paymentSchema);
```

---

## 🔒 安全注意事项

### 1. Webhook 验证
```javascript
// ✅ 始终验证 Stripe Webhook 签名
event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
```

### 2. 幂等性处理
```javascript
// ✅ 防止重复处理同一支付
const existingPayment = await Payment.findOne({ stripeSessionId });
if (existingPayment) {
  return res.json({ received: true, duplicate: true });
}
```

### 3. 错误处理
```javascript
// ✅ 完善的错误日志和回滚机制
try {
  await createTransaction(...);
} catch (error) {
  logger.error('Transaction failed', { sessionId, error });
  // 可以考虑发送告警通知
  throw error;
}
```

---

## 📈 监控和分析

### 推荐监控指标

1. **支付转化率**: 充值按钮点击 → 完成支付
2. **平均充值金额**: ARPU (Average Revenue Per User)
3. **最受欢迎套餐**: 各套餐的购买比例
4. **失败原因分析**: 支付失败的原因统计

### 日志记录

```javascript
// 关键节点记录
logger.info('[Stripe] Checkout initiated', { userId, tierId });
logger.info('[Stripe] Payment succeeded', { userId, amount, credits });
logger.error('[Stripe] Payment failed', { userId, error });
```

---

## 🚀 部署检查清单

### 上线前检查

- [ ] 切换到 Stripe Live mode
- [ ] 更新环境变量（Live API keys）
- [ ] 配置生产环境 Webhook URL
- [ ] 测试完整支付流程
- [ ] 验证余额更新正确
- [ ] 检查交易记录完整
- [ ] 配置告警通知
- [ ] 准备客服支持文档

---

## 💰 成本估算

**Stripe 费用**:
- 国内卡: 3.4% + ¥2 per transaction
- 国际卡: 3.4% + ¥2 per transaction
- 无月费，按交易收费

**示例**:
- 用户购买 $10 套餐
- Stripe 扣除: $0.34 + $0.29 ≈ $0.63
- 实际到账: ~$9.37

---

## 📅 开发时间估算

| 阶段 | 任务 | 预计时间 |
|------|------|---------|
| 1 | 配置调整 | 0.5 天 |
| 2 | 后端 API 开发 | 1.5 天 |
| 3 | 前端界面开发 | 2 天 |
| 4 | Stripe 配置 | 0.5 天 |
| 5 | 测试和调试 | 1 天 |
| **总计** | | **5.5 天** |

---

## 📚 参考资源

- [Stripe 官方文档](https://stripe.com/docs)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe 测试卡号](https://stripe.com/docs/testing)

---

**准备好了吗？**

让我知道你想从哪个阶段开始！
