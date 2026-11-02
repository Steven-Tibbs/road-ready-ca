"use strict";
/* Every state on a tile map. `c`/`r` place the tile (11 x 8 grid); `href` marks a state that's ready.
   Not every state calls it the DMV, so each one carries its real licensing agency. */
const STATES = [
  {id:"AK", name:"Alaska", c:0, r:0, agency:"Division of Motor Vehicles", short:"DMV"},
  {id:"ME", name:"Maine", c:10, r:0, agency:"Bureau of Motor Vehicles", short:"BMV"},
  {id:"VT", name:"Vermont", c:9, r:1, agency:"Department of Motor Vehicles", short:"DMV"},
  {id:"NH", name:"New Hampshire", c:10, r:1, agency:"Division of Motor Vehicles", short:"DMV"},
  {id:"WA", name:"Washington", c:0, r:2, agency:"Department of Licensing", short:"DOL"},
  {id:"ID", name:"Idaho", c:1, r:2, agency:"Idaho Transportation Department DMV", short:"DMV"},
  {id:"MT", name:"Montana", c:2, r:2, agency:"Motor Vehicle Division", short:"MVD"},
  {id:"ND", name:"North Dakota", c:3, r:2, agency:"NDDOT Driver License Division", short:"NDDOT"},
  {id:"MN", name:"Minnesota", c:4, r:2, agency:"Driver and Vehicle Services", short:"DVS"},
  {id:"IL", name:"Illinois", c:5, r:2, agency:"Secretary of State, Driver Services", short:"SOS"},
  {id:"WI", name:"Wisconsin", c:6, r:2, agency:"WisDOT Division of Motor Vehicles", short:"DMV"},
  {id:"MI", name:"Michigan", c:7, r:2, agency:"Secretary of State", short:"SOS"},
  {id:"NY", name:"New York", c:8, r:2, agency:"Department of Motor Vehicles", short:"DMV"},
  {id:"RI", name:"Rhode Island", c:9, r:2, agency:"Division of Motor Vehicles", short:"DMV"},
  {id:"MA", name:"Massachusetts", c:10, r:2, agency:"Registry of Motor Vehicles", short:"RMV"},
  {id:"OR", name:"Oregon", c:0, r:3, agency:"ODOT Driver and Motor Vehicle Services", short:"DMV"},
  {id:"NV", name:"Nevada", c:1, r:3, agency:"Department of Motor Vehicles", short:"DMV"},
  {id:"WY", name:"Wyoming", c:2, r:3, agency:"WYDOT Driver Services", short:"WYDOT"},
  {id:"SD", name:"South Dakota", c:3, r:3, agency:"Department of Public Safety, Driver Licensing", short:"DPS"},
  {id:"IA", name:"Iowa", c:4, r:3, agency:"Iowa DOT Motor Vehicle Division", short:"Iowa DOT"},
  {id:"IN", name:"Indiana", c:5, r:3, agency:"Bureau of Motor Vehicles", short:"BMV"},
  {id:"OH", name:"Ohio", c:6, r:3, agency:"Bureau of Motor Vehicles", short:"BMV"},
  {id:"PA", name:"Pennsylvania", c:7, r:3, agency:"PennDOT Driver and Vehicle Services", short:"PennDOT"},
  {id:"NJ", name:"New Jersey", c:8, r:3, agency:"Motor Vehicle Commission", short:"MVC"},
  {id:"CT", name:"Connecticut", c:9, r:3, agency:"Department of Motor Vehicles", short:"DMV"},
  {id:"CA", name:"California", c:0, r:4, agency:"Department of Motor Vehicles", short:"DMV", href:"/ca/",
   blurb:"207 questions across 12 topics, the 18+ and under-18 tests, practice by topic, and a drive-test-day checklist."},
  {id:"UT", name:"Utah", c:1, r:4, agency:"Driver License Division", short:"DLD"},
  {id:"CO", name:"Colorado", c:2, r:4, agency:"Division of Motor Vehicles", short:"DMV"},
  {id:"NE", name:"Nebraska", c:3, r:4, agency:"Department of Motor Vehicles", short:"DMV"},
  {id:"MO", name:"Missouri", c:4, r:4, agency:"Department of Revenue license offices", short:"DOR"},
  {id:"KY", name:"Kentucky", c:5, r:4, agency:"Transportation Cabinet, Driver Licensing", short:"KYTC"},
  {id:"WV", name:"West Virginia", c:6, r:4, agency:"Division of Motor Vehicles", short:"DMV"},
  {id:"VA", name:"Virginia", c:7, r:4, agency:"Department of Motor Vehicles", short:"DMV"},
  {id:"MD", name:"Maryland", c:8, r:4, agency:"Motor Vehicle Administration", short:"MVA"},
  {id:"DE", name:"Delaware", c:9, r:4, agency:"Division of Motor Vehicles", short:"DMV"},
  {id:"AZ", name:"Arizona", c:1, r:5, agency:"ADOT Motor Vehicle Division", short:"MVD"},
  {id:"NM", name:"New Mexico", c:2, r:5, agency:"Motor Vehicle Division", short:"MVD"},
  {id:"KS", name:"Kansas", c:3, r:5, agency:"Department of Revenue, Division of Vehicles", short:"KDOR"},
  {id:"AR", name:"Arkansas", c:4, r:5, agency:"DFA Office of Driver Services", short:"DFA"},
  {id:"TN", name:"Tennessee", c:5, r:5, agency:"Department of Safety, Driver Services", short:"TDOSHS"},
  {id:"NC", name:"North Carolina", c:6, r:5, agency:"Division of Motor Vehicles", short:"NCDMV"},
  {id:"SC", name:"South Carolina", c:7, r:5, agency:"Department of Motor Vehicles", short:"SCDMV"},
  {id:"DC", name:"Washington, D.C.", c:8, r:5, agency:"Department of Motor Vehicles", short:"DMV"},
  {id:"OK", name:"Oklahoma", c:3, r:6, agency:"Service Oklahoma", short:"Service OK"},
  {id:"LA", name:"Louisiana", c:4, r:6, agency:"Office of Motor Vehicles", short:"OMV"},
  {id:"MS", name:"Mississippi", c:5, r:6, agency:"Department of Public Safety, Driver Service Bureau", short:"DPS"},
  {id:"AL", name:"Alabama", c:6, r:6, agency:"Alabama Law Enforcement Agency, Driver License Division", short:"ALEA"},
  {id:"GA", name:"Georgia", c:7, r:6, agency:"Department of Driver Services", short:"DDS"},
  {id:"HI", name:"Hawaii", c:0, r:7, agency:"county driver licensing offices", short:"County"},
  {id:"TX", name:"Texas", c:3, r:7, agency:"Department of Public Safety", short:"DPS"},
  {id:"FL", name:"Florida", c:8, r:7, agency:"Highway Safety and Motor Vehicles", short:"FLHSMV"},
];

