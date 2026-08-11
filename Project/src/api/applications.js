// --- API Helper Functions ---
// Each function talks to the Express backend via the Vite proxy.
// All endpoints return { success: true, data: ... } or { success: false, message: "..." }

const API_URL = '/api/applications';

export async function fetchApplications() {
  const res = await fetch(API_URL, {
    credentials: 'include',
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
}

export async function createApplication(applicationData) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(applicationData),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
}

export async function updateApplication(id, applicationData) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(applicationData),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
}

export async function deleteApplication(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
}
