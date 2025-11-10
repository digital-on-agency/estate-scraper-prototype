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
export const normalize = (s = "") =>
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
export const cityFilter = (options, { inputValue }) => {
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