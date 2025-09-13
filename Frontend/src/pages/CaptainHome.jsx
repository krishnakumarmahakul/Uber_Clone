import React, { useRef, useState } from 'react'
import CaptainLogout from './CaptainLogout'
import { Button } from "@/components/ui/button"
import { Link } from 'react-router-dom'
import CaptainDetails from '@/components/ui/CaptainDetails'
import RidePopUp from '@/components/ui/RidePopUp'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import ConfirmRidePopUp from '@/components/ui/ConfirmRidePopUp'
import LiveTraking from '@/components/ui/LiveTraking'


function CaptainHome(props) {
   
  const [ridePopupPanel, setRidePopupPanel] = useState(true)
  const ridePopupRef=useRef(null)
  const confirmRidePopupRef=useRef(null)
  const [confirmRidePopupPanel, setConfirmRidePopupPanel] = useState(false)
  const { captainData } = {}
  const [online, setOnline] = useState(false)

  useGSAP(function () {

    if (ridePopupPanel) {
        gsap.to(ridePopupRef.current, {
            transform: 'translateY(0)'
        })
    } else {
        gsap.to(ridePopupRef.current, {
            transform: 'translateY(100%)'
        })
    }
}, [ ridePopupPanel ])

useGSAP(function () {
  if (confirmRidePopupPanel) {
      gsap.to(confirmRidePopupRef.current, {
          transform: 'translateY(0)'
      })
  } else {
      gsap.to(confirmRidePopupRef.current, {
          transform: 'translateY(100%)'
      })
  }
}, [ confirmRidePopupPanel ])
  
  return (
    <>
    {/* <LiveTraking/> */}
      {/* <CaptainLogout/> */}
      <div className='h-screen w-full'>
        <div className='fixed p-6 top-0 flex items-center justify-between w-screen'>
          <img className='w-16' src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" alt="" />
          <Link to='/captain-home' className=' h-10 w-10 bg-white flex items-center justify-center rounded-full'>
            <i className="text-lg font-medium ri-logout-box-r-line"></i>
          </Link>
        </div>
        <div className='h-3/5'>
          <img className='h-full w-full object-cover' src="https://miro.medium.com/v2/resize:fit:1400/0*gwMx05pqII5hbfmX.gif" alt="" />
        </div>

        

        <div>
          <CaptainDetails/>
        </div>
        <div ref={ridePopupRef} className='fixed w-full z-10 bottom-0 translate-y-full bg-white px-3 py-10 pt-12'>
          <RidePopUp setRidePopupPanel={setRidePopupPanel} setConfirmRidePopupPanel={setConfirmRidePopupPanel}/>
        </div>
        <div ref={confirmRidePopupRef} className='fixed w-full h-screen z-10 bottom-0 translate-y-full bg-white px-3 py-10 pt-12'>
          <ConfirmRidePopUp setConfirmRidePopupPanel={setConfirmRidePopupPanel} setRidePopupPanel={setRidePopupPanel}
          />
        </div>
      </div>
      
    </>

  )
}

export default CaptainHome



