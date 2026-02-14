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
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useChat } from "@/context/ChatContext";

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
                Explore
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

  const features = [
    {
      icon: Plus,
      title: "Citizen Reporting",
      description:
        "Report water issues in under 30 seconds. No login needed. Geotagged, instant, and impactful.",
      tags: ["Frictionless", "Mobile-First", "Accessible"],
      glowColor: "#3b82f6",
      gradientFrom: "rgba(15, 25, 60, 0.9)",
      gradientTo: "rgba(20, 35, 80, 0.7)",
      href: "/report",
      isHero: true,
    },
    {
      icon: Droplets,
      title: "Water Scanner",
      description:
        "AI-powered water quality analysis. Point your camera or upload a photo for instant turbidity and contamination scoring.",
      tags: ["AI Vision", "Instant Results", "Camera/Upload"],
      glowColor: "#06b6d4",
      gradientFrom: "rgba(10, 30, 50, 0.9)",
      gradientTo: "rgba(15, 45, 65, 0.7)",
      href: "/scan",
      isHero: true,
    },
    {
      icon: Map,
      title: "Heatmap Dashboard",
      description:
        "Interactive severity-coded zones. Click any area for detailed complaint breakdown.",
      tags: ["Real-time", "Data Viz", "Actionable"],
      glowColor: "#f97316",
      gradientFrom: "rgba(35, 18, 12, 0.9)",
      gradientTo: "rgba(50, 25, 18, 0.7)",
      href: "/dashboard",
    },
    {
      icon: Users,
      title: "Community Chat",
      description:
        "Public forum for local water issues. Upvote, reply, and coordinate with neighbors.",
      tags: ["Forum", "Location-tagged", "Real-time"],
      glowColor: "#8b5cf6",
      gradientFrom: "rgba(25, 15, 45, 0.9)",
      gradientTo: "rgba(35, 22, 60, 0.7)",
      href: "/community",
    },
    {
      icon: MessageCircle,
      title: "AI Assistant",
      description:
        "24/7 multilingual chatbot. Instant answers, guidance, and support.",
      tags: ["AI Powered", "Tamil Support", "Always On"],
      glowColor: "#ec4899",
      gradientFrom: "rgba(40, 15, 30, 0.9)",
      gradientTo: "rgba(55, 20, 40, 0.7)",
      onClick: openChat,
    },
    {
      icon: BarChart,
      title: "Analytics & Insights",
      description:
        "Track trends, response times, and resolution rates for data-driven planning.",
      tags: ["Trends", "KPIs", "Reports"],
      glowColor: "#10b981",
      gradientFrom: "rgba(8, 35, 28, 0.9)",
      gradientTo: "rgba(12, 50, 38, 0.7)",
      href: "/analytics",
    },
  ];

  const heroCards = features.slice(0, 2);
  const standardCards = features.slice(2);

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      {/* Hero cards — 2 wide */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {heroCards.map((feature, index) => (
          <FeatureCard key={index} index={index} {...feature} />
        ))}
      </div>

      {/* Standard cards — 4 in a row on large, 2 on medium */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {standardCards.map((feature, index) => (
          <FeatureCard key={index + 2} index={index + 2} {...feature} />
        ))}
      </div>
    </div>
  );
}
