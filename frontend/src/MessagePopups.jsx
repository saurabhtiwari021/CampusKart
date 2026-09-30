import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ImageIcon } from 'lucide-react';
import Avatar from './Avatar';

const VISIBLE_MS = 8000;

/**
 * One pop-up. Owns its own auto-dismiss timer, driven by requestAnimationFrame so that:
 *  - it only counts down while the tab is actually visible (rAF pauses in background tabs),
 *  - hovering or focusing it pauses the countdown, so you can read and click at your pace,
 *  - a follow-up message from the same person restarts it (`stamp` changes).
 * The thin bar along the bottom is the time left.
 */
function Popup({ popup, onDismiss, onOpen }) {
  const barRef = useRef(null);
  const paused = useRef(false);
  const dismissRef = useRef(onDismiss);
  useEffect(() => { dismissRef.current = onDismiss; });

  useEffect(() => {
    let elapsed = 0;
    let last = performance.now();
    let raf;
    const tick = (now) => {
      const dt = now - last;
      last = now;
      if (!paused.current) elapsed += dt;
      if (barRef.current) barRef.current.style.transform = `scaleX(${Math.max(0, 1 - elapsed / VISIBLE_MS)})`;
      if (elapsed >= VISIBLE_MS) { dismissRef.current(popup.chatId); return; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [popup.chatId, popup.stamp]);

  const { sender, preview, hasImage, listingTitle, count } = popup;

  return (
    <motion.div
      layout
      className="msg-popup"
      role="group"
      aria-label={`New message from ${sender.name}`}
      initial={{ opacity: 0, x: 48, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 48, scale: 0.96, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
      onMouseEnter={() => { paused.current = true; }}
      onMouseLeave={() => { paused.current = false; }}
      onFocus={() => { paused.current = true; }}
      onBlur={() => { paused.current = false; }}
      onKeyDown={(e) => { if (e.key === 'Escape') onDismiss(popup.chatId); }}
    >
      <button type="button" className="msg-popup-main" onClick={() => onOpen(popup.chatId)}>
        <Avatar user={sender} size={40} />
        <span className="msg-popup-text">
          <span className="msg-popup-name">{sender.name}</span>
          {listingTitle && <span className="msg-popup-ref">Re: {listingTitle}</span>}
          <span className="msg-popup-body">
            {hasImage && <ImageIcon className="w-3.5 h-3.5" strokeWidth={2} />}
            {preview}
          </span>
          {count > 1 && <span className="msg-popup-more">{count} new messages</span>}
        </span>
      </button>
      <button type="button" className="msg-popup-close" onClick={() => onDismiss(popup.chatId)} aria-label={`Dismiss message from ${sender.name}`}>
        <X className="w-4 h-4" strokeWidth={2} />
      </button>
      <span className="msg-popup-timer" aria-hidden="true"><span ref={barRef} /></span>
    </motion.div>
  );
}

/** Stack of "new message" pop-ups, newest on top. Each has a close button; clicking one opens that chat. */
export default function MessagePopups({ popups, onDismiss, onOpen }) {
  return (
    <div className="msg-popups" role="region" aria-label="New messages" aria-live="polite">
      <AnimatePresence initial={false} mode="popLayout">
        {popups.map((p) => <Popup key={p.chatId} popup={p} onDismiss={onDismiss} onOpen={onOpen} />)}
      </AnimatePresence>
    </div>
  );
}

