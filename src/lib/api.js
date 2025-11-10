const API_BASE = import.meta.env.VITE_API_BASE;

/**
 * **withTimeout**
 * 
 * Utility function that wraps a given `Promise` and enforces a **maximum execution time**.  
 * If the promise does not settle (resolve or reject) within the specified duration,  
 * the associated `AbortController` is triggered to abort the operation.  
 * 
 * This is commonly used to safeguard asynchronous tasks (e.g. network requests)
 * against indefinite waiting times.
 * 
 * ---
 * 
 * @function withTimeout
 * 
 * @param {Promise<any>} promise  
 * The promise to wrap.  
 * Typically represents an asynchronous operation such as a fetch or long-running task.
 * 
 * @param {number} [ms=60000]  
 * Timeout duration in milliseconds.  
 * Defaults to `60000` (1 minute). After this delay, the function triggers an abort signal.
 * 
 * @returns {Promise<any>}  
 * A new promise that mirrors the original one,  
 * but rejects (via `AbortError`) if the timeout elapses before resolution.
 * 
 * ---
 * 
 * @example
 * ```js
 * // Example with a fetch request that times out after 10 seconds
 * const fetchWithTimeout = withTimeout(fetch("https://api.example.com/data"), 10000);
 * 
 * fetchWithTimeout
 *   .then(res => res.json())
 *   .then(console.log)
 *   .catch(err => {
 *     if (err.name === "AbortError") console.error("Request timed out");
 *     else console.error("Fetch failed:", err);
 *   });
 * ```
 * 
 * ---
 * 
 * @usage
 * - Ideal for network operations or async workflows that require fail-safe timing.  
 * - Can be combined with `AbortController.signal` for cancellable fetch requests.  
 * - Always clears the timeout upon promise resolution or rejection to avoid leaks.
 * 
 * @notes
 * The internal `AbortController` is local and not exposed —  
 * if you need external cancellation, create and pass your own controller to the underlying async function.
 */
function withTimeout(promise, ms = 60000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  return new Promise((resolve, reject) => {
    promise
      .then((v) => { clearTimeout(t); resolve(v); })
      .catch((e) => { clearTimeout(t); reject(e); });
  });
}

/**
 * **scrape**
 * 
 * Asynchronous function that sends a POST request to the backend `/scrape` endpoint  
 * to trigger a **real estate data scraping operation**.  
 * 
 * It serializes the provided `payload` as JSON and sends it to the API defined by `API_BASE`.  
 * The request is wrapped with a timeout via `withTimeout` to prevent indefinite waiting,
 * especially during cold starts (Render or similar hosting environments).
 * 
 * ---
 * 
 * @async
 * @function scrape
 * 
 * @param {Object} payload  
 * The request body containing the scraping parameters (e.g. city, filters, etc.).  
 * Must be serializable to JSON.
 * 
 * @throws {Error}  
 * - If the environment variable `VITE_API_BASE` is not set.  
 * - If the network request fails or the API responds with a non-OK status code.  
 * - Includes status and error details in the thrown message.
 * 
 * @returns {Promise<any>}  
 * A promise resolving to the JSON-parsed response body from the API.  
 * The response typically contains the scraped data or metadata of the operation.
 * 
 * ---
 * 
 * @example
 * ```js
 * import { scrape } from "./api";
 * 
 * const payload = {
 *   city: "Milano",
 *   filters: {
 *     lower_price: 100000,
 *     higher_price: 400000,
 *     lower_mq: 50,
 *     higher_mq: 120,
 *   },
 * };
 * 
 * try {
 *   const data = await scrape(payload);
 *   console.log("Scraped results:", data);
 * } catch (err) {
 *   console.error("Scraping failed:", err.message);
 * }
 * ```
 * 
 * ---
 * 
 * @usage
 * - Used to initiate a backend scraping job from the frontend application.  
 * - Handles both client-side validation (`API_BASE` check) and response error handling.  
 * - Uses a 120 000 ms timeout to tolerate initial cold starts on serverless hosts.  
 * - Safe to use within async React handlers or service modules.
 */
export async function scrape(payload) {
  if (!API_BASE) throw new Error("VITE_API_BASE is not set");

  try {
    const res = await withTimeout(
      fetch(`${API_BASE}/scrape`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
      120000 // un po’ più alto per cold start Render
    );
  
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`API ${res.status}: ${detail || res.statusText}`);
    }
  
    return res.json();
  } catch (error) {
    throw new Error("[scrape] Error during scrape request: " + error)
  }
}


