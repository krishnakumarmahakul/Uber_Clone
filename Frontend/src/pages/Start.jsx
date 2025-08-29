import React from 'react'
import { Button } from "@/components/ui/button"
import traficlight from "../assets/traficlights.png"

import { Link } from 'react-router-dom'
Link

function Start() {
  return (
    <div className="relative h-screen w-full">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={traficlight} 
          alt="Background" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Logo */}
      <div className="absolute top-8 left-8 z-10">
        <h1 className="text-5xl  font-semibold text-black">
          Uber
        </h1>
      </div>

      {/* Button Container */}
      <div className="absolute bottom-10 left-0 right-0 z-10">
        <Link to="/user/login">
        <Button asChild className="bg-black hover:bg-gray-800 py-6 w-[90%] mx-[5%] text-2xl text-white shadow-lg shadow-white transition-colors">
    <span>Continue...</span>
  </Button>
        </Link>
        
      </div>
    </div>
  )
}

export default Start