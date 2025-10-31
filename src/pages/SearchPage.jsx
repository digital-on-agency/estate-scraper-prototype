import React, { useState } from "react";
// import { SectionContainer } from "../components/SearchComponents";

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


// TODO: jsdoc
export default function SearchPage() {
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
        <div className="w-screen h-full flex items-center justify-center bg-gray-100">
            <SectionContainer step={step} setStep={setStep} itemClassName="text-black" filter={filter} setFilter={setFilter} />
        </div>
    );
}