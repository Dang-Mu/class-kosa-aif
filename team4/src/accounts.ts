export interface UserAccount {
  username: string;   // 로그인용 아이디
  passwordVal: string; // 로그인용 비밀번호
  nickname: string;    // 매칭용 닉네임 (고유)
  avatarId: string;    // 선택한 아바타 아이콘 ID
}

export const INITIAL_ACCOUNTS: Record<string, UserAccount> = {
  // 닉네임을 키로 하고, 아이디와 비밀번호 정보 매핑
  '초코': {
    username: 'choco',
    passwordVal: '1234',
    nickname: '초코',
    avatarId: 'av-gamepad'
  },
  '라온': {
    username: 'laon',
    passwordVal: '1234',
    nickname: '라온',
    avatarId: 'av-crown'
  },
  '쿠키앤크림': {
    username: 'cookie',
    passwordVal: '1234',
    nickname: '쿠키앤크림',
    avatarId: 'av-ghost'
  },
  '헤드샷매니아': {
    username: 'headshot',
    passwordVal: '1234',
    nickname: '헤드샷매니아',
    avatarId: 'av-target'
  },
  '치킨사냥꾼': {
    username: 'chicken',
    passwordVal: '1234',
    nickname: '치킨사냥꾼',
    avatarId: 'av-flame'
  }
};
