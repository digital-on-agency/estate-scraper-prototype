import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import SearchPage from './pages/SearchPage'
import Header from './components/Header'

function App() {

  return (
    <div className='h-screen w-screen flex flex-col justify-start items-center'>
      <Header />
      <SearchPage />
    </div>
  )
}

export default App
