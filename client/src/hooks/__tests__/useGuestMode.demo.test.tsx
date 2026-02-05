import { renderHook, act } from '@testing-library/react';
import useGuestMode from '../useGuestMode';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../AuthContext', () => ({
  useAuthContext: () => ({ isAuthenticated: false }),
}));

describe('useGuestMode (demo mode)', () => {
  beforeEach(() => {
    (window as any).__LIBRECHAT_DEMO_MODE__ = true;
    mockNavigate.mockClear();
  });

  afterEach(() => {
    (window as any).__LIBRECHAT_DEMO_MODE__ = false;
  });

  it('redirects to /login without redirect param in demo mode', () => {
    const { result } = renderHook(() => useGuestMode());

    act(() => {
      result.current.requireAuth();
    });

    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
  });
});
