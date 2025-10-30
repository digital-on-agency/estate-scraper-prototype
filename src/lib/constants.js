/**
 * **SearchTypeOption**
 * 
 * Immutable array defining the available **property type options**
 * for the first step of the property search wizard:  
 * *“Cosa stai cercando?”*.  
 * 
 * Each option object contains a `label` (for display) and a `value` (for internal filtering),
 * used by components like `FilterSection` to update `filter.type`.
 * 
 * ---
 * 
 * | Label | Value | Description |
 * |--------|--------|-------------|
 * | **Tutte le tipologie** | `null` | No specific type selected — includes all properties. |
 * | **Residenziale** | `1` | Residential properties (apartments, houses, etc.). |
 * | **Commerciale** | `2` | Commercial properties (offices, shops, warehouses). |
 * | **Terreno** | `3` | Land plots or buildable areas. |
 * | **Garage** | `4` | Garages or parking spaces. |
 * 
 * ---
 * 
 * @constant
 * @type {ReadonlyArray<{label: string, value: number|null}>}
 * @readonly
 * 
 * @example
 * ```js
 * // Usage in FilterSection
 * {SearchTypeOption.map(opt => (
 *   <button
 *     key={opt.label}
 *     onClick={() => setFilter(prev => ({ ...prev, type: opt.value }))}
 *   >
 *     {opt.label}
 *   </button>
 * ))}
 * ```
 * 
 * @usage
 * - Used to render the property type selector in the **FilterSection**.  
 * - The numeric `value` matches the backend or filter schema (`filter.type`).  
 * - Selecting `"Tutte le tipologie"` resets `filter.type` to `null`.
 */
export const SearchTypeOption = [
    { label: "Tutte le tipologie", value: null },
    { label: "Residenziale", value: 1 },
    { label: "Commerciale", value: 2 },
    { label: "Terreno", value: 3 },
    { label: "Garage", value: 4 },
];

/**
 * **WhyOptions**
 * 
 * Defines the available **motivation options** for the third step of the search wizard:  
 * *“Perché lo stai cercando?”*.  
 * 
 * Each option represents a possible **purpose or intent** behind the property search,
 * and updates the `filter.why` field when selected in the `WhySection` component.
 * 
 * ---
 * 
 * | Label | Value | Meaning |
 * |--------|--------|---------|
 * | **Investimento** | `0` | The user is searching for a property primarily as an investment or capital gain opportunity. |
 * | **Prima Casa** | `1` | The user is looking for a property intended as their primary residence. |
 * 
 * ---
 * 
 * @constant
 * @type {ReadonlyArray<{label: string, value: number}>}
 * @readonly
 * 
 * @example
 * ```jsx
 * {WhyOptions.map(opt => (
 *   <button
 *     key={opt.value}
 *     onClick={() => setFilter(prev => ({ ...prev, why: opt.value }))}
 *   >
 *     {opt.label}
 *   </button>
 * ))}
 * ```
 * 
 * @usage
 * - Used in the **WhySection** component to render the motivation selector.  
 * - Updates the `filter.why` property in the main filter state.  
 * - Can be expanded in the future with additional motivations (e.g., “Casa vacanze”, “Studio”, etc.).
 */
export const WhyOptions = [
    { label: "Investimento", value: 0},
    { label: "Prima Casa", value: 1},
]

/**
 * **STEP_TITLE**
 * 
 * Immutable lookup object mapping each wizard step index (`number`)
 * to its corresponding **section title**.  
 *  
 * Used primarily by the *Search Wizard UI* to render dynamic headings
 * or contextual prompts based on the current step value (`state`).
 * 
 * The object is wrapped in `Object.freeze()` to prevent modification at runtime,
 * ensuring consistency across the entire application.
 * 
 * ---
 * 
 * | Key | Title | Description |
 * |-----|--------|-------------|
 * | **0** | `"Cosa stai cercando?"` | First step — user defines property type and base filters (price, size, rooms). |
 * | **1** | `"Dove lo stai cercando?"` | Second step — user selects the city or location to search in. |
 * | **2** | `"Perché lo stai cercando?"` | Third step — user specifies their intent or purpose (e.g., investment, relocation). |
 * 
 * ---
 * 
 * @constant
 * @type {Readonly<Record<number, string>>}
 * @readonly
 * 
 * @example
 * ```js
 * // Retrieve the title for the current step
 * const title = STEP_TITLE[state]; // e.g., "Dove lo stai cercando?"
 * 
 * // Display in UI
 * <h2>{STEP_TITLE[state]}</h2>;
 * ```
 * 
 * @usage
 * ```js
 * // Example usage inside a React component
 * const SearchSectionTitle = ({ step }) => (
 *   <h2 className="text-xl font-bold text-neutral-800">
 *     {STEP_TITLE[step]}
 *   </h2>
 * );
 * ```
 */
export const STEP_TITLE = Object.freeze({
    0: "Cosa stai cercando?",
    1: "Dove lo stai cercando?",
    2: "Perché lo stai cercando?",
});