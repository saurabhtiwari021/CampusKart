import { Fragment, useEffect, useRef } from 'react';
import { motion, animate, useReducedMotion, useScroll, useSpring } from 'framer-motion';

export const EASE = [0.22, 1, 0.36, 1];

/** Headline reveal: each word rises out of its own mask, one after another. Wraps naturally. */
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
              initial={reduce ? false : { y: '110%' }}
              animate={{ y: 0 }}
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
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: EASE, delay },
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
  return <motion.div className="scroll-progress" style={{ scaleX }} aria-hidden="true" />;
}
