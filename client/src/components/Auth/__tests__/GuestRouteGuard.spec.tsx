/* eslint-disable i18next/no-literal-string */
import React from 'react';
import { render, waitFor, act } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import GuestRouteGuard from '~/components/Auth/GuestRouteGuard';
import { useAuthContext } from '~/hooks/AuthContext';

// Polyfill Request for React Router in test environment
if (typeof Request === 'undefined') {
  global.Request = class Request {
    constructor(
      public url: string,
      public init?: RequestInit,
    ) {}
  } as any;
}

jest.mock('~/hooks/AuthContext', () => ({
  useAuthContext: jest.fn(),
}));

describe('GuestRouteGuard', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('allows guests to access the root path', async () => {
    (useAuthContext as jest.Mock).mockReturnValue({
      isAuthenticated: false,
    });

    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: <GuestRouteGuard />,
          children: [
            {
              index: true,
              element: <div data-testid="home">Home</div>,
            },
          ],
        },
        {
          path: '/login',
          element: <div data-testid="login">Login</div>,
        },
      ],
      { initialEntries: ['/'] },
    );

    const { getByTestId } = render(<RouterProvider router={router} />);

    act(() => {
      jest.advanceTimersByTime(60);
    });

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/');
      expect(getByTestId('home')).toBeInTheDocument();
    });
  });
});
