import React from 'react'
import { NavLink } from 'react-router-dom'

const PageNotFound = () => {
  return (
    <main className={`w-screen h-screen flex flex-col justify-center items-center`}>

        <h1 className={`font-bold text-4xl uppercase mb-2`}>
            Page Not Found!
        </h1>
        <NavLink to={'/'}>
            Go Back!
        </NavLink>

    </main>
  )
}

export default PageNotFound