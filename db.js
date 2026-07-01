// ── Data layer ──
// Depends on: the Supabase CDN script, and config.js (SUPABASE_URL, SUPABASE_KEY).
// All writes are insert/update only — no reads — matching the locked-down RLS setup.

const dbClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Create a participant row. The UUID is generated in the browser so we never
// need read access to learn the new ID. `initialFields` sets any starting columns.
// Returns the new participant id, or null on failure.
async function createParticipant(initialFields = {}) {
  const id = crypto.randomUUID();
  const row = {
    id: id,
    started_at: new Date().toISOString(),
    ...initialFields
  };
  const { error } = await dbClient.from("participants").insert(row);
  if (error) {
    console.error("createParticipant failed:", error.message);
    return null;
  }
  return id;
}

// Update a participant's row (status, progress, screening results, etc.).
// `fields` is an object of column → new value. Returns true on success.
async function updateParticipant(id, fields) {
  const { error } = await dbClient.from("participants").update(fields).eq("id", id);
  if (error) {
    console.error("updateParticipant failed:", error.message);
    return false;
  }
  return true;
}

// Insert one answer row for a participant. `answer` holds question_id,
// selected_answer, is_correct, response_time_ms. Returns true on success.
async function insertAnswer(participantId, answer) {
  const row = {
    participant_id: participantId,
    answered_at: new Date().toISOString(),
    ...answer
  };
  const { error } = await dbClient.from("answers").insert(row);
  if (error) {
    console.error("insertAnswer failed:", error.message);
    return false;
  }
  return true;
}


