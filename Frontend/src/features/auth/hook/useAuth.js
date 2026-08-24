import { useDispatch } from 'react-redux';
import { register } from '../service/auth.api.js'
import { setUser, setloading, setError } from '../state/auth.slice.js';

export const useAuth = () => {
    const dispatch = useDispatch();

    async function handleRegister({ email, contact, password, fullname, isSeller = false }) {
        dispatch(setloading(true));
        try {
            const data = await register({ email, contact, password, fullname, isSeller });
            dispatch(setUser(data.user));
            dispatch(setloading(false));
        } catch (error) {
            dispatch(setError(error.response.data.message));
            dispatch(setloading(false));
        }

    }

    return { handleRegister }
}