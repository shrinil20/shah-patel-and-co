// reveal-on-scroll + nav/mobile bar after the film
const io = new IntersectionObserver(
  (es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
  { threshold: 0.18 }
);
document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));
const revealNow = () => document.querySelectorAll("[data-reveal]:not(.in)").forEach((el) => {
  const r = el.getBoundingClientRect();
  if (r.top < innerHeight * 0.92 && r.bottom > 0) el.classList.add("in");
});
addEventListener("scroll", revealNow, { passive: true });
revealNow();

const nav = document.getElementById("brandnav");
const mbar = document.getElementById("mbar");
const filmEnd = () => (document.getElementById("track")?.offsetHeight ?? innerHeight * 3) - innerHeight;
const syncBars = () => {
  const past = scrollY > filmEnd() * 0.95;
  nav.classList.toggle("on", past);
  mbar.classList.toggle("on", past);
};
addEventListener("scroll", syncBars, { passive: true });
syncBars();

// sidewall decoder: 205/60 R16 91V
const SIDEWALL = {
  w: ["Section width", "205 mm wide", "The width of the tyre from sidewall to sidewall, in millimetres."],
  a: ["Aspect ratio", "60% profile", "Sidewall height as a share of the width — here about 123 mm. Lower numbers mean a shorter, sportier sidewall."],
  r: ["Construction", "Radial", "Cord plies run radially across the tyre, with steel belts under the tread. Almost every modern car tyre is radial."],
  d: ["Rim diameter", "Fits a 16″ wheel", "The wheel diameter this tyre is made for, in inches. It must match your rim exactly."],
  l: ["Load index", "91 = 615 kg", "The most weight each tyre can carry at full pressure. Never fit a lower load index than your car's original tyres."],
  s: ["Speed rating", "V = 240 km/h", "The highest sustained speed the tyre is rated for. Match or exceed what your car came with."],
};
const swBtns = [...document.querySelectorAll(".sidewall button")];
const dLbl = document.getElementById("dLbl");
const dTitle = document.getElementById("dTitle");
const dText = document.getElementById("dText");
swBtns.forEach((b) => b.addEventListener("click", () => {
  const [lbl, title, text] = SIDEWALL[b.dataset.k];
  dLbl.textContent = lbl;
  dTitle.textContent = title;
  dText.textContent = text;
  swBtns.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
}));

// enquiry builder → prefilled WhatsApp message to the shop
const WA = "919033308489";
const single = (groupId) => {
  const btns = [...document.querySelectorAll(`#${groupId} button`)];
  btns.forEach((b) => b.addEventListener("click", () =>
    btns.forEach((x) => x.setAttribute("aria-pressed", String(x === b)))));
  return () => btns.find((b) => b.getAttribute("aria-pressed") === "true");
};
const vehicle = single("qVehicle");
const qty = single("qQty");
const mode = single("qMode");

const needBtns = [...document.querySelectorAll("#qNeeds button")];
needBtns.forEach((b) => b.addEventListener("click", () => {
  const on = b.getAttribute("aria-pressed") !== "true";
  // keep at least one need selected
  if (!on && needBtns.filter((x) => x.getAttribute("aria-pressed") === "true").length === 1) return;
  b.setAttribute("aria-pressed", String(on));
}));

document.getElementById("quoteForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const needs = needBtns.filter((b) => b.getAttribute("aria-pressed") === "true").map((b) => b.dataset.n);
  const car = document.getElementById("qCar").value.trim();
  const size = document.getElementById("qSize").value.trim();
  const name = document.getElementById("qName").value.trim();
  const wantsTyres = needs.includes("New tyres");
  const lines = [
    "Hello Shah Patel & Co., I'd like a price.",
    `Vehicle: ${vehicle().dataset.v}${car ? ` — ${car}` : ""}`,
    `Need: ${needs.join(", ")}`,
    wantsTyres && `Tyres: ${qty().dataset.q}${size ? ` × ${size}` : ""}`,
    !wantsTyres && size && `Tyre size: ${size}`,
    `Collection: ${mode().dataset.m}`,
    name && `Name: ${name}`,
  ].filter(Boolean);
  window.open(`https://wa.me/${WA}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank", "noopener");
});
