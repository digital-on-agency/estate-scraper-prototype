import React, { useState } from "react";
import PropTypes, { object } from "prop-types";
import { SearchTypeOption, WhyOptions, STEP_TITLE } from "../lib/constants";
import { DoubleSlider, AutocompleteSearchBar, MultilineTextField, BackButton, ProceedButton } from "./UiComponents";
import { Euro, RulerDimensionLine, BedDouble, CircleX } from "lucide-react";
import comuni from "../data/comuni";


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
        <div className="w-full h-full flex flex-row gap-x-4">
            {/* Type Subsection */}
            <div className="w-1/3 flex flex-col items-center space-y-4">
                <h1 className="w-full text-caput-mortuum text-center text-lg font-bold h-[40px] rounded-xl border-b-4 border-b-cinnabar">
                    Tipologia Immobile
                </h1>

                <ul className="">
                    {SearchTypeOption.map((opt) => (
                        <li key={String(opt.value)} className="flex flex-row items-center pl-4">
                            <div
                                className={`w-[17px] h-[15px] border-2 border-cinnabar rounded-full ${filter?.type == opt.value ? 'bg-cinnabar' : ''}`}
                            />
                            <button
                                type="button"
                                onClick={() =>
                                    setFilter((prev) => ({ ...prev, type: opt.value }))
                                }
                                className={`w-full text-left text-md py-2 px-3 hover:bg-caput-mortuum/10 ${filter?.type === opt.value
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
            <div className="w-2/3 flex flex-col justify-between">
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
                        filter?.higher_mq ?? 9_999
                    ]}
                    min={0}
                    max={9_999}
                    step={10}
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
 * This section collects contextual information about the **purpose of the search**
 * (e.g. *abitativo*, *investimento*, *capital gain*, etc.) and optionally allows
 * the user to write a short free-text description of additional needs.
 * 
 * ---
 * 
 * ### 🧩 Internal Structure
 * 
 * | Subsection | Description |
 * |-------------|-------------|
 * | **Motivation Selector** | A horizontal list of options (`WhyOptions`) that let the user choose the reason for the purchase/search. Each option updates `filter.why`. |
 * | **Optional Description** | A multiline text field (`MultilineTextField`) where the user can specify extra details or requirements. |
 * 
 * ---
 * 
 * @component
 * 
 * @param {Object} props  
 * Component props.
 * 
 * @param {Filter} props.filter  
 * The current filter object containing the user’s selections.  
 * Used here to read and display the active “why” value.
 * 
 * @param {Function} props.setFilter  
 * React state setter that updates the `filter` state.  
 * Called whenever the user selects a new motivation or writes an additional description.  
 * Example:
 * ```js
 * setFilter(prev => ({ ...prev, why: opt.value }));
 * ```
 * 
 * @returns {JSX.Element}  
 * A grid layout divided into two main rows:
 * - The top 3/8 rows contain the selectable motivation buttons.  
 * - The bottom 5/8 rows contain the optional multiline text input.
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
 * Typically used as **step 2 → “Perché lo stai cercando?”** in the search wizard flow,
 * following the location selection (`AutocompleteSearchBar`).
 * 
 * @accessibility
 * - Each motivation is both clickable and selectable via keyboard focus.  
 * - The text field includes a visible label and hint for clarity.
 */
export function WhySection({ filter, setFilter }) {

    const whyOptions = []
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
                    defaultValue=""
                />
            </div>

        </div>
    );
}

export function ErrorSection({ message }) {
    return (
        <div className="bg-white w-5/6 h-3/4 border-3 border-gray-200 rounded-xl p-8 space-y-8 flex flex-col items-center">
            <CircleX className="size-24 text-red-700" />
            <h1 className="text-3xl font-semibold tracking-tight text-red-700">
                Si è verificato un errore
            </h1>
            <ErrorSection message={message} />
            <div className="w-full h-full">

            </div>
        </div>
    );
}

// TODO: jsdoc
export function SectionContainer({ step = 0, setStep, itemClassName = "", filter, setFilter }) {
    const [sectionError, setSectionError] = useState(null)
    const [pageError, setPageError] = useState("Si è verificato un errore generico, riprova più tardi o contatta il supporto")

    // TODO: jsdoc
    function SelectSection() {
        switch (step) {
            case 0: return <FilterSection filter={filter} setFilter={setFilter} />
            case 1: return <CitySection filter={filter} setFilter={setFilter} />
            case 2: return <WhySection filter={filter} setFilter={setFilter} />
            default: // TODO: handle error
        }
    }

    // TODO: JSDoc
    const buttonOnSubmit = () => {
        if (step == 0) {
            setStep(step + 1)
            // TODO: temp debug print
            console.log("SUBMITTED FILTER (0):")
            console.log(filter)
        } else if (step == 1) {
            if (!filter["city"] || filter["city"] == null || filter["city"] == "") {
                // TODO: handle error
                setSectionError("Inserire un comune valido per andare avanti")
                // TODO: temp debug print
                console.log("ERROR: filter['city'] cannot be empty or null");
            } else {
                setSectionError(null)
                setStep(step + 1)
                // TODO: temp debug print
                console.log("SUBMITTED FILTER (1):")
                console.log(filter)
            }
        } else if (step == 2) {
            // TODO: final submit -> start search with parameters
        } else {
            // TODO: handle errors
        }
    }

    // TODO: JSDoc
    const buttonBackClick = () => {
        setSectionError(null)
        if (step == 1 || step == 2) {
            setStep(step - 1)
        } else {
            // TODO: handle error cases
        }
    }

    // TODO: temp debug print
    console.log("pageError: " + pageError);

    if (pageError != null && pageError != "") {
        return (
            <ErrorSection message={pageError} />
        );
    }

    return (
        <div className="bg-white w-5/6 h-3/4 border-3 border-gray-200 rounded-xl p-8 space-y-8 flex flex-col items-center">
            <SearchSectionTitle step={step} className="text-3xl font-semibold tracking-tight text-caput-mortuum" />
            <SelectSection />
            <div className="w-full flex justify-center text-red-500 h-[50px]">
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