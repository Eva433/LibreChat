import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { AuthContextProvider } from '../AuthContext';

const mockRefreshMutate = jest.fn();

jest.mock(
  '@librechat/client',
  () => ({
    TextPaths: {},
    FilePaths: {},
    CodePaths: {},
    AudioPaths: {},
    VideoPaths: {},
    SheetPaths: {},
  }),
  { virtual: true },
);

jest.mock('~/data-provider', () => ({
  useGetRole: () => ({ data: null }),
  useGetUserQuery: () => ({ data: null, isError: false }),
  useLoginUserMutation: () => ({ mutate: jest.fn() }),
  useLogoutUserMutation: () => ({ mutate: jest.fn() }),
  useRefreshTokenMutation: () => ({ mutate: mockRefreshMutate }),
}));

describe('AuthContextProvider (demo mode)', () => {
  beforeEach(() => {
    (window as any).__LIBRECHAT_DEMO_MODE__ = true;
    mockRefreshMutate.mockClear();
  });

  afterEach(() => {
    (window as any).__LIBRECHAT_DEMO_MODE__ = false;
  });

  it('does not attempt refresh token in demo mode', async () => {
    render(
      <RecoilRoot>
        <MemoryRouter>
          <AuthContextProvider>
            <div />
          </AuthContextProvider>
        </MemoryRouter>
      </RecoilRoot>,
    );

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(mockRefreshMutate).not.toHaveBeenCalled();
  });
});
