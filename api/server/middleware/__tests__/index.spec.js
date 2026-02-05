const middleware = require('..');

describe('middleware index', () => {
  it('exports optionalJwtAuth', () => {
    expect(typeof middleware.optionalJwtAuth).toBe('function');
  });
});
