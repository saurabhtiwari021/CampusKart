import { useState, useEffect, useRef } from 'react';
import { useApp } from './AppContext';
import { Ico } from './icons';

function Navbar() {
  const { user, logout, navigate, page, mobileMenu, setMobileMenu, unreadCount } = useApp();
  const [q, setQ] = useState('');
  const [dropOpen, setDropOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const submit = (e) => { e.preventDefault(); navigate(`/marketplace?q=${encodeURIComponent(q)}`); };

  return (
    <header className={`navbar glass ${scrolled ? 'scrolled' : ''}`} data-testid="navbar">
      <div className="container navbar-inner">
        {/* Logo */}
        <a href="#/" className="logo" onClick={(e)=>{e.preventDefault();navigate('/');}}>
          <div className="mark">C</div>
          <span className="hidden sm:block">CampusKart</span>
        </a>

        {/* Search */}
        <div className="nav-search hidden md:block">
          <form onSubmit={submit}>
            <Ico n="search" c="w-5 h-5 absolute left-14px top-1/2 -translate-y-1/2 pointer-events-none" style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',width:18,height:18,stroke:'var(--ink-soft)'}}/>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search textbooks, cycles, gadgets…" style={{paddingLeft:42}}/>
          </form>
        </div>

        {/* Nav links */}
        <nav className="navlinks">
          <button className="nav-link hidden lg:block" onClick={()=>navigate('/marketplace')}>Browse</button>

          {user ? (
            <>
              <button className="btn btn-primary btn-sm hidden sm:flex gap-2 items-center" onClick={()=>navigate('/create')}>
                <Ico n="plus" c="w-4 h-4"/> Sell
              </button>
              <button className="icon-btn" onClick={()=>navigate('/dashboard/wishlist')} title="Wishlist">
                <Ico n="heart" c="w-5 h-5"/>
              </button>
              <button className="icon-btn" onClick={()=>navigate('/dashboard/notifications')} title="Notifications" style={{position:'relative'}}>
                <Ico n="bell" c="w-5 h-5"/>
                {unreadCount>0 && (
                  <span style={{position:'absolute',top:2,right:2,minWidth:16,height:16,padding:'0 4px',borderRadius:999,background:'var(--coral)',color:'#fff',fontSize:10,fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center',border:'1.5px solid var(--cream)'}}>
                    {unreadCount>9?'9+':unreadCount}
                  </span>
                )}
              </button>
              <div className="dropdown" ref={dropRef}>
                <button className="avatar-trigger" onClick={()=>setDropOpen(p=>!p)} data-testid="avatar-trigger" style={{background:'none',border:'none',padding:0,cursor:'pointer'}}>
                  <div className="avatar">{user.name?.[0]?.toUpperCase()}</div>
                </button>
                <div className={`dropdown-menu ${dropOpen?'open':''}`}>
                  <div className="dm-head">
                    <div className="name">{user.name}</div>
                    <div className="email">{user.email}</div>
                  </div>
                  <hr/>
                  <button onClick={()=>{setDropOpen(false);navigate('/dashboard');}}><Ico n="home" c="w-4 h-4"/> Dashboard</button>
                  <button onClick={()=>{setDropOpen(false);navigate('/dashboard/listings');}}><Ico n="package" c="w-4 h-4"/> My Listings</button>
                  <button onClick={()=>{setDropOpen(false);navigate('/dashboard/wishlist');}}><Ico n="heart" c="w-4 h-4"/> Saved Items</button>
                  <button onClick={()=>{setDropOpen(false);navigate('/dashboard/chats');}}><Ico n="message" c="w-4 h-4"/> Chats</button>
                  <button onClick={()=>{setDropOpen(false);navigate(`/u/${user.user_id}`);}}><Ico n="user" c="w-4 h-4"/> Profile</button>
                  {user.role==='admin' && (
                    <button onClick={()=>{setDropOpen(false);navigate('/admin');}}><Ico n="shield" c="w-4 h-4"/> Admin Panel</button>
                  )}
                  <hr/>
                  <button className="danger" onClick={()=>{setDropOpen(false);logout();navigate('/');}}>
                    <Ico n="logout" c="w-4 h-4"/> Logout
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <button className="btn btn-ghost btn-sm" onClick={()=>navigate('/login')}>Log in</button>
              <button className="btn btn-primary btn-sm" onClick={()=>navigate('/register')}>Sign up</button>
            </>
          )}
          <button className="icon-btn sm:hidden" onClick={()=>setMobileMenu(p=>!p)}>
            <Ico n={mobileMenu?'x':'menu'} c="w-5 h-5"/>
          </button>
        </nav>
      </div>
      {/* Mobile menu */}
      {mobileMenu && (
        <div style={{background:'var(--cream)',borderTop:'var(--bw) solid var(--ink)',padding:'16px 24px',display:'flex',flexDirection:'column',gap:8}}>
          <form onSubmit={(e)=>{e.preventDefault();navigate(`/marketplace?q=${encodeURIComponent(q)}`);}} style={{marginBottom:8}}>
            <input className="input" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search…"/>
          </form>
          <button className="btn btn-ghost" style={{justifyContent:'flex-start'}} onClick={()=>navigate('/marketplace')}>Browse Marketplace</button>
          {user && <button className="btn btn-primary" onClick={()=>navigate('/create')}><Ico n="plus" c="w-4 h-4"/> List an Item</button>}
        </div>
      )}
    </header>
  );
}


export default Navbar;
