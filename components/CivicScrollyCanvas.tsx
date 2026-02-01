'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useScroll, useMotionValueEvent, useTransform } from 'framer-motion';

const FRAME_COUNT = 144; // 0 to 143
const FOLDER_PATH = '/ezgif-split%20(1)';

export default function CivicScrollyCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [loadedCount, setLoadedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const { scrollYProgress } = useScroll();

  // Transform scroll (0-1) to frame index (0-143)
  const currentFrame = useTransform(scrollYProgress, [0, 1], [0, FRAME_COUNT - 1]);

  // Preload images
  useEffect(() => {
    const loadImages = async () => {
      const loadedImages: HTMLImageElement[] = [];
      const promises: Promise<void>[] = [];

      for (let i = 0; i < FRAME_COUNT; i++) {
        const promise = new Promise<void>((resolve, reject) => {
          const img = new Image();
          const frameNum = i.toString().padStart(3, '0');
          img.src = `${FOLDER_PATH}/frame_${frameNum}.webp`;
          img.onload = () => {
            setLoadedCount(prev => prev + 1);
            resolve();
          };
          img.onerror = (e) => {
            console.error(`Failed to load frame ${i}`, e);
            // Resolve anyway to prevent blocking
            resolve();
          };
          loadedImages[i] = img;
        });
        promises.push(promise);
      }

      await Promise.all(promises);
      setImages(loadedImages);
      setIsLoading(false);
    };

    loadImages();
  }, []);

  // Render frame logic
  const renderFrame = (index: number) => {
    const canvas = canvasRef.current;
    if (!canvas || images.length === 0) return;

    // Clamp index
    const frameIndex = Math.min(FRAME_COUNT - 1, Math.max(0, Math.floor(index)));
    const img = images[frameIndex];

    if (!img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Responsive Canvas Drawing (Cover)
    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.width;
    const ih = img.height;

    const scale = Math.max(cw / iw, ch / ih);
    const x = (cw - iw * scale) / 2;
    const y = (ch - ih * scale) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, x, y, iw * scale, ih * scale);
  };

  // Update on scroll
  useMotionValueEvent(currentFrame, "change", (latest) => {
    if (!isLoading) {
      renderFrame(latest);
    }
  });

  // Handle Resize and Initial Render
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
        // Re-render current frame
        if (!isLoading && images.length > 0) {
          renderFrame(currentFrame.get());
        }
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Init

    // Initial render call after loading
    if (!isLoading && images.length > 0) {
      handleResize(); // ensure size
      renderFrame(0);
    }

    return () => window.removeEventListener('resize', handleResize);
  }, [isLoading, images]); // Re-run when loading finishes

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a192f] text-[#e6f1ff]">
        <div className="w-16 h-16 mb-4 border-4 border-t-transparent border-[#06d6a0] rounded-full animate-spin"></div>
        <p className="font-mono tracking-widest uppercase">Initializing Municipal Data Stream...</p>
        <p className="text-sm text-slate-400 mt-2">{Math.floor((loadedCount / FRAME_COUNT) * 100)}% Loaded</p>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full object-cover z-0"
      style={{ pointerEvents: 'none' }} // Allow text overlays to be interactive
    />
  );
}
