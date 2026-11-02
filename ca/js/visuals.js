"use strict";
/* ================= SVG VISUALS =================
   Signs follow real MUTCD / California shapes and colors. Scenes are simple
   top-down or side views. Sign text uses Overpass (a Highway Gothic look-alike). */
const F = `font-family="Overpass, 'Arial Black', Arial, sans-serif" font-weight="900"`;
const C = {
  red:"#C8102E", yel:"#FFCC00", fyg:"#C6E21C", org:"#FF7A1A", grn:"#00704A", blk:"#141414", wht:"#FFFFFF",
  bg:"#2E3446", road:"#3A4157", grass:"#35624C", walk:"#8F98AB", lane:"#E9EDF5", ylane:"#FFD23F",
  me:"#FFD23F", them:"#E5484D", other:"#5B8DEF", glass:"#9BD4F5", skin:"#E8B48C"
};

/* ---------- helpers ---------- */
function oct(cx, cy, r){
  const h = r * 0.41421;
  return [[cx-h,cy-r],[cx+h,cy-r],[cx+r,cy-h],[cx+r,cy+h],[cx+h,cy+r],[cx-h,cy+r],[cx-r,cy+h],[cx-r,cy-h]]
    .map(p => p.map(n => n.toFixed(1)).join(",")).join(" ");
}
function diamond(fill, inner){
  return `<svg viewBox="0 0 100 100"><rect x="15.5" y="15.5" width="69" height="69" rx="7" transform="rotate(45 50 50)" fill="${fill}"/><rect x="19.5" y="19.5" width="61" height="61" rx="5" transform="rotate(45 50 50)" fill="none" stroke="${C.blk}" stroke-width="2.5"/>${inner}</svg>`;
}
function walker(x, y, s, col = C.blk){
  return `<g transform="translate(${x} ${y}) scale(${s})" stroke="${col}" stroke-linecap="round" stroke-linejoin="round" fill="none"><circle cx="0" cy="0" r="5.5" fill="${col}" stroke="none"/><path d="M0 8 L-1.5 25" stroke-width="7.5"/><path d="M-1.5 24 L-8 40 M-1.5 24 L5 32 L7 41" stroke-width="5"/><path d="M0 11 L-7 21 M0 11 L8 19" stroke-width="4"/></g>`;
}
/* top-down car, front points up at rot=0 */
function carTop(cx, cy, rot, col, s = 1){
  return `<g transform="translate(${cx} ${cy}) rotate(${rot}) scale(${s})"><g fill="#0E121A"><rect x="-10.5" y="-12" width="3" height="7" rx="1"/><rect x="7.5" y="-12" width="3" height="7" rx="1"/><rect x="-10.5" y="5" width="3" height="7" rx="1"/><rect x="7.5" y="5" width="3" height="7" rx="1"/></g><rect x="-9" y="-16" width="18" height="32" rx="5" fill="${col}"/><path d="M-7 -9 Q0 -12 7 -9 L6 -3 H-6Z" fill="#101624" opacity=".8"/><path d="M-6 7 H6 L7 11 Q0 13 -7 11Z" fill="#101624" opacity=".65"/></g>`;
}
/* side-view car in a 120x52 frame, facing right */
function carSide(col = C.me){
  return `<path d="M10 34 Q12 22 26 20 L40 8 Q46 4 56 4 H78 Q88 4 94 12 L104 22 Q114 24 116 34 V40 H10Z" fill="${col}"/><path d="M44 10 H58 V22 H34Z M64 10 H80 Q86 10 90 16 L95 22 H64Z" fill="${C.glass}"/><rect x="108" y="28" width="8" height="5" rx="2" fill="#FFF4C2"/><rect x="10" y="30" width="6" height="5" rx="2" fill="#E5484D"/><circle cx="32" cy="42" r="9" fill="#111"/><circle cx="32" cy="42" r="4" fill="#A6B0C5"/><circle cx="92" cy="42" r="9" fill="#111"/><circle cx="92" cy="42" r="4" fill="#A6B0C5"/>`;
}
const CAR = (col = C.me) => `<svg viewBox="0 0 120 52">${carSide(col)}</svg>`;
function speedSign(n){
  return `<svg viewBox="0 0 80 100"><rect x="2" y="2" width="76" height="96" rx="7" fill="#fff"/><rect x="5.5" y="5.5" width="69" height="89" rx="4.5" fill="none" stroke="${C.blk}" stroke-width="2.2"/><text x="40" y="29" font-size="15" ${F} fill="${C.blk}" text-anchor="middle">SPEED</text><text x="40" y="46" font-size="15" ${F} fill="${C.blk}" text-anchor="middle">LIMIT</text><text x="40" y="85" font-size="38" ${F} fill="${C.blk}" text-anchor="middle">${n}</text></svg>`;
}
function light({top = "off", mid = "off", bot = "off", flash = ""} = {}){
  const dark = {r:"#3A1418", y:"#3A3110", g:"#0F2E1E"};
  const lit = {r:"#FF4D4D", y:"#FFD23F", g:"#3DD68C"};
  const lens = (cy, key, state) => {
    const fl = flash === key ? ' class="flash"' : '';
    if(state === "ball") return `<circle cx="30" cy="${cy}" r="13" fill="${lit[key]}"${fl}/>`;
    const base = `<circle cx="30" cy="${cy}" r="13" fill="${dark[key]}"/>`;
    if(state === "arrow") return base + `<path d="M39 ${cy}H22M29 ${cy-7}L22 ${cy}L29 ${cy+7}" stroke="${lit[key]}" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"${fl}/>`;
    return base;
  };
  return `<svg viewBox="0 0 60 132"><rect x="25" y="116" width="10" height="16" fill="#4A5266"/><rect x="5" y="3" width="50" height="114" rx="12" fill="#151922" stroke="#4A5266" stroke-width="3"/>${lens(22,"r",top)}${lens(60,"y",mid)}${lens(98,"g",bot)}</svg>`;
}
function curb(col){
  return `<svg viewBox="0 0 160 100"><rect width="160" height="100" rx="12" fill="${C.bg}"/><path d="M12 0H148A12 12 0 0 1 160 12V34H0V12A12 12 0 0 1 12 0Z" fill="${C.walk}"/><path d="M40 0V34M80 0V34M120 0V34" stroke="#7D8699" stroke-width="1.5"/><rect x="0" y="34" width="160" height="10" fill="${col}"/><rect x="0" y="34" width="160" height="2.5" fill="#fff" opacity=".35"/>${carTop(80,64,90,"#C9D1E0",1.55)}</svg>`;
}
function hand(dir){
  const arm = dir === "left" ? "M84 55 H26" : dir === "right" ? "M84 55 H48 V20" : "M84 55 H48 V90";
  const end = dir === "left" ? [22,55] : dir === "right" ? [48,15] : [48,95];
  return `<svg viewBox="0 0 170 120"><rect width="170" height="120" rx="12" fill="${C.bg}"/><path d="M0 106H170V108A12 12 0 0 1 158 120H12A12 12 0 0 1 0 108Z" fill="#262B3A"/><path d="M90 36 H142 Q148 36 150 44 L154 60 H78 L82 44 Q84 36 90 36Z" fill="#3B6FD8"/><path d="M92 41 H140 L145 57 H87Z" fill="${C.glass}"/><rect x="70" y="58" width="92" height="34" rx="8" fill="#3B6FD8"/><rect x="75" y="64" width="16" height="8" rx="2" fill="#FF4D4D"/><rect x="141" y="64" width="16" height="8" rx="2" fill="#FF4D4D"/><rect x="104" y="72" width="24" height="12" rx="2" fill="#F4F6FA"/><rect x="70" y="86" width="92" height="8" rx="3" fill="#1E2433"/><rect x="76" y="92" width="16" height="13" rx="3" fill="#111"/><rect x="140" y="92" width="16" height="13" rx="3" fill="#111"/><path d="${arm}" stroke="${C.skin}" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${end[0]}" cy="${end[1]}" r="6" fill="${C.skin}"/></svg>`;
}
function hill(down){
  const a = down ? 12 : -12, id = down ? "hcd" : "hcu";
  const arrow = `<g transform="translate(${down ? 98 : 80} ${down ? 15 : 21}) rotate(${a})"><path d="M0 0 H28" stroke="#F4F6FA" stroke-width="3" stroke-linecap="round"/><path d="M26 -6 L37 0 L26 6Z" fill="#F4F6FA"/></g>`;
  return `<svg viewBox="0 0 170 110"><defs><clipPath id="${id}"><rect width="170" height="110" rx="12"/></clipPath></defs><g clip-path="url(#${id})"><rect width="170" height="110" fill="${C.bg}"/><g transform="rotate(${a} 85 70)"><rect x="-40" y="50" width="250" height="16" fill="${C.walk}"/><rect x="-40" y="65" width="250" height="5" fill="#C9D1E0"/><rect x="-40" y="70" width="250" height="70" fill="${C.road}"/><g transform="translate(37 35.4) scale(.8)">${carSide(C.me)}</g></g></g><text x="14" y="25" font-size="15" ${F} fill="#F4F6FA">${down ? "DOWNHILL" : "UPHILL"}</text>${arrow}</svg>`;
}
function bikeIcon(col){
  return `<g stroke="${col}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="27" cy="62" r="14"/><circle cx="73" cy="62" r="14"/><path d="M27 62 L41 40 H63 L73 62 M41 40 L50 62 L63 40 M37 32 H48 M63 40 L60 30 H69"/></g>`;
}

