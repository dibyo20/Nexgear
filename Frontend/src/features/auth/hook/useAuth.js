import { useDispatch, useSelector } from 'react-redux';
import { register, login } from '../service/auth.api.js';
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
      dispatch(setLoading(false));
      return { success: true, data };
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Registration failed. Please try again.";
      dispatch(setError(message));
      dispatch(setLoading(false));
      return { success: false, error: message };
    }
  }

  async function handleLogin({ email, password }) {
    dispatch(setLoading(true));
    dispatch(clearError());
    try {
      const data = await login({ email, password });
      dispatch(setUser(data.user));
      dispatch(setLoading(false));
      return { success: true, data };
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Invalid credentials. Please try again.";
      dispatch(setError(message));
      dispatch(setLoading(false));
      return { success: false, error: message };
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
    clearAuthError,
  };
};