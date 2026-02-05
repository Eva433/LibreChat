import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RecoilRoot } from 'recoil';
import { Constants, dataService, initialModelsConfig } from 'librechat-data-provider';
import { useGetModelsQuery } from 'librechat-data-provider/react-query';
import { useGetStartupConfig, useGetEndpointsQuery } from '~/data-provider/Endpoints/queries';
import { useGetConvoIdQuery } from '~/data-provider/queries';
import { useGetMessagesByConvoId } from '~/data-provider/Messages/queries';
import {
  demoStartupConfig,
  demoEndpointsConfig,
  getDemoConversation,
  getDemoMessages,
} from '~/demo/demoData';

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

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <RecoilRoot>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/c/new']}>{children}</MemoryRouter>
      </QueryClientProvider>
    </RecoilRoot>
  );
};

describe('demo mode queries', () => {
  beforeEach(() => {
    (window as any).__LIBRECHAT_DEMO_MODE__ = true;
    jest.spyOn(dataService, 'getStartupConfig').mockResolvedValue({} as any);
    jest.spyOn(dataService, 'getAIEndpoints').mockResolvedValue({} as any);
    jest.spyOn(dataService, 'getConversationById').mockResolvedValue({} as any);
    jest.spyOn(dataService, 'getMessagesByConvoId').mockResolvedValue([] as any);
    jest.spyOn(dataService, 'getModels').mockResolvedValue(initialModelsConfig as any);
  });

  afterEach(() => {
    (window as any).__LIBRECHAT_DEMO_MODE__ = false;
    jest.restoreAllMocks();
  });

  it('returns demo startup config without API calls', async () => {
    const { result } = renderHook(() => useGetStartupConfig(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.data).toEqual(demoStartupConfig));
    expect(dataService.getStartupConfig).not.toHaveBeenCalled();
  });

  it('returns demo endpoints config without API calls', async () => {
    const { result } = renderHook(() => useGetEndpointsQuery(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.data).toEqual(demoEndpointsConfig));
    expect(dataService.getAIEndpoints).not.toHaveBeenCalled();
  });

  it('returns demo conversation without API calls', async () => {
    const { result } = renderHook(() => useGetConvoIdQuery(Constants.NEW_CONVO), {
      wrapper: createWrapper(),
    });

    await waitFor(() =>
      expect(result.current.data).toEqual(getDemoConversation(Constants.NEW_CONVO)),
    );
    expect(dataService.getConversationById).not.toHaveBeenCalled();
  });

  it('returns demo messages without API calls', async () => {
    const { result } = renderHook(() => useGetMessagesByConvoId(Constants.NEW_CONVO), {
      wrapper: createWrapper(),
    });

    await waitFor(() =>
      expect(result.current.data).toEqual(getDemoMessages(Constants.NEW_CONVO)),
    );
    expect(dataService.getMessagesByConvoId).not.toHaveBeenCalled();
  });

  it('returns demo models without API calls', async () => {
    const { result } = renderHook(() => useGetModelsQuery(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.data).toEqual(initialModelsConfig));
    expect(dataService.getModels).not.toHaveBeenCalled();
  });
});
