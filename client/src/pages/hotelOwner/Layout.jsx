import React, { useEffect } from 'react'
import Navbar from '../../components/hotelOwner/Navbar'
import Sidebar from '../../components/hotelOwner/Sidebar'
import { Outlet } from 'react-router-dom'
import { useAppContext } from "../../context/AppContext.jsx"

const Layout = () => {
  const { isOwner, navigate, loading } = useAppContext(); 
  

  useEffect(() => {
    if (!loading && !isOwner) { 
      navigate('/');
    }
  }, [isOwner, loading]);

  if (loading) return null; 

  return (
    <div className='flex flex-col min-h-screen'>
      <Navbar />
      <div className='flex h-full'>
        <Sidebar />
        <div className='flex-1 p-4 pt-10 md:px-10 h-full'>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default Layout