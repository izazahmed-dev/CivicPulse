'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

type TransitionType = 'slide' | 'zoom' | 'flip' | 'morph' | 'liquidWipe';

const TRANSITION_MAP: Record<string, TransitionType> = {
  '/report': 'slide',
  '/dashboard': 'morph',
  '/community': 'slide',
  '/analytics': 'slide',
  '/forecast': 'liquidWipe',
  '/track': 'morph',
  '/leaderboard': 'flip',
  '/authority': 'zoom',
  '/bounties': 'slide',
  '/login': 'zoom',
};

function getTransitionType(pathname: string): TransitionType {
  if (TRANSITION_MAP[pathname]) return TRANSITION_MAP[pathname];
  for (const [route, type] of Object.entries(TRANSITION_MAP)) {
    if (pathname.startsWith(route)) return type;
  }
  return 'slide';
}

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

const slideVariants = {
  initial: { y: 30, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { duration: 0.6, ease } },
};

const zoomVariants = {
  initial: { scale: 0.95, opacity: 0, filter: 'blur(8px)' },
  animate: { scale: 1, opacity: 1, filter: 'blur(0px)', transition: { duration: 0.6, ease } },
};

const flipVariants = {
  initial: { rotateY: 8, opacity: 0, transformPerspective: 1200 },
  animate: { rotateY: 0, opacity: 1, transformPerspective: 1200, transition: { duration: 0.7, ease } },
};

const morphVariants = {
  initial: { scale: 0.97, opacity: 0, borderRadius: '16px' },
  animate: { scale: 1, opacity: 1, borderRadius: '0px', transition: { duration: 0.6, ease } },
};

const liquidWipeVariants = {
  initial: { clipPath: 'circle(0% at 50% 50%)', opacity: 0 },
  animate: { clipPath: 'circle(150% at 50% 50%)', opacity: 1, transition: { duration: 0.9, ease } },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const VARIANT_MAP: Record<TransitionType, any> = {
  slide: slideVariants,
  zoom: zoomVariants,
  flip: flipVariants,
  morph: morphVariants,
  liquidWipe: liquidWipeVariants,
};

interface PageTransitionProps {
  children: React.ReactNode;
  transition?: TransitionType;
}

export default function PageTransition({ children, transition }: PageTransitionProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const type = transition || getTransitionType(pathname);
  const variants = VARIANT_MAP[type];

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <motion.div
        key={pathname + '-wipe'}
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: 0.7, ease, delay: 0.05 }}
        className="fixed inset-0 z-[9999] bg-[#050505] origin-right pointer-events-none"
      />

      <motion.div
        key={pathname}
        variants={variants}
        initial="initial"
        animate="animate"
        className="w-full"
        style={{ transformOrigin: 'center center' }}
      >
        {children}
      </motion.div>
    </>
  );
}

export type { TransitionType };
