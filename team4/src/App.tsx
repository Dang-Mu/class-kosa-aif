import React, { useState, useEffect } from 'react';
import { Gamepad2, Plus, Users, Swords, Sparkles, FolderOpen, AlertCircle, MessageSquare, SlidersHorizontal, Filter, Award, ShieldCheck, Heart, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Post, Applicant, GameType, TimeType, LevelType } from './types';
import { INITIAL_POSTS } from './data';

import { INITIAL_REPUTATIONS, UserReputation, getTierForPoints } from './reputation';
import ActiveUserSelector from './components/ActiveUserSelector';
import { UserAccount, INITIAL_ACCOUNTS } from './accounts';
import AuthModal from './components/AuthModal';
import PostCard from './components/PostCard';
import FilterBar from './components/FilterBar';
import CreatePostModal from './components/CreatePostModal';
import MyApplicationsPanel from './components/MyApplicationsPanel';
import RatingModal from './components/RatingModal';
import GamerProfileModal from './components/GamerProfileModal';

export default function App() {
  // --- Persistent Local States ---
  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem('gg_lounge_posts');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_POSTS;
  });

  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    const saved = localStorage.getItem('gg_lounge_user');
    if (saved === '초코') return null;
    return saved || null;
  });

  const [accounts, setAccounts] = useState<Record<string, UserAccount>>(() => {
    const saved = localStorage.getItem('gg_lounge_accounts');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return INITIAL_ACCOUNTS;
  });

  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup' | null>(null);

  // --- Reputation / Gamer Karma Rating System ---
  const [userReputations, setUserReputations] = useState<Record<string, UserReputation>>(() => {
    const saved = localStorage.getItem('gg_lounge_reputations');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_REPUTATIONS;
  });

  const [ratedMatchKeys, setRatedMatchKeys] = useState<string[]>(() => {
    const saved = localStorage.getItem('gg_lounge_rated_matches');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [];
  });

  // --- Modal Open Controller States ---
  const [profileToView, setProfileToView] = useState<UserReputation | null>(null);
  const [ratingMatchParams, setRatingMatchParams] = useState<{ postId: number; fromUser: string; toUser: string } | null>(null);

  // --- UI Interactivity States ---
  const [activeTab, setActiveTab] = useState<'board' | 'applications'>('board');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // --- Dynamic Filtering States ---
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [selectedTimes, setSelectedTimes] = useState<TimeType[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<LevelType[]>([]);
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('gg_lounge_theme');
    return (saved as 'light' | 'dark') || 'dark';
  });

  // --- Sync with localStorage ---
  useEffect(() => {
    localStorage.setItem('gg_lounge_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('gg_lounge_theme', theme);
    const root = document.getElementById('app-root-container');
    if (root) {
      if (theme === 'light') {
        root.classList.add('light-theme');
        document.documentElement.classList.add('light-theme');
      } else {
        root.classList.remove('light-theme');
        document.documentElement.classList.remove('light-theme');
      }
    }
  }, [theme]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('gg_lounge_user', currentUser);
    } else {
      localStorage.removeItem('gg_lounge_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('gg_lounge_reputations', JSON.stringify(userReputations));
  }, [userReputations]);

  useEffect(() => {
    localStorage.setItem('gg_lounge_rated_matches', JSON.stringify(ratedMatchKeys));
  }, [ratedMatchKeys]);

  useEffect(() => {
    localStorage.setItem('gg_lounge_accounts', JSON.stringify(accounts));
  }, [accounts]);

  // --- Compute Board Metrics ---
  const totalPostsCount = posts.length;
  const matchCompletedCount = posts.reduce((sum, post) => {
    const acceptedCount = post.applicants.filter(a => a.status === '수락됨').length;
    return sum + (acceptedCount > 0 ? 1 : 0);
  }, 0);

  // --- Filter Logic ---
  const filteredPosts = posts.filter(post => {
    if (selectedGames.length > 0 && !selectedGames.includes(post.game)) return false;
    if (selectedTimes.length > 0 && !selectedTimes.includes(post.time)) return false;
    if (selectedLevels.length > 0 && !selectedLevels.includes(post.level)) return false;
    if (selectedPositions.length > 0) {
      const pos = post.position || '올라운더';
      if (!selectedPositions.includes(pos)) return false;
    }
    return true;
  });

  // --- Helper to Open User Profile Card ---
  const handleOpenUserProfile = (nickname: string) => {
    let profile = userReputations[nickname];
    if (!profile) {
      profile = {
        nickname: nickname,
        points: 200, // starting gold baseline
        commendations: { friendly: 0, leader: 0, carry: 0, punctual: 0, flex: 0, positive: 0 },
        reviews: []
      };
      // Insert to user records
      setUserReputations(prev => ({
        ...prev,
        [nickname]: profile
      }));
    }
    setProfileToView(profile);
  };

  // --- Helper to Submit Real Match Review ---
  const handleRateUser = (pointsImpact: number, selectedCommendations: string[], comment: string) => {
    if (!ratingMatchParams) return;
    const { postId, fromUser, toUser } = ratingMatchParams;
    const matchKey = `${postId}-${fromUser}-${toUser}`;

    if (ratedMatchKeys.includes(matchKey)) return;

    setUserReputations(prev => {
      const existing = prev[toUser] || {
        nickname: toUser,
        points: 200,
        commendations: { friendly: 0, leader: 0, carry: 0, punctual: 0, flex: 0, positive: 0 },
        reviews: []
      };

      const newPoints = Math.max(0, existing.points + pointsImpact);
      const newCommendations = { ...existing.commendations };
      selectedCommendations.forEach(key => {
        if (key in newCommendations) {
          newCommendations[key as keyof typeof newCommendations]++;
        }
      });

      const newReview = {
        id: `rev-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        postId,
        fromUser,
        comment,
        commendationsSelected: selectedCommendations,
        createdAt: new Date().toISOString()
      };

      return {
        ...prev,
        [toUser]: {
          ...existing,
          points: newPoints,
          commendations: newCommendations,
          reviews: [newReview, ...existing.reviews]
        }
      };
    });

    setRatedMatchKeys(prev => [...prev, matchKey]);
    setRatingMatchParams(null);
  };

  // --- Core Handlers (MVP Actions) ---
  
  // 기능 1. 모집글 쓰기
  const handleCreatePost = (newPostData: {
    nickname: string;
    game: string;
    time: TimeType;
    level: LevelType;
    position: string;
    message: string;
  }) => {
    const newPost: Post = {
      id: Date.now(),
      nickname: newPostData.nickname,
      game: newPostData.game,
      time: newPostData.time,
      level: newPostData.level,
      position: newPostData.position,
      message: newPostData.message,
      createdAt: new Date().toISOString(),
      applicants: []
    };

    setPosts(prev => [newPost, ...prev]);
    setIsCreateModalOpen(false);
  };

  // 기능 4. 매칭 신청하기
  const handleApplyToPost = (postId: number, applyMsg: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post.id !== postId) return post;
        
        // Prevent applying multiple times
        const alreadyApplied = post.applicants.some(a => a.nickname === currentUser);
        if (alreadyApplied) return post;

        const newApplicant: Applicant = {
          id: `app-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          postId: postId,
          nickname: currentUser,
          message: applyMsg,
          status: '대기중',
          createdAt: new Date().toISOString()
        };

        return {
          ...post,
          applicants: [newApplicant, ...post.applicants]
        };
      })
    );
  };

  // 기능 5. 받은 신청 관리 (수락/거절)
  const handleUpdateApplicantStatus = (
    postId: number,
    applicantId: string,
    newStatus: '대기중' | '수락됨' | '거절됨'
  ) => {
    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post.id !== postId) return post;

        return {
          ...post,
          applicants: post.applicants.map(app => {
            if (app.id !== applicantId) return app;
            return { ...app, status: newStatus };
          })
        };
      })
    );
  };

  // Reset Filters helper
  const handleResetFilters = () => {
    setSelectedGames([]);
    setSelectedTimes([]);
    setSelectedLevels([]);
    setSelectedPositions([]);
  };

  const handleToggleGame = (game: string) => {
    setSelectedGames(prev =>
      prev.includes(game) ? prev.filter(g => g !== game) : [...prev, game]
    );
  };

  const handleToggleTime = (time: TimeType) => {
    setSelectedTimes(prev =>
      prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time]
    );
  };

  const handleToggleLevel = (lvl: LevelType) => {
    setSelectedLevels(prev =>
      prev.includes(lvl) ? prev.filter(l => l !== lvl) : [...prev, lvl]
    );
  };

  const handleTogglePosition = (pos: string) => {
    setSelectedPositions(prev =>
      prev.includes(pos) ? prev.filter(p => p !== pos) : [...prev, pos]
    );
  };

  const handleClearGames = () => setSelectedGames([]);
  const handleClearTimes = () => setSelectedTimes([]);
  const handleClearLevels = () => setSelectedLevels([]);
  const handleClearPositions = () => setSelectedPositions([]);

  const handleRegisterSuccess = (newAccount: UserAccount) => {
    setAccounts(prev => ({
      ...prev,
      [newAccount.nickname]: newAccount
    }));
  };

  const handleLoginSuccess = (nickname: string) => {
    setCurrentUser(nickname);
    // Auto-create base reputation record if missing
    if (!userReputations[nickname]) {
      setUserReputations(prev => ({
        ...prev,
        [nickname]: {
          nickname,
          points: 200,
          commendations: { friendly: 0, leader: 0, carry: 0, punctual: 0, flex: 0, positive: 0 },
          reviews: []
        }
      }));
    }
  };

  const handleLogout = () => {
    // Reset to temporary guest
    setCurrentUser(null);
  };
  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#0F172A] text-[#F8FAFC]' : 'bg-[#F1F5F9] text-[#1E293B]'} select-none pb-20 font-sans transition-colors duration-250`} id="app-root-container">
      
      {/* Decorative top ambient flow */}
      {theme === 'dark' && (
        <>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none select-none" />
          <div className="absolute top-[30vh] right-[10%] w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[150px] pointer-events-none select-none" />
        </>
      )}

      {/* Main Core Layout Wrapper */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 bg-transparent">
        
        {/* Navigation & Brand Header */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 mb-7 p-6 rounded-3xl glass-panel shadow-xl" id="brand-header">
          
          {/* logo & brand - clickable to reset filter views and navigate directly to main board list */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('board');
              setSelectedGames([]);
              setSelectedTimes([]);
              setSelectedLevels([]);
              setSelectedPositions([]);
            }}
            className="flex items-center gap-3 text-left focus:outline-none cursor-pointer group active:scale-98 transition-transform"
            title="전체 모집 게시판으로 즉시 이동 및 필터 초기화"
            id="brand-navigation-logo-btn"
          >
            <div className="w-12 h-12 rounded-2xl accent-gradient flex items-center justify-center border border-white/10 shadow-[0_0_20px_rgba(99,102,241,0.35)] group-hover:scale-105 active:scale-95 transition-all">
              <Gamepad2 className="w-7 h-7 text-white animate-[pulse_2.5s_infinite]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block animate-ping"></span>
                <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest font-mono">Real-time Matching Lounge</span>
              </div>
              <h1 className="text-2xl font-black font-display tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 flex items-center gap-2 group-hover:from-indigo-300 group-hover:to-purple-300 transition-all">
                GG.MATCH <span className="text-xs font-light text-slate-400 select-none">게임 친구 매칭소</span>
              </h1>
            </div>
          </button>

          {/* Right Header Panel containing Setting Controls and Core Statistics */}
          <div className="flex items-center gap-3 flex-wrap md:flex-nowrap justify-center md:justify-end">
            
            {/* Setting: Theme Toggle Selector */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-3 rounded-2xl bg-slate-950/30 hover:bg-slate-950/60 border border-slate-805/40 hover:text-indigo-400 transition-all duration-200 cursor-pointer flex items-center justify-center relative group shadow-inner"
              title={theme === 'dark' ? '라이트 모드(화이트)로 변경' : '다크 모드로 변경'}
              id="theme-toggle-btn"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400 animate-[spin_10s_linear_infinite]" />
              ) : (
                <Moon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              )}
            </button>

            {/* Core App statistics */}
            <div className="flex items-center gap-3 bg-slate-950/30 border border-slate-805/40 p-2 rounded-2xl max-w-sm">
              <div className="px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center flex-1 min-w-[95px]">
                <div className="text-[10px] text-slate-400 font-bold">활성 모집글</div>
                <div className="text-sm font-extrabold text-indigo-400 font-mono mt-0.5">{totalPostsCount}개</div>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center flex-1 min-w-[95px]">
                <div className="text-[10px] text-slate-400 font-bold">성사된 매칭</div>
                <div className="text-sm font-extrabold text-purple-400 font-mono mt-0.5">{matchCompletedCount}건</div>
              </div>
            </div>

          </div>
        </header>

        {/* Dynamic Multi-user Active Selector Panel */}
        <section className="mb-7" id="user-selector-sec">
          <ActiveUserSelector 
            currentUser={currentUser} 
            onUserChange={setCurrentUser} 
            posts={posts} 
            userReputations={userReputations}
            onOpenProfile={handleOpenUserProfile}
            accounts={accounts}
            onOpenAuthModal={(tab) => setAuthModalTab(tab || 'login')}
            onLogout={handleLogout}
          />
        </section>

        {/* Tab & Primary Actions Navigation Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 border-b border-white/5 pb-4" id="main-navigation-row">
          
          {/* Custom Gaming Selectable Tabs */}
          <div className="flex glass-panel p-1 rounded-2xl self-start sm:self-auto shadow-inner">
            <button
              onClick={() => setActiveTab('board')}
              className={`px-5 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2 transition-all duration-200 cursor-pointer select-none ${
                activeTab === 'board'
                  ? 'accent-gradient text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
              id="tab-board-btn"
            >
              <Swords className="w-4 h-4" />
              <span>전체 모집 게시판</span>
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`px-5 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2 transition-all duration-200 relative cursor-pointer select-none ${
                activeTab === 'applications'
                  ? 'accent-gradient text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
              id="tab-applications-btn"
            >
              <MessageSquare className="w-4 h-4" />
              <span>매칭 신청 관리</span>
              
              {/* Highlight dot if incoming pending matches exist */}
              {posts
                .filter(p => p.nickname === currentUser)
                .flatMap(p => p.applicants)
                .some(a => a.status === '대기중') && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              )}
            </button>
          </div>

          {/* Call to action "새 모집글 등록하기" button */}
          <button
            onClick={() => {
              if (!currentUser) {
                setAuthModalTab('login');
              } else {
                setIsCreateModalOpen(true);
              }
            }}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-full accent-gradient glow-btn-primary text-xs font-extrabold uppercase tracking-wider text-white hover:opacity-90 active:scale-95 transition-all cursor-pointer select-none border border-white/10"
            id="open-register-modal-btn"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>새 모집글 등록</span>
          </button>
        </div>

        {/* Dynamic Tab Views Rendering */}
        <main>
          <AnimatePresence mode="wait">
            
            {/* TAB 1: ALL RECRUITS BOARD */}
            {activeTab === 'board' && (
              <motion.div
                key="board-tab-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-4"
                id="board-view-container"
              >
                {/* Advanced Quick Filters & Toggler Control Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl glass-panel bg-slate-900/10 backdrop-blur-md" id="filter-control-panel">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      onClick={() => setIsFilterCollapsed(!isFilterCollapsed)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        isFilterCollapsed
                          ? 'bg-slate-950/40 border-slate-800 text-indigo-400 hover:text-indigo-300 hover:border-indigo-500/30'
                          : 'bg-indigo-600/10 border-indigo-500/20 text-indigo-300 hover:bg-indigo-600/20'
                      }`}
                      id="toggle-filter-sidebar-btn"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span>{isFilterCollapsed ? '상세 조건 필터 열기' : '필터 접어놓기'}</span>
                    </button>

                    {/* Horizontal Active Filter Chips */}
                    <div className="flex flex-wrap items-center gap-1.5 ml-1">
                      {(selectedGames.length > 0 || selectedTimes.length > 0 || selectedLevels.length > 0 || selectedPositions.length > 0) ? (
                        <>
                          <span className="text-[11px] text-slate-500 font-semibold select-none">적용됨:</span>
                          {selectedGames.map(game => (
                            <span key={game} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px] font-bold">
                              {game}
                              <button
                                onClick={() => handleToggleGame(game)}
                                className="hover:text-rose-400 font-bold ml-1 text-slate-400 cursor-pointer"
                                title="필터 삭제"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                          {selectedPositions.map(pos => (
                            <span key={pos} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-350 border border-emerald-500/20 text-[10px] font-bold">
                              {pos}
                              <button
                                onClick={() => handleTogglePosition(pos)}
                                className="hover:text-rose-400 font-bold ml-1 text-slate-400 cursor-pointer"
                                title="필터 삭제"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                          {selectedTimes.map(time => (
                            <span key={time} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px] font-bold">
                              {time}
                              <button
                                onClick={() => handleToggleTime(time)}
                                className="hover:text-rose-400 font-bold ml-1 text-slate-400 cursor-pointer"
                                title="필터 삭제"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                          {selectedLevels.map(lvl => (
                            <span key={lvl} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px] font-bold">
                              {lvl}
                              <button
                                onClick={() => handleToggleLevel(lvl)}
                                className="hover:text-rose-400 font-bold ml-1 text-slate-400 cursor-pointer"
                                title="필터 삭제"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                          <button
                            onClick={handleResetFilters}
                            className="text-[10px] font-bold text-rose-400 hover:underline hover:text-rose-300 ml-1.5 cursor-pointer"
                          >
                            모두 지우기
                          </button>
                        </>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold">
                          <SlidersHorizontal className="w-3 h-3 text-slate-600" />
                          <span>전체 리스트 조건 필터링 없음 (와이드뷰 지원)</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 font-semibold">
                    검색 결과: <span className="text-indigo-400 font-mono text-xs font-extrabold">{filteredPosts.length}</span>개 모집글
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start" id="board-grid-wrapper">
                  {/* Side Filters Panel */}
                  {!isFilterCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.15 }}
                      className="lg:col-span-1 lg:sticky lg:top-6 space-y-4"
                      id="feed-sidebar-filter"
                    >
                       <FilterBar
                        selectedGames={selectedGames}
                        onToggleGame={handleToggleGame}
                        onClearGames={handleClearGames}
                        selectedTimes={selectedTimes}
                        onToggleTime={handleToggleTime}
                        onClearTimes={handleClearTimes}
                        selectedLevels={selectedLevels}
                        onToggleLevel={handleToggleLevel}
                        onClearLevels={handleClearLevels}
                        selectedPositions={selectedPositions}
                        onTogglePosition={handleTogglePosition}
                        onClearPositions={handleClearPositions}
                        onReset={handleResetFilters}
                        resultsCount={filteredPosts.length}
                      />

                      {/* Gamer Guidelines Tips sidebar */}
                      <div className="p-4 rounded-3xl bg-slate-900/40 border border-slate-900 text-xs text-slate-400 leading-relaxed shadow-sm">
                        <div className="flex items-center gap-1 text-slate-300 font-bold mb-1.5 select-none font-display">
                          <Award className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                          <span>GG 게이머 신뢰 평점 카드</span>
                        </div>
                        <p className="mb-2">닉네임 옆의 티어 배지(<span className="text-yellow-400">골드, 플래티넘, 챌린저</span> 등)를 눌러보세요! 다른 유저들이 남긴 따뜻한 칭찬 리뷰와 신뢰 지수를 확인할 수 있습니다.</p>
                        <p className="text-indigo-300 font-semibold text-[10px]">⚠️ 악의적인 허위 평점을 방지하기 위해 오직 매칭이 성공한 동료끼리 복수로 한번씩만 평가 후기를 작성할 수 있습니다.</p>
                      </div>
                    </motion.div>
                  )}

                  {/* Main Recruits Cards Stream */}
                  <div className={isFilterCollapsed ? "lg:col-span-4" : "lg:col-span-3"} id="feed-stream-cards-column">
                    {filteredPosts.length > 0 ? (
                      <motion.div 
                        layout
                        className="flex flex-col gap-3.5 w-full"
                        id="filtered-posts-grid"
                      >
                        <AnimatePresence mode="popLayout">
                          {filteredPosts.map(post => (
                            <PostCard
                              key={post.id}
                              post={post}
                              currentUser={currentUser}
                              onApply={handleApplyToPost}
                              onUpdateApplicantStatus={handleUpdateApplicantStatus}
                              userReputations={userReputations}
                              onOpenProfile={handleOpenUserProfile}
                              onOpenRating={(postId, fromUser, toUser) => setRatingMatchParams({ postId, fromUser, toUser })}
                              ratedMatches={ratedMatchKeys}
                              accounts={accounts}
                              onOpenAuthModal={(tab) => setAuthModalTab(tab || 'login')}
                            />
                          ))}
                        </AnimatePresence>
                      </motion.div>
                    ) : (
                      /* Zero Filter Results Empty Dashboard State */
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center text-center py-20 bg-slate-900/30 border border-dashed border-slate-850 rounded-3xl"
                        id="empty-dashboard-state"
                      >
                        <FolderOpen className="w-14 h-14 text-slate-650 mb-4 bg-slate-900 p-3.5 rounded-2xl" />
                        <h3 className="text-lg font-bold text-slate-300 font-display">일치하는 모집글이 없습니다</h3>
                        <p className="text-xs text-slate-500 max-w-sm mt-1.5 leading-relaxed">
                          선택한 게임, 활동 시간 및 등급 필터에 알맞은 대원을 아직 모집하고 있지 않네요. 필터를 변경하거나 첫 모집을 시작해 보세요!
                        </p>
                        <button
                          onClick={handleResetFilters}
                          className="mt-5 px-4 py-2 bg-indigo-600/15 hover:bg-indigo-600/25 border border-indigo-500/25 text-indigo-300 hover:text-white rounded-xl transition text-xs font-bold cursor-pointer"
                          id="empty-reset-filters-btn"
                        >
                          조건 필터 해제하기
                        </button>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 2: RECEIVED & SENT APPLICATIONS */}
            {activeTab === 'applications' && (
              <motion.div
                key="applications-tab-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                id="applications-view-container"
              >
                <MyApplicationsPanel
                  currentUser={currentUser}
                  posts={posts}
                  onUpdateApplicantStatus={handleUpdateApplicantStatus}
                  userReputations={userReputations}
                  onOpenProfile={handleOpenUserProfile}
                  onOpenRating={(postId, fromUser, toUser) => setRatingMatchParams({ postId, fromUser, toUser })}
                  ratedMatches={ratedMatchKeys}
                  accounts={accounts}
                  onOpenAuthModal={(tab) => setAuthModalTab(tab || 'login')}
                />
              </motion.div>
            )}

          </AnimatePresence>
        </main>

        {/* Dynamic Modal Drawer overlay spawn */}
        <AnimatePresence>
          {authModalTab && (
            <AuthModal
              initialTab={authModalTab}
              onClose={() => setAuthModalTab(null)}
              accounts={accounts}
              onLoginSuccess={handleLoginSuccess}
              onRegisterSuccess={handleRegisterSuccess}
            />
          )}

          {isCreateModalOpen && (
            <CreatePostModal
              onClose={() => setIsCreateModalOpen(false)}
              onSubmit={handleCreatePost}
              currentUser={currentUser}
            />
          )}

          {/* Rating Assessment Modal Overlay */}
          {ratingMatchParams && (
            <RatingModal
              postId={ratingMatchParams.postId}
              fromUser={ratingMatchParams.fromUser}
              toUser={ratingMatchParams.toUser}
              onClose={() => setRatingMatchParams(null)}
              onSubmit={(reviewData) => handleRateUser(
                reviewData.pointsImpact,
                reviewData.selectedCommendations,
                reviewData.comment
              )}
            />
          )}

          {/* Detailed Gamer Reputation Card Profile Modal Overlay */}
          {profileToView && (
            <GamerProfileModal
              reputation={profileToView}
              onClose={() => setProfileToView(null)}
              accounts={accounts}
            />
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
