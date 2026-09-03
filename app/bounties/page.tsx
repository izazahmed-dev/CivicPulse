"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Coins, MapPin, AlertCircle, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";

interface Bounty {
  id: string;
  issueType: string;
  areaPath: string[];
  description: string;
  timestamp: number;
  reward: number;
}

export default function BountiesPage() {
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/bounties")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setBounties(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch bounties", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-6xl mt-20">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Civic Bounties
            </h1>
            <p className="text-white/50 mt-2">
              Transform your community and earn Civic Points by fixing local infrastructure issues.
            </p>
          </div>
          <div className="bg-[#0a0a0a] p-4 rounded-xl shadow-sm border border-white/[0.06] flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Coins className="text-yellow-500 w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-white/50 font-medium">Your Points</p>
              <p className="text-2xl font-bold text-white">0 <span className="text-sm font-normal text-white/50">CP</span></p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : bounties.length === 0 ? (
          <div className="bg-[#0a0a0a] rounded-2xl p-12 text-center shadow-sm border border-white/[0.06]">
            <AlertCircle className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-white">No Bounties Available</h2>
            <p className="text-white/50 mt-2">Check back later or report a new issue!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bounties.map((bounty) => (
              <div
                key={bounty.id}
                className="bg-[#0a0a0a] rounded-2xl border border-white/[0.06] overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full"
              >
                <div className="p-6 flex-grow">
                  <div className="flex justify-between items-start mb-4">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400">
                      <AlertCircle className="w-3 h-3" />
                      {bounty.issueType || "General Issue"}
                    </span>
                    <span className="inline-flex items-center gap-1 font-bold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-md text-sm">
                      <Coins className="w-4 h-4" />
                      {bounty.reward} CP
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                    {bounty.description || `${bounty.issueType} needs fixing`}
                  </h3>

                  <div className="flex items-start gap-2 text-sm text-white/50 mb-2">
                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2">
                      {Array.isArray(bounty.areaPath) ? bounty.areaPath.join(", ") : bounty.areaPath || "Location not specified"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <Clock className="w-3 h-3" />
                    <span>Reported {new Date(bounty.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="p-4 bg-white/[0.02] group-hover:bg-blue-500/10 transition-colors border-t border-white/[0.06] mt-auto">
                  <Link
                    href={`/bounties/${bounty.id}`}
                    className="w-full block text-center font-medium text-blue-400 group-hover:text-blue-300"
                  >
                    View Details & Claim →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

    </div>
  );
}
