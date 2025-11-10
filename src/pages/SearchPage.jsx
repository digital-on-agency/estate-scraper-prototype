import React, { useState } from "react";
import PropTypes from "prop-types";
import {
    SearchTypeOption,
    WhyOptions,
    STEP_TITLE
} from "../lib/constants";
import {
    DoubleSlider,
    AutocompleteSearchBar,
    MultilineTextField,
    BackButton,
    ProceedButton
} from "../components/UiComponents";
import {
    Euro,
    RulerDimensionLine,
    BedDouble,
    CircleX
} from "lucide-react";
import comuni from "../data/comuni";
import { scrape } from "../lib/api";

/**
 * **BASEFILTER**
 * 
 * Defines the default structure for the *property search filter* object.
 * Each key represents a filtering criterion used to query real estate listings.
 * 
 * The object acts as the **initial state** for filters and ensures that
 * all fields exist even before user interaction.  
 * Default values are set to `null`, meaning *no filter applied*.
 * 
 * ---
 * 
 * @property {string|null} city  
 * The city name where the property search is performed.  
 * Example: `"Milano"`, `"Roma"`, or `null` if unspecified.
 * 
 * @property {number|null} type  
 * The type of property selected.  
 * Expected numeric codes:  
 * - `1` → Residential property  
 * - `2` → Commercial property  
 * - `3` → Land  
 * - `4` → Garage  
 * `null` means *all property types* are included.
 * 
 * @property {number|null} lower_price  
 * The minimum price threshold (in euros).  
 * Example: `100000` means properties priced above €100,000.
 * 
 * @property {number|null} higher_price  
 * The maximum price threshold (in euros).  
 * Example: `400000` means properties priced below €400,000.
 * 
 * @property {number|null} lower_mq  
 * The minimum surface area (in square meters).  
 * Example: `50` → only properties larger than 50 m².
 * 
 * @property {number|null} higher_mq  
 * The maximum surface area (in square meters).  
 * Example: `120` → only properties smaller than 120 m².
 * 
 * @property {number|null} lower_rooms  
 * The minimum number of rooms required.  
 * Example: `2` → only properties with two or more rooms.
 * 
 * @property {number|null} higher_rooms  
 * The maximum number of rooms allowed.  
 * Example: `5` → only properties with five or fewer rooms.
 * 
 * ---
 * 
 * @usage
 * ```js
 * // Import or define the base filter
 * const filter = { ...BASEFILTER };
 * 
 * // Example: filtering apartments in Milan between 100k€ and 300k€
 * filter.city = "Milano";
 * filter.lower_price = 100000;
 * filter.higher_price = 300000;
 * 
 * // Pass the filter to a search function
 * fetchProperties(filter);
 * ```
 */
const BASEFILTER = {
    "city": "",
    "type": null,
    "lower_price": null,
    "higher_price": null,
    "lower_mq": null,
    "higher_mq": null,
    "lower_rooms": null,
    "higher_rooms": null,
    "why": 0, // 0 for capital gain and 1 for the first house
    "request_description": ""
}