/* ---------- the library ---------- */
const SIGN = {
  octagon:`<svg viewBox="0 0 100 100"><polygon points="${oct(50,50,48)}" fill="#fff"/><polygon points="${oct(50,50,44.5)}" fill="${C.red}"/><text x="50" y="60" font-size="28" ${F} fill="#fff" text-anchor="middle">STOP</text></svg>`,
  yield:`<svg viewBox="0 0 100 90"><polygon points="3,4 97,4 50,86" fill="${C.red}" stroke="#fff" stroke-width="2.5" stroke-linejoin="round"/><polygon points="19,13.5 81,13.5 50,67" fill="#fff"/><text x="50" y="30" font-size="12.5" ${F} fill="${C.red}" text-anchor="middle">YIELD</text></svg>`,
  school:`<svg viewBox="0 0 100 100"><polygon points="50,3 97,38 97,97 3,97 3,38" fill="${C.fyg}" stroke-linejoin="round"/><polygon points="50,9 92,40 92,92 8,92 8,40" fill="none" stroke="${C.blk}" stroke-width="2.5" stroke-linejoin="round"/>${walker(39,33,1.05)}${walker(63,41,0.88)}</svg>`,
  rxr:`<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="${C.yel}"/><circle cx="50" cy="50" r="44.5" fill="none" stroke="${C.blk}" stroke-width="2.5"/><path d="M19.5 19.5 80.5 80.5 M80.5 19.5 19.5 80.5" stroke="${C.blk}" stroke-width="7"/><text x="25" y="58" font-size="21" ${F} fill="${C.blk}" text-anchor="middle">R</text><text x="75" y="58" font-size="21" ${F} fill="${C.blk}" text-anchor="middle">R</text></svg>`,
  crossbuck:`<svg viewBox="0 0 120 120"><rect x="57" y="44" width="6" height="76" fill="#9AA3B5"/><g transform="rotate(-38 60 42)"><rect x="6" y="33" width="108" height="18" rx="2" fill="#fff" stroke="${C.blk}" stroke-width="1.5"/><text x="33" y="46.5" font-size="11.5" ${F} fill="${C.blk}" text-anchor="middle">RAIL</text><text x="87" y="46.5" font-size="11.5" ${F} fill="${C.blk}" text-anchor="middle">ROAD</text></g><g transform="rotate(38 60 42)"><rect x="6" y="33" width="108" height="18" rx="2" fill="#fff" stroke="${C.blk}" stroke-width="1.5"/><text x="33" y="46.5" font-size="11.5" ${F} fill="${C.blk}" text-anchor="middle">CROSS</text><text x="87" y="46.5" font-size="11.5" ${F} fill="${C.blk}" text-anchor="middle">ING</text></g></svg>`,
  curve:diamond(C.yel, `<path d="M40 77 V60 C40 47 60 47 60 35" stroke="${C.blk}" stroke-width="8" fill="none"/><path d="M50 37 60 21 70 37Z" fill="${C.blk}"/>`),
  diamond:diamond(C.yel, `<rect x="45.5" y="27" width="9" height="30" rx="3" fill="${C.blk}"/><circle cx="50" cy="67" r="5.5" fill="${C.blk}"/>`),
  construction:diamond(C.org, `<text x="50" y="41" font-size="11.5" ${F} fill="${C.blk}" text-anchor="middle">ROAD</text><text x="50" y="54" font-size="11.5" ${F} fill="${C.blk}" text-anchor="middle">WORK</text><text x="50" y="67" font-size="11.5" ${F} fill="${C.blk}" text-anchor="middle">AHEAD</text>`),
  dne:`<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#fff"/><circle cx="50" cy="50" r="45" fill="${C.red}"/><rect x="15" y="42" width="70" height="16" rx="1.5" fill="#fff"/><text x="50" y="34" font-size="12.5" ${F} fill="#fff" text-anchor="middle">DO NOT</text><text x="50" y="75" font-size="12.5" ${F} fill="#fff" text-anchor="middle">ENTER</text></svg>`,
  wrongway:`<svg viewBox="0 0 140 90"><rect x="2" y="2" width="136" height="86" rx="8" fill="#fff"/><rect x="6" y="6" width="128" height="78" rx="6" fill="${C.red}"/><text x="70" y="41" font-size="26" ${F} fill="#fff" text-anchor="middle">WRONG</text><text x="70" y="73" font-size="26" ${F} fill="#fff" text-anchor="middle">WAY</text></svg>`,
  nouturn:`<svg viewBox="0 0 100 100"><rect x="2" y="2" width="96" height="96" rx="7" fill="#fff"/><rect x="5.5" y="5.5" width="89" height="89" rx="5" fill="none" stroke="${C.blk}" stroke-width="2.2"/><path d="M62 78 V44 Q62 28 48 28 Q34 28 34 44 V56" stroke="${C.blk}" stroke-width="8" fill="none"/><path d="M24 54 34 70 44 54Z" fill="${C.blk}"/><circle cx="50" cy="51" r="35" fill="none" stroke="${C.red}" stroke-width="7"/><path d="M25.3 26.3 74.7 75.7" stroke="${C.red}" stroke-width="7"/></svg>`,
  smv:`<svg viewBox="0 0 100 90"><polygon points="50,4 97,86 3,86" fill="#A3121F" stroke="#A3121F" stroke-width="4" stroke-linejoin="round"/><polygon points="50,25 80,77 20,77" fill="#FF6A13"/></svg>`,
  pedx:diamond(C.fyg, walker(50,25,1.2)),
  merge:diamond(C.yel, `<path d="M56 81 V20" stroke="${C.blk}" stroke-width="8"/><path d="M32 77 C33 63 43 55 54 50" stroke="${C.blk}" stroke-width="6" fill="none"/>`),
  speed:speedSign(25),
  speed65:speedSign("??"),
  "ico-lanes":`<svg viewBox="0 0 80 100"><rect x="2" y="2" width="76" height="96" rx="7" fill="#fff"/><rect x="5.5" y="5.5" width="69" height="89" rx="4.5" fill="none" stroke="${C.blk}" stroke-width="2.2"/><path d="M48 72 V46 Q48 34 36 34 H28" stroke="${C.blk}" stroke-width="8" fill="none"/><path d="M30 22 13 34 30 46Z" fill="${C.blk}"/><text x="40" y="88" font-size="13" ${F} fill="${C.blk}" text-anchor="middle">ONLY</text></svg>`,
  "ico-parking":`<svg viewBox="0 0 100 100"><rect x="2" y="2" width="96" height="96" rx="7" fill="#fff"/><rect x="5.5" y="5.5" width="89" height="89" rx="5" fill="none" stroke="${C.blk}" stroke-width="2.2"/><text x="50" y="70" font-size="54" ${F} fill="${C.blk}" text-anchor="middle">P</text><circle cx="50" cy="50" r="35" fill="none" stroke="${C.red}" stroke-width="7"/><path d="M25.3 25.3 74.7 74.7" stroke="${C.red}" stroke-width="7"/></svg>`,
  "ico-hazard":`<svg viewBox="0 0 100 100"><polygon points="50,10 93,86 7,86" fill="none" stroke="#E5484D" stroke-width="9" stroke-linejoin="round"/><rect x="45.5" y="38" width="9" height="26" rx="3" fill="#F4F6FA"/><circle cx="50" cy="73" r="5" fill="#F4F6FA"/></svg>`,
  bike:`<svg viewBox="0 0 100 100"><rect x="3" y="3" width="94" height="94" rx="14" fill="${C.grn}"/>${bikeIcon("#fff")}</svg>`,
  moto:`<svg viewBox="0 0 100 100"><rect x="3" y="3" width="94" height="94" rx="14" fill="#2F3850"/><g stroke="#FFD23F" stroke-linecap="round" stroke-linejoin="round" fill="none"><circle cx="24" cy="70" r="12" stroke-width="6"/><circle cx="78" cy="70" r="12" stroke-width="6"/><path d="M24 70 L40 58 M78 70 L69 42 M64 41 H76" stroke-width="5"/><path d="M44 30 L40 48" stroke-width="8"/><path d="M43 34 L62 42 M40 48 L52 50 L56 62" stroke-width="5.5"/></g><path d="M32 58 Q36 48 46 48 H64 Q70 48 72 56 L66 60 H40Z" fill="#FFD23F"/><rect x="44" y="58" width="18" height="10" rx="3" fill="#FFD23F"/><circle cx="46" cy="22" r="8.5" fill="#FFD23F"/></svg>`,
  nodrink:`<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" fill="#fff"/><path d="M37 25 H63 Q65 50 50 54 Q35 50 37 25Z" fill="#9B1C31"/><path d="M37 25 H63 L62.5 33 H37.5Z" fill="#DDE3EE"/><rect x="48" y="53" width="4" height="18" fill="#2F3850"/><ellipse cx="50" cy="73" rx="12" ry="3.5" fill="#2F3850"/><circle cx="50" cy="50" r="40" fill="none" stroke="${C.red}" stroke-width="8"/><path d="M21.7 21.7 78.3 78.3" stroke="${C.red}" stroke-width="8"/></svg>`,
  permit:`<svg viewBox="0 0 160 100"><rect x="3" y="3" width="154" height="94" rx="10" fill="#F4F6FA"/><path d="M13 3 H147 A10 10 0 0 1 157 13 V32 H3 V13 A10 10 0 0 1 13 3Z" fill="#1F5FAE"/><text x="80" y="18" font-size="12" ${F} fill="#fff" text-anchor="middle" letter-spacing="1">CALIFORNIA</text><text x="80" y="28" font-size="7.5" ${F} fill="#CFE0F7" text-anchor="middle" letter-spacing=".5">INSTRUCTION PERMIT</text><rect x="14" y="40" width="36" height="46" rx="4" fill="#C3CAD8"/><circle cx="32" cy="57" r="8.5" fill="#7A8399"/><path d="M18 86 Q32 64 46 86Z" fill="#7A8399"/><rect x="60" y="46" width="84" height="6" rx="3" fill="#C3CAD8"/><rect x="60" y="59" width="62" height="6" rx="3" fill="#C3CAD8"/><rect x="60" y="72" width="74" height="6" rx="3" fill="#FFD23F"/></svg>`,

  "light-red":light({top:"ball"}),
  "light-yellow":light({mid:"ball"}),
  "light-green":light({bot:"ball"}),
  "light-flash-red":light({top:"ball", flash:"r"}),
  "light-flash-yellow":light({mid:"ball", flash:"y"}),
  "light-off":light(),
  "light-red-arrow":light({top:"arrow"}),
  "light-green-arrow":light({bot:"arrow"}),
  "light-flash-yellow-arrow":light({mid:"arrow", flash:"y"}),

  "curb-red":curb("#E5484D"), "curb-white":curb("#F4F6FA"), "curb-green":curb("#22B07D"), "curb-yellow":curb("#FFD23F"), "curb-blue":curb("#3B82F6"),
  "hand-left":hand("left"), "hand-right":hand("right"), "hand-stop":hand("down"),
  "hill-down":hill(true), "hill-up":hill(false),

  truck:`<svg viewBox="0 0 200 130"><rect width="200" height="130" rx="12" fill="${C.road}"/><path d="M0 40H200M0 90H200" stroke="${C.lane}" stroke-width="2" stroke-dasharray="12 10"/><g fill="#E5484D" opacity=".38"><rect x="4" y="47" width="40" height="36" rx="4"/><rect x="172" y="47" width="24" height="36" rx="4"/><rect x="104" y="6" width="62" height="38" rx="4"/><rect x="40" y="86" width="130" height="38" rx="4"/></g><rect x="46" y="50" width="94" height="30" rx="3" fill="#DDE3EE"/><rect x="140" y="51" width="28" height="28" rx="6" fill="#E5484D"/><rect x="159" y="54" width="6" height="22" rx="2" fill="${C.glass}"/><rect x="148" y="46" width="6" height="5" rx="1" fill="#1E2433"/><rect x="148" y="79" width="6" height="5" rx="1" fill="#1E2433"/></svg>`,
  siren:`<svg viewBox="0 0 170 90"><rect width="170" height="90" rx="12" fill="${C.road}"/><path d="M12 0H158A12 12 0 0 1 170 12V80H0V12A12 12 0 0 1 12 0Z" fill="${C.bg}"/><rect x="14" y="24" width="96" height="46" rx="4" fill="#F4F6FA"/><path d="M110 34 H134 L152 52 V70 H110Z" fill="#F4F6FA"/><path d="M116 38 H132 L145 52 H116Z" fill="${C.glass}"/><rect x="14" y="52" width="138" height="6" fill="#E5484D"/><rect x="20" y="17" width="16" height="7" rx="2" fill="#E5484D" class="flash"/><rect x="88" y="17" width="16" height="7" rx="2" fill="#3B82F6" class="flash" style="animation-delay:.5s"/><g fill="#111"><circle cx="40" cy="72" r="10"/><circle cx="132" cy="72" r="10"/></g><g fill="#A6B0C5"><circle cx="40" cy="72" r="4"/><circle cx="132" cy="72" r="4"/></g></svg>`,
  bus:`<svg viewBox="0 0 180 100"><rect width="180" height="100" rx="12" fill="${C.bg}"/><rect x="34" y="20" width="138" height="58" rx="8" fill="#FFB400"/><path d="M34 44 H14 Q8 44 8 50 V78 H34Z" fill="#FFB400"/><g fill="${C.glass}"><rect x="40" y="28" width="20" height="16" rx="2"/><rect x="65" y="28" width="20" height="16" rx="2"/><rect x="90" y="28" width="20" height="16" rx="2"/><rect x="115" y="28" width="20" height="16" rx="2"/><rect x="140" y="28" width="24" height="16" rx="2"/></g><rect x="8" y="60" width="164" height="3" fill="${C.blk}"/><rect x="8" y="68" width="164" height="3" fill="${C.blk}"/><text x="104" y="56" font-size="9" ${F} fill="${C.blk}" text-anchor="middle">SCHOOL BUS</text><circle cx="42" cy="23.5" r="3.5" fill="#FF4D4D" class="flash"/><circle cx="164" cy="23.5" r="3.5" fill="#FF4D4D" class="flash"/><path d="M28 34 H34" stroke="#555" stroke-width="2"/><polygon points="${oct(19,34,10)}" fill="${C.red}" stroke="#fff" stroke-width="1.2"/><text x="19" y="36.6" font-size="6.5" ${F} fill="#fff" text-anchor="middle">STOP</text><g fill="#111"><circle cx="36" cy="80" r="11"/><circle cx="146" cy="80" r="11"/></g><g fill="#A6B0C5"><circle cx="36" cy="80" r="4"/><circle cx="146" cy="80" r="4"/></g></svg>`,

  "4way":`<svg viewBox="0 0 160 160"><rect width="160" height="160" rx="12" fill="${C.grass}"/><rect x="55" y="0" width="50" height="160" fill="${C.road}"/><rect x="0" y="55" width="160" height="50" fill="${C.road}"/><path d="M80 0V48M80 112V160M0 80H48M112 80H160" stroke="${C.ylane}" stroke-width="2"/><path d="M80 110H105M55 50H80M50 80V105M110 55V80" stroke="${C.lane}" stroke-width="3"/><g fill="${C.red}" stroke="#fff" stroke-width="1"><polygon points="${oct(114,120,6)}"/><polygon points="${oct(46,40,6)}"/><polygon points="${oct(40,114,6)}"/><polygon points="${oct(120,46,6)}"/></g>${carTop(92,128,0,C.me)}${carTop(32,92,90,C.them)}<text x="92" y="157" font-size="10" ${F} fill="#fff" text-anchor="middle">YOU</text></svg>`,
  roundabout:`<svg viewBox="0 0 160 160"><rect width="160" height="160" rx="12" fill="${C.grass}"/><rect x="62" y="0" width="36" height="160" fill="${C.road}"/><rect x="0" y="62" width="160" height="36" fill="${C.road}"/><circle cx="80" cy="80" r="52" fill="${C.road}"/><circle cx="80" cy="80" r="22" fill="${C.grass}" stroke="#C9D1E0" stroke-width="3"/><g stroke="#F4F6FA" stroke-width="3.5" fill="none" stroke-linecap="round"><path d="M76 44 A36 36 0 0 0 44 76"/><path d="M84 116 A36 36 0 0 0 116 84"/></g><g fill="#F4F6FA"><path d="M38 72 44 84 50 72Z"/><path d="M110 88 116 76 122 88Z"/></g>${carTop(89,140,0,C.me)}${carTop(107,53,-45,C.other)}</svg>`,
  blind:`<svg viewBox="0 0 160 130"><rect width="160" height="130" rx="12" fill="${C.grass}"/><rect x="62" y="0" width="36" height="130" fill="${C.road}"/><rect x="0" y="46" width="160" height="34" fill="${C.road}"/><g fill="#1F4A35"><circle cx="20" cy="90" r="12"/><circle cx="40" cy="92" r="13"/><circle cx="56" cy="88" r="9"/><circle cx="30" cy="108" r="13"/><circle cx="52" cy="104" r="10"/><circle cx="108" cy="88" r="10"/><circle cx="124" cy="92" r="13"/><circle cx="144" cy="90" r="12"/><circle cx="110" cy="106" r="11"/><circle cx="134" cy="110" r="13"/></g><rect x="6" y="6" width="50" height="34" rx="4" fill="#5B6478"/><rect x="104" y="6" width="50" height="34" rx="4" fill="#5B6478"/>${carTop(89,112,0,C.me)}<g font-size="20" ${F} fill="#fff" text-anchor="middle"><text x="20" y="70">?</text><text x="140" y="70">?</text></g></svg>`,
  dblyellow:`<svg viewBox="0 0 160 120"><rect width="160" height="120" rx="12" fill="#5B6478"/><rect x="30" y="0" width="100" height="120" fill="${C.road}"/><path d="M35 0V120M125 0V120" stroke="${C.lane}" stroke-width="2"/><rect x="75.5" y="0" width="3" height="120" fill="${C.ylane}"/><rect x="81.5" y="0" width="3" height="120" fill="${C.ylane}"/>${carTop(105,84,0,C.me)}${carTop(55,34,180,C.them)}</svg>`,
  twlt:`<svg viewBox="0 0 200 120"><rect width="200" height="120" rx="12" fill="#5B6478"/><rect x="0" y="12" width="200" height="96" fill="${C.road}"/><g stroke="${C.ylane}" stroke-width="2.5"><path d="M0 44H200M0 76H200"/><path d="M0 48.5H200M0 71.5H200" stroke-dasharray="12 9"/></g><g stroke="#F4F6FA" stroke-width="4" fill="none" stroke-linecap="round"><path d="M58 64 H80 Q90 64 90 56"/><path d="M142 56 H120 Q110 56 110 64"/></g><g fill="#F4F6FA"><path d="M84 57 90 49 96 57Z"/><path d="M104 63 110 71 116 63Z"/></g>${carTop(40,92,90,C.me)}${carTop(166,28,-90,C.them)}</svg>`,
  bikelane:`<svg viewBox="0 0 160 140"><rect width="160" height="140" rx="12" fill="${C.grass}"/><rect x="0" y="8" width="160" height="34" fill="${C.road}"/><rect x="18" y="42" width="128" height="98" fill="${C.road}"/><rect x="146" y="42" width="14" height="98" fill="${C.walk}"/><path d="M58 42V140M62 42V140" stroke="${C.ylane}" stroke-width="2"/><path d="M114 140V100" stroke="${C.lane}" stroke-width="3"/><path d="M114 100V44" stroke="${C.lane}" stroke-width="3" stroke-dasharray="8 7"/><g transform="translate(117 108) scale(.27)">${bikeIcon("#F4F6FA")}</g>${carTop(88,110,0,C.me)}<circle cx="95" cy="95.5" r="2.6" fill="#FF8A1F" class="flash"/></svg>`,
  bike3ft:`<svg viewBox="0 0 200 110"><rect width="200" height="110" rx="12" fill="${C.road}"/><path d="M0 16H200" stroke="${C.ylane}" stroke-width="2.5" stroke-dasharray="14 10"/><path d="M0 100H200" stroke="${C.lane}" stroke-width="2.5"/>${carTop(100,48,90,C.me,1.3)}<g stroke-linecap="round"><path d="M88 86 H100 M110 86 H122" stroke="#C9D1E0" stroke-width="3.5"/><path d="M100 86 H110" stroke="#8F98AB" stroke-width="2"/><path d="M116 78 V94" stroke="#C9D1E0" stroke-width="2.5"/><path d="M104 79 L116 79 M104 93 L116 93" stroke="#3DD68C" stroke-width="2.5"/></g><ellipse cx="103" cy="86" rx="5" ry="8.5" fill="#3DD68C"/><circle cx="105" cy="86" r="4.2" fill="#FF8A5B"/><g stroke="#F4F6FA" stroke-width="2" fill="#F4F6FA"><path d="M138 62 V74"/><path d="M134 64 138 59 142 64Z"/><path d="M134 72 138 77 142 72Z"/></g><text x="146" y="72" font-size="11" ${F} fill="#F4F6FA">how far?</text></svg>`,
  hydrant:`<svg viewBox="0 0 100 100"><rect width="100" height="100" rx="12" fill="${C.bg}"/><path d="M0 82H100V88A12 12 0 0 1 88 100H12A12 12 0 0 1 0 88Z" fill="${C.walk}"/><rect x="37" y="40" width="26" height="40" rx="3" fill="#E5484D"/><path d="M35 42 Q50 18 65 42Z" fill="#C8102E"/><rect x="47" y="20" width="6" height="7" rx="1.5" fill="#C8102E"/><rect x="32" y="39" width="36" height="7" rx="3" fill="#C8102E"/><rect x="26" y="53" width="11" height="10" rx="2" fill="#C8102E"/><rect x="63" y="53" width="11" height="10" rx="2" fill="#C8102E"/><circle cx="50" cy="61" r="6" fill="#C8102E"/><rect x="32" y="77" width="36" height="6" rx="2" fill="#C8102E"/></svg>`,
  "3sec":`<svg viewBox="0 0 220 100"><rect width="220" height="100" rx="12" fill="${C.bg}"/><path d="M0 74H220V88A12 12 0 0 1 208 100H12A12 12 0 0 1 0 88Z" fill="${C.road}"/><path d="M0 88H220" stroke="${C.ylane}" stroke-width="2" stroke-dasharray="10 8"/><rect x="117" y="36" width="4" height="38" fill="#A6B0C5"/><rect x="109" y="26" width="20" height="12" rx="2" fill="#0F8A5F"/><g transform="translate(140 46) scale(.55)">${carSide("#3DD68C")}</g><g transform="translate(16 46) scale(.55)">${carSide(C.me)}</g><text x="96" y="21" font-size="13" ${F} fill="#F4F6FA" text-anchor="middle">how many seconds?</text></svg>`,
  night:`<svg viewBox="0 0 220 100"><rect width="220" height="100" rx="12" fill="#0B1020"/><g fill="#fff" opacity=".6"><circle cx="30" cy="16" r="1"/><circle cx="70" cy="28" r="1"/><circle cx="120" cy="12" r="1.2"/><circle cx="150" cy="30" r="1"/></g><circle cx="190" cy="22" r="10" fill="#F4F6FA"/><circle cx="185" cy="18" r="10" fill="#0B1020"/><path d="M0 76H220V88A12 12 0 0 1 208 100H12A12 12 0 0 1 0 88Z" fill="#1E2433"/><path d="M0 89H220" stroke="${C.ylane}" stroke-width="2" stroke-dasharray="10 8" opacity=".6"/><polygon points="78,62 220,44 220,86 78,68" fill="#FFE9A8" opacity=".22"/><g transform="translate(14 48) scale(.55)">${carSide(C.me)}</g></svg>`,
  fog:`<svg viewBox="0 0 220 100"><rect width="220" height="100" rx="12" fill="#5D6679"/><path d="M0 76H220V88A12 12 0 0 1 208 100H12A12 12 0 0 1 0 88Z" fill="#3F4659"/><polygon points="78,63 160,62 160,76 78,68" fill="#FFE9A8" opacity=".4"/><g transform="translate(14 48) scale(.55)">${carSide(C.me)}</g><g fill="#D5DAE4" opacity=".55"><ellipse cx="60" cy="26" rx="56" ry="10"/><ellipse cx="160" cy="44" rx="60" ry="12"/><ellipse cx="120" cy="80" rx="70" ry="9"/><ellipse cx="190" cy="18" rx="40" ry="8"/></g></svg>`
};

