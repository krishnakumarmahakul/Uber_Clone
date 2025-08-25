import React from "react"
import { Button } from "@/components/ui/button"
import traficlight from "../assets/traficlights.png"
import { useNavigate } from "react-router-dom"

function Start() {
  const navigate = useNavigate()

  const pageNavigation = () => {
    console.log("Button clicked, navigating to login page")
    navigate("/user/login")
  }
  
  
  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background */}
      <img
        src={traficlight}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />
      {/* Dark overlay to ensure content contrast */}
      <div className="absolute inset-0 bg-black/40 z-10" />

      {/* Foreground content */}
      <div className="relative z-20 flex flex-col justify-between min-h-screen">
        {/* Logo (top) */}
        <header className="flex items-center gap-2 pt-6 px-6">
          <i className="fa-brands fa-uber text-3xl text-white" />
          <h1 className="text-2xl font-semibold text-white">Uber</h1>
        </header>

        {/* Bottom card (responsive) */}
        <div className="px-4 pb-6">
          <div className="mx-auto w-full max-w-md bg-white rounded-t-2xl p-6 shadow-lg">
            <h3 className="font-semibold text-2xl text-black mb-4">Get Started with Uber</h3>
            <Button
              onClick={pageNavigation}
              className="w-full bg-black hover:bg-gray-800 py-3 text-lg text-white"
            >
              Continue...
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Start