import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import SearchPage from './pages/SearchPage'
import Header from './components/Header'
import MessagePage from './pages/MessagePage'
import { CircleX } from 'lucide-react'
import { LoadingSpinner } from './components/UiComponents'
import ResultsPage from './pages/ResultsPage'


function LoadingPage() {
  return (
    <div className='h-screen w-screen flex flex-col justify-start items-center'>
      <Header />

      <div className='w-full h-full flex justify-center items-center'>
        <LoadingSpinner
          time={65000}
          message={"temp message temp message temp message temp message temp message temp message temp message"}
        />
      </div>
    </div>
  );
}

function tempErrorOnClick(setError) {
  setError(null)
}

function App() {
  const [error, setError] = useState(null) // TODO: clean the error message sys
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)

  if (error && typeof error === 'object') {
    return (
      <div className='h-screen w-screen flex flex-col justify-start items-center'>
        <Header />

        <MessagePage
          icon={error.icon}
          title={error.title}
          paragraph={error.paragraph}
          buttonText={error.buttonText}
          buttonLink={error.buttonLink}
          mainColor={error.mainColor}
          buttonTextColor={error.buttonTextColor}
          onClickFunc={error.onClickFunc}
        />
      </div>
    )
  }

  if (loading) {
    return (
      // <LoadingSpinner time={65000} message={"temp message temp message temp message temp message temp message temp message temp message"} />
      <LoadingPage />
    );
  }

  if (results) {
    return (
      <div className='h-screen w-screen flex flex-col justify-start items-center'>
        <Header />
        <ResultsPage results={results} />
      </div>
    );
  }

  return (
    <div className='h-screen w-screen flex flex-col justify-start items-center'>
      <Header />
      <SearchPage setError={setError} setLoading={setLoading} setResults={setResults} />
    </div>
  )
}

export default App
