import { useGetFiles } from '~/data-provider';
import { mapFiles } from '~/utils';
import { isDemoMode } from '~/utils/demoMode';
import { demoFileMap } from '~/demo/demoData';

export default function useFileMap({ isAuthenticated }: { isAuthenticated: boolean }) {
  const demoMode = isDemoMode();
  const { data: fileMap } = useGetFiles({
    select: mapFiles,
    enabled: isAuthenticated && !demoMode,
  });

  if (demoMode) {
    return demoFileMap;
  }

  return fileMap;
}