async function tempScrape(
    filter,
    setError = () => { console.error("[TEMPSCRAPE]: setError non è definita") },
    setLoading = () => { console.error("[TEMPSCRAPE]: setLoading non è definita") },
) {
    // usiamo performance.now per misurare il tempo di esecuzione
    const startTime = performance.now();

    try {
        setLoading(true)
        // Log non invasivo per debugging locale
        console.log("[tempScrape] payload:", filter)

        const result = await scrape(filter);
        console.log("[tempScrape] risultato:", result)

        setLoading(false);
        // Prima di restituire il risultato, calcoliamo il tempo totale
        const endTime = performance.now();
        console.log(`[tempScrape] Tempo impiegato: ${((endTime - startTime) / 1000).toFixed(2)} secondi`);

        return result
    } catch (err) {
        console.error("[tempScrape] errore chiamando scrape:", err)

        // Normalizza messaggio utente
        const isAbort = err?.name === "AbortError"
        const rawMessage = typeof err?.message === "string" ? err.message : ""

        let userMessage = "Si è verificato un problema imprevisto. Riprova più tardi."
        if (isAbort) {
            userMessage = "La richiesta ha impiegato troppo tempo e è stata interrotta. Riprova."
        } else if (/^API\s+\d{3}/.test(rawMessage)) {
            // Messaggi formattati da api.js (es. "API 500: ...")
            userMessage = "Il server ha risposto con un errore. Riprova più tardi."
        } else if (rawMessage) {
            userMessage = rawMessage
        }

        setLoading(false)
        setError({
            title: "Errore nella ricerca",
            paragraph: userMessage,
            buttonText: "Torna alla ricerca",
            buttonLink: "/search",
            mainColor: "red-600",
            onClick: () => { setError(null) }
        })

        // In caso di errore restituisce null per permettere al chiamante di gestire il flusso
        return null
    }
}

SearchSectionTitle.propTypes = {
    step: PropTypes.number.isRequired,
    className: PropTypes.string,
};

/**
 * **SearchSectionTitle**
 * 
 * React functional component responsible for displaying the **section title**
 * of the property search wizard interface.  
 * 
 * It dynamically selects and renders the correct heading text based on the current
 * wizard step, using the predefined mapping in `STEP_TITLE`.  
 *  
 * The component ensures **graceful fallback** when `step` is out of range, defaulting to the first title (`STEP_TITLE[0]`).
 *  
 * Additionally, the `<h1>` element includes `aria-live="polite"` to
 * announce step changes to screen readers for better accessibility (a11y).
 * 
 * ---
 * 
 * @component
 * 
 * @param {Object} props  
 * The component props.
 * 
 * @param {number} props.step  
 * Numeric index of the current wizard step.  
 * Accepts only `0`, `1`, or `2`:  
 * - `0` → “Cosa stai cercando?”  
 * - `1` → “Dove lo stai cercando?”  
 * - `2` → “Perché lo stai cercando?”  
 * If the value is outside this range, the title safely falls back to step `0`.
 * 
 * @param {string} [props.className="text-3xl font-semibold tracking-tight"]  
 * Optional CSS class string applied to the `<h1>` element.  
 * Defaults to `"text-3xl font-semibold tracking-tight"`.  
 * Used to style the section heading (e.g., typography or spacing adjustments).
 * 
 * @returns {JSX.Element}  
 * A semantic `<h1>` element containing the step title.
 * 
 * ---
 * 
 * @example
 * ```js
 * import { SearchSectionTitle } from "./SearchSectionTitle";
 * 
 * function SearchWizard({ step }) {
 *   return (
 *     <header className="mb-6">
 *       <SearchSectionTitle step={step} />
 *     </header>
 *   );
 * }
 * ```
 * 
 * @usage
 * ```js
 * // Renders: "Dove lo stai cercando?"
 * <SearchSectionTitle step={1} className="text-4xl text-cinnabar" />;
 * ```
 */
export function SearchSectionTitle({ step, className = "text-3xl font-semibold tracking-tight" }) {
    // safe fallback if step is out of range
    const title = STEP_TITLE[step] ?? STEP_TITLE[0];

    return (
        <h1
            className={className}
            // optional: gently announce the change to screen readers
            aria-live="polite"
        >
            {title}
        </h1>
    );
}

