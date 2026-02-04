import { useAuthContext } from '~/hooks';

/**
 * Hook for auth state in routes.
 * Guest mode: Does NOT auto-redirect to login - allows guests to view UI.
 * Individual components use useGuestMode to redirect on specific actions.
 */
export default function useAuthRedirect() {
  const { user, roles, isAuthenticated } = useAuthContext();

  return {
    user,
    roles,
    isAuthenticated,
  };
}
