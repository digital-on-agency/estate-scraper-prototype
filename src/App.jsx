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
    <div className='loading-page-container'>
      <Header />

      <div className='w-full h-full flex justify-center items-center'>
        <LoadingSpinner
          time={95000}
          message={"Stiamo cercando le migliori offerte per te..."}
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
  // // TODO: restore real resutls usestate (above)
  // const [results, setResults] = useState([
  //   {
  //     "title": "1 - Appartamento All'asta In Via Generale V Streva, N 21 - 90044 Carini (PA)- LOTTO 22003",
  //     "address": "via generale v streva, n 21 - 90044 Carini (PA)-Roma- Libertà - Villabianca",
  //     "id": "EX8691189",
  //     "auction_date": "04/12/2025",
  //     "mq": null,
  //     "rooms": "-",
  //     "price": "4094",
  //     "autonomous": false,
  //     "bathroom": "-",
  //     "energy class": "-",
  //     "description": "Partecipa all'asta di un appartamento situato in una zona centrale di Palermo, presso il Tribunale della città. L'offerta minima per questo immobile è di soli 4094 €. Non perdere l'opportunità di fare un ottimo affare e di aggiudicarti questa proprietà.L'appartamento è situato al piano terzo di un edificio a Palermo, in via Generale Vincenzo Streva 21. Si tratta di un appartamento di cui si possiede 1/6 della proprietà. Altre informazioni specifiche sull'appartamento non sono disponibili.In pochi minuti si possono raggiungere i principali servizi tra i quali supermercato (1.04 km), poste (0.31 km), scuola (0.79 km), banca (0.24 km), bancomat (1.09 km), bar (0.29 km), fermata autobus (3.21 km), siti storici (0.72 km).",
  //     "url": "https://www.immobiliallasta.it/immobili/roma/roma/ex8691189/appartamento-all-asta-in-via-generale-v-streva"
  //   },
  //   {
  //     "title": "2 - Appartamento All'asta In Via Generale V Streva, N 21 - 90044 Carini (PA)- LOTTO 22003",
  //     "address": "via generale v streva, n 21 - 90044 Carini (PA)-Roma- Libertà - Villabianca",
  //     "id": "EX8691189",
  //     "auction_date": "04/12/2025",
  //     "mq": null,
  //     "rooms": "-",
  //     "price": "4094",
  //     "autonomous": false,
  //     "bathroom": "-",
  //     "energy class": "-",
  //     "description": "Partecipa all'asta di un appartamento situato in una zona centrale di Palermo, presso il Tribunale della città. L'offerta minima per questo immobile è di soli 4094 €. Non perdere l'opportunità di fare un ottimo affare e di aggiudicarti questa proprietà.L'appartamento è situato al piano terzo di un edificio a Palermo, in via Generale Vincenzo Streva 21. Si tratta di un appartamento di cui si possiede 1/6 della proprietà. Altre informazioni specifiche sull'appartamento non sono disponibili.In pochi minuti si possono raggiungere i principali servizi tra i quali supermercato (1.04 km), poste (0.31 km), scuola (0.79 km), banca (0.24 km), bancomat (1.09 km), bar (0.29 km), fermata autobus (3.21 km), siti storici (0.72 km).",
  //     "url": "https://www.immobiliallasta.it/immobili/roma/roma/ex8691189/appartamento-all-asta-in-via-generale-v-streva"
  //   },
  //   {
  //     "title": "3 - Appartamento All'asta In Via Generale V Streva, N 21 - 90044 Carini (PA)- LOTTO 22003",
  //     "address": "via generale v streva, n 21 - 90044 Carini (PA)-Roma- Libertà - Villabianca",
  //     "id": "EX8691189",
  //     "auction_date": "04/12/2025",
  //     "mq": null,
  //     "rooms": "-",
  //     "price": "4094",
  //     "autonomous": false,
  //     "bathroom": "-",
  //     "energy class": "-",
  //     "description": "Partecipa all'asta di un appartamento situato in una zona centrale di Palermo, presso il Tribunale della città. L'offerta minima per questo immobile è di soli 4094 €. Non perdere l'opportunità di fare un ottimo affare e di aggiudicarti questa proprietà.L'appartamento è situato al piano terzo di un edificio a Palermo, in via Generale Vincenzo Streva 21. Si tratta di un appartamento di cui si possiede 1/6 della proprietà. Altre informazioni specifiche sull'appartamento non sono disponibili.In pochi minuti si possono raggiungere i principali servizi tra i quali supermercato (1.04 km), poste (0.31 km), scuola (0.79 km), banca (0.24 km), bancomat (1.09 km), bar (0.29 km), fermata autobus (3.21 km), siti storici (0.72 km).",
  //     "url": "https://www.immobiliallasta.it/immobili/roma/roma/ex8691189/appartamento-all-asta-in-via-generale-v-streva"
  //   },
  //   {
  //     "title": "4 - Appartamento All'asta In Via Generale V Streva, N 21 - 90044 Carini (PA)- LOTTO 22003",
  //     "address": "via generale v streva, n 21 - 90044 Carini (PA)-Roma- Libertà - Villabianca",
  //     "id": "EX8691189",
  //     "auction_date": "04/12/2025",
  //     "mq": null,
  //     "rooms": "-",
  //     "price": "4094",
  //     "autonomous": false,
  //     "bathroom": "-",
  //     "energy class": "-",
  //     "description": "Partecipa all'asta di un appartamento situato in una zona centrale di Palermo, presso il Tribunale della città. L'offerta minima per questo immobile è di soli 4094 €. Non perdere l'opportunità di fare un ottimo affare e di aggiudicarti questa proprietà.L'appartamento è situato al piano terzo di un edificio a Palermo, in via Generale Vincenzo Streva 21. Si tratta di un appartamento di cui si possiede 1/6 della proprietà. Altre informazioni specifiche sull'appartamento non sono disponibili.In pochi minuti si possono raggiungere i principali servizi tra i quali supermercato (1.04 km), poste (0.31 km), scuola (0.79 km), banca (0.24 km), bancomat (1.09 km), bar (0.29 km), fermata autobus (3.21 km), siti storici (0.72 km).",
  //     "url": "https://www.immobiliallasta.it/immobili/roma/roma/ex8691189/appartamento-all-asta-in-via-generale-v-streva"
  //   },
  //   {
  //     "title": "5 - Appartamento All'asta In Via Generale V Streva, N 21 - 90044 Carini (PA)- LOTTO 22003",
  //     "address": "via generale v streva, n 21 - 90044 Carini (PA)-Roma- Libertà - Villabianca",
  //     "id": "EX8691189",
  //     "auction_date": "04/12/2025",
  //     "mq": null,
  //     "rooms": "-",
  //     "price": "4094",
  //     "autonomous": false,
  //     "bathroom": "-",
  //     "energy class": "-",
  //     "description": "Partecipa all'asta di un appartamento situato in una zona centrale di Palermo, presso il Tribunale della città. L'offerta minima per questo immobile è di soli 4094 €. Non perdere l'opportunità di fare un ottimo affare e di aggiudicarti questa proprietà.L'appartamento è situato al piano terzo di un edificio a Palermo, in via Generale Vincenzo Streva 21. Si tratta di un appartamento di cui si possiede 1/6 della proprietà. Altre informazioni specifiche sull'appartamento non sono disponibili.In pochi minuti si possono raggiungere i principali servizi tra i quali supermercato (1.04 km), poste (0.31 km), scuola (0.79 km), banca (0.24 km), bancomat (1.09 km), bar (0.29 km), fermata autobus (3.21 km), siti storici (0.72 km).",
  //     "url": "https://www.immobiliallasta.it/immobili/roma/roma/ex8691189/appartamento-all-asta-in-via-generale-v-streva"
  //   },
  //   {
  //     "title": "6 - Appartamento All'asta In Via Generale V Streva, N 21 - 90044 Carini (PA)- LOTTO 22003",
  //     "address": "via generale v streva, n 21 - 90044 Carini (PA)-Roma- Libertà - Villabianca",
  //     "id": "EX8691189",
  //     "auction_date": "04/12/2025",
  //     "mq": null,
  //     "rooms": "-",
  //     "price": "4094",
  //     "autonomous": false,
  //     "bathroom": "-",
  //     "energy class": "-",
  //     "description": "Partecipa all'asta di un appartamento situato in una zona centrale di Palermo, presso il Tribunale della città. L'offerta minima per questo immobile è di soli 4094 €. Non perdere l'opportunità di fare un ottimo affare e di aggiudicarti questa proprietà.L'appartamento è situato al piano terzo di un edificio a Palermo, in via Generale Vincenzo Streva 21. Si tratta di un appartamento di cui si possiede 1/6 della proprietà. Altre informazioni specifiche sull'appartamento non sono disponibili.In pochi minuti si possono raggiungere i principali servizi tra i quali supermercato (1.04 km), poste (0.31 km), scuola (0.79 km), banca (0.24 km), bancomat (1.09 km), bar (0.29 km), fermata autobus (3.21 km), siti storici (0.72 km).",
  //     "url": "https://www.immobiliallasta.it/immobili/roma/roma/ex8691189/appartamento-all-asta-in-via-generale-v-streva"
  //   },
  //   {
  //     "title": "7 - Appartamento All'asta In Via Generale V Streva, N 21 - 90044 Carini (PA)- LOTTO 22003",
  //     "address": "via generale v streva, n 21 - 90044 Carini (PA)-Roma- Libertà - Villabianca",
  //     "id": "EX8691189",
  //     "auction_date": "04/12/2025",
  //     "mq": null,
  //     "rooms": "-",
  //     "price": "4094",
  //     "autonomous": false,
  //     "bathroom": "-",
  //     "energy class": "-",
  //     "description": "Partecipa all'asta di un appartamento situato in una zona centrale di Palermo, presso il Tribunale della città. L'offerta minima per questo immobile è di soli 4094 €. Non perdere l'opportunità di fare un ottimo affare e di aggiudicarti questa proprietà.L'appartamento è situato al piano terzo di un edificio a Palermo, in via Generale Vincenzo Streva 21. Si tratta di un appartamento di cui si possiede 1/6 della proprietà. Altre informazioni specifiche sull'appartamento non sono disponibili.In pochi minuti si possono raggiungere i principali servizi tra i quali supermercato (1.04 km), poste (0.31 km), scuola (0.79 km), banca (0.24 km), bancomat (1.09 km), bar (0.29 km), fermata autobus (3.21 km), siti storici (0.72 km).",
  //     "url": "https://www.immobiliallasta.it/immobili/roma/roma/ex8691189/appartamento-all-asta-in-via-generale-v-streva"
  //   },
  //   {
  //     "title": "8 - Appartamento All'asta In Via Generale V Streva, N 21 - 90044 Carini (PA)- LOTTO 22003",
  //     "address": "via generale v streva, n 21 - 90044 Carini (PA)-Roma- Libertà - Villabianca",
  //     "id": "EX8691189",
  //     "auction_date": "04/12/2025",
  //     "mq": null,
  //     "rooms": "-",
  //     "price": "4094",
  //     "autonomous": false,
  //     "bathroom": "-",
  //     "energy class": "-",
  //     "description": "Partecipa all'asta di un appartamento situato in una zona centrale di Palermo, presso il Tribunale della città. L'offerta minima per questo immobile è di soli 4094 €. Non perdere l'opportunità di fare un ottimo affare e di aggiudicarti questa proprietà.L'appartamento è situato al piano terzo di un edificio a Palermo, in via Generale Vincenzo Streva 21. Si tratta di un appartamento di cui si possiede 1/6 della proprietà. Altre informazioni specifiche sull'appartamento non sono disponibili.In pochi minuti si possono raggiungere i principali servizi tra i quali supermercato (1.04 km), poste (0.31 km), scuola (0.79 km), banca (0.24 km), bancomat (1.09 km), bar (0.29 km), fermata autobus (3.21 km), siti storici (0.72 km).",
  //     "url": "https://www.immobiliallasta.it/immobili/roma/roma/ex8691189/appartamento-all-asta-in-via-generale-v-streva"
  //   },
  //   {
  //     "title": "9 - Appartamento All'asta In Via Generale V Streva, N 21 - 90044 Carini (PA)- LOTTO 22003",
  //     "address": "via generale v streva, n 21 - 90044 Carini (PA)-Roma- Libertà - Villabianca",
  //     "id": "EX8691189",
  //     "auction_date": "04/12/2025",
  //     "mq": null,
  //     "rooms": "-",
  //     "price": "4094",
  //     "autonomous": false,
  //     "bathroom": "-",
  //     "energy class": "-",
  //     "description": "Partecipa all'asta di un appartamento situato in una zona centrale di Palermo, presso il Tribunale della città. L'offerta minima per questo immobile è di soli 4094 €. Non perdere l'opportunità di fare un ottimo affare e di aggiudicarti questa proprietà.L'appartamento è situato al piano terzo di un edificio a Palermo, in via Generale Vincenzo Streva 21. Si tratta di un appartamento di cui si possiede 1/6 della proprietà. Altre informazioni specifiche sull'appartamento non sono disponibili.In pochi minuti si possono raggiungere i principali servizi tra i quali supermercato (1.04 km), poste (0.31 km), scuola (0.79 km), banca (0.24 km), bancomat (1.09 km), bar (0.29 km), fermata autobus (3.21 km), siti storici (0.72 km).",
  //     "url": "https://www.immobiliallasta.it/immobili/roma/roma/ex8691189/appartamento-all-asta-in-via-generale-v-streva"
  //   },
  // ])

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
