/**
 * @jest-environment jsdom
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
let responseErrorHandler: ((error: any) => Promise<unknown>) | undefined;

jest.mock('axios', () => {
  const mock = jest.fn().mockResolvedValue({});
  mock.interceptors = {
    response: {
      use: jest.fn((_success: any, error: any) => {
        responseErrorHandler = error;
      }),
    },
  };
  mock.get = jest.fn();
  mock.post = jest.fn();
  mock.put = jest.fn();
  mock.delete = jest.fn();
  mock.patch = jest.fn();
  return {
    __esModule: true,
    default: mock,
    interceptors: mock.interceptors,
    get: mock.get,
    post: mock.post,
    put: mock.put,
    delete: mock.delete,
    patch: mock.patch,
  };
});

const getErrorHandler = () => {
  if (!responseErrorHandler) {
    throw new Error('Response error handler was not registered');
  }
  return responseErrorHandler;
};

describe('request 401 handling', () => {
  beforeAll(async () => {
    await import('../src/request');
  });

  beforeEach(() => {
    const axios = require('axios').default;
    axios.post.mockResolvedValue({ data: {} });
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        href: 'http://localhost:3090/c/new',
        pathname: '/c/new',
      },
    });
  });

  it('does not redirect to login on 401 when on guest chat path', async () => {
    const handler = getErrorHandler();
    const error = {
      response: { status: 401 },
      config: { url: '/api/test', headers: {} },
    };

    await handler(error).catch(() => undefined);

    expect(window.location.href).toBe('http://localhost:3090/c/new');
  });
});
