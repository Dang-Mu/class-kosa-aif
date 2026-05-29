export interface UserReputation {
  nickname: string;
  points: number; // Default 200 (Gold V/IV baseline)
  commendations: {
    friendly: number;  // 친절하고 즐거워요 😊
    leader: number;    // 브리핑/오더가 우수해요 📣
    carry: number;     // 하드 캐리 장인이에요 ⚡
    punctual: number;  // 약속 시간을 잘 지켜요 ⏰
    flex: number;      // 포지션 배려가 넘쳐요 🤝
    positive: number;  // 멘탈이 좋고 활기차요 🔥
  };
  reviews: {
    id: string;
    postId: number;
    fromUser: string;
    comment: string;
    commendationsSelected: string[];
    createdAt: string;
  }[];
}

export type TierName = '매너 브론즈' | '매너 실버' | '매너 골드' | '매너 플래티넘' | '매너 다이아' | '매너 마스터' | '매너 그랜드마스터' | '매너 챌린저';

export interface TierInfo {
  name: TierName;
  minPoints: number;
  maxPoints: number;
  bgGradient: string;
  textClass: string;
  badgeClass: string;
  shadowClass: string;
  icon: string;
}

export const COMMENDATION_LABELS: Record<string, string> = {
  friendly: '친절하고 매너가 좋음 😊',
  leader: '브리핑 & 오더가 끝내줌 📣',
  carry: '압도적인 피지컬로 하드 캐리 ⚡',
  punctual: '시간 약속 칼같이 지킴 ⏰',
  flex: '포지션 분배 및 팀 배려 좋음 🤝',
  positive: '강철 멘탈 & 유쾌함 탑재 🔥',
};

export const TIERS: TierInfo[] = [
  {
    name: '매너 브론즈',
    minPoints: 0,
    maxPoints: 99,
    bgGradient: 'from-amber-800 to-amber-900',
    textClass: 'text-amber-500',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    shadowClass: 'shadow-amber-900/10',
    icon: '🥉'
  },
  {
    name: '매너 실버',
    minPoints: 100,
    maxPoints: 199,
    bgGradient: 'from-slate-400 to-slate-500',
    textClass: 'text-slate-300',
    badgeClass: 'bg-slate-400/10 text-slate-300 border-slate-400/20',
    shadowClass: 'shadow-slate-400/10',
    icon: '🥈'
  },
  {
    name: '매너 골드',
    minPoints: 200,
    maxPoints: 349,
    bgGradient: 'from-amber-400 via-yellow-500 to-amber-600',
    textClass: 'text-yellow-400',
    badgeClass: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    shadowClass: 'shadow-yellow-500/20',
    icon: '🥇'
  },
  {
    name: '매너 플래티넘',
    minPoints: 350,
    maxPoints: 499,
    bgGradient: 'from-teal-400 to-emerald-500',
    textClass: 'text-emerald-400',
    badgeClass: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    shadowClass: 'shadow-emerald-500/20',
    icon: '💎'
  },
  {
    name: '매너 다이아',
    minPoints: 500,
    maxPoints: 699,
    bgGradient: 'from-cyan-400 via-indigo-400 to-purple-500',
    textClass: 'text-cyan-400',
    badgeClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    shadowClass: 'shadow-cyan-500/30',
    icon: '❄️'
  },
  {
    name: '매너 마스터',
    minPoints: 700,
    maxPoints: 899,
    bgGradient: 'from-purple-500 via-pink-500 to-indigo-600',
    textClass: 'text-pink-400',
    badgeClass: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    shadowClass: 'shadow-pink-500/30',
    icon: '🔮'
  },
  {
    name: '매너 그랜드마스터',
    minPoints: 900,
    maxPoints: 1099,
    bgGradient: 'from-red-500 via-amber-500 to-orange-650',
    textClass: 'text-red-400',
    badgeClass: 'bg-red-500/10 text-red-400 border-red-500/20',
    shadowClass: 'shadow-red-500/35',
    icon: '👑'
  },
  {
    name: '매너 챌린저',
    minPoints: 1100,
    maxPoints: 99999,
    bgGradient: 'from-sky-300 via-blue-500 to-indigo-600',
    textClass: 'text-sky-300 font-extrabold animate-[pulse_3s_infinite]',
    badgeClass: 'bg-sky-450/20 text-sky-300 border-sky-400/30 font-black shadow-[0_0_15px_rgba(56,189,248,0.3)]',
    shadowClass: 'shadow-sky-500/40',
    icon: '⚡'
  }
];

export function getTierForPoints(points: number): TierInfo {
  const matched = TIERS.find(t => points >= t.minPoints && points <= t.maxPoints);
  return matched || TIERS[2]; // Default Gold
}

// Initial reputation seeds for standard testing users
export const INITIAL_REPUTATIONS: Record<string, UserReputation> = {
  '초코': {
    nickname: '초코',
    points: 210,
    commendations: { friendly: 1, leader: 0, carry: 0, punctual: 1, flex: 0, positive: 1 },
    reviews: [
      {
        id: 'rev-1',
        postId: 3,
        fromUser: '쿠키앤크림',
        comment: '시간 약속도 정말 칼같이 지켜주시고, 건축할 때 너무 친절하게 도와주셨어요!',
        commendationsSelected: ['friendly', 'punctual', 'positive'],
        createdAt: new Date(Date.now() - 1000 * 60 * 80).toISOString()
      }
    ]
  },
  '라온': {
    nickname: '라온',
    points: 1120, // Challenger
    commendations: { friendly: 4, leader: 3, carry: 8, punctual: 2, flex: 1, positive: 2 },
    reviews: [
      {
        id: 'rev-2',
        postId: 99,
        fromUser: '치킨사냥꾼',
        comment: '와 진짜 무빙 미쳤고 빡캐리 해주시네요... 챌린저 게이머 인정합니다.',
        commendationsSelected: ['carry', 'leader'],
        createdAt: new Date(Date.now() - 1000 * 60 * 450).toISOString()
      }
    ]
  },
  '쿠키앤크림': {
    nickname: '쿠키앤크림',
    points: 420, // Platinum
    commendations: { friendly: 3, leader: 1, carry: 0, punctual: 2, flex: 2, positive: 1 },
    reviews: []
  },
  '헤드샷매니아': {
    nickname: '헤드샷매니아',
    points: 580, // Diamond
    commendations: { friendly: 1, leader: 5, carry: 4, punctual: 1, flex: 0, positive: 1 },
    reviews: []
  },
  '치킨사냥꾼': {
    nickname: '치킨사냥꾼',
    points: 260, // Gold
    commendations: { friendly: 2, leader: 0, carry: 1, punctual: 1, flex: 1, positive: 1 },
    reviews: []
  },
};
