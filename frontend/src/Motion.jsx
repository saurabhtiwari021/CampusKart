import { Fragment, useEffect, useRef, useState } from 'react';
import { motion, animate, useReducedMotion, useScroll, useSpring, useTransform, useMotionValue } from 'framer-motion';

export const EASE = [0.22, 1, 0.36, 1];

export function SplitWords({ text, delay = 0, stagger = 0.055 }) {
  const reduce = useReducedMotion();
  return (
    <span aria-hidden="true">
      {text.split(' ').map((w, i) => (
        <Fragment key={i}>
          {i > 0 && ' '}
          <span className="sw-mask">
            <motion.span
              className="sw-word"
              initial={reduce ? false : { y: '110%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.9, ease: EASE, delay: delay + i * stagger }}
            >
              {w}
            </motion.span>
          </span>
        </Fragment>
      ))}
    </span>
  );
}

/** Props for a soft fade-up used to sequence the hero after the headline. */
export const fadeUp = (delay = 0, reduce = false) => reduce ? {} : ({
  initial: { opacity: 0, y: 24, filter: 'blur(8px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { duration: 0.9, ease: EASE, delay },
});

/** Counts up to `to` when mounted (and again if `to` changes). Writes to the DOM directly — no re-renders. */
export function CountUp({ to, format = (n) => Math.round(n).toLocaleString('en-IN'), duration = 1.1 }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const fromRef = useRef(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduce) { el.textContent = format(to); fromRef.current = to; return; }
    const controls = animate(fromRef.current, to, {
      duration, ease: EASE,
      onUpdate: (v) => { el.textContent = format(v); },
      onComplete: () => { fromRef.current = to; },
    });
    return () => controls.stop();
    // eslint-disable-next-line
  }, [to]);
  return <span ref={ref}>{format(0)}</span>;
}

/** A hairline along the bottom of the navbar showing how far down the page you are. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });
  return <motion.div className="scroll-progress" style={{ scaleX }} aria-hidden="true" />
}

/** Magnetic button: the element subtly moves toward the cursor on hover */
export function MagneticWrap({ children, strength = 0.3 }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 250, damping: 20 });
  const sy = useSpring(y, { stiffness: 250, damping: 20 });
  const reduce = useReducedMotion();

  const handleMove = (e) => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * strength);
    y.set((e.clientY - cy) * strength);
  };
  const handleLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      ref={ref}
      style={{ x: sx, y: sy, display: 'inline-flex' }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {children}
    </motion.div>
  );
}

/** Scroll-based parallax: moves children at a different rate than scroll */
export function ParallaxLayer({ children, speed = 0.5, className = '' }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [speed * -100, speed * 100]);
  const smoothY = useSpring(y, { stiffness: 100, damping: 30 });
  return (
    <motion.div ref={ref} style={{ y: smoothY }} className={className}>
      {children}
    </motion.div>
  );
}
