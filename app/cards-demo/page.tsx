import React from "react";
import FeatureGrid from "@/components/FeatureGrid";
import ActionCards from "@/components/ActionCards";

export default function CardsDemoPage() {
  return (
    <main className="min-h-screen bg-[#0a192f] p-8 md:p-16 flex flex-col gap-12">
      <div className="max-w-7xl mx-auto w-full space-y-12">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-white">UI Components Demo</h1>
          <p className="text-gray-400">
            Showcasing the new card components based on the design system.
          </p>
        </div>

        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-blue-300 border-b border-blue-900/30 pb-2">
            1. Feature Grid (4-Card User Flow)
          </h2>
          <FeatureGrid />
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-blue-300 border-b border-blue-900/30 pb-2">
            2. Action Cards (Primary CTAs)
          </h2>
          <div className="flex justify-center">
            <ActionCards />
          </div>
        </section>

        <section className="space-y-6">
            <h2 className="text-xl font-semibold text-blue-300 border-b border-blue-900/30 pb-2">
                3. Combined Layout Preview (Side-by-Side)
            </h2>
            <div className="flex flex-col lg:flex-row gap-8 items-start">
                <div className="flex-1">
                    <FeatureGrid />
                </div>
                <div className="w-full lg:w-1/3">
                    <ActionCards />
                </div>
            </div>
        </section>
      </div>
    </main>
  );
}
