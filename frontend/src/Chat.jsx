import { useState, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { MessageCircle, Camera, Hand, Search, ChevronDown, ChevronRight, X } from 'lucide-react';
import { useApp } from './AppContext';
import { Ico } from './icons';
import Avatar from './Avatar';
import { api } from './api';
import { timeAgo, timeShort, inr, idOf } from './utils';

const GROUP_GAP_MS = 5 * 60 * 1000;
const NEAR_BOTTOM_PX = 140;
const QUICK_REPLIES = [
  'Is this still available?',
  'Can we meet on campus?',
  'Is the price negotiable?',
  'Could you share more photos?',
];

/* ── helpers ────────────────────────────────────────────────────────────── */
const dayKey = (ts) => new Date(ts).toDateString();

function dayLabel(ts) {
  const d = new Date(ts);
  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === now.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short',
    ...(d.getFullYear() !== now.getFullYear() ? { year: 'numeric' } : {}),
  });
}

/** Flattens messages into render items: day dividers + messages tagged with their place in a run from one sender. */
function buildItems(messages, meId) {
  const out = [];
  messages.forEach((m, i) => {
    const prev = messages[i - 1];
    const next = messages[i + 1];
    const newDay = !prev || dayKey(prev.created_at) !== dayKey(m.created_at);
    if (newDay) out.push({ type: 'day', key: `day-${m.id}`, label: dayLabel(m.created_at) });
    const sender = idOf(m.sender);
    const continuesPrev = prev && !newDay && idOf(prev.sender) === sender && m.created_at - prev.created_at < GROUP_GAP_MS;
    const continuesNext = next && dayKey(next.created_at) === dayKey(m.created_at) && idOf(next.sender) === sender && next.created_at - m.created_at < GROUP_GAP_MS;
    out.push({ type: 'msg', key: m.id, m, mine: sender === meId, first: !continuesPrev, last: !continuesNext });
  });
  return out;
}

function useTypingEmitter(socket, chatId) {
  const lastRef = useRef(0);
  return () => {
    if (!socket || !chatId) return;
    const now = Date.now();
    if (now - lastRef.current < 2000) return;
    lastRef.current = now;
    socket.emit('typing', { chatId });
  };
}

