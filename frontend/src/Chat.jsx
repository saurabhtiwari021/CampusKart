/* ── Chat (Phase 4 — real-time messaging over Socket.io) ─────────────────
 * ChatSection renders inside Dashboard's "chats" tab: a chat list on the
 * left, the active thread on the right (stacked on mobile). It owns all the
 * socket listening for the lifetime it's mounted; ListingDetail's "Chat with
 * seller" modal only needs to create the chat + send the first message, then
 * hands off here via AppContext's openChatId.
 */
import { useState, useEffect, useRef } from 'react';
import { useApp } from './AppContext';
import { Ico } from './icons';
import { api } from './api';
import { timeAgo, timeShort } from './utils';

/** Throttles 'typing' emits to roughly once every 2s, per the spec — a plain
 * timestamp check rather than pulling in a debounce library. */
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

export function ChatSection() {
  const { user, socket, openChatId, setOpenChatId, toast, navigate } = useApp();
  const [chats, setChats] = useState([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [typingFrom, setTypingFrom] = useState(false);

  const activeChatRef = useRef(null);
  useEffect(() => { activeChatRef.current = activeChat; }, [activeChat]);

  const typingTimeoutRef = useRef(null);
  const scrollEndRef = useRef(null);

  const refreshChats = () =>
    api.chats.list()
      .then(({ data }) => setChats(data.chats))
      .catch(() => toast.error('Could not load chats.'))
      .finally(() => setLoadingChats(false));

  useEffect(() => { refreshChats(); }, []);

  const openChat = (chat) => {
    setActiveChat(chat);
    setMessages([]);
    setTypingFrom(false);
    setLoadingMessages(true);
    socket?.emit('join_chat', { chatId: chat.id });
    api.chats.messages(chat.id)
      .then(({ data }) => setMessages(data.messages))
      .catch(() => toast.error('Could not load messages.'))
      .finally(() => setLoadingMessages(false));
  };

  // Arrived from "Chat with seller" on a listing page — auto-open that chat
  // once the list has loaded, then clear the flag so it doesn't re-trigger.
  useEffect(() => {
    if (!openChatId || loadingChats) return;
    const found = chats.find((c) => c.id === openChatId);
    if (found) openChat(found);
    setOpenChatId(null);
  }, [openChatId, loadingChats]);

  // Socket listeners live for as long as this section is mounted, so the
  // chat list stays current even while looking at the list, not a thread.
  useEffect(() => {
    if (!socket) return;

    const onNewMessage = (msg) => {
      if (activeChatRef.current && msg.chat === activeChatRef.current.id) {
        setMessages((prev) => [...prev, msg]);
      }
      setChats((prev) => {
        const idx = prev.findIndex((c) => c.id === msg.chat);
        if (idx === -1) { refreshChats(); return prev; } // a chat we don't know about yet
        const updated = { ...prev[idx], lastMessage: msg, updated_at: msg.created_at };
        const rest = prev.filter((_, i) => i !== idx);
        return [updated, ...rest];
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

    const onSocketError = ({ message } = {}) => {
      if (message) toast.error(message);
    };

    socket.on('new_message', onNewMessage);
    socket.on('messages_seen', onSeen);
    socket.on('typing', onTyping);
    socket.on('error', onSocketError);
    return () => {
      socket.off('new_message', onNewMessage);
      socket.off('messages_seen', onSeen);
      socket.off('typing', onTyping);
      socket.off('error', onSocketError);
    };
  }, [socket]);

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView?.({ block: 'end' });
  }, [messages, typingFrom]);

  if (loadingChats) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Ico n="loader" c="w-7 h-7 spin" /></div>;
  }

  if (chats.length === 0) {
    return (
      <div className="empty-state">
        <div style={{ fontSize: 64 }}>💬</div>
        <h3>No conversations yet</h3>
        <p style={{ color: 'var(--text-soft)', marginBottom: 20 }}>Message a seller from any listing to start chatting.</p>
        <button className="btn btn-primary" onClick={() => navigate('/marketplace')}>Browse Marketplace</button>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.6rem', marginBottom: 20 }}>Chats 💬</h2>
      <div className={`chat-shell ${activeChat ? 'thread-open' : ''}`}>
        {/* List pane */}
        <div className="chat-list-pane">
          {chats.map((c) => {
            const mine = c.lastMessage && c.lastMessage.sender === user.user_id;
            const preview = c.lastMessage ? (c.lastMessage.image ? '📷 Photo' : c.lastMessage.text) : 'Say hi 👋';
            return (
              <button
                key={c.id}
                className={`chat-list-item ${activeChat?.id === c.id ? 'active' : ''}`}
                onClick={() => openChat(c)}
              >
                <div className="avatar">{c.otherUser?.name?.[0]?.toUpperCase() || '?'}</div>
                <div className="grow">
                  <div className="ttl">{c.otherUser?.name || 'Deleted user'}</div>
                  <div className="preview">{mine && <span style={{ opacity: .7 }}>You: </span>}{preview}</div>
                  <div className="listing-ref">{c.listing?.title}</div>
                </div>
                {c.lastMessage && <span className="time">{timeAgo(c.lastMessage.created_at)}</span>}
              </button>
            );
          })}
        </div>

        {/* Thread pane */}
        <div className="chat-thread-pane">
          {!activeChat ? (
            <div className="chat-placeholder">
              <Ico n="message" c="w-10 h-10" style={{ stroke: 'var(--text-soft)' }} />
              <p>Select a conversation</p>
            </div>
          ) : (
            <>
              <div className="chat-thread-head">
                <button className="chat-back-btn" onClick={() => setActiveChat(null)}><Ico n="chevleft" c="w-5 h-5" /></button>
                <div className="avatar" style={{ width: 38, height: 38, fontSize: '.85rem' }}>{activeChat.otherUser?.name?.[0]?.toUpperCase() || '?'}</div>
                <div className="grow" style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{activeChat.otherUser?.name || 'Deleted user'}</div>
                  <div
                    style={{ fontSize: '.78rem', color: 'var(--text-soft)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer' }}
                    onClick={() => activeChat.listing?.id && navigate(`/listing/${activeChat.listing.id}`)}
                  >
                    {activeChat.listing?.title || 'Listing removed'}
                  </div>
                </div>
              </div>

              <div className="chat-messages">
                {loadingMessages ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Ico n="loader" c="w-6 h-6 spin" /></div>
                ) : (
                  <>
                    {messages.map((m) => (
                      <MessageBubble key={m.id} message={m} mine={m.sender?.user_id === user.user_id} otherUserId={activeChat.otherUser?.user_id} />
                    ))}
                    {typingFrom && (
                      <div className="bubble-row theirs">
                        <div className="bubble typing-bubble"><span className="typing-dots"><i></i><i></i><i></i></span></div>
                      </div>
                    )}
                  </>
                )}
                <div ref={scrollEndRef} />
              </div>

              <ChatInputBar chat={activeChat} socket={socket} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message, mine, otherUserId }) {
  const seen = mine && otherUserId && message.seenBy?.includes(otherUserId);
  return (
    <div className={`bubble-row ${mine ? 'mine' : 'theirs'}`}>
      <div className="bubble">
        {message.image
          ? <img src={message.image} alt="Shared photo" onClick={() => window.open(message.image, '_blank')} />
          : <p>{message.text}</p>}
        <span className="bubble-meta">
          {timeShort(message.created_at)}
          {mine && <Ico n={seen ? 'checkdouble' : 'check'} c="w-3.5 h-3.5" style={{ stroke: seen ? 'var(--teal)' : 'currentColor' }} />}
        </span>
      </div>
    </div>
  );
}

function ChatInputBar({ chat, socket }) {
  const { toast } = useApp();
  const [text, setText] = useState('');
  const [sendingImage, setSendingImage] = useState(false);
  const fileRef = useRef(null);
  const emitTyping = useTypingEmitter(socket, chat?.id);

  const send = () => {
    const trimmed = text.trim();
    if (!trimmed || !socket) return;
    socket.emit('send_message', { chatId: chat.id, text: trimmed });
    setText('');
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
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
      <button className="icon-btn" onClick={() => fileRef.current?.click()} disabled={sendingImage} title="Send a photo">
        {sendingImage ? <Ico n="loader" c="w-5 h-5 spin" /> : <Ico n="camera" c="w-5 h-5" />}
      </button>
      <input
        className="input"
        value={text}
        onChange={(e) => { setText(e.target.value); emitTyping(); }}
        onKeyDown={onKeyDown}
        placeholder="Type a message…"
      />
      <button className="btn btn-primary btn-icon" onClick={send} disabled={!text.trim()}>
        <Ico n="send" c="w-5 h-5" />
      </button>
    </div>
  );
}
