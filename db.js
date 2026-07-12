// This file contains the data layer of the application, all of the reading/writing operations carried out in Supabase go through here.

// This file depends on the Supabase CDN script, which is loaded in index.html.

// Security Model: Both the participants + answers tables use Row Level Security.
// The publishable key can INSERT and UPDATE, and can SELECT.
// SELECT is required so UPDATE can locate the row it needs to change — an update that cannot "see" its target row silently affects zero rows and fails without error.
// No sensitive data is stored throughout the application (no name/email), so read access to anonymous study data is an accepted tradeoff.

const dbClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// This creates a participant row.
// The UUID is generated in the browser (not by the database), so we always know the new id without needing to read it back.
// initialFields  : Is used to set any starting columns (group, age band, consent, status, etc.). It returns the new participant id, or null on failure.
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

// This updates a participant's row (for example: status, progress, screening results, etc).
async function updateParticipant(id, fields) {
  const { error } = await dbClient.from("participants").update(fields).eq("id", id);
  if (error) {
    console.error("updateParticipant failed:", error.message);
    return false;
  }
  return true;
}

// Insert one answer row for a participant.
// "answer" : Is used to hold question_id, selected_answer, is_correct, response_time_ms. It returns true on success.
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


