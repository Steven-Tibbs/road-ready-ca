"use strict";
/* ================= STATE ================= */
const KEY = "roadready.ca.v2";
let store = {name:"", age:"adult", history:[], missed:{}, seen:{}, topicStats:{}, checks:{}, drillBest:null, sound:true};
try{ const raw = localStorage.getItem(KEY); if(raw) store = Object.assign(store, JSON.parse(raw)); }catch(e){}
function save(){ try{ localStorage.setItem(KEY, JSON.stringify(store)); }catch(e){} }

/* The 18+ format (36 questions, 30 to pass) is widely reported; the DMV itself only says 80% or better.
   We use 30/36 so practice is slightly stricter than the real thing. */
const FORMAT = {adult:{n:36, pass:30}, minor:{n:46, pass:38}};
const fmt = () => FORMAT[store.age] || FORMAT.adult;
const eligible = q => !q.who || q.who === store.age;

function hashId(s){ let h = 5381; for(let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return "q" + (h >>> 0).toString(36); }
Q.forEach(q => q.id = hashId(q.t + "|" + (q.s || "") + "|" + q.q));
const BYID = Object.fromEntries(Q.map(q => [q.id, q]));

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
let run = null;

/* ================= AUDIO ================= */
let actx = null;
function beep(type){
  if(!store.sound) return;
  try{
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const notes = type === "ok" ? [660,880] : type === "win" ? [523,659,784,1046] : type === "horn" ? [392,392] : [220,160];
    notes.forEach((f, i) => {
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = type === "no" || type === "horn" ? "sawtooth" : "triangle"; o.frequency.value = f;
      const t = actx.currentTime + i * (type === "horn" ? 0.02 : 0.11), len = type === "horn" ? 0.45 : 0.2;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(type === "horn" ? 0.09 : 0.18, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
      o.connect(g).connect(actx.destination); o.start(t); o.stop(t + len + 0.02);
    });
  }catch(e){}
}
function vibrate(ms){ try{ navigator.vibrate && navigator.vibrate(ms); }catch(e){} }

/* ================= NAV ================= */
const SCREENS = ["home","topics","quiz","results","guide","drive"];
function show(name){
  SCREENS.forEach(s => { $("#screen-" + s).hidden = s !== name; });
  window.scrollTo({top:0, behavior:"instant"});
  if(name === "home") renderHome();
}
function shuffle(a){ a = a.slice(); for(let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const isPass = x => x.pass !== undefined ? x.pass : x.score / x.total >= 0.826;

/* ================= HOME ================= */
function renderHome(){
  const F = fmt(), adult = store.age === "adult";
  $("#heroCar").innerHTML = CAR();
  $("#icoFull").innerHTML = SIGN.octagon; $("#icoQuick").innerHTML = SIGN.curve; $("#icoTopic").innerHTML = SIGN.school;
  $("#icoMissed").innerHTML = SIGN.yield; $("#icoGuide").innerHTML = SIGN.speed; $("#icoDrive").innerHTML = CAR("#FF8A5B");
  $$(".agepick button").forEach(b => b.setAttribute("aria-checked", String(b.dataset.age === store.age)));
  $("#fullDesc").textContent = `${F.n} questions like the real ${adult ? "18+" : "under-18"} test. Need ${F.pass} to pass. No hints.`;
  $("#heroSub").textContent = `Real CA DMV-style questions. ${F.pass} of ${F.n} right is a pass — let's crush it.`;
  const nm = store.name.trim();
  $("#greet").textContent = nm ? `Let's go, ${nm}!` : "Let's get you road ready.";
  $("#driverName").value = store.name;
  $("#facts").innerHTML = (adult
    ? [["36","questions on the 18+ test"],["30","correct to pass — the DMV's minimum is 80%, so aim higher"],["3","tries before you have to re-apply"],["3","answer choices per question"]]
    : [["46","questions if you're under 18"],["38","correct to pass (about 83%)"],["3","tries before you have to re-apply"],["6 mo","holding your permit before the drive test"]]
  ).map(([b, t]) => `<li><b>${b}</b><span>${t}</span></li>`).join("");
  $("#steps").innerHTML = (adult
    ? [["Pass the written test","Plus a vision test, photo, and fee at the DMV. You'll get an instruction permit."],["Practice driving","Only with a California-licensed driver age 18+ in the passenger seat. No driver's ed or logged hours required."],["Pass the drive test","Book it when you're ready, and prep with the Drive Test Day checklist."]]
    : [["Pass the written test","At 15½ or older, with driver's ed done or in progress."],["Practice for 6 months","50 hours with a licensed driver 25+, including 10 at night."],["Pass the drive test","You'll get a provisional license with passenger and night limits."]]
  ).map(([b, t]) => `<li><div><b>${b}</b><span>${t}</span></div></li>`).join("");

  const h = store.history;
  $("#stTests").textContent = h.length;
  $("#stBest").textContent = h.length ? Math.max(...h.map(x => Math.round(x.score / x.total * 100))) + "%" : "–";
  $("#stPasses").textContent = h.filter(isPass).length;
  const mc = Object.keys(store.missed).filter(id => BYID[id]).length;
  $("#missedCount").textContent = mc;
  $("#missedBtn").disabled = mc === 0;
  $("#driveCount").textContent = Math.round(driveReady().pct * 100) + "%";
  const sp = $("#spark");
  if(!h.length){ sp.innerHTML = `<p class="empty-note">No tests yet. Your scores show up here as bars — green means you passed.</p>`; }
  else{
    const last = h.slice(-14);
    sp.innerHTML = `<div class="spark"><div class="passline" style="bottom:83%"><span>PASS</span></div>${last.map((x, i) => { const p = x.score / x.total; return `<div class="bar ${isPass(x) ? "pass" : ""}" style="height:${Math.max(6, p * 100)}%;animation-delay:${i * 40}ms" title="${Math.round(p * 100)}%"></div>`; }).join("")}</div>`;
  }
}

/* ================= TOPICS ================= */
function renderTopics(){
  $("#topicList").innerHTML = Object.entries(TOPICS).map(([k, t]) => {
    const n = Q.filter(q => q.t === k && eligible(q)).length;
    const st = store.topicStats[k]; const pct = st && st.seen ? Math.round(st.right / st.seen * 100) : 0;
    return `<button class="topic" data-topic="${k}"><span class="ti">${SIGN[t.icon]}</span><span style="flex:1;min-width:0"><b>${t.name}</b><small>${n} questions${st && st.seen ? ` · ${pct}% right so far` : ""}</small><div class="meter"><i style="width:${pct}%"></i></div></span></button>`;
  }).join("");
}

/* ================= BUILDING A TEST =================
   Every test is drawn fresh: topics are weighted like the question bank, and inside each topic
   the questions you haven't seen (or saw longest ago) come first, so back-to-back tests overlap
   as little as possible. Answer order is shuffled every time a question is shown. */
function freshest(list, k){
  return shuffle(list).sort((a, b) => (store.seen[a.id] || 0) - (store.seen[b.id] || 0)).slice(0, k);
}
function buildTest(n){
  const pool = Q.filter(eligible);
  n = Math.min(n, pool.length);
  const by = {}; pool.forEach(q => (by[q.t] = by[q.t] || []).push(q));
  const quota = Object.keys(by).map(k => { const exact = by[k].length / pool.length * n; return {k, exact, n:Math.max(1, Math.floor(exact))}; });
  let used = quota.reduce((s, o) => s + o.n, 0);
  quota.sort((a, b) => (b.exact % 1) - (a.exact % 1) || Math.random() - 0.5);
  for(let i = 0, guard = 0; used < n && guard < 1000; i = (i + 1) % quota.length, guard++){
    if(quota[i].n < by[quota[i].k].length){ quota[i].n++; used++; }
  }
  while(used > n){ quota.sort((a, b) => b.n - a.n); quota[0].n--; used--; }
  return shuffle(quota.flatMap(o => freshest(by[o.k], o.n)));
}

/* ================= QUIZ ================= */
function start(mode, opt){
  let qs, label;
  if(mode === "full"){ qs = buildTest(fmt().n); label = store.age === "adult" ? "Full test · 18+" : "Full test · under 18"; }
  else if(mode === "quick"){ qs = buildTest(15); label = "Quick spin"; }
  else if(mode === "topic"){ qs = freshest(Q.filter(q => q.t === opt && eligible(q)), 99); qs = shuffle(qs); label = TOPICS[opt].name; }
  else if(mode === "missed"){ qs = shuffle(Q.filter(q => store.missed[q.id])); label = "Fix my mistakes"; }
  else if(mode === "list"){ qs = shuffle(opt); label = "Retry missed"; }
  if(!qs || !qs.length) return;
  run = {mode, opt, label, qs, i:0, right:0, streak:0, best:0, answers:[], hintUsed:0};
  $("#modeChip").textContent = label; $("#qTot").textContent = qs.length;
  $("#trackCar").innerHTML = CAR();
  $("#quitConfirm").hidden = true;
  show("quiz"); renderQ();
}
function renderQ(){
  const q = run.qs[run.i];
  const order = shuffle([0,1,2]);
  run.answered = false; run.hintNow = false;
  $("#qNum").textContent = run.i + 1; $("#qRight").textContent = run.right; $("#qStreak").textContent = run.streak;
  $("#qTopic").textContent = TOPICS[q.t].name;
  $("#trackCar").style.left = `calc(${run.i / run.qs.length} * (100% - 80px))`;
  const v = $("#qVisual");
  if(q.s && SIGN[q.s]){
    v.innerHTML = SIGN[q.s]; v.hidden = false; v.className = "visual" + (SIZE[q.s] ? " " + SIZE[q.s] : "");
    v.setAttribute("aria-label", ALT[q.s] || "Picture for this question");
  } else { v.innerHTML = ""; v.hidden = true; }
  $("#qText").textContent = q.q;
  $("#qOpts").innerHTML = order.map((ai, k) => `<button class="opt" data-ai="${ai}"><span class="key">${"ABC"[k]}</span><span>${esc(q.a[ai])}</span></button>`).join("");
  const exam = run.mode === "full";
  $("#hintBox").hidden = true; $("#hintBtn").disabled = false; $("#hintRow").hidden = exam; $("#examNote").hidden = !exam || run.i > 0;
  $("#feedback").hidden = true; $("#nextWrap").hidden = true;
  const c = $("#qCard"); c.classList.remove("shake"); c.style.animation = "none"; void c.offsetWidth; c.style.animation = "";
}
function answer(btn){
  if(run.answered) return; run.answered = true;
  const q = run.qs[run.i]; const ai = +btn.dataset.ai; const ok = ai === 0;
  $$("#qOpts .opt").forEach(b => { b.disabled = true; const x = +b.dataset.ai; if(x === 0) b.classList.add("right"); else if(b === btn) b.classList.add("wrong"); else b.classList.add("dim"); });
  run.answers.push({id:q.id, pick:ai, ok, hint:run.hintNow});
  store.seen[q.id] = Date.now();
  const ts = store.topicStats[q.t] = store.topicStats[q.t] || {seen:0, right:0}; ts.seen++;
  if(ok){
    run.right++; run.streak++; run.best = Math.max(run.best, run.streak); ts.right++;
    if(store.missed[q.id]){ store.missed[q.id]--; if(store.missed[q.id] <= 0) delete store.missed[q.id]; }
    beep("ok"); vibrate(15);
    const r = btn.getBoundingClientRect(); const f = document.createElement("div"); f.className = "floaty"; f.textContent = run.streak >= 3 ? `🔥 ${run.streak}` : "+1"; f.style.left = (r.right - 70) + "px"; f.style.top = (r.top - 6) + "px"; document.body.appendChild(f); setTimeout(() => f.remove(), 950);
    const s = $("#qStreak"); s.classList.remove("hot"); void s.offsetWidth; s.classList.add("hot");
  } else {
    run.streak = 0; store.missed[q.id] = (store.missed[q.id] || 0) + 1;
    beep("no"); vibrate([30,40,30]);
    $("#qCard").classList.add("shake");
  }
  save();
  $("#qRight").textContent = run.right; $("#qStreak").textContent = run.streak;
  const praise = ["Nice!","Nailed it!","You got it!","Smooth driving!","Green light!","Perfect!"];
  const oops = ["Not quite.","Close one.","Brake check!","Detour!"];
  const fb = $("#feedback"); fb.hidden = false;
  fb.className = "feedback " + (ok ? "ok" : "no");
  fb.innerHTML = `<h4>${ok ? praise[Math.floor(Math.random() * praise.length)] : oops[Math.floor(Math.random() * oops.length)]}</h4><p>${ok ? "" : `Answer: <b>${esc(q.a[0])}</b>. `}${esc(q.e)}</p>`;
  $("#hintRow").hidden = true; $("#examNote").hidden = true;
  const last = run.i === run.qs.length - 1;
  $("#nextBtn").textContent = last ? "See my score 🏁" : "Next question →";
  $("#nextWrap").hidden = false;
  $("#nextBtn").focus({preventScroll:true});
  fb.scrollIntoView({behavior:"smooth", block:"nearest"});
}
function next(){
  if(run.i < run.qs.length - 1){ run.i++; renderQ(); }
  else finish();
}

/* ================= RESULTS ================= */
function finish(){
  const F = fmt(), total = run.qs.length, score = run.right, p = score / total;
  const passNeed = run.mode === "full" ? F.pass : Math.ceil(total * F.pass / F.n - 1e-9);
  const pass = score >= passNeed;
  if(run.mode === "full" || run.mode === "quick"){ store.history.push({d:Date.now(), score, total, mode:run.mode, age:store.age, pass}); store.history = store.history.slice(-60); save(); }
  show("results");
  $("#scorecard").className = "scorecard " + (pass ? "pass" : "fail");
  const nm = store.name.trim();
  $("#rVerdict").textContent = pass ? (p === 1 ? "PERFECT SCORE!" : "YOU PASSED!") : "KEEP PRACTICING";
  const missedN = total - score;
  $("#rMsg").textContent = pass
    ? `${nm ? nm + ", you" : "You"} got ${score} out of ${total}${run.mode === "full" ? ` — the DMV needs about ${F.pass}` : ""}. ${missedN ? `Review the ${missedN} you missed below and you'll be unstoppable.` : "Flawless. The DMV doesn't stand a chance."}`
    : `${score} out of ${total}. You need ${passNeed} to pass — just ${passNeed - score} more! Your study plan is below.`;
  $("#rStamp").textContent = pass ? "✓ ROAD READY" : "🚧 ALMOST THERE";
  $("#rStamp").style.color = pass ? "#FFD23F" : "#FF9EA1";
  $("#rFrac").textContent = `${score} / ${total}`;
  const Cc = 540.35, fg = $("#ringFg"); fg.style.transition = "none"; fg.style.strokeDashoffset = Cc; void fg.getBoundingClientRect();
  fg.style.transition = ""; requestAnimationFrame(() => { fg.style.strokeDashoffset = Cc * (1 - p); });
  countUp($("#rPct"), Math.round(p * 100));
  if(pass){ beep("win"); confetti(); }

  const by = {};
  run.answers.forEach(a => { const t = BYID[a.id].t; by[t] = by[t] || {r:0, n:0}; by[t].n++; if(a.ok) by[t].r++; });
  const rows = Object.entries(by).sort((a, b) => a[1].r / a[1].n - b[1].r / b[1].n);
  $("#breakdown").innerHTML = rows.map(([t, v], i) => { const pc = v.r / v.n; const cls = pc >= 0.85 ? "" : pc >= 0.6 ? "mid" : "low"; return `<div class="brow"><span>${TOPICS[t].name}</span><span class="n">${v.r}/${v.n}</span><div class="bar"><i class="${cls}" style="width:${Math.max(4, pc * 100)}%;animation-delay:${i * 70}ms"></i></div></div>`; }).join("");

  const weak = rows.filter(([, v]) => v.r < v.n).map(([t]) => t);
  $("#tipsPanel").innerHTML = !weak.length
    ? `<p class="eyebrow">Your study plan</p><p class="empty-note" style="color:var(--paper)">No weak spots this round! Try another Full Practice Test — you'll get different questions.</p>`
    : `<p class="eyebrow">Your study plan · focus on these</p><div class="tips">${weak.slice(0, 5).map(tipCard).join("")}</div>`;

  const missed = run.answers.filter(a => !a.ok);
  $("#retryMissedBtn").hidden = !missed.length;
  $("#missedPanel").hidden = !missed.length;
  $("#missedList").innerHTML = missed.map(a => { const q = BYID[a.id]; return `<div class="miss"><p class="mq">${esc(q.q)}</p><div class="ans"><span class="yours">✗ You said: ${esc(q.a[a.pick])}</span><span class="correct">✓ Correct: ${esc(q.a[0])}</span></div><p class="why">${esc(q.e)}</p></div>`; }).join("");
  run.missedList = missed.map(a => BYID[a.id]);
}
function tipsFor(t){
  const v = TIPS[t];
  if(t === "license") return {tips:v[store.age] || v.adult, trick:v.trick[store.age] || v.trick.adult};
  return v;
}
function tipCard(t){
  const v = tipsFor(t);
  return `<div class="tip"><h4><span class="ti">${SIGN[TOPICS[t].icon]}</span>${TOPICS[t].name}</h4><ul>${v.tips.map(x => `<li>${x}</li>`).join("")}</ul><p class="trick">🧠 Memory trick: ${v.trick}</p></div>`;
}
function countUp(el, to){
  const t0 = performance.now(), d = 1300;
  (function f(t){ const k = Math.min(1, (t - t0) / d); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))) + "%"; if(k < 1) requestAnimationFrame(f); })(t0);
}

/* ================= CONFETTI ================= */
function confetti(){
  if(matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const cv = $("#confetti"), ctx = cv.getContext("2d");
  const dpr = window.devicePixelRatio || 1; cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const cols = ["#FFD23F","#3DD68C","#FF8A5B","#F4F6FA","#22B07D","#E5484D"];
  const P = Array.from({length:160}, () => ({x:innerWidth / 2 + (Math.random() - .5) * 80, y:innerHeight * 0.35, vx:(Math.random() - .5) * 14, vy:-Math.random() * 14 - 4, w:6 + Math.random() * 7, h:8 + Math.random() * 10, r:Math.random() * 6, vr:(Math.random() - .5) * .4, c:cols[Math.floor(Math.random() * cols.length)]}));
  const t0 = performance.now();
  (function f(t){
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    P.forEach(p => { p.vy += 0.32; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore(); });
    if(t - t0 < 3800) requestAnimationFrame(f); else ctx.clearRect(0, 0, innerWidth, innerHeight);
  })(t0);
}

/* ================= GUIDE ================= */
function renderGuide(){
  $("#guideCards").innerHTML = Object.keys(TIPS).map(tipCard).join("").replaceAll("Memory trick: ", "");
  const gal = [["octagon","Octagon · STOP"],["yield","Triangle · YIELD"],["school","Pentagon · SCHOOL"],["rxr","Circle · RAILROAD ahead"],["crossbuck","Crossbuck · railroad crossing"],["curve","Diamond · WARNING"],["construction","Orange · WORK ZONE"],["dne","DO NOT ENTER"],["wrongway","WRONG WAY"],["nouturn","Red slash · NOT ALLOWED"],["smv","Slow-moving vehicle"],["pedx","Pedestrian crossing"],["merge","Merge"],["speed","White rectangle · a LAW"],
    ["light-flash-red","Flashing red = STOP sign"],["light-flash-yellow","Flashing yellow = caution"],["light-red-arrow","Red arrow = no turning"],["light-green-arrow","Green arrow = protected turn"],["light-flash-yellow-arrow","Flashing yellow arrow = turn, but yield"],["light-off","Dark signal = 4-way stop"]];
  $("#signGallery").innerHTML = gal.map(([k, l]) => `<div class="signcell ${SIZE[k] === "scene" ? "wide" : ""}" role="img" aria-label="${esc(ALT[k] || l)}">${SIGN[k]}${l}</div>`).join("");
  const cb = [["curb-red","Red · No stopping at all"],["curb-white","White · Quick passenger or mail stop"],["curb-green","Green · Limited-time parking"],["curb-yellow","Yellow · Loading zone"],["curb-blue","Blue · Disabled placard only"]];
  $("#curbGallery").innerHTML = cb.map(([k, l]) => `<div class="signcell wide">${SIGN[k]}${l}</div>`).join("");
}

/* ================= DRIVE TEST DAY ================= */
const BRING = [
  ["appt","Drive test appointment booked","dmv.ca.gov or 1-800-777-0133"],
  ["permit","Your instruction permit"],
  ["driver","A licensed driver to ride there with you","Permit holders can't drive to the DMV alone"],
  ["reg","Current registration for the car","Card in the car, current sticker on the plate"],
  ["ins","Proof of insurance for THIS car","Paper card or on your phone — check the dates"],
  ["glasses","Glasses or contacts, if you need them to drive"],
  ["know","You've practiced in the exact car you'll test in"],
  ["early","Plan to arrive 15–20 minutes early"]
];
const CARCHECK = [
  ["window","Driver's window rolls down"],
  ["windshield","Windshield is clean, with no cracks blocking the view"],
  ["mirrors","2+ mirrors, including the outside left mirror"],
  ["signals","All 4 turn signals work","Front and back, left and right"],
  ["brakes","Both brake lights work","Left and right — the center one doesn't count"],
  ["horn","Horn works and is loud"],
  ["tires","Tires have tread — no bald spots"],
  ["pedal","Brake pedal feels firm","It shouldn't sink to the floor"],
  ["pbrake","Parking brake sets and releases"],
  ["door","Front passenger door opens and closes"],
  ["glovebox","Glove box stays shut"],
  ["belts","All seat belts work"]
];
const DRIVE_TIPS = [
  "<b>Make your head checks big.</b> The examiner can't see your eyes move. Turn your head for mirrors and look over your shoulder before every lane change, merge, pull-out from the curb, and when backing.",
  "<b>Full stops, every time.</b> Stop behind the limit line (or before the crosswalk), let the car settle, then look left-right-left. That includes right turns on red.",
  "<b>Signal 100 feet before turns</b> and before every lane change — then make sure the signal shuts off.",
  "<b>Watch your speed.</b> 10 mph over the limit is an automatic fail, and so is crawling way under it for no reason. Know where the 25 mph school and residential zones are.",
  "<b>Waiting to turn left?</b> Keep your wheels pointed straight until you actually go.",
  "<b>Backing along the curb:</b> back up straight about 3 car lengths, within 3 feet of the curb. Look over your right shoulder out the rear window — don't just use the camera.",
  "<b>Leave space when you stop.</b> You should see the rear tires of the car ahead touching the road.",
  "<b>Right turn with a bike lane?</b> Check your right blind spot, then merge into the bike lane within 200 feet of the corner.",
  "<b>Never drive more than 200 feet</b> in a bike lane or the center left-turn lane.",
  "<b>Pedestrians first.</b> Wait until they're completely out of your path — even if the light is green.",
  "<b>Before you start the car,</b> adjust your seat and mirrors and buckle up. The examiner notices.",
  "<b>Didn't catch an instruction? Ask.</b> You won't lose points for asking, and the examiner isn't trying to trick you.",
  "<b>Practice near the DMV office</b> you'll test at, around the same time of day as your appointment.",
  "<b>Smooth beats fast.</b> Gentle braking, gentle steering, hands at 9 and 3. Calm and boring = passing."
];
const DRIVE_FAILS = [
  ["The examiner has to step in","Grabbing the wheel, hitting the brake, or telling you to stop to prevent danger. Also: needing more than 3 tries to back up."],
  ["Hitting anything","Another car, a person, an object — or running over a curb or onto the sidewalk."],
  ["Running a stop sign or red light","Including a right turn on red without a full stop first."],
  ["Ignoring signs, lanes, or markings","Turning from the wrong lane, going straight from a turn-only lane, crossing painted islands."],
  ["Not checking blind spots","Lane changes, merging, backing, pulling from the curb, right turns across a bike lane."],
  ["Speed 10+ mph over (or way under) the limit","Or driving too fast or slow for conditions."],
  ["Forcing someone else to react","Making a driver brake or swerve, or not yielding to a pedestrian."],
  ["Passing a stopped school bus with red lights","Or not pulling over for an emergency vehicle."],
  ["Blocking an intersection","Entering when you can't get all the way through."],
  ["Not using wipers, defroster, or headlights when needed"]
];
const DRILL = [
  {id:"left", ask:"Show me your left turn signal.", ctl:"sig-down", fx:"sig-left", tip:"Lever DOWN = left. The lever moves the same way the top of the steering wheel turns."},
  {id:"right", ask:"Show me your right turn signal.", ctl:"sig-up", fx:"sig-right", tip:"Lever UP = right."},
  {id:"brake", ask:"Press the brake pedal so I can check your brake lights.", ctl:"brake", fx:"brake", tip:"The brake is the wide pedal. Both rear brake lights (left and right) must work."},
  {id:"horn", ask:"Tap your horn.", ctl:"horn", fx:"horn", tip:"The center of the steering wheel. It has to be loud enough to hear 200 feet away."},
  {id:"park", ask:"Show me how to set the parking brake.", ctl:"parkbrake", fx:"park", tip:"Know how to SET and RELEASE it. In some cars it's a pedal on the far left or a button marked (P)."},
  {id:"wipers", ask:"Turn on your windshield wipers.", ctl:"wipers", fx:"wipers", tip:"Usually the lever on the right side of the steering wheel."},
  {id:"defrost", ask:"Where's your front defroster?", ctl:"defrost-front", fx:"defrost", tip:"Front defroster = curved windshield icon. The rectangle icon is the REAR defroster."},
  {id:"hazard", ask:"Turn on your emergency flashers.", ctl:"hazard", fx:"hazard", tip:"The red triangle button. All four turn signals blink."},
  {id:"lights", ask:"Turn on your headlights.", ctl:"headlights", fx:"lights", tip:"Often a dial on the left of the dash, or a twist on the end of the turn-signal lever. Find it in YOUR car."},
  {id:"armL", ask:"Show me the hand signal for a left turn.", ctl:"arm-left", fx:"arm-left", tip:"Left arm straight out the window."},
  {id:"armR", ask:"Show me the hand signal for a right turn.", ctl:"arm-right", fx:"arm-right", tip:"Left arm out the window, bent UP at the elbow."},
  {id:"armS", ask:"Show me the hand signal for slowing or stopping.", ctl:"arm-stop", fx:"arm-stop", tip:"Left arm out the window, bent DOWN at the elbow."}
];
const CTL_NAME = {"sig-down":"the turn-signal lever pushed down — that's a LEFT signal", "sig-up":"the turn-signal lever pushed up — that's a RIGHT signal", brake:"the brake pedal", gas:"the gas pedal", horn:"the horn", parkbrake:"the parking brake", wipers:"the wiper lever", "defrost-front":"the FRONT defroster", "defrost-rear":"the REAR defroster", hazard:"the emergency flashers (hazard lights)", headlights:"the headlight switch", "arm-left":"the left-turn hand signal", "arm-right":"the right-turn hand signal", "arm-stop":"the slow/stop hand signal"};
const CTL_FX = Object.fromEntries(DRILL.map(d => [d.ctl, d.fx]));
let drill = null, fxTimer = null;

function checkItem(id, label, sub){
  const on = !!store.checks[id];
  return `<li><button class="check" role="checkbox" aria-checked="${on}" data-check="${id}"><span class="box"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5 6.5 12 13 4.5" stroke="#062417" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span><span class="lbl">${label}</span>${sub ? `<small>${sub}</small>` : ""}</span></button></li>`;
}
function driveReady(){
  const ids = [...BRING, ...CARCHECK].map(x => x[0]);
  const done = ids.filter(id => store.checks[id]).length + (store.drillBest !== null ? 1 : 0);
  return {done, total:ids.length + 1, pct:done / (ids.length + 1)};
}
function renderDriveReady(){
  const r = driveReady();
  $("#readyFill").style.width = (r.pct * 100) + "%";
  $("#readyNum").textContent = `${r.done}/${r.total}`;
}
function renderDrive(){
  $("#ckBring").innerHTML = BRING.map(x => checkItem(...x)).join("");
  $("#ckCar").innerHTML = CARCHECK.map(x => checkItem(...x)).join("");
  $("#driveTips").innerHTML = DRIVE_TIPS.map(t => `<li>${t}</li>`).join("");
  $("#driveFails").innerHTML = DRIVE_FAILS.map(([b, s]) => `<li>${b}${s ? `<span>${s}</span>` : ""}</li>`).join("");
  startDrill();
  renderDriveReady();
}
function startDrill(){
  drill = {order:shuffle(DRILL), i:0, firstTry:0, missedThis:false, results:[]};
  $("#drillRestart").textContent = "↻ Start the drill over";
  renderDrill();
}
function renderDrill(clearMarks = true){
  const d = drill.order[drill.i];
  $("#drillAsk").textContent = d ? `"${d.ask}"` : "Drill done! Tap anything to explore, or start over.";
  $("#drillDots").innerHTML = drill.order.map((x, i) => `<i class="${drill.results[i] === true ? "d-ok" : drill.results[i] === false ? "d-miss" : ""}${i === drill.i ? " now" : ""}"></i>`).join("");
  if(clearMarks) $$("#dash .ctl, .arms button").forEach(el => el.classList.remove("ok", "no"));
}
function playFx(fx){
  const el = $("#drill");
  clearTimeout(fxTimer);
  el.dataset.fx = fx || "";
  if(fx === "horn") beep("horn");
  fxTimer = setTimeout(() => { el.dataset.fx = ""; }, 3200);
}
function tapControl(ctl, el){
  playFx(CTL_FX[ctl]);
  const fb = $("#drillFb");
  const d = drill.order[drill.i];
  if(!d){ fb.className = "drill-fb idle"; fb.textContent = `That's ${CTL_NAME[ctl]}.`; return; }
  $$("#dash .ctl, .arms button").forEach(x => x.classList.remove("ok", "no"));
  if(ctl === d.ctl){
    el.classList.add("ok");
    if(!drill.missedThis) drill.firstTry++;
    drill.results[drill.i] = !drill.missedThis;
    fb.className = "drill-fb ok"; fb.innerHTML = `<b>✓ Correct.</b> ${d.tip}`;
    beep("ok"); drill.i++; drill.missedThis = false;
    if(drill.i >= drill.order.length){
      store.drillBest = Math.max(store.drillBest || 0, drill.firstTry); save();
      fb.innerHTML = `<b>✓ Drill complete — ${drill.firstTry} of ${drill.order.length} on the first try.</b> ${drill.firstTry === drill.order.length ? "You're ready for the safety check." : "Run it again until you get all of them first try."}`;
      $("#drillRestart").textContent = "↻ Run the drill again";
      renderDriveReady();
    }
    renderDrill(false);
  } else {
    el.classList.add("no");
    drill.missedThis = true;
    fb.className = "drill-fb no"; fb.innerHTML = `<b>Not that one</b> — that's ${CTL_NAME[ctl]}. Try again.`;
    beep("no"); vibrate(30);
  }
}

/* ================= EVENTS ================= */
document.addEventListener("click", e => {
  const m = e.target.closest("[data-mode]");
  if(m && !m.disabled){
    const mode = m.dataset.mode;
    if(mode === "topic"){ renderTopics(); show("topics"); }
    else if(mode === "guide"){ renderGuide(); show("guide"); }
    else if(mode === "drive"){ renderDrive(); show("drive"); }
    else start(mode);
    return;
  }
  const g = e.target.closest("[data-go]"); if(g){ show(g.dataset.go); return; }
  const t = e.target.closest("[data-topic]"); if(t){ start("topic", t.dataset.topic); return; }
  const o = e.target.closest(".opt"); if(o && run){ answer(o); return; }
  const a = e.target.closest("[data-age]"); if(a){ store.age = a.dataset.age; save(); renderHome(); return; }
  const c = e.target.closest("[data-check]");
  if(c){ const id = c.dataset.check; store.checks[id] = !store.checks[id]; if(!store.checks[id]) delete store.checks[id]; save(); c.setAttribute("aria-checked", String(!!store.checks[id])); renderDriveReady(); return; }
  const k = e.target.closest("[data-ctl]"); if(k && drill){ tapControl(k.dataset.ctl, k); return; }
});
document.addEventListener("keydown", e => {
  const k = e.target.closest && e.target.closest("#dash .ctl");
  if(k && (e.key === "Enter" || e.key === " ")){ e.preventDefault(); tapControl(k.dataset.ctl, k); return; }
  if($("#screen-quiz").hidden || !run) return;
  if(!run.answered && ["1","2","3","a","b","c","A","B","C"].includes(e.key)){
    const idx = {"1":0,"2":1,"3":2,a:0,b:1,c:2,A:0,B:1,C:2}[e.key]; const b = $$("#qOpts .opt")[idx]; if(b) answer(b);
  } else if(run.answered && (e.key === "Enter" || e.key === " ") && document.activeElement !== $("#nextBtn")){ e.preventDefault(); next(); }
});
$("#homeBtn").addEventListener("click", () => show("home"));
$("#nextBtn").addEventListener("click", next);
$("#hintBtn").addEventListener("click", () => { const q = run.qs[run.i]; const b = $("#hintBox"); b.textContent = "💡 " + q.h; b.hidden = false; $("#hintBtn").disabled = true; run.hintNow = true; run.hintUsed++; });
$("#quitBtn").addEventListener("click", () => { $("#quitConfirm").hidden = false; });
$("#quitNo").addEventListener("click", () => { $("#quitConfirm").hidden = true; });
$("#quitYes").addEventListener("click", () => { run = null; show("home"); });
$("#againBtn").addEventListener("click", () => start(run && run.mode === "quick" ? "quick" : "full"));
$("#retryMissedBtn").addEventListener("click", () => { if(run && run.missedList && run.missedList.length) start("list", run.missedList); });
$("#drillRestart").addEventListener("click", () => { startDrill(); const fb = $("#drillFb"); fb.className = "drill-fb idle"; fb.textContent = "Tap a control to answer."; });
$("#driverName").addEventListener("input", e => { store.name = e.target.value; save(); const nm = store.name.trim(); $("#greet").textContent = nm ? `Let's go, ${nm}!` : "Let's get you road ready."; });
const sb = $("#soundBtn");
const SOUND_ON = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="#F4F6FA"/><path d="M16 8.5q2 3.5 0 7M18.5 6q4 6 0 12" stroke="#F4F6FA" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`;
const SOUND_OFF = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="#A6B0C5"/><path d="M16 9l5 6M21 9l-5 6" stroke="#A6B0C5" stroke-width="2" stroke-linecap="round"/></svg>`;
function syncSound(){ sb.innerHTML = store.sound ? SOUND_ON : SOUND_OFF; sb.setAttribute("aria-label", store.sound ? "Sound on" : "Sound off"); }
sb.addEventListener("click", () => { store.sound = !store.sound; save(); syncSound(); });
syncSound();
renderHome();
