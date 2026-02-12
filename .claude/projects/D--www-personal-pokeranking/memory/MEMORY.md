# Pokeranking Project Memory

## Hydration Mismatch Prevention

**Problem**: React hydration errors (`NotFoundError: Failed to execute 'removeChild'`) caused by browser API usage.

**Solution**: Implemented layout-level `ClientOnly` wrapper:
- Created `components/client-only.tsx` using `useMounted` hook
- Wrapped entire app content in root `layout.tsx`
- Prevents all hydration mismatches by delaying render until client mount

**Location**: `frontend/src/app/layout.tsx` - main content wrapped in `<ClientOnly>`

**Note**: This approach sacrifices SSR for main content but guarantees no hydration errors. Hooks using browser APIs (`useIsPwa`, `usePlatform`) don't need mounted state logic.
