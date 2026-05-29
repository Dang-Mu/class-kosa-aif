// 예시 데이터 삽입 스크립트
// 실행: node seed.js

const BASE = 'http://localhost:3001/api'
const ADMIN_KEY = '0207'

async function post(path, body, adminKey) {
  const headers = { 'Content-Type': 'application/json' }
  if (adminKey) headers['x-admin-key'] = adminKey
  const res = await fetch(BASE + path, { method: 'POST', headers, body: JSON.stringify(body) })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || '오류')
  return data
}

async function main() {
  console.log('🌱 예시 데이터 삽입 시작...\n')

  // ── 방 1: 수원공업고등학교 3학년 1반 ──────────────────
  console.log('📌 방 1 생성: 수원공업고등학교 3학년 1반')
  const room1 = await post('/rooms', {
    school: '수원공업고등학교',
    grade: '3',
    class: '1',
    password: 'SU31',
  }, ADMIN_KEY)
  console.log(`   → 방 ID: ${room1.id}, 비밀번호: SU31`)

  // 퀘스트 등록
  await post(`/rooms/${room1.id}/quests`, {
    title: '수학 수행평가',
    subject: '수학',
    due: '2026-06-01',
    description: '범위: 84p ~ 113p\n유형: 논술형',
  })
  console.log('   ✅ 퀘스트: 수학 수행평가')

  await post(`/rooms/${room1.id}/quests`, {
    title: '프로그래밍 수행평가',
    subject: '프로그래밍',
    due: '2026-06-25',
    description: 'Unity Shooting Game 제작\n유형: 실습형',
  })
  console.log('   ✅ 퀘스트: 프로그래밍 수행평가')

  await post(`/rooms/${room1.id}/quests`, {
    title: '학교 공지',
    subject: '공지',
    due: '',
    description: '05/29 창체 없음 (4교시 자습)\n07/07 NCS 시험',
  })
  console.log('   ✅ 퀘스트: 학교 공지')

  // 퀘스트 완료 처리 (김현서)
  const quests1 = await (await fetch(`${BASE}/rooms/${room1.id}/quests`)).json()
  for (const q of quests1) {
    await post(`/rooms/${room1.id}/quests/${q.id}/toggle`, { username: '김현서' })
  }
  console.log('   ✅ 김현서 - 전체 퀘스트 완료 처리')

  // ── 방 2: 일산국제컨벤션고등학교 1학년 1반 ────────────
  console.log('\n📌 방 2 생성: 일산국제컨벤션고등학교 1학년 1반')
  const room2 = await post('/rooms', {
    school: '일산국제컨벤션고등학교',
    grade: '1',
    class: '1',
    password: 'IL11',
  }, ADMIN_KEY)
  console.log(`   → 방 ID: ${room2.id}, 비밀번호: IL11`)

  // 퀘스트 등록 (조규민)
  const q2 = await post(`/rooms/${room2.id}/quests`, {
    title: '과학 수행평가',
    subject: '과학',
    due: '2026-05-29',
    description: '기간: 2026/05/25 ~ 2026/05/29\n유형: 논술형',
  })
  console.log('   ✅ 퀘스트: 과학 수행평가')

  // 퀘스트 완료 처리 (조규민)
  await post(`/rooms/${room2.id}/quests/${q2.id}/toggle`, { username: '조규민' })
  console.log('   ✅ 조규민 - 과학 수행평가 완료 처리')

  // Q&A 질문 (최예원)
  const qa = await post(`/rooms/${room2.id}/qa`, {
    nickname: '최예원',
    title: '과학 수행평가 범위 질문',
    body: '과학 수행평가 범위가 어디서 어디까지인가요?',
    category: 'quest',
  })
  console.log('   ✅ Q&A 질문: 최예원 - 범위 질문')

  // 답변 (조규민)
  await post(`/rooms/${room2.id}/qa/${qa.id}/answers`, {
    nickname: '조규민',
    body: '교과서 3단원 전체예요! 선생님이 프린트도 나눠주셨는데 그것도 포함이에요.',
  })
  console.log('   ✅ Q&A 답변: 조규민 - 범위 안내')

  console.log('\n🎉 예시 데이터 삽입 완료!')
  console.log('\n방 비밀번호 정보:')
  console.log('  수원공업고등학교 3학년 1반 → SU31')
  console.log('  일산국제컨벤션고등학교 1학년 1반 → IL11')
}

main().catch(console.error)
