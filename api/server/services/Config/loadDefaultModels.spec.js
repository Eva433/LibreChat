jest.mock('@librechat/api', () => ({
  getOpenAIModels: jest.fn().mockResolvedValue(['gpt-4o']),
  getAnthropicModels: jest.fn().mockResolvedValue(['claude-3']),
  getBedrockModels: jest.fn().mockResolvedValue(['bedrock-model']),
  getGoogleModels: jest.fn().mockResolvedValue(['gemini-1.5']),
}));

jest.mock('./app', () => ({
  getAppConfig: jest.fn(),
}));

const loadDefaultModels = require('./loadDefaultModels');
const { getAppConfig } = require('./app');

describe('loadDefaultModels', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getAppConfig.mockResolvedValue({ endpoints: {} });
  });

  it('handles missing user for guest requests', async () => {
    const result = await loadDefaultModels({});
    expect(result).toEqual(
      expect.objectContaining({
        openAI: ['gpt-4o'],
        anthropic: ['claude-3'],
        google: ['gemini-1.5'],
        bedrock: ['bedrock-model'],
      }),
    );
  });
});
