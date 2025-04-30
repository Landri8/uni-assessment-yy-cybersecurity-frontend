import React, { useEffect } from 'react'
import Cookies from 'js-cookie'
import { Navigate, useNavigate } from 'react-router-dom';
import { postRequest } from '../utils/HttpUtil';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { clearSession } from '../context/slices/userSlice';
import axios from 'axios';
import { setIn } from 'formik';

const Auth = ({children}) => {
    const access_token = Cookies.get('access_token');
    const refresh_token = Cookies.get('refresh_token');

    const navigator = useNavigate();
    const dispatch = useDispatch()

    useEffect(() => {
        function checkTokenValidity() {
            if (access_token && refresh_token) {
                const options = {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${refresh_token}`,
                    },
                };
    
                axios.post(`${import.meta.env.VITE_API_URL}/check_token_validity`, {}, options)
                    .then(({ data }) => {
                        if (data?.statuscode !== 200) {
                            toast.loading('Session expired in 5 seconds...');
                            setTimeout(() => {
                                toast.dismiss();
                                toast('Session expired');
                                Cookies.remove('access_token');
                                Cookies.remove('refresh_token');
                                dispatch(clearSession());
                                navigator('/login');
                            }, 5000);
                        }
                    }).catch((error) => {
                        toast.error('Something went wrong');
                        console.log(error);
                    });
            }
        }
    
        const intervalId = setInterval(checkTokenValidity, 10000); // Store the interval ID
        return () => clearInterval(intervalId); // Clear using the ID
    }, []);

    if (!access_token || !refresh_token) {
        return <Navigate to="/login" />;
    } else {
        return children;
    }
}

export default Auth