/**
 * **FilterSection**
 * 
 * React functional component that renders the **first step** of the property search wizard:
 * “Cosa stai cercando?”.  
 *  
 * It provides the user interface for defining the **base search filters**, including:
 * - **Property Type** (via radio-like button list)
 * - **Price Range** (via a double slider)
 * - **Surface Area (m²)** (via a double slider)
 * - **Number of Rooms** (via a double slider)
 * 
 * All changes are propagated to the parent component through the `setFilter` callback,
 * updating the shared `filter` state (based on the `BASEFILTER` schema).
 * 
 * ---
 * 
 * ### 🧩 Internal Structure
 * 
 * | Subsection | Component | Description |
 * |-------------|------------|-------------|
 * | **Type** | Inline `<ul>` with buttons | Lets the user select the property type (`filter.type`). |
 * | **Price** | `<DoubleSlider>` | Controls `lower_price` and `higher_price` fields. |
 * | **Metri Quadri** | `<DoubleSlider>` | Controls `lower_mq` and `higher_mq` fields. |
 * | **Locali** | `<DoubleSlider>` | Controls `lower_rooms` and `higher_rooms` fields. |
 * 
 * ---
 * 
 * @component
 * 
 * @param {Object} props  
 * Component props.
 * 
 * @param {Filter} props.filter  
 * The current **filter object**, following the `BASEFILTER` structure.  
 * Determines the current selection of property type and numeric ranges.  
 * Example:
 * ```js
 * {
 *   type: 1,
 *   lower_price: 100000,
 *   higher_price: 400000,
 *   lower_mq: 50,
 *   higher_mq: 120,
 *   lower_rooms: 2,
 *   higher_rooms: 5
 * }
 * ```
 * 
 * @param {Function} props.setFilter  
 * React state setter used to update the filter.  
 * Accepts a callback with the previous state and returns the new state.  
 * Example:
 * ```js
 * setFilter(prev => ({ ...prev, lower_price: 150000 }));
 * ```
 * 
 * @returns {JSX.Element}  
 * A responsive section (`<div>`) containing all filter input controls.  
 * Divided horizontally into a **Type subsection** (1/3 width)
 * and a **Sliders subsection** (2/3 width).
 * 
 * ---
 * 
 * @usage
 * ```js
 * import { FilterSection } from "./FilterSection";
 * 
 * export function SearchWizard() {
 *   const [filter, setFilter] = useState(BASEFILTER);
 * 
 *   return (
 *     <section className="p-6 bg-wheat rounded-xl shadow-md">
 *       <FilterSection filter={filter} setFilter={setFilter} />
 *     </section>
 *   );
 * }
 * ```
 * 
 * ---
 * 
 * @accessibility
 * - Each interactive control uses a semantic element (`<button>` or `<input>`).  
 * - `aria-live` and visual cues ensure clarity for all users.
 */
export function FilterSection({ filter, setFilter }) {
    return (
        <div className="filter-section-container">
            {/* Type Subsection */}
            <div className="filter-type-container">
                <h1 className="h3-title h-[40px] border-b-4 rounded-xl">
                    Tipologia Immobile
                </h1>

                <ul>
                    {SearchTypeOption.map((opt) => (
                        <li key={String(opt.value)} className="flex flex-row items-center pl-4">
                            <div
                                className={`filter-type-circle ${filter?.type == opt.value ? 'bg-secondary' : ''}`}
                            />
                            <button
                                type="button"
                                onClick={() =>
                                    setFilter((prev) => ({ ...prev, type: opt.value }))
                                }
                                className={`filter-type-option ${filter?.type === opt.value
                                    ? "font-bold text-primary"
                                    : ""
                                    }`}
                            >
                                {opt.label}
                            </button>
                        </li>
                    ))}
                    {/* TODO: this solution is bad: below there is a "tutte le tipologie" transparent option to avoid change width when "tutte le tipologie" is selected and deselected */}
                    <li key="atemp" className="flex flex-row items-center pl-4">
                        <div
                            className={`filter-type-circle border-transparent`}
                        />
                        <span
                            onClick={() => {}}
                            disabled
                            className={"flex w-full text-left py-2 px-3 font-bold text-transparent"}
                        >
                            Tutte le tipologie
                        </span>
                    </li>
                </ul>
            </div>
            <div className="filter-slider-container">
                {/* Price Subsection */}
                <DoubleSlider
                    title={"Prezzo"}
                    icon={Euro}
                    label="Prezzo"
                    value={[
                        Number(filter?.lower_price ?? 0),
                        Number(filter?.higher_price ?? 9_999_999),
                    ]}
                    min={0}
                    max={9_999_999}
                    step={5_000}
                    onCommit={([lo, hi]) =>
                        setFilter(prev => ({ ...prev, lower_price: lo, higher_price: hi }))
                    }
                />
                {/* Mq Subsection */}
                <DoubleSlider
                    title={"Metri Quadri"}
                    icon={RulerDimensionLine}
                    label={"Metratura"}
                    value={[
                        filter?.lower_mq ?? 0,
                        filter?.higher_mq ?? 700
                    ]}
                    min={0}
                    max={700}
                    step={5}
                    onCommit={([lo, hi]) =>
                        setFilter(prev => ({ ...prev, lower_mq: lo, higher_mq: hi }))
                    }
                />
                {/* Rooms Subsection */}
                <DoubleSlider
                    title={"Locali"}
                    icon={BedDouble}
                    label={"Locali"}
                    value={[
                        filter?.lower_rooms ?? 1,
                        filter?.higher_rooms ?? 20
                    ]}
                    min={1}
                    max={20}
                    step={1}
                    onCommit={([lo, hi]) =>
                        setFilter(prev => ({ ...prev, lower_rooms: lo, higher_rooms: hi }))
                    }
                />
            </div>
        </div>
    );
}

