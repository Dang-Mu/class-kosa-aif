import React from 'react';

// VALORANT Icon
export const ValorantIcon = ({ className = "w-5 h-5", color = "currentColor" }: { className?: string; color?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M10 25 L45 25 L35 45 L10 45 Z" fill="#FF4655" />
    <path d="M90 25 L55 25 L45 45 L90 45 Z" fill="#FF4655" />
    <path d="M50 48 L70 85 L30 85 Z" fill="#FF4655" />
    <path d="M50 15 L50 35 L40 45 L30 35 Z" fill="#000000" fillOpacity="0.15" />
  </svg>
);

// League of Legends Gold Crest Logo
export const LolCrestIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Golden outer crest wings */}
    <path d="M14 34 C 30 20, 98 20, 114 34 C 105 70, 90 95, 64 114 C 38 95, 23 70, 14 34 Z" fill="url(#lol-gold-grad)" stroke="#C39E50" strokeWidth="4" />
    {/* Inner blue gem */}
    <path d="M64 35 L84 65 L64 95 L44 65 Z" fill="url(#lol-blue-grad)" stroke="#FFFFFF" strokeWidth="2" />
    <circle cx="64" cy="65" r="8" fill="#F1F5F9" />
    <defs>
      <linearGradient id="lol-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#D4AF37" />
        <stop offset="50%" stopColor="#AA7C11" />
        <stop offset="100%" stopColor="#F3E5AB" />
      </linearGradient>
      <linearGradient id="lol-blue-grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#1D4ED8" />
        <stop offset="100%" stopColor="#1E3A8A" />
      </linearGradient>
    </defs>
  </svg>
);

// Minecraft Pixel Block/Creeper Icon
export const MinecraftIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* 3D Isometric Grass Block */}
    <rect x="5" y="5" width="90" height="90" rx="15" fill="#14532D" stroke="#166534" strokeWidth="3" />
    {/* Creeper Face pixels */}
    <rect x="25" y="25" width="16" height="16" fill="#000000" />
    <rect x="59" y="25" width="16" height="16" fill="#000000" />
    <rect x="42" y="41" width="16" height="20" fill="#000000" />
    <rect x="34" y="52" width="32" height="24" fill="#000000" />
    <rect x="34" y="70" width="8" height="10" fill="#14532D" />
    <rect x="58" y="70" width="10" height="10" fill="#14532D" />
  </svg>
);

// Overwatch Team Crest Logo
export const OverwatchIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Outer circle */}
    <circle cx="64" cy="64" r="54" stroke="#94A3B8" strokeWidth="12" />
    {/* Orange accent top arcs */}
    <path d="M30 36 A 54 54 0 0 1 98 36" stroke="#F97316" strokeWidth="13" strokeLinecap="round" fill="none" />
    {/* Inner cross bars */}
    <path d="M42 94 L54 54 L74 54 L86 94" stroke="#94A3B8" strokeWidth="10" strokeLinecap="round" />
    <path d="M48 44 L64 74 L80 44" stroke="#475569" strokeWidth="8" strokeLinecap="round" />
  </svg>
);

// PUBG level-3 iron helmet
export const PubgIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Level-3 Welding Mask */}
    <rect x="20" y="15" width="60" height="70" rx="18" fill="#334155" stroke="#1E293B" strokeWidth="4" />
    {/* Dark visor shield cutout */}
    <rect x="28" y="28" width="44" height="14" rx="4" fill="#0F172A" stroke="#475569" strokeWidth="2" />
    {/* Visor slit grids */}
    <line x1="38" y1="31" x2="38" y2="39" stroke="#94A3B8" strokeWidth="2" />
    <line x1="44" y1="31" x2="44" y2="39" stroke="#94A3B8" strokeWidth="2" />
    <line x1="50" y1="31" x2="50" y2="39" stroke="#94A3B8" strokeWidth="2" />
    <line x1="56" y1="31" x2="56" y2="39" stroke="#94A3B8" strokeWidth="2" />
    <line x1="62" y1="31" x2="62" y2="39" stroke="#94A3B8" strokeWidth="2" />
    {/* Rust/metal plate updates */}
    <path d="M20 55 H80" stroke="#1E293B" strokeWidth="3" />
    <circle cx="28" cy="65" r="3" fill="#94A3B8" />
    <circle cx="72" cy="65" r="3" fill="#94A3B8" />
    <path d="M38 72 H62" stroke="#E2E8F0" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

