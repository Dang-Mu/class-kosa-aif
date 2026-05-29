export function getSortedQuests(quests, doneSet, currentSort) {
  const arr = [...quests]
  switch (currentSort) {
    case 'newest':
      return arr.sort((a, b) => b.id - a.id)
    case 'due':
      return arr.sort((a, b) => {
        if (!a.due && !b.due) return b.id - a.id
        if (!a.due) return 1
        if (!b.due) return -1
        return new Date(a.due) - new Date(b.due) || b.id - a.id
      })
    case 'alpha':
      return arr.sort((a, b) => a.title.localeCompare(b.title, 'ko') || b.id - a.id)
    case 'subject':
      return arr.sort(
        (a, b) =>
          (a.subject || 'ㅎ').localeCompare(b.subject || 'ㅎ', 'ko') || b.id - a.id
      )
    case 'done':
      return arr.sort((a, b) => {
        const da = doneSet.has(a.id) ? 1 : 0
        const db = doneSet.has(b.id) ? 1 : 0
        return da - db || b.id - a.id
      })
    default:
      return arr
  }
}

export function formatDue(due) {
  if (!due) return null
  const d = new Date(due + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.round((d - today) / 86400000)
  const label = due.replace(/-/g, '.')
  if (diff < 0) return { label: `${label} (D+${Math.abs(diff)})`, color: '#ff4444' }
  if (diff === 0) return { label: `${label} (D-Day)`, color: '#facc15' }
  return { label: `${label} (D-${diff})`, color: '#aaa' }
}

export function getMyDone(code) {
  try {
    return new Set(JSON.parse(localStorage.getItem('done_' + code) || '[]'))
  } catch {
    return new Set()
  }
}

export function saveMyDone(code, doneSet) {
  localStorage.setItem('done_' + code, JSON.stringify([...doneSet]))
}
