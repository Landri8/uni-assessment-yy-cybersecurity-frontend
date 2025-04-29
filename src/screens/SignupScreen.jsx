import { animated, useTransition } from '@react-spring/web'
import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom';
import PasswordErrorMessage from '../components/SignupScreen/PasswordErrorMessage';
import toast from 'react-hot-toast';
import { postRequest } from '../utils/HttpUtil';
import Wrapper from '../components/Wrapper';
import { FiEyeOff, FiEye, FiUser, FiMail, FiLock } from "react-icons/fi";

import Recaptcha from '../components/Recaptcha';

const SignupScreen = () => {

  const usernameInputRef = useRef("")
  const emailInputRef = useRef("")
  const passwordInputRef = useRef("")
  const confirmPasswordInputRef = useRef("")

  const [showPassword, setShowPassword] = useState(false);

  const [showPasswordSchema, setShowPasswordSchema] = useState(false)
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [showRecaptcha, setShowRecaptcha] = useState(false);
  const [recaptchaUrl, setRecaptchaUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [formStatus, setFormStatus] = useState({
    username: false,
    email: false,
    password: false,
    confirmPassword: false
  });

  const [formError, setFormError] = useState({
    username: "",
    email: "",
    confirmPassword: "",
  })

  const [passwordValidationSchema, setPasswordValidationSchema] = useState({
    v1: false, // at least 8 characters
    v2: false, // one lowercase letter
    v3: false, // one uppercase letter
    v4: false, // one digit number
    v5: false // one special character
  })

  const transition = useTransition(showPasswordSchema, {
    from: { opacity: 0 },
    enter: { opacity: 1},
    leave: { opacity: 0},
    config: { duration: 400 },
  });

  const handleUsernameChange = (e) => {
    if (!e.target.value) {
      console.log('Username is required');
      setFormStatus(prev => ({ ...prev, username: false }))
      setFormError(prev => ({ ...prev, username: 'Username is required' }))
    }
    else if (e.target.value.length < 3) {
      console.log('Username is too short');
      setFormStatus(prev => ({ ...prev, username: false }))
      setFormError(prev => ({ ...prev, username: 'Username is too short' }))
    }
    else {
      setFormStatus(prev => ({ ...prev, username: true }))
      setFormError(prev => ({ ...prev, username: '' }))
    }
  }

  const handleEmailChange = (e) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!e.target.value) {
      console.log('Email is required');
      setFormStatus(prev => ({ ...prev, email: false }))
      setFormError(prev => ({ ...prev, email: 'Email is required' }))
    }
    else if (!emailRegex.test(e.target.value)) {
      console.log('Email is invalid');
      setFormStatus(prev => ({ ...prev, email: false }))
      setFormError(prev => ({ ...prev, email: 'Invalid email format' }))
    } else {
      setFormStatus(prev => ({ ...prev, email: true }))
      setFormError(prev => ({ ...prev, email: '' }))
    }
  }

  const handlePasswordChange = (e) => {
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

  const handleConfirmPasswordChange = () => {
    if (passwordInputRef.current.value !== confirmPasswordInputRef.current.value) {
      setFormStatus(prev => ({ ...prev, confirmPassword: false }))
      setFormError(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }))
    } else {
      setFormStatus(prev => ({ ...prev, confirmPassword: true }))
      setFormError(prev => ({ ...prev, confirmPassword: '' }))
    }
  }

  const handleSubmit = async () => {
    if (formStatus.username && formStatus.email && formStatus.password && formStatus.confirmPassword) {
      setRecaptchaUrl('')
      setIsSigningIn(true);

      const requestBody = {
        name: usernameInputRef.current.value,
        email: emailInputRef.current.value,
        password: passwordInputRef.current.value,
        password_confirmation: confirmPasswordInputRef.current.value
      }

      postRequest('/signup', requestBody).then(({data}) => {
        if (data?.statuscode === 200) {
          setShowRecaptcha(true)
          setRecaptchaUrl(data.recaptchaurl)
        } else if (data?.statuscode === 400) {
          setErrorMessage(data.message)
          toast.error("Failed to create account")
        } else {
          toast.error('Something went wrong')
        }
      }).catch((error) => {
        toast.error('Something went wrong')
        console.log(error)
      }).finally(() => {
        window.scrollTo(0, 0)
        setIsSigningIn(false)
      })
    } else {
      toast.dismiss()
      toast.error('Please fill in all required fields')
    }
  }

  const handleVerifyRecaptcha = (code) => {
    const requestBody = {
      email: emailInputRef.current.value,
      recaptcha_code: code,
      login: "false"
    }

    return postRequest('/verify_recaptcha', requestBody)
  }

  const handleCloseModal = () => {
    setShowRecaptcha(false)
    setRecaptchaUrl('')
  }

  useEffect(() => {
    if (passwordValidationSchema.v1 && passwordValidationSchema.v2 && passwordValidationSchema.v3 && passwordValidationSchema.v4 && passwordValidationSchema.v5) {
      setFormStatus(prev => ({ ...prev, password: true }))
    } else {
      setFormStatus(prev => ({ ...prev, password: false }))
    }
  }, [passwordValidationSchema])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12">
      {showRecaptcha && <Recaptcha isRefreshing={isSigningIn} onClose={handleCloseModal} url={recaptchaUrl} refreshCaptcha={handleSubmit} onVerify={handleVerifyRecaptcha} />}
      
      <div className="w-full max-w-md">
          <div className="bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700">
              <div className="mb-6 text-center">
                  <img src="/images/logo.svg" alt="Logo" className="h-12 mx-auto mb-6" />
                  <h2 className="text-3xl font-bold text-white mb-1">Create an account</h2>
                  <p className="text-gray-400">Sign up to get started</p>
              </div>
              
              {errorMessage && (
                  <div className="mb-6 p-4 bg-red-900/30 border border-red-800 rounded-xl">
                      <p className="text-red-400 text-sm">{errorMessage}</p>
                  </div>
              )}
              
              <form>
                  <div className="mb-5">
                      <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">Username</label>
                      <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FiUser className="h-5 w-5 text-gray-500" />
                          </div>
                          <input
                              ref={usernameInputRef}
                              id="username"
                              type="text"
                              onChange={handleUsernameChange}
                              disabled={isSigningIn}
                              placeholder="Choose a username"
                              className="pl-10 block w-full rounded-xl border border-gray-700 py-3 bg-gray-700/50 text-white placeholder-gray-500 focus:ring-2 focus:ring-pink-300 focus:border-pink-300"
                          />
                      </div>
                      {formError.username && <p className="mt-1 text-sm text-red-400">{formError.username}</p>}
                  </div>
                  
                  <div className="mb-5">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                      <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FiMail className="h-5 w-5 text-gray-500" />
                          </div>
                          <input
                              ref={emailInputRef}
                              id="email"
                              type="email"
                              onChange={handleEmailChange}
                              disabled={isSigningIn}
                              placeholder="your@email.com"
                              className="pl-10 block w-full rounded-xl border border-gray-700 py-3 bg-gray-700/50 text-white placeholder-gray-500 focus:ring-2 focus:ring-pink-300 focus:border-pink-300"
                          />
                      </div>
                      {formError.email && <p className="mt-1 text-sm text-red-400">{formError.email}</p>}
                  </div>
                  
                  <div className="mb-5">
                      <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                      <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FiLock className="h-5 w-5 text-gray-500" />
                          </div>
                          <input
                              ref={passwordInputRef}
                              id="password"
                              type={showPassword ? "text" : "password"}
                              onChange={handlePasswordChange}
                              onFocus={() => setShowPasswordSchema(true)}
                              disabled={isSigningIn}
                              placeholder="Create a strong password"
                              className="pl-10 block w-full rounded-xl border border-gray-700 py-3 bg-gray-700/50 text-white placeholder-gray-500 focus:ring-2 focus:ring-pink-300 focus:border-pink-300"
                          />
                          <button 
                              type="button" 
                              onClick={() => setShowPassword(prev => !prev)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                              {showPassword ? 
                                  <FiEye className="h-5 w-5 text-gray-500 hover:text-gray-400" /> : 
                                  <FiEyeOff className="h-5 w-5 text-gray-500 hover:text-gray-400" />
                              }
                          </button>
                      </div>
                      {formError.password && <p className="mt-1 text-sm text-red-400">{formError.password}</p>}
                      
                      {transition((style, item) =>
                          item ? (
                              <animated.div 
                                  style={style} 
                                  className="mt-3 p-4 bg-gray-700/30 border border-gray-600 rounded-xl"
                              >
                                  <h3 className='font-medium text-gray-300 mb-2'>Your password must contain:</h3>

                                  <PasswordErrorMessage message={'At least 8 characters'} validated={passwordValidationSchema.v1} />
                                  <PasswordErrorMessage message={'At least one lowercase character'} validated={passwordValidationSchema.v2} />
                                  <PasswordErrorMessage message={'At least one uppercase character'} validated={passwordValidationSchema.v3} />
                                  <PasswordErrorMessage message={'At least one digit number'} validated={passwordValidationSchema.v4} />
                                  <PasswordErrorMessage message={'At least one special character'} validated={passwordValidationSchema.v5} />
                              </animated.div>
                          ) : null
                      )}
                  </div>
                  
                  <div className="mb-6">
                      <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-300 mb-1">Confirm Password</label>
                      <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FiLock className="h-5 w-5 text-gray-500" />
                          </div>
                          <input
                              ref={confirmPasswordInputRef}
                              id="confirm_password"
                              type="password"
                              onChange={handleConfirmPasswordChange}
                              disabled={isSigningIn}
                              placeholder="Confirm your password"
                              className="pl-10 block w-full rounded-xl border border-gray-700 py-3 bg-gray-700/50 text-white placeholder-gray-500 focus:ring-2 focus:ring-pink-300 focus:border-pink-300"
                          />
                      </div>
                      {formError.confirmPassword && <p className="mt-1 text-sm text-red-400">{formError.confirmPassword}</p>}
                  </div>
                  
                  <button
                      type="button"
                      disabled={isSigningIn}
                      onClick={handleSubmit}
                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-pink-400 hover:bg-pink-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-pink-300 transition-colors"
                  >
                      {isSigningIn ? (
                          <span className="flex items-center">
                              <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Creating Account...
                          </span>
                      ) : (
                          "Create Account"
                      )}
                  </button>
              </form>
              
              <div className="mt-6 text-center">
                  <p className="text-sm text-gray-400">
                      Already have an account?{' '}
                      <Link to="/login" className="font-medium text-pink-300 hover:text-pink-200">
                          Sign in
                      </Link>
                  </p>
              </div>
          </div>
          
          <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                  By creating an account, you agree to our{' '}
                  <a href="#" className="text-pink-300 hover:text-pink-200">Terms of Service</a> and{' '}
                  <a href="#" className="text-pink-300 hover:text-pink-200">Privacy Policy</a>
              </p>
          </div>
      </div>
  </div>
  )
}

export default SignupScreen