"use client";

import React, { useRef, useState, useCallback } from "react";
import {
  Plus,
  Map,
  MessageCircle,
  BarChart,
  Droplets,
  Users,
  ArrowRight,
  ThermometerSun,
  Trophy,
  GitBranch,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useChat } from "@/context/ChatContext";
import { useLanguage } from "@/context/LanguageContext";

/* ───────────── types ───────────── */

interface TiltState {
  rotateX: number;
  rotateY: number;
  /** 0-1 normalized mouse position for shine */
  shineX: number;
  shineY: number;
  /** shadow offset in px */
  shadowX: number;
  shadowY: number;
}

const INITIAL_TILT: TiltState = {
  rotateX: 0,
  rotateY: 0,
  shineX: 0.5,
  shineY: 0.5,
  shadowX: 0,
  shadowY: 0,
};

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  tags: string[];
  glowColor: string;
  gradientFrom: string;
  gradientTo: string;
  href?: string;
  onClick?: () => void;
  isHero?: boolean;
  index: number;
}

/* ───────────── 3-D card ───────────── */

const MAX_TILT = 15; // degrees
const PERSPECTIVE = 800; // px

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon: Icon,
  title,
  description,
  tags,
  glowColor,
  gradientFrom,
  gradientTo,
  href,
  onClick,
  isHero = false,
  index,
}) => {
  const { t } = useLanguage();
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState<TiltState>(INITIAL_TILT);
  const [isHovered, setIsHovered] = useState(false);
  const rafRef = useRef<number>(0);

  /* ── mouse handlers ── */
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        const card = cardRef.current;
        if (!card) return;

        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        // -1 to 1
        const px = (e.clientX - cx) / (rect.width / 2);
        const py = (e.clientY - cy) / (rect.height / 2);

        setTilt({
          rotateY: px * MAX_TILT,
          rotateX: -py * MAX_TILT,
          shineX: (e.clientX - rect.left) / rect.width,
          shineY: (e.clientY - rect.top) / rect.height,
          shadowX: -px * 20,
          shadowY: -py * 20,
        });
      });
    },
    [],
  );

  const handleMouseLeave = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setTilt(INITIAL_TILT);
    setIsHovered(false);
  }, []);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);

  /* ── dynamic styles ── */
  const cardTransform = isHovered
    ? `perspective(${PERSPECTIVE}px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale3d(1.03, 1.03, 1.03)`
    : `perspective(${PERSPECTIVE}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;

  const dynamicShadow = isHovered
    ? `${tilt.shadowX}px ${tilt.shadowY}px 40px rgba(0,0,0,0.35), 0 0 80px ${glowColor}18`
    : `0 4px 20px rgba(0,0,0,0.2)`;

  const shineGradient = `radial-gradient(circle at ${tilt.shineX * 100}% ${tilt.shineY * 100}%, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 35%, transparent 70%)`;

  /* ── depth offsets for inner layers ── */
  const iconParallax = isHovered
    ? `translate(${tilt.rotateY * 1.2}px, ${-tilt.rotateX * 1.2}px)`
    : "translate(0, 0)";

  const contentParallax = isHovered
    ? `translate(${tilt.rotateY * 0.5}px, ${-tilt.rotateX * 0.5}px)`
    : "translate(0, 0)";

  const bgParallax = isHovered
    ? `translate(${-tilt.rotateY * 0.8}px, ${tilt.rotateX * 0.8}px) scale(1.08)`
    : "translate(0, 0) scale(1)";

  /* ── render ── */
  const cardContent = (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
      viewport={{ once: true, amount: 0.2 }}
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative cursor-pointer ${isHero ? "min-h-[280px]" : "min-h-[240px]"}`}
      style={{
        perspective: `${PERSPECTIVE}px`,
        transformStyle: "preserve-3d",
      }}
    >
      {/* ── Outer wrapper that tilts ── */}
      <div
        className="relative h-full w-full rounded-3xl overflow-hidden"
        style={{
          transform: cardTransform,
          boxShadow: dynamicShadow,
          transition: isHovered
            ? "transform 0.08s ease-out, box-shadow 0.15s ease-out"
            : "transform 0.5s cubic-bezier(.23,1,.32,1), box-shadow 0.5s ease",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Layer 0 — Background accent blob (deepest) */}
        <div
          className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${glowColor}, transparent 70%)`,
            opacity: isHovered ? 0.14 : 0.06,
            transform: bgParallax,
            transition: isHovered
              ? "transform 0.08s ease-out, opacity 0.3s"
              : "transform 0.5s cubic-bezier(.23,1,.32,1), opacity 0.5s",
          }}
        />

        {/* Layer 1 — Glass card body */}
        <div
          className="relative h-full rounded-3xl border border-white/[0.08] backdrop-blur-xl p-8 flex flex-col justify-between"
          style={{
            background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
            transition: "border-color 0.3s",
            borderColor: isHovered ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.08)",
          }}
        >
          {/* Layer 2 — Shine highlight overlay */}
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              background: shineGradient,
              opacity: isHovered ? 1 : 0,
              transition: "opacity 0.3s",
            }}
          />

          {/* Layer 3 — Edge highlight */}
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              boxShadow: isHovered
                ? `inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(255,255,255,0.04)`
                : "inset 0 1px 0 rgba(255,255,255,0.04)",
              transition: "box-shadow 0.3s",
            }}
          />

          {/* ── Top content zone ── */}
          <div className="relative z-10">
            {/* Floating icon — deepest parallax layer */}
            <div
              className="mb-5"
              style={{
                transform: iconParallax,
                transition: isHovered
                  ? "transform 0.08s ease-out"
                  : "transform 0.5s cubic-bezier(.23,1,.32,1)",
                transformStyle: "preserve-3d",
              }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center border border-white/10 animate-float"
                style={{
                  background: `linear-gradient(135deg, ${glowColor}25, ${glowColor}08)`,
                  transform: "translateZ(30px)",
                }}
              >
                <Icon className="w-7 h-7 text-white" />
              </div>
            </div>

            {/* Title + description — mid parallax */}
            <div
              style={{
                transform: contentParallax,
                transition: isHovered
                  ? "transform 0.08s ease-out"
                  : "transform 0.5s cubic-bezier(.23,1,.32,1)",
              }}
            >
              <h3
                className={`${isHero ? "text-3xl" : "text-2xl"} font-bold text-white mb-3 tracking-tight`}
              >
                {title}
              </h3>
              <p className="text-white/60 leading-relaxed text-[15px]">
                {description}
              </p>
            </div>
          </div>

          {/* ── Bottom content zone ── */}
          <div
            className="relative z-10 mt-6"
            style={{
              transform: contentParallax,
              transition: isHovered
                ? "transform 0.08s ease-out"
                : "transform 0.5s cubic-bezier(.23,1,.32,1)",
            }}
          >
            <div className="flex flex-wrap gap-2 mb-5">
              {tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase border border-white/[0.08] text-white/50"
                  style={{
                    background: `linear-gradient(135deg, ${glowColor}10, transparent)`,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Arrow CTA */}
            <div className="flex items-center gap-2 text-sm font-medium text-white/40 group-hover:text-white/80 transition-colors duration-300">
              <span style={{ opacity: isHovered ? 0.9 : 0.4, transition: "opacity 0.3s" }}>
                {t('common.explore') || 'Explore'}
              </span>
              <ArrowRight
                className="w-4 h-4"
                style={{
                  transform: isHovered ? "translateX(4px)" : "translateX(0)",
                  opacity: isHovered ? 0.9 : 0.4,
                  transition: "transform 0.3s, opacity 0.3s",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {cardContent}
      </Link>
    );
  }
  return cardContent;
};

/* ───────────── grid ───────────── */

export default function FeatureGrid() {
  const { openChat } = useChat();
  const { t } = useLanguage();

  const features = [
    {
      icon: Plus,
      title: t('card.report.title'),
      description: t('card.report.desc'),
      tags: ["Frictionless", "Mobile-First", "Accessible"],
      glowColor: "#c8ff00",
      gradientFrom: "rgba(10, 10, 10, 0.95)",
      gradientTo: "rgba(15, 15, 10, 0.8)",
      href: "/report",
      isHero: true,
    },
    {
      icon: Map,
      title: t('card.dashboard.title'),
      description: t('card.dashboard.desc'),
      tags: ["Real-time", "Data Viz", "Actionable"],
      glowColor: "#00d4ff",
      gradientFrom: "rgba(10, 10, 10, 0.95)",
      gradientTo: "rgba(10, 12, 18, 0.8)",
      href: "/dashboard",
      isHero: true,
    },
    {
      icon: Users,
      title: t('card.community.title'),
      description: t('card.community.desc'),
      tags: ["Forum", "Location-tagged", "Real-time"],
      glowColor: "#8b5cf6",
      gradientFrom: "rgba(10, 10, 10, 0.95)",
      gradientTo: "rgba(14, 10, 18, 0.8)",
      href: "/community",
    },
    {
      icon: MessageCircle,
      title: t('card.ai.title'),
      description: t('card.ai.desc'),
      tags: ["AI Powered", "Tamil Support", "Always On"],
      glowColor: "#ec4899",
      gradientFrom: "rgba(10, 10, 10, 0.95)",
      gradientTo: "rgba(18, 10, 14, 0.8)",
      onClick: openChat,
    },
    {
      icon: BarChart,
      title: t('card.analytics.title'),
      description: t('card.analytics.desc'),
      tags: ["Trends", "KPIs", "Reports"],
      glowColor: "#00ff87",
      gradientFrom: "rgba(10, 10, 10, 0.95)",
      gradientTo: "rgba(10, 15, 12, 0.8)",
      href: "/analytics",
    },
  ];
  const newFeatures = [
    {
      icon: ThermometerSun,
      title: t('card.forecast.title'),
      description: t('card.forecast.desc'),
      tags: ["Predictive", "Per-Area", "5-Day"],
      glowColor: "#0ea5e9",
      gradientFrom: "rgba(10, 10, 10, 0.95)",
      gradientTo: "rgba(10, 14, 20, 0.8)",
      href: "/forecast",
      isHero: true,
    },
    {
      icon: GitBranch,
      title: t('card.ticket.title'),
      description: t('card.ticket.desc'),
      tags: ["Live Status", "Verification", "Gamified"],
      glowColor: "#a855f7",
      gradientFrom: "rgba(10, 10, 10, 0.95)",
      gradientTo: "rgba(14, 10, 20, 0.8)",
      href: "/track/demo",
      isHero: true,
    },
    {
      icon: Trophy,
      title: t('card.leaderboard.title'),
      description: t('card.leaderboard.desc'),
      tags: ["Gamified", "Rankings", "Badges"],
      glowColor: "#f59e0b",
      gradientFrom: "rgba(10, 10, 10, 0.95)",
      gradientTo: "rgba(16, 14, 8, 0.8)",
      href: "/leaderboard",
    },
  ];

  const heroCards = features.slice(0, 2);
  const utilityCards = features.slice(2, 4); // Community + AI
  const toolCards = features.slice(4);       // Analytics (only 1)

  const newHeroCards = newFeatures.slice(0, 2);
  const newStandardCards = newFeatures.slice(2);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 space-y-16">
      {/* ─── Section 1: Core Actions ─── */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/20 mb-1">
            {t('cta.core_actions')}
          </h2>
          <div className="w-12 h-0.5 bg-[--accent] rounded-full" />
        </motion.div>

        {/* 2 hero cards side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {heroCards.map((feature, index) => (
            <FeatureCard key={index} index={index} {...feature} />
          ))}
        </div>
      </section>

      {/* ─── Section 2: Explore & Connect ─── */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/20 mb-1">
            {t('cta.explore')}
          </h2>
          <div className="w-12 h-0.5 bg-gradient-to-r from-[--accent] to-[--cyan] rounded-full opacity-60" />
        </motion.div>

        {/* 2 + 1 layout for balanced breathing room */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          {utilityCards.map((feature, index) => (
            <FeatureCard key={index + 2} index={index + 2} {...feature} />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {toolCards.map((feature, index) => (
            <FeatureCard key={index + 4} index={index + 4} {...feature} />
          ))}
        </div>
      </section>

      {/* ─── Section 3: Intelligence & Tracking ─── */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/20">
              {t('cta.tracking')}
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
              {t('common.new')}
            </span>
          </div>
          <div className="w-12 h-0.5 bg-gradient-to-r from-[--cyan] to-amber-500 rounded-full opacity-60" />
        </motion.div>

        {/* 2 hero-sized cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {newHeroCards.map((feature, index) => (
            <FeatureCard key={index + 6} index={index + 6} {...feature} />
          ))}
        </div>

        {/* 2 standard cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {newStandardCards.map((feature, index) => (
            <FeatureCard key={index + 8} index={index + 8} {...feature} />
          ))}
        </div>
      </section>
    </div>
  );
}
