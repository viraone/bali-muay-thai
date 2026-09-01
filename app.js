/* Bali Muay Thai gym comparison — reads gyms.json */

const FX_RATE = 16300; // IDR per USD, approximate

let gyms = [];
let sortKey = "monthly";
let sortAsc = true;

const $ = (id) => document.getElementById(id);

fetch("gyms.json")
  .then((r) => r.json())
  .then((data) => {
    gyms = data.gyms;
    $("lastUpdated").textContent = data.lastUpdated || "—";
    $("fxRate").textContent = FX_RATE.toLocaleString();
    initFilters();
    render();
  })
  .catch(() => {
    $("cardView").innerHTML = '<p class="empty">Could not load gyms.json</p>';
  });

function initFilters() {
  const areas = [...new Set(gyms.map((g) => g.area))].sort();
  for (const a of areas) {
    const opt = document.createElement("option");
    opt.value = a;
    opt.textContent = a;
    $("areaFilter").appendChild(opt);
  }
  ["search", "areaFilter", "currencyToggle", "monthlyOnly"].forEach((id) =>
    $(id).addEventListener("input", render)
  );
  $("cardViewBtn").addEventListener("click", () => setView("card"));
  $("tableViewBtn").addEventListener("click", () => setView("table"));
  document.querySelectorAll("th[data-sort]").forEach((th) =>
    th.addEventListener("click", () => {
      const key = th.dataset.sort;
      if (sortKey === key) sortAsc = !sortAsc;
      else { sortKey = key; sortAsc = true; }
      render();
    })
  );
}

function setView(v) {
  $("cardView").hidden = v !== "card";
  $("tableView").hidden = v !== "table";
  $("cardViewBtn").classList.toggle("active", v === "card");
  $("tableViewBtn").classList.toggle("active", v === "table");
}

function priceVal(g, key) {
  const p = g.prices?.[key];
  return p?.idr ?? null;
}

function fmtPrice(g, key) {
  const p = g.prices?.[key];
  if (!p || p.idr == null) return "—";
  const usd = $("currencyToggle").checked;
  const approx = g.verified ? "" : "~";
  if (usd) return approx + "$" + Math.round(p.idr / FX_RATE);
  return approx + (p.idr / 1000).toLocaleString() + "k IDR";
}

function filtered() {
  const q = $("search").value.toLowerCase();
  const area = $("areaFilter").value;
  const monthlyOnly = $("monthlyOnly").checked;
  let list = gyms.filter(
    (g) =>
      (!q || g.name.toLowerCase().includes(q) || (g.notes || "").toLowerCase().includes(q)) &&
      (!area || g.area === area) &&
      (!monthlyOnly || priceVal(g, "monthly") != null)
  );
  list.sort((a, b) => {
    let av, bv;
    if (["dropIn", "weekly", "monthly"].includes(sortKey)) {
      av = priceVal(a, sortKey); bv = priceVal(b, sortKey);
      if (av == null) return 1;
      if (bv == null) return -1;
    } else {
      av = a[sortKey] || ""; bv = b[sortKey] || "";
    }
    const cmp = av < bv ? -1 : av > bv ? 1 : 0;
    return sortAsc ? cmp : -cmp;
  });
  return list;
}

function render() {
  const list = filtered();
  renderSummary(list);
  renderCards(list);
  renderTable(list);
}

function renderSummary(list) {
  const monthlies = list.map((g) => priceVal(g, "monthly")).filter((v) => v != null);
  const usd = $("currencyToggle").checked;
  const fmt = (idr) =>
    usd ? "$" + Math.round(idr / FX_RATE) : (idr / 1000).toLocaleString() + "k";
  $("summary").innerHTML = `
    <div class="stat"><div class="num">${list.length}</div><div class="label">Gyms shown</div></div>
    <div class="stat"><div class="num">${monthlies.length ? fmt(Math.min(...monthlies)) : "—"}</div><div class="label">Cheapest monthly</div></div>
    <div class="stat"><div class="num">${monthlies.length ? fmt(Math.round(monthlies.reduce((a, b) => a + b, 0) / monthlies.length)) : "—"}</div><div class="label">Avg monthly</div></div>
    <div class="stat"><div class="num">${monthlies.length ? fmt(Math.max(...monthlies)) : "—"}</div><div class="label">Priciest monthly</div></div>`;
}

function renderCards(list) {
  if (!list.length) {
    $("cardView").innerHTML = '<p class="empty">No gyms match your filters.</p>';
    return;
  }
  $("cardView").innerHTML = list
    .map(
      (g) => `
    <div class="card">
      <div class="area">${g.area}</div>
      <h3>${g.name}</h3>
      <p class="desc">${g.notes || ""}</p>
      <div class="badges">
        ${g.verified ? '<span class="badge verified">✓ Prices verified</span>' : '<span class="badge unverified">~ Estimated prices</span>'}
        ${g.thaiTrainers ? '<span class="badge">Thai trainers</span>' : ""}
        ${g.accommodation ? '<span class="badge alt">Camp / stay packages</span>' : ""}
        ${g.classesPerDay ? `<span class="badge alt">${g.classesPerDay} MT classes/day</span>` : ""}
      </div>
      <div class="prices">
        <div class="price"><div class="val">${fmtPrice(g, "dropIn")}</div><div class="lbl">Drop-in</div></div>
        <div class="price"><div class="val">${fmtPrice(g, "weekly")}</div><div class="lbl">Weekly</div></div>
        <div class="price highlight"><div class="val">${fmtPrice(g, "monthly")}</div><div class="lbl">Monthly unlimited</div></div>
        <div class="price"><div class="val">${fmtPrice(g, "tenPack")}</div><div class="lbl">10-class pack</div></div>
      </div>
      <div class="links">
        ${g.website ? `<a href="${g.website}" target="_blank" rel="noopener">Website</a>` : ""}
        ${g.instagram ? `<a href="${g.instagram}" target="_blank" rel="noopener">Instagram</a>` : ""}
        ${g.maps ? `<a href="${g.maps}" target="_blank" rel="noopener">Map</a>` : ""}
      </div>
    </div>`
    )
    .join("");
}

function renderTable(list) {
  $("tableBody").innerHTML = list
    .map(
      (g) => `
    <tr>
      <td><strong>${g.name}</strong></td>
      <td>${g.area}</td>
      <td>${fmtPrice(g, "dropIn")}</td>
      <td>${fmtPrice(g, "weekly")}</td>
      <td>${fmtPrice(g, "monthly")}</td>
      <td>${g.accommodation ? "✅" : "—"}</td>
      <td>${g.website ? `<a href="${g.website}" target="_blank" rel="noopener">site</a>` : ""}</td>
    </tr>`
    )
    .join("");
}
