import { useDispatch } from 'react-redux';
import { register } from '../service/auth.api.js'
import { setUser, setLoading, setError } from '../state/auth.slice.js';

export const useAuth = () => {
    const dispatch = useDispatch();

    async function handleRegister({ email, contact, password, fullname, isSeller = false }) {
        dispatch(setLoading(true));
        try {
            const data = await register({ email, contact, password, fullname, isSeller });
            dispatch(setUser(data.user));
            dispatch(setLoading(false));
        } catch (error) {
            dispatch(setError(error.response.data.message));
            dispatch(setLoading(false));
        }
    }

    async function handleLogin({ email, password }) {
        dispatch(setLoading(true));
        try {
            const data = await login({ email, password });
            dispatch(setUser(data.user));
            dispatch(setLoading(false));
        } catch (error) {
            dispatch(setError(error.response.data.message));
            dispatch(setLoading(false));
        }
    }

    return { handleRegister, handleLogin }
}