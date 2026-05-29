import { Post, GameType, TimeType, LevelType } from './types';

export interface GameConfig {
  name: string;
  color: string; // Tailwind border and badge colors
  bg: string;
  text: string;
  iconBg: string;
}

export const GAMES_METADATA: Record<string, GameConfig> = {
  '발로란트': {
    name: '발로란트',
    color: 'border-rose-500/30 text-rose-400 bg-rose-500/10',
    bg: 'bg-rose-500/10 hover:bg-rose-500/15',
    text: 'text-rose-400',
    iconBg: 'bg-rose-500/20 text-rose-400'
  },
  '롤': {
    name: '롤',
    color: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
    bg: 'bg-amber-500/10 hover:bg-amber-500/15',
    text: 'text-amber-400',
    iconBg: 'bg-amber-500/20 text-amber-400'
  },
  '마크': {
    name: '마크',
    color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
    bg: 'bg-emerald-500/10 hover:bg-emerald-500/15',
    text: 'text-emerald-400',
    iconBg: 'bg-emerald-500/20 text-emerald-400'
  },
  '오버워치': {
    name: '오버워치',
    color: 'border-orange-500/30 text-orange-400 bg-orange-500/10',
    bg: 'bg-orange-500/10 hover:bg-orange-500/15',
    text: 'text-orange-400',
    iconBg: 'bg-orange-500/20 text-orange-400'
  },
  '배틀그라운드': {
    name: '배틀그라운드',
    color: 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10',
    bg: 'bg-yellow-500/10 hover:bg-yellow-500/15',
    text: 'text-yellow-400',
    iconBg: 'bg-yellow-500/20 text-yellow-500'
  },
  '로스트아크': {
    name: '로스트아크',
    color: 'border-indigo-500/30 text-indigo-400 bg-indigo-500/10',
    bg: 'bg-indigo-500/10 hover:bg-indigo-500/15',
    text: 'text-indigo-400',
    iconBg: 'bg-indigo-500/20 text-indigo-400'
  },
  '기타': {
    name: '기타',
    color: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10',
    bg: 'bg-cyan-500/10 hover:bg-cyan-500/15',
    text: 'text-cyan-400',
    iconBg: 'bg-cyan-500/20 text-cyan-400'
  }
};

export const GAMES: GameType[] = ['발로란트', '롤', '마크', '오버워치', '배틀그라운드', '로스트아크', '기타'];
export const TIMES: TimeType[] = ['오전', '오후', '저녁', '새벽'];
export const LEVELS: LevelType[] = ['초보', '중수', '고수'];
export const POSITIONS: string[] = ['탱커/돌격', '딜러/격수', '힐러/지원', '서폿/보조', '올라운더'];

export const INITIAL_POSTS: Post[] = [
  {
    id: 1,
    nickname: '초코',
    game: '발로란트',
    time: '저녁',
    level: '초보',
    position: '올라운더',
    message: '발로란트 같이 즐겜할 분 구해요! 마이크 가능하고 매너 좋으신 분이면 대환영입니다 🌸',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    applicants: [
      {
        id: 'app-1',
        postId: 1,
        nickname: '마카롱',
        message: '저도 발로 초보인데 같이 재미있게 해요! 디코 아이디 남겼습니다.',
        status: '대기중',
        createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString()
      }
    ]
  },
  {
    id: 2,
    nickname: '라온',
    game: '롤',
    time: '새벽',
    level: '고수',
    position: '딜러/격수',
    message: '칼바람이나 랭킹 뛰실 분! 승률 관리하면서 빡겜하실 고수님들만 신청 부탁드려요 🔥',
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
    applicants: []
  },
  {
    id: 3,
    nickname: '쿠키앤크림',
    game: '마크',
    time: '오후',
    level: '중수',
    position: '올라운더',
    message: '새로 오픈한 건축 서버에서 아기자기하게 마을 꾸미며 같이 하실 분 모십니다 야생 위주예요!',
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    applicants: [
      {
        id: 'app-2',
        postId: 3,
        nickname: '초코',
        message: '마크 엄청 좋아해요! 같이 예쁜 복층집 지어보고 싶어요.',
        status: '수락됨',
        createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString()
      }
    ]
  },
  {
    id: 4,
    nickname: '헤드샷매니아',
    game: '오버워치',
    time: '저녁',
    level: '고수',
    position: '힐러/지원',
    message: '아나나 야타 잘하시는 힐러 장인 모십니다. 딜탱 라인 든든하니까 프리딜 케어만 잘 부탁드려요!',
    createdAt: new Date(Date.now() - 1000 * 60 * 200).toISOString(), // 3+ hours ago
    applicants: []
  },
  {
    id: 5,
    nickname: '치킨사냥꾼',
    game: '배틀그라운드',
    time: '오전',
    level: '중수',
    position: '탱커/돌격',
    message: '오전 스쿼드 돌리실 분 구해요! 마이크 고장 안 나신 분 조용하게 오더 따르며 1등 노려봐요',
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    applicants: [
      {
        id: 'app-3',
        postId: 5,
        nickname: '민트초코',
        message: '배그 300시간 유저인데 같이 즐겜해요! 오더 잘 들을게요',
        status: '거절됨',
        createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString()
      }
    ]
  }
];
