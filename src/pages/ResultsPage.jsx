import React from "react";
import {
    Euro,
    RulerDimensionLine,
    BedDouble,
    CircleX,
    Calendar
} from "lucide-react";

function formatMoney(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export default function ResultsPage({
    results
}) {
    // TODO: temp debug print
    console.log("single result:")
    console.log(results);

    // {
    //     "title": "Appartamento All'asta In Via Generale V Streva, N 21 - 90044 Carini (PA)- LOTTO 22003",
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
    // }

    const renderResult = (res) => {
        return (
            <div className="w-full h-full flex flex-col items-start justify-start p-6 bg-white shadow-lg rounded-xl" key={res.id}>
                <h3 className="text-lg font-semibold line-clamp-1">{res.title}</h3>

                <div className="w-full flex flex-row justify-between px-6 pt-3 pb-5 text-gray-500">
                    <span className="flex flex-row gap-2">
                        <Calendar />
                        <p className="flex "> {res.auction_date || "-"}</p>
                    </span>
                    <span className="flex flex-row gap-2">
                        <RulerDimensionLine />
                        <p className="flex ">{res.mq || "-"}</p>
                    </span>
                    <span className="flex flex-row gap-2">
                        <Euro />
                        <p className="flex font-semibold">{res.price ? formatMoney(res.price) : "-"}</p>
                    </span>
                </div>

                <p className="line-clamp-5 text-gray-600">{res.description || "Nessuna descrizione disponibile"}</p>

                <span className="flex flex-row pt-4 gap-2">
                    <p className="text-gray-500">Source:</p>
                    <a href="https://www.immobiliallasta.it/" className="text-gray-600 underline underline-offset-2">
                        {/* // TODO: questo valore dovrà essere dinamico */}
                        <b>Immobiliallasta</b>
                    </a>
                </span>

                <div className="w-full flex flex-row justify-center mt-5">
                    <a
                        className="w-full py-3 text-center bg-linear-to-r from-cinnabar/80 to-cinnabar hover:from-cinnabar/90 hover:to-cinnabar/70 text-white font-bold tracking-wider"
                        href={res.url}
                    >
                        Scopri di più
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col justify-start items-center p-10 space-y-8 bg-gray-100">
            <h1>TEMP TITLE</h1>
            <div className="w-full grid grid-cols-2 gap-6">
                {results === null ? (
                    <p>Caricamento...</p>
                ) : Array.isArray(results) && results.length > 0 ? (
                    results.map((res) => renderResult(res))
                ) : (
                    <p>Nessun risultato disponibile.</p>
                )}

            </div>
        </div>
    );
}