import React from 'react'
import { createPortal } from 'react-dom'
import { RiCloseFill } from 'react-icons/ri'

const ConfirmBox = ({message, onClose, onConfirm}) => {

    const handleConfirm = () => {
        onClose()
        onConfirm()
    }

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
                
                <div className="mb-6 text-center">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-pink-400/20 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-pink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    
                    <h2 className='text-xl font-bold text-white mb-2'>Confirmation</h2>
                    <p className='text-gray-300'>{message}</p>
                </div>
                
                <div className="flex gap-3">
                    <button
                        className="w-1/2 py-3 px-4 border border-gray-600 rounded-xl shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-500 transition-colors"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    
                    <button
                        className="w-1/2 flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-pink-400 hover:bg-pink-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-pink-300 transition-colors"
                        onClick={handleConfirm}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>,
            document.body
        )
}

export default ConfirmBox