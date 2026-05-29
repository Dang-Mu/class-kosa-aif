import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Trophy, MessageSquareCode, Award, Heart, ShieldAlert, Sparkles, Smile } from 'lucide-react';
import { COMMENDATION_LABELS } from '../reputation';

interface RatingModalProps {
  postId: number;
  fromUser: string;
  toUser: string;
  onClose: () => void;
  onSubmit: (data: {
    pointsImpact: number;
    selectedCommendations: string[];
    comment: string;
  }) => void;
}

export default function RatingModal({ postId, fromUser, toUser, onClose, onSubmit }: RatingModalProps) {
  const [pointsImpact, setPointsImpact] = useState<number>(15); // Default +15
  const [selectedCommendations, setSelectedCommendations] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const toggleCommendation = (key: string) => {
    if (selectedCommendations.includes(key)) {
      setSelectedCommendations(prev => prev.filter(c => c !== key));
    } else {
      setSelectedCommendations(prev => [...prev, key]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanComment = comment.trim();
    if (!cleanComment) {
      setError('활동에 대한 한 줄 후기를 적어주세요!');
      return;
    }
    onSubmit({
      pointsImpact,
      selectedCommendations,
      comment: cleanComment
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="rating-modal-overlay">
      {/* Dim backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-lg glass-panel bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 md:p-8 z-10 overflow-y-auto max-h-[90vh] text-slate-100"
        id="rating-modal-box"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition cursor-pointer"
          title="닫기"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 shadow-sm shadow-amber-500/15">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-white font-display">매칭 커멘드 & 평점 남기기</h3>
            <p className="text-xs text-indigo-300 mt-0.5">상대 게이머 <span className="text-white font-extrabold">{toUser}</span> 님과의 모험은 즐거우셨나요?</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. Point / Rating Impact Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
              1. 이번 플레이에 대한 만족도 <span className="text-[10px] text-slate-500 font-normal">(신뢰도 기여점수)</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPointsImpact(25)}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  pointsImpact === 25
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-350 shadow-md shadow-emerald-500/5'
                    : 'bg-slate-950/40 border-slate-800 hover:bg-slate-800/50 text-slate-400'
                }`}
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold">최고예요!</span>
                <span className="text-[9px] font-mono opacity-80">+25 점</span>
              </button>

              <button
                type="button"
                onClick={() => setPointsImpact(15)}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  pointsImpact === 15
                    ? 'bg-indigo-500/15 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-500/5'
                    : 'bg-slate-950/40 border-slate-800 hover:bg-slate-800/50 text-slate-400'
                }`}
              >
                <Smile className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold">좋았어요</span>
                <span className="text-[9px] font-mono opacity-80">+15 점</span>
              </button>

              <button
                type="button"
                onClick={() => setPointsImpact(0)}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  pointsImpact === 0
                    ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-md shadow-amber-500/5'
                    : 'bg-slate-950/40 border-slate-800 hover:bg-slate-800/50 text-slate-400'
                }`}
              >
                <Heart className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold">무난해요</span>
                <span className="text-[9px] font-mono opacity-80">+0 점</span>
              </button>
            </div>
          </div>

          {/* 2. Commendation Checks */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
              2. 상대방의 장점 키워드를 선택형으로 골라주세요! <span className="text-[10px] text-slate-500 font-normal">(중복 선택 가능)</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(COMMENDATION_LABELS).map(([key, label]) => {
                const isSelected = selectedCommendations.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleCommendation(key)}
                    className={`px-3 py-2.5 rounded-xl border text-[11px] font-bold text-left transition duration-150 cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-500/10 border-indigo-400 text-indigo-200'
                        : 'bg-slate-950/40 border-slate-800 hover:bg-slate-900 text-slate-350 hover:text-slate-200'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Text Feedback Comment */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              3. 한 줄 평가 후기 작성
            </label>
            <div className="relative">
              <input
                type="text"
                value={comment}
                onChange={(e) => {
                  setComment(e.target.value);
                  setError('');
                }}
                maxLength={60}
                placeholder="예: 텐션 너무 좋으시고 스킬 콜 정말 최고였어요! 다음에 또 만나요."
                className="w-full px-3.5 py-2.5 bg-slate-950 text-sm border border-slate-850 rounded-xl text-slate-200 placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/15 flex items-center gap-1.5 text-xs font-semibold">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Button Submit row */}
          <div className="flex gap-3 justify-end pt-2 border-t border-slate-800/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800 rounded-xl font-bold transition cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-extrabold accent-gradient flex items-center gap-1 hover:shadow-lg transition cursor-pointer"
            >
              <span>평가 완료 및 전송</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
