import React from 'react'
import { CiCircleCheck } from "react-icons/ci";
import { IoIosCloseCircleOutline } from "react-icons/io";

const PasswordErrorMessage = ({validated, message}) => {
  return (
    <p className={`text-[14px] my-1 flex items-center gap-2 ${validated ? 'text-emerald-500' : 'text-red-500'}`}>
    {validated ? (
        <CiCircleCheck className='text-[18px]' />
    ) : (
        <IoIosCloseCircleOutline className='text-[18px]' />
    )}
    {message}
    </p>
  )
}

export default PasswordErrorMessage