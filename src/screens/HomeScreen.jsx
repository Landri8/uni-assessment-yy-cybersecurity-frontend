import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { postRequest } from '../utils/HttpUtil';
import { useDispatch, useSelector } from 'react-redux';
import ConfirmBox from '../components/ConfirmBox';
import toast from 'react-hot-toast';
import useRefreshToken from '../hooks/useRefreshToken';
import Cookies from 'js-cookie';
import { clearSession } from '../context/slices/userSlice';
import { useSpring, animated } from '@react-spring/web';

const HomeScreen = () => {

  const [props, api] = useSpring(
    () => ({
      from: { opacity: 0 },
      to: { opacity: 1 },
      config: { duration: 400 },
    }),
    []
  )

  const {
    email,
    username
  } = useSelector(state => state.user)
  const { isFetching, isError, fetchRefreshToken } = useRefreshToken();


  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigator = useNavigate();
  const dispatch = useDispatch();

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

  return (
    <>
      {(isLoading) && (
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
      
      <animated.div style={props} className="min-h-screen bg-gray-900">
          <header className="bg-gray-800 border-b border-gray-700">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex justify-between h-16">
                      <div className="flex items-center">
                          <img className="h-8 w-auto" src="/images/logo.svg" alt="Logo" />
                          <span className="ml-3 text-xl font-bold text-white">Dashboard</span>
                      </div>
                      <div className="flex items-center">
                          <Link 
                              to="/profile" 
                              className="ml-4 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                          >
                              Profile
                          </Link>
                          <button 
                              onClick={handleLogout} 
                              className="ml-4 px-3 py-2 rounded-lg text-sm font-medium text-pink-300 hover:text-pink-200 hover:bg-pink-900/20 transition-colors"
                          >
                              Logout
                          </button>
                      </div>
                  </div>
              </div>
          </header>

          <main className="py-10">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  {/* Welcome Section */}
                  <div className="bg-gray-800/50 rounded-2xl shadow-lg border border-gray-700 p-6 mb-8">
                      <div className="flex items-center">
                          <div className="flex-shrink-0 bg-pink-400/20 rounded-full p-3">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-pink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                              </svg>
                          </div>
                          <div className="ml-5">
                              <h2 className="text-2xl font-bold text-white">Welcome back, {username}!</h2>
                              <p className="text-gray-400 mt-1">Here's what's happening with your account today.</p>
                          </div>
                      </div>
                  </div>
                  
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <div className="bg-gray-800 rounded-xl shadow-md border border-gray-700 p-6">
                          <div className="flex items-center justify-between">
                              <h3 className="text-lg font-medium text-white">Recent Activity</h3>
                              <span className="bg-pink-400/20 rounded-full p-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                              </span>
                          </div>
                          <p className="mt-2 text-3xl font-semibold text-white">12</p>
                          <p className="mt-1 text-sm text-gray-400">Actions this week</p>
                      </div>
                      
                      <div className="bg-gray-800 rounded-xl shadow-md border border-gray-700 p-6">
                          <div className="flex items-center justify-between">
                              <h3 className="text-lg font-medium text-white">Security Status</h3>
                              <span className="bg-green-400/20 rounded-full p-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                  </svg>
                              </span>
                          </div>
                          <p className="mt-2 text-3xl font-semibold text-white">Protected</p>
                          <p className="mt-1 text-sm text-gray-400">Your account is secure</p>
                      </div>
                      
                      <div className="bg-gray-800 rounded-xl shadow-md border border-gray-700 p-6">
                          <div className="flex items-center justify-between">
                              <h3 className="text-lg font-medium text-white">Verification</h3>
                              <span className="bg-pink-400/20 rounded-full p-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                              </span>
                          </div>
                          <p className="mt-2 text-3xl font-semibold text-white">Complete</p>
                          <p className="mt-1 text-sm text-gray-400">Email verified</p>
                      </div>
                  </div>
                  
                  {/* Recent Activity Section */}
                  <div className="bg-gray-800 rounded-xl shadow-md border border-gray-700 overflow-hidden mb-8">
                      <div className="px-6 py-5 border-b border-gray-700">
                          <h3 className="text-lg font-medium text-white">Activity Feed</h3>
                      </div>
                      <div className="px-6 py-4">
                          <ul className="divide-y divide-gray-700">
                              <li className="py-4">
                                  <div className="flex items-center">
                                      <div className="flex-shrink-0 bg-pink-400/20 rounded-full p-2">
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                          </svg>
                                      </div>
                                      <div className="ml-3">
                                          <p className="text-sm font-medium text-white">Last login</p>
                                          <p className="text-sm text-gray-400">Today at 9:30 AM</p>
                                      </div>
                                  </div>
                              </li>
                              <li className="py-4">
                                  <div className="flex items-center">
                                      <div className="flex-shrink-0 bg-green-400/20 rounded-full p-2">
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                          </svg>
                                      </div>
                                      <div className="ml-3">
                                          <p className="text-sm font-medium text-white">Security verification</p>
                                          <p className="text-sm text-gray-400">Yesterday at 2:15 PM</p>
                                      </div>
                                  </div>
                              </li>
                              <li className="py-4">
                                  <div className="flex items-center">
                                      <div className="flex-shrink-0 bg-pink-400/20 rounded-full p-2">
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                          </svg>
                                      </div>
                                      <div className="ml-3">
                                          <p className="text-sm font-medium text-white">Password updated</p>
                                          <p className="text-sm text-gray-400">3 days ago</p>
                                      </div>
                                  </div>
                              </li>
                          </ul>
                      </div>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-800 rounded-xl shadow-md border border-gray-700 p-6">
                          <h3 className="text-lg font-medium text-white mb-4">Quick Actions</h3>
                          <div className="grid grid-cols-2 gap-4">
                              <button className="flex flex-col items-center justify-center p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                  <span className="text-sm font-medium text-white">Edit Profile</span>
                              </button>
                              <button className="flex flex-col items-center justify-center p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                  </svg>
                                  <span className="text-sm font-medium text-white">Change Password</span>
                              </button>
                          </div>
                      </div>
                      
                      <div className="bg-gray-800 rounded-xl shadow-md border border-gray-700 p-6">
                          <h3 className="text-lg font-medium text-white mb-4">Account Status</h3>
                          <div className="flex items-center justify-between">
                              <div>
                                  <p className="text-sm text-gray-400">Current Plan</p>
                                  <p className="text-xl font-semibold text-white mt-1">Premium</p>
                              </div>
                              <button className="px-4 py-2 bg-pink-400 hover:bg-pink-500 text-white text-sm font-medium rounded-lg transition-colors">
                                  Manage
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
          </main>
          
          <footer className="bg-gray-800 border-t border-gray-700">
              <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                  <div className="flex flex-col md:flex-row justify-between items-center">
                      <div className="flex items-center">
                          <img className="h-6 w-auto" src="/images/logo.svg" alt="Logo" />
                          <p className="ml-3 text-sm text-gray-400">© 2023 Your Company. All rights reserved.</p>
                      </div>
                      <div className="mt-4 md:mt-0 flex space-x-6">
                          <a href="#" className="text-sm text-gray-400 hover:text-pink-300">Terms</a>
                          <a href="#" className="text-sm text-gray-400 hover:text-pink-300">Privacy</a>
                          <a href="#" className="text-sm text-gray-400 hover:text-pink-300">Contact</a>
                      </div>
                  </div>
              </div>
          </footer>
      </animated.div>
  </>
  )
}

export default HomeScreen