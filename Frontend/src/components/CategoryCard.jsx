import React from 'react'

function CategoryCard({ data }) {
  return (
    <div className='relative w-[120px] h-[120px] md:w-[180px] md:h-[180px] bg-white rounded-2xl shadow-xl border-2 border-[#ff4d2d] shrink-0 overflow-hidden shadow-gray-200 hover:shadow-lg transition-shadow duration-300 cursor-pointer'>
      <img src={data.image} alt={data.name} className='w-full h-full object-cover transform hover:scale-110 transition-transform duration-300' />
      <div className='absolute bottom-0 w-full left-0 bg-[#ffffff96] bg-opacity-95 px-3 py-1 text-sm font-medium text-gray-900 text-center shadow rounded-t-xl backdrop-blur'>
        {data.category}
      </div>
    </div>
  )
}

export default CategoryCard
