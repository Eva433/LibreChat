const Stripe = require('stripe');
const { logger } = require('~/config');

// Stripe 价格配置
// 说明：1000 tokenCredits = $0.001 USD，即 1,000,000 credits = $1.00
const PRICING_TIERS = [
  {
    id: 'tier_5',
    name: '$5 套餐',
    description: '500万额度 (约5000次对话)',
    credits: 5000000,
    price: 500, // $5.00 (单位：美分)
    discount: 0,
  },
  {
    id: 'tier_10',
    name: '$10 套餐',
    description: '1000万额度 (约10000次对话)',
    credits: 10000000,
    price: 990, // $9.90 (1% 折扣)
    discount: 1,
  },
  {
    id: 'tier_25',
    name: '$25 套餐',
    description: '2500万额度 (约25000次对话)',
    credits: 25000000,
    price: 2400, // $24.00 (4% 折扣)
    discount: 4,
  },
  {
    id: 'tier_50',
    name: '$50 套餐',
    description: '5000万额度 (约50000次对话)',
    credits: 50000000,
    price: 4700, // $47.00 (6% 折扣)
    discount: 6,
  },
  {
    id: 'tier_100',
    name: '$100 套餐',
    description: '1亿额度 (约100000次对话)',
    credits: 100000000,
    price: 9000, // $90.00 (10% 折扣)
    discount: 10,
  },
];

class StripeService {
  constructor() {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      logger.warn('[StripeService] STRIPE_SECRET_KEY not configured - Stripe features disabled');
      this.stripe = null;
      this.enabled = false;
      return;
    }

    try {
      this.stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2023-10-16',
      });
      this.enabled = true;
      logger.info('[StripeService] Initialized successfully');
    } catch (error) {
      logger.error('[StripeService] Initialization failed:', error);
      this.stripe = null;
      this.enabled = false;
    }
  }

  /**
   * 检查 Stripe 是否已启用
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * 获取所有价格套餐
   */
  getPricingTiers() {
    return PRICING_TIERS;
  }

  /**
   * 根据 ID 获取价格套餐
   */
  getPricingTierById(tierId) {
    return PRICING_TIERS.find(tier => tier.id === tierId);
  }

  /**
   * 创建 Stripe Checkout Session
   * @param {string} userId - 用户 ID
   * @param {string} userEmail - 用户邮箱
   * @param {string} tierId - 价格套餐 ID
   * @param {string} successUrl - 支付成功后的跳转地址
   * @param {string} cancelUrl - 支付取消后的跳转地址
   */
  async createCheckoutSession({ userId, userEmail, tierId, successUrl, cancelUrl }) {
    if (!this.enabled) {
      throw new Error('Stripe service is not enabled');
    }

    const pricingTier = this.getPricingTierById(tierId);
    if (!pricingTier) {
      throw new Error(`Invalid pricing tier: ${tierId}`);
    }

    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: pricingTier.name,
                description: pricingTier.description,
              },
              unit_amount: pricingTier.price,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        customer_email: userEmail,
        client_reference_id: userId,
        metadata: {
          userId: userId,
          tierId: tierId,
          credits: pricingTier.credits.toString(),
        },
      });

      logger.info(`[StripeService] Created checkout session for user ${userId}, tier ${tierId}`);
      return session;
    } catch (error) {
      logger.error('[StripeService] Failed to create checkout session:', error);
      throw error;
    }
  }

  /**
   * 验证 Webhook 签名
   * @param {string} payload - 请求体原始字符串
   * @param {string} signature - Stripe-Signature 请求头
   */
  verifyWebhookSignature(payload, signature) {
    if (!this.enabled) {
      throw new Error('Stripe service is not enabled');
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
    }

    try {
      const event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
      return event;
    } catch (error) {
      logger.error('[StripeService] Webhook signature verification failed:', error);
      throw error;
    }
  }

  /**
   * 处理支付成功事件
   * @param {object} session - Stripe Checkout Session 对象
   */
  async handlePaymentSuccess(session) {
    const { userId, tierId, credits } = session.metadata;

    if (!userId || !tierId || !credits) {
      logger.error('[StripeService] Missing metadata in session:', session.id);
      throw new Error('Invalid session metadata');
    }

    logger.info(`[StripeService] Payment successful: user=${userId}, tier=${tierId}, credits=${credits}`);

    return {
      userId,
      tierId,
      credits: parseInt(credits, 10),
      sessionId: session.id,
      paymentIntent: session.payment_intent,
      amountTotal: session.amount_total,
      customerEmail: session.customer_email,
    };
  }

  /**
   * 获取支付记录（从 Stripe）
   * @param {string} userId - 用户 ID
   * @param {number} limit - 返回记录数量
   */
  async getPaymentHistory(userId, limit = 10) {
    if (!this.enabled) {
      throw new Error('Stripe service is not enabled');
    }

    try {
      // 查找用户的所有成功的 checkout sessions
      const sessions = await this.stripe.checkout.sessions.list({
        limit: limit,
      });

      // 过滤出属于该用户的记录
      const userSessions = sessions.data.filter(
        session => session.metadata?.userId === userId && session.payment_status === 'paid'
      );

      return userSessions.map(session => ({
        sessionId: session.id,
        tierId: session.metadata.tierId,
        credits: parseInt(session.metadata.credits, 10),
        amount: session.amount_total,
        currency: session.currency,
        paymentStatus: session.payment_status,
        createdAt: new Date(session.created * 1000),
      }));
    } catch (error) {
      logger.error('[StripeService] Failed to get payment history:', error);
      throw error;
    }
  }
}

// 单例模式
let stripeServiceInstance = null;

function getStripeService() {
  if (!stripeServiceInstance) {
    stripeServiceInstance = new StripeService();
  }
  return stripeServiceInstance;
}

module.exports = {
  StripeService,
  getStripeService,
  PRICING_TIERS,
};
