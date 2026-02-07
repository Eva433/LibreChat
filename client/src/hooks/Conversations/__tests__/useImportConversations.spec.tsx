import React from 'react';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationSeverity } from '~/common';
import { useImportConversations } from '~/hooks/Conversations/useImportConversations';
import { useUploadConversationsMutation } from '~/data-provider';

const mockShowToast = jest.fn();

jest.mock('@librechat/client', () => ({
  useToastContext: () => ({ showToast: mockShowToast }),
}));

jest.mock('~/hooks', () => ({
  useLocalize: () => (key: string) => key,
}));

jest.mock('~/data-provider', () => ({
  useUploadConversationsMutation: jest.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useImportConversations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows a processing info toast when server responds with processing message', () => {
    const mockMutation = useUploadConversationsMutation as jest.Mock;
    let capturedOptions: any;

    mockMutation.mockImplementation((options) => {
      capturedOptions = options;
      return { mutate: jest.fn() };
    });

    renderHook(() => useImportConversations(), { wrapper: createWrapper() });

    capturedOptions.onSuccess?.(
      { message: 'Import is processing in the background. Please wait and refresh later.' },
      new FormData(),
      undefined,
    );

    expect(mockShowToast).toHaveBeenCalledWith({
      message: 'com_ui_import_conversation_processing',
      status: NotificationSeverity.INFO,
    });
  });

  it('shows a success toast when import completes', () => {
    const mockMutation = useUploadConversationsMutation as jest.Mock;
    let capturedOptions: any;

    mockMutation.mockImplementation((options) => {
      capturedOptions = options;
      return { mutate: jest.fn() };
    });

    renderHook(() => useImportConversations(), { wrapper: createWrapper() });

    capturedOptions.onSuccess?.({ message: 'Conversation(s) imported successfully' }, new FormData(), undefined);

    expect(mockShowToast).toHaveBeenCalledWith({
      message: 'com_ui_import_conversation_success',
      status: NotificationSeverity.SUCCESS,
    });
  });
});