// Lost Ark emblem
export const LostArkIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Double metallic wings pointing downwards */}
    <path d="M24 16 C30 50, 54 90, 64 114 C74 90, 98 50, 104 16 C84 24, 74 34, 64 54 C54 34, 44 24, 24 16 Z" fill="url(#la-metal-grad)" stroke="#4338CA" strokeWidth="3" />
    {/* Glowing indigo core star */}
    <path d="M64 42 L69 57 L84 57 L72 67 L77 82 L64 72 L51 82 L56 67 L44 57 L59 57 Z" fill="#818CF8" className="animate-pulse" />
    <defs>
      <linearGradient id="la-metal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4F46E5" />
        <stop offset="50%" stopColor="#1E1B4B" />
        <stop offset="100%" stopColor="#312E81" />
      </linearGradient>
    </defs>
  </svg>
);

// Cyberpunk glowing gamepad console icon representing generic games
export const CyberpunkGamepadIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g filter="url(#cyan-glow)">
      <path d="M15 45 C15 30, 85 30, 85 45 C85 75, 70 85, 50 85 C30 85, 15 75, 15 45 Z" fill="#0891B2" stroke="#22D3EE" strokeWidth="3" />
      <circle cx="32" cy="52" r="5" fill="#EC4899" />
      <circle cx="45" cy="52" r="5" fill="#3B82F6" />
      <rect x="62" y="47" width="14" height="10" rx="2" fill="#22D3EE" />
      <rect x="69" y="40" width="11" height="11" rx="2" fill="#E11D48" />
    </g>
    <defs>
      <filter id="cyan-glow" x="-10%" y="-10%" width="120%" height="120%">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
  </svg>
);

// GETTER FOR GAME ICONS
export const getGameIcon = (game: string, className = "w-6 h-6 inline-block") => {
  const normGame = game.trim();
  if (normGame.includes('발로란트') || normGame.toLowerCase().includes('valorant')) {
    return <ValorantIcon className={className} />;
  }
  if (normGame.includes('롤') || normGame.toLowerCase().includes('league') || normGame.toLowerCase() === 'lol') {
    return <LolCrestIcon className={className} />;
  }
  if (normGame.includes('마크') || normGame.toLowerCase().includes('minecraft') || normGame.includes('마인크')) {
    return <MinecraftIcon className={className} />;
  }
  if (normGame.includes('오버워치') || normGame.toLowerCase().includes('overwatch')) {
    return <OverwatchIcon className={className} />;
  }
  if (normGame.includes('배틀구') || normGame.includes('배그') || normGame.toLowerCase().includes('pubg')) {
    return <PubgIcon className={className} />;
  }
  if (normGame.includes('로스트아크') || normGame.includes('로아') || normGame.toLowerCase().includes('lostark')) {
    return <LostArkIcon className={className} />;
  }
  return <CyberpunkGamepadIcon className={className} />;
};


// ==================== ROLE/POSITION ICONS ====================

// Shield style for Tank/Assault
export const TankShieldIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M15 15 C45 5, 55 5, 85 15 C85 55, 50 85, 50 95 C50 85, 15 55, 15 15 Z" fill="#1D4ED8" stroke="#3B82F6" strokeWidth="4" />
    <path d="M50 25 L70 45 H30 Z" fill="#60A5FA" />
    <line x1="50" y1="45" x2="50" y2="75" stroke="#60A5FA" strokeWidth="4" />
  </svg>
);

