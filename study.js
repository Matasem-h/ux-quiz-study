// ── study.js ── Flow controller. Renders each phase into #app.
// Depends on: QUESTIONS (questions.js); createParticipant / updateParticipant /
// insertAnswer / dbClient (db.js).

const app = document.getElementById("app");

// TESTING TIP: set LEARNING_SECONDS to a small number (e.g. 5) to test quickly,
// then restore it to 180 (3 minutes) before launch.
const LEARNING_SECONDS = 180;

// In-memory state for this session. Fields are filled as phases progress.
const state = {
  participantId: null,
  group: null,        // "A" or "B"
  ageBand: null,
  consentAt: null,
  knownCount: null,
  knownIds: [],
  selectedIds: [],    // the 20 questions this participant will get
  _learnInterval: null,
};

function render(html) { app.innerHTML = html; }

// Fisher–Yates shuffle (returns a new array).
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Look up the participant's selected questions, in their selected order.
function getSelectedQuestions() {
  return state.selectedIds.map(id => QUESTIONS.find(q => q.id === id)).filter(Boolean);
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m + ":" + String(s).padStart(2, "0");
}

// Detect browser + device type automatically (no personal data).
function getBrowserDevice() {
  const ua = navigator.userAgent;
  const mobile = /Mobi|Android|iPhone|iPad/i.test(ua);
  let browser = "Other";
  if (/Edg\//.test(ua)) browser = "Edge";
  else if (/Chrome\//.test(ua)) browser = "Chrome";
  else if (/Firefox\//.test(ua)) browser = "Firefox";
  else if (/Safari\//.test(ua)) browser = "Safari";
  return browser + " / " + (mobile ? "mobile" : "desktop");
}

// Group assignment: auto-alternate via RPC; fall back to random if unavailable.
async function assignGroup() {
  try {
    const { data, error } = await dbClient.rpc("assign_group");
    if (error || (data !== "A" && data !== "B")) throw error || new Error("bad group value");
    return data;
  } catch (e) {
    console.warn("assign_group RPC unavailable, using random fallback:", e && e.message);
    return Math.random() < 0.5 ? "A" : "B";
  }
}

// ── PHASE: Welcome + GDPR consent ──
function showConsent() {
  render(`
    <div class="screen">
      <h1>Research Study: Learning from a Short Quiz</h1>
      <p>You are invited to take part in a research study conducted as part of a Bachelor
         thesis at IU International University of Applied Sciences. Please read the
         following before deciding whether to take part. It takes around 10–15 minutes.</p>

      <h3>What the study involves</h3>
      <p>You will complete a short screening, spend a few minutes on a brief learning
         screen, and then take a short quiz about nature and animals.</p>

      <h3>Participation is voluntary</h3>
      <p>Taking part is entirely voluntary. You may stop at any time by closing this page,
         without giving a reason and without any consequence.</p>

      <h3>What data is collected</h3>
      <p>We collect only: your <strong>age group</strong> (not your exact age), your
         answers and how long you take to answer, and basic technical information
         (browser and device type). We do <strong>not</strong> collect your name, email,
         or anything that identifies you personally. All responses are anonymous.</p>

      <h3>How your data is used</h3>
      <p>Your anonymous responses are stored securely and used only for this academic
         research, and reported only in aggregate. Because the data is anonymous and
         cannot be linked back to you, individual responses cannot be retrieved or
         deleted once submitted; you may withdraw before submitting by closing this page.</p>

      <h3>Please answer on your own</h3>
      <p>For the results to be meaningful, please answer without using the internet,
         AI tools, or help from other people.</p>

      <p style="font-size:0.9rem;color:#555;">Data controller: Matasem Habibullah,
         IU International University of Applied Sciences. Questions:
         <em>[your IU email here]</em>.</p>

      <label style="display:block;margin:18px 0;">
        <input type="checkbox" id="consentBox">
        I have read and understood the information above and voluntarily agree to take part.
      </label>

      <button id="consentBtn" disabled>Agree and continue</button>
    </div>
  `);

  const box = document.getElementById("consentBox");
  const btn = document.getElementById("consentBtn");
  box.addEventListener("change", () => { btn.disabled = !box.checked; });
  btn.addEventListener("click", () => {
    state.consentAt = new Date().toISOString();
    showAgeScreening();
  });
}

// ── PHASE: Age band ──
function showAgeScreening() {
  render(`
    <div class="screen">
      <h2>Before we begin</h2>
      <p>Please select your age group:</p>
      <div class="age-options">
        <button class="age-btn" data-band="Under 18">Under 18</button>
        <button class="age-btn" data-band="18–30">18–30</button>
        <button class="age-btn" data-band="Over 30">Over 30</button>
      </div>
    </div>
  `);
  document.querySelectorAll(".age-btn").forEach(b => {
    b.addEventListener("click", () => handleAge(b.dataset.band));
  });
}

// Age eligibility → exclude, or assign group + create participant + go to screening.
async function handleAge(band) {
  state.ageBand = band;
  const eligible = (band === "18–30");

  if (!eligible) {
    await createParticipant({
      age_band: band,
      age_eligible: false,
      consent_given: true,
      consent_timestamp: state.consentAt,
      status: "screened-out-age"
    });
    showExcluded("age");
    return;
  }

  render(`<div class="screen"><p>Setting up your session…</p></div>`);

  const group = await assignGroup();
  state.group = group;

  const id = await createParticipant({
    group_assignment: group,
    age_band: band,
    age_eligible: true,
    consent_given: true,
    consent_timestamp: state.consentAt,
    browser_device: getBrowserDevice(),
    status: "in-screening",
    last_reached_phase: "screening"
  });

  if (!id) {
    render(`<div class="screen"><p>Sorry, something went wrong setting up your session.
            Please try again later.</p></div>`);
    return;
  }
  state.participantId = id;
  showScreening();
}

// ── PHASE 1: Prior-knowledge screening ──
// All 30 on one page. Tick only the ones you already know. Unticked = don't know.
function showScreening() {
  const questionsHtml = QUESTIONS.map(q => `
    <div class="screen-q">
      <p class="q-text"><strong>Q${q.id}.</strong> ${q.text}</p>
      <ul class="q-opts">
        ${q.options.map(o => `<li>${o}</li>`).join("")}
      </ul>
      <label class="known-label">
        <input type="checkbox" class="known-check" data-id="${q.id}">
        I already know this
      </label>
    </div>
  `).join("");

  render(`
    <div class="screen">
      <h2>Quick check before we start</h2>
      <p><strong>Tick only the questions you already know the answer to.</strong>
         Leave the rest unticked. This helps us focus on material that is new to you.
         The correct answers are not shown here.</p>
      <div class="screening-list">${questionsHtml}</div>
      <button id="screeningSubmit">Continue</button>
    </div>
  `);
  document.getElementById("screeningSubmit").addEventListener("click", handleScreeningSubmit);
}

// Tally known, apply exclusion threshold, select 20 from the unknown pool.
async function handleScreeningSubmit() {
  const checked = Array.from(document.querySelectorAll(".known-check:checked"))
    .map(el => parseInt(el.dataset.id, 10));
  state.knownIds = checked;
  state.knownCount = checked.length;

  render(`<div class="screen"><p>Checking your responses…</p></div>`);

  // 11+ known means fewer than 20 unknown → excluded.
  if (state.knownCount >= 11) {
    await updateParticipant(state.participantId, {
      known_count: state.knownCount,
      known_question_ids: checked,
      eligible_after_screening: false,
      status: "screened-out-knowledge",
      last_reached_phase: "screening"
    });
    showExcluded("knowledge");
    return;
  }

  // Eligible: randomly pick 20 from the unknown pool.
  const unknownIds = QUESTIONS.map(q => q.id).filter(id => !checked.includes(id));
  const selected = shuffle(unknownIds).slice(0, 20);
  state.selectedIds = selected;

  await updateParticipant(state.participantId, {
    known_count: state.knownCount,
    known_question_ids: checked,
    eligible_after_screening: true,
    selected_question_ids: selected,
    status: "in-learning",
    last_reached_phase: "learning"
  });

  showLearning();
}

// ── PHASE 2: Learning (interactive, time-limited, forced 3 minutes) ──
// Each item: pick an option, press "Check answer", then the correct answer and
// explanation are revealed inline. Retrieval practice (answer-before-feedback).
async function showLearning() {
  const qs = getSelectedQuestions();
  const byId = {};
  qs.forEach(q => { byId[q.id] = q; });

  const itemsHtml = qs.map((q, i) => `
    <div class="learn-item" data-qid="${q.id}">
      <p class="learn-q"><strong>${i + 1}. ${q.text}</strong></p>
      <div class="learn-opts">
        ${q.options.map((o, idx) => `<button class="learn-opt" data-idx="${idx}">${o}</button>`).join("")}
      </div>
      <button class="learn-check" disabled>Check answer</button>
      <div class="learn-reveal" hidden></div>
    </div>
  `).join("");

  render(`
    <div class="screen learning" data-group="${state.group}">
      <div class="learn-timerbar">
        <span>Learning time remaining</span>
        <span id="learnTimer" class="learn-timer">${formatTime(LEARNING_SECONDS)}</span>
      </div>
      <h2>Learning phase</h2>
      <p>For each question, choose the answer you think is correct, then press
         <em>Check answer</em> to see the correct answer and a short explanation.
         Try to answer before checking &mdash; it helps you remember. The quiz starts
         automatically when the time is up.</p>
      <div class="learn-list">${itemsHtml}</div>
    </div>
  `);

  // Mark that they reached the learning screen (incremental log).
  updateParticipant(state.participantId, { learning_entered: true });

  // One delegated click handler for all items.
  const list = document.querySelector(".learn-list");
  list.addEventListener("click", (e) => {
    const optBtn = e.target.closest(".learn-opt");
    const checkBtn = e.target.closest(".learn-check");

    if (optBtn) {
      const item = optBtn.closest(".learn-item");
      if (item.classList.contains("checked")) return;      // already answered → locked
      item.querySelectorAll(".learn-opt").forEach(b => b.classList.remove("selected"));
      optBtn.classList.add("selected");
      item.querySelector(".learn-check").disabled = false;  // enable Check once an option is picked
      return;
    }

    if (checkBtn) {
      const item = checkBtn.closest(".learn-item");
      if (item.classList.contains("checked")) return;
      const selected = item.querySelector(".learn-opt.selected");
      if (!selected) return;

      const q = byId[parseInt(item.dataset.qid, 10)];
      const chosen = q.options[parseInt(selected.dataset.idx, 10)];
      const isCorrect = (chosen === q.correct);

      // Lock and colour the options.
      item.querySelectorAll(".learn-opt").forEach((b, idx) => {
        if (q.options[idx] === q.correct) b.classList.add("is-correct");
        else if (b === selected) b.classList.add("is-wrong");
        b.disabled = true;
      });

      const reveal = item.querySelector(".learn-reveal");
      reveal.innerHTML = `
        <p class="reveal-status">${isCorrect ? "Correct!" : "Not quite."}
           The answer is <strong>${q.correct}</strong>.</p>
        <p class="reveal-exp">${q.explanation}</p>`;
      reveal.hidden = false;
      checkBtn.disabled = true;
      item.classList.add("checked");
    }
  });

  // Countdown from a fixed end time (robust to tab throttling).
  const endAt = Date.now() + LEARNING_SECONDS * 1000;
  const timerEl = document.getElementById("learnTimer");
  const tick = () => {
    const remaining = Math.max(0, Math.round((endAt - Date.now()) / 1000));
    if (timerEl) timerEl.textContent = formatTime(remaining);
    if (remaining <= 0) {
      clearInterval(state._learnInterval);
      finishLearning();
    }
  };
  state._learnInterval = setInterval(tick, 250);
  tick();
}

async function finishLearning() {
  await updateParticipant(state.participantId, {
    learning_entered: true,
    learning_time_spent: LEARNING_SECONDS,
    status: "in-quiz",
    last_reached_phase: "quiz",
    last_reached_question: 0
  });
  showQuiz();
}

// ── PHASE 3: Quiz (placeholder — built next) ──
function showQuiz() {
  const qs = getSelectedQuestions();
  render(`
    <div class="screen">
      <h2>Learning time is up ✅</h2>
      <p>The quiz would begin now, with ${qs.length} questions.</p>
      <p style="font-family:monospace;font-size:0.8rem;color:#888;">group: ${state.group} ·
         participant: ${state.participantId}</p>
      <p>(The Quiz phase is built next.)</p>
    </div>
  `);
}

// ── Excluded screen (age or knowledge) ──
function showExcluded(reason) {
  const msg = reason === "knowledge"
    ? "Based on your responses, you already know too many of the answers for this study, which focuses on material that is new to participants."
    : "Unfortunately you are not eligible for this study, which is limited to participants aged 18–30.";
  render(`
    <div class="screen">
      <h2>Thank you for your interest</h2>
      <p>${msg} No further data will be collected. You may now close this page.</p>
    </div>
  `);
}

// ── Start the flow ──
showConsent();
