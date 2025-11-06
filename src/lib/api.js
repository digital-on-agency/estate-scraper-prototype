const API_BASE = import.meta.env.VITE_API_BASE;

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
 * @param {Object} payload
 * @returns {Promise<Object>}
 */
export async function scrape(payload) {
  if (!API_BASE) throw new Error("VITE_API_BASE is not set");

  // TODO: temp debug print
  console.log("temp scrape api call");

  const res = await withTimeout(
    fetch(`${API_BASE}/scrape`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
    120000 // un po’ più alto per cold start Render
  );

  // TODO: temp debug print
  console.log("temp scrape api call result:")
  console.log(res)

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${detail || res.statusText}`);
  }

  return res.json();
}
