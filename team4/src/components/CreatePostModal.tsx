import React, { useState } from 'react';
import { X, Check, Gamepad2, Clock, Trophy, Shield, MessageCircle } from 'lucide-react';
import { GameType, TimeType, LevelType } from '../types';
import { GAMES, TIMES, LEVELS, POSITIONS } from '../data';
import { motion } from 'motion/react';
import { getGameIcon, getRoleIcon } from './GameRoleIcons';

interface CreatePostModalProps {
  onClose: () => void;
  onSubmit: (data: {
    nickname: string;
    game: string;
    time: TimeType;
    level: LevelType;
    position: string;
    message: string;
  }) => void;
  currentUser: string;
}

export default function CreatePostModal({ onClose, onSubmit, currentUser }: CreatePostModalProps) {
  const [selectedGame, setSelectedGame] = useState<GameType | '기타'>('발로란트');
  const [customGame, setCustomGame] = useState('');
  const [selectedTime, setSelectedTime] = useState<TimeType>('오후');
  const [selectedLevel, setSelectedLevel] = useState<LevelType>('중수');
  const [selectedPosition, setSelectedPosition] = useState<string>('올라운더');
  const [customPosition, setCustomPosition] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalGameName = selectedGame === '기타' ? customGame.trim() : selectedGame;
    
    if (!finalGameName) {
      setError('모집할 게임명을 입력해주세요.');
      return;
    }

    const finalPositionName = selectedPosition === '기타' ? customPosition.trim() : selectedPosition;
    if (!finalPositionName) {
      setError('원하는 포지션이나 역할군을 설정해주세요.');
      return;
    }
    
    const cleanMessage = message.trim();
    if (!cleanMessage) {
      setError('함께 할 친구에게 하고 싶은 말을 작성해주세요 (최소 2자 이상).');
      return;
    }

    if (cleanMessage.length < 5) {
      setError('요청 사항(한마디)을 조금 더 상세하게 적어주세요 (5자 이상).');
      return;
    }

    onSubmit({
      nickname: currentUser,
      game: finalGameName,
      time: selectedTime,
      level: selectedLevel,
      position: finalPositionName,
      message: cleanMessage,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="create-post-modal-overlay">
      {/* Background overlay */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />

      {/* Modal content container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25 }}
        className="relative w-full max-w-lg glass-panel rounded-3xl shadow-2xl p-6 md:p-8 z-10 overflow-y-auto max-h-[90vh]"
        id="create-post-modal"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 md:top-6 md:right-6 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 p-2 rounded-xl transition cursor-pointer"
          id="close-modal-btn"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <span className="px-2.5 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold rounded-md tracking-widest uppercase">
            Recruitment Board
          </span>
          <h2 className="text-xl md:text-2xl font-bold font-display text-slate-100 mt-1 flex items-center gap-2">
            🎮 새로운 대원 모집하기
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            닉네임 <span className="text-indigo-400 font-bold">{currentUser}</span>님으로 모집글을 등록합니다.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Game Selection */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 flex items-center gap-1.5 label-game">
              <Gamepad2 className="w-4 h-4 text-indigo-400" />
              <span>플레이할 게임 선택</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {GAMES.map(game => {
                const isSelected = selectedGame === game;
                return (
                  <button
                    key={game}
                    type="button"
                    onClick={() => {
                      setSelectedGame(game);
                      setError('');
                    }}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-400 text-white shadow-md'
                        : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                    id={`modal-game-${game}`}
                  >
                    {getGameIcon(game, "w-4 h-4 shrink-0")}
                    <span>{game}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Game Text Input if '기타' selected */}
            {selectedGame === '기타' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="pt-1"
              >
                <input
                  type="text"
                  placeholder="예: 스타크래프트, 서든어택 (최대 12자)"
                  value={customGame}
                  onChange={(e) => {
                    setCustomGame(e.target.value.slice(0, 12));
                    setError('');
                  }}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-755 rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  maxLength={12}
                  required
                  id="custom-game-input"
                />
              </motion.div>
            )}
          </div>

          {/* Time Slot Selection */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 flex items-center gap-1.5 label-time">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>선호 활성화 시간대</span>
            </label>
            <div className="flex gap-2">
              {TIMES.map(time => {
                const isSelected = selectedTime === time;
                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setSelectedTime(time)}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-400 text-white shadow-md'
                        : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                    id={`modal-time-${time}`}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Skill Level Selection */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 flex items-center gap-1.5 label-level">
              <Trophy className="w-4 h-4 text-indigo-400" />
              <span>권장 실력 등급</span>
            </label>
            <div className="flex gap-2">
              {LEVELS.map(lvl => {
                const isSelected = selectedLevel === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSelectedLevel(lvl || '중수')}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-400 text-white shadow-md'
                        : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                    id={`modal-level-${lvl}`}
                  >
                    {lvl}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Position / Role Selection */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 flex items-center gap-1.5 label-position">
              <Shield className="w-4 h-4 text-indigo-400" />
              <span>원하는 역할 / 포지션</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {POSITIONS.map(pos => {
                const isSelected = selectedPosition === pos;
                return (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => {
                      setSelectedPosition(pos);
                      setError('');
                    }}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-400 text-white shadow-md'
                        : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                    id={`modal-position-${pos}`}
                  >
                    {getRoleIcon(pos, "w-3.5 h-3.5 shrink-0")}
                    <span>{pos}</span>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => {
                  setSelectedPosition('기타');
                  setError('');
                }}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all cursor-pointer ${
                  selectedPosition === '기타'
                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-md'
                    : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
                id="modal-position-custom"
              >
                직접 입력
              </button>
            </div>

            {selectedPosition === '기타' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="pt-1"
              >
                <input
                  type="text"
                  placeholder="예: 탑라이너, 서브딜러 등 (최대 10자)"
                  value={customPosition}
                  onChange={(e) => {
                    setCustomPosition(e.target.value.slice(0, 10));
                    setError('');
                  }}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  maxLength={10}
                  required
                  id="custom-position-input"
                />
              </motion.div>
            )}
          </div>

          {/* Introduce Word (Message) */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 flex items-center gap-1.5 label-message">
              <MessageCircle className="w-4 h-4 text-indigo-400" />
              <span>상세 소개글 및 참가조건 (한마디)</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setError('');
              }}
              placeholder="예: 욕설 안 하고 웃으며 하실 분위기 좋은 비매너 없는 성인 힐러 모십니다. 칼퇴 후 저녁 8시부터 같이 고정으로 즐기실 분!"
              rows={4}
              maxLength={200}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-750 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent transition"
              id="modal-message-textarea"
            />
            <div className="flex justify-between items-center text-[11px] text-slate-500">
              <span>욕설 및 비난 유저는 매칭 제명 대상입니다.</span>
              <span>{message.length} / 200자</span>
            </div>
          </div>

          {error && (
            <p className="text-xs text-rose-400 font-semibold bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg">
              ⚠️ {error}
            </p>
          )}

          {/* Submit Button Row */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-slate-800 rounded-xl transition text-sm font-semibold cursor-pointer"
              id="cancel-modal-btn"
            >
              닫기
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition text-sm font-semibold flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/20 cursor-pointer"
              id="submit-modal-btn"
            >
              <Check className="w-4 h-4" />
              <span>모집글 게시하기</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
