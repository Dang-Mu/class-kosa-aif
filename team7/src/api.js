const BASE = '/api'

async function request(method, path, body, adminKey) {
  const headers = { 'Content-Type': 'application/json' }
  if (adminKey) headers['x-admin-key'] = adminKey

  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.error || '서버 오류')
  return data
}

// ── Rooms ──────────────────────────────────────
export const getRooms = () => request('GET', '/rooms')
export const getAdminRooms = (adminKey) => request('GET', '/rooms/admin', null, adminKey)
export const createRoom = (body) => request('POST', '/rooms', body)
export const updateRoom = (id, body, adminKey) => request('PUT', `/rooms/${id}`, body, adminKey)
export const deleteRoom = (id, adminKey) => request('DELETE', `/rooms/${id}`, null, adminKey)
export const verifyRoom = (id, password) => request('POST', `/rooms/${id}/verify`, { password })

// ── Quests ─────────────────────────────────────
export const getQuests = (roomId, username) =>
  request('GET', `/rooms/${roomId}/quests${username ? `?username=${encodeURIComponent(username)}` : ''}`)
export const createQuest = (roomId, body) => request('POST', `/rooms/${roomId}/quests`, body)
export const updateQuest = (roomId, questId, body) => request('PUT', `/rooms/${roomId}/quests/${questId}`, body)
export const deleteQuest = (roomId, questId) => request('DELETE', `/rooms/${roomId}/quests/${questId}`)
export const toggleQuestDone = (roomId, questId, username) =>
  request('POST', `/rooms/${roomId}/quests/${questId}/toggle`, { username })

// ── Q&A ────────────────────────────────────────
export const getQA = (roomId) => request('GET', `/rooms/${roomId}/qa`)
export const createQuestion = (roomId, body) => request('POST', `/rooms/${roomId}/qa`, body)
export const createAnswer = (roomId, qaId, body) => request('POST', `/rooms/${roomId}/qa/${qaId}/answers`, body)
