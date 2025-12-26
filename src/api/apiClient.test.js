import { apiFetch } from './apiClient';

jest.mock('../auth/authContextAccessor', () => {
  let ctx = null;
  return {
    setAuthContextInstance: (instance) => {
      ctx = instance;
    },
    getAuthContext: () => ctx
  };
});

const { setAuthContextInstance } = require('../auth/authContextAccessor');

describe('apiFetch', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    global.fetch = jest.fn();
  });

  it('attaches Authorization header and returns response', async () => {
    const mockRes = { ok: true, status: 200, json: jest.fn() };
    fetch.mockResolvedValueOnce(mockRes);
    setAuthContextInstance({
      getAccessToken: () => 'abc',
      setAccessToken: jest.fn(),
      signOut: jest.fn()
    });

    const res = await apiFetch('/test');
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/test'), expect.objectContaining({
      headers: expect.objectContaining({ Authorization: 'Bearer abc' }),
      credentials: 'include'
    }));
    expect(res).toBe(mockRes);
  });

  it('retries once after refresh on 401', async () => {
    const retryRes = { ok: true, status: 200, json: jest.fn().mockResolvedValue({ data: true }) };
    const refreshRes = {
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({ accessToken: 'newToken' })
    };
    const auth = {
      getAccessToken: () => 'expired',
      setAccessToken: jest.fn(),
      signOut: jest.fn()
    };
    setAuthContextInstance(auth);

    fetch
      .mockResolvedValueOnce({ status: 401 }) // initial call
      .mockResolvedValueOnce(refreshRes) // refresh
      .mockResolvedValueOnce(retryRes); // retry

    const res = await apiFetch('/protected');

    expect(auth.setAccessToken).toHaveBeenCalledWith('newToken');
    expect(res).toBe(retryRes);
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it('signs out when refresh fails', async () => {
    const signOut = jest.fn();
    setAuthContextInstance({
      getAccessToken: () => 'expired',
      setAccessToken: jest.fn(),
      signOut
    });

    fetch
      .mockResolvedValueOnce({ status: 401 }) // initial
      .mockResolvedValueOnce({ ok: false, status: 401 }); // refresh

    await expect(apiFetch('/protected')).rejects.toThrow('Unauthorized');
    expect(signOut).toHaveBeenCalled();
  });
});
