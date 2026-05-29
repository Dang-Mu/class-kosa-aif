import React, { useState } from 'react';
import { X, ShieldCheck, Lock, User, UserPlus, Flame, Check, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserAccount } from '../accounts';
import { AVATARS, AvatarIcon, AvatarOption } from '../avatars';

interface AuthModalProps {
  onClose: () => void;
  onLoginSuccess: (nickname: string) => void;
  accounts: Record<string, UserAccount>;
  onRegisterSuccess: (newAccount: UserAccount) => void;
  initialTab?: 'login' | 'signup';
}

export default function AuthModal({
  onClose,
  onLoginSuccess,
  accounts,
  onRegisterSuccess,
  initialTab = 'login'
}: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(initialTab);
  
  // Login states
  const [loginId, setLoginId] = useState('');
  const [loginPw, setLoginPw] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register states
  const [regId, setRegId] = useState('');
  const [regPw, setRegPw] = useState('');
  const [regNickname, setRegNickname] = useState('');
  const [selectedAvatarId, setSelectedAvatarId] = useState('av-gamepad');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const cleanId = loginId.trim().toLowerCase();
    const cleanPw = loginPw;

    if (!cleanId || !cleanPw) {
      setLoginError('아이디와 비밀번호를 모두 입력해 주세요.');
      return;
    }

    // Search accounts database for matching username & password
    const matchedAccount = Object.values(accounts).find(
      acc => acc.username.toLowerCase() === cleanId && acc.passwordVal === cleanPw
    );

    if (matchedAccount) {
      onLoginSuccess(matchedAccount.nickname);
      onClose();
    } else {
      // Check if trying to login with pre-existing usernames but incorrect passwords
      const usernameExists = Object.values(accounts).some(
        acc => acc.username.toLowerCase() === cleanId
      );
      if (usernameExists) {
        setLoginError('비밀번호가 올바르지 않습니다.');
      } else {
        setLoginError('가입되지 않은 아이디입니다. 회원가입을 이용해 주세요.');
      }
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    const cleanId = regId.trim().toLowerCase();
    const cleanPw = regPw.trim();
    const cleanNickname = regNickname.trim();

    if (!cleanId || !cleanPw || !cleanNickname) {
      setRegError('모든 정보를 빈칸 없이 채워주세요.');
      return;
    }

    if (cleanId.length < 3) {
      setRegError('아이디는 3글자 이상이어야 합니다.');
      return;
    }

    if (cleanPw.length < 4) {
      setRegError('비밀번호는 안전을 위해 최소 4자 이상 설정해 주세요.');
      return;
    }

    if (cleanNickname.length < 2 || cleanNickname.length > 8) {
      setRegError('닉네임은 2자 이상, 8자 이하로 입력해 주세요.');
      return;
    }

    // Check username duplicates
    const idTaken = Object.values(accounts).some(
      acc => acc.username.toLowerCase() === cleanId
    );
    if (idTaken) {
      setRegError('이미 존재하거나 사용 중인 아이디입니다.');
      return;
    }

    // Check nickname duplicates
    const nickTaken = Object.values(accounts).some(
      acc => acc.nickname.toLowerCase() === cleanNickname.toLowerCase()
    );
    if (nickTaken) {
      setRegError('이미 등록된 동명의 닉네임이 존재합니다.');
      return;
    }

    // Create Account
    const newAccount: UserAccount = {
      username: cleanId,
      passwordVal: cleanPw,
      nickname: cleanNickname,
      avatarId: selectedAvatarId
    };

    onRegisterSuccess(newAccount);
    setRegSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md" id="auth-modal-overlay">
      
      {/* Box container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-md bg-[#111827] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative"
        id="auth-modal-card"
      >
        {/* Background glow effects */}
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-indigo-505/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-purple-505/10 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header Row with Close */}
        <div className="flex items-center justify-between p-5 border-b border-slate-850 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <ShieldCheck className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm tracking-tight text-white font-display">게이머 게이트인</h2>
              <p className="text-[10px] text-slate-400">매칭 계정 생성 및 안전한 파티 사냥</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 px-2 text-xs bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition hover:scale-105 active:scale-95 cursor-pointer border border-slate-800"
            title="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        {!regSuccess && (
          <div className="flex border-b border-slate-850 p-1 bg-slate-950/40 relative z-10">
            <button
              onClick={() => {
                setActiveTab('login');
                setLoginError('');
              }}
              className={`flex-1 py-3 text-xs font-bold transition-all rounded-xl cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-slate-900 border border-slate-800 text-indigo-400 shadow-sm font-extrabold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              로그인 (Login)
            </button>
            <button
              onClick={() => {
                setActiveTab('signup');
                setRegError('');
              }}
              className={`flex-1 py-3 text-xs font-bold transition-all rounded-xl cursor-pointer ${
                activeTab === 'signup'
                  ? 'bg-slate-900 border border-slate-800 text-indigo-400 shadow-sm font-extrabold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              회원가입 (Sign Up)
            </button>
          </div>
        )}

        {/* Form Body Area */}
        <div className="p-6 relative z-10 max-h-[80vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            {regSuccess ? (
              <motion.div
                key="register-success-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center text-center py-6"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 mb-4 animate-[bounce_1s_infinite]">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-base font-extrabold text-slate-100">회원가입 완료!</h3>
                <p className="text-xs text-slate-400 mt-2 max-w-xs leading-relaxed">
                  <span className="text-indigo-400 font-bold">{regNickname}</span> 계정이 성공적으로 등록되었습니다. 아래 옵션에서 로그인 여부를 직접 선택할 수 있습니다.
                </p>

                <div className="mt-6 flex flex-col gap-2 w-full">
                  <button
                    type="button"
                    onClick={() => {
                      onLoginSuccess(regNickname);
                      onClose();
                    }}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-550 text-white rounded-xl text-xs font-bold tracking-wider transition shadow-md cursor-pointer"
                    id="register-instant-login-btn"
                  >
                    방금 생성한 계정으로 즉시 자동 로그인
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRegSuccess(false);
                      setActiveTab('login');
                      setLoginId(regId);
                      setLoginPw(regPw);
                      setLoginError('');
                    }}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-bold transition cursor-pointer"
                    id="register-go-to-login-btn"
                  >
                    직접 아이디 비밀번호 입력해 안전 로그인
                  </button>
                  <button
                    type="button"
                    onClick={() => onClose()}
                    className="w-full py-2 text-slate-500 hover:text-slate-400 text-xs font-semibold hover:underline cursor-pointer"
                    id="register-close-btn"
                  >
                    로그인하지 않고 게스트 유지하며 닫기
                  </button>
                </div>
              </motion.div>
            ) : activeTab === 'login' ? (
              /* --- LOGIN VIEW --- */
              <motion.form
                key="login-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15 }}
                onSubmit={handleLoginSubmit}
                className="space-y-4"
              >
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    <span>로그인 아이디</span>
                  </label>
                  <input
                    type="text"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    placeholder="아이디를 입력해 주세요 (예: choco, laon)"
                    className="w-full px-4 py-2 bg-slate-900/90 border border-slate-800 text-slate-200 placeholder-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 focus:border-transparent text-xs transition"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-indigo-400" />
                    <span>비밀번호 (PW)</span>
                  </label>
                  <input
                    type="password"
                    value={loginPw}
                    onChange={(e) => setLoginPw(e.target.value)}
                    placeholder="비밀번호 설정된 값을 적어주세요 (기본 '1234')"
                    className="w-full px-4 py-2 bg-slate-900/90 border border-slate-800 text-slate-200 placeholder-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 focus:border-transparent text-xs transition"
                  />
                </div>

                {loginError && (
                  <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-450 border border-rose-500/20 text-center text-[10px] font-semibold flex items-center justify-center gap-1.5 leading-snug">
                    <span>⚠️ {loginError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-550 active:scale-98 text-white rounded-xl text-xs font-bold tracking-wider font-display uppercase transition shadow-lg shadow-indigo-950 flex items-center justify-center gap-1 cursor-pointer"
                  id="auth-login-submit-btn"
                >
                  <Lock className="w-4 h-4 text-white" />
                  <span>매칭소 로그인</span>
                </button>

                {/* Helpful tips for quick testing */}
                <div className="mt-4 pt-4 border-t border-slate-850/60 bg-slate-950/20 p-3 rounded-xl">
                  <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wide flex items-center gap-1 mb-1 select-none">
                    <HelpCircle className="w-3 h-3" />
                    <span>테스트 빠른 로그인 가이드</span>
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 text-[9px] text-slate-400 font-mono">
                    <div>• 닉네임 [초코] : choco / 1234</div>
                    <div>• 닉네임 [라온] : laon / 1234</div>
                    <div>• 닉네임 [쿠키앤크림] : cookie / 1234</div>
                    <div>• 닉네임 [치킨사냥꾼] : chicken / 1234</div>
                  </div>
                </div>

              </motion.form>
            ) : (
              /* --- SIGNUP / REGISTER VIEW --- */
              <motion.form
                key="signup-form"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                onSubmit={handleRegisterSubmit}
                className="space-y-4"
              >
                {/* 1. Account User ID */}
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                    <UserPlus className="w-3.5 h-3.5 text-indigo-400" />
                    <span>희망 로그인 아이디 (3자 이상)</span>
                  </label>
                  <input
                    type="text"
                    value={regId}
                    onChange={(e) => setRegId(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                    placeholder="영문 소문자 및 숫자 조합 입력"
                    maxLength={15}
                    className="w-full px-4 py-2 bg-slate-900/90 border border-slate-800 text-slate-200 placeholder-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 focus:border-transparent text-xs transition font-mono"
                    autoFocus
                  />
                </div>

                {/* 2. Account Password */}
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-indigo-400" />
                    <span>비밀번호 설정 (4자 이상)</span>
                  </label>
                  <input
                    type="password"
                    value={regPw}
                    onChange={(e) => setRegPw(e.target.value)}
                    placeholder="비밀번호를 입력해 주세요"
                    className="w-full px-4 py-2 bg-slate-900/90 border border-slate-800 text-slate-200 placeholder-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 focus:border-transparent text-xs transition"
                  />
                </div>

                {/* 3. Display Nickname */}
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    <span>플레이어 닉네임 설정 (2-8자)</span>
                  </label>
                  <input
                    type="text"
                    value={regNickname}
                    onChange={(e) => setRegNickname(e.target.value.trim().slice(0, 10))}
                    placeholder="보드에 표시될 고유 게이머명"
                    maxLength={10}
                    className="w-full px-4 py-2 bg-slate-900/90 border border-slate-800 text-slate-200 placeholder-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 focus:border-transparent text-xs transition"
                  />
                  <p className="text-[9px] text-slate-500 mt-1 pl-1 leading-snug">
                    * 닉네임은 다른 게이머가 나를 알아볼 때 사용할 고유 이름입니다.
                  </p>
                </div>

                {/* 4. Avatar Icon Setting (Choose from multiples!) */}
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      <span>소지품 / 아바타 아이콘 설정</span>
                    </span>
                    <span className="text-[9px] text-indigo-400 font-bold font-mono">10종 다채로운 테마</span>
                  </label>

                  {/* Icon Grid Choice */}
                  <div className="grid grid-cols-5 gap-1.5 p-2 bg-slate-900/50 border border-slate-800 rounded-2xl">
                    {AVATARS.map((item) => {
                      const isSelected = selectedAvatarId === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSelectedAvatarId(item.id)}
                          className={`relative aspect-square rounded-xl bg-gradient-to-br ${item.bgClass} flex flex-col items-center justify-center border transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                            isSelected 
                              ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-900 opacity-100 scale-102 border-transparent' 
                              : 'opacity-55 hover:opacity-100'
                          }`}
                          title={item.name}
                        >
                          <AvatarIcon name={item.iconName} className={`w-5 h-5 ${item.textColor}`} />
                          
                          {isSelected && (
                            <span className="absolute -top-1 -right-1 bg-indigo-650 text-white rounded-full p-0.5 border border-slate-905 scale-90 flex items-center justify-center">
                              <Check className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Selected avatar name feedback */}
                  <div className="mt-1.5 text-[9px] text-slate-400 font-semibold text-right flex justify-end items-center gap-1 select-none pr-1">
                    <span>현재 선택:</span>
                    <span className="text-white bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700 font-bold scale-95">
                      {AVATARS.find(a => a.id === selectedAvatarId)?.name}
                    </span>
                  </div>
                </div>

                {regError && (
                  <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-450 border border-rose-500/20 text-center text-[10px] font-semibold flex items-center justify-center gap-1.5 leading-snug">
                    <span>⚠️ {regError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:brightness-110 active:scale-98 text-white rounded-xl text-xs font-bold tracking-wider font-display uppercase transition shadow-lg shadow-indigo-950 flex items-center justify-center gap-1 cursor-pointer"
                  id="auth-register-submit-btn"
                >
                  <UserPlus className="w-4 h-4 text-white" />
                  <span>새 계정 생성 및 게이트 완료</span>
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

      </motion.div>
    </div>
  );
}
