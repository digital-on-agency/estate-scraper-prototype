import { useEffect, useMemo, useState } from "react";
import { Slider, Autocomplete, TextField, CircularProgress, Typography, Box } from "@mui/material";
import PropTypes from 'prop-types';

/**
 * **normalize**
 * 
 * Utility function for `AutocompleteSearchBar` that prepares a string
 * for reliable **case-insensitive and accent-insensitive comparison**.
 * 
 * Converts input text to lowercase, removes diacritical marks (e.g., `è → e`, `ò → o`),
 * and trims whitespace — making searches robust across different user inputs.
 * 
 * ---
 * 
 * @function normalize
 * @param {string} [s=""]  
 * Input string to normalize.  
 * If `undefined` or `null`, defaults to an empty string.
 * 
 * @returns {string}  
 * The normalized string, lowercase and stripped of diacritics and leading/trailing spaces.
 * 
 * ---
 * 
 * @example
 * ```js
 * normalize("  Pésàro  "); // → "pesaro"
 * normalize("MILANO");     // → "milano"
 * normalize("");            // → ""
 * ```
 * 
 * @usage
 * Used internally by `cityFilter` to compare user input and city labels consistently.
 */
const normalize = (s = "") =>
    s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").trim();

// TODO: it should stay somewhere in lib/
/**
 * **cityFilter**
 * 
 * Custom filtering algorithm for `AutocompleteSearchBar`, used to produce
 * **relevance-ranked suggestions** when searching among a large list of cities or localities.
 * 
 * Unlike default lexicographic filters, it ranks results by *similarity*:
 * - Exact matches appear first (score = 1000)
 * - Prefix matches next (score = 800 - label length)
 * - Substring matches later (score = 600 - position - length * 0.01)
 * - Non-matching items are excluded
 * 
 * Results are returned **sorted in descending order of score**.
 * 
 * ---
 * 
 * @function cityFilter
 * @param {Array<string|Object>} options  
 * The full list of available autocomplete options.  
 * Each item can be a string or an object with `label` or `nome`.
 * 
 * @param {{ inputValue: string }} context  
 * Object provided by MUI’s `Autocomplete` `filterOptions` function.  
 * Contains the current user input under `inputValue`.
 * 
 * @returns {Array<string|Object>}  
 * The filtered and sorted array of matching options, highest score first.
 * 
 * ---
 * 
 * @example
 * ```js
 * const cities = ["Roma", "Milano", "Firenze", "Rimini"];
 * 
 * // user types "ri"
 * const results = cityFilter(cities, { inputValue: "ri" });
 * // → ["Rimini", "Firenze"]
 * ```
 * 
 * @usage
 * Used as a custom `filterOptions` prop in MUI’s `<Autocomplete>` component:
 * ```jsx
 * <Autocomplete
 *   options={allCities}
 *   filterOptions={cityFilter}
 *   renderInput={(params) => <TextField {...params} label="Città" />}
 * />
 * ```
 */
