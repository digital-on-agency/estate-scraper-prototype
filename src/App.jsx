import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import SearchPage from './pages/SearchPage'
import Header from './components/Header'
import MessagePage from './pages/MessagePage'
import { CircleX } from 'lucide-react'


function LoadingPage() {
  return (
    <div className='h-screen w-screen flex flex-col justify-start items-center'>
      <Header />

      <>LOADING</>
    </div>
  );
}

function tempErrorOnClick(setError) {
  setError(null)
}

function App() {
  const [error, setError] = useState(null) // TODO: clean the error message sys
  const [loading, setLoading] = useState(false)

  // // TODO: temp test
  // useEffect(() => {
  //   const mc = "red-600"
  //   setError({
  //     mainColor: mc,
  //     icon: <CircleX className={`size-24 text-${mc}`}/>,
  //     title: "Errore nella ricerca",
  //     paragraph: "Si è verificato un errore nella ricerca, riprova più tardi o contatta il supporto",
  //     buttonText: "Torna alla ricerca",
  //     buttonTextColor: "white",
  //     buttonLink: "/search",
  //     onClickFunc: () => {setError(null)}
  //   })
  // }, [])


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

      <LoadingPage />
    );
  }

  return (
    <div className='h-screen w-screen flex flex-col justify-start items-center'>
      <Header />
      <SearchPage setError={setError} />
    </div>
  )
}

export default App
