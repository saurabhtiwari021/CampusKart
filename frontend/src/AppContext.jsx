/* ── AppContext ────────────────────────────────────────────────────────── */
import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import { getLS, setLS, uid } from './utils';
import { api, SOCKET_URL } from './api';
import { Ico } from './icons';

const AppCtx = createContext(null);
export const useApp = () => useContext(AppCtx);

export function AppProvider({ children }) {
  const rrNavigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(() => getLS('ck_user', null));
  const [authReady, setAuthReady] = useState(false); // true once the startup /auth/me check resolves

  // `listings` is the full set of all active listings (used by Landing's
  // featured strip, Profile's "their listings" tab, and Dashboard's "my
  // listings" stats) — NOT the Marketplace search/filter results. Marketplace
  // queries the backend itself with its own filter state and keeps its own
  // local result list, so a search there never clobbers this.
  const [listings, setListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(true);

  // wishlistListings holds the full populated listing objects the user has
  // saved (what Dashboard's wishlist tab renders directly); `wishlist` is
  // just the id list derived from it, kept around because ListingCard/
  // ListingDetail check `wishlist.includes(id)` to render the heart icon.
  const [wishlistListings, setWishlistListings] = useState([]);
  const wishlist = wishlistListings.map(l => l.id);

  // Real notifications, replacing the old static SEED_NOTIFS. Populated on
  // login (same pattern as the wishlist fetch below) and kept live via the
  // 'notification:new' socket event once `socket` connects.
  const [notifications, setNotifications] = useState([]);
  const unreadCount = notifications.filter(n => !n.read).length;

  const [toasts, setToasts] = useState([]);
  const [mobileMenu, setMobileMenu] = useState(false);

  // One Socket.io client for the whole app, created once the user is logged
  // in (and torn down on logout) — chat screens just consume `socket` from
  // context instead of each managing their own connection.
  const [socket, setSocket] = useState(null);
  // Set by ListingDetail right after it creates/sends the first message in a
  // new chat, so the Dashboard chats section knows which chat to open instead
  // of just landing on the bare list.
  const [openChatId, setOpenChatId] = useState(null);

  // On load, if we have a token from a previous session, verify it against
  // the backend and refresh the user — don't just trust whatever's cached.
  useEffect(() => {
    const token = getLS('ck_token', null);
    if (!token) { setAuthReady(true); return; }
    api.me(token)
      .then(({ data }) => { setUser(data.user); setLS('ck_user', data.user); })
      .catch(() => { setUser(null); setLS('ck_user', null); setLS('ck_token', null); })
      .finally(() => setAuthReady(true));
  }, []);

  // Load the full active-listings set once on startup (Landing/Profile/Dashboard depend on it).
  const refreshListings = () => {
    setListingsLoading(true);
    return api.listings.list({})
      .then(({ data }) => setListings(data.listings))
      .catch(() => toast.error('Could not load listings. Is the backend running?'))
      .finally(() => setListingsLoading(false));
  };
  useEffect(() => { refreshListings(); }, []);

  // Load the logged-in user's wishlist once auth state is settled, and clear it on logout.
  useEffect(() => {
    if (!authReady) return;
    if (!user) { setWishlistListings([]); return; }
    api.wishlist.list()
      .then(({ data }) => setWishlistListings(data.listings))
      .catch(() => {}); // non-fatal — wishlist just stays empty until next load
  }, [authReady, user?.user_id]);

  // Same pattern as the wishlist fetch above: load real notifications once
  // auth settles, clear them on logout.
  useEffect(() => {
    if (!authReady) return;
    if (!user) { setNotifications([]); return; }
    api.notifications.list()
      .then(({ data }) => setNotifications(data.notifications))
      .catch(() => {}); // non-fatal — list just stays empty until next load
  }, [authReady, user?.user_id]);

  // Live delivery: one more event on the socket instance already created
  // below, not a new connection.
  useEffect(() => {
    if (!socket) return;
    const onNew = (notif) => setNotifications(prev => [notif, ...prev]);
    socket.on('notification:new', onNew);
    return () => socket.off('notification:new', onNew);
  }, [socket]);

  // Connect the socket once we know we have a logged-in user + token, and
  // disconnect cleanly on logout or unmount — never leave a stale socket
  // hanging around with the previous user's auth.
  useEffect(() => {
    if (!authReady) return;
    const token = getLS('ck_token', null);
    if (!user || !token) { setSocket(null); return; }

    const s = io(SOCKET_URL, { auth: { token } });
    setSocket(s);
    return () => { s.disconnect(); };
  }, [authReady, user?.user_id]);

  // React Router (HashRouter) now owns URL <-> state sync; `page` is just a
  // convenience string derived from the current location for any consumer
  // that used to read it off context.
  const page = location.pathname + location.search;

  const navigate = (to) => {
    rrNavigate(to);
    window.scrollTo(0,0);
    setMobileMenu(false);
  };

  const addToast = (msg, type='info') => {
    const id = uid();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3200);
  };
  const toast = {
    success: (m) => addToast(m,'success'),
    error: (m) => addToast(m,'error'),
    info: (m) => addToast(m,'info'),
  };

  const login = (u, token) => {
    setUser(u);
    setLS('ck_user', u);
    if (token) setLS('ck_token', token);
  };
  const logout = () => {
    setUser(null);
    setLS('ck_user', null);
    setLS('ck_token', null);
  };

  // Optimistic add/remove against the backend, with rollback + a toast if the request fails.
  const toggleWishlist = async (id) => {
    if (!user) return; // callers already redirect to /login before calling this
    const saved = wishlist.includes(id);

    if (saved) {
      const prev = wishlistListings;
      setWishlistListings(p => p.filter(l => l.id !== id));
      try {
        await api.wishlist.remove(id);
      } catch (err) {
        setWishlistListings(prev);
        toast.error(err.message || 'Could not remove from wishlist');
      }
    } else {
      const listing = listings.find(l => l.id === id);
      const prev = wishlistListings;
      if (listing) setWishlistListings(p => [listing, ...p]);
      try {
        await api.wishlist.add(id);
        // If we didn't have the listing locally (rare), pull the canonical wishlist from the server.
        if (!listing) {
          const { data } = await api.wishlist.list();
          setWishlistListings(data.listings);
        }
      } catch (err) {
        setWishlistListings(prev);
        toast.error(err.message || 'Could not save to wishlist');
      }
    }
  };

  /** formData must already contain all listing fields + 'images' files — built by CreateListing.js. */
  const addListing = async (formData) => {
    const { data } = await api.listings.create(formData);
    setListings(prev => [data.listing, ...prev]);
    return data.listing;
  };

  const deleteListing = async (id) => {
    await api.listings.remove(id);
    setListings(prev => prev.filter(l => l.id !== id));
    setWishlistListings(prev => prev.filter(l => l.id !== id));
  };

  // Optimistic, same philosophy as toggleWishlist — flip locally, roll back + toast on failure.
  const markNotifRead = async (id) => {
    const prev = notifications;
    setNotifications(p => p.map(n => n.id === id ? { ...n, read: true } : n));
    try {
      await api.notifications.markRead(id);
    } catch (err) {
      setNotifications(prev);
      toast.error(err.message || 'Could not update notification');
    }
  };
  const markAllNotifsRead = async () => {
    const prev = notifications;
    setNotifications(p => p.map(n => ({ ...n, read: true })));
    try {
      await api.notifications.markAllRead();
    } catch (err) {
      setNotifications(prev);
      toast.error(err.message || 'Could not update notifications');
    }
  };

  return (
    <AppCtx.Provider value={{ user, login, logout, authReady, listings, listingsLoading, refreshListings, wishlist, wishlistListings, toggleWishlist, addListing, deleteListing, toast, navigate, page, mobileMenu, setMobileMenu, socket, openChatId, setOpenChatId, notifications, unreadCount, markNotifRead, markAllNotifsRead }}>
      {children}
      <Toaster toasts={toasts} />
    </AppCtx.Provider>
  );
}

/* ── Toaster ──────────────────────────────────────────────────────────── */
function Toaster({ toasts }) {
  if (!toasts.length) return null;
  const icons = { success:'check', error:'x', info:'bell' };
  return (
    <div className="toast-stack">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          <Ico n={icons[t.type]||'bell'} c="w-5 h-5 flex-shrink-0"/>
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}