const $ = (s) => document.querySelector(s);
const map = $("#map");
const pick = $("#statePick");
const detail = $("#detail");
let selected = "CA";

for (const s of STATES) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "tile" + (s.href ? " live" : "");
  b.style.gridColumn = s.c + 1;
  b.style.gridRow = s.r + 1;
  b.dataset.id = s.id;
  b.textContent = s.id;
  b.setAttribute("aria-label", `${s.name}: ${s.href ? "ready to practice" : "coming later"}`);
  b.addEventListener("click", () => (s.href && selected === s.id ? location.assign(s.href) : show(s.id)));
  b.addEventListener("mouseenter", () => show(s.id, true));
  map.append(b);
}
map.addEventListener("mouseleave", () => show(selected, true));

for (const s of [...STATES].sort((a, b) => a.name.localeCompare(b.name))) {
  pick.add(new Option(s.href ? `${s.name} (ready)` : s.name, s.id));
}
pick.addEventListener("change", () => show(pick.value));

function show(id, preview = false) {
  const s = STATES.find((x) => x.id === id);
  if (!s) return;
  if (!preview) selected = id;
  for (const t of map.children) t.classList.toggle("on", t.dataset.id === id);
  pick.value = selected;
  const official = s.short === "DMV" ? `the ${s.agency}` : `the ${s.agency} (${s.short})`;
  const ask = encodeURIComponent(`Road Ready practice test for ${s.name}`);
  detail.className = "detail" + (s.href ? " live" : "");
  detail.innerHTML = s.href
    ? `<div><p class="tag">Ready now</p><h3>${s.name}</h3><p>${s.blurb}</p></div>
       <a class="btn go" href="${s.href}">Start practicing <span aria-hidden="true">→</span></a>`
    : `<div><p class="tag">Coming later</p><h3>${s.name}</h3>
         <p>In ${s.name}, licenses come from ${official}. Every state's handbook is different, so each one gets its own question bank.</p></div>
       <div class="asks">
         <a class="btn" href="https://restrike.dev/contact?about=${ask}">Ask for ${s.name}</a>
         <a class="sub" href="https://github.com/Steven-Tibbs/road-ready-ca/issues/new?template=state-request.md&title=${encodeURIComponent(`State request: ${s.name}`)}" target="_blank" rel="noopener">or request it on GitHub</a>
       </div>`;
}

show(selected);