/* how big each visual renders in a question card */
const SIZE = {};
["light-red","light-yellow","light-green","light-flash-red","light-flash-yellow","light-off","light-red-arrow","light-green-arrow","light-flash-yellow-arrow"].forEach(k => SIZE[k] = "tall");
["4way","roundabout","blind","dblyellow","bikelane"].forEach(k => SIZE[k] = "square");
["wrongway","permit","truck","siren","bus","hand-left","hand-right","hand-stop","hill-down","hill-up","3sec","night","fog","twlt","bike3ft",
 "curb-red","curb-white","curb-green","curb-yellow","curb-blue"].forEach(k => SIZE[k] = "scene");

/* short descriptions for screen readers */
const ALT = {
  octagon:"Red octagon STOP sign", yield:"Red and white downward triangle YIELD sign", school:"Five-sided yellow-green sign with two children walking",
  rxr:"Round yellow sign with a black X and two letter Rs", crossbuck:"White X-shaped railroad crossing sign on a post", curve:"Yellow diamond sign with an arrow curving right",
  diamond:"Yellow diamond warning sign", construction:"Orange diamond sign reading ROAD WORK AHEAD", dne:"Red circle sign with a white bar, reading DO NOT ENTER",
  wrongway:"Red rectangle sign reading WRONG WAY", nouturn:"White sign with a U-turn arrow crossed out by a red circle and slash",
  smv:"Orange triangle with a dark red border", pedx:"Yellow-green diamond sign with a walking person", merge:"Yellow diamond sign showing a lane joining the main road",
  speed:"White SPEED LIMIT 25 sign", speed65:"White SPEED LIMIT sign with question marks", bike:"Bicycle symbol", moto:"Motorcycle and rider",
  nodrink:"Wine glass crossed out by a red circle and slash", permit:"California instruction permit card",
  "light-red":"Traffic signal showing steady red", "light-yellow":"Traffic signal showing steady yellow", "light-green":"Traffic signal showing steady green",
  "light-flash-red":"Traffic signal flashing red", "light-flash-yellow":"Traffic signal flashing yellow", "light-off":"Traffic signal with all lights dark",
  "light-red-arrow":"Traffic signal showing a red left arrow", "light-green-arrow":"Traffic signal showing a green left arrow", "light-flash-yellow-arrow":"Traffic signal flashing a yellow left arrow",
  "curb-red":"Car parked at a red curb", "curb-white":"Car parked at a white curb", "curb-green":"Car parked at a green curb", "curb-yellow":"Car parked at a yellow curb", "curb-blue":"Car parked at a blue curb",
  "hand-left":"Rear view of a car, driver's left arm straight out", "hand-right":"Rear view of a car, driver's left arm bent upward", "hand-stop":"Rear view of a car, driver's left arm pointing down",
  "hill-down":"Car parked facing downhill next to a curb", "hill-up":"Car parked facing uphill next to a curb",
  truck:"Top view of a big rig with shaded blind spots in front, behind and on both sides", siren:"Ambulance with flashing lights", bus:"School bus with flashing red lights and stop arm out",
  "4way":"Four-way stop. Your car waits at the bottom; another car waits on the left", roundabout:"Roundabout with arrows going counterclockwise",
  blind:"Intersection with hedges blocking the view of cross traffic", dblyellow:"Two-lane road with double solid yellow center lines",
  twlt:"Road with a center two-way left-turn lane", bikelane:"Car approaching a right turn next to a bike lane; the bike lane line turns dashed near the corner",
  bike3ft:"Car passing a bicyclist", hydrant:"Fire hydrant at the curb", "3sec":"Your car following another car past a roadside marker",
  night:"Car driving at night with headlights on", fog:"Car driving in fog"
};
