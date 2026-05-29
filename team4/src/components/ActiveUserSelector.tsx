import React, { useState } from 'react';
import { User, ShieldAlert, Check, Plus, Gamepad2, Sparkles, Award, Key, LogOut, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserReputation, getTierForPoints } from '../reputation';
import { UserAccount } from '../accounts';
import { AVATARS, AvatarIcon, getAvatarById, getDeterministicAvatarId, GUEST_AVATAR } from '../avatars';

interface ActiveUserSelectorProps {
  currentUser: string | null;
  onUserChange: (newUser: string | null) => void;
  posts: any[];
  userReputations: Record<string, UserReputation>;
  onOpenProfile: (nickname: string) => void;
  accounts: Record<string, UserAccount>;
  onOpenAuthModal: (tab?: 'login' | 'signup') => void;
  onLogout: () => void;
}

export default function ActiveUserSelector({ 
  currentUser, 
  onUserChange, 
  posts,
  userReputations,
  onOpenProfile,
  accounts,
  onOpenAuthModal,
  onLogout
}: ActiveUserSelectorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newValue, setNewValue] = useState('');
  const [error, setError] = useState('');

  // Find all distinct nicknames to offer instant login switcher accounts (only show if not manually logged in)
  const presetUsers = Array.from(new Set([
    '초코', '라온', '쿠키앤크림', '헤드샷매니아', '치킨사냥꾼',
    ...posts.map(p => p.nickname)
  ])).slice(0, 5);

  // Count incoming pending applications for the current active user
  const incomingApplicationsCount = currentUser
    ? posts
        .filter(post => post.nickname === currentUser)
        .reduce((sum, post) => {
          const pendingCount = post.applicants.filter((a: any) => a.status === '대기중').length;
          return sum + pendingCount;
        }, 0)
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newValue.trim();
    if (!cleanName) {
      setError('닉네임을 입력해 주세요.');
      return;
    }
    if (cleanName.length > 8) {
      setError('닉네임은 최대 8자까지 설정 가능합니다.');
      return;
    }
    onUserChange(cleanName);
    setIsEditing(false);
    setNewValue('');
    setError('');
  };

  // Get active user reputation of currently logged in user
  const currentRep = currentUser ? (userReputations[currentUser] || {
    nickname: currentUser,
    points: 200,
    commendations: { friendly: 0, leader: 0, carry: 0, punctual: 0, flex: 0, positive: 0 },
    reviews: []
  }) : null;
  const currentTier = currentRep ? getTierForPoints(currentRep.points) : null;

  // Get active user avatar
  const activeAccount = currentUser ? accounts[currentUser] : null;
  const activeAvatarId = activeAccount ? activeAccount.avatarId : (currentUser ? getDeterministicAvatarId(currentUser) : 'av-guest');
  const currentAvatar = getAvatarById(activeAvatarId);

  return (
    <div className="glass-panel rounded-2xl p-4 md:p-5 backdrop-blur-md shadow-lg" id="active-user-selector-container">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        
        {/* Left column: Active profile metadata with premium AvatarIcon */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => currentUser && onOpenProfile(currentUser)}
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${currentAvatar.bgClass} border border-white/10 flex items-center justify-center ${currentAvatar.textColor} shadow-[0_0_15px_rgba(99,102,241,0.25)] hover:scale-105 active:scale-95 transition cursor-pointer relative`}
              title={currentUser ? "내 게이머 평점 카드 조회" : "로그인이 필요한 상태입니다"}
              disabled={!currentUser}
            >
              <AvatarIcon name={currentAvatar.iconName} className="w-6 h-6" />
            </button>
            {currentUser && incomingApplicationsCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-550 text-[10px] font-bold text-white ring-2 ring-slate-900 animate-pulse font-mono">
                {incomingApplicationsCount}
              </span>
            )}
          </div>
          <div>
            {!currentUser ? (
              <>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold uppercase tracking-wider select-none">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>로그인 전 게스트 방문자</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                  <span className="text-lg font-black text-slate-400">게스트 (GUEST)</span>
                  <span className="px-2 py-0.5 rounded text-[9px] bg-slate-950 text-indigo-400 font-semibold border border-slate-800">
                    로그인 후 실시간 매칭 사냥을 즐겨보세요!
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-semibold uppercase tracking-wider select-none">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  <span>활성 게이머 세션</span>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                  {/* Profile clickable name */}
                  <button
                    type="button"
                    className="text-lg font-extrabold text-slate-100 hover:text-indigo-300 hover:underline transition text-left cursor-pointer"
                    onClick={() => onOpenProfile(currentUser)}
                    title="내 평가 프로필카드 조회"
                  >
                    {currentUser}
                  </button>

                  {/* Tier reputation pill */}
                  {currentTier && currentRep && (
                    <button
                      type="button"
                      onClick={() => onOpenProfile(currentUser)}
                      className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wide flex items-center gap-0.5 scale-95 hover:brightness-110 active:scale-95 transition cursor-pointer ${currentTier.badgeClass}`}
                      title="내 티어 및 세부 칭찬 확인"
                    >
                      <span>{currentTier.icon}</span>
                      <span>{currentTier.name} ({currentRep.points} pt)</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setNewValue(currentUser);
                      setIsEditing(!isEditing);
                    }}
                    className="text-xs text-slate-400 hover:text-indigo-400 underline transition cursor-pointer ml-1 select-none"
                    id="change-nickname-btn"
                  >
                    별칭변경
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Dynamic Authentication Control & Presets Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 xl:justify-end flex-wrap">
          
          {/* Quick Sandbox preset switchers (only visible when logged out to help developers/users easily play sandbox) */}
          {!currentUser && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider select-none md:text-right">데모 닉네임 간편 스왑</span>
              <div className="flex flex-wrap gap-1">
                {presetUsers.map(user => {
                  const isActive = false;
                  const userPending = posts
                    .filter(p => p.nickname === user)
                    .reduce((sum, p) => sum + p.applicants.filter((a: any) => a.status === '대기중').length, 0);

                  return (
                    <button
                      key={user}
                      onClick={() => {
                        onUserChange(user);
                        setIsEditing(false);
                      }}
                      className="px-2 py-0.5 text-[10px] bg-slate-900 hover:bg-indigo-950 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-md transition-all flex items-center gap-0.5 cursor-pointer"
                      id={`select-user-${user}`}
                      title="간편 비밀번호 우회로 계정 테스트 스왑"
                    >
                      <span>{user}</span>
                      {userPending > 0 && (
                        <span className="w-1 h-1 rounded-full bg-rose-500 inline-block animate-ping"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Verification Actions */}
          <div className="flex flex-col gap-1.5 w-full md:w-auto">
            <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider select-none md:text-right">계정 인증 포탈</span>
            <div className="flex items-center gap-1.5">
              {!currentUser ? (
                <>
                  <button
                    onClick={() => onOpenAuthModal('login')}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-550 border border-indigo-400/20 rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-sm animate-pulse hover:animate-none"
                    title="기존 아이디와 비밀번호로 로그인 인증"
                    id="portal-login-btn"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>로그인</span>
                  </button>
                  <button
                    onClick={() => onOpenAuthModal('signup')}
                    className="px-3 py-1.5 text-xs font-bold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-750 rounded-xl flex items-center gap-1 transition-all cursor-pointer"
                    title="새로운 게이머 계정 만들기 및 아바타 설정"
                    id="portal-register-btn"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-indigo-400" />
                    <span>회원가입</span>
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-indigo-400 font-bold bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded-xl">
                    🔐 보안 인증 완료
                  </span>
                  <button
                    onClick={onLogout}
                    className="px-3 py-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-950 rounded-xl transition flex items-center gap-1 cursor-pointer"
                    title="로그아웃 및 게스트 상태로 돌아가기"
                    id="portal-logout-btn"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>로그아웃</span>
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Slide-out input to customize custom nickname */}
      <AnimatePresence>
        {isEditing && currentUser && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden mt-4"
          >
            <form onSubmit={handleSubmit} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex flex-col gap-2">
              <div className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>커스텀 닉네임 설정</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newValue}
                  onChange={(e) => {
                    setNewValue(e.target.value.slice(0, 10));
                    setError('');
                  }}
                  placeholder="예: 실버골드, 마스터킹"
                  className="flex-1 px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  maxLength={10}
                  autoFocus
                  id="custom-nickname-input"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-sm font-semibold rounded-lg text-white transition flex items-center gap-1 shadow-sm cursor-pointer"
                  id="submit-nickname-btn"
                >
                  <Check className="w-4 h-4" />
                  <span>확인</span>
                </button>
              </div>
              {error && (
                <div className="text-xs text-rose-450 font-medium flex items-center gap-1 mt-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>{error}</span>
                </div>
              )}
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