/* ── main section ───────────────────────────────────────────────────────── */
export function ChatSection() {
  const { user, socket, openChatId, setOpenChatId, toast, navigate, chatUnread, seedChatUnread, markChatRead, setActiveChatId } = useApp();
  const [chats, setChats] = useState([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [typingFrom, setTypingFrom] = useState(false);
  const [query, setQuery] = useState('');
  const [lightbox, setLightbox] = useState(null);
  const [newBelow, setNewBelow] = useState(0);
  const [showJump, setShowJump] = useState(false);

  const meId = user.user_id;
  const activeChatRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const scrollRef = useRef(null);
  const atBottomRef = useRef(true);
  const refreshedForRef = useRef(null);

  useEffect(() => { activeChatRef.current = activeChat; }, [activeChat]);

  // Tell the app which thread is on screen so it doesn't pop up about it.
  useEffect(() => {
    setActiveChatId(activeChat?.id || null);
    return () => setActiveChatId(null);
    // eslint-disable-next-line
  }, [activeChat?.id]);

  const refreshChats = () =>
    api.chats.list()
      .then(({ data }) => { setChats(data.chats); seedChatUnread(data.chats); })
      .catch(() => toast.error('Could not load chats.'))
      .finally(() => setLoadingChats(false));

  useEffect(() => { refreshChats(); }, []);

  const scrollToBottom = (smooth = true) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
    atBottomRef.current = true;
    setNewBelow(0);
    setShowJump(false);
  };

  const openChat = (chat) => {
    setActiveChat(chat);
    setMessages([]);
    setTypingFrom(false);
    setNewBelow(0);
    setShowJump(false);
    atBottomRef.current = true;
    setLoadingMessages(true);
    markChatRead(chat.id);
    socket?.emit('join_chat', { chatId: chat.id }); // joins the room + marks their messages seen
    api.chats.messages(chat.id)
      .then(({ data }) => setMessages(data.messages))
      .catch(() => toast.error('Could not load messages.'))
      .finally(() => setLoadingMessages(false));
  };

  // Arrived from "Chat with seller" or from a message pop-up — open that chat
  // once the list has loaded. If the chat is brand new to us, refresh once.
  useEffect(() => {
    if (!openChatId || loadingChats) return;
    const found = chats.find((c) => c.id === openChatId);
    if (found) { openChat(found); setOpenChatId(null); return; }
    if (refreshedForRef.current !== openChatId) {
      refreshedForRef.current = openChatId;
      refreshChats();
    } else {
      setOpenChatId(null);
    }
    // eslint-disable-next-line
  }, [openChatId, loadingChats, chats]);

  // Socket listeners live for as long as this section is mounted.
  useEffect(() => {
    if (!socket) return;

    const bumpChat = (chatId, lastMessage) =>
      setChats((prev) => {
        const idx = prev.findIndex((c) => c.id === chatId);
        if (idx === -1) { refreshChats(); return prev; } // a chat we don't know about yet
        const updated = { ...prev[idx], lastMessage, updated_at: lastMessage.created_at };
        return [updated, ...prev.filter((_, i) => i !== idx)];
      });

    const onNewMessage = (msg) => {
      if (activeChatRef.current && msg.chat === activeChatRef.current.id) {
        setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, { ...msg, fresh: true }]));
        // Someone wrote while this thread is open and visible: mark it read so
        // their double tick turns on right away.
        if (idOf(msg.sender) !== meId && document.visibilityState === 'visible') {
          socket.emit('join_chat', { chatId: msg.chat });
        }
      }
      bumpChat(msg.chat, msg);
    };

    // Reaches us for every chat (not just the opened one) — keeps the list preview live.
    const onIncoming = (p) => {
      bumpChat(p.chatId, {
        id: p.messageId, chat: p.chatId, sender: p.sender.user_id,
        text: p.text, image: p.hasImage ? 'photo' : '', created_at: p.created_at,
      });
    };

    const onSeen = ({ chatId, seenBy }) => {
      setMessages((prev) => prev.map((m) => {
        if (m.chat !== chatId || m.seenBy?.includes(seenBy)) return m;
        return { ...m, seenBy: [...(m.seenBy || []), seenBy] };
      }));
    };

    const onTyping = ({ userId }) => {
      if (!activeChatRef.current || activeChatRef.current.otherUser?.user_id !== userId) return;
      setTypingFrom(true);
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setTypingFrom(false), 3000);
    };

    const onSocketError = ({ message } = {}) => { if (message) toast.error(message); };

    socket.on('new_message', onNewMessage);
    socket.on('message:incoming', onIncoming);
    socket.on('messages_seen', onSeen);
    socket.on('typing', onTyping);
    socket.on('error', onSocketError);
    return () => {
      socket.off('new_message', onNewMessage);
      socket.off('message:incoming', onIncoming);
      socket.off('messages_seen', onSeen);
      socket.off('typing', onTyping);
      socket.off('error', onSocketError);
      clearTimeout(typingTimeoutRef.current);
    };
    // eslint-disable-next-line
  }, [socket]);

  // Coming back to the tab with a thread open: whatever arrived meanwhile is now read.
  useEffect(() => {
    const onVisible = () => {
      const chat = activeChatRef.current;
      if (document.visibilityState !== 'visible' || !chat) return;
      markChatRead(chat.id);
      socket?.emit('join_chat', { chatId: chat.id });
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
    // eslint-disable-next-line
  }, [socket]);

  /* scrolling: open at the bottom; follow new messages only if you're already there */
  useLayoutEffect(() => {
    if (!loadingMessages && activeChat) scrollToBottom(false);
    // eslint-disable-next-line
  }, [loadingMessages, activeChat?.id]);

  const lastMsg = messages[messages.length - 1];
  useEffect(() => {
    if (!lastMsg || loadingMessages) return;
    if (atBottomRef.current || idOf(lastMsg.sender) === meId) scrollToBottom(true);
    else if (lastMsg.fresh) { setNewBelow((n) => n + 1); setShowJump(true); }
    // eslint-disable-next-line
  }, [lastMsg?.id]);

  useEffect(() => {
    if (typingFrom && atBottomRef.current) scrollToBottom(true);
    // eslint-disable-next-line
  }, [typingFrom]);

  const onScroll = (e) => {
    const el = e.currentTarget;
    const near = el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX;
    atBottomRef.current = near;
    if (near) { setShowJump(false); setNewBelow(0); } else setShowJump(true);
  };

  const sendText = (text) => {
    const trimmed = text.trim();
    if (!trimmed || !socket || !activeChat) return false;
    socket.emit('send_message', { chatId: activeChat.id, text: trimmed });
    return true;
  };

  const items = useMemo(() => buildItems(messages, meId), [messages, meId]);

  const visibleChats = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return chats;
    return chats.filter((c) =>
      (c.otherUser?.name || '').toLowerCase().includes(q) || (c.listing?.title || '').toLowerCase().includes(q));
  }, [chats, query]);

  if (loadingChats) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Ico n="loader" c="w-7 h-7 spin" /></div>;
  }

  if (chats.length === 0) {
    return (
      <div className="empty-state">
        <div className="icon-wrap"><MessageCircle className="w-11 h-11" strokeWidth={1.75}/></div>
        <h3>No conversations yet</h3>
        <p style={{ color: 'var(--text-soft)', marginBottom: 20 }}>Message a seller from any listing to start chatting.</p>
        <button className="btn btn-primary" onClick={() => navigate('/marketplace')}>Browse Marketplace</button>
      </div>
    );
  }

  const other = activeChat?.otherUser;
  const listing = activeChat?.listing;

  return (
    <div>
      <h2 className="flex items-center gap-2" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.6rem', marginBottom: 20 }}><MessageCircle className="w-6 h-6" strokeWidth={2}/> Chats</h2>
      <div className={`chat-shell ${activeChat ? 'thread-open' : ''}`}>
        {/* List pane */}
        <div className="chat-list-pane">
          <label className="chat-search">
            <Search className="w-4 h-4" strokeWidth={2} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search chats" aria-label="Search chats" />
          </label>
          <LayoutGroup>
            {visibleChats.map((c) => {
              const mine = c.lastMessage && idOf(c.lastMessage.sender) === meId;
              const isPhoto = !!c.lastMessage?.image;
              const unread = activeChat?.id === c.id ? 0 : (chatUnread[c.id] || 0);
              return (
                <motion.button
                  layout="position"
                  transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                  key={c.id}
                  className={`chat-list-item ${activeChat?.id === c.id ? 'active' : ''} ${unread ? 'unread' : ''}`}
                  onClick={() => openChat(c)}
                >
                  <Avatar user={c.otherUser} size={44} />
                  <div className="grow">
                    <div className="ttl">{c.otherUser?.name || 'Deleted user'}</div>
                    <div className="preview flex items-center gap-1">
                      {mine && <span className="opacity-70">You: </span>}
                      {isPhoto && <Camera className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2}/>}
                      {c.lastMessage ? (isPhoto ? 'Photo' : c.lastMessage.text) : (<><Hand className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2}/> Say hi</>)}
                    </div>
                    <div className="listing-ref">{c.listing?.title}</div>
                  </div>
                  <div className="chat-list-side">
                    {c.lastMessage && <span className="time">{timeAgo(c.lastMessage.created_at)}</span>}
                    <AnimatePresence>
                      {unread > 0 && (
                        <motion.span
                          className="unread-pill"
                          initial={{ scale: 0.4, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.4, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 600, damping: 28 }}
                          aria-label={`${unread} unread`}
                        >
                          {unread > 9 ? '9+' : unread}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.button>
              );
            })}
          </LayoutGroup>
          {visibleChats.length === 0 && <p className="chat-list-empty">No chats match “{query}”.</p>}
        </div>

        {/* Thread pane */}
        <div className="chat-thread-pane">
          {!activeChat ? (
            <div className="chat-placeholder">
              <div className="chat-placeholder-mark"><MessageCircle className="w-7 h-7" strokeWidth={1.5} /></div>
              <p>Pick a conversation to read it</p>
            </div>
          ) : (
            <>
              <div className="chat-thread-head">
                <button className="chat-back-btn" onClick={() => setActiveChat(null)} aria-label="Back to chats"><Ico n="chevleft" c="w-5 h-5" /></button>
                <Avatar user={other} size={40} />
                <div className="grow" style={{ minWidth: 0 }}>
                  <div className="chat-head-name">{other?.name || 'Deleted user'}</div>
                  <div className="chat-head-sub" aria-live="polite">
                    {typingFrom ? <span className="typing-label">typing<span className="typing-dots inline"><i></i><i></i><i></i></span></span> : (other?.department || other?.college || 'Campus seller')}
                  </div>
                </div>
              </div>

              {listing && (
                <button className="chat-listing" onClick={() => listing.id && navigate(`/listing/${listing.id}`)}>
                  {listing.images?.[0] && <img src={listing.images[0]} alt="" />}
                  <span className="chat-listing-text">
                    <span className="chat-listing-title">{listing.title}</span>
                    <span className="chat-listing-price">{inr(listing.price)}</span>
                  </span>
                  <span className="chat-listing-cta">View listing <ChevronRight className="w-4 h-4" strokeWidth={2} /></span>
                </button>
              )}

              <div className="chat-messages" ref={scrollRef} onScroll={onScroll}>
                {loadingMessages ? (
                  <div className="chat-skeleton" aria-hidden="true">
                    {[58, 38, 66, 44].map((w, i) => (
                      <div key={i} className={`skel ${i % 2 ? 'r' : ''}`} style={{ width: `${w}%` }} />
                    ))}
                  </div>
                ) : (
                  <>
                    {items.length === 0 && (
                      <div className="chat-empty-thread">
                        <p>Say hello to {other?.name?.split(' ')[0] || 'them'}. A quick question usually gets the fastest reply.</p>
                        <div className="quick-replies">
                          {QUICK_REPLIES.map((q) => (
                            <button key={q} type="button" className="chip chip-sm" onClick={() => sendText(q)}>{q}</button>
                          ))}
                        </div>
                      </div>
                    )}
                    {items.map((it) => it.type === 'day'
                      ? <div key={it.key} className="day-divider"><span>{it.label}</span></div>
                      : <MessageBubble key={it.key} item={it} otherUserId={other?.user_id} onOpenImage={setLightbox} />)}
                    <AnimatePresence>
                      {typingFrom && (
                        <motion.div
                          className="bubble-row theirs first last"
                          initial={{ opacity: 0, y: 8, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.12 } }}
                          style={{ transformOrigin: 'bottom left' }}
                        >
                          <div className="bubble typing-bubble"><span className="typing-dots"><i></i><i></i><i></i></span></div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </div>

              <AnimatePresence>
                {showJump && (
                  <motion.button
                    className="chat-jump"
                    onClick={() => scrollToBottom(true)}
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                  >
                    <ChevronDown className="w-4 h-4" strokeWidth={2.25} />
                    {newBelow > 0 ? `${newBelow} new message${newBelow > 1 ? 's' : ''}` : 'Latest'}
                  </motion.button>
                )}
              </AnimatePresence>

              <ChatInputBar key={activeChat.id} chat={activeChat} socket={socket} onSend={sendText} />
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}
      </AnimatePresence>
    </div>
  );
}

/* ── one message ────────────────────────────────────────────────────────── */
function MessageBubble({ item, otherUserId, onOpenImage }) {
  const { m, mine, first, last } = item;
  const seen = mine && otherUserId && m.seenBy?.map(String).includes(String(otherUserId));
  return (
    <motion.div
      className={`bubble-row ${mine ? 'mine' : 'theirs'} ${first ? 'first' : ''} ${last ? 'last' : ''}`}
      // Only messages that arrive live animate in; loading history stays still.
      initial={m.fresh ? { opacity: 0, y: 12, scale: 0.94 } : false}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 520, damping: 34 }}
      style={{ transformOrigin: mine ? 'bottom right' : 'bottom left' }}
    >
      <div className={`bubble ${m.image ? 'has-image' : ''}`}>
        {m.image
          ? <img src={m.image} alt="Shared photo" onClick={() => onOpenImage(m.image)} />
          : <p>{m.text}</p>}
        {last && (
          <span className="bubble-meta">
            {timeShort(m.created_at)}
            {mine && <Ico n={seen ? 'checkdouble' : 'check'} c="w-3.5 h-3.5" style={{ stroke: seen ? 'var(--champagne)' : 'currentColor' }} />}
          </span>
        )}
      </div>
    </motion.div>
  );
}

/* ── composer ───────────────────────────────────────────────────────────── */
function ChatInputBar({ chat, socket, onSend }) {
  const { toast } = useApp();
  const [text, setText] = useState('');
  const [sendingImage, setSendingImage] = useState(false);
  const fileRef = useRef(null);
  const taRef = useRef(null);
  const emitTyping = useTypingEmitter(socket, chat?.id);
  const canSend = !!text.trim();

  const grow = () => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 132)}px`;
  };
  useEffect(grow, [text]);

  const send = () => {
    if (onSend(text)) { setText(''); requestAnimationFrame(() => taRef.current?.focus()); }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(); }
  };

  const onPickImage = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setSendingImage(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      await api.chats.sendImage(chat.id, fd); // the resulting new_message socket event is what renders it
    } catch (err) {
      toast.error(err.message || 'Could not send image');
    } finally {
      setSendingImage(false);
    }
  };

  return (
    <div className="chat-input-bar">
      <input type="file" ref={fileRef} accept="image/*" style={{ display: 'none' }} onChange={onPickImage} />
      <button className="icon-btn" onClick={() => fileRef.current?.click()} disabled={sendingImage} title="Send a photo" aria-label="Send a photo">
        {sendingImage ? <Ico n="loader" c="w-5 h-5 spin" /> : <Ico n="camera" c="w-5 h-5" />}
      </button>
      <textarea
        ref={taRef}
        className="chat-textarea"
        rows={1}
        value={text}
        onChange={(e) => { setText(e.target.value); emitTyping(); }}
        onKeyDown={onKeyDown}
        placeholder="Write a message"
        aria-label="Write a message"
      />
      <motion.button
        className={`chat-send ${canSend ? 'ready' : ''}`}
        onClick={send}
        disabled={!canSend}
        aria-label="Send message"
        whileTap={canSend ? { scale: 0.86 } : undefined}
        animate={{ scale: canSend ? 1 : 0.92 }}
        transition={{ type: 'spring', stiffness: 600, damping: 26 }}
      >
        <Ico n="send" c="w-5 h-5" />
      </motion.button>
    </div>
  );
}

/* ── photo viewer ───────────────────────────────────────────────────────── */
function Lightbox({ src, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <motion.div
      className="lightbox"
      role="dialog"
      aria-label="Photo"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <button className="lightbox-close" onClick={onClose} aria-label="Close photo"><X className="w-5 h-5" strokeWidth={2} /></button>
      <motion.img
        src={src}
        alt="Shared photo"
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
      />
    </motion.div>
  );
}
