'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import PageTransition from '@/components/PageTransition';
import {
  ArrowLeft, MapPin, ThumbsUp, MessageCircle, Send, Plus, X,
  Droplets, Filter, Clock, TrendingUp, User, ChevronDown,
  Home, Search, Bell, Settings, Bookmark, BarChart3, Users,
  MoreHorizontal, Repeat2, Share, Heart, BadgeCheck, ImageIcon, Check, Loader2, ImagePlus
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface CommunityPost {
  id: string;
  author: { name: string; avatar: string; phone: string; badges?: string[] };
  area: string;
  city: string;
  message: string;
  timestamp: number;
  upvotes: number;
  upvotedBy: string[];
  replies: CommunityReply[];
  tag: 'issue' | 'update' | 'tip' | 'question';
  image?: string;
}

interface CommunityReply {
  id: string;
  author: { name: string; avatar: string; phone: string };
  message: string;
  timestamp: number;
}

const STORAGE_KEY = 'civicpulse_community_posts';

const TAG_CONFIG = {
  issue: { label: 'Issue', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20', dotColor: 'bg-rose-500' },
  update: { label: 'Update', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dotColor: 'bg-emerald-500' },
  tip: { label: 'Tip', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20', dotColor: 'bg-cyan-500' },
  question: { label: 'Question', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', dotColor: 'bg-amber-500' },
};

const DEMO_POSTS: CommunityPost[] = [
  {
    id: 'cp-1001',
    author: { name: 'Priya Sharma', avatar: 'PS', phone: '9876543210' },
    area: 'Adyar, Gandhi Nagar',
    city: 'Chennai',
    message: 'No water supply since 6 AM today. Multiple houses in our street are affected. The tanker hasn\'t arrived either. Anyone else facing this? @CMWSSB #ChennaiWaterScarcity',
    timestamp: Date.now() - 3600000,
    upvotes: 24,
    upvotedBy: ['a', 'b', 'c'],
    replies: [
      {
        id: 'cr-1',
        author: { name: 'Rajesh Kumar', avatar: 'RK', phone: '9876543211' },
        message: 'Same here, 2nd Main Road. I\'ve already filed a complaint on CivicPulse. Complaint ID: CP-4821.',
        timestamp: Date.now() - 3200000,
      },
      {
        id: 'cr-2',
        author: { name: 'Lakshmi V', avatar: 'LV', phone: '9876543212' },
        message: 'Update: Municipal office said supply will resume by 2 PM. Pipeline repair underway near Elliot\'s Beach.',
        timestamp: Date.now() - 1800000,
      },
    ],
    tag: 'issue',
  },
  {
    id: 'cp-1002',
    author: { name: 'Amit Patel', avatar: 'AP', phone: '9876543220', badges: ['Verified'] },
    area: 'T. Nagar, Pondy Bazaar',
    city: 'Chennai',
    message: 'Water quality has significantly improved after last week\'s pipe replacement. The CivicPulse scan shows clean results now! Great work by the civic team @ChennaiCorp 💧✅ #cleanwater #CivicPulse',
    image: 'https://images.unsplash.com/photo-1541888046036-f10f44923e3e?q=80&w=600&auto=format&fit=crop',
    timestamp: Date.now() - 86400000,
    upvotes: 31,
    upvotedBy: ['d', 'e', 'f'],
    replies: [
      {
        id: 'cr-3',
        author: { name: 'Sunitha R', avatar: 'SR', phone: '9876543221' },
        message: 'Confirmed! My scan also shows turbidity at 8. Finally safe water after months. 🎉',
        timestamp: Date.now() - 72000000,
      },
    ],
    tag: 'update',
  },
  {
    id: 'cp-1003',
    author: { name: 'Kavitha M', avatar: 'KM', phone: '9876543230', badges: ['Top Contributor'] },
    area: 'Andheri West, Lokhandwala',
    city: 'Mumbai',
    message: 'Pro tip: If your water pressure is low in the morning, check if your building motor is running. Many societies have scheduled timings. You can ask your maintenance for the exact hours. #waterpressure #Mumbai',
    timestamp: Date.now() - 172800000,
    upvotes: 18,
    upvotedBy: ['g', 'h'],
    replies: [],
    tag: 'tip',
  },
  {
    id: 'cp-1004',
    author: { name: 'Deepak Raj', avatar: 'DR', phone: '9876543240' },
    area: 'Saket',
    city: 'New Delhi',
    message: 'Does anyone know the schedule for tanker delivery in Saket area? We\'ve been getting irregular supply for 3 days now.',
    timestamp: Date.now() - 259200000,
    upvotes: 9,
    upvotedBy: ['i'],
    replies: [
      {
        id: 'cr-4',
        author: { name: 'Neha Gupta', avatar: 'NG', phone: '9876543241' },
        message: 'Call the DJB helpline at 1916. They can give you the exact schedule for your zone.',
        timestamp: Date.now() - 240000000,
      },
    ],
    tag: 'question',
  },
  {
    id: 'cp-1005',
    author: { name: 'Arun S', avatar: 'AS', phone: '9876543250' },
    area: 'Adyar, Kasturba Nagar',
    city: 'Chennai',
    message: '⚠️ WARNING: Brown water coming from taps in Canal Bank Road area. Water scan showed turbidity of 72 and hazardous rating. Do NOT drink this water. I\'ve filed complaint WC-7283.',
    timestamp: Date.now() - 7200000,
    upvotes: 42,
    upvotedBy: ['j', 'k', 'l', 'm'],
    replies: [
      {
        id: 'cr-5',
        author: { name: 'Meena K', avatar: 'MK', phone: '9876543251' },
        message: 'Thank you for the alert! I was about to use it for cooking. Filing my complaint now too.',
        timestamp: Date.now() - 5400000,
      },
      {
        id: 'cr-6',
        author: { name: 'Srinivas P', avatar: 'SP', phone: '9876543252' },
        message: 'Metro construction might have damaged the pipeline. Same thing happened on LB Road last month.',
        timestamp: Date.now() - 3600000,
      },
    ],
    tag: 'issue',
  },
];

async function loadPostsFromAPI(): Promise<CommunityPost[]> {
  try {
    const res = await fetch('/api/community');
    if (!res.ok) throw new Error('Failed to fetch');
    return await res.json();
  } catch (err) {
    console.error('Failed to load posts:', err);
    return [];
  }
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

// Helper to parse #hashtags and @mentions
function renderMessageWithLinks(text: string) {
  const parts = text.split(/(#[a-zA-Z0-9_]+|@[a-zA-Z0-9_]+)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('#')) return <span key={i} className="text-cyan-400 hover:underline cursor-pointer font-medium">{part}</span>;
        if (part.startsWith('@')) return <span key={i} className="text-emerald-400 hover:underline cursor-pointer font-medium">{part}</span>;
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

/* ── Navigation Item ── */
function NavItem({ icon: Icon, label, active, badge, onClick }: {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  badge?: number;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-4 px-4 py-3 rounded-full transition-all hover:bg-white/[0.06] w-full text-left group ${active ? 'font-bold' : ''}`}
    >
      <div className="relative">
        <Icon className={`w-[22px] h-[22px] ${active ? 'text-white' : 'text-white/60 group-hover:text-white/80'}`} />
        {badge && badge > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-[9px] font-bold text-white flex items-center justify-center">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </div>
      <span className={`text-[15px] hidden xl:block ${active ? 'text-white' : 'text-white/60 group-hover:text-white/80'}`}>
        {label}
      </span>
    </button>
  );
}

/* ═══════════ Main Page ═══════════ */

export default function CommunityPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [showComposer, setShowComposer] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [newArea, setNewArea] = useState('');
  const [newTag, setNewTag] = useState<CommunityPost['tag']>('issue');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [activeTab, setActiveTab] = useState<'foryou' | 'following'>('foryou');
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [following, setFollowing] = useState<string[]>([]);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<string[]>([]);
  const [repostedPosts, setRepostedPosts] = useState<string[]>([]);
  const [newImage, setNewImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const replyInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadPostsFromAPI().then(setPosts);
    const stored = localStorage.getItem('civicpulse_following');
    if (stored) setFollowing(JSON.parse(stored));
  }, []);

  const toggleFollow = (phone: string) => {
    if (!user) { router.push('/login'); return; }
    setFollowing(prev => {
      const next = prev.includes(phone) ? prev.filter(p => p !== phone) : [...prev, phone];
      localStorage.setItem('civicpulse_following', JSON.stringify(next));
      return next;
    });
  };

  const toggleBookmark = (id: string) => setBookmarkedPosts(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleRepost = (id: string) => setRepostedPosts(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be smaller than 5MB");
      return;
    }
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      setNewImage(e.target?.result as string);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const filteredPosts = posts
    .filter(p => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!(p.message.toLowerCase().includes(q) || p.area.toLowerCase().includes(q) || p.author.name.toLowerCase().includes(q))) {
          return false;
        }
      }
      if (activeTab === 'following') {
        if (!user) return false;
        if (p.author.phone !== user.phone && !following.includes(p.author.phone)) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => sortBy === 'recent' ? b.timestamp - a.timestamp : b.upvotes - a.upvotes);

  const trendingAreas = (() => {
    const areaCount: Record<string, number> = {};
    posts.forEach(p => { areaCount[p.area] = (areaCount[p.area] || 0) + p.upvotes; });
    return Object.entries(areaCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  })();

  const handlePost = async () => {
    if (!user) { router.push('/login'); return; }
    if (!newMessage.trim() || !newArea.trim()) return;

    try {
      const res = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: { name: user.name, avatar: user.avatar, phone: user.phone },
          area: newArea,
          message: newMessage,
          tag: newTag,
          image: newImage,
        }),
      });
      const data = await res.json();
      if (data.post) {
        setPosts(prev => [data.post, ...prev]);
      }
    } catch (err) {
      console.error('Failed to create post:', err);
    }
    setNewMessage('');
    setNewArea('');
    setNewImage(null);
    setShowComposer(false);
  };

  const handleUpvote = async (postId: string) => {
    if (!user) { router.push('/login'); return; }
    // Optimistic UI update
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const alreadyVoted = p.upvotedBy.includes(user.phone);
        return {
          ...p,
          upvotes: alreadyVoted ? p.upvotes - 1 : p.upvotes + 1,
          upvotedBy: alreadyVoted
            ? p.upvotedBy.filter(id => id !== user.phone)
            : [...p.upvotedBy, user.phone],
        };
      }
      return p;
    }));
    // Persist to DB
    try {
      await fetch(`/api/community/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'upvote', userPhone: user.phone }),
      });
    } catch (err) {
      console.error('Failed to upvote:', err);
    }
  };

  const handleReply = async (postId: string) => {
    if (!user) { router.push('/login'); return; }
    if (!replyText.trim()) return;

    const reply = {
      author: { name: user.name, avatar: user.avatar, phone: user.phone },
      message: replyText,
    };

    // Optimistic UI
    const optimisticReply: CommunityReply = { id: `cr-${Date.now()}`, ...reply, timestamp: Date.now() };
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, replies: [...p.replies, optimisticReply] } : p
    ));
    setReplyText('');
    setReplyingTo(null);

    try {
      await fetch(`/api/community/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reply', reply }),
      });
    } catch (err) {
      console.error('Failed to reply:', err);
    }
  };

  return (
    <PageTransition>
      <main className="min-h-screen bg-[#050505] text-white">
        <div className="flex max-w-[1280px] mx-auto">
          {/* ═══════ Left Sidebar ═══════ */}
          <aside className="hidden md:flex flex-col w-[68px] xl:w-[260px] h-screen sticky top-0 border-r border-white/[0.06] px-3 xl:px-5 py-6 justify-between">
            <div className="space-y-1">
              {/* Logo */}
              <Link href="/#cta-section" className="flex items-center gap-3 px-3 py-3 mb-4">
                <Droplets className="w-7 h-7 text-emerald-400" />
                <span className="text-lg font-black tracking-tight hidden xl:block">CivicPulse</span>
              </Link>

              <NavItem icon={Home} label={t('comm.nav.home')} onClick={() => router.push('/')} />
              <NavItem icon={Search} label={t('comm.nav.explore')} />
              <NavItem icon={Bell} label={t('comm.nav.notifications')} />
              <NavItem icon={MessageCircle} label={t('comm.nav.community')} active />
              <NavItem icon={Bookmark} label={t('comm.nav.saved')} />
              <NavItem icon={BarChart3} label={t('comm.nav.analytics')} onClick={() => router.push('/analytics')} />
              <NavItem icon={Settings} label={t('comm.nav.settings')} />

              {/* Post button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (!user) { router.push('/login'); return; }
                  setShowComposer(true);
                }}
                className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-3 rounded-full flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/15 hover:shadow-emerald-500/30 transition-shadow"
              >
                <Plus className="w-5 h-5 xl:hidden" />
                <span className="hidden xl:block">{t('comm.composer.post')}</span>
              </motion.button>
            </div>

            {/* User profile */}
            {user ? (
              <div className="flex items-center gap-3 px-3 py-3 rounded-full hover:bg-white/[0.04] transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                  {user.avatar}
                </div>
                <div className="hidden xl:block flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{user.name}</p>
                  <p className="text-xs text-white/30 truncate">@{user.name.toLowerCase().replace(/\s/g, '')}</p>
                </div>
                <MoreHorizontal className="w-4 h-4 text-white/30 hidden xl:block" />
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-3 px-4 py-3 rounded-full bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-all"
              >
                <User className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-medium text-white/70 hidden xl:block">{t('comm.signin')}</span>
              </Link>
            )}
          </aside>

          {/* ═══════ Main Feed ═══════ */}
          <div className="flex-1 min-h-screen border-r border-white/[0.06] max-w-[600px]">
            {/* Top bar */}
            <div className="sticky top-0 z-30 bg-[#050505]/80 backdrop-blur-xl border-b border-white/[0.06]">
              <div className="flex items-center px-4 py-3 md:hidden">
                <Link href="/#cta-section" className="text-white/40 hover:text-white transition-colors">
                  <ArrowLeft size={20} />
                </Link>
                <div className="flex-1 flex items-center justify-center gap-2">
                  <Droplets className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold text-sm">Community</span>
                </div>
                {user ? (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-[10px] font-bold">
                    {user.avatar}
                  </div>
                ) : (
                  <Link href="/login" className="text-xs text-emerald-400 font-semibold">{t('comm.signin')}</Link>
                )}
              </div>

              {/* Tabs */}
              <div className="flex border-b border-white/[0.04]">
                <button
                  onClick={() => setActiveTab('foryou')}
                  className={`flex-1 py-3.5 text-sm font-medium relative transition-colors ${activeTab === 'foryou' ? 'text-white' : 'text-white/40 hover:text-white/60'}`}
                >
                  {t('comm.tab.foryou')}
                  {activeTab === 'foryou' && (
                    <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-[3px] rounded-full bg-emerald-500" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('following')}
                  className={`flex-1 py-3.5 text-sm font-medium relative transition-colors ${activeTab === 'following' ? 'text-white' : 'text-white/40 hover:text-white/60'}`}
                >
                  {t('comm.tab.following')}
                  {activeTab === 'following' && (
                    <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-[3px] rounded-full bg-emerald-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Inline Composer */}
            <div className="px-4 py-4 border-b border-white/[0.04]">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/30 to-teal-400/20 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  {user ? (
                    <span className="text-xs font-bold text-emerald-400">{user.avatar}</span>
                  ) : (
                    <User className="w-4 h-4 text-emerald-400/60" />
                  )}
                </div>
                <button
                  onClick={() => {
                    if (!user) { router.push('/login'); return; }
                    setShowComposer(true);
                  }}
                  className="flex-1 text-left text-white/25 text-[15px] py-2 hover:text-white/35 transition-colors"
                >
                  {t('comm.composer.whats_happening')}
                </button>
              </div>
            </div>

            {/* Composer Modal */}
            <AnimatePresence>
              {showComposer && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] bg-black/60 backdrop-blur-sm px-4"
                  onClick={(e) => { if (e.target === e.currentTarget) setShowComposer(false); }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    className="w-full max-w-[520px] bg-[#0a0a0a] rounded-2xl border border-white/[0.08] shadow-2xl overflow-hidden"
                  >
                    {/* Composer header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                      <button onClick={() => setShowComposer(false)} className="text-white/40 hover:text-white transition-colors">
                        <X size={20} />
                      </button>
                      <button
                        onClick={handlePost}
                        disabled={!newMessage.trim() || !newArea.trim()}
                        className="px-5 py-2 rounded-full bg-emerald-500 text-white text-sm font-bold disabled:opacity-30 hover:bg-emerald-400 transition-colors"
                      >
                        {t('comm.composer.post')}
                      </button>
                    </div>

                    {/* Composer body */}
                    <div className="p-4">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                          {user?.avatar || '?'}
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="flex gap-2">
                            {Object.entries(TAG_CONFIG).map(([key, cfg]) => (
                              <button
                                key={key}
                                onClick={() => setNewTag(key as CommunityPost['tag'])}
                                className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${newTag === key ? cfg.color : 'bg-transparent text-white/25 border-white/10 hover:border-white/20'
                                  }`}
                              >
                                {cfg.label}
                              </button>
                            ))}
                          </div>
                          <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="What's happening in your area?"
                            rows={4}
                            className="w-full bg-transparent text-white text-[15px] placeholder:text-white/20 outline-none resize-none leading-relaxed"
                            autoFocus
                          />
                          {newImage && (
                            <div className="relative mt-2 rounded-xl overflow-hidden border border-white/10 group inline-block max-w-[200px]">
                              <img src={newImage} alt="Upload preview" className="w-full h-32 object-cover" />
                              <button
                                onClick={() => setNewImage(null)}
                                className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white/70 hover:text-white hover:bg-black/80 transition-colors"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          )}
                          <div className="flex items-center justify-between border-t border-white/[0.06] pt-3 mt-1">
                            <div className="flex items-center gap-1">
                              <input
                                type="file"
                                accept="image/*"
                                ref={imageInputRef}
                                onChange={handleImageUpload}
                                className="hidden"
                              />
                              <button
                                type="button"
                                onClick={() => imageInputRef.current?.click()}
                                disabled={isUploading}
                                className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-full transition-colors cursor-pointer group relative disabled:opacity-50"
                              >
                                {isUploading ? <Loader2 size={18} className="animate-spin" /> : <ImagePlus size={18} />}
                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">Upload Image</span>
                              </button>
                            </div>
                            <div className="flex items-center gap-2 text-white/30 bg-white/[0.03] px-3 py-1.5 rounded-full border border-white/[0.06]">
                              <MapPin size={12} className="text-emerald-400" />
                              <input
                                value={newArea}
                                onChange={(e) => setNewArea(e.target.value)}
                                placeholder="Add location (e.g. Adyar)"
                                className="w-[140px] bg-transparent text-xs text-white/80 placeholder:text-white/30 outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Posts Feed */}
            <div>
              {filteredPosts.map((post) => {
                const tagCfg = TAG_CONFIG[post.tag];
                const isUpvoted = user ? post.upvotedBy.includes(user.phone) : false;
                const isExpanded = expandedPost === post.id;

                return (
                  <motion.article
                    key={post.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border-b border-white/[0.04] bg-white/[0.01] hover:bg-gradient-to-br hover:from-white/[0.03] hover:to-transparent transition-all duration-300"
                  >
                    <div className="px-5 py-5">
                      <div className="flex gap-3">
                        {/* Avatar */}
                        <div className="relative">
                          <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-md" />
                          <div className="relative w-11 h-11 rounded-full bg-gradient-to-br from-[#0a0a0a] to-[#141414] border border-white/[0.1] flex items-center justify-center text-sm font-black text-white flex-shrink-0 z-10 shadow-lg">
                            {post.author.avatar}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {/* Author line */}
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <span className="font-bold text-[15px] text-white truncate">{post.author.name}</span>
                            {/* Badges */}
                            {post.author.badges?.map((badge, idx) => (
                              <span key={idx} className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
                                {badge === 'Verified' ? <BadgeCheck size={12} className="text-amber-400" /> : <TrendingUp size={10} />}
                                {badge}
                              </span>
                            ))}
                            <span className="text-white/25 text-sm truncate">@{post.author.name.toLowerCase().replace(/\s/g, '')}</span>
                            <span className="text-white/20">·</span>
                            <span className="text-white/30 text-sm flex-shrink-0">{timeAgo(post.timestamp)}</span>

                            {/* Follow Button */}
                            {user && user.phone !== post.author.phone && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => toggleFollow(post.author.phone)}
                                className={`ml-auto text-[11px] font-bold px-3 py-1 rounded-full border transition-all ${following.includes(post.author.phone)
                                  ? 'bg-transparent text-white/50 border-white/20 hover:border-rose-500/50 hover:text-rose-400'
                                  : 'bg-white text-black border-transparent hover:bg-white/90'
                                  }`}
                              >
                                {following.includes(post.author.phone) ? 'Following' : 'Follow'}
                              </motion.button>
                            )}
                          </div>

                          {/* Tag + Location */}
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${tagCfg.color}`}>
                              {tagCfg.label}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-white/25">
                              <MapPin size={10} /> {post.area}
                            </span>
                          </div>

                          {/* Message */}
                          <p className="text-[15px] text-white/80 leading-relaxed whitespace-pre-wrap mb-3">
                            {renderMessageWithLinks(post.message)}
                          </p>

                          {/* Image Attachment */}
                          {post.image && (
                            <div className="mb-4 overflow-hidden rounded-2xl border border-white/[0.08] cursor-pointer hover:border-white/20 transition-colors bg-white/[0.02]">
                              <img src={post.image} alt="Attached community media" className="w-full h-auto max-h-[400px] object-cover" loading="lazy" />
                            </div>
                          )}

                          {/* Action bar */}
                          <div className="flex items-center justify-between max-w-[400px] -ml-2">
                            {/* Reply */}
                            <button
                              onClick={() => {
                                if (!user) { router.push('/login'); return; }
                                setReplyingTo(replyingTo === post.id ? null : post.id);
                                setExpandedPost(isExpanded ? null : post.id);
                                setTimeout(() => replyInputRef.current?.focus(), 200);
                              }}
                              className="flex items-center gap-1.5 px-2 py-1.5 rounded-full text-white/30 hover:text-cyan-400 hover:bg-cyan-400/[0.08] transition-all group"
                            >
                              <MessageCircle size={16} className="group-hover:text-cyan-400" />
                              <span className="text-xs">{post.replies.length}</span>
                            </button>

                            {/* Repost */}
                            <button
                              onClick={() => toggleRepost(post.id)}
                              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-full transition-all group ${repostedPosts.includes(post.id) ? 'text-emerald-400 bg-emerald-400/10' : 'text-white/30 hover:text-emerald-400 hover:bg-emerald-400/[0.08]'
                                }`}
                            >
                              <Repeat2 size={16} className={repostedPosts.includes(post.id) ? '' : 'group-hover:text-emerald-400'} />
                            </button>

                            {/* Like / Upvote */}
                            <button
                              onClick={() => handleUpvote(post.id)}
                              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-full transition-all group ${isUpvoted
                                ? 'text-rose-400 bg-rose-400/10'
                                : 'text-white/30 hover:text-rose-400 hover:bg-rose-400/[0.08]'
                                }`}
                            >
                              <Heart size={16} className={isUpvoted ? 'fill-current' : ''} />
                              <span className="text-xs">{post.upvotes}</span>
                            </button>

                            {/* Share */}
                            <button className="flex items-center gap-1.5 px-2 py-1.5 rounded-full text-white/30 hover:text-emerald-400 hover:bg-emerald-400/[0.08] transition-all group">
                              <Share size={16} className="group-hover:text-emerald-400" />
                            </button>

                            {/* Bookmark */}
                            <button
                              onClick={() => toggleBookmark(post.id)}
                              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-full transition-all group ${bookmarkedPosts.includes(post.id) ? 'text-cyan-400 bg-cyan-400/10' : 'text-white/30 hover:text-cyan-400 hover:bg-cyan-400/[0.08]'
                                }`}
                            >
                              <Bookmark size={16} className={bookmarkedPosts.includes(post.id) ? 'fill-current' : 'group-hover:text-cyan-400'} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Replies section */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          {/* Existing replies */}
                          {post.replies.length > 0 && (
                            <div className="pl-[68px] pr-4 pb-2 relative">
                              {/* Vertical thread line */}
                              <div className="absolute top-0 bottom-4 left-[35px] w-[2px] bg-white/[0.08] rounded-full" />

                              <div className="space-y-4 pt-1">
                                {post.replies.map(reply => (
                                  <div key={reply.id} className="flex gap-3 relative group">
                                    <div className="absolute top-3.5 -left-[33px] w-6 h-[2px] bg-white/[0.08] group-hover:bg-white/20 transition-colors" />
                                    <div className="w-7 h-7 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[9px] font-bold text-emerald-400 flex-shrink-0 z-10 shadow-[0_0_0_4px_#050505]">
                                      {reply.author.avatar}
                                    </div>
                                    <div className="flex-1 bg-white/[0.02] border border-white/[0.04] p-3 rounded-2xl rounded-tl-sm hover:border-white/[0.08] transition-colors">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold text-white/80">{reply.author.name}</span>
                                        <span className="text-[10px] text-white/20">{timeAgo(reply.timestamp)}</span>
                                      </div>
                                      <p className="text-xs text-white/60 leading-relaxed">{renderMessageWithLinks(reply.message)}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Reply input */}
                          {replyingTo === post.id && (
                            <div className="pl-[68px] pr-4 pb-4 flex gap-2">
                              <input
                                ref={replyInputRef}
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleReply(post.id); }}
                                placeholder="Post your reply..."
                                className="flex-1 bg-white/[0.04] text-white px-3 py-2 rounded-full border border-white/[0.08] focus:border-emerald-500/40 outline-none text-sm"
                              />
                              <button
                                onClick={() => handleReply(post.id)}
                                disabled={!replyText.trim()}
                                className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center disabled:opacity-30 hover:bg-emerald-400 transition-colors"
                              >
                                <Send size={14} className="text-white" />
                              </button>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.article>
                );
              })}

              {filteredPosts.length === 0 && (
                <div className="text-center py-20 text-white/20">
                  <Droplets size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">{t('comm.empty.title')}</p>
                  <p className="text-xs mt-1">{t('comm.empty.desc')}</p>
                </div>
              )}
            </div>
          </div>

          {/* ═══════ Right Sidebar ═══════ */}
          <aside className="hidden lg:block w-[350px] h-screen sticky top-0 px-6 py-4 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            {/* Search */}
            <div className="relative mb-5 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 group-focus-within:text-emerald-400 transition-colors" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Community"
                className="w-full bg-white/[0.02] border border-white/[0.08] text-white text-sm pl-11 pr-4 py-3 rounded-full outline-none focus:border-emerald-500/50 focus:bg-emerald-500/[0.02] focus:shadow-[0_0_15px_rgba(16,185,129,0.15)] transition-all placeholder:text-white/20"
              />
            </div>

            {/* Trending Topics */}
            <div className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-xl rounded-2xl mb-5 overflow-hidden">
              <h3 className="px-4 pt-4 pb-2 text-lg font-bold text-white">{t('comm.trending.title')}</h3>
              {trendingAreas.map(([area, count], i) => (
                <button
                  key={area}
                  onClick={() => setSearchQuery(area)}
                  className="w-full text-left px-4 py-3 hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-white/25 font-medium">{t('comm.trending.subtitle')}</p>
                      <p className="text-sm font-bold text-white/80 mt-0.5">{area}</p>
                      <p className="text-xs text-white/25 mt-0.5">{count} {t('comm.trending.engagements')}</p>
                    </div>
                    <MoreHorizontal className="w-4 h-4 text-white/15" />
                  </div>
                </button>
              ))}
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="w-full text-left px-4 py-3 text-emerald-400 text-sm hover:bg-white/[0.04] transition-colors"
                >
                  {t('comm.trending.clear')}
                </button>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-xl rounded-2xl overflow-hidden mt-5">
              <h3 className="px-4 pt-4 pb-2 text-lg font-bold text-white">{t('comm.stats.title')}</h3>
              <div className="px-4 pb-4 space-y-3">
                {[
                  { icon: MessageCircle, label: t('comm.stats.posts'), value: posts.length, color: 'text-violet-400' },
                  { icon: Users, label: t('comm.stats.users'), value: new Set(posts.map(p => p.author.phone)).size, color: 'text-cyan-400' },
                  { icon: Heart, label: t('comm.stats.reactions'), value: posts.reduce((s, p) => s + p.upvotes, 0), color: 'text-rose-400' },
                  { icon: MapPin, label: t('comm.stats.areas'), value: new Set(posts.map(p => p.area)).size, color: 'text-amber-400' },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    <span className="text-sm text-white/40 flex-1">{stat.label}</span>
                    <span className="text-sm font-bold text-white/70">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer links */}
            <div className="mt-5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-white/15">
              <span>{t('comm.footer.terms')}</span>
              <span>{t('comm.footer.privacy')}</span>
              <span>{t('comm.footer.accessibility')}</span>
              <span>© 2026 CivicPulse</span>
            </div>
          </aside>
        </div>

        {/* Mobile FAB */}
        <motion.button
          onClick={() => {
            if (!user) { router.push('/login'); return; }
            setShowComposer(!showComposer);
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-xl shadow-emerald-500/25 flex items-center justify-center md:hidden"
        >
          <Plus size={24} />
        </motion.button>
      </main>
    </PageTransition>
  );
}
