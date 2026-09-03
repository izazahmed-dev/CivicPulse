"use client";

import React from "react";
import { Plus, Map, ChevronRight, Droplets, Users } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

interface ActionCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  bgColorClass: string;
  hoverColorClass: string;
  textColorClass?: string;
  circleColorClass?: string;
  hasDot?: boolean;
  href: string;
}

const ActionCard: React.FC<ActionCardProps> = ({
  icon: Icon,
  title,
  description,
  bgColorClass,
  hoverColorClass,
  textColorClass = "text-white",
  circleColorClass = "bg-white/20",
  hasDot = false,
  href,
}) => {
  return (
    <Link
      href={href}
      className={`relative w-full p-8 rounded-2xl flex flex-col items-center text-center cursor-pointer transition-all duration-300 group ${bgColorClass} ${hoverColorClass}`}
    >
      <div
        className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${circleColorClass} backdrop-blur-sm`}
      >
        <Icon className="w-8 h-8 text-white" />
      </div>

      <h3 className={`text-2xl font-bold mb-2 ${textColorClass}`}>{title}</h3>
      <p className="text-gray-200/90 text-sm md:text-base">{description}</p>

      {/* Right Arrow Icon positioned absolutely */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-80 group-hover:translate-x-1 group-hover:opacity-100 transition-all">
        <ChevronRight className="w-6 h-6 text-white" />
      </div>

      {/* Optional Dot */}
      {hasDot && (
        <div className="absolute bottom-8 right-1/2 translate-x-1/2 translate-y-8 w-1.5 h-1.5 rounded-full bg-orange-400/80 shadow-[0_0_8px_rgba(251,146,60,0.6)]"></div>
      )}
    </Link>
  );
};

export default function ActionCards() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto p-4">
      <ActionCard
        icon={Plus}
        title={t('card.report.title')}
        description={t('card.report.desc')}
        bgColorClass="bg-[#2563eb]"
        hoverColorClass="hover:bg-[#1d4ed8]"
        circleColorClass="bg-white/20"
        hasDot={true}
        href="/report"
      />

      <ActionCard
        icon={Users}
        title={t('card.community.title')}
        description={t('card.community.desc')}
        bgColorClass="bg-gradient-to-r from-violet-800 to-purple-900"
        hoverColorClass="hover:from-violet-700 hover:to-purple-800"
        circleColorClass="bg-violet-400/20"
        href="/community"
      />

      <ActionCard
        icon={Map}
        title={t('card.dashboard.title')}
        description={t('card.dashboard.desc')}
        bgColorClass="bg-[#1e3a8a]"
        hoverColorClass="hover:bg-[#172554]"
        circleColorClass="bg-[#3b82f6]/20"
        href="/dashboard"
      />
    </div>
  );
}
