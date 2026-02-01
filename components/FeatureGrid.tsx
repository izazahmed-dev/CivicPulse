"use client";

import React from "react";
import { Plus, Map, MessageCircle, BarChart } from "lucide-react";
import Link from "next/link";
import { useChat } from "@/context/ChatContext";

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  tags: string[];
  colorClass: string;
  iconBgClass: string;
  href?: string;
  onClick?: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon: Icon,
  title,
  description,
  tags,
  colorClass,
  iconBgClass,
  href,
  onClick,
}) => {
  const CardContent = (
    <div
      onClick={onClick}
      className={`relative p-8 rounded-2xl border border-white/10 ${colorClass} transition-all duration-300 hover:scale-[1.02] cursor-pointer group h-full flex flex-col justify-between`}
    >
      <div>
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${iconBgClass} border border-white/10`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>

        <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
        <p className="text-gray-400 leading-relaxed mb-6">{description}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-gray-300 border border-white/10 backdrop-blur-sm"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="h-full block">
        {CardContent}
      </Link>
    );
  }

  return CardContent;
};

export default function FeatureGrid() {
  const { openChat } = useChat();

  const features = [
    {
      icon: Plus,
      title: "Citizen Reporting",
      description:
        "Report water issues in under 30 seconds. No login needed. Geotagged and instant.",
      tags: ["Frictionless", "Mobile-First", "Accessible"],
      colorClass: "bg-[#0f1f3a] hover:bg-[#132542]",
      iconBgClass: "bg-white/10",
      href: "/report",
    },
    {
      icon: Map,
      title: "Heatmap Dashboard",
      description:
        "Interactive map with severity-coded zones. Click any area for detailed complaint breakdown.",
      tags: ["Real-time", "Data Visualization", "Actionable"],
      colorClass: "bg-[#2a1212] hover:bg-[#381616]", // Darkish red theme
      iconBgClass: "bg-white/10",
      href: "/dashboard",
    },
    {
      icon: MessageCircle,
      title: "AI Assistant",
      description:
        "24/7 multilingual chatbot powered by Gemini. Helps citizens get answers and guidance.",
      tags: ["Gemini AI", "Tamil Support", "Always On"],
      colorClass: "bg-[#25122a] hover:bg-[#321838]", // Darkish purple theme
      iconBgClass: "bg-white/10",
      onClick: openChat, // Triggers ChatBot
    },
    {
      icon: BarChart,
      title: "Analytics & Insights",
      description:
        "Track trends, response times, and resolution rates. Data-driven municipal planning.",
      tags: ["Trends", "KPIs", "Reports"],
      colorClass: "bg-[#0b2b24] hover:bg-[#0e362d]", // Darkish green theme
      iconBgClass: "bg-white/10",
      href: "/dashboard", // Linking to dashboard for now
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-6xl mx-auto p-4">
      {features.map((feature, index) => (
        <FeatureCard key={index} {...feature} />
      ))}
    </div>
  );
}
