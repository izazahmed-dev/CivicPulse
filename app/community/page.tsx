'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft, MapPin, ThumbsUp, MessageCircle, Send, Plus, X,
  Droplets, Filter, Clock, TrendingUp, User, ChevronDown,
  Home, Search, Bell, Settings, Bookmark, BarChart3, Users,
  MoreHorizontal, Repeat2, Share, Heart,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface CommunityPost {
  id: string;
  author: { name: string; avatar: string; phone: string };
  area: string;
  city: string;
  message: string;
  timestamp: number;
  upvotes: number;
  upvotedBy: string[];
  replies: CommunityReply[];
  tag: 'issue' | 'update' | 'tip' | 'question';
}

interface CommunityReply {
  id: string;
  author: { name: string; avatar: string; phone: string };
  message: string;
  timestamp: number;
}

const STORAGE_KEY = 'watergrid_community_posts';

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
    message: 'No water supply since 6 AM today. Multiple houses in our street are affected. The tanker hasn\'t arrived either. Anyone else facing this?',
    timestamp: Date.now() - 3600000,
    upvotes: 24,
    upvotedBy: ['a', 'b', 'c'],
    replies: [
      {
        id: 'cr-1',
        author: { name: 'Rajesh Kumar', avatar: 'RK', phone: '9876543211' },
        message: 'Same here, 2nd Main Road. I\'ve already filed a complaint on WaterGrid. Complaint ID: WC-4821.',
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
    author: { name: 'Amit Patel', avatar: 'AP', phone: '9876543220' },
    area: 'T. Nagar, Pondy Bazaar',
    city: 'Chennai',
    message: 'Water quality has significantly improved after last week\'s pipe replacement. The WaterGrid scan shows clean results now! Great work by the civic team. 💧✅',
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
    author: { name: 'Kavitha M', avatar: 'KM', phone: '9876543230' },
    area: 'Andheri West, Lokhandwala',
    city: 'Mumbai',
    message: 'Pro tip: If your water pressure is low in the morning, check if your building motor is running. Many societies have scheduled timings. You can ask your maintenance for the exact hours.',
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
  const replyInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadPostsFromAPI().then(setPosts);
  }, []);

  const filteredPosts = posts
    .filter(p => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return p.message.toLowerCase().includes(q) || p.area.toLowerCase().includes(q) || p.author.name.toLowerCase().includes(q);
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
    <main className="min-h-screen bg-[#030b1a] text-white">
      <div className="flex max-w-[1280px] mx-auto">
        {/* ═══════ Left Sidebar ═══════ */}
        <aside className="hidden md:flex flex-col w-[68px] xl:w-[260px] h-screen sticky top-0 border-r border-white/[0.06] px-3 xl:px-5 py-6 justify-between">
          <div className="space-y-1">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 px-3 py-3 mb-4">
              <Droplets className="w-7 h-7 text-emerald-400" />
              <span className="text-lg font-black tracking-tight hidden xl:block">WaterGrid</span>
            </Link>

            <NavItem icon={Home} label="Home" onClick={() => router.push('/')} />
            <NavItem icon={Search} label="Explore" />
            <NavItem icon={Bell} label="Notifications" badge={3} />
            <NavItem icon={MessageCircle} label="Community" active />
            <NavItem icon={Bookmark} label="Saved" />
            <NavItem icon={BarChart3} label="Analytics" onClick={() => router.push('/analytics')} />
            <NavItem icon={Settings} label="Settings" />

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
              <span className="hidden xl:block">Post</span>
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
              <span className="text-sm font-medium text-white/70 hidden xl:block">Sign in</span>
            </Link>
          )}
        </aside>

        {/* ═══════ Main Feed ═══════ */}
        <div className="flex-1 min-h-screen border-r border-white/[0.06] max-w-[600px]">
          {/* Top bar */}
          <div className="sticky top-0 z-30 bg-[#030b1a]/80 backdrop-blur-xl border-b border-white/[0.06]">
            <div className="flex items-center px-4 py-3 md:hidden">
              <Link href="/" className="text-white/40 hover:text-white transition-colors">
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
                <Link href="/login" className="text-xs text-emerald-400 font-semibold">Login</Link>
              )}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/[0.04]">
              <button
                onClick={() => setActiveTab('foryou')}
                className={`flex-1 py-3.5 text-sm font-medium relative transition-colors ${activeTab === 'foryou' ? 'text-white' : 'text-white/40 hover:text-white/60'}`}
              >
                For you
                {activeTab === 'foryou' && (
                  <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-[3px] rounded-full bg-emerald-500" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('following')}
                className={`flex-1 py-3.5 text-sm font-medium relative transition-colors ${activeTab === 'following' ? 'text-white' : 'text-white/40 hover:text-white/60'}`}
              >
                Following
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
                What&apos;s happening with water?
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
                  className="w-full max-w-[520px] bg-[#0c1525] rounded-2xl border border-white/[0.08] shadow-2xl overflow-hidden"
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
                      Post
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
                          placeholder="What's happening with water in your area?"
                          rows={4}
                          className="w-full bg-transparent text-white text-[15px] placeholder:text-white/20 outline-none resize-none leading-relaxed"
                          autoFocus
                        />
                        <div className="flex items-center gap-2 text-white/30">
                          <MapPin size={14} />
                          <input
                            value={newArea}
                            onChange={(e) => setNewArea(e.target.value)}
                            placeholder="Add location (e.g. Adyar, Gandhi Nagar)"
                            className="flex-1 bg-transparent text-sm text-white/60 placeholder:text-white/20 outline-none"
                          />
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
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-white/[0.04] hover:bg-white/[0.01] transition-colors"
                >
                  <div className="px-4 py-4">
                    <div className="flex gap-3">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500/80 to-purple-700/80 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                        {post.author.avatar}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Author line */}
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-bold text-[15px] text-white truncate">{post.author.name}</span>
                          <span className="text-white/25 text-sm truncate">@{post.author.name.toLowerCase().replace(/\s/g, '')}</span>
                          <span className="text-white/20">·</span>
                          <span className="text-white/30 text-sm flex-shrink-0">{timeAgo(post.timestamp)}</span>
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
                          {post.message}
                        </p>

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
                          <button className="flex items-center gap-1.5 px-2 py-1.5 rounded-full text-white/30 hover:text-emerald-400 hover:bg-emerald-400/[0.08] transition-all group">
                            <Repeat2 size={16} className="group-hover:text-emerald-400" />
                          </button>

                          {/* Like / Upvote */}
                          <button
                            onClick={() => handleUpvote(post.id)}
                            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-full transition-all group ${isUpvoted
                                ? 'text-rose-400'
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
                          <button className="flex items-center gap-1.5 px-2 py-1.5 rounded-full text-white/30 hover:text-emerald-400 hover:bg-emerald-400/[0.08] transition-all group">
                            <Bookmark size={16} className="group-hover:text-emerald-400" />
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
                          <div className="pl-[68px] pr-4 pb-2 space-y-3">
                            {post.replies.map(reply => (
                              <div key={reply.id} className="flex gap-3">
                                <div className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center text-[9px] font-bold text-white/50 flex-shrink-0">
                                  {reply.author.avatar}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-white/70">{reply.author.name}</span>
                                    <span className="text-[10px] text-white/20">{timeAgo(reply.timestamp)}</span>
                                  </div>
                                  <p className="text-xs text-white/50 mt-0.5 leading-relaxed">{reply.message}</p>
                                </div>
                              </div>
                            ))}
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
                <p className="text-sm">No posts yet</p>
                <p className="text-xs mt-1">Be the first to share!</p>
              </div>
            )}
          </div>
        </div>

        {/* ═══════ Right Sidebar ═══════ */}
        <aside className="hidden lg:block w-[350px] h-screen sticky top-0 px-6 py-4 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          {/* Search */}
          <div className="relative mb-5">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="w-full bg-white/[0.04] border border-white/[0.06] text-white text-sm pl-11 pr-4 py-3 rounded-full outline-none focus:border-emerald-500/30 focus:bg-white/[0.06] transition-all placeholder:text-white/25"
            />
          </div>

          {/* Trending Topics */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl mb-5 overflow-hidden">
            <h3 className="px-4 pt-4 pb-2 text-lg font-bold text-white">Trending Areas</h3>
            {trendingAreas.map(([area, count], i) => (
              <button
                key={area}
                onClick={() => setSearchQuery(area)}
                className="w-full text-left px-4 py-3 hover:bg-white/[0.04] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-white/25 font-medium">Trending in Water</p>
                    <p className="text-sm font-bold text-white/80 mt-0.5">{area}</p>
                    <p className="text-xs text-white/25 mt-0.5">{count} community engagements</p>
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
                Clear search
              </button>
            )}
          </div>

          {/* Quick Stats */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
            <h3 className="px-4 pt-4 pb-2 text-lg font-bold text-white">Community Stats</h3>
            <div className="px-4 pb-4 space-y-3">
              {[
                { icon: MessageCircle, label: 'Total Posts', value: posts.length, color: 'text-violet-400' },
                { icon: Users, label: 'Active Users', value: new Set(posts.map(p => p.author.phone)).size, color: 'text-cyan-400' },
                { icon: Heart, label: 'Total Reactions', value: posts.reduce((s, p) => s + p.upvotes, 0), color: 'text-rose-400' },
                { icon: MapPin, label: 'Areas Covered', value: new Set(posts.map(p => p.area)).size, color: 'text-amber-400' },
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
            <span>Terms of Service</span>
            <span>Privacy Policy</span>
            <span>Accessibility</span>
            <span>© 2026 WaterGrid</span>
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
  );
}
