import { useDispatch, useSelector } from 'react-redux';
import { register, login, getMe, logout } from '../service/auth.api.js';
import { setUser, setLoading, setError, clearError } from '../state/auth.slice.js';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);

  async function handleRegister({ email, contact = "", password, fullname, isSeller = false }) {
    dispatch(setLoading(true));
    dispatch(clearError());
    try {
      const data = await register({ email, contact, password, fullname, isSeller });
      dispatch(setUser(data.user));
      return data.user;
    } catch (err) {
      dispatch(setError(err?.response?.data?.message || err.message));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function handleLogin({ email, password }) {
    dispatch(setLoading(true));
    dispatch(clearError());
    try {
      const data = await login({ email, password });
      dispatch(setUser(data.user));
      return data.user;
    } catch (err) {
      dispatch(setError(err?.response?.data?.message || err.message));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function handleGetMe() {
    dispatch(setLoading(true));
    dispatch(clearError());
    try {
      const data = await getMe();
      dispatch(setUser(data.user));
      return data.user;
    } catch (err) {
      dispatch(setUser(null));
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function handleLogout() {
    try {
      await logout();
    } finally {
      dispatch(setUser(null));
    }
  }

  const clearAuthError = () => {
    dispatch(clearError());
  };

  return {
    user,
    loading,
    error,
    handleRegister,
    handleLogin,
    handleGetMe,
    handleLogout,
    clearAuthError,
  };
};