// Crossed swords or razor blade sharp emblem for DPS Dealers
export const DpsSwordIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Sword 1 */}
    <path d="M15 85 L75 25 L85 15 C87 13, 87 9, 85 7 C83 5, 79 5, 77 7 L67 17 L7 77 L15 85 Z" fill="#DC2626" />
    <path d="M72 28 L64 20" stroke="#FF8A8A" strokeWidth="4" />
    <path d="M18 70 L25 78" stroke="#1E293B" strokeWidth="6" />
    
    {/* Sword 2 */}
    <path d="M85 85 L25 25 L15 15 C13 13, 13 9, 15 7 C17 5, 21 5, 23 7 L33 17 L93 77 L85 85 Z" fill="#EF4444" />
    <path d="M28 28 L36 20" stroke="#FF8A8A" strokeWidth="4" />
    <path d="M82 70 L75 78" stroke="#1E293B" strokeWidth="6" />

    <circle cx="50" cy="50" r="10" fill="#FACC15" />
  </svg>
);

// Green heart / Cross for Healer
export const HealerCrossIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Emerald Heart */}
    <path d="M12 35 C12 15, 48 15, 50 35 C52 15, 88 15, 88 35 C88 65, 50 85, 50 90 C50 85, 12 65, 12 35 Z" fill="#059669" stroke="#34D399" strokeWidth="4" />
    {/* White Cross */}
    <rect x="44" y="27" width="12" height="30" rx="2" fill="#FFFFFF" />
    <rect x="35" y="36" width="30" height="12" rx="2" fill="#FFFFFF" />
  </svg>
);

// Star magic wand / Support lantern
export const SupportWandIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <line x1="20" y1="80" x2="65" y2="35" stroke="#7C3AED" strokeWidth="8" strokeLinecap="round" />
    <line x1="20" y1="80" x2="35" y2="65" stroke="#C084FC" strokeWidth="4" />
    {/* Glowing golden star */}
    <path d="M75 12 L79 26 L93 26 L82 34 L86 48 L75 39 L64 48 L68 34 L57 26 L71 26 Z" fill="#FBBF24" stroke="#F59E0B" strokeWidth="2" />
    <circle cx="75" cy="28" r="4" fill="#FFFFFF" className="animate-ping" />
  </svg>
);

// Infinity loops / all rounder starburst
export const FlexAllRounderIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M25 50 C5 30, 5 70, 25 50 C45 30, 45 70, 25 50 Z" stroke="#06B6D4" strokeWidth="8" strokeLinecap="round" />
    <path d="M75 50 C55 30, 55 70, 75 50 C95 30, 95 70, 75 50 Z" stroke="#6366F1" strokeWidth="8" strokeLinecap="round" />
    <circle cx="50" cy="50" r="12" fill="#8B5CF6" />
    <path d="M50 42 L52 47 L58 47 L53 50 L55 56 L50 52 L45 56 L47 50 L42 47 L48 47 Z" fill="#FFFFFF" />
  </svg>
);

// GETTER FOR ROLE ICONS
export const getRoleIcon = (role: string, className = "w-4 h-4 inline-block") => {
  const normRole = role.trim();
  if (normRole.includes('탱커') || normRole.includes('돌격') || normRole.includes('방어')) {
    return <TankShieldIcon className={className} />;
  }
  if (normRole.includes('딜러') || normRole.includes('격수') || normRole.includes('공격') || normRole.includes('원딜') || normRole.includes('근딜')) {
    return <DpsSwordIcon className={className} />;
  }
  if (normRole.includes('힐러') || normRole.includes('지원') || normRole.includes('케어')) {
    return <HealerCrossIcon className={className} />;
  }
  if (normRole.includes('서폿') || normRole.includes('보조') || normRole.includes('시너지')) {
    return <SupportWandIcon className={className} />;
  }
  return <FlexAllRounderIcon className={className} />;
};
