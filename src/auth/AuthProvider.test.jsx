import { renderHook, act } from '@testing-library/react';
import { AuthProvider } from './AuthProvider';
import { useAuth } from './useAuth';

jest.mock('../api/authApi', () => ({
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn()
}));

jest.mock('../config', () => ({
  API_BASE: 'http://localhost:8080'
}));

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ accessToken: 'newToken' })
    });
  });

  it('provides auth context and sets access token on signIn', async () => {
    const { signIn } = require('../api/authApi');
    signIn.mockResolvedValue({ session: { access_token: 'abc123' } });

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.signIn('a@b.com', 'pw');
    });

    expect(result.current.accessToken).toBe('abc123');
  });

  it('signOut clears token', async () => {
    const { signOut } = require('../api/authApi');
    signOut.mockResolvedValue();

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      result.current.setAccessToken('seed');
      await result.current.signOut();
    });

    expect(result.current.accessToken).toBeNull();
  });
});
