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

    // TODO: temp assignment to design
    results = [
        {
            "title": "Appartamento All'asta In Via Generale V Streva, N 21 - 90044 Carini (PA)- LOTTO 22003",
            "address": "via generale v streva, n 21 - 90044 Carini (PA)-Roma- Libertà - Villabianca",
            "id": "EX8691189",
            "auction_date": "04/12/2025",
            "mq": null,
            "rooms": "-",
            "price": "4094",
            "autonomous": false,
            "bathroom": "-",
            "energy class": "-",
            "description": "Partecipa all'asta di un appartamento situato in una zona centrale di Palermo, presso il Tribunale della città. L'offerta minima per questo immobile è di soli 4094 €. Non perdere l'opportunità di fare un ottimo affare e di aggiudicarti questa proprietà.L'appartamento è situato al piano terzo di un edificio a Palermo, in via Generale Vincenzo Streva 21. Si tratta di un appartamento di cui si possiede 1/6 della proprietà. Altre informazioni specifiche sull'appartamento non sono disponibili.In pochi minuti si possono raggiungere i principali servizi tra i quali supermercato (1.04 km), poste (0.31 km), scuola (0.79 km), banca (0.24 km), bancomat (1.09 km), bar (0.29 km), fermata autobus (3.21 km), siti storici (0.72 km).",
            "url": "https://www.immobiliallasta.it/immobili/roma/roma/ex8691189/appartamento-all-asta-in-via-generale-v-streva"
        },
        {
            "title": "Appartamento All'asta In Via Bastiglia 5, 00125 Roma Rm, Italia Roma, Roma- LOTTO UNICO",
            "address": "Via Bastiglia 5, 00125 Roma RM, Italia-Roma- Acilia",
            "id": "EX04386327",
            "auction_date": "19/11/2025",
            "mq": 182,
            "rooms": "-",
            "price": "205500",
            "autonomous": false,
            "bathroom": "-",
            "energy class": "-",
            "description": "Partecipa all'asta di un appartamento situato in una delle zone più ambite di Roma. Questa è un'opportunità unica per acquistare una proprietà in una delle città più affascinanti del mondo. L'offerta minima è di 205500 €, quindi non perdere l'occasione di fare un investimento vantaggioso. Contatta il tribunale di Roma per partecipare all'asta e assicurati di non lasciarti sfuggire questa opportunità.L'appartamento si trova a Roma, in Via Bastiglia n. 5, interno 1, al piano terra. È composto da ingresso, cucina, soggiorno, tre camere e due servizi igienici. Ha un'area esterna di proprietà e un locale accessorio esterno accessibile dall'area esterna. È identificato al Catasto Fabbricati del Comune di Roma al foglio 1111, particella 44, sub 501, z.c. 6, cat. A/2, classe 5, consistenza 7 vani, r.c. € 976,10, superficie catastale totale 182 mq, superficie catastale totale escluse aree scoperte 170 mq. Confina ad ovest con vano scala e negozio censito al subalterno 506, int. A, a nord ovest con distacco su Via Bastiglia, a nord est con rampa di accesso al piano seminterrato, a sud ovest con particella 664.L'immobile è stato edificato in assenza di Licenza Edilizia, ma è stata rilasciata una Concessione in Sanatoria n. 135586 del 06/10/1998. Inoltre, è stata ottenuta una Concessione in Sanatoria n. 223213 del 21/03/2000 per la realizzazione del magazzino esterno. Lo stato dei luoghi rilevato in sede di sopralluogo corrisponde a quanto rappresentato nella planimetria catastale del 1998 presente nel Fascicolo di Condono n. 30871 del 1995, fatta eccezione per un tramezzo che divide il soggiorno da una camera da letto ricavata di conseguenza.L'immobile è occupato dall’esecutato che vi abita con il proprio nucleo familiare. Non è presente il certificato di agibilità né è stata reperita alcuna richiesta relativa al rilascio dello stesso da particella del Comune di Roma.In pochi minuti si possono raggiungere i principali servizi tra i quali supermercato (0.73 km), poste (0.14 km), scuola (0.14 km), banca (2.22 km), bancomat (0.14 km), bar (0.14 km), fermata autobus (1.5 km), siti storici (0.58 km).",
            "url": "https://www.immobiliallasta.it/immobili/roma/roma/ex04386327/appartamento-all-asta-in-via-bastiglia-5-00125-roma-rm-italia-roma"
        }
    ]

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
            <div className="result-card-container" key={res.id}>
                <h3 className="result-card-title">{res.title}</h3>

                <div className="result-card-info-container">
                    <span className="result-card-single-info">
                        <Calendar className="result-info-icon" />
                        <p className="flex "> {res.auction_date || "-"}</p>
                    </span>
                    <span className="result-card-single-info">
                        <RulerDimensionLine className="result-info-icon"/>
                        <p className="flex ">{res.mq || "-"}</p>
                    </span>
                    <span className="result-card-single-info">
                        <Euro className="result-info-icon"/>
                        <p className="flex font-semibold">{res.price ? formatMoney(res.price) : "-"}</p>
                    </span>
                </div>

                <p className="result-description">{res.description || "Nessuna descrizione disponibile"}</p>

                <span className="flex flex-row pt-4 gap-2">
                    <p className="text-gray-500">Source:</p>
                    <a href="https://www.immobiliallasta.it/" className="text-gray-600 underline underline-offset-2">
                        {/* // TODO: questo valore dovrà essere dinamico */}
                        <b>Immobiliallasta</b>
                    </a>
                </span>

                {/* <div className="result-button-container"> */}
                    <a
                        className="result-button"
                        href={res.url}
                    >
                        Scopri di più
                    </a>
                {/* </div> */}
            </div>
        );
    }

    return (
        <div className="result-page-container">
            <h1 className="h2-title">Risultati</h1>
            <div className="result-grid-container">
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