/**
 * **CitySection**
 * 
 * React functional component representing the **second step** of the property search wizard:
 * **“Dove lo stai cercando?”**  
 *  
 * This section allows the user to select the **city or locality** in which they are searching
 * for a property.  
 * It uses the `AutocompleteSearchBar` component combined with a curated list of Italian cities (`comuni`)
 * to offer a smooth and accurate autocomplete experience.
 * 
 * ---
 * 
 * ### 🧭 Behavior
 * - Displays a centered autocomplete input with a clear label.  
 * - When the user selects a city, `handleSelect` updates `filter.city` via `setFilter`.  
 * - The current selection is controlled by `filter.city`.  
 * - The autocomplete suggestions are filtered through the custom `cityFilter` algorithm
 *   (accent-insensitive and similarity-ranked).
 * 
 * ---
 * 
 * @component
 * 
 * @param {Object} props  
 * Component props.
 * 
 * @param {Filter} props.filter  
 * The current **filter object**, following the `BASEFILTER` schema.  
 * Only the `city` property is read and updated in this section.
 * 
 * @param {(updater: (prev: Filter) => Filter) => void} props.setFilter  
 * State setter function for updating the global `filter`.  
 * Used internally to update `filter.city` when a city is selected.
 * 
 * @returns {JSX.Element}  
 * A responsive, full-width container with an `AutocompleteSearchBar`
 * centered horizontally and vertically.
 * 
 * ---
 * 
 * @example
 * ```jsx
 * import { CitySection } from "./CitySection";
 * import { BASEFILTER } from "../constants";
 * 
 * function SearchWizard() {
 *   const [filter, setFilter] = useState(BASEFILTER);
 * 
 *   return (
 *     <CitySection filter={filter} setFilter={setFilter} />
 *   );
 * }
 * ```
 * 
 * ---
 * 
 * @usage
 * - Step 2 of the wizard (“Dove lo stai cercando?”).  
 * - Pairs with `AutocompleteSearchBar` for user-friendly city selection.  
 * - Typically follows the `FilterSection` (step 0) in the overall flow.
 * 
 * @accessibility
 * - The autocomplete supports keyboard navigation and suggestion highlighting.  
 * - The label clearly communicates the field’s purpose: `"Seleziona il comune in cui stai cercando"`.
 */
