import React, { useState } from 'react';
import { Gamepad2, Clock, Trophy, Send, User, MessageSquare, Check, X, Bell, ChevronDown, ChevronUp, Star, Award } from 'lucide-react';
import { Post, Applicant } from '../types';
import { GAMES_METADATA } from '../data';
import { UserReputation, getTierForPoints } from '../reputation';
import { motion, AnimatePresence } from 'motion/react';
import { UserAccount } from '../accounts';
import { AVATARS, AvatarIcon, getAvatarById, getDeterministicAvatarId } from '../avatars';
import { getGameIcon, getRoleIcon } from './GameRoleIcons';

interface PostCardProps {
  key?: any;
  post: Post;
  currentUser: string | null;
  onApply: (postId: number, message: string) => void;
  onUpdateApplicantStatus: (postId: number, applicantId: string, status: '대기중' | '수락됨' | '거절됨') => void;
  userReputations: Record<string, UserReputation>;
  onOpenProfile: (nickname: string) => void;
  onOpenRating: (postId: number, fromUser: string, toUser: string) => void;
  ratedMatches: string[];
  accounts: Record<string, UserAccount>;
  onOpenAuthModal: (tab?: 'login' | 'signup') => void;
}

export default function PostCard({ 
  post, 
  currentUser, 
  onApply, 
  onUpdateApplicantStatus,
  userReputations,
  onOpenProfile,
  onOpenRating,
  ratedMatches,
  accounts,
  onOpenAuthModal
}: PostCardProps) {
  const [isApplying, setIsApplying] = useState(false);
  const [applyMessage, setApplyMessage] = useState('');
  const [error, setError] = useState('');
  const [isExpanded, setIsExpanded] = useState(false); // For reading full description
  const [showApplicants, setShowApplicants] = useState(false); // Collapse applicants list for high-density scanning

  const isMyPost = post.nickname === currentUser;

  // Find if current user has already applied to this post
  const myApplication = post.applicants.find(app => app.nickname === currentUser);
  const hasApplied = !!myApplication;

  // Get metadata for styling based on game name
  const gameInfo = GAMES_METADATA[post.game] || GAMES_METADATA['기타'];

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMsg = applyMessage.trim();
    if (!cleanMsg) {
      setError('신청 한마디를 적어주세요!');
      return;
    }
    onApply(post.id, cleanMsg);
    setIsApplying(false);
    setApplyMessage('');
    setError('');
  };

  // Convert ISO string to readable format
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

  const isLongMessage = post.message.length > 70;
  const displayedMessage = isLongMessage && !isExpanded 
    ? `${post.message.slice(0, 70)}...` 
    : post.message;

  // Load creator reputation and tier
  const reputation = userReputations[post.nickname] || {
    nickname: post.nickname,
    points: 200,
    commendations: { friendly: 0, leader: 0, carry: 0, punctual: 0, flex: 0, positive: 0 },
    reviews: []
  };
  const tier = getTierForPoints(reputation.points);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className={`relative glass-panel card-hover ${
        isMyPost ? 'border-indigo-500/40 shadow-[0_0_12px_rgba(99,102,241,0.1)] bg-slate-800/15' : 'bg-slate-900/40'
      } rounded-2xl p-4 md:p-5 transition-all text-slate-300 w-full`}
      id={`post-card-${post.id}`}
    >
      {/* My Post tag */}
      {isMyPost && (
        <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 bg-indigo-600 text-[10px] font-bold tracking-wider text-indigo-100 rounded-full flex items-center gap-1 uppercase border border-indigo-400/20 z-10 select-none">
          <User className="w-2.5 h-2.5" />
          <span>내 모집글</span>
        </span>
      )}

      {/* Main horizontally aligned container on desktop, stacks elegantly on mobile */}
      <div className="flex flex-col lg:flex-row gap-5 items-stretch lg:items-center justify-between">
        
        {/* SECTION 1: PROFILE & METADATA COLUMN */}
        <div className="flex flex-row lg:flex-col justify-between items-center lg:items-start gap-4 shrink-0 lg:w-48 xl:w-52 border-b lg:border-b-0 lg:border-r border-slate-855 pb-3 lg:pb-0 lg:pr-5">
          
          {/* Creator Profile Detail */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => onOpenProfile(post.nickname)}
              className="flex items-center gap-2.5 hover:opacity-80 transition text-left cursor-pointer focus:outline-none shrink-0"
              title={`${post.nickname}님의 플레이어 카드 상세정보`}
            >
              {(() => {
                const creatorAccount = accounts[post.nickname];
                const creatorAvatarId = creatorAccount ? creatorAccount.avatarId : getDeterministicAvatarId(post.nickname);
                const creatorAvatar = getAvatarById(creatorAvatarId);
                return (
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${creatorAvatar.bgClass} flex items-center justify-center ${creatorAvatar.textColor} border border-slate-700/40 font-bold select-none shrink-0 shadow-sm`}>
                    <AvatarIcon name={creatorAvatar.iconName} className="w-5 h-5" />
                  </div>
                );
              })()}
              
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-slate-100 truncate max-w-[85px]">{post.nickname}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 inline-block animate-pulse" title="모집 진행 중"></span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 font-normal">모집 방장</div>
              </div>
            </button>
          </div>

          {/* Manner badge & Created time section */}
          <div className="flex flex-col gap-1 items-end lg:items-start text-right lg:text-left select-none">
            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wide flex items-center gap-1 border ${tier.badgeClass}`}>
              <span>{tier.icon}</span>
              <span>{tier.name}</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono mt-0.5">
              {getReadableTime(post.createdAt)}
            </span>
          </div>

        </div>

        {/* SECTION 2: MATCHING CRITERIA BADGES & RECRUIT CONTENT */}
        <div className="flex-1 min-w-0 flex flex-col md:flex-row items-stretch md:items-center gap-5">
          
          {/* Vertical badge metadata panel */}
          <div className="grid grid-cols-2 md:flex md:flex-col md:gap-2.5 gap-2 shrink-0 justify-start select-none md:border-r border-slate-855 md:pr-5">
            <div className="flex flex-col gap-1 pr-1">
              <span className="text-[9px] text-slate-500 font-bold tracking-wider uppercase">게임</span>
              <span className={`text-[11px] px-2.5 py-1.5 font-extrabold tracking-tight uppercase rounded-xl border flex items-center justify-center gap-1.5 whitespace-nowrap shadow-sm ${gameInfo.color}`}>
                {getGameIcon(post.game, "w-4 h-4 shrink-0")}
                <span>{post.game}</span>
              </span>
            </div>

            <div className="flex flex-col gap-1 pr-1">
              <span className="text-[9px] text-slate-500 font-bold tracking-wider uppercase">원하는 역할</span>
              <span className="text-[11px] px-2.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold flex items-center justify-center gap-1.5 whitespace-nowrap overflow-hidden text-ellipsis shadow-sm">
                {getRoleIcon(post.position || '올라운더', "w-3.5 h-3.5 shrink-0")}
                <span>{post.position || '올라운더'}</span>
              </span>
            </div>

            <div className="flex flex-col gap-1 pr-1 md:w-28">
              <span className="text-[9px] text-slate-500 font-bold tracking-wider uppercase">시간대 / 실력</span>
              <div className="flex gap-1.5">
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950/40 border border-slate-850 text-slate-300 font-medium whitespace-nowrap">
                  {post.time}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950/40 border border-slate-850 text-slate-300 font-medium whitespace-nowrap">
                  {post.level}
                </span>
              </div>
            </div>
          </div>

          {/* Recruit speech bubble text */}
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <div className="p-3 md:p-4 bg-slate-950/25 border border-slate-950/45 rounded-xl hover:bg-slate-950/40 transition">
              <p className="text-slate-300 text-xs md:text-sm leading-relaxed whitespace-pre-wrap break-all">
                {displayedMessage}
                {isLongMessage && (
                  <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-indigo-400 hover:text-indigo-350 ml-1.5 focus:outline-none inline-flex items-center gap-0.5 hover:underline font-bold text-[10px] cursor-pointer"
                  >
                    {isExpanded ? (
                      <>접기 <ChevronUp className="w-3 h-3" /></>
                    ) : (
                      <>더 보기 <ChevronDown className="w-3 h-3" /></>
                    )}
                  </button>
                )}
              </p>
            </div>
          </div>

        </div>

        {/* SECTION 3: APPLICATION SIDE CONTROLS & MATCH CONTROLLERS */}
        <div className="shrink-0 w-full lg:w-48 xl:w-52 border-t lg:border-t-0 lg:border-l border-slate-855 pt-3 lg:pt-0 lg:pl-5 flex flex-col justify-center">
          {!isMyPost ? (
            <div>
              {hasApplied ? (
                <div className="p-2.5 rounded-xl bg-slate-950/45 border border-slate-850 flex flex-col gap-1.5 text-[10px] font-semibold">
                  <div className="flex items-center justify-between border-b border-slate-850 pb-1.5 mb-1">
                    <span className="text-slate-400 font-bold select-none">신청 완료됨</span>
                    <div>
                      {myApplication.status === '대기중' && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-mono font-bold select-none">
                          대기 중
                        </span>
                      )}
                      {myApplication.status === '수락됨' && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-mono font-bold select-none">
                          수락됨
                        </span>
                      )}
                      {myApplication.status === '거절됨' && (
                        <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-450 border border-rose-500/20 text-[9px] font-mono font-bold select-none">
                          거절됨
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-slate-350 text-[10px] leading-normal bg-slate-950/20 p-2 rounded border border-slate-850/50">
                    <span className="text-indigo-400 font-bold block mb-0.5 select-none">전한 한마디:</span>
                    "{myApplication.message}"
                  </div>

                  {/* Rating accepted host */}
                  {myApplication.status === '수락됨' && (
                    <div className="mt-1 pt-1.5 border-t border-slate-900/50 flex">
                      {ratedMatches.includes(`${post.id}-${currentUser}-${post.nickname}`) ? (
                        <span className="text-[9px] text-indigo-400 text-center w-full font-bold bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-900/40 select-none">
                          평가 작성완료 ✅
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onOpenRating(post.id, currentUser, post.nickname)}
                          className="w-full justify-center py-1.5 px-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-[9px] flex items-center gap-1 transition cursor-pointer shadow-sm shadow-indigo-950"
                          title="방장 호스트 평가하기"
                        >
                          <Award className="w-3.5 h-3.5 text-amber-300" />
                          <span>방장 평점 남기기</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <AnimatePresence>
                    {isApplying ? (
                      <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={handleApplySubmit}
                        className="flex flex-col gap-1.5 p-2 bg-slate-950/60 border border-slate-800 rounded-lg text-[10px]"
                      >
                        <input
                          type="text"
                          value={applyMessage}
                          onChange={(e) => {
                            setApplyMessage(e.target.value);
                            setError('');
                          }}
                          placeholder="전할 디코나 포지션 정보..."
                          className="w-full px-2 py-1 bg-slate-900 border border-slate-750 rounded text-slate-200 placeholder-slate-655 text-[10px] focus:outline-none focus:ring-1 focus:ring-indigo-500 transition font-sans"
                          maxLength={50}
                          autoFocus
                        />
                        {error && <span className="text-[10px] text-rose-450">{error}</span>}
                        <div className="flex gap-1.5 justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              setIsApplying(false);
                              setApplyMessage('');
                              setError('');
                            }}
                            className="px-2 py-0.5 text-[9px] text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800 rounded transition font-medium cursor-pointer"
                          >
                            취소
                          </button>
                          <button
                            type="submit"
                            className="px-2 py-0.5 text-[9px] bg-indigo-600 hover:bg-indigo-500 text-white rounded transition font-bold flex items-center gap-0.5 cursor-pointer"
                          >
                            <Send className="w-2.5 h-2.5" />
                            <span>보내기</span>
                          </button>
                        </div>
                      </motion.form>
                    ) : (
                      <button
                        onClick={() => {
                          if (!currentUser) {
                            onOpenAuthModal('login');
                          } else {
                            setIsApplying(true);
                          }
                        }}
                        className="w-full py-2.5 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/10 hover:border-transparent rounded-xl text-xs font-bold transition duration-200 flex items-center justify-center gap-1 cursor-pointer shadow-sm hover:shadow-lg hover:shadow-indigo-950"
                        id={`apply-match-btn-${post.id}`}
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>매칭 신청하기</span>
                      </button>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          ) : (
            /* User's own recruitment: show incoming applications block */
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => setShowApplicants(!showApplicants)}
                className="w-full py-2 px-2.5 rounded-xl bg-slate-950/20 hover:bg-slate-950/40 border border-slate-800/40 transition flex items-center justify-between text-[11px] font-bold text-indigo-300 cursor-pointer"
                id={`toggle-applicants-btn-${post.id}`}
              >
                <span className="flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-indigo-455 shrink-0" />
                  <span>신청 게이머 목록</span>
                  <span className="text-white bg-indigo-600 px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold">{post.applicants.length}</span>
                </span>
                {showApplicants ? <ChevronUp className="w-3.5 h-3.5 text-indigo-400" /> : <ChevronDown className="w-3.5 h-3.5 text-indigo-400" />}
              </button>

              <AnimatePresence>
                {showApplicants && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-1.5 overflow-hidden"
                  >
                    {post.applicants.length > 0 ? (
                      <div className="space-y-1.5 mt-1.5 max-h-48 overflow-y-auto pr-1">
                        {post.applicants.map(applicant => {
                          const apprep = userReputations[applicant.nickname] || {
                            nickname: applicant.nickname,
                            points: 200,
                            commendations: { friendly: 0, leader: 0, carry: 0, punctual: 0, flex: 0, positive: 0 },
                            reviews: []
                          };
                          const apptier = getTierForPoints(apprep.points);

                          return (
                            <div
                              key={applicant.id}
                              className={`p-2 rounded-xl border text-[10px] ${
                                applicant.status === '수락됨'
                                  ? 'bg-emerald-500/5 border-emerald-500/15'
                                  : applicant.status === '거절됨'
                                  ? 'bg-rose-500/5 border-rose-500/15'
                                  : 'bg-slate-950/70 border-slate-800'
                              }`}
                            >
                              <div className="flex items-center justify-between font-bold mb-1">
                                <button
                                  type="button"
                                  onClick={() => onOpenProfile(applicant.nickname)}
                                  className="text-slate-200 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer font-sans"
                                  title={`${applicant.nickname}님의 플레이어 프로필 확인`}
                                >
                                  {(() => {
                                    const appAccount = accounts[applicant.nickname];
                                    const appAvatarId = appAccount ? appAccount.avatarId : getDeterministicAvatarId(applicant.nickname);
                                    const appAvatar = getAvatarById(appAvatarId);
                                    return (
                                      <div className={`w-4 h-4 rounded-md bg-gradient-to-br ${appAvatar.bgClass} flex items-center justify-center ${appAvatar.textColor} select-none border border-white/5`}>
                                        <AvatarIcon name={appAvatar.iconName} className="w-2.5 h-2.5" />
                                      </div>
                                    );
                                  })()}
                                  <span className="truncate max-w-[65px]">{applicant.nickname}</span>
                                  <span className={`px-1 rounded text-[7px] font-black uppercase inline-flex items-center gap-0.5 scale-90 origin-left ${apptier.badgeClass}`}>
                                    <span>{apptier.icon}</span>
                                    <span>{apptier.name}</span>
                                  </span>
                                </button>
                                <span className="text-[8px] text-slate-500 font-mono">
                                  {getReadableTime(applicant.createdAt)}
                                </span>
                              </div>
                              <p className="text-slate-400 leading-normal italic text-[10px] bg-slate-950/40 p-1.5 rounded mb-1.5">
                                "{applicant.message}"
                              </p>

                              <div className="flex items-center justify-between mt-1">
                                <span>
                                  {applicant.status === '대기중' && <span className="text-amber-400 font-semibold text-[9px]">대기 중</span>}
                                  {applicant.status === '수락됨' && <span className="text-emerald-400 font-bold text-[9px]">수락됨 ✨</span>}
                                  {applicant.status === '거절됨' && <span className="text-slate-500 text-[9px]">거절됨</span>}
                                </span>

                                {applicant.status === '대기중' && (
                                  <div className="flex gap-1 shrink-0">
                                    <button
                                      onClick={() => onUpdateApplicantStatus(post.id, applicant.id, '거절됨')}
                                      className="py-0.5 px-2 bg-rose-500/10 hover:bg-rose-500 text-rose-455 hover:text-white rounded text-[8px] transition cursor-pointer"
                                      id={`decline-btn-${applicant.id}`}
                                    >
                                      거절
                                    </button>
                                    <button
                                      onClick={() => onUpdateApplicantStatus(post.id, applicant.id, '수락됨')}
                                      className="py-0.5 px-2 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-455 hover:text-white rounded text-[8px] font-bold transition cursor-pointer shrink-0"
                                      id={`accept-btn-${applicant.id}`}
                                    >
                                      수락
                                    </button>
                                  </div>
                                )}

                                {applicant.status === '수락됨' && (
                                  <div className="shrink-0">
                                    {ratedMatches.includes(`${post.id}-${currentUser}-${applicant.nickname}`) ? (
                                      <span className="text-[8px] text-emerald-400 font-semibold bg-emerald-950/30 px-1 py-0.2 rounded border border-emerald-900/35">
                                        평가 완료
                                      </span>
                                    ) : (
                                      <button
                                        onClick={() => onOpenRating(post.id, currentUser, applicant.nickname)}
                                        className="py-0.5 px-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[8px] font-bold transition cursor-pointer"
                                        id={`rate-app-btn-${applicant.id}`}
                                        title="신청 게이머 평가하기"
                                      >
                                        ⭐ 평가/후기
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-slate-500 text-[9px] text-center py-2 bg-slate-950/10 rounded-lg border border-dashed border-slate-850">
                        아직 접수된 신청서가 없습니다.
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

      </div>
    </motion.div>
  );
}
