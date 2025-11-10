import React, { useState } from "react";
import PropTypes from "prop-types";
import {
    SearchTypeOption,
    WhyOptions,
    STEP_TITLE,
} from "../lib/constants";
import {
    DoubleSlider,
    AutocompleteSearchBar,
    MultilineTextField,
    BackButton,
    ProceedButton,
    DoubleSelector
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
    "why": null,
    "request_description": ""
}

/**
 * **tempScrape**
 *
 * Asynchronous helper function that performs a **temporary test call** to the `scrape` API  
 * and handles both **loading state management** and **error normalization** for user feedback.  
 * 
 * It measures the total execution time using `performance.now()` and logs diagnostics for debugging.  
 * On success, it returns the raw API result; on failure, it sets a formatted error object via `setError`
 * and returns `null`.
 *
 * ---
 *
 * @async
 * @function tempScrape
 *
 * @param {Filter} filter  
 * The search filter object sent to the scraping API.  
 * Must include properties such as `city`, `type`, `lower_price`, `higher_mq`, etc.
 *
 * @param {Function} [setError=() => { console.error("[TEMPSCRAPE]: setError non è definita") }]  
 * Callback function used to report user-facing errors.  
 * Called with an **error object** containing fields like:
 * ```js
 * {
 *   title: "Errore nella ricerca",
 *   paragraph: "Si è verificato un problema imprevisto. Riprova più tardi.",
 *   buttonText: "Torna alla ricerca",
 *   buttonLink: "/search",
 *   mainColor: "red-600",
 *   onClick: () => setError(null)
 * }
 * ```
 *
 * @param {Function} [setLoading=() => { console.error("[TEMPSCRAPE]: setLoading non è definita") }]  
 * Callback function used to toggle loading indicators in the UI.  
 * Automatically set to `true` at the start of the operation and reset to `false`
 * when the process completes or fails.
 *
 * @returns {Promise<Object|null>}  
 * Resolves with the JSON result returned from `scrape(filter)` on success,  
 * or `null` if an error occurs.
 *
 * ---
 *
 * @throws {Error}  
 * Catches all thrown exceptions internally and never rethrows.  
 * The caught error is logged to the console and surfaced via `setError`.
 *
 * ---
 *
 * @example
 * ```js
 * try {
 *   const result = await tempScrape(filter, setError, setLoading);
 *   if (result) {
 *     setResults(result.results);
 *   }
 * } catch {
 *   // No rethrow — handled inside tempScrape
 * }
 * ```
 *
 * ---
 *
 * @usage
 * - Used in the final step of the search wizard (`SectionContainer`) to trigger scraping requests.  
 * - Provides robust error handling, including specific messages for:
 *   - **Timeouts** (`AbortError`) → “The request took too long.”  
 *   - **API errors** (`API 500: …`) → “The server responded with an error.”  
 *   - **Unexpected failures** → generic fallback message.  
 * - Returns `null` on failure so the caller can safely skip result updates.
 *
 * @notes
 * - Uses `withTimeout` inside the `scrape` function to enforce request duration limits.  
 * - Intended for temporary testing and debugging; may be replaced with production-safe request logic later.
 */
