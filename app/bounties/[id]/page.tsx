"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Coins, MapPin, AlertCircle, Clock, CheckCircle2,
    Upload, Camera, User, Loader2
} from "lucide-react";
import Navbar from "@/components/Navbar";

// Simple mock user generator for hackathon demo
const getMockUserId = () => {
    if (typeof window !== 'undefined') {
        let uid = localStorage.getItem('mockUserId');
        if (!uid) {
            uid = 'user_' + Math.random().toString(36).substring(2, 9);
            localStorage.setItem('mockUserId', uid);
        }
        return uid;
    }
    return 'user_fallback';
};

interface Bounty {
    id: string;
    issueType: string;
    areaPath: string[];
    description: string;
    timestamp: number;
    reward: number;
    status: string;
    claimedBy?: string;
    aiVerificationExplanation?: string;
}

export default function BountyDetailPage() {
    const params = useParams();
    const router = useRouter();
    const bountyId = params.id as string;

    const [bounty, setBounty] = useState<Bounty | null>(null);
    const [loading, setLoading] = useState(true);
    const [claiming, setClaiming] = useState(false);
    const [verifying, setVerifying] = useState(false);

    // UI state
    const [proofImageBase64, setProofImageBase64] = useState<string>("");
    const [verifyResult, setVerifyResult] = useState<{ success: boolean, message: string, explanation?: string, approved?: boolean } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const currentUserId = getMockUserId();

    useEffect(() => {
        if (!bountyId) return;

        fetch(`/api/bounties/${bountyId}`)
            .then(res => res.json())
            .then(data => {
                setBounty(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch bounty details", err);
                setLoading(false);
            });
    }, [bountyId]);

    const handleClaim = async () => {
        setClaiming(true);
        try {
            const res = await fetch(`/api/bounties/${bountyId}/claim`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUserId })
            });
            const data = await res.json();

            if (res.ok && data.success) {
                // Optimistically update UI
                setBounty(prev => prev ? { ...prev, status: 'IN_PROGRESS', claimedBy: currentUserId } : null);
            } else {
                alert(data.error || "Failed to claim bounty");
            }
        } catch (err) {
            console.error("Error claiming:", err);
            alert("An error occurred while claiming.");
        } finally {
            setClaiming(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setProofImageBase64(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmitProof = async () => {
        if (!proofImageBase64) return;
        setVerifying(true);
        setVerifyResult(null);

        try {
            const res = await fetch(`/api/bounties/${bountyId}/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: currentUserId,
                    proofImageBase64
                })
            });
            const data = await res.json();

            setVerifyResult(data);

            if (data.success && data.approved) {
                setBounty(prev => prev ? { ...prev, status: 'RESOLVED', aiVerificationExplanation: data.explanation } : null);
            }
        } catch (err) {
            console.error("Error verifying:", err);
            setVerifyResult({ success: false, message: "Network error occurred." });
        } finally {
            setVerifying(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (!bounty) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white">Bounty not found</h1>
                    <button onClick={() => router.push('/bounties')} className="mt-4 text-blue-400 hover:underline">
                        Return to Bounties
                    </button>
                </div>
            </div>
        );
    }

    const isMyClaim = bounty.claimedBy === currentUserId;

    return (
        <div className="min-h-screen bg-[#050505] pb-20">
            <Navbar />

            <main className="container mx-auto px-4 py-8 max-w-4xl mt-20">
                <button onClick={() => router.push('/bounties')} className="text-blue-400 hover:text-blue-300 mb-6 font-medium text-sm">
                    ← Back to Bounties
                </button>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Details */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-[#0a0a0a] rounded-2xl p-8 border border-white/[0.06] shadow-sm">
                            <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
                                <div>
                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                                        ${bounty.status === 'OPEN' ? 'bg-green-500/10 text-green-400' :
                                            bounty.status === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-400' :
                                                'bg-white/[0.06] text-white/50'}`}>
                                        {bounty.status ? bounty.status.replace('_', ' ') : 'OPEN'}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs text-white/50 block mb-1">Bounty Reward</span>
                                    <span className="inline-flex items-center gap-1 font-bold text-yellow-500 bg-yellow-500/10 px-3 py-1.5 rounded-lg text-lg border border-yellow-500/20 shadow-sm">
                                        <Coins className="w-5 h-5" />
                                        {bounty.reward || 20} CP
                                    </span>
                                </div>
                            </div>

                            <h1 className="text-3xl font-extrabold text-white mb-4">{bounty.issueType || "Civic Issue"}</h1>

                            <p className="text-white/70 leading-relaxed mb-6 text-lg">
                                {bounty.description || "No specific description provided. Please investigate the area and resolve the issue type mentioned."}
                            </p>

                            <div className="space-y-3 bg-white/[0.03] p-4 rounded-xl border border-white/[0.06]">
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-white/40 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-white/70">Location</p>
                                        <p className="text-white/50">{Array.isArray(bounty.areaPath) ? bounty.areaPath.join(" > ") : bounty.areaPath || "Not specified"}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Clock className="w-5 h-5 text-white/40 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-white/70">Reported on</p>
                                        <p className="text-white/50">{new Date(bounty.timestamp).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* AI Verification Section (if resolved) */}
                        {bounty.status === 'RESOLVED' && (
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <CheckCircle2 className="w-32 h-32 text-green-600" />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-4">
                                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                                        <h2 className="text-2xl font-bold text-green-800">Bounty Verified & Resolved</h2>
                                    </div>
                                    <p className="font-semibold text-green-900 mb-2">AI Inspector Report:</p>
                                    <p className="text-green-800 italic bg-white/60 p-4 rounded-lg border border-green-100 shadow-inner">
                                        &quot;{bounty.aiVerificationExplanation || "The provided proof successfully verified the resolution of this issue."}&quot;
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Action Area */}
                    <div className="md:col-span-1">
                        <div className="bg-[#0a0a0a] rounded-2xl p-6 border border-white/[0.06] shadow-sm sticky top-24">
                            <h3 className="text-xl font-bold text-white mb-4">Action Center</h3>

                            {bounty.status === 'OPEN' && (
                                <div>
                                    <p className="text-sm mb-4 text-white/50">
                                        Claim this bounty to lock it. You will be responsible for resolving the issue and providing photographic proof.
                                    </p>
                                    <button
                                        onClick={handleClaim}
                                        disabled={claiming}
                                        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex justify-center items-center h-12"
                                    >
                                        {claiming ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Claim Bounty'}
                                    </button>
                                </div>
                            )}

                            {bounty.status === 'IN_PROGRESS' && isMyClaim && (
                                <div className="space-y-4">
                                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex gap-2">
                                        <User className="w-5 h-5 text-blue-400 shrink-0" />
                                        <p className="text-sm font-medium text-blue-300">You claimed this bounty! Upload proof to earn points.</p>
                                    </div>

                                    <div className="border-2 border-dashed border-white/[0.12] rounded-xl p-4 text-center hover:bg-white/[0.03] transition-colors cursor-pointer"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <input
                                            type="file"
                                            accept="image/*"
                                            capture="environment"
                                            className="hidden"
                                            ref={fileInputRef}
                                            onChange={handleImageUpload}
                                        />
                                        {proofImageBase64 ? (
                                            <div className="space-y-2">
                                                <img src={proofImageBase64} alt="Proof" className="w-full h-32 object-cover rounded-lg border border-white/[0.06]" />
                                                <p className="text-xs text-blue-400 font-semibold">Change Image</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2 py-6">
                                                <Camera className="w-8 h-8 text-white/30 mx-auto" />
                                                <p className="text-sm font-medium text-white/50">Take Photo or Upload</p>
                                            </div>
                                        )}
                                    </div>

                                    {verifyResult && (
                                        <div className={`p-4 rounded-xl text-sm border ${verifyResult.success && verifyResult.approved ? 'bg-green-500/10 border-green-500/20 text-green-300' : 'bg-red-500/10 border-red-500/20 text-red-300'}`}>
                                            <p className="font-bold">{verifyResult.success && verifyResult.approved ? 'Success!' : 'AI Rejected Proof'}</p>
                                            <p className="mt-1">{verifyResult.explanation || verifyResult.message}</p>
                                        </div>
                                    )}

                                    <button
                                        onClick={handleSubmitProof}
                                        disabled={!proofImageBase64 || verifying}
                                        className="w-full py-3 px-4 bg-white hover:bg-white/90 text-black rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex justify-center items-center h-12 mt-2 gap-2"
                                    >
                                        {verifying ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                            <>
                                                <Upload className="w-4 h-4" />
                                                Verify & Complete
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}

                            {bounty.status === 'IN_PROGRESS' && !isMyClaim && (
                                <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl text-center">
                                    <AlertCircle className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                                    <p className="text-sm font-semibold text-orange-300">Someone else is currently working on this bounty.</p>
                                </div>
                            )}

                            {bounty.status === 'RESOLVED' && (
                                <div className="text-center py-6">
                                    <div className="inline-flex bg-green-500/10 p-3 rounded-full mb-3">
                                        <CheckCircle2 className="w-8 h-8 text-green-400" />
                                    </div>
                                    <p className="font-bold text-white">Task Completed</p>
                                    <p className="text-sm text-white/50 mt-1">Reward has been distributed.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
