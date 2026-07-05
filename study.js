// ── study.js ── Flow controller. Renders each phase into #app.
// Depends on: QUESTIONS (questions.js); createParticipant / updateParticipant /
// insertAnswer / dbClient (db.js).

const app = document.getElementById("app");

// In-memory state for this session. Fields are filled as phases progress.
const state = {
  participantId: null,
  group: null,        // "A" or "B"
  ageBand: null,
  consentAt: null,
  knownCount: null,
  knownIds: [],
  selectedIds: [],    // the 20 questions this participant will get
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

  // Temporary placeholder — the Learning phase is built next.
  render(`
    <div class="screen">
      <h2>Screening complete ✅</h2>
      <p>You marked <strong>${state.knownCount}</strong> as already known — eligible to continue.</p>
      <p>20 questions were selected from your unknown pool.</p>
      <p style="font-family:monospace;font-size:0.8rem;color:#888;">selected ids: ${selected.join(", ")}</p>
      <p>(The Learning phase is built next.)</p>
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


