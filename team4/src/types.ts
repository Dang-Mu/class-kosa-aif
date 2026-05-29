export type GameType = '발로란트' | '롤' | '마크' | '오버워치' | '배틀그라운드' | '로스트아크' | '기타';
export type TimeType = '오전' | '오후' | '저녁' | '새벽';
export type LevelType = '초보' | '중수' | '고수';

export interface Applicant {
  id: string;
  postId: number;
  nickname: string;
  message: string;
  status: '대기중' | '수락됨' | '거절됨';
  createdAt: string;
}

export interface Post {
  id: number;
  nickname: string;
  game: GameType | string;
  time: TimeType;
  level: LevelType;
  position?: string;
  message: string;
  createdAt: string;
  applicants: Applicant[];
}

export interface AppState {
  posts: Post[];
  currentUser: string;
}