const cityFilter = (options, { inputValue }) => {
    const q = normalize(inputValue);
    if (!q) return options;

    return options
        .map((label) => {
            const n = normalize(label);
            let score = 0;
            if (n === q) score = 1000;
            else if (n.startsWith(q)) score = 800 - label.length;
            else {
                const idx = n.indexOf(q);
                if (idx >= 0) score = 600 - idx - label.length * 0.01;
            }
            return { label, score };
        })
        .filter(x => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(x => x.label);
};

/**
 * **AutocompleteSearchBar**
 * 
 * React functional component providing a **smart city/location search field**  
 * with autocomplete suggestions based on user input.  
 * 
 * It extends MUI’s `<Autocomplete>` with a **custom filtering algorithm (`cityFilter`)**  
 * that ranks results by textual similarity (not just prefix match), making it ideal for large lists of Italian cities.
 * 
 * ---
 * 
 * ### 🔍 Behavior
 * - Displays a text field (`TextField`) with suggestion dropdown.  
 * - Syncs the internal input text (`inputValue`) with the parent-controlled `value`.  
 * - When the user selects an option, both `setValue` (parent) and `inputValue` (internal) are updated.  
 * - Uses the custom filter `cityFilter` for flexible, accent-insensitive matches.
 * 
 * ---
 * 
 * @component
 * 
 * @param {Object} props  
 * Component props.
 * 
 * @param {string|null} [props.value=null]  
 * The **currently selected city** (controlled value).  
 * If `null`, no city is selected and the input shows the current text only.
 * 
 * @param {(newValue: string|null) => void} props.setValue  
 * Callback function to update the parent component when a new city is selected.  
 * Receives either a `string` (selected city) or `null` (if cleared).
 * 
 * @param {Array<string|{nome?: string, label?: string}>} props.options  
 * List of **available city options** for autocomplete.  
 * Each item can be:
 * - a simple string (e.g. `"Roma"`)
 * - an object with a `nome` or `label` property.
 * 
 * @param {string} [props.label=""]  
 * Label displayed in the text field (`TextField`’s `label` prop).
 * 
 * @returns {JSX.Element}  
 * A full-width Material UI `<Autocomplete>` component configured with custom filtering and selection behavior.
 * 
 * ---
 * 
 * @example
 * ```jsx
 * import { AutocompleteSearchBar } from "./AutocompleteSearchBar";
 * import { cityFilter } from "./utils";
 * 
 * const allCities = ["Roma", "Milano", "Torino", "Napoli"];
 * 
 * export function CityStep() {
 *   const [city, setCity] = useState(null);
 * 
 *   return (
 *     <AutocompleteSearchBar
 *       value={city}
 *       setValue={setCity}
 *       options={allCities}
 *       label="Città o comune"
 *     />
 *   );
 * }
 * ```
 * 
 * ---
 * 
 * @usage
 * - Ideal as step 2 (“Dove lo stai cercando?”) of the property search wizard.  
 * - Combine with the `cityFilter`, `normalize`, and `getLabel` utilities for best results.  
 * - Supports full-text search with accent normalization and prioritization of exact/prefix matches.
 * 
 * @accessibility
 * - Supports keyboard navigation and selection (`Enter`, `Home`, `End`).  
 * - `autoHighlight` and `selectOnFocus` improve UX consistency.
 */
export function AutocompleteSearchBar({ value = null, setValue, options, label = "" }) {
    // text shown in the input
    const [inputValue, setInputValue] = useState(value ?? "");

    // if the parent changes `value`, update the visible text
    useEffect(() => {
        setInputValue(value ?? "");
    }, [value]);

    return (
        <Autocomplete
            className="w-full"
            options={options}                 // array of strings
            filterOptions={cityFilter}
            value={value}                     // selected string (or null)
            onChange={(_, newValue) => {
                setValue(newValue ?? null);     // save in parent
                setInputValue(newValue ?? "");  // fill input with selected
            }}
            inputValue={inputValue}           // text typed/displayed
            onInputChange={(_, newInput) => setInputValue(newInput)}
            // optional, improve UX
            autoHighlight
            selectOnFocus
            handleHomeEndKeys
            renderInput={(params) => <TextField {...params} label={label} />}
        />
    );
}

/**
 * **DoubleSlider**
 *
 * React component that renders a **range (min–max) control** with:
 * - an MUI `Slider` using two thumbs,
 * - two numeric inputs (min / max),
 * - an optional leading **icon**,
 * - and a **commit-only** callback to update the parent **only on release**.
 *
 * Internally it keeps a *draft* state to provide fluid dragging without spamming parent updates.
 * The component re-syncs the draft whenever the **numeric values** of `value[0]` / `value[1]` change,
 * avoiding resets caused by new array identities.
 *
 * ---
 *
 * @component
 *
 * @param {Object} props
 * Component props.
 *
 * @param {string} props.title
 * Section heading shown above the slider.
 *
 * @param {React.ComponentType<any>} [props.icon]
 * Optional icon component (e.g., from lucide-react). Passed as `icon: Icon` and rendered next to inputs.
 *
 * @param {string} props.label
 * Accessibility label used by the slider (`getAriaLabel` / value text).
 *
 * @param {[number, number]} props.value
 * **Controlled** numeric range `[minValue, maxValue]`.  
 * The component derives its internal *draft* from this input and keeps it in sync.
 *
 * @param {(range:[number, number]) => void} [props.onCommit=(val)=>console.log(val)]
 * Called **once** when the user *releases* the slider thumbs (or otherwise commits), receiving the final `[min, max]`.  
 * Use this to update the parent state (e.g., `setFilter`).
 *
 * @param {number} [props.min=0]
 * Minimum allowed value.
 *
 * @param {number} [props.max=1_000_000]
 * Maximum allowed value.
 *
 * @param {number} [props.step=10_000]
 * Slider step.
 *
 * @returns {JSX.Element}
 * A responsive block with title, dual-thumb slider, and two numeric inputs (min/max).
 *
 * ---
 *
 * @example
 * ```jsx
 * // Parent
 * const [filter, setFilter] = useState(BASEFILTER);
 *
 * <DoubleSlider
 *   title="Prezzo"
 *   icon={Euro}
 *   label="Prezzo"
 *   value={[Number(filter.lower_price ?? 0), Number(filter.higher_price ?? 1_000_000)]}
 *   min={0}
 *   max={1_000_000}
 *   step={5_000}
 *   onCommit={([lo, hi]) => setFilter(prev => ({ ...prev, lower_price: lo, higher_price: hi }))}
 * />
 * ```
 *
 * @usage
 * - Treat `value` as **source of truth**. Update it in the parent **inside `onCommit`**.
 * - Prefer number coercion when mapping external state to `value` to avoid `NaN`.
 * - If you need immediate parent updates while dragging, also wire `onChange` (not provided here by design).
 */
export function DoubleSlider({
    title,
    icon: Icon,
    label,
    value,
    onCommit = (val) => { console.log(val) },
    min = 0,
    max = 400,
    step = 10_000
}) {
    // extract the numbers in a stable way (avoid relying on array identity)
    const v0 = Number(value?.[0] ?? min);
    const v1 = Number(value?.[1] ?? max);

    // local fluid state for dragging
    const [draft, setDraft] = useState([
        Number(value?.[0] ?? min),
        Number(value?.[1] ?? max),
    ]);

    // synchronize ONLY when the numbers change (not when the array is new)
    useEffect(() => {
        // avoid resetting if already equal (no “jump” of the thumb)
        if (draft[0] !== v0 || draft[1] !== v1) {
            setDraft([v0, v1]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [v0, v1]);

    /**
     * **handleChange**
     * 
     * Event handler used to update the **temporary slider values** (`draft`)  
     * during user interaction within the `DoubleSlider` component.  
     * 
     * It is triggered whenever the user drags one or both thumbs of the slider,  
     * and ensures that only valid array-based values are used to update state.
     * 
     * ---
     * 
     * @function handleChange
     * 
     * @param {Event} _  
     * The React synthetic event automatically passed by the slider’s `onChange` handler.  
     * It is unused in this context and therefore ignored.
     * 
     * @param {Array<number>} newValue  
     * The new range array `[min, max]` emitted by the MUI `Slider` component  
     * whenever the user moves the slider thumbs.
     * 
     * @returns {void}  
     * No return value. Updates the component’s internal `draft` state via `setDraft(newValue)`.
     * 
     * ---
     * 
     * @example
     * ```js
     * const handleChange = (_, newValue) => {
     *   if (Array.isArray(newValue)) setDraft(newValue);
     * };
     * 
     * <Slider onChange={handleChange} value={draft} />
     * ```
     * 
     * ---
     * 
     * @usage
     * - Used as the `onChange` callback for the Material UI `Slider`.  
     * - Ensures stability by checking that `newValue` is an array before updating.  
     * - Works together with `handleCommit` to propagate updates to the parent only after release.
     */
    const handleChange = (_, newValue) => {
        if (Array.isArray(newValue)) setDraft(newValue);
    };

    /**
     * **handleCommit**
     * 
     * Event handler that triggers the **final update** of the selected range values  
     * in the `DoubleSlider` component when the user **releases the slider thumb**.  
     * 
     * It calls the parent’s `onCommit` callback (if provided) with the current  
     * internal `draft` state, allowing the parent component to synchronize  
     * its filter or controlled value state accordingly.
     * 
     * ---
     * 
     * @function handleCommit
     * 
     * @returns {void}  
     * No return value. Executes the `onCommit` callback with the current draft array.  
     * Example output: `[minValue, maxValue]`.
     * 
     * ---
     * 
     * @example
     * ```js
     * const handleCommit = () => {
     *   onCommit?.(draft); // updates the parent only on release
     * };
     * 
     * <Slider
     *   value={draft}
     *   onChange={handleChange}
     *   onChangeCommitted={handleCommit}
     * />
     * ```
     * 
     * ---
     * 
     * @usage
     * - Used as the `onChangeCommitted` handler for the Material UI `Slider`.  
     * - Ensures that parent components (e.g., `FilterSection`) are updated **only after**  
     *   the user finishes adjusting the range, reducing unnecessary re-renders.  
     * - Safely calls `onCommit` only if it exists (`?.` operator).
     */
    const handleCommit = () => {
        onCommit?.(draft); // aggiorna il parent solo al rilascio
    };

    return (
        <div className="w-full h-1/3 flex flex-col justify-between items-center px-6">
            <h1
                className="filter-heading"
                // className="w-full text-caput-mortuum text-center text-lg font-bold h-[4 0px]"
            >{title}</h1>
            <Slider
                value={draft}
                min={min}
                max={max}
                step={step}
                onChange={handleChange}
                onChangeCommitted={handleCommit}
                valueLabelDisplay="auto"
                getAriaLabel={() => label}
                getAriaValueText={(v) => `€ ${v}`}
                disableSwap
                sx={{
                    color: '#E44D26',
                }}
            />
            <div className="w-full flex flex-row justify-between">
                <div className="flex flex-row space-x-2 items-center">
                    <div className="w-7/12 py-2 px-2 border-2 border-gray-400 rounded-lg flex items-center justify-center">
                        {Icon && <Icon className="text-gray-500 mr-1" />}
                        <input
                            className="appearance-none block w-full text-right"
                            type="text"
                            value={draft[0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}
                            onChange={(e) => {
                                const clean = e.target.value.replace(/\s/g, ""); // rimuove spazi
                                const num = Number(clean) || 0;
                                setDraft((prev) => [num, prev[1]]);
                            }}
                        />
                    </div>
                    <label>min</label>
                </div>
                <div className="flex flex-row space-x-2 items-center justify-end">
                    <label>max</label>
                    <div className="w-7/12 py-2 px-2 border-2 border-gray-400 rounded-lg flex items-center justify-center">
                        {Icon && <Icon className="text-gray-500 mr-1" />}
                        <input
                            className="appearance-none block w-full text-right"
                            type="text"
                            value={draft[1].toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}
                            onChange={(e) => {
                                const clean = e.target.value.replace(/\s/g, ""); // rimuove spazi
                                const num = Number(clean) || 0;
                                setDraft((prev) => [prev[0], num]);
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * **MultilineTextField**
 * 
 * React functional component that renders a styled **multiline text input**  
 * (based on Material UI’s `<TextField>` component).  
 * 
 * Commonly used for optional descriptions or free-form user input,
 * such as in the `WhySection` of the property search wizard,
 * where users can specify additional preferences or notes.
 * 
 * ---
 * 
 * @component
 * 
 * @param {Object} props  
 * Component props.
 * 
 * @param {string} [props.id="outlined-multiline-static"]  
 * The unique identifier assigned to the text field.  
 * Used for accessibility and form handling.
 * 
 * @param {string} [props.label="Multiline"]  
 * The text label displayed above the input field.  
 * Indicates the purpose or placeholder meaning of the field.
 * 
 * @param {string} [props.defaultValue="Default Value"]  
 * The default text content shown inside the field when it first renders.
 * 
 * @param {string} [props.itemClassName="w-full"]  
 * Tailwind or custom CSS class string applied to the outer `<TextField>`.  
 * Defaults to `"w-full"` for full-width layout.
 * 
 * @returns {JSX.Element}  
 * A Material UI `<TextField>` component configured for multiline input (4 rows by default).
 * 
 * ---
 * 
 * @example
 * ```jsx
 * <MultilineTextField
 *   id="notes-input"
 *   label="Note aggiuntive"
 *   defaultValue=""
 *   itemClassName="mt-4 w-3/4"
 * />
 * ```
 * 
 * ---
 * 
 * @usage
 * - Used in the **WhySection** for optional user descriptions.  
 * - Fully compatible with MUI form systems; can be wrapped in `<form>` or controlled manually.  
 * - Modify `rows` or `multiline` behavior directly in the JSX if needed.
 */
export function MultilineTextField({
    id = "outlined-multiline-static",
    label = "Multiline",
    defaultValue = "Default Value",
    value = "",
    itemClassName = "",
    onChange = () => { }
}) {
    return (
        <TextField
            id={id}
            label={label}
            multiline
            rows={4}
            //   defaultValue={defaultValue}
            value={value}
            className={itemClassName}
            onChange={onChange}
            fullWidth
        />
    );
}

/**
 * **BackButton**
 * 
 * React functional component that renders a **navigation button**  
 * allowing the user to move **backward** in the multi-step search wizard flow.  
 * 
 * The button is **hidden when `step` equals `0`**, meaning it is not shown
 * during the first phase (“Cosa stai cercando?”).  
 * For all subsequent steps, it becomes visible and triggers the provided callback
 * to return to the previous step.
 * 
 * ---
 * 
 * @component
 * 
 * @param {Object} props  
 * Component props.
 * 
 * @param {number} props.step  
 * The current step index of the wizard.  
 * When `0`, the button is not rendered (returns an empty fragment).  
 * When `> 0`, the button is displayed and can be clicked.
 * 
 * @param {Function} props.onClickFunction  
 * Callback executed when the user clicks the button.  
 * Typically used to decrement the current step:
 * ```js
 * const handleBack = () => setStep(prev => Math.max(0, prev - 1));
 * ```
 * 
 * @param {string} [props.itemClassName="bg-gray-300 hover:bg-gray-400/70 px-10 py-4 text-2xl text-cinnabar font-semibold rounded-xl"]  
 * CSS class string applied to the button for styling.  
 * Accepts Tailwind or custom utility classes.  
 * Default styling provides a gray rounded button with hover effect.
 * 
 * @returns {JSX.Element}  
 * A `<button>` element labeled “Indietro” when `step > 0`,  
 * or an empty React fragment (`<></>`) when `step == 0`.
 * 
 * ---
 * 
 * @example
 * ```jsx
 * <BackButton
 *   step={currentStep}
 *   onClickFunction={() => setStep(prev => prev - 1)}
 * />
 * ```
 * 
 * ---
 * 
 * @usage
 * - Used in the navigation controls of the property search wizard.  
 * - Commonly paired with a “Next” or “Continue” button.  
 * - Hidden automatically in the first step to simplify UX.
 */
export function BackButton({
    step,
    onClickFunction,
    itemClassName = "bg-gray-300 hover:bg-gray-400/70 px-10 py-4 text-2xl text-cinnabar font-semibold rounded-xl",
    setError = (msg) => { console.error("Error: " + msg) }
}) {
    if (step == 0) {
        return (<></>)
    }

    return (
        <button
            className={itemClassName + (step == 0 ? "hidden" : "")}
            onClick={onClickFunction}
        >
            Indietro
        </button>
    );
}

/**
 * **ProceedButton**
 * 
 * React functional component that renders the **forward navigation button**
 * for the multi-step property search wizard.  
 * 
 * The button text and behavior vary dynamically based on the current `step` value:
 * 
 * | Step | Label | Action |
 * |------|--------|--------|
 * | **0** | “Avanti” | Proceeds from the “Cosa stai cercando?” step. |
 * | **1** | “Avanti” | Proceeds from the “Dove lo stai cercando?” step. |
 * | **2** | “Cerca” | Final step — triggers the search or form submission. |
 * 
 * Any invalid `step` value (not `0`, `1`, or `2`) logs an error and sets a generic fallback message.
 * 
 * ---
 * 
 * @component
 * 
 * @param {Object} props  
 * Component props.
 * 
 * @param {number} props.step  
 * The current wizard step index.  
 * Accepts values `0`, `1`, or `2`.  
 * Determines which button is rendered and what label it displays.
 * 
 * @param {Function} props.onSubmit  
 * Callback executed when the button is clicked.  
 * Typically advances to the next step or executes the search action at the final step.  
 * Example:
 * ```js
 * const handleProceed = () => setStep(prev => prev + 1);
 * ```
 * 
 * @param {string} [props.itemClassName="bg-cinnabar hover:bg-cinnabar/70 px-10 py-4 text-2xl text-white rounded-xl"]  
 * CSS class string applied to the button.  
 * Provides default styling (red background, white text, rounded corners).  
 * Can be overridden to customize button appearance.
 * 
 * @returns {JSX.Element|void}  
 * Returns:
 * - A `<button>` labeled “Avanti” or “Cerca”, depending on the step; or  
 * - Nothing (logs an error) if `step` has an invalid value.
 * 
 * ---
 * 
 * @example
 * ```jsx
 * <ProceedButton
 *   step={currentStep}
 *   onSubmit={() => {
 *     if (currentStep < 2) setStep(prev => prev + 1);
 *     else handleSearch();
 *   }}
 * />
 * ```
 * 
 * ---
 * 
 * @usage
 * - Used at the bottom of each wizard step to advance or trigger the search process.  
 * - Complements the `BackButton` for bidirectional navigation.  
 * - The label changes automatically to “Cerca” on the final step to signal submission.
 * 
 * @accessibility
 * - Uses a semantic `<button>` element.  
 * - Supports keyboard focus and activation via Enter/Space.
 */
export function ProceedButton({
    step,
    onSubmit,
    itemClassName = "bg-cinnabar hover:bg-cinnabar/70 px-10 py-4 text-2xl text-white rounded-xl",
}) {
    const FirstButton = () => {
        return (
            <button
                className={itemClassName}
                onClick={onSubmit}
            >
                Avanti
            </button>
        );
    }

    const SubmitButton = () => {
        return (
            <button
                className={itemClassName}
                onClick={onSubmit}
            >
                Cerca
            </button>
        );
    }

    if (step == 0) {
        return <FirstButton />
    } else if (step == 1) {
        return <FirstButton />
    } else if (step == 2) {
        return <SubmitButton />
    } else {
        setError("Si è verificato un errore generico, riprova più tardi o contatta il supporto");
        console.error("ERROR: the value of `step` is not allowed (must be 0, 1, or 2) - `step`: " + step)
    }
}

/**
 * **LoadingSpinner**
 * 
 * React functional component that displays a **circular progress indicator**
 * with optional percentage display and a customizable text message.  
 * 
 * It supports two operating modes:
 * 
 * 1. **Controlled Mode (`value`)** – when the `value` prop is provided,  
 *    the progress percentage is externally controlled (0–100).
 * 2. **Timed Mode (`time`)** – when `value` is `null` and `time` is specified,  
 *    the spinner automatically fills over the given duration (in milliseconds).
 * 
 * ---
 * 
 * ### 🎛️ Size Variants
 * The visual size and thickness of the spinner are determined by the `size` prop:
 * 
 * | Size | Spinner (px) | Thickness | Font Size | Label Margin |
 * |------|---------------|------------|------------|---------------|
 * | **0** | 56 | 4 | 12px | 0.75em |
 * | **1** | 90 | 5 | 14px | 1em |
 * | **2** | 120 | 6 | 18px | 1.25em |
 * 
 * ---
 * 
 * @component
 * 
 * @param {Object} props  
 * Component props.
 * 
 * @param {string|null} [props.message=null]  
 * Optional message displayed below the spinner.  
 * Used to describe the loading context (e.g. *"Loading search results..."*).
 * 
 * @param {number|null} [props.value=null]  
 * Controlled progress value between `0` and `100`.  
 * When set, the spinner reflects this exact percentage and disables timed mode.
 * 
 * @param {number|null} [props.time=null]  
 * Duration (in milliseconds) for automatic timed progress.  
 * Active only when `value` is `null`. The spinner animates from 0 to 100% within this time.
 * 
 * @param {0|1|2} [props.size=1]  
 * Visual size preset for the spinner.  
 * - `0` → small  
 * - `1` → medium (default)  
 * - `2` → large  
 * 
 * @param {string} [props.color="var(--color-cinnabar)"]  
 * Custom color for the spinner and text (CSS variable or valid color string).
 * 
 * @returns {JSX.Element}  
 * A composed layout with a circular progress bar, numeric percentage indicator,  
 * and optional descriptive message.
 * 
 * ---
 * 
 * @example
 * ```jsx
 * // Controlled Mode (progress externally managed)
 * <LoadingSpinner value={75} message="Uploading file..." />
 * 
 * // Timed Mode (fills automatically in 3 seconds)
 * <LoadingSpinner time={3000} message="Preparing search..." />
 * 
 * // Large variant with custom color
 * <LoadingSpinner size={2} color="#E44D26" message="Please wait..." />
 * ```
 * 
 * ---
 * 
 * @usage
 * - Used in loading states within the search wizard or API operations.  
 * - Ideal for representing determinate progress or timed transitions.  
 * - Automatically clamps progress values between `0` and `100`.
 * 
 * @accessibility
 * - Includes `role="status"` and `aria-live="polite"` for screen readers.  
 * - The percentage text is visible and readable at all sizes.
 */
export function LoadingSpinner({
    message = null,
    value = null,   // progress controllato (0–100), dinamico dall'esterno
    time = null,    // durata stimata in ms per la modalità “a tempo”
    size = 1,       // 0=small, 1=medium (default), 2=large
    color = "var(--color-cinnabar)" // opzionale: override colore
}) {
    // --- CONFIG TAGLIE ---------------------------------------------------------
    const sizeCfg = useMemo(() => {
        const map = {
            0: { spinner: 56, thickness: 4, fontSize: 12, labelMt: 0.75 },
            1: { spinner: 90, thickness: 5, fontSize: 14, labelMt: 1 },
            2: { spinner: 120, thickness: 6, fontSize: 18, labelMt: 1.25 },
        };
        return map[size] ?? map[1];
    }, [size]);

    // --- STATO INTERNO PROGRESS -----------------------------------------------
    const [progress, setProgress] = useState(0);

    // Helper clamp
    const clamp = (n, min = 0, max = 100) => Math.max(min, Math.min(max, n));

    // --- MODALITÀ “VALORE CONTROLLATO” (value) --------------------------------
    // Se value è non nullo, il componente si comporta in modo controllato:
    // seguo i cambi esterni e ignoro time.
    useEffect(() => {
        if (value == null) return;
        setProgress((prev) => {
            // se già uguale evito un set inutile
            const next = clamp(Number(value) || 0);
            return prev === next ? prev : next;
        });
    }, [value]);

    // --- MODALITÀ “A TEMPO” (time) --------------------------------------------
    // Attiva SOLO quando value è null e time è valorizzato.
    useEffect(() => {
        if (value != null) return; // priorità alla modalità controllata
        if (time == null) {
            // TODO: handle null parameters error
            return;
        }

        // Protezione: time valido (>0)
        const total = Math.max(1, Number(time) || 0);

        const interval = 100; // ms
        const step = (100 * interval) / total; // % per tick

        // Resetta progress quando si entra in modalità a tempo
        setProgress(0);

        const timer = setInterval(() => {
            setProgress((old) => {
                const next = old + step;
                return next >= 100 ? 100 : next;
            });
        }, interval);

        return () => clearInterval(timer);
    }, [time, value]);

    // --- RENDER ---------------------------------------------------------------
    return (
        <Box
            sx={{
                position: "relative",
                display: "inline-flex",
                flexDirection: "column",
                alignItems: "center",
            }}
            role="status"
            aria-label={message || "Loading"}
            aria-live="polite"
        >
            <Box sx={{ position: "relative", display: "inline-flex" }}>
                <CircularProgress
                    variant="determinate"
                    value={clamp(progress)}
                    size={sizeCfg.spinner}
                    thickness={sizeCfg.thickness}
                    sx={{ color }}
                />
                <Box
                    sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: "absolute",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Typography
                        component="div"
                        sx={{ fontSize: sizeCfg.fontSize, color }}
                    >
                        {`${Math.round(clamp(progress))}%`}
                    </Typography>
                </Box>
            </Box>

            {message && (
                <Typography
                    variant="body2"
                    sx={{ mt: sizeCfg.labelMt, color: "text.secondary", textAlign: "center" }}
                >
                    {message}
                </Typography>
            )}
        </Box>
    );
}