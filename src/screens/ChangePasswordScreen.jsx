import React, { useEffect, useRef, useState } from 'react'
import { useTransition, animated } from '@react-spring/web'
import Wrapper from '../components/Wrapper'
import { useDispatch, useSelector } from 'react-redux';
import PasswordErrorMessage from '../components/SignupScreen/PasswordErrorMessage';
import { postRequest } from '../utils/HttpUtil';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import useRefreshToken from '../hooks/useRefreshToken';
import { clearSession } from '../context/slices/userSlice';
import Cookies from 'js-cookie';
import { FiEyeOff, FiEye } from "react-icons/fi";
import { convertYYYYMMDDHHmmToReadable } from '../utils/converter';


const ChangePasswordScreen = () => {

    const {
        email,
    } = useSelector(state => state.user)
    const navigator = useNavigate();
    const dispatch = useDispatch();

    const [showPasswordInputOne, setShowPasswordInputOne] = useState(false);
    const [showPasswordInputTwo, setShowPasswordInputTwo] = useState(false);


    const [isChanging, setIsChanging] = useState(false);
    const [showPasswordSchema, setShowPasswordSchema] = useState(false)

    const oldPasswordInputRef = useRef('')
    const newPasswordInputRef = useRef('')
    const confirmPasswordInputRef = useRef('')

    const [formStatus, setFormStatus] = useState({
        oldPassword: false,
        newPassword: false,
        confirmPassword: false
    });
    
    const [formError, setFormError] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    })

    const [passwordValidationSchema, setPasswordValidationSchema] = useState({
        v1: false, // at least 8 characters
        v2: false, // one lowercase letter
        v3: false, // one uppercase letter
        v4: false, // one digit number
        v5: false // one special character
    })

    const { isFetching, isError, fetchRefreshToken } = useRefreshToken();


    const handleOldPasswordChange = (e) => {
        const oldPswValue = e.target.value

        if (oldPswValue?.length < 8) {
            setFormStatus(prev => ({ ...prev, oldPassword: false }))
            setFormError(prev => ({ ...prev, oldPassword: 'Password should contain at least 8 characters' }))
        } else {
            setFormStatus(prev => ({ ...prev, oldPassword: true }))
            setFormError(prev => ({ ...prev, oldPassword: '' }))
        }
    }

    const handleNewPasswordChange = (e) => {
        const password = e.target.value;
    
        const rev1 = /^.{8,}$/
        const rev2 = /(?=.*[a-z])/
        const rev3 = /(?=.*[A-Z])/
        const rev4 = /(?=.*\d)/
        const rev5 = /(?=.*[!@#$%^&*])/
    
        if (rev1.test(password)) {
          setPasswordValidationSchema(prev => ({ ...prev, v1: true }))
        } else {
          setPasswordValidationSchema(prev => ({ ...prev, v1: false }))
        }
    
        if (rev2.test(password)) {
          setPasswordValidationSchema(prev => ({ ...prev, v2: true }))
        } else {
          setPasswordValidationSchema(prev => ({ ...prev, v2: false }))
        }
    
        if (rev3.test(password)) {
          setPasswordValidationSchema(prev => ({ ...prev, v3: true }))
        } else {
          setPasswordValidationSchema(prev => ({ ...prev, v3: false }))
        }
    
        if (rev4.test(password)) {
          setPasswordValidationSchema(prev => ({ ...prev, v4: true }))
        } else {
          setPasswordValidationSchema(prev => ({ ...prev, v4: false }))
        }
    
        if (rev5.test(password)) {
          setPasswordValidationSchema(prev => ({ ...prev, v5: true }))
        } else {
          setPasswordValidationSchema(prev => ({ ...prev, v5: false }))
        }
    
    }

    const handleConfirmPasswordChange = (e) => {
        if (newPasswordInputRef.current.value !== e.target.value) {
            setFormStatus(prev => ({ ...prev, confirmPassword: false }))
            setFormError(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }))
        } else {
            setFormStatus(prev => ({ ...prev, confirmPassword: true }))
            setFormError(prev => ({ ...prev, confirmPassword: '' }))
        }
    }

    const handleChangePassword = () => {
        if (formStatus.oldPassword && formStatus.newPassword && formStatus.confirmPassword) {
            setIsChanging(true)

            const requestBody = {
                email: email,
                old_password: oldPasswordInputRef.current.value,
                new_password: newPasswordInputRef.current.value,
                confirm_password: confirmPasswordInputRef.current.value
            }

            postRequest('/change_password', requestBody).then(({data}) => {
                if (data?.statuscode == 200) {
                    toast.success('Password changed successfully')
                    navigator('/')
                } else if (data?.statuscode == 405) {
                    const can_change_date = convertYYYYMMDDHHmmToReadable(data?.allowed_after)
                    toast.error("Password change limit exceeded. You can change password after " + can_change_date)
                    clearForm()
                } else if (data?.statuscode == 403) {
                    toast.error(data?.message)
                    dispatch(clearSession())
                    Cookies.remove('access_token')
                    clearForm()
                    navigator('/login')
                } else if (data?.statuscode == 401) {
                    fetchRefreshToken(handleChangePassword)   
                } else if (data?.statuscode == 400) {
                    toast.error(data?.message)
                    console.log(data)
                    clearForm()
                }
            }).catch((error) => {
                toast.error(error?.message)
                console.log(error)
                clearForm()
            }).finally(() => {
                setIsChanging(false)
            })
        } else {    
            toast.error('Invalid form fields')
        }
    }

    const clearForm = () => {
        setPasswordValidationSchema(prev => ({ ...prev, v1: false, v2: false, v3: false, v4: false, v5: false }))
        setFormStatus(prev => ({ ...prev, oldPassword: false, newPassword: false, confirmPassword: false }))
        setFormError(prev => ({ ...prev, oldPassword: "", newPassword: "", confirmPassword: "" }))

        oldPasswordInputRef.current.value = ''
        newPasswordInputRef.current.value = ''
        confirmPasswordInputRef.current.value = ''
    }

    const transition = useTransition(showPasswordSchema, {
        from: { opacity: 0 },
        enter: { opacity: 1},
        leave: { opacity: 0},
        config: { duration: 400 },
    });

    useEffect(() => {
        if (passwordValidationSchema.v1 && passwordValidationSchema.v2 && passwordValidationSchema.v3 && passwordValidationSchema.v4 && passwordValidationSchema.v5) {
          setFormStatus(prev => ({ ...prev, newPassword: true }))
        } else {
          setFormStatus(prev => ({ ...prev, newPassword: false }))
        }
    }, [passwordValidationSchema])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 py-8">
            <div className="w-full max-w-md">
                <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 overflow-hidden">
                    <div className="p-6 bg-gradient-to-r from-gray-800 to-gray-700 border-b border-gray-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <Link 
                                    to={-1} 
                                    className="mr-3 text-gray-400 hover:text-white transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                </Link>
                                <h1 className='text-2xl font-bold text-white'>Change Password</h1>
                            </div>
                        </div>
                        <p className="mt-2 text-sm text-gray-400">Update your password to keep your account secure</p>
                    </div>
                    
                    <div className="p-6">
                        <div className="space-y-5">
                            <div>
                                <label htmlFor="old_password" className="block text-sm font-medium text-gray-300 mb-1.5">Current Password</label>
                                <div className="relative">
                                    <input 
                                        type={showPasswordInputOne ? 'text' : 'password'}
                                        id="old_password" 
                                        ref={oldPasswordInputRef}
                                        onChange={handleOldPasswordChange}
                                        placeholder="Enter your current password"
                                        className="block w-full rounded-xl border border-gray-700 bg-gray-700/50 py-3 px-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-pink-300 focus:border-pink-300"
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowPasswordInputOne(prev => !prev)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    >
                                        {showPasswordInputOne ? 
                                            <FiEye className="h-5 w-5 text-gray-500 hover:text-gray-400" /> : 
                                            <FiEyeOff className="h-5 w-5 text-gray-500 hover:text-gray-400" />
                                        }
                                    </button>
                                </div>
                                {formError.oldPassword && (
                                    <p className="mt-1 text-sm text-red-400">{formError.oldPassword}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="new_password" className="block text-sm font-medium text-gray-300 mb-1.5">New Password</label>
                                <div className="relative">
                                    <input
                                        type={showPasswordInputTwo ? 'text' : 'password'}
                                        id="new_password"
                                        ref={newPasswordInputRef}
                                        onFocus={() => setShowPasswordSchema(true)}
                                        onChange={handleNewPasswordChange}
                                        placeholder="Create a new password"
                                        className="block w-full rounded-xl border border-gray-700 bg-gray-700/50 py-3 px-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-pink-300 focus:border-pink-300"
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowPasswordInputTwo(prev => !prev)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    >
                                        {showPasswordInputTwo ? 
                                            <FiEye className="h-5 w-5 text-gray-500 hover:text-gray-400" /> : 
                                            <FiEyeOff className="h-5 w-5 text-gray-500 hover:text-gray-400" />
                                        }
                                    </button>
                                </div>
                                
                                {transition((style, item) =>
                                    item ? (
                                        <animated.div 
                                            style={style} 
                                            className="mt-3 p-4 bg-gray-700/30 border border-gray-600 rounded-xl"
                                        >
                                            <h3 className="font-medium text-gray-300 mb-2">Your password must contain:</h3>

                                            <PasswordErrorMessage message={'At least 8 characters'} validated={passwordValidationSchema.v1} />
                                            <PasswordErrorMessage message={'At least one lowercase character'} validated={passwordValidationSchema.v2} />
                                            <PasswordErrorMessage message={'At least one uppercase character'} validated={passwordValidationSchema.v3} />
                                            <PasswordErrorMessage message={'At least one digit number'} validated={passwordValidationSchema.v4} />
                                            <PasswordErrorMessage message={'At least one special character'} validated={passwordValidationSchema.v5} />
                                        </animated.div>
                                    ) : null
                                )}
                            </div>

                            <div>
                                <label htmlFor="confirm_new_password" className="block text-sm font-medium text-gray-300 mb-1.5">Confirm New Password</label>
                                <input 
                                    type="password" 
                                    id="confirm_new_password" 
                                    ref={confirmPasswordInputRef}
                                    onChange={handleConfirmPasswordChange}
                                    placeholder="Confirm your new password"
                                    className="block w-full rounded-xl border border-gray-700 bg-gray-700/50 py-3 px-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-pink-300 focus:border-pink-300"
                                />
                                {formError.confirmPassword && (
                                    <p className="mt-1 text-sm text-red-400">{formError.confirmPassword}</p>
                                )}
                            </div>
                        </div>
                        
                        <button
                            disabled={isChanging || isFetching}
                            onClick={handleChangePassword}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-pink-400 hover:bg-pink-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-pink-300 transition-colors mt-8"
                        >
                            {isChanging ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Updating...
                                </span>
                            ) : (
                                "Change Password"
                            )}
                        </button>
                        
                        <div className="mt-6 text-center">
                            <p className="text-xs text-gray-500">
                                For security reasons, we recommend using a unique password that you don't use for other accounts
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChangePasswordScreen