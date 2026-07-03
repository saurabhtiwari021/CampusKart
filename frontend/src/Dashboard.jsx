import { useState, useEffect } from 'react';
import { Lock, Package, HeartCrack, Bell, ShoppingCart, Star } from 'lucide-react';
import { useApp } from './AppContext';
import Navbar from './NavBar';
import { Ico } from './icons';
import { TYPE_META } from './constants';
import { inr, timeAgo } from './utils';
import { api } from './api';
import { ListingCard } from './ListingCard';
import { ChatSection } from './Chat';
import { ReviewList } from './Reviews';

function Dashboard({ section='home' }) {
  const { user, navigate, listings, wishlistListings, deleteListing, toast, notifications, markNotifRead, markAllNotifsRead } = useApp();
  const [activeSection, setActiveSection] = useState(section);
  const [editProfile, setEditProfile] = useState(false);
  const [myReviews, setMyReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(()=>setActiveSection(section),[section]);

  // Reviews received fetched lazily the first time that tab is opened.
  useEffect(() => {
    if (activeSection!=='reviews' || !user) return;
    setReviewsLoading(true);
    api.reviews.byUser(user.user_id)
      .then(({ data }) => setMyReviews(data.reviews))
      .catch(() => toast.error('Could not load reviews'))
      .finally(() => setReviewsLoading(false));
  }, [activeSection, user?.user_id]);

  if (!user) {
    return (<div style={{minHeight:'100vh'}}><Navbar/><div className="flex items-center justify-center flex-col gap-4" style={{minHeight:'70vh'}}>
      <Lock className="w-16 h-16" strokeWidth={1.5} style={{color:'var(--text-soft)'}}/>
      <h2 style={{fontFamily:'var(--font-display)',fontWeight:800}}>Sign in to access your dashboard</h2>
      <button className="btn btn-primary" onClick={()=>navigate('/login')}>Sign in</button>
    </div></div>);
  }

  const myListings = listings.filter(l=>l.owner?.user_id===user.user_id);
  const myWishlist = wishlistListings;
  const earnings = myListings.filter(l=>l.type==='sell').reduce((s,l)=>s+l.price,0);

  const navItems = [
    { id:'home', label:'Dashboard', icon:'home' },
    { id:'listings', label:'My Listings', icon:'package' },
    { id:'wishlist', label:'Wishlist', icon:'heart' },
    { id:'chats', label:'Chats', icon:'message' },
    { id:'notifications', label:'Notifications', icon:'bell' },
    { id:'orders', label:'Orders', icon:'gift' },
    { id:'reviews', label:'Reviews', icon:'star' },
    { id:'settings', label:'Settings', icon:'settings' },
  ];

  return (
    <div style={{minHeight:'100vh'}}>
      <Navbar/>
      <div className="container section" style={{paddingTop:28}}>
        <div className="dash-layout">
          {/* Sidebar */}
          <aside className="card dash-sidebar">
            {navItems.map(n=>(
              <button key={n.id} className={`dash-link ${activeSection===n.id?'active':''}`} onClick={()=>{setActiveSection(n.id);navigate(`/dashboard/${n.id==='home'?'':n.id}`);}}>
                <Ico n={n.icon} c="w-5 h-5"/> {n.label}
              </button>
            ))}
          </aside>

          {/* Content */}
          <main>
            {/* HOME */}
            {activeSection==='home' && (
              <div>
                <h1 style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:'1.8rem',marginBottom:6}}>Good day, {user.name?.split(' ')[0]}!</h1>
                <p style={{color:'var(--text-soft)',marginBottom:24}}>Here's what's happening with your listings.</p>
                <div className="dash-cards">
                  {[
                    { num:myListings.length, lbl:'Active Listings', bg:'var(--violet)', color:'#fff' },
                    { num:inr(earnings), lbl:'Total Value Listed', bg:'var(--yellow)', color:'var(--ink)' },
                    { num:myWishlist.length, lbl:'Saved Items', bg:'var(--coral)', color:'#fff' },
                    { num:myListings.reduce((s,l)=>s+l.views,0), lbl:'Total Views', bg:'var(--teal)', color:'var(--ink)' },
                  ].map((s,i)=>(
                    <div key={i} className="card dash-stat" style={{background:s.bg,color:s.color,borderColor:'var(--ink)'}}>
                      <div className="num">{s.num}</div>
                      <div className="lbl" style={{color:s.color==='#fff'?'rgba(255,255,255,.8)':'var(--ink-soft)'}}>{s.lbl}</div>
                    </div>
                  ))}
                </div>
                {myListings.length>0 ? (
                  <div>
                    <h2 style={{fontFamily:'var(--font-display)',fontWeight:700,fontSize:'1.2rem',marginBottom:16}}>Your Recent Listings</h2>
                    {myListings.slice(0,3).map(l=>(
                      <div key={l.id} className="table-row">
                        <img src={l.images?.[0]||'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=200&q=80'} alt={l.title}/>
                        <div className="grow">
                          <div className="ttl">{l.title}</div>
                          <div style={{fontSize:'.82rem',color:'var(--text-soft)',marginTop:4}}>{l.category} · {inr(l.price)} · {l.views} views</div>
                        </div>
                        <div className="flex gap-2">
                          <button className="btn btn-sm" onClick={()=>navigate(`/listing/${l.id}`)}>View</button>
                          <button className="btn btn-sm btn-coral" onClick={()=>{deleteListing(l.id).then(()=>toast.success('Listing deleted')).catch(err=>toast.error(err.message||'Could not delete listing'));}}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state" style={{padding:'40px 20px'}}>
                    <div className="icon-wrap"><Package className="w-11 h-11" strokeWidth={1.75}/></div>
                    <h3>No listings yet</h3>
                    <p style={{color:'var(--text-soft)',marginBottom:20}}>Start selling your stuff!</p>
                    <button className="btn btn-primary" onClick={()=>navigate('/create')}><Ico n="plus" c="w-4 h-4"/> Create Listing</button>
                  </div>
                )}
              </div>
            )}

            {/* MY LISTINGS */}
            {activeSection==='listings' && (
              <div>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
                  <h2 style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:'1.6rem'}}>My Listings ({myListings.length})</h2>
                  <button className="btn btn-primary btn-sm" onClick={()=>navigate('/create')}><Ico n="plus" c="w-4 h-4"/> New Listing</button>
                </div>
                {myListings.length===0 ? (
                  <div className="empty-state"><div className="icon-wrap"><Package className="w-11 h-11" strokeWidth={1.75}/></div><h3>No listings yet</h3><button className="btn btn-primary" onClick={()=>navigate('/create')}>Create your first listing</button></div>
                ) : myListings.map(l=>(
                  <div key={l.id} className="table-row">
                    <img src={l.images?.[0]||'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=200&q=80'} alt={l.title}/>
                    <div className="grow">
                      <div className="ttl">{l.title}</div>
                      <div style={{fontSize:'.82rem',color:'var(--text-soft)',marginTop:4}}>{l.category} · {inr(l.price)} · <Ico n="eye" c="w-3 h-3 inline" style={{display:'inline',verticalAlign:'middle'}}/> {l.views} · {timeAgo(l.created_at)}</div>
                      <span className={`stamp ${TYPE_META[l.type]?.cls}`} style={{display:'inline-flex',marginTop:6,fontSize:9}}>{TYPE_META[l.type]?.label}</span>
                    </div>
                    <div style={{display:'flex',gap:8,flexShrink:0}}>
                      <button className="btn btn-sm" onClick={()=>navigate(`/listing/${l.id}`)}>View</button>
                      <button className="btn btn-sm btn-coral" onClick={()=>{deleteListing(l.id).then(()=>toast.success('Listing removed')).catch(err=>toast.error(err.message||'Could not delete listing'));}}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* WISHLIST */}
            {activeSection==='wishlist' && (
              <div>
                <h2 className="flex items-center gap-2" style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:'1.6rem',marginBottom:24}}><Ico n="heart" c="w-6 h-6"/> Saved Items</h2>
                {myWishlist.length===0 ? (
                  <div className="empty-state"><div className="icon-wrap"><HeartCrack className="w-11 h-11" strokeWidth={1.75}/></div><h3>Nothing saved yet</h3><button className="btn btn-primary" onClick={()=>navigate('/marketplace')}>Browse Marketplace</button></div>
                ) : (
                  <div className="grid-listings">{myWishlist.map((l,i)=><ListingCard key={l.id} listing={l} index={i}/>)}</div>
                )}
              </div>
            )}

            {/* CHATS */}
            {activeSection==='chats' && <ChatSection/>}

            {/* NOTIFICATIONS */}
            {activeSection==='notifications' && (
              <div>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
                  <h2 className="flex items-center gap-2" style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:'1.6rem'}}><Bell className="w-6 h-6" strokeWidth={2}/> Notifications</h2>
                  {notifications.some(n=>!n.read) && (
                    <button className="btn btn-sm" onClick={markAllNotifsRead}>Mark all read</button>
                  )}
                </div>
                {notifications.length===0 ? (
                  <div className="empty-state"><div className="icon-wrap"><Bell className="w-11 h-11" strokeWidth={1.75}/></div><h3>No notifications yet</h3><p style={{color:'var(--text-soft)'}}>Chat messages, wishlist saves, and reviews will show up here.</p></div>
                ) : notifications.map(n=>(
                  <div key={n.id} className={`notif-row ${n.read?'':'unread'}`} style={{cursor:n.read?'default':'pointer'}} onClick={()=>!n.read && markNotifRead(n.id)}>
                    {!n.read && <div style={{width:10,height:10,borderRadius:999,background:'var(--violet)',flexShrink:0,marginTop:5}}/>}
                    <div style={{flex:1}}>
                      <p style={{fontWeight:n.read?400:700}}>{n.message}</p>
                      <p style={{fontSize:'.8rem',color:'var(--text-soft)',marginTop:4}}>{timeAgo(n.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ORDERS */}
            {activeSection==='orders' && (
              <div>
                <h2 className="flex items-center gap-2" style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:'1.6rem',marginBottom:24}}><Package className="w-6 h-6" strokeWidth={2}/> Orders</h2>
                <div className="empty-state"><div className="icon-wrap"><ShoppingCart className="w-11 h-11" strokeWidth={1.75}/></div><h3>No orders yet</h3><p style={{color:'var(--text-soft)',marginBottom:20}}>When you buy or sell items, orders will appear here.</p><button className="btn btn-primary" onClick={()=>navigate('/marketplace')}>Browse Marketplace</button></div>
              </div>
            )}

            {/* REVIEWS */}
            {activeSection==='reviews' && (
              <div>
                <h2 className="flex items-center gap-2" style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:'1.6rem',marginBottom:24}}><Star className="w-6 h-6" strokeWidth={2}/> Reviews</h2>
                {reviewsLoading ? (
                  <div className="flex justify-center p-10"><Ico n="loader" c="w-6 h-6 spin"/></div>
                ) : myReviews.length===0 ? (
                  <div className="empty-state"><div className="icon-wrap"><Star className="w-11 h-11" strokeWidth={1.75}/></div><h3>No reviews yet</h3><p style={{color:'var(--text-soft)'}}>Complete a trade to receive your first review.</p></div>
                ) : (
                  <ReviewList reviews={myReviews}/>
                )}
              </div>
            )}

            {/* SETTINGS */}
            {activeSection==='settings' && (
              <div>
                <h2 className="flex items-center gap-2" style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:'1.6rem',marginBottom:24}}><Ico n="settings" c="w-6 h-6"/> Settings</h2>
                <div className="settings-grid">
                  <div className="card" style={{padding:20}}>
                    <h3 style={{fontFamily:'var(--font-display)',fontWeight:700,marginBottom:16}}>Profile Info</h3>
                    <div className="field"><label>Full Name</label><input className="input" defaultValue={user.name}/></div>
                    <div className="field"><label>Email</label><input className="input" type="email" defaultValue={user.email}/></div>
                    <div className="field"><label>College</label><input className="input" defaultValue={user.college}/></div>
                    <button className="btn btn-primary btn-sm" onClick={()=>toast.success('Profile updated!')}>Save Changes</button>
                  </div>
                  <div className="card" style={{padding:20}}>
                    <h3 style={{fontFamily:'var(--font-display)',fontWeight:700,marginBottom:16}}>Notifications</h3>
                    {['New message','Item view','Wishlist add','Price drop'].map(n=>(
                      <div key={n} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid var(--cream-deep)'}}>
                        <span style={{fontWeight:600}}>{n}</span>
                        <input type="checkbox" defaultChecked style={{width:18,height:18,accentColor:'var(--violet)'}}/>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}


export default Dashboard;
