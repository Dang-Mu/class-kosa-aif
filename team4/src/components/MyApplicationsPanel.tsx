import React from 'react';
import { Post, Applicant } from '../types';
import { FileText, ArrowUpRight, BellRing, Check, X, ShieldAlert, BadgeCheck, Clock, UserCheck, Star, Award, Sparkles } from 'lucide-react';
import { GAMES_METADATA } from '../data';
import { UserReputation, getTierForPoints } from '../reputation';
import { motion, AnimatePresence } from 'motion/react';
import { UserAccount } from '../accounts';
import { AVATARS, AvatarIcon, getAvatarById, getDeterministicAvatarId } from '../avatars';
import { getGameIcon } from './GameRoleIcons';

interface MyApplicationsPanelProps {
  currentUser: string | null;
  posts: Post[];
  onUpdateApplicantStatus: (postId: number, applicantId: string, status: '대기중' | '수락됨' | '거절됨') => void;
  userReputations: Record<string, UserReputation>;
  onOpenProfile: (nickname: string) => void;
  onOpenRating: (postId: number, fromUser: string, toUser: string) => void;
  ratedMatches: string[];
  accounts: Record<string, UserAccount>;
  onOpenAuthModal: (tab?: 'login' | 'signup') => void;
}

export default function MyApplicationsPanel({
  currentUser,
  posts,
  onUpdateApplicantStatus,
  userReputations,
  onOpenProfile,
  onOpenRating,
  ratedMatches,
  accounts,
  onOpenAuthModal
}: MyApplicationsPanelProps) {
  
  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 glass-panel rounded-3xl bg-slate-900/40 text-center max-w-xl mx-auto shadow-2xl" id="guest-applications-notice">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 mb-4 mx-auto animate-bounce">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-100 mb-2">로그인 후 신청 확인이 가능합니다</h3>
        <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
          내가 보낸 매칭 신청 및 타인에게서 받은 매칭 신청을 실시간 관리하고, 수락/거절 여부와 서로에 대한 매칭 평점을 반영하려면 먼저 로그인해 주셔야 합니다.
        </p>
        <button
          onClick={() => onOpenAuthModal('login')}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-550 active:bg-indigo-700 text-white font-bold text-sm rounded-xl transition cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.3)]"
          id="guest-notice-login-btn"
        >
          지금 로그인하기
        </button>
      </div>
    );
  }

  // 1. Received Applications (Inbound): Applications on posts made by currentUser
  const myPosts = posts.filter(post => post.nickname === currentUser);
  const receivedApplications = myPosts.flatMap(post => 
    post.applicants.map(app => ({
      ...app,
      postGame: post.game,
      postMessage: post.message,
      postId: post.id
    }))
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // 2. Sent Applications (Outbound): Applications sent by currentUser on other people's posts
  const sentApplications = posts.flatMap(post => 
    post.applicants
      .filter(app => app.nickname === currentUser)
      .map(app => ({
        ...app,
        postAuthor: post.nickname,
        postGame: post.game,
        postMessage: post.message,
        postId: post.id
      }))
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getReadableTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return '방금 전';
      if (diffMins < 60) return `${diffMins}분 전`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}시간 전`;
      return `${date.getMonth() + 1}월 ${date.getDate()}일`;
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="applications-panel-container">
      
      {/* 1. Received Applications Column */}
      <div className="glass-panel rounded-3xl p-5 md:p-6 shadow-xl flex flex-col h-full bg-slate-900/40">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-850">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <BellRing className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100 font-display">내가 받은 신청 현황</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">내 모집글에 대원들이 참가 요청한 리스트</p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            {receivedApplications.length}건
          </span>
        </div>

        {receivedApplications.length > 0 ? (
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {receivedApplications.map(app => {
                const gameMeta = GAMES_METADATA[app.postGame] || GAMES_METADATA['기타'];
                
                // Get reputation stats for applicant
                const rep = userReputations[app.nickname] || {
                  nickname: app.nickname,
                  points: 200,
                  commendations: { friendly: 0, leader: 0, carry: 0, punctual: 0, flex: 0, positive: 0 },
                  reviews: []
                };
                const tier = getTierForPoints(rep.points);
                const hasBeenRated = ratedMatches.includes(`${app.postId}-${currentUser}-${app.nickname}`);

                return (
                  <motion.div
                    key={app.id}
                    layoutId={`inbound-${app.id}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className={`p-4 rounded-2xl border transition-all ${
                      app.status === '수락됨'
                        ? 'bg-emerald-500/5 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.05)]'
                        : app.status === '거절됨'
                        ? 'bg-rose-500/5 border-rose-500/20'
                        : 'bg-slate-950/70 border-slate-850'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                        <span className="text-xs font-bold text-indigo-300 select-none">FROM.</span>
                        
                        {/* Clickable Applicant Profile */}
                        <button
                          type="button"
                          onClick={() => onOpenProfile(app.nickname)}
                          className="text-sm font-bold text-slate-200 hover:text-indigo-300 hover:underline inline-flex items-center gap-1.5 cursor-pointer font-sans"
                          title="프로필 상세Reputation 조회"
                        >
                          {(() => {
                            const appAccount = accounts[app.nickname];
                            const appAvatarId = appAccount ? appAccount.avatarId : getDeterministicAvatarId(app.nickname);
                            const appAvatar = getAvatarById(appAvatarId);
                            return (
                              <div className={`w-4 h-4 rounded-md bg-gradient-to-br ${appAvatar.bgClass} flex items-center justify-center ${appAvatar.textColor} select-none border border-white/5`}>
                                <AvatarIcon name={appAvatar.iconName} className="w-2.5 h-2.5" />
                              </div>
                            );
                          })()}
                          <span>{app.nickname}</span>
                          <span className={`px-1 py-0.2 rounded text-[7px] font-black uppercase tracking-wide flex items-center gap-0.5 scale-90 ${tier.badgeClass}`}>
                            <span>{tier.icon}</span>
                            <span>{tier.name}</span>
                          </span>
                        </button>
                      </div>
                      <span className={`text-[11px] px-2 py-0.5 rounded-lg font-bold uppercase border flex items-center gap-1 shrink-0 ${gameMeta.color}`}>
                        {getGameIcon(app.postGame, "w-3.5 h-3.5 shrink-0")}
                        <span>{app.postGame}</span>
                      </span>
                    </div>

                    <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-950/50 mb-3">
                      <div className="text-[10px] text-indigo-400/90 font-medium select-none mb-0.5">내 모집 메시지</div>
                      <p className="text-[11px] text-slate-400 truncate mb-2">"{app.postMessage}"</p>
                      
                      <div className="text-[10px] text-slate-400 font-bold select-none mb-0.5">상대방 매칭 한마디</div>
                      <p className="text-xs text-slate-200 font-medium italic break-all">"{app.message}"</p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                      <span className="text-[10px] font-mono">{getReadableTime(app.createdAt)}</span>
                      
                      {app.status === '대기중' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => onUpdateApplicantStatus(app.postId, app.id, '거절됨')}
                            className="px-2.5 py-1 text-[11px] font-semibold text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-500 rounded-lg border border-rose-500/20 hover:border-transparent transition cursor-pointer"
                            id={`panel-decline-btn-${app.id}`}
                          >
                            거절
                          </button>
                          <button
                            onClick={() => onUpdateApplicantStatus(app.postId, app.id, '수락됨')}
                            className="px-3 py-1 text-[11px] font-bold text-emerald-400 hover:text-white bg-emerald-500/20 hover:bg-emerald-500 rounded-lg border border-emerald-500/20 hover:border-transparent transition cursor-pointer"
                            id={`panel-accept-btn-${app.id}`}
                          >
                            수락하기
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                            app.status === '수락됨' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {app.status === '수락됨' ? '매칭 성공 🎉' : '매칭 거절됨 🚫'}
                          </span>

                          {/* Quick Rating Actions for Accepted Applicants */}
                          {app.status === '수락됨' && (
                            <div>
                              {hasBeenRated ? (
                                <span className="text-[9px] text-indigo-400 font-bold bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-900/40">
                                  평가 완료
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => onOpenRating(app.postId, currentUser, app.nickname)}
                                  className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] font-bold flex items-center gap-0.5 transition cursor-pointer"
                                  title="매칭된 팀 대원 평가 점수 및 후기 작성"
                                >
                                  ⭐ 평가/후기
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12 bg-slate-950/30 rounded-2xl border border-dashed border-slate-800">
            <UserCheck className="w-10 h-10 text-slate-600 mb-2.5 bg-slate-950 p-2 rounded-xl" />
            <h4 className="text-sm font-bold text-slate-400">들어온 매칭 신청서가 없습니다.</h4>
            <p className="text-xs text-slate-500 max-w-xs mt-1">다른 닉네임으로 접속해 내 글에 신청을 보낼 수 있습니다.</p>
          </div>
        )}
      </div>

      {/* 2. Sent Applications Column */}
      <div className="glass-panel rounded-3xl p-5 md:p-6 shadow-xl flex flex-col h-full bg-slate-900/40">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-850">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100 font-display">내가 신청한 현황</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">다른 유저 모집글에 내가 넣은 신청 내역</p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
            {sentApplications.length}건
          </span>
        </div>

        {sentApplications.length > 0 ? (
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {sentApplications.map(app => {
              const gameMeta = GAMES_METADATA[app.postGame] || GAMES_METADATA['기타'];
              
              const rep = userReputations[app.postAuthor] || {
                nickname: app.postAuthor,
                points: 200,
                commendations: { friendly: 0, leader: 0, carry: 0, punctual: 0, flex: 0, positive: 0 },
                reviews: []
              };
              const tier = getTierForPoints(rep.points);
              const hasBeenRated = ratedMatches.includes(`${app.postId}-${currentUser}-${app.postAuthor}`);

              return (
                <div
                  key={app.id}
                  className={`p-4 rounded-2xl border ${
                    app.status === '수락됨'
                      ? 'bg-emerald-500/5 border-emerald-500/20'
                      : app.status === '거절됨'
                      ? 'bg-rose-500/5 border-rose-500/20'
                      : 'bg-slate-950/70 border-slate-850'
                  }`}
                  id={`my-outbound-application-${app.id}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-slate-400">MATCH TO.</span>
                      
                      {/* Clickable Host Profile */}
                      <button
                        type="button"
                        onClick={() => onOpenProfile(app.postAuthor)}
                        className="text-sm font-bold text-slate-200 hover:text-indigo-300 hover:underline inline-flex items-center gap-1.5 cursor-pointer font-sans"
                        title="방장 프로필 및 평점 상세조회"
                      >
                        {(() => {
                          const hostAccount = accounts[app.postAuthor];
                          const hostAvatarId = hostAccount ? hostAccount.avatarId : getDeterministicAvatarId(app.postAuthor);
                          const hostAvatar = getAvatarById(hostAvatarId);
                          return (
                            <div className={`w-4 h-4 rounded-md bg-gradient-to-br ${hostAvatar.bgClass} flex items-center justify-center ${hostAvatar.textColor} select-none border border-white/5`}>
                              <AvatarIcon name={hostAvatar.iconName} className="w-2.5 h-2.5" />
                            </div>
                          );
                        })()}
                        <span>{app.postAuthor}</span>
                        <span className={`px-1 py-0.2 rounded text-[7px] font-black uppercase tracking-wide flex items-center gap-0.5 scale-90 ${tier.badgeClass}`}>
                          <span>{tier.icon}</span>
                          <span>{tier.name}</span>
                        </span>
                      </button>
                    </div>
                    <span className={`text-[11px] px-2 py-0.5 rounded-lg font-bold uppercase border flex items-center gap-1 shrink-0 ${gameMeta.color}`}>
                      {getGameIcon(app.postGame, "w-3.5 h-3.5 shrink-0")}
                      <span>{app.postGame}</span>
                    </span>
                  </div>

                  <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-950/50 mb-3 text-xs leading-relaxed">
                    <div className="text-[10px] text-slate-500 font-bold mb-0.5">올라온 모집 조건</div>
                    <p className="text-slate-400 italic mb-2 line-clamp-2">"{app.postMessage}"</p>
                    
                    <div className="text-[10px] text-indigo-400 font-bold mb-0.5">내가 적은 신청 내용</div>
                    <p className="text-slate-200 font-medium">"{app.message}"</p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                    <span className="text-[10px] font-mono">{getReadableTime(app.createdAt)}</span>
                    
                    <div className="flex items-center gap-1.5 font-bold text-[10px]">
                      {app.status === '대기중' && (
                        <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 animate-pulse" />
                          <span>심사 중...</span>
                        </span>
                      )}
                      
                      {app.status === '수락됨' && (
                        <div className="flex items-center gap-1.5">
                          <span className="px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 font-extrabold select-none shrink-0 animate-pulse">
                            <BadgeCheck className="w-3.5 h-3.5" />
                            <span>매칭 성공!</span>
                          </span>

                          {/* Rate Host rating button */}
                          {hasBeenRated ? (
                            <span className="text-[8px] text-indigo-400 font-bold bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-900/40 shrink-0">
                              평가 완료
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onOpenRating(app.postId, currentUser, app.postAuthor)}
                              className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[9px] font-bold flex items-center gap-0.5 transition cursor-pointer shrink-0"
                              title="같이 게임한 방장 호스트에게 평점 및 한줄후기 전송"
                            >
                              ⭐ 방장 평가하기
                            </button>
                          )}
                        </div>
                      )}

                      {app.status === '거절됨' && (
                        <span className="px-2.5 py-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>매칭 거절됨</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12 bg-slate-950/30 rounded-2xl border border-dashed border-slate-800">
            <ArrowUpRight className="w-10 h-10 text-slate-600 mb-2.5 bg-slate-950 p-2 rounded-xl" />
            <h4 className="text-sm font-bold text-slate-400">보낸 매칭 신청이 없습니다.</h4>
            <p className="text-xs text-slate-500 max-w-xs mt-1">마음에 드는 다른 유저의 카드를 찾아 매칭 신청을 먼저 보내보세요!</p>
          </div>
        )}
      </div>

    </div>
  );
}
