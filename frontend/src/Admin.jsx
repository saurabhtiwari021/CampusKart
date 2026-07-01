/* ── Admin Panel ──────────────────────────────────────────────────────── */
import { useState, useEffect } from 'react';
import { useApp } from './AppContext';
import Navbar from './NavBar';
import { Ico } from './icons';
import { inr, timeAgo } from './utils';
import { api } from './api';

function Admin() {
  const { user, navigate, toast } = useApp();
  const [section, setSection] = useState('overview');

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  const [listings, setListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [flaggedOnly, setFlaggedOnly] = useState(false);

  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);

  const isAdmin = user && user.role === 'admin';

  // Client-side gating is just UX (don't show the link, redirect away if a
  // non-admin somehow lands on /admin) — the real enforcement is the
  // isAdmin middleware on the backend.
  useEffect(() => {
    if (user && !isAdmin) navigate('/');
  }, [user, isAdmin]);

  const loadStats = () => {
    setStatsLoading(true);
    api.admin.stats().then(({ data }) => setStats(data.stats)).catch(err => toast.error(err.message || 'Could not load stats')).finally(() => setStatsLoading(false));
  };
  const loadUsers = (search) => {
    setUsersLoading(true);
    api.admin.users(search ? { search } : {}).then(({ data }) => setUsers(data.users)).catch(err => toast.error(err.message || 'Could not load users')).finally(() => setUsersLoading(false));
  };
  const loadListings = (flagged) => {
    setListingsLoading(true);
    api.admin.listings(flagged ? { flagged: true } : {}).then(({ data }) => setListings(data.listings)).catch(err => toast.error(err.message || 'Could not load listings')).finally(() => setListingsLoading(false));
  };
  const loadReports = () => {
    setReportsLoading(true);
    api.admin.reports().then(({ data }) => setReports(data.reports)).catch(err => toast.error(err.message || 'Could not load reports')).finally(() => setReportsLoading(false));
  };

  useEffect(() => {
    if (!isAdmin) return;
    if (section === 'overview') loadStats();
    if (section === 'users') loadUsers();
    if (section === 'listings') loadListings(flaggedOnly);
    if (section === 'reports') loadReports();
  }, [section, isAdmin]);

  const toggleBan = (u) => {
    const next = !u.isBlocked;
    api.admin.banUser(u.user_id, next)
      .then(({ data }) => {
        setUsers(prev => prev.map(x => x.user_id === u.user_id ? data.user : x));
        toast.success(next ? `${u.name} banned.` : `${u.name} unbanned.`);
      })
      .catch(err => toast.error(err.message || 'Could not update user'));
  };

  const removeListing = (l) => {
    api.admin.removeListing(l.id)
      .then(({ data }) => {
        setListings(prev => prev.map(x => x.id === l.id ? data.listing : x));
        toast.success('Listing removed.');
      })
      .catch(err => toast.error(err.message || 'Could not remove listing'));
  };

  const resolveFlag = (l) => {
    api.admin.resolveFlag(l.id)
      .then(({ data }) => {
        setListings(prev => flaggedOnly ? prev.filter(x => x.id !== l.id) : prev.map(x => x.id === l.id ? data.listing : x));
        toast.success('Flag cleared.');
      })
      .catch(err => toast.error(err.message || 'Could not clear flag'));
  };

  const resolveReport = (r) => {
    api.admin.resolveReport(r.id)
      .then(({ data }) => {
        setReports(prev => prev.map(x => x.id === r.id ? data.report : x));
        toast.success('Report resolved.');
      })
      .catch(err => toast.error(err.message || 'Could not resolve report'));
  };

  if (!user) {
    return (<div style={{minHeight:'100vh'}}><Navbar/><div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'70vh',flexDirection:'column',gap:16}}>
      <div style={{fontSize:64}}>🔒</div>
      <h2 style={{fontFamily:'var(--font-display)',fontWeight:800}}>Sign in to access the admin panel</h2>
      <button className="btn btn-primary" onClick={()=>navigate('/login')}>Sign in</button>
    </div></div>);
  }
  if (!isAdmin) return null; // redirect effect above handles this

  const navItems = [
    { id:'overview', label:'Overview', icon:'grid' },
    { id:'users', label:'Users', icon:'user' },
    { id:'listings', label:'Listings', icon:'package' },
    { id:'reports', label:'Reports', icon:'flag' },
  ];

  return (
    <div style={{minHeight:'100vh'}}>
      <Navbar/>
      <div className="container section" style={{paddingTop:28}}>
        <div className="dash-layout">
          {/* Sidebar */}
          <aside className="card dash-sidebar">
            {navItems.map(n=>(
              <button key={n.id} className={`dash-link ${section===n.id?'active':''}`} onClick={()=>setSection(n.id)}>
                <Ico n={n.icon} c="w-5 h-5"/> {n.label}
                {n.id==='listings' && stats?.flaggedListings>0 && (
                  <span style={{marginLeft:'auto',minWidth:20,height:20,padding:'0 5px',borderRadius:999,background:'var(--coral)',color:'#fff',fontSize:11,fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center'}}>{stats.flaggedListings}</span>
                )}
                {n.id==='reports' && stats?.openReports>0 && (
                  <span style={{marginLeft:'auto',minWidth:20,height:20,padding:'0 5px',borderRadius:999,background:'var(--coral)',color:'#fff',fontSize:11,fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center'}}>{stats.openReports}</span>
                )}
              </button>
            ))}
          </aside>

          {/* Content */}
          <main>
            {/* OVERVIEW */}
            {section==='overview' && (
              <div>
                <h1 style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:'1.8rem',marginBottom:6}}>Admin Overview 🛡️</h1>
                <p style={{color:'var(--text-soft)',marginBottom:24}}>A quick snapshot of what's happening across CampusKart.</p>
                {statsLoading || !stats ? (
                  <div style={{display:'flex',justifyContent:'center',padding:40}}><Ico n="loader" c="w-6 h-6 spin"/></div>
                ) : (
                  <div className="dash-cards">
                    {[
                      { num:stats.totalUsers, lbl:'Total Users', bg:'var(--violet)', color:'#fff' },
                      { num:stats.bannedUsers, lbl:'Banned Users', bg:'var(--coral)', color:'#fff' },
                      { num:stats.totalListings, lbl:'Total Listings', bg:'var(--yellow)', color:'var(--ink)' },
                      { num:stats.activeListings, lbl:'Active Listings', bg:'var(--teal)', color:'var(--ink)' },
                      { num:stats.removedListings, lbl:'Removed Listings', bg:'var(--tangerine)', color:'var(--ink)' },
                      { num:stats.flaggedListings, lbl:'Flagged (Fraud Check)', bg:'var(--coral)', color:'#fff' },
                      { num:stats.openReports, lbl:'Open Reports', bg:'var(--violet)', color:'#fff' },
                    ].map((s,i)=>(
                      <div key={i} className="card dash-stat" style={{background:s.bg,color:s.color,borderColor:'var(--ink)'}}>
                        <div className="num">{s.num}</div>
                        <div className="lbl" style={{color:s.color==='#fff'?'rgba(255,255,255,.8)':'var(--ink-soft)'}}>{s.lbl}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* USERS */}
            {section==='users' && (
              <div>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20,gap:12,flexWrap:'wrap'}}>
                  <h2 style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:'1.6rem'}}>Users ({users.length})</h2>
                  <form onSubmit={(e)=>{e.preventDefault();loadUsers(userSearch);}} style={{display:'flex',gap:8}}>
                    <input className="input" style={{padding:'9px 14px',width:220}} value={userSearch} onChange={e=>setUserSearch(e.target.value)} placeholder="Search by name or email"/>
                    <button className="btn btn-sm" type="submit">Search</button>
                  </form>
                </div>
                {usersLoading ? (
                  <div style={{display:'flex',justifyContent:'center',padding:40}}><Ico n="loader" c="w-6 h-6 spin"/></div>
                ) : users.length===0 ? (
                  <div className="empty-state"><div style={{fontSize:64}}>👤</div><h3>No users found</h3></div>
                ) : users.map(u=>(
                  <div key={u.user_id} className="table-row">
                    <div className="avatar" style={{flexShrink:0}}>{u.name?.[0]?.toUpperCase()}</div>
                    <div className="grow">
                      <div className="ttl">{u.name} {u.role==='admin' && <span className="tag" style={{marginLeft:6}}>admin</span>}</div>
                      <div style={{fontSize:'.82rem',color:'var(--text-soft)',marginTop:4}}>{u.email} · {u.college}{u.isBlocked && ' · 🚫 Banned'}</div>
                    </div>
                    <div style={{display:'flex',gap:8,flexShrink:0}}>
                      <button className="btn btn-sm" onClick={()=>navigate(`/u/${u.user_id}`)}>View</button>
                      {u.role!=='admin' && (
                        <button className={`btn btn-sm ${u.isBlocked?'btn-teal':'btn-coral'}`} onClick={()=>toggleBan(u)}>
                          {u.isBlocked?'Unban':'Ban'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* LISTINGS */}
            {section==='listings' && (
              <div>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20,gap:12,flexWrap:'wrap'}}>
                  <h2 style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:'1.6rem'}}>All Listings ({listings.length})</h2>
                  <label style={{display:'flex',alignItems:'center',gap:8,fontWeight:600,fontSize:'.88rem',cursor:'pointer'}}>
                    <input type="checkbox" checked={flaggedOnly} onChange={e=>{const v=e.target.checked;setFlaggedOnly(v);loadListings(v);}} style={{width:18,height:18,accentColor:'var(--coral)'}}/>
                    🚩 Flagged only
                  </label>
                </div>
                {listingsLoading ? (
                  <div style={{display:'flex',justifyContent:'center',padding:40}}><Ico n="loader" c="w-6 h-6 spin"/></div>
                ) : listings.length===0 ? (
                  <div className="empty-state"><div style={{fontSize:64}}>📦</div><h3>{flaggedOnly?'No flagged listings':'No listings'}</h3></div>
                ) : listings.map(l=>(
                  <div key={l.id} className="table-row">
                    <img src={l.images?.[0]||'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=200&q=80'} alt={l.title}/>
                    <div className="grow">
                      <div className="ttl">{l.title} {l.flagged && <span className="tag" style={{marginLeft:6,background:'var(--coral)',color:'#fff',borderColor:'var(--coral)'}}>🚩 flagged — underpriced</span>}</div>
                      <div style={{fontSize:'.82rem',color:'var(--text-soft)',marginTop:4}}>{l.category} · {inr(l.price)} · by {l.owner?.name} · {timeAgo(l.created_at)}{l.status==='removed' && ' · 🚫 removed'}</div>
                    </div>
                    <div style={{display:'flex',gap:8,flexShrink:0}}>
                      <button className="btn btn-sm" onClick={()=>navigate(`/listing/${l.id}`)}>View</button>
                      {l.flagged && (
                        <button className="btn btn-sm btn-teal" onClick={()=>resolveFlag(l)}>Clear Flag</button>
                      )}
                      {l.status!=='removed' && (
                        <button className="btn btn-sm btn-coral" onClick={()=>removeListing(l)}>Remove</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* REPORTS */}
            {section==='reports' && (
              <div>
                <h2 style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:'1.6rem',marginBottom:20}}>Reports ({reports.length})</h2>
                {reportsLoading ? (
                  <div style={{display:'flex',justifyContent:'center',padding:40}}><Ico n="loader" c="w-6 h-6 spin"/></div>
                ) : reports.length===0 ? (
                  <div className="empty-state"><div style={{fontSize:64}}>🚩</div><h3>No reports</h3></div>
                ) : reports.map(r=>(
                  <div key={r.id} className={`notif-row ${r.status==='open'?'unread':''}`}>
                    <div style={{flex:1}}>
                      <p style={{fontWeight:700}}>
                        {r.reportedListing ? `Listing: ${r.reportedListing.title}` : `User: ${r.reportedUser?.name}`}
                        {r.status==='resolved' && <span style={{marginLeft:8,fontWeight:600,fontSize:'.78rem',color:'var(--text-soft)'}}>✅ resolved</span>}
                      </p>
                      <p style={{marginTop:4}}>{r.reason}</p>
                      <p style={{fontSize:'.8rem',color:'var(--text-soft)',marginTop:4}}>
                        Reported by {r.reporter?.name} · {timeAgo(r.created_at)}
                      </p>
                    </div>
                    <div style={{display:'flex',gap:8,alignSelf:'center'}}>
                      {r.reportedListing && <button className="btn btn-sm" onClick={()=>navigate(`/listing/${r.reportedListing.id}`)}>View</button>}
                      {r.reportedUser && <button className="btn btn-sm" onClick={()=>navigate(`/u/${r.reportedUser.user_id}`)}>View</button>}
                      {r.status==='open' && <button className="btn btn-sm btn-teal" onClick={()=>resolveReport(r)}>Resolve</button>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default Admin;