export function CitySection({ filter, setFilter }) {

    /**
     * **handleSelect**
     * 
     * Callback handler that updates the current **search filter state**
     * with the city selected from the `AutocompleteSearchBar`.
     * 
     * It merges the existing `filter` object (from `BASEFILTER`)
     * with the new `city` value, preserving all other filter fields.
     * 
     * ---
     * 
     * @function handleSelect
     * @param {string|null} val  
     * The selected city name.  
     * - If a valid string (e.g. `"Roma"`), it updates `filter.city`.  
     * - If `null`, it clears the `city` field from the filter.
     * 
     * @returns {void}  
     * No return value. The function triggers a state update via `setFilter`.
     * 
     * ---
     * 
     * @example
     * ```js
     * // Parent state
     * const [filter, setFilter] = useState(BASEFILTER);
     * 
     * // Handler
     * const handleSelect = (val) => {
     *   setFilter(prev => ({ ...prev, city: val }));
     * };
     * 
     * // Usage inside JSX
     * <AutocompleteSearchBar
     *   value={filter.city}
     *   setValue={handleSelect}
     *   options={cities}
     *   label="Comune o località"
     * />
     * ```
     * 
     * ---
     * 
     * @usage
     * Use this callback as the `setValue` prop of `AutocompleteSearchBar`
     * (typically in step 1 of the search wizard: “Dove lo stai cercando?”).
     */
    const handleSelect = (val) => {
        setFilter(prev => ({ ...prev, city: val }));
    };

    return (
        <div className="w-full h-full flex flex-row items-center justify-center">
            <AutocompleteSearchBar
                options={comuni}
                label="Seleziona il comune in cui stai cercando"
                value={filter["city"]}
                setValue={handleSelect}
            />
        </div>
    );
}

/**
 * **WhySection**
 * 
 * React functional component representing the **third step** of the property search wizard:  
 * *“Perché lo stai cercando?”*.  
 * 
 * This section collects contextual information about the **purpose of the property search**
 * (e.g., *investimento* or *prima casa*) and allows the user to optionally add a custom description
 * of specific needs or additional requirements.
 * 
 * ---
 * 
 * ### 🧩 Internal Structure
 * 
 * | Subsection | Description |
 * |-------------|-------------|
 * | **Motivation Selector** | A horizontal list of motivation options (`WhyOptions`), each clickable. Selecting one updates `filter.why`. |
 * | **Optional Description** | A multiline input field (`MultilineTextField`) where the user can write a free-text note stored in `filter.request_description`. |
 * 
 * ---
 * 
 * @component
 * 
 * @param {Object} props  
 * Component props.
 * 
 * @param {Filter} props.filter  
 * The current search filter object.  
 * Used to determine the active `why` selection and the content of the optional description field.
 * 
 * @param {Function} props.setFilter  
 * State setter function to update the `filter` object.  
 * Called whenever the user selects a motivation or edits the text description.  
 * Example:
 * ```js
 * setFilter(prev => ({ ...prev, why: opt.value }));
 * setFilter(prev => ({ ...prev, request_description: e.target.value }));
 * ```
 * 
 * @returns {JSX.Element}  
 * A vertically divided section with:
 * - a **motivation selector** (top 3/8 rows), and  
 * - an **optional multiline description** (bottom 5/8 rows).
 * 
 * ---
 * 
 * @example
 * ```jsx
 * <WhySection
 *   filter={filter}
 *   setFilter={setFilter}
 * />
 * ```
 * 
 * ---
 * 
 * @usage
 * - Typically used as **step 2 → “Perché lo stai cercando?”** in the property search wizard.  
 * - Complements previous steps (“Cosa stai cercando?” and “Dove lo stai cercando?”).  
 * - Stores user motivation in `filter.why` and optional notes in `filter.request_description`.
 * 
 * @accessibility
 * - Each option can be selected via both button click and keyboard focus.  
 * - The multiline input includes a descriptive label and placeholder for clarity.
 */
