import { renderHook } from '@testing-library/react';
import useGetSender from './useGetSender';

jest.mock('~/data-provider', () => ({
  useGetEndpointsQuery: () => ({ data: {} }),
}));

describe('useGetSender', () => {
  it('returns undefined when called with a null endpoint option', () => {
    const { result } = renderHook(() => useGetSender());

    const sender = result.current(null as any);

    expect(sender).toBeUndefined();
  });
});
