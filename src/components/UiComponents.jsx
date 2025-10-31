import { useEffect, useState } from "react";
import { Slider } from "@mui/material";
import { Autocomplete, TextField } from "@mui/material";

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
    max = 1_000_000,
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

    const handleChange = (_, newValue) => {
        if (Array.isArray(newValue)) setDraft(newValue);
    };

    const handleCommit = () => {
        onCommit?.(draft); // aggiorna il parent solo al rilascio
    };

    return (
        <div className="w-full h-1/3 flex flex-col justify-between items-center px-6">
            <h1 className="w-full text-caput-mortuum text-center text-lg font-bold h-[4 0px]">{title}</h1>
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
                            className="appearance-none block w-full"
                            value={draft[0]}
                            type="number"
                            onChange={(e) =>
                                setDraft((prev) => [Number(e.target.value), prev[1]])
                            }
                        />
                    </div>
                    <label>min</label>
                </div>
                <div className="flex flex-row space-x-2 items-center justify-end">
                    <label>max</label>
                    <div className="w-7/12 py-2 px-2 border-2 border-gray-400 rounded-lg flex items-center justify-center">
                        {Icon && <Icon className="text-gray-500 mr-1" />}
                        <input
                            className="appearance-none block w-full"
                            type="number"
                            value={draft[1]}
                            onChange={(e) =>
                                setDraft((prev) => [prev[0], Number(e.target.value)])
                            }
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
export function MultilineTextField ({
    id="outlined-multiline-static",
    label="Multiline",
    defaultValue="Default Value",
    value="",
    itemClassName="",
    onChange=()=>{}
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
export function BackButton({ step, onClickFunction, itemClassName = "bg-gray-300 hover:bg-gray-400/70 px-10 py-4 text-2xl text-cinnabar font-semibold rounded-xl" }) {
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

// TODO: jsdoc
export function ProceedButton({
    step,
    onSubmit,
    itemClassName = "bg-cinnabar hover:bg-cinnabar/70 px-10 py-4 text-2xl text-white rounded-xl",
    checkCliccable = () => true
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
        // TODO: handle error (step not in [0, 1, 2])
    }
}