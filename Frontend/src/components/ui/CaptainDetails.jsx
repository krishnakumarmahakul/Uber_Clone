import React from 'react'

function CaptainDetails() {
  return (
    <div>
         <div className='h-2/5 w-full p-5 bg-white/90 backdrop-blur-sm border-t border-gray-200 relative -mt-4 rounded-t-3xl'>
          <div className='flex items-center gap-4 mb-4'>
            <div className='h-12 w-12 rounded-full overflow-hidden  bg-gray-200 flex items-center justify-center font-semibold text-gray-700'>
              <img src="data:image/jpeg;base64,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" alt="" />
            </div>
            <div className='flex-1'>
              <p className='text-sm font-medium text-gray-900'>
                Krishna Kumar Mahakul
              </p>
              <p className='text-xs text-gray-500'>krish@gmail.com</p>
            </div>

          </div>
          <div className='flex items-center justify-around bg-gray-100 rounded-lg'>



            <div className='grid   mt-10  grid-cols-3 gap-3 mb-5'>
              <div className='py-2 rounded-xl w-19 border border-gray-200 bg-white flex flex-col items-center'>
                <i className='ri-wallet-3-line text-xl text-gray-700 mb-1'></i>
                <span className='text-sm font-semibold text-gray-900'>₹0</span>
                <span className='text-[10px] text-gray-500 mt-0.5'>Today</span>
              </div>
              <div className='py-2 rounded-xl border border-gray-200 bg-white flex flex-col items-center'>
                <i className='ri-route-line text-xl text-gray-700 mb-1'></i>
                <span className='text-sm font-semibold text-gray-900'>0</span>
                <span className='text-[10px] text-gray-500 mt-0.5'>Trips</span>
              </div>
              <div className='py-2 rounded-xl border border-gray-200 bg-white flex flex-col items-center'>
                <i className='ri-timer-line text-xl text-gray-700 mb-1'></i>
                <span className='text-sm font-semibold text-gray-900'>0h</span>
                <span className='text-[10px] text-gray-500 mt-0.5'>Online</span>
              </div>
            </div>
          </div>

        </div>
    </div>
  )
}

export default CaptainDetails