export function WhySection({ filter, setFilter }) {
    return (
        <div className="w-full h-full grid grid-rows-8">
            {/* capital gain or abitative ? */}
            <div className="row-span-3 flex justify-center">
                <ul className="w-2/3 h-full flex flex-row justify-between">
                    {WhyOptions.map((opt) => (
                        <li key={String(opt.value)} className="flex flex-row items-center pl-4">
                            <div
                                onClick={() =>
                                    setFilter((prev) => ({ ...prev, why: opt.value }))
                                }
                                className={`w-[17px] h-[15px] border-2 border-cinnabar rounded-full ${filter?.why == opt.value ? 'bg-cinnabar' : ''}`}
                            />
                            <button
                                type="button"
                                onClick={() =>
                                    setFilter((prev) => ({ ...prev, why: opt.value }))
                                }
                                className={`w-full text-left text-xl py-2 px-3 ${filter?.why === opt.value
                                    ? "font-bold"
                                    : ""
                                    }`}
                            >
                                {opt.label}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
            {/* little desciption (optional) */}
            <div className="row-span-5 w-full">
                <h2 className="text-xl font-semibold tracking-tight" >Manca qualcosa?</h2>
                <p className="text-sm text-gray-500 mb-2"
                >Se c'è qualche caratteristicha importante che non è stata nominata fin'ora, scrivila qui sotto</p>
                <MultilineTextField
                    id="description-input-multiline"
                    label="(Opzionale)"
                    value={filter?.request_description ?? ""}
                    onChange={(e) => setFilter(prev => ({ ...prev, request_description: e.target.value }))}
                />
            </div>

        </div>
    );
}

/**
 * **ErrorSection**
 * 
 * React functional component that renders a **user-friendly error message screen**  
 * when an unexpected issue occurs within the application or wizard interface.  
 * 
 * The layout centers a red error icon, a title (“Si è verificato un errore”),  
 * and a customizable message passed through the `message` prop.
 * 
 * It is designed to replace or overlay the current view, maintaining consistent styling
 * with other wizard sections.
 * 
 * ---
 * 
 * @component
 * 
 * @param {Object} props  
 * Component props.
 * 
 * @param {string} props.message  
 * Text describing the specific error or context.  
 * Displayed below the main error title to give more clarity to the user.  
 * Example: `"Impossibile caricare i risultati di ricerca."`
 * 
 * @returns {JSX.Element}  
 * A centered, styled container showing an error icon, title, and descriptive message.
 * 
 * ---
 * 
 * @example
 * ```jsx
 * <ErrorSection message="Connessione al server non riuscita. Riprova più tardi." />
 * ```
 * 
 * ---
 * 
 * @usage
 * - Serves as the **error fallback view** in the property search wizard or related UI components.  
 * - Can be displayed when API requests fail, when filters return no results,  
 *   or when an unexpected rendering error occurs.  
 * - The `message` prop can contain either a user-facing explanation or a technical summary.
 * 
 * @accessibility
 * - Uses large red icon (`CircleX`) and bold text for high visibility.  
 * - The message is read naturally by screen readers as part of the content flow.
 */
export function ErrorSection({ message }) {
    return (
        <div className="section-container justify-center">
            <CircleX className="message-section-icon" />
            <h1 className="section-error-message mb-8">
                Si è verificato un errore
            </h1>
            <p>{message}</p>
            {/* <ErrorSection message={message} /> */}
            {/* <div className="w-full h-full">
                
            </div> */}
        </div>
    );
}

// TODO: jsdoc
export function SectionContainer({
    step = 0,
    setStep,
    itemClassName = "",
    filter,
    setFilter = () => { console.log("setFilter is not defined") },
    setError = () => { console.log("setError is not defined") },
    setLoading = () => { console.log("setLoading is not defined") },
    setResults = () => { console.log("setResults is not defined") }
}) {
    const [sectionError, setSectionError] = useState(null);
    const [pageError, setPageError] = useState(null);//"Si è verificato un errore generico, riprova più tardi o contatta il supporto")

    const sectionEl = React.useMemo(() => {
        switch (step) {
            case 0: return <FilterSection filter={filter} setFilter={setFilter} />;
            case 1: return <CitySection filter={filter} setFilter={setFilter} />;
            case 2: return <WhySection filter={filter} setFilter={setFilter} />;
            default:
                console.error("[Wizard] Invalid step:", step);
                return <p className="text-red-600">Errore tecnico: step non valido.</p>;
        }
    }, [step, filter, setFilter]); // ricrea l'elemento, ma se il tipo resta lo stesso (es. WhySection) NON viene smontato


    // TODO: JSDoc
    const buttonOnSubmit = async () => {
        if (step == 0) {
            setStep(step + 1)
        } else if (step == 1) {
            if (!filter["city"] || filter["city"] == null || filter["city"] == "") {
                setSectionError("Inserire un comune valido per andare avanti")
            } else {
                setSectionError(null)
                setStep(step + 1)
            }
        } else if (step == 2) {
            // TODO: final submit -> start search with parameters
            // TODO: temp debug print
            console.log("SUBMITTED FILTER (2-final):")
            console.log(filter)
            const res = await tempScrape(filter, setError, setLoading)

            // TODO: temp debug print
            console.log("res keys: " + Object.keys(res))
            console.log("res.ok: " + res.ok);
            console.log("res:")
            console.log(res)

            if (res.ok) {
                setResults(res.results)
                // TODO: temp debug print
                console.log("results filled:");
            }
        } else {
            setError("Si è verificato un errore generico, riprova più tardi o contatta il supporto");
            console.error("ERROR: the value of `step` is not allowed (must be 0, 1, or 2) - `step`: " + step)
        }
    }

    /**
     * **buttonBackClick**
     * 
     * Event handler that manages the **backward navigation** in the property search wizard.  
     * 
     * It resets any existing section-level error state (`setSectionError(null)`)  
     * and decrements the current `step` value when possible.  
     * 
     * If the current step is invalid (not `1` or `2`), the function logs a detailed error message  
     * and sets a generic fallback error for user feedback.
     * 
     * ---
     * 
     * @function buttonBackClick
     * 
     * @returns {void}  
     * No return value. Updates component state through side effects (`setSectionError`, `setStep`, `setError`).
     * 
     * ---
     * 
     * ### 🧠 Behavior Summary
     * | Condition | Action |
     * |------------|--------|
     * | `step === 1` or `step === 2` | Decrements the step (`setStep(step - 1)`). |
     * | Otherwise | Logs an error and sets a generic fallback error message. |
     * 
     * ---
     * 
     * @example
     * ```js
     * const buttonBackClick = () => {
     *   setSectionError(null);
     *   if (step === 1 || step === 2) {
     *     setStep(step - 1);
     *   } else {
     *     setError("Si è verificato un errore generico, riprova più tardi o contatta il supporto");
     *     console.error("ERROR: the value of `step` is not allowed (must be 1 or 2) - step:", step);
     *   }
     * };
     * ```
     * 
     * ---
     * 
     * @usage
     * - Used as the `onClickFunction` handler for the **BackButton** component.  
     * - Ensures safe step navigation and proper error recovery between wizard sections.  
     * - Typically invoked when the user clicks “Indietro”.
     */
    const buttonBackClick = () => {
        setSectionError(null)
        if (step == 1 || step == 2) {
            setStep(step - 1)
        } else {
            setError("Si è verificato un errore generico, riprova più tardi o contatta il supporto");
            console.error("ERROR: the value of `step` is not allowed (must be 1 or 2) - `step`: " + step)
        }
    }

    if (pageError != null) {
        return (
            <ErrorSection message={pageError} />
        );
    }

    return (
        <div className="section-container">
            <SearchSectionTitle step={step} className="section-title" />
            {/* <SelectSection /> */}
            {sectionEl}
            <div className="section-error-message">
                {sectionError ?
                    <p className="">{sectionError}</p>
                    :
                    <></>
                }
            </div>
            <div className="flex flex-row w-2/3 justify-between">
                {step == 0 ?
                    <div />
                    :
                    <BackButton onClickFunction={buttonBackClick} />
                }
                <ProceedButton step={step} onSubmit={buttonOnSubmit} />
            </div>
        </div>
    );
}

// TODO: jsdoc
export default function SearchPage({ setError, setLoading, setResults }) {
    /** **filter state:** React state hook that stores the **current set of active search filters**
     * 
     * for the property listing interface.  
     * 
     * Initialized with `BASEFILTER`, it provides a reactive object representing
     * all filter criteria (city, price, surface, rooms, etc.).  
     * The state is updated whenever the user modifies filter inputs (e.g., range selectors, dropdowns).
     * 
     * ---
     * 
     * @constant
     * @type {[Filter, Function]}
     * 
     * @property {Filter} filter  
     * The current filter object containing the selected criteria.  
     * Initialized as a copy of `BASEFILTER`, meaning all values are `null` until user input.  
     * Example structure:  
     * ```js
     * {
     *   city: "Milano",
     *   type: 1,
     *   lower_price: 100000,
     *   higher_price: 300000,
     *   lower_mq: 50,
     *   higher_mq: 120,
     *   lower_rooms: 2,
     *   higher_rooms: 4
     * }
     * ```
     * 
     * @property {Function} setFilter  
     * React state setter function used to update the `filter` state.  
     * Accepts either:
     * - a **new object** → replaces the entire state, or  
     * - a **callback function** → receives the previous state and returns the updated one.  
     * Example usage:
     * ```js
     * setFilter(prev => ({ ...prev, lower_price: 150000 }));
     * ```
     * 
     * ---
     * 
     * @usage
     * ```js
     * // Initialize the filter state
     * const [filter, setFilter] = useState(BASEFILTER);
     * 
     * // Example: update filter when user selects a new city
     * const handleCityChange = (cityName) => {
     *   setFilter(prev => ({ ...prev, city: cityName }));
     * };
     * ```
     */
    const [filter, setFilter] = useState(BASEFILTER);
    /** **state:** React state hook controlling the **current step** of the property search wizard.
     *  
     * The wizard is composed of three progressive stages that guide the user
     * through a structured search process:
     * 
     * | Step | Value | Description |
     * |------|--------|-------------|
     * | **0** | `"Cosa stai cercando?"` | User selects the type of property and defines the basic filters (type, price, surface, rooms). |
     * | **1** | `"Dove lo stai cercando?"` | User specifies the geographical location — city, municipality, or local area. |
     * | **2** | `"Perché lo stai cercando?"` | User provides contextual motivations or intent (e.g., investment, relocation, personal use). |
     * 
     * Each numeric value corresponds to a **distinct UI section** and determines what inputs are visible or active.
     * 
     * ---
     * 
     * @constant
     * @type {[number, Function]}
     * 
     * @property {number} state  
     * The current step of the search flow.  
     * Accepts only the values `0`, `1`, or `2`.
     * 
     * @property {Function} setState  
     * React state setter function used to update the current step.  
     * Accepts either a number or a callback function receiving the previous state.  
     * Example:
     * ```js
     * setState(1);              // go to step 1
     * setState(prev => prev+1); // advance to next step
     * ```
     * 
     * ---
     * 
     * @usage
     * ```js
     * // Initialize wizard state
     * const [state, setState] = useState(0);
     * 
     * // Example: move to next section when filters are complete
     * const handleNext = () => {
     *   if (state < 2) setState(state + 1);
     * };
     * 
     * // Conditional rendering
     * {state === 0 && <FilterStep />}
     * {state === 1 && <LocationStep />}
     * {state === 2 && <PurposeStep />}
     * ```
     */
    const [step, setStep] = useState(0);

    return (
        <div className="main-container">
            <SectionContainer
                step={step}
                setStep={setStep}
                itemClassName="text-black"
                filter={filter}
                setFilter={setFilter}
                setError={setError}
                setLoading={setLoading}
                setResults={setResults}
            />
        </div>
    );
}