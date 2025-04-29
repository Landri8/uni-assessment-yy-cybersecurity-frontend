import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setEmail, setPhone, setUsername } from '../context/slices/userSlice';
import { RiCloseFill } from "react-icons/ri";

const Recaptcha = ({url, refreshCaptcha, onVerify, onClose, isRefreshing}) => {

    const recaptchaInputRef = useRef('');
    const [isVerifying, setIsVerifying] = useState(false);

    const dispatch = useDispatch();
    const navigator = useNavigate();

    const handleVerifyRecaptcha = () => {
        if (recaptchaInputRef.current.value) {
            setIsVerifying(true);

            onVerify(recaptchaInputRef.current.value).then(async ({data}) => {
                console.log('data', data);
                if (data?.statuscode == 200) {
                    toast.success('Recaptcha verified');

                    let user = data?.user;
                    
                    dispatch(setUsername(user.name));
                    dispatch(setEmail(user.email));

                    if (user.phone && user.phone.length) {
                        dispatch(setPhone(user.phone));
                        navigator('/email_verification', {state: {login: true}});
                    } else {
                        navigator('/email_verification');
                    }
                    

                } else if (data?.statuscode == 400) {
                    toast.loading('Failed to verify. Refreshing recaptcha...', {duration: 1400},);
                    await refreshCaptcha();

                    console.log(data);
                } else {
                    toast.loading('Failed to verify. Refreshing recaptcha...', {duration: 1400},);
                    await refreshCaptcha();

                    console.log(data);
                }
            }).catch(err => {
                toast.error('Something went wrong');
                console.log(err);
            }).finally(() => {
                setIsVerifying(false);
                recaptchaInputRef.current.value = '';
            })
        } else {
            toast.error('Please enter recaptcha');
        }
    }

    const handleInputChange = (e) => {
        recaptchaInputRef.current.value = e.target.value.toUpperCase();
    }


    useEffect(() => {
        recaptchaInputRef.current.focus();
    }, [])

    useEffect(() => {
        if (!isRefreshing) {
            recaptchaInputRef.current.focus();
        }
    }, [isRefreshing])

    return createPortal(
        <div className='fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-40 flex items-center justify-center'>
            <div className='w-full max-w-md bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-6 relative'>
                <button 
                    onClick={onClose} 
                    className='absolute top-4 right-4 text-gray-400 hover:text-gray-300 transition-colors'
                    aria-label="Close"
                >
                    <RiCloseFill className="w-6 h-6" />
                </button>
                
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-pink-400/20 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-pink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    
                    <h2 className='text-xl font-bold text-white mb-2'>Security Verification</h2>
                    <p className="text-gray-400 text-sm">Please enter the characters you see in the image below</p>
                </div>
                
                <div className="mb-6">
                    {url ? (
                        <div className="bg-gray-700/50 p-5 rounded-xl border border-gray-600">
                            <img 
                                src={url} 
                                className='w-full rounded-lg select-none' 
                                alt="CAPTCHA verification" 
                            />
                            
                            <button 
                                onClick={refreshCaptcha}
                                disabled={isRefreshing}
                                className="mt-4 flex items-center justify-center text-sm text-pink-300 hover:text-pink-200 w-full"
                            >
                                {isRefreshing ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin h-4 w-4 mr-2 text-pink-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Loading new image...
                                    </span>
                                ) : (
                                    <span className="flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        Refresh image
                                    </span>
                                )}
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-36 bg-gray-700/50 rounded-xl border border-gray-600">
                            <div className="flex flex-col items-center text-gray-400">
                                <svg className="animate-spin h-8 w-8 mb-2 text-pink-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="text-sm">Loading verification image...</span>
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="mb-6">
                    <label htmlFor="captcha-input" className="block text-sm font-medium text-gray-300 mb-2">Verification Code</label>
                    <input 
                        id="captcha-input"
                        ref={recaptchaInputRef} 
                        type="text" 
                        placeholder='Enter characters shown above'
                        onChange={handleInputChange}
                        disabled={isVerifying || isRefreshing}
                        className="block w-full rounded-xl border border-gray-700 py-3 px-4 bg-gray-700/50 text-white placeholder-gray-500 focus:ring-2 focus:ring-pink-300 focus:border-pink-300"
                    />
                </div>
                
                <button
                    disabled={isVerifying || isRefreshing}
                    className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-pink-400 hover:bg-pink-500`}
                    onClick={handleVerifyRecaptcha}
                >
                    {isVerifying ? (
                        <span className="flex items-center">
                            <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Verifying...
                        </span>
                    ) : (
                        "Verify"
                    )}
                </button>
                
                <p className="mt-4 text-xs text-center text-gray-500">
                    This verification helps us protect our community from automated bots
                </p>
            </div>
        </div>,
        document.body
    )
}

export default Recaptcha