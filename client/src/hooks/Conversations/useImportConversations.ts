import { useState, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { QueryKeys, TStartupConfig } from 'librechat-data-provider';
import { useToastContext } from '@librechat/client';
import { useUploadConversationsMutation } from '~/data-provider';
import { NotificationSeverity } from '~/common';
import { useLocalize } from '~/hooks';
import { logger } from '~/utils';

export function useImportConversations() {
  const localize = useLocalize();
  const queryClient = useQueryClient();
  const { showToast } = useToastContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [fileName, setFileName] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [isError, setIsError] = useState(false);

  const resetProgressState = useCallback(() => {
    setShowProgressModal(false);
    setFileName('');
    setIsComplete(false);
    setIsError(false);
  }, []);

  const handleSuccess = useCallback(
    (data?: { message?: string }) => {
      const serverMessage = data?.message?.trim();
      const isProcessing = serverMessage?.toLowerCase().includes('processing');

      setIsComplete(true);
      setIsUploading(false);

      showToast({
        message: isProcessing
          ? localize('com_ui_import_conversation_processing')
          : localize('com_ui_import_conversation_success'),
        status: isProcessing ? NotificationSeverity.INFO : NotificationSeverity.SUCCESS,
      });
    },
    [localize, showToast],
  );

  const handleError = useCallback(
    (error: unknown) => {
      logger.error('Import error:', error);
      setIsError(true);
      setIsUploading(false);

      const isUnsupportedType = error?.toString().includes('Unsupported import type');

      showToast({
        message: localize(
          isUnsupportedType
            ? 'com_ui_import_conversation_file_type_error'
            : 'com_ui_import_conversation_error',
        ),
        status: NotificationSeverity.ERROR,
      });
    },
    [localize, showToast],
  );

  const uploadFile = useUploadConversationsMutation({
    onSuccess: handleSuccess,
    onError: handleError,
    onMutate: () => setIsUploading(true),
  });

  const handleFileUpload = useCallback(
    async (file: File) => {
      try {
        const startupConfig = queryClient.getQueryData<TStartupConfig>([QueryKeys.startupConfig]);
        const maxFileSize = startupConfig?.conversationImportMaxFileSize;
        if (maxFileSize && file.size > maxFileSize) {
          const size = (maxFileSize / (1024 * 1024)).toFixed(2);
          showToast({
            message: localize('com_error_files_upload_too_large', { 0: size }),
            status: NotificationSeverity.ERROR,
          });
          setIsUploading(false);
          resetProgressState();
          return;
        }

        const formData = new FormData();
        formData.append('file', file, encodeURIComponent(file.name || 'File'));
        uploadFile.mutate(formData);
      } catch (error) {
        logger.error('File processing error:', error);
        setIsUploading(false);
        setIsError(true);
        showToast({
          message: localize('com_ui_import_conversation_upload_error'),
          status: NotificationSeverity.ERROR,
        });
      }
    },
    [uploadFile, showToast, localize, queryClient, resetProgressState],
  );

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        setIsUploading(true);
        setFileName(file.name);
        setShowProgressModal(true);
        setIsComplete(false);
        setIsError(false);
        handleFileUpload(file);
      }
      event.target.value = '';
    },
    [handleFileUpload],
  );

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  /** Start import with a File (e.g. from custom dialog). Validates JSON and triggers upload. */
  const startImport = useCallback(
    (file: File) => {
      const isJson =
        file.name.toLowerCase().endsWith('.json') || file.type === 'application/json';
      if (!isJson) {
        showToast({
          message: localize('com_ui_import_conversation_file_type_error'),
          status: NotificationSeverity.ERROR,
        });
        return;
      }
      setFileName(file.name);
      setShowProgressModal(true);
      setIsUploading(true);
      setIsComplete(false);
      setIsError(false);
      handleFileUpload(file);
    },
    [handleFileUpload, localize, showToast],
  );

  return {
    fileInputRef,
    isUploading,
    handleFileChange,
    handleImportClick,
    startImport,
    // Modal state
    showProgressModal,
    fileName,
    isComplete,
    isError,
    resetProgressState,
  };
}
