import React, { useEffect, useRef, useState } from 'react'
import Wrapper from '../components/Wrapper'
import { useDispatch, useSelector } from 'react-redux';
import { CiLogout } from "react-icons/ci";
import { postRequest } from '../utils/HttpUtil';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { clearSession, setUsername } from '../context/slices/userSlice';
import useRefreshToken from '../hooks/useRefreshToken';
import ConfirmBox from '../components/ConfirmBox';
import Cookies from 'js-cookie';

const ProfileScreen = () => {

    const {
        username,
        email,
        phone
    } = useSelector(state => state.user)

    const usernameInputRef = useRef()
    const emailInputRef = useRef()
    const phoneInputRef = useRef()

    const navigator = useNavigate();
    const dispatch = useDispatch();

    const [isLoading, setIsLoading] = useState(false);

    const [editMode, setEditMode] = useState(false);
    const { isFetching, isError, fetchRefreshToken } = useRefreshToken();

    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);


    const handleEditMode = () => {
        if (!editMode) {
            setEditMode(true);
            setTimeout(() => {
                usernameInputRef.current.focus()
            }, 50);
        } else {
            setIsLoading(true)
            const requestBody = {
                name: usernameInputRef.current.value,
                email
            }

            postRequest('/edit_profile', requestBody).then(({data}) => {
                if (data?.statuscode === 200) {
                    dispatch(setUsername(usernameInputRef.current.value));
                    toast.success('Profile updated successfully')
                    setEditMode(false)                    
                } else if (data?.statuscode === 400) {
                    toast.error(data.message)
                    console.log(data)
                } else if (data?.statuscode == 403) {
                    toast.error(data?.message)
                    dispatch(clearSession())
                    Cookies.remove('access_token')
                    navigator('/login')
                } else if (data?.statuscode == 401) {
                    fetchRefreshToken(handleEditMode)   
                } else {
                    toast.error('Something went wrong')
                    console.log(data)
                }
            }).catch((error) => {
                toast.error('Something went wrong')
                console.log(error)
            }).finally(() => {
                setIsLoading(false)
            })
        }
    }

    const handleLogout = () => {
        setIsLogoutModalOpen(true)
    }

    const onLogout = () => {
        setIsLoading(true)
        const requestBody = {
            email: email
        }

        postRequest('/logout', requestBody).then(({data}) => {
            if (data?.statuscode === 200) {
                dispatch(clearSession())
                Cookies.remove('access_token')
                Cookies.remove('refresh_token')
                navigator('/login');
            } else if (data?.statuscode === 400) {
                toast.error(data.message)
                console.log(data)
            } else if (data?.statuscode == 403) {
                toast.error(data?.message)
                dispatch(clearSession())
                Cookies.remove('access_token')
                navigator('/login')
            } else if (data?.statuscode == 401) {
                fetchRefreshToken(onLogout)   
            } else {
                toast.error('Something went wrong')
                console.log(data)
            }
        }).catch((error) => {
            toast.error('Something went wrong')
            console.log(error)
        }).finally(() => {
            setIsLoading(false)
        })
    }

    const handleCancelEdit = () => {
        usernameInputRef.current.value = username;
        emailInputRef.current.value = email;
        phoneInputRef.current.value = phone;

        setEditMode(false)
    }

    const handleDeleteAccount = () => {
        setIsDeleteModalOpen(true)
    }

    const onDeleteAccount = () => {
        setIsLoading(true)
        const requestBody = {
            email: email
        }

        postRequest('/account_delete', requestBody).then(({data}) => {
            if (data?.statuscode === 200) {
                dispatch(clearSession())
                Cookies.remove('access_token')
                Cookies.remove('refresh_token')

                toast.success('Account deleted')
                navigator('/signup');
            } else if (data?.statuscode === 400) {
                toast.error(data.message)
                console.log(data)
            } else if (data?.statuscode == 403) {
                toast.error(data?.message)
                dispatch(clearSession())
                Cookies.remove('access_token')
                navigator('/login')
            } else if (data?.statuscode == 401) {
                fetchRefreshToken(onDeleteAccount)   
            } else {
                toast.error('Something went wrong')
                console.log(data)
            }
        }).catch((error) => {
            toast.error('Something went wrong')
            console.log(error)
        }).finally(() => {
            setIsLoading(false)
        })
    }

    useEffect(() => {
        usernameInputRef.current.value = username;
        emailInputRef.current.value = email;
        phoneInputRef.current.value = phone;
    }, [])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 py-8">
            {(isFetching || isLoading) && (
                <div className='fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50'>
                    <div className="bg-pink-400/20 p-4 rounded-full">
                        <svg className="animate-spin h-10 w-10 text-pink-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                </div>
            )}
            
            {isLogoutModalOpen && (
                <ConfirmBox 
                    message={'Are you sure you want to logout?'} 
                    onClose={() => setIsLogoutModalOpen(false)} 
                    onConfirm={onLogout} 
                />
            )}
            
            {isDeleteModalOpen && (
                <ConfirmBox 
                    message={'Are you sure you want to delete your account?'} 
                    onClose={() => setIsDeleteModalOpen(false)} 
                    onConfirm={onDeleteAccount} 
                />
            )}

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
                                <h1 className='text-2xl font-bold text-white'>Profile</h1>
                            </div>
                            <button
                                className="text-red-300 hover:text-red-200 text-sm px-3 py-1 rounded-md bg-red-900/30 border border-red-800/30 transition-colors"
                                onClick={handleDeleteAccount}
                            >
                                Delete Account
                            </button>
                        </div>
                        
                        <div className="mt-4 flex items-center gap-4">
                            <Link 
                                className="text-sm text-pink-300 hover:text-pink-200 transition-colors" 
                                to={'/change_password'}
                            >
                                Change Password
                            </Link>
                            <button 
                                className="text-sm text-red-300 hover:text-red-200 transition-colors"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                    
                    <div className="p-6">
                        <div className="space-y-5">
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1.5">Username</label>
                                <input 
                                    ref={usernameInputRef}
                                    disabled={!editMode}
                                    type="text" 
                                    id="username" 
                                    className={`block w-full rounded-xl border ${editMode ? 'bg-gray-700 border-gray-600 focus:ring-2 focus:ring-pink-300 focus:border-pink-300' : 'bg-gray-700/50 border-gray-700 text-gray-300'} py-3 px-4 text-white placeholder-gray-500`}
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                                <div className="relative">
                                    <input 
                                        ref={emailInputRef}
                                        disabled
                                        type="email" 
                                        id="email" 
                                        className="block w-full rounded-xl border border-gray-700 bg-gray-700/50 py-3 px-4 text-gray-300"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <span className="text-xs font-medium text-green-300 bg-green-900/30 rounded-full py-0.5 px-2 border border-green-800/30">Verified</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="phone_number" className="block text-sm font-medium text-gray-300 mb-1.5">Phone Number</label>
                                <div className="relative">
                                    <input 
                                        ref={phoneInputRef}
                                        disabled
                                        type="text" 
                                        id="phone_number" 
                                        className="block w-full rounded-xl border border-gray-700 bg-gray-700/50 py-3 px-4 text-gray-300"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <span className="text-xs font-medium text-green-300 bg-green-900/30 rounded-full py-0.5 px-2 border border-green-800/30">Verified</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-8 flex items-center gap-3">
                            {editMode && (
                                <button
                                    className="w-1/2 py-3 px-4 border border-gray-600 rounded-xl shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-500 transition-colors"
                                    onClick={handleCancelEdit}
                                >
                                    Cancel
                                </button>
                            )}
                            
                            <button
                                className={`w-full py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white ${editMode ? 'bg-green-500 hover:bg-green-600' : 'bg-pink-400 hover:bg-pink-500'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-pink-300 transition-colors`}
                                onClick={handleEditMode}
                            >
                                {editMode ? 'Save Changes' : 'Edit Profile'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProfileScreen