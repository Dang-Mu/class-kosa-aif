import React from 'react';
import { motion } from 'motion/react';
import { X, Trophy, MessageSquare, Award, Clock, Star, Heart, User, Sparkles } from 'lucide-react';
import { UserReputation, getTierForPoints, COMMENDATION_LABELS } from '../reputation';
import { UserAccount } from '../accounts';
import { AVATARS, AvatarIcon, getAvatarById, getDeterministicAvatarId } from '../avatars';

interface GamerProfileModalProps {
  reputation: UserReputation;
  onClose: () => void;
  accounts: Record<string, UserAccount>;
}

export default function GamerProfileModal({ reputation, onClose, accounts }: GamerProfileModalProps) {
  const tier = getTierForPoints(reputation.points);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 shadow-2xl" id="profile-modal-overlay">
      {/* Backdrop fading in */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-md glass-panel bg-slate-900 border border-slate-850 rounded-3xl p-5 md:p-6 z-10 overflow-y-auto max-h-[85vh] text-slate-100"
        id={`gamer-profile-modal-${reputation.nickname}`}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition cursor-pointer"
          title="닫기"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modular Avatar header with visual Tier Frame */}
        <div className="flex flex-col items-center text-center mt-2 mb-6">
          <div className="relative mb-3">
            {/* Pulsing tier background shadow based on points */}
            <div className={`absolute -inset-1 rounded-3xl bg-gradient-to-tr ${tier.bgGradient} opacity-30 blur-md`} />
            {(() => {
              const appAccount = accounts[reputation.nickname];
              const appAvatarId = appAccount ? appAccount.avatarId : getDeterministicAvatarId(reputation.nickname);
              const appAvatar = getAvatarById(appAvatarId);
              return (
                <div className={`relative w-16 h-16 rounded-3xl bg-gradient-to-br ${appAvatar.bgClass} flex items-center justify-center ${appAvatar.textColor} border border-white/10 shadow-xl select-none`}>
                  <AvatarIcon name={appAvatar.iconName} className="w-8 h-8" />
                </div>
              );
            })()}
          </div>

          <div className="flex items-center gap-1.5 justify-center">
            <h3 className="font-extrabold text-lg text-white">{reputation.nickname}</h3>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider font-mono">ONLINE</span>
          </div>

          {/* Points rating badge */}
          <div className="flex flex-col items-center gap-1 mt-2">
            <div className="text-[10px] text-indigo-300 font-semibold uppercase tracking-wider bg-indigo-950/40 px-2 py-0.5 rounded-md border border-indigo-900/40 select-none">
              🛡️ 커뮤니티 매너 신뢰 등급
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-black tracking-wider border flex items-center gap-1 shadow-sm ${tier.badgeClass}`}>
              <span>{tier.icon}</span>
              <span>{tier.name}</span>
              <span className="opacity-90 font-mono">({reputation.points}pt)</span>
            </span>
          </div>
        </div>

        {/* Interactive Stats Body */}
        <div className="space-y-4">
          
          {/* Section: Commendations summary (칭찬 요약) */}
          <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-850">
            <h4 className="text-xs font-black text-indigo-400 uppercase tracking-wider mb-2.5 flex items-center gap-1 select-none">
              <Sparkles className="w-3.5 h-3.5" />
              <span>받은 게이머 추천 칭찬표</span>
            </h4>

            {Object.values(reputation.commendations).every(c => c === 0) ? (
              <p className="text-slate-500 text-[11px] text-center py-2 italic">아직 매칭 칭찬 평가를 받지 못했습니다.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(COMMENDATION_LABELS).map(([key, label]) => {
                  const count = reputation.commendations[key as keyof typeof reputation.commendations] || 0;
                  return (
                    <div 
                      key={key} 
                      className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-bold flex items-center justify-between ${
                        count > 0 
                          ? 'bg-indigo-500/5 border-indigo-500/20 text-indigo-200' 
                          : 'bg-slate-950/20 border-slate-900 text-slate-500'
                      }`}
                    >
                      <span className="truncate pr-1">{label.split(' ')[0] || label}</span>
                      <span className="font-mono text-xs text-indigo-400 bg-indigo-500/10 px-1.5 py-0.2 rounded-full shrink-0">{count}회</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section: Historic match review logs */}
          <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-850 flex flex-col h-full">
            <h4 className="text-xs font-black text-indigo-400 uppercase tracking-wider mb-2.5 flex items-center gap-1 select-none">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>동료들의 생생한 한줄평 ({reputation.reviews.length})</span>
            </h4>

            {reputation.reviews.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {reputation.reviews.map(rev => (
                  <div key={rev.id} className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-850 leading-relaxed text-xs">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-bold text-slate-200 text-xs shrink-0 flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        {rev.fromUser}
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono">{getReadableTime(rev.createdAt)}</span>
                    </div>
                    <p className="text-slate-350 font-medium italic">"{rev.comment}"</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 text-center py-6 text-slate-600 text-[11px] italic bg-slate-950/10 rounded-2xl border border-dashed border-slate-850/50">
                아직 작성된 플레이어 매칭 평가 후기가 없습니다.
              </div>
            )}
          </div>

        </div>

        {/* Bottom Tip section */}
        <div className="mt-5 pt-3.5 border-t border-slate-850/40 text-[10px] text-slate-500 text-center select-none leading-relaxed">
          같이 매칭 성공 후 파티 활동을 가졌다면,<br />내 신청 관리 화면에서 한줄 후기와 평점을 보낼 수 있습니다!
        </div>
      </motion.div>
    </div>
  );
}
