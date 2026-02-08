const createTTSLimiters = require('./ttsLimiters');
const createSTTLimiters = require('./sttLimiters');

const loginLimiter = require('./loginLimiter');
const importLimiters = require('./importLimiters');
const uploadLimiters = require('./uploadLimiters');
const forkLimiters = require('./forkLimiters');
const registerLimiter = require('./registerLimiter');
const toolCallLimiter = require('./toolCallLimiter');
const messageLimiters = require('./messageLimiters');
const webhookLimiter = require('./webhookLimiter');
const verifyEmailLimiter = require('./verifyEmailLimiter');
const resetPasswordLimiter = require('./resetPasswordLimiter');

module.exports = {
  ...uploadLimiters,
  ...importLimiters,
  ...messageLimiters,
  ...forkLimiters,
  loginLimiter,
  registerLimiter,
  toolCallLimiter,
  webhookLimiter,
  createTTSLimiters,
  createSTTLimiters,
  verifyEmailLimiter,
  resetPasswordLimiter,
};
