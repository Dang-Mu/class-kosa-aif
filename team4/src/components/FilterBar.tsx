import React from 'react';
import { SlidersHorizontal, Gamepad2, Clock, Trophy, Shield, RefreshCw } from 'lucide-react';
import { TimeType, LevelType } from '../types';
import { GAMES, TIMES, LEVELS, POSITIONS } from '../data';
import { getGameIcon, getRoleIcon } from './GameRoleIcons';

interface FilterBarProps {
  selectedGames: string[];
  onToggleGame: (game: string) => void;
  onClearGames: () => void;
  selectedTimes: TimeType[];
  onToggleTime: (time: TimeType) => void;
  onClearTimes: () => void;
  selectedLevels: LevelType[];
  onToggleLevel: (lvl: LevelType) => void;
  onClearLevels: () => void;
  selectedPositions: string[];
  onTogglePosition: (pos: string) => void;
  onClearPositions: () => void;
  onReset: () => void;
  resultsCount: number;
}

export default function FilterBar({
  selectedGames,
  onToggleGame,
  onClearGames,
  selectedTimes,
  onToggleTime,
  onClearTimes,
  selectedLevels,
  onToggleLevel,
  onClearLevels,
  selectedPositions,
  onTogglePosition,
  onClearPositions,
  onReset,
  resultsCount,
}: FilterBarProps) {
  const hasActiveFilters = 
    selectedGames.length > 0 || 
    selectedTimes.length > 0 || 
    selectedLevels.length > 0 ||
    selectedPositions.length > 0;

  return (
    <div className="glass-panel rounded-3xl p-5 md:p-6 backdrop-blur-md" id="filter-bar-container">
      <div className="flex items-center justify-between mb-5 border-b border-slate-850 pb-3">
        <div className="flex items-center gap-2 text-slate-200 animate-fade-in">
          <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
          <h3 className="font-bold text-sm tracking-wide uppercase font-display">매칭 조건 필터</h3>
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-semibold border border-rose-500/10 hover:border-rose-500/30 px-2.5 py-1 rounded-lg transition-all cursor-pointer bg-rose-500/5"
            id="reset-filters-btn"
          >
            <RefreshCw className="w-3.5 h-3.5 animate-[spin_4s_linear_infinite]" />
            <span>필터 초기화</span>
          </button>
        )}
      </div>

      <div className="space-y-5">
        {/* Game Filter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <Gamepad2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>플레이할 게임</span>
            </span>
            {selectedGames.length > 0 && (
              <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/25 px-1.5 py-0.5 rounded-md font-mono select-none">
                {selectedGames.length} 선택됨
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={onClearGames}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border cursor-pointer transition-colors duration-150 ${
                selectedGames.length === 0
                  ? 'bg-indigo-600 border-indigo-400 text-white'
                  : 'bg-slate-950/30 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
              }`}
              id="filter-game-all"
            >
              전체 게임
            </button>
            {GAMES.map(game => {
              const isSelected = selectedGames.includes(game);
              return (
                <button
                  key={game}
                  onClick={() => onToggleGame(game)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border cursor-pointer transition-colors duration-150 flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 border-indigo-400 text-white shadow-sm shadow-indigo-950'
                      : 'bg-slate-950/30 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                  id={`filter-game-${game}`}
                >
                  {getGameIcon(game, "w-3.5 h-3.5 shrink-0")}
                  <span>{game}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Position / Role Filter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>희망 포지션 / 역할군</span>
            </span>
            {selectedPositions.length > 0 && (
              <span className="text-[10px] font-bold text-emerald-450 bg-emerald-500/10 border border-emerald-500/25 px-1.5 py-0.5 rounded-md font-mono select-none">
                {selectedPositions.length} 선택됨
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={onClearPositions}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border cursor-pointer transition-colors duration-150 ${
                selectedPositions.length === 0
                  ? 'bg-indigo-600 border-indigo-400 text-white'
                  : 'bg-slate-950/30 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
              }`}
              id="filter-position-all"
            >
              전체 포지션
            </button>
             {POSITIONS.map(pos => {
              const isSelected = selectedPositions.includes(pos);
              return (
                <button
                  key={pos}
                  onClick={() => onTogglePosition(pos)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border cursor-pointer transition-colors duration-150 flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 border-indigo-400 text-white shadow-sm shadow-indigo-950'
                      : 'bg-slate-950/30 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                  id={`filter-position-${pos}`}
                >
                  {getRoleIcon(pos, "w-3.5 h-3.5 shrink-0")}
                  <span>{pos}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Slot Filter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>선호 시간대</span>
            </span>
            {selectedTimes.length > 0 && (
              <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/25 px-1.5 py-0.5 rounded-md font-mono select-none">
                {selectedTimes.length} 선택됨
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={onClearTimes}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border cursor-pointer transition-colors duration-150 ${
                selectedTimes.length === 0
                  ? 'bg-indigo-600 border-indigo-400 text-white'
                  : 'bg-slate-950/30 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
              }`}
              id="filter-time-all"
            >
              전체 시간
            </button>
            {TIMES.map(time => {
              const isSelected = selectedTimes.includes(time);
              return (
                <button
                  key={time}
                  onClick={() => onToggleTime(time)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border cursor-pointer transition-colors duration-150 ${
                    isSelected
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 border-indigo-400 text-white shadow-sm shadow-indigo-950'
                      : 'bg-slate-950/30 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                  id={`filter-time-${time}`}
                >
                  {time}
                </button>
              );
            })}
          </div>
        </div>

        {/* Skill Level Filter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>희망 실력 등급</span>
            </span>
            {selectedLevels.length > 0 && (
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/25 px-1.5 py-0.5 rounded-md font-mono select-none">
                {selectedLevels.length} 선택됨
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={onClearLevels}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border cursor-pointer transition-colors duration-150 ${
                selectedLevels.length === 0
                  ? 'bg-indigo-600 border-indigo-400 text-white'
                  : 'bg-slate-950/30 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
              }`}
              id="filter-level-all"
            >
              전체 실력
            </button>
            {LEVELS.map(lvl => {
              const isSelected = selectedLevels.includes(lvl);
              return (
                <button
                  key={lvl}
                  onClick={() => onToggleLevel(lvl)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border cursor-pointer transition-colors duration-150 ${
                    isSelected
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 border-indigo-400 text-white shadow-sm shadow-indigo-950'
                      : 'bg-slate-950/30 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                  id={`filter-level-${lvl}`}
                >
                  {lvl}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-850 flex items-center justify-between text-xs font-medium text-slate-400">
        <span>필터링된 모집원</span>
        <span className="font-mono">
          총 <span className="text-indigo-400 font-bold text-sm">{resultsCount}</span>개 모집글
        </span>
      </div>
    </div>
  );
}
