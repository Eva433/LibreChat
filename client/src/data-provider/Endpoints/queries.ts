import { useRecoilValue } from 'recoil';
import { QueryKeys, dataService } from 'librechat-data-provider';
import { useQuery } from '@tanstack/react-query';
import type { QueryObserverResult, UseQueryOptions } from '@tanstack/react-query';
import type t from 'librechat-data-provider';
import store from '~/store';
import { isDemoMode } from '~/utils/demoMode';
import { demoEndpointsConfig, demoStartupConfig } from '~/demo/demoData';

export const useGetEndpointsQuery = <TData = t.TEndpointsConfig>(
  config?: UseQueryOptions<t.TEndpointsConfig, unknown, TData>,
): QueryObserverResult<TData> => {
  const queriesEnabled = useRecoilValue<boolean>(store.queriesEnabled);
  const demoMode = isDemoMode();
  return useQuery<t.TEndpointsConfig, unknown, TData>(
    [QueryKeys.endpoints],
    () => (demoMode ? Promise.resolve(demoEndpointsConfig) : dataService.getAIEndpoints()),
    {
      staleTime: Infinity,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      ...config,
      enabled: demoMode ? true : (config?.enabled ?? true) === true && queriesEnabled,
    },
  );
};

export const useGetStartupConfig = (
  config?: UseQueryOptions<t.TStartupConfig>,
): QueryObserverResult<t.TStartupConfig> => {
  const queriesEnabled = useRecoilValue<boolean>(store.queriesEnabled);
  const demoMode = isDemoMode();
  return useQuery<t.TStartupConfig>(
    [QueryKeys.startupConfig],
    () => (demoMode ? Promise.resolve(demoStartupConfig) : dataService.getStartupConfig()),
    {
      staleTime: Infinity,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      ...config,
      enabled: demoMode ? true : (config?.enabled ?? true) === true && queriesEnabled,
    },
  );
};