async function tempScrape(
    filter,
    setError = () => { console.error("[TEMPSCRAPE]: setError non è definita") },
    setLoading = () => { console.error("[TEMPSCRAPE]: setLoading non è definita") },
) {
    // usiamo performance.now per misurare il tempo di esecuzione
    const startTime = performance.now();

    try {
        setLoading(true)

        const result = await scrape(filter);
        // TODO: temp debug print
        console.log("[tempScrape] risultato:", result)

        setLoading(false);
        const endTime = performance.now();
        // TODO: temp debug print
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
export function SearchSectionTitle({ step, className = "h2-title" }) {
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
                                className={`circle-selector-empty ${filter?.type == opt.value ? 'bg-secondary' : ''}`}
                            />
                            <button
                                type="button"
                                onClick={() =>
                                    setFilter((prev) => ({ ...prev, type: opt.value }))
                                }
                                className={`circle-selector-option ${filter?.type === opt.value
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
                            onClick={() => { }}
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
        <div className="city-section-container">
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
    const [category, setCategory] = useState("");
    const [item, setItem] = useState("")

    /**
     * **itemValueToName**
     * 
     * Utility function that maps a given `value` to a corresponding **label** from the `WhyOptions` structure.  
     * It searches through the `WhyOptions` object, which is structured by categories (e.g., "Investimento", "Prima Casa"),  
     * and returns a formatted string combining the category name and option label.
     * 
     * If no matching value is found, it returns an empty string.
     * 
     * ---
     * 
     * @function itemValueToName
     * 
     * @param {number} val  
     * The value to look up within `WhyOptions`.  
     * Expected to be a number that matches one of the `value` properties in the options.
     * 
     * @returns {string}  
     * The formatted string containing the category name and the label (e.g., `"Investimento - Prima Casa"`)  
     * or an empty string if no match is found.
     * 
     * ---
     * 
     * @example
     * ```js
     * const categoryName = itemValueToName(0);
     * console.log(categoryName); // "Investimento - Prima Casa"
     * 
     * const invalidCategory = itemValueToName(99);
     * console.log(invalidCategory); // ""
     * ```
     * 
     * ---
     * 
     * @usage
     * - Used to map a numerical `value` to a more human-readable label for UI displays (e.g., dropdowns, tooltips).  
     * - Helps provide contextual information based on the selected option in forms or filters.
     * 
     * @notes
     * - The `WhyOptions` object is assumed to be structured by categories, where each category has an array of options.
     */
    const itemValueToName = (val) => {
        for (const [cat, arr] of Object.entries(WhyOptions)) {
            for (const opt of arr) {
                if (opt.value === val) {
                    return `${cat} - ${opt.label}`;
                }
            }
        }
        return "";
    }

    return (
        <div className="why-section-container">
            <DoubleSelector
                categoryLabel="Categoria"
                categoryValue={category}
                categoryItems={Object.keys(WhyOptions)}
                categoryOnChange={(event) => {
                    setCategory(event.target.value)
                    setItem(WhyOptions[category])
                }}
                itemLabel="Scegli il motivo"
                itemValue={item}
                itemItems={category != "" ? WhyOptions[category] : null}
                itemOnChange={(event) => {
                    const selectedItem = event.target.value;
                    setItem(selectedItem); // Imposta l'item selezionato

                    // Aggiorna solo il campo 'why' senza modificare il resto di filter
                    setFilter((prev) => ({
                        ...prev,
                        why: `${itemValueToName(event.target.value)}`, // Modifica solo il campo 'why'
                    }));
                }}
            />

            {/* little desciption (optional) */}
            <div className="why-description-container">
                <h2 className="h4-title" >Manca qualcosa?</h2>
                <p className="description-paragraph mb-2">
                    Se c'è qualche caratteristicha importante che non è stata nominata fin'ora, scrivila qui sotto
                </p>
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
 * **SectionContainer**
 *
 * React functional component that orchestrates the **three-step search wizard** UI,
 * rendering the appropriate section for the current `step` and wiring up navigation,
 * validation, and submission logic.
 *
 * Structure:
 * - **Title**: `<SearchSectionTitle />` driven by `step`
 * - **Body**: memoized section element (`FilterSection` → `CitySection` → `WhySection`)
 * - **Inline error**: `sectionError` (per-step validation feedback)
 * - **Navigation**: `<BackButton />` and `<ProceedButton />` with handlers
 *
 * Internals:
 * - `sectionError` (local state) holds contextual validation messages (e.g., missing city).
 * - `sectionEl` (memoized) selects the correct step component:
 *   - `0` → `<FilterSection filter setFilter />`
 *   - `1` → `<CitySection filter setFilter />`
 *   - `2` → `<WhySection filter setFilter />`
 *   - default → renders a technical error message
 * - `buttonOnSubmit` advances the wizard and, on the last step, calls `tempScrape`
 *   then updates `setResults` or surfaces errors via `setError`.
 * - `buttonBackClick` safely navigates backward (steps `1` and `2`) and clears `sectionError`.
 *
 * ---
 *
 * @component
 *
 * @param {Object} props
 * Component props.
 *
 * @param {0|1|2} [props.step=0]
 * Current wizard step:
 * - `0` = Filters
 * - `1` = City
 * - `2` = Why/Purpose
 *
 * @param {(nextStep:number)=>void} props.setStep
 * Setter used to change the current step (forward/backward navigation).
 *
 * @param {Filter} props.filter
 * The shared search filter object (see `BASEFILTER` shape).
 *
 * @param {(updater:Function|Filter)=>void} [props.setFilter=() => { console.log("setFilter is not defined") }]
 * Setter used to mutate the shared `filter` state from child sections.
 *
 * @param {(msg:string)=>void} [props.setError=() => { console.log("setError is not defined") }]
 * Global error setter for non-recoverable / cross-step errors (e.g., API failures).
 *
 * @param {(loading:boolean)=>void} [props.setLoading=() => { console.log("setLoading is not defined") }]
 * Global loading state setter used during the final API submission.
 *
 * @param {(results:any)=>void} [props.setResults=() => { console.log("setResults is not defined") }]
 * Setter that receives scraper results upon a successful final submission.
 *
 * @returns {JSX.Element}
 * A container that renders the step title, the current step section, an inline error message (if any),
 * and the navigation controls (Back/Proceed).
 *
 * ---
 *
 * @example
 * ```jsx
 * <SectionContainer
 *   step={step}
 *   setStep={setStep}
 *   filter={filter}
 *   setFilter={setFilter}
 *   setError={setError}
 *   setLoading={setLoading}
 *   setResults={setResults}
 * />
 * ```
 *
 * ---
 *
 * @usage
 * - Place as the central content of the search page to manage step routing, validation, and submission.
 * - Provide stable references for the setter props to avoid unnecessary re-mounts of child sections.
 * - Ensure `tempScrape` is available in scope and returns `{ ok: boolean, results?: any }`.
 *
 * @accessibility
 * - Step title is rendered via a semantic heading (`SearchSectionTitle`), improving screen reader flow.
 * - Inline validation messages are shown near the navigation controls for immediate feedback.
 */
export function SectionContainer({
    step = 0,
    setStep,
    filter,
    setFilter = () => { console.log("setFilter is not defined") },
    setError = () => { console.log("setError is not defined") },
    setLoading = () => { console.log("setLoading is not defined") },
    setResults = () => { console.log("setResults is not defined") }
}) {
    const [sectionError, setSectionError] = useState(null);

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


    /**
     * **buttonOnSubmit**
     * 
     * Asynchronous event handler that manages the **forward navigation logic**
     * and submission process for the multi-step property search wizard.  
     * 
     * Its behavior dynamically changes based on the current `step` value:
     * 
     * | Step | Description | Action |
     * |------|--------------|--------|
     * | **0** | *Filters step (“Cosa stai cercando?”)* | Advances to step 1 without validation. |
     * | **1** | *City selection step (“Dove lo stai cercando?”)* | Validates the presence of `filter.city`; if valid, proceeds to step 2; otherwise sets an error message. |
     * | **2** | *Final step (“Perché lo stai cercando?”)* | Sends the `filter` data to the backend scraper API and updates results or error states accordingly. |
     * 
     * Any invalid step value triggers a generic fallback error message and logs a descriptive error in the console.
     * 
     * ---
     * 
     * @async
     * @function buttonOnSubmit
     * 
     * @returns {Promise<void>}  
     * No return value. Updates internal state and UI through side effects.
     * 
     * @throws {Error}  
     * Throws internally if the scraping request fails, caught and handled gracefully within the `try/catch` block.
     * 
     * ---
     * 
     * @example
     * ```js
     * const buttonOnSubmit = async () => {
     *   if (step === 0) setStep(step + 1);
     *   else if (step === 1 && filter.city) setStep(step + 1);
     *   else if (step === 2) {
     *     try {
     *       const res = await tempScrape(filter, setError, setLoading);
     *       if (res.ok) setResults(res.results);
     *       else setError("Generic API error");
     *     } catch (err) {
     *       setError("Network error while contacting scraper");
     *     }
     *   }
     * };
     * ```
     * 
     * ---
     * 
     * @usage
     * - Used as the `onSubmit` handler for the **ProceedButton** component.  
     * - Advances the wizard through its three logical steps and triggers the backend request at the end.  
     * - Provides user feedback and error handling when required fields are missing or when API calls fail.  
     * - Ensures smooth and predictable navigation between steps.
     * 
     * @accessibility
     * - Validates essential inputs before proceeding (e.g., city).  
     * - Uses clear, user-friendly error messages for invalid or incomplete inputs.
     */
    const buttonOnSubmit = async () => {
        if (step == 0) {            // First step (filters)
            setStep(step + 1)
        } else if (step == 1) {     // Second step (city), check if the user insert the city
            if (!filter["city"] || filter["city"] == null || filter["city"] == "") {
                setSectionError("Inserire un comune valido per andare avanti")
            } else {
                setSectionError(null)
                setStep(step + 1)
            }
        } else if (step == 2) {     // Last step (why), send request to the scraper via api (Render.com)
            try {
                // TODO: temp debug print
                console.log("filter sended in req:");
                console.log(filter);
                const res = await tempScrape(filter, setError, setLoading)

                // TODO: temp debug print
                console.log("request result:");
                console.log(res);

                if (res.ok) {
                    setResults(res.results)
                } else {
                    setError("Si è verificato un errore generico, riprova più tardi o contatta il supporto");
                    console.error("ERROR: res.ok != true: " + res)
                }
            } catch (error) {
                setError("Si è verificato un errore generico, riprova più tardi o contatta il supporto");
                console.error("ERROR: error catched sending request to the scraper: " + error)
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

    return (
        <div className="section-container">
            <SearchSectionTitle step={step} />
            {sectionEl}
            <div className="section-error-message">
                {sectionError ?
                    <p className="">{sectionError}</p>
                    :
                    <></>
                }
            </div>
            <div className="navigation-buttons-container">
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

/**
 * **SearchPage**
 *
 * Top-level React component that initializes and coordinates the **search wizard page**.
 * It owns the two core pieces of UI state:
 * - **`filter`** – the active search filter object (initialized from `BASEFILTER`)
 * - **`step`** – the current wizard step (`0`=filters, `1`=city, `2`=purpose)
 *
 * The component delegates rendering and interaction logic to `<SectionContainer />`,
 * passing down state setters and app-level handlers for error/loading/results.
 *
 * ---
 *
 * @component
 *
 * @param {Object} props
 * Component props.
 *
 * @param {(msg:string)=>void} props.setError
 * App-level error reporter. Called by children (via `SectionContainer`) to surface
 * user-visible errors (e.g., invalid step, API failures).
 *
 * @param {(loading:boolean)=>void} props.setLoading
 * App-level loading state setter used during async operations (e.g., final scrape).
 *
 * @param {(results:any)=>void} props.setResults
 * App-level results setter invoked after a successful scraping request.
 *
 * @returns {JSX.Element}
 * The page scaffold that hosts the wizard container and wires the required state/handlers.
 *
 * ---
 *
 * @example
 * ```jsx
 * import SearchPage from "./SearchPage";
 *
 * export default function App() {
 *   const [error, setError] = useState(null);
 *   const [loading, setLoading] = useState(false);
 *   const [results, setResults] = useState(null);
 *
 *   return (
 *     <>
 *       {loading && <LoadingSpinner message="Fetching listings..." />}
 *       {error && <ErrorSection message={error} />}
 *       <SearchPage
 *         setError={setError}
 *         setLoading={setLoading}
 *         setResults={setResults}
 *       />
 *     </>
 *   );
 * }
 * ```
 *
 * ---
 *
 * @usage
 * - Use as the main entry for the search flow.  
 * - `filter` and `step` are local to `SearchPage` and passed to `<SectionContainer />`.  
 * - Ensure `BASEFILTER` is imported and stable to keep consistent initial state.
 *
 * @accessibility
 * - Step transitions are surfaced via `<SearchSectionTitle />` inside the container,
 *   improving screen reader context as users navigate.
 */
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
            {/* TODO: I set min-h instead of h to make that the button always is in the container, have to handle the padding between the page and the container */}
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