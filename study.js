// This file is the flow controller, it renders each phase into the application.
// This file depends on questions.js and db.js.

const app = document.getElementById("app");

// LEARNING_SECONDS can be set to a low number (e.g., 5s) for testing, it MUST be 180s before launch.
const LEARNING_SECONDS = 180;

// All of the below fields are filled with data as phases progress.
const state = {
  participantId: null,
  group: null,        // "A" or "B"
  ageBand: null,
  gender: null,
  education: null,
  nationality: null,
  consentAt: null,
  knownCount: null,
  knownIds: [],
  selectedIds: [],    // the 20 questions this participant will get
  _learnInterval: null,
  quizQuestions: [],
  quizIndex: 0,
  quizCorrect: 0,
  _quizStart: 0,
};

function render(html, group) {
  app.innerHTML = html;
  if (group === "A" || group === "B") document.body.setAttribute("data-group", group);
  else document.body.removeAttribute("data-group");
}

// This is used to randomly select the 20 questions for each participant, without altering the original list.
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// This finds the participant's selected questions, in their selected order.
function getSelectedQuestions() {
  return state.selectedIds.map(id => QUESTIONS.find(q => q.id === id)).filter(Boolean);
}


// q.image can be null = no image | "path.jpg" = one image | [4 paths] = one image per-option.
// This is ONLY for Group A, as Group B should NEVER see images.
function questionImageHtml(q) {
  if (state.group !== "A") return "";
  if (typeof q.image !== "string" || !q.image) return "";
  return `<div class="q-image"><img src="${q.image}" alt="" loading="lazy"></div>`;
}
function optionImageHtml(q, idx) {
  if (state.group !== "A") return "";
  if (!Array.isArray(q.image) || !q.image[idx]) return "";
  return `<span class="opt-image"><img src="${q.image[idx]}" alt="" loading="lazy"></span>`;
}
// Questions with four images are shown using a different layout class.
function optsLayoutClass(q) {
  return (state.group === "A" && Array.isArray(q.image)) ? " opts-grid" : "";
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m + ":" + String(s).padStart(2, "0");
}

// This identifies browser + device type automatically (no additional personal data is collected)
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

// This is used for group assignment, it automatically alternates using RPC, while going to random if unavailable.
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

// Pre-Screening ---> Welcome + GDPR consent
function showConsent() {
  render(`
    <div class="screen">
      <h1>Research Study: Learning from a Short Quiz</h1>
      <p>You are invited to take part in a research study conducted as part of a Bachelor
         thesis at IU International University of Applied Sciences. Please read the
         following before deciding whether to take part. It takes around 10-15 minutes.</p>

      <h3>What the study involves</h3>
      <p>You will complete a short screening, spend a few minutes on a brief learning
         screen, and then take a short quiz about nature and animals.</p>

      <h3>Participation is voluntary</h3>
      <p>Taking part is entirely voluntary. You may stop at any time by closing this page,
         without giving a reason and without any consequence.</p>

      <h3>What data is collected</h3>
      <p>We collect only: your <strong>age group</strong> (not your exact age),
         <strong>gender</strong>, <strong>highest level of education</strong>, and
         <strong>nationality</strong>; your answers and how long you take to answer;
         and basic technical information (browser and device type). These background
         details are used only to describe the group of participants as a whole, and
         are never used to identify anyone. We do <strong>not</strong> collect your
         name, email, or anything that identifies you personally. All responses are
         anonymous.</p>

      <h3>How your data is used</h3>
      <p>Your anonymous responses are stored securely and used only for this academic
         research, and reported only in aggregate. Because the data is anonymous and
         cannot be linked back to you, individual responses cannot be retrieved or
         deleted once submitted; you may withdraw before submitting by closing this page.</p>

      <h3>Before you start</h3>
      <p>For the results to be meaningful, please:</p>
      <ul class="prestart">
        <li>complete this study on a <strong>computer or laptop</strong>, not a phone
            or tablet;</li>
        <li>find a <strong>quiet place</strong> where you can concentrate without
            being interrupted;</li>
        <li>answer <strong>on your own</strong>, without using the internet, AI tools,
            or help from other people.</li>
      </ul>

      <p style="font-size:0.9rem;color:#555;">Data controller: Matasem Habibullah,
         IU International University of Applied Sciences. Questions:
         <em>matasem.habibullah@iu-study.org</em>.</p>

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

// Pre-Screening ---> Age band 
// Country list for the nationality dropdown. A fixed list is used instead of a
// text box so every participant's answer is stored in exactly the same form
// (free text would produce "Saudi", "KSA", "Saudi Arabia" as separate values).
const COUNTRIES = ["Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cabo Verde","Cambodia","Cameroon","Canada","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo","Costa Rica","Croatia","Cuba","Cyprus","Czechia","Democratic Republic of the Congo","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Ivory Coast","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway","Oman","Pakistan","Palau","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda","Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"];

// Builds the <option> tags for a dropdown, with a disabled placeholder first.
function options(list, placeholder) {
  return `<option value="" disabled selected>${placeholder}</option>` +
         list.map(v => `<option value="${v}">${v}</option>`).join("");
}

// ── PHASE: Demographics ──
// Four required dropdowns. Only the age band decides eligibility; gender,
// education, and nationality are recorded as variables and exclude nobody.
function showAgeScreening() {
  render(`
    <div class="screen">
      <h2>Before we begin</h2>
      <p>Please answer these four questions about yourself. They are used only to
         describe the group of participants as a whole.</p>

      <div class="demo-field">
        <label for="ageSel">Age group</label>
        <select id="ageSel" class="demo-select">
          ${options(["Under 18", "18-30", "Over 30"], "Select your age group")}
        </select>
      </div>

      <div class="demo-field">
        <label for="genderSel">Gender</label>
        <select id="genderSel" class="demo-select">
          ${options(["Male", "Female"], "Select your gender")}
        </select>
      </div>

      <div class="demo-field">
        <label for="eduSel">Highest level of education</label>
        <select id="eduSel" class="demo-select">
          ${options(["High school diploma", "Currently studying for a Bachelor's",
                     "Bachelor's degree", "Master's degree", "Doctorate"],
                    "Select your education level")}
        </select>
      </div>

      <div class="demo-field">
        <label for="natSel">Nationality</label>
        <select id="natSel" class="demo-select">
          ${options(COUNTRIES, "Select your nationality")}
        </select>
      </div>

      <button id="demoBtn" disabled>Continue</button>
    </div>
  `);

  const selects = ["ageSel", "genderSel", "eduSel", "natSel"].map(id => document.getElementById(id));
  const btn = document.getElementById("demoBtn");

  // The Continue button unlocks only once all four have been answered.
  const check = () => { btn.disabled = selects.some(sel => !sel.value); };
  selects.forEach(sel => sel.addEventListener("change", check));

  btn.addEventListener("click", () => {
    state.gender      = selects[1].value;
    state.education   = selects[2].value;
    state.nationality = selects[3].value;
    handleAge(selects[0].value);
  });
}

// This is the age eligibility gate ---> Under 18 / Over 30 are excluded and recorded.
// Eligible participants get a participant row and move on to screening (with group assignment occurring after screening).
async function handleAge(band) {
  state.ageBand = band;
  const eligible = (band === "18-30");

  if (!eligible) {
    await createParticipant({
      age_band: band,
      age_eligible: false,
      gender: state.gender,
      education_level: state.education,
      nationality: state.nationality,
      consent_given: true,
      consent_timestamp: state.consentAt,
      status: "screened-out-age"
    });
    showExcluded("age");
    return;
  }

  render(`<div class="screen"><p>Setting up your session…</p></div>`);

  // NOTE: Groups are NOT assigned here. They are assigned only after the participant passes the prior knowledge screening (see handleScreeningSubmit).
  const id = await createParticipant({
    age_band: band,
    age_eligible: true,
    gender: state.gender,
    education_level: state.education,
    nationality: state.nationality,
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

// PHASE 1: Knowledege Screening
// All 30 questions are show on one page. Ticked ---> They Know It | Unticked ---> They Do NOT Know It.
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

// Identify known questions, apply exclusion, select 20 random questions from the unknown pool.
async function handleScreeningSubmit() {
  const checked = Array.from(document.querySelectorAll(".known-check:checked"))
    .map(el => parseInt(el.dataset.id, 10));
  state.knownIds = checked;
  state.knownCount = checked.length;

  render(`<div class="screen"><p>Checking your responses…</p></div>`);

  // If the user knows 11+ questions ---> Excluded.
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

  // Eligible users are assigned to a group NOW ---> ONLY fully-eligible participants get assigned, which keeps A/B balanced.
  const group = await assignGroup();
  state.group = group;

  const unknownIds = QUESTIONS.map(q => q.id).filter(id => !checked.includes(id));
  const selected = shuffle(unknownIds).slice(0, 20);
  state.selectedIds = selected;

  await updateParticipant(state.participantId, {
    group_assignment: group,
    known_count: state.knownCount,
    known_question_ids: checked,
    eligible_after_screening: true,
    selected_question_ids: selected,
    status: "in-learning",
    last_reached_phase: "learning"
  });

  showLearning();
}

// PHASE 2: Learning Phase (interactive, time-limited, forced 3 minutes)
// Each item: Pick an option, press "Check answer", then the correct answer and explanation are shown to the user.
async function showLearning() {
  const qs = getSelectedQuestions();
  const byId = {};
  qs.forEach(q => { byId[q.id] = q; });

  const itemsHtml = qs.map((q, i) => `
    <div class="learn-item" data-qid="${q.id}">
      <p class="learn-q"><strong>${i + 1}. ${q.text}</strong></p>
      ${questionImageHtml(q)}
      <div class="learn-opts${optsLayoutClass(q)}">
        ${q.options.map((o, idx) => `<button class="learn-opt" data-idx="${idx}">${optionImageHtml(q, idx)}<span class="opt-text">${o}</span></button>`).join("")}
      </div>
      <button class="learn-check" disabled>Check answer</button>
      <div class="learn-reveal" hidden></div>
    </div>
  `).join("");

  render(`
    <div class="screen learning" data-group="${state.group}">
      <div class="learn-timerbar">
        <div class="learn-timerrow">
          <span>Learning time remaining</span>
          <span id="learnTimer" class="learn-timer">${formatTime(LEARNING_SECONDS)}</span>
        </div>
        <div class="learn-timeprogress"><span id="learnBar"></span></div>
      </div>
      <h2>Learning phase</h2>
      <p>For each question, choose the answer you think is correct, then press
         <em>Check answer</em> to see the correct answer and a short explanation.
         Try to answer before checking &mdash; it helps you remember. The quiz starts
         automatically when the time is up.</p>
      <div class="learn-list">${itemsHtml}</div>
      <p class="learn-endnote">That's the end of the learning material. If you have time
         left, feel free to scroll back up and review the answers &mdash; you will be
         tested on them next.</p>
    </div>
  `, state.group);

  // Record that they reached the Learning Phase.
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

      // Lock and color the options.
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

  // Countdown from a fixed end time.
  const endAt = Date.now() + LEARNING_SECONDS * 1000;
  const timerEl = document.getElementById("learnTimer");
  const barEl = document.getElementById("learnBar");
  const tick = () => {
    const remaining = Math.max(0, Math.round((endAt - Date.now()) / 1000));
    if (timerEl) timerEl.textContent = formatTime(remaining);
    if (barEl) barEl.style.width = (remaining / LEARNING_SECONDS * 100) + "%";
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

// PHASE 3: Quiz (one question at a time, no feedback, response time recorded)
function showQuiz() {
  state.quizQuestions = getSelectedQuestions();
  state.quizIndex = 0;
  state.quizCorrect = 0;
  renderQuizQuestion();
}

function renderQuizQuestion() {
  const q = state.quizQuestions[state.quizIndex];
  const n = state.quizIndex + 1;
  const total = state.quizQuestions.length;
  const isLast = (n === total);

  render(`
    <div class="screen quiz" data-group="${state.group}">
      <div class="quiz-progress">Question ${n} of ${total}</div>
      <div class="quiz-bar"><span style="width:${Math.round(n / total * 100)}%"></span></div>
      <p class="quiz-q"><strong>${q.text}</strong></p>
      ${questionImageHtml(q)}
      <div class="quiz-opts${optsLayoutClass(q)}">
        ${q.options.map((o, idx) => `<button class="quiz-opt" data-idx="${idx}">${optionImageHtml(q, idx)}<span class="opt-text">${o}</span></button>`).join("")}
      </div>
      <button id="quizNext" disabled>${isLast ? "Finish" : "Next"}</button>
    </div>
  `, state.group);

  // Start the response-time clock for current question.
  state._quizStart = performance.now();

  const opts = document.querySelectorAll(".quiz-opt");
  const nextBtn = document.getElementById("quizNext");
  opts.forEach(b => b.addEventListener("click", () => {
    opts.forEach(x => x.classList.remove("selected"));
    b.classList.add("selected");
    nextBtn.disabled = false;
  }));
  nextBtn.addEventListener("click", handleQuizNext);
}

async function handleQuizNext() {
  const selected = document.querySelector(".quiz-opt.selected");
  if (!selected) return;
  const nextBtn = document.getElementById("quizNext");
  nextBtn.disabled = true;  // guard against double-clicks

  const q = state.quizQuestions[state.quizIndex];
  const chosen = q.options[parseInt(selected.dataset.idx, 10)];
  const isCorrect = (chosen === q.correct);
  const responseMs = Math.round(performance.now() - state._quizStart);
  if (isCorrect) state.quizCorrect++;

  // Record this answer immediately (incremental write ---> abandonment is also recorded).
  await insertAnswer(state.participantId, {
    question_id: q.id,
    selected_answer: chosen,
    is_correct: isCorrect,
    response_time_ms: responseMs
  });

  // Progress marker (non-critical, as the answers table is the real trace).
  updateParticipant(state.participantId, { last_reached_question: state.quizIndex + 1 });

  state.quizIndex++;
  if (state.quizIndex < state.quizQuestions.length) {
    renderQuizQuestion();
  } else {
    finishQuiz();
  }
}

async function finishQuiz() {
  await updateParticipant(state.participantId, {
    status: "completed",
    last_reached_phase: "quiz",
    last_reached_question: state.quizQuestions.length
  });
  render(`
    <div class="screen">
      <h2>Thank you &mdash; you're all done!</h2>
      <p>Your responses have been recorded. Thank you very much for taking part in this study.
         You may now close this page.</p> 
    </div>
  `);
}

// Excluded screen (age or knowledge)
function showExcluded(reason) {
  const msg = reason === "knowledge"
    ? "Based on your responses, you already know too many of the answers for this study, which focuses on material that is new to participants."
    : "Unfortunately you are not eligible for this study, which is limited to participants aged 18-30.";
  render(`
    <div class="screen">
      <h2>Thank you for your interest</h2>
      <p>${msg} No further data will be collected. You may now close this page.</p>
    </div>
  `);
}

// Starting the flow
showConsent();


