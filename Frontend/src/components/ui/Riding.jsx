import React from 'react'
import { Button } from "@/components/ui/button"
import { Link } from 'react-router-dom'

function Riding(props) {
    return (

        <div className='h-screen w-full'>
            <Link to="/home" className='absolute flex align-center justify-center top-5 right-5 z-10 p-3 bg-white rounded-full shadow-lg shadow-gray-300'>
            <i className="text-lg font-bold ri-home-5-line"></i>
            </Link>
            <div className='h-1/2 w-full'>
                <img className='h-full w-full object-cover' src="https://i.pinimg.com/736x/28/8b/44/288b44c8e76a00feed1853b351057876.jpg" alt="" />
            </div>
            <div className='h-1/2 w-full p-5'>
                <div className='flex items-center justify-between'>
                    <img className='h-12' src="https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg" alt="" />
                    <div className='text-right'>
                        <h2 className='text-lg font-medium capitalize'>{props.ride?.captain.fullname.firstname}</h2>
                        <h4 className='text-xl font-semibold -mt-1 -mb-1'>{props.ride?.captain.vehicle.plate}</h4>
                        <p className='text-sm text-gray-600'>Maruti Suzuki Alto</p>
                        <h1 className='text-lg font-semibold'>  {props.ride?.otp} </h1>
                    </div>
                </div>
                <div className='flex gap-2 justify-between flex-col items-center'>
                    <div className='w-full mt-5'>
                        <div className='flex items-center gap-5 p-3 border-b-2'>
                            <i className="ri-map-pin-user-fill"></i>
                            <div>
                                <h3 className='text-lg font-medium'>562/11-A</h3>
                                <p className='text-sm -mt-1 text-gray-600'>{props.ride?.pickup}</p>
                            </div>
                        </div>
                        <div className='flex items-center gap-5 p-3 border-b-2'>
                            <i className="text-lg ri-map-pin-2-fill"></i>
                            <div>
                                <h3 className='text-lg font-medium'>562/11-A</h3>
                                <p className='text-sm -mt-1 text-gray-600'>{props.ride?.destination}</p>
                            </div>
                        </div>
                        <div className='flex items-center gap-5 p-3'>
                            <i className="ri-currency-line"></i>
                            <div>
                                <h3 className='text-lg font-medium'>₹{props.ride?.fare} </h3>
                                <p className='text-sm -mt-1 text-gray-600'>Cash Cash</p>
                            </div>
                        </div>
                    </div>
                </div>
                <Button className='w-full mt-5 bg-gray-900 text-white font-semibold p-2 rounded-lg'>Make a Payment</Button>
            </div>
        </div>
    )

}

export default Riding