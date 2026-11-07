export async function api(path, { method = "GET", body } = {}) {
  const res = await fetch(path, {
    method,
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* empty body */
  }
  if (!res.ok) {
    const err = new Error(
      (data && data.error) || `Request failed (${res.status})`,
    );
    err.status = res.status;
    throw err;
  }
  return data;
}

const p2 = (n) => String(n).padStart(2, "0");
export const fmtDate = (d) => {
  const x = new Date(d);
  return `${p2(x.getDate())}/${p2(x.getMonth() + 1)}/${x.getFullYear()}`;
};
export const fmtTime = (d) => {
  const x = new Date(d);
  return `${p2(x.getHours())}:${p2(x.getMinutes())}`;
};
export const money = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
