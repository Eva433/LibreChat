# Guest Route Guard + Remove Help UI

Date: 2026-02-04

## Goal
- Remove the Help/FAQ UI entry from the account settings menu.
- Allow guests to view chat pages and share pages.
- Redirect guests to login for all other routes and protected actions.

## Scope
- Frontend route guard for guest access (UI-layer).
- Remove Help/FAQ entry in account settings UI.
- Keep existing action-level guards (send message, new convo, navigate history) as defense-in-depth.

## Non-Goals
- Server-side authorization changes.
- Changing existing login or share behavior.

## Approach
1. Add a `GuestRouteGuard` component and apply it within the `AuthLayout` branch so it covers app routes like `/search`, `/agents`, `/recharge`, and dashboard routes.
2. Allowlist guest paths:
   - `/c` and `/c/*` (chat pages)
   - `/login` and `/login/2fa` (login screens)
   - `/share/*` is outside the guarded branch and remains accessible
3. Normalize paths when a `<base href>` is used (subdirectory deployments) so allowlist checks work correctly.
4. Redirect unauthenticated users to `/login?redirect=<current path>` using `replace: true`.
5. Remove Help/FAQ entry from `AccountSettings` UI so the button never renders.

## Error Handling
- If auth state is not ready, render nothing to avoid flicker or incorrect redirects.
- If navigation fails, existing action-level `requireAuth` guards still redirect on user actions.

## Testing Plan
- Manual: as guest, confirm `/c/new` works and `/share/:id` works.
- Manual: as guest, confirm `/search`, `/agents`, `/recharge`, dashboard redirect to `/login`.
- Manual: confirm Help/FAQ UI entry is removed.

