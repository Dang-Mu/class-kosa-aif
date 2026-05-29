import React from 'react';
import { Gamepad2, Swords, Shield, Trophy, Flame, Zap, Crown, Target, Skull, Ghost, User } from 'lucide-react';

export interface AvatarOption {
  id: string;
  name: string;
  iconName: string; 
  bgClass: string;
  textColor: string;
}

export const GUEST_AVATAR: AvatarOption = {
  id: 'av-guest',
  name: '게스트 👤',
  iconName: 'User',
  bgClass: 'from-slate-650 to-slate-850 border-slate-600/30',
  textColor: 'text-slate-300'
};

export const AVATARS: AvatarOption[] = [
  { id: 'av-gamepad', name: '게임패드 🎮', iconName: 'Gamepad2', bgClass: 'from-indigo-600 to-indigo-850 border-indigo-500/30', textColor: 'text-indigo-200' },
  { id: 'av-swords', name: '쌍검 ⚔️', iconName: 'Swords', bgClass: 'from-rose-600 to-rose-850 border-rose-500/30', textColor: 'text-rose-200' },
  { id: 'av-shield', name: '방패 🛡️', iconName: 'Shield', bgClass: 'from-cyan-600 to-cyan-850 border-cyan-500/30', textColor: 'text-cyan-200' },
  { id: 'av-trophy', name: '트로피 🏆', iconName: 'Trophy', bgClass: 'from-amber-500 to-amber-750 border-amber-500/30', textColor: 'text-amber-100' },
  { id: 'av-flame', name: '파이어 🔥', iconName: 'Flame', bgClass: 'from-orange-500 to-orange-750 border-orange-500/30', textColor: 'text-orange-100' },
  { id: 'av-zap', name: '썬더 ⚡', iconName: 'Zap', bgClass: 'from-violet-600 to-violet-850 border-violet-500/30', textColor: 'text-violet-200' },
  { id: 'av-crown', name: '크라운 👑', iconName: 'Crown', bgClass: 'from-purple-600 to-purple-850 border-purple-500/30', textColor: 'text-purple-200' },
  { id: 'av-target', name: '조준경 🎯', iconName: 'Target', bgClass: 'from-emerald-600 to-emerald-850 border-emerald-500/30', textColor: 'text-emerald-200' },
  { id: 'av-skull', name: '스컬 💀', iconName: 'Skull', bgClass: 'from-slate-700 to-slate-850 border-slate-650/30', textColor: 'text-slate-200' },
  { id: 'av-ghost', name: '고스트 👻', iconName: 'Ghost', bgClass: 'from-fuchsia-600 to-fuchsia-850 border-fuchsia-500/30', textColor: 'text-fuchsia-200' }
];

export function getAvatarById(id: string): AvatarOption {
  if (id === 'av-guest') return GUEST_AVATAR;
  return AVATARS.find(a => a.id === id) || AVATARS[0];
}

export function getDeterministicAvatarId(nickname: string): string {
  const keys = ['av-gamepad', 'av-swords', 'av-shield', 'av-trophy', 'av-flame', 'av-zap', 'av-crown', 'av-target', 'av-skull', 'av-ghost'];
  let sum = 0;
  for (let i = 0; i < nickname.length; i++) {
    sum += nickname.charCodeAt(i);
  }
  return keys[sum % keys.length];
}

interface AvatarIconProps {
  name: string;
  className?: string;
}

export function AvatarIcon({ name, className }: AvatarIconProps) {
  switch (name) {
    case 'User':
      return React.createElement(User, { className });
    case 'Gamepad2':
      return React.createElement(Gamepad2, { className });
    case 'Swords':
      return React.createElement(Swords, { className });
    case 'Shield':
      return React.createElement(Shield, { className });
    case 'Trophy':
      return React.createElement(Trophy, { className });
    case 'Flame':
      return React.createElement(Flame, { className });
    case 'Zap':
      return React.createElement(Zap, { className });
    case 'Crown':
      return React.createElement(Crown, { className });
    case 'Target':
      return React.createElement(Target, { className });
    case 'Skull':
      return React.createElement(Skull, { className });
    case 'Ghost':
      return React.createElement(Ghost, { className });
    default:
      return React.createElement(Gamepad2, { className });
  }
}
