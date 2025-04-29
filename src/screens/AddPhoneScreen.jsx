import React, { useEffect, useRef, useState } from 'react'
import Wrapper from '../components/Wrapper'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux';
import { postRequest } from '../utils/HttpUtil';
import { setPhone } from '../context/slices/userSlice';
import toast from 'react-hot-toast';

let phone_regex = /^44\d{9,10}$/
const AddPhoneScreen = () => {

    const {
        email,
        email_verified
    } = useSelector(state => state.user)
    const inputRef = useRef('');

    const [isValid, setIsValid] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const navigator = useNavigate();
    const dispatch = useDispatch();

    const handleAddPhone = () => {
        if (isValid) {
            setIsValidating(true);
            const requestBody = {
                email,
                phone: inputRef.current.value
            }

            postRequest('/add_phone', requestBody).then(({data}) => {
                if (data?.statuscode == 200) {
                    toast.success('Phone number added successfully')
                    dispatch(setPhone(inputRef.current.value))
                    navigator('/phone_verification')
                } else if (data?.statuscode == 400) {
                    toast.error(data?.message)
                    console.log(data)
                } else {
                    toast.error('Something went wrong')
                    console.log(data)
                }
            }).catch((error) => {
                toast.error('Something went wrong')
                console.log(error)
            }).finally(() => {
                inputRef.current.value = '';
                setIsValidating(false);
            })
            
        } else {
            toast.dismiss()
            toast.error('Please fill the input')
        }
    }

    const handleInputChange = (e) => {
        const inputValue = e.target.value;

        const onlyNumbers = inputValue.replace(/[^0-9]/g, '');
        inputRef.current.value = onlyNumbers;

        if (phone_regex.test(inputValue)) {
            setIsValid(true);
        } else {
            setIsValid(false);
        }
    }

    useEffect(() => {
        console.log(email, email_verified)
        if (email == null || email_verified == false) {
            navigator('/login')
        } else {
            inputRef.current.focus();
        }
    }, [])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <div className="w-full max-w-md">
                <div className="bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700">
                    {errorMessage && (
                        <div className="mb-6 p-4 bg-red-900/30 border border-red-800 rounded-xl">
                            <p className="text-red-400 text-sm">{errorMessage}</p>
                        </div>
                    )}
                    
                    <div className="text-center mb-6">
                        <img className='h-12 mx-auto mb-6' src="/images/logo.svg" alt="Logo" />
                        <h2 className='text-2xl font-bold text-white mb-2'>Add your phone number</h2>
                        <p className="text-gray-400 text-sm px-2">
                            We'll only use your number for verification and security purposes
                        </p>
                    </div>
                    
                    <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600 mb-6">
                        <div className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-300 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="ml-3 text-sm text-gray-300">
                                Your phone number helps us verify your identity and protect your account from unauthorized access
                            </p>
                        </div>
                    </div>
                    
                    <div className="mb-6">
                        <label htmlFor="phone-number" className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                        
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </div>
                            
                            <input 
                                id="phone-number"
                                type="text" 
                                ref={inputRef}
                                disabled={isValidating}
                                onChange={handleInputChange}
                                placeholder="44*******"
                                className="pl-10 block w-full rounded-xl border border-gray-700 py-3 px-4 bg-gray-700/50 text-white placeholder-gray-500 focus:ring-2 focus:ring-pink-300 focus:border-pink-300"
                            />
                        </div>
                        
                        <p className="mt-2 text-xs text-gray-500">
                            Format: Country code followed by phone number (e.g., 44*********)
                        </p>
                    </div>
                    
                    <button
                        disabled={isValidating || !isValid}
                        className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white ${isValid ? 'bg-pink-400 hover:bg-pink-500' : 'bg-pink-400/50 cursor-not-allowed'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-pink-300 transition-colors`}
                        onClick={handleAddPhone}
                    >
                        {isValidating ? (
                            <span className="flex items-center">
                                <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </span>
                        ) : (
                            "Verify Phone Number"
                        )}
                    </button>
                    
                    <div className="mt-6 text-center">
                        <button 
                            onClick={() => window.history.back()} 
                            className="text-sm font-medium text-pink-300 hover:text-pink-200 transition-colors"
                        >
                            Skip for now
                        </button>
                    </div>
                </div>
                
                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-500">
                        By continuing, you agree to receive SMS messages for verification purposes
                    </p>
                </div>
            </div>
        </div>
    )
}

export default AddPhoneScreen