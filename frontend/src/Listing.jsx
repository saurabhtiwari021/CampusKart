/* ── Listing Detail ───────────────────────────────────────────────────── */
import { useState } from 'react';
import { useApp } from './AppContext';
import Navbar from './NavBar';
import { Ico } from './icons';
import { TYPE_META } from './constants';
import { inr, timeAgo } from './utils';
import { api } from './api';
import { ReviewForm } from './Reviews';
import { ListingCard } from './ListingCard';
import { ReportModal } from './ReportModal';
import { RentCalendar } from './RentCalendar';

function ListingDetail({ id }) {
  const { listings, user, wishlist, toggleWishlist, navigate, toast, socket, setOpenChatId } = useApp();
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const listing = listings.find(l=>l.id===id);
  const saved = wishlist.includes(id);
  const type = listing ? (TYPE_META[listing.type] || TYPE_META.sell) : null;
  const related = listing ? listings.filter(l=>l.id!==id && l.category===listing.category).slice(0,4) : [];

  const toggleSave = () => {
    if (!user) { navigate('/login'); return; }
    toggleWishlist(id);
    toast[saved?'info':'success'](saved?'Removed from wishlist':'❤️ Saved to wishlist!');
  };

  const share = () => { navigator.clipboard?.writeText(window.location.href); toast.success('Link copied to clipboard!'); };

  const sendMessage = async () => {
    const trimmed = msg.trim();
    if (!trimmed) return;
    setSending(true);
    try {
      // Idempotent on the backend — re-opening this modal for the same seller
      // just returns the existing chat instead of creating a duplicate.
      const { data } = await api.chats.create(listing.id, listing.owner?.user_id);
      const chatId = data.chat.id;
      if (!socket) throw new Error('Still connecting — try again in a moment.');
      socket.emit('join_chat', { chatId });
      socket.emit('send_message', { chatId, text: trimmed });
      setOpenChatId(chatId);
      toast.success('Message sent! Check your chats.');
      setChatOpen(false); setMsg('');
      navigate('/dashboard/chats');
    } catch (err) {
      toast.error(err.message || 'Could not start chat');
    } finally {
      setSending(false);
    }
  };

  if (!listing) return (
    <div style={{minHeight:'100vh'}}><Navbar/>
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'70vh',flexDirection:'column',gap:16}}>
        <div style={{fontSize:64}}>😕</div>
        <h2 style={{fontFamily:'var(--font-display)',fontWeight:800}}>Listing not found</h2>
        <button className="btn btn-primary" onClick={()=>navigate('/marketplace')}>Browse Marketplace</button>
      </div>
    </div>
  );

  const isOwner = user && listing.owner?.user_id === user.user_id;
  // Matches the backend's gating rule exactly (no Order model yet, so this is
  // the proxy: listing must be sold/rented, and you can't review your own listing).
  const canReview = user && !isOwner && ['sold','rented'].includes(listing.status);

  return (
    <div style={{minHeight:'100vh'}}>
      <Navbar/>
      <div className="container section" style={{paddingTop:24}}>
        <button className="btn btn-ghost btn-sm" style={{marginBottom:20}} onClick={()=>window.history.back()}>
          <Ico n="chevleft" c="w-4 h-4"/> Back
        </button>

        <div className="detail-grid">
          {/* Gallery */}
          <div>
            <div className="gallery-main" onClick={()=>setZoom(true)}>
              <img src={listing.images?.[active] || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80'} alt={listing.title}/>
            </div>
            {listing.images?.length > 1 && (
              <div className="gallery-thumbs">
                {listing.images.map((img,i)=>(
                  <button key={i} className={active===i?'active':''} onClick={()=>setActive(i)}>
                    <img src={img} alt={`View ${i+1}`}/>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <span className={`stamp ${type.cls}`}>{type.label}</span>
            <h1 style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:'clamp(1.6rem,3vw,2.2rem)',marginTop:16,lineHeight:1.1}}>{listing.title}</h1>
            <div style={{display:'flex',alignItems:'center',gap:12,marginTop:12,fontSize:'.85rem',color:'var(--text-soft)',flexWrap:'wrap'}}>
              <span style={{display:'flex',alignItems:'center',gap:4}}><Ico n="mappin" c="w-4 h-4"/> {listing.location||'Campus'}</span>
              <span>· {listing.condition}</span>
              <span>· <Ico n="eye" c="w-3.5 h-3.5 inline-block" style={{display:'inline',verticalAlign:'middle'}}/> {listing.views} views</span>
              <span>· {timeAgo(listing.created_at)}</span>
            </div>

            <div className="detail-price">{inr(listing.price)}</div>
            {listing.type==='rent' && (
              <p style={{fontSize:'.9rem',color:'var(--text-soft)',marginTop:-8}}>
                {listing.rental_duration} {listing.deposit>0 && `· ₹${listing.deposit} deposit`}
              </p>
            )}

            <div style={{display:'flex',gap:10,marginTop:24,flexWrap:'wrap'}}>
              {!isOwner && (
                <button className="btn btn-primary" style={{flex:1}} onClick={()=>user?setChatOpen(true):navigate('/login')}>
                  <Ico n="message" c="w-5 h-5"/> Chat with seller
                </button>
              )}
              <button className={`btn btn-icon ${saved?'btn-coral':''}`} onClick={toggleSave} title={saved?'Remove from wishlist':'Save to wishlist'}>
                <Ico n={saved?'heart-fill':'heart'} c="w-5 h-5"/>
              </button>
              <button className="btn btn-icon" onClick={share} title="Share"><Ico n="share" c="w-5 h-5"/></button>
              <button className="btn btn-icon" onClick={()=>user?setReportOpen(true):navigate('/login')} title="Report"><Ico n="flag" c="w-5 h-5"/></button>
            </div>

            {isOwner && (
              <div style={{background:'#F5EFFF',border:'2px solid var(--violet)',borderRadius:18,padding:14,marginTop:16,fontSize:'.88rem',fontWeight:600}}>
                👑 This is your listing
              </div>
            )}

            {/* Rent calendar — only for rent listings, and not shown to the owner (they can't book their own listing) */}
            {listing.type==='rent' && !isOwner && <RentCalendar listing={listing}/>}

            {/* Description */}
            <div style={{marginTop:28}}>
              <h3 style={{fontFamily:'var(--font-display)',fontWeight:700,fontSize:'1.1rem',marginBottom:10}}>Description</h3>
              <p style={{color:'var(--text-soft)',lineHeight:1.7,whiteSpace:'pre-line'}}>{listing.description||'No description provided.'}</p>
            </div>

            {/* Tags */}
            {listing.tags?.length>0 && (
              <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:16}}>
                {listing.tags.map(t=><span key={t} className="tag">#{t}</span>)}
              </div>
            )}

            {/* Seller */}
            {listing.owner && (
              <div className="seller-card" onClick={()=>navigate(`/u/${listing.owner.user_id}`)}>
                <div className="avatar" style={{width:54,height:54,fontSize:'1.3rem'}}>{listing.owner.name?.[0]?.toUpperCase()}</div>
                <div style={{flex:1}}>
                  <div style={{fontFamily:'var(--font-display)',fontWeight:700,display:'flex',alignItems:'center',gap:8}}>
                    {listing.owner.name}
                    <Ico n="shield" c="w-4 h-4" style={{stroke:'#3b82f6'}}/>
                  </div>
                  <div style={{fontSize:'.82rem',color:'var(--text-soft)',marginTop:2}}>
                    {listing.owner.rating>0?`⭐ ${listing.owner.rating} · ${listing.owner.review_count} reviews · `:''}{listing.owner.college}
                  </div>
                </div>
              </div>
            )}

            {/* Leave a review — only once the listing is sold/rented and you're not the owner */}
            {canReview && (
              reviewSubmitted ? (
                <div style={{background:'#EAF9F0',border:'2px solid var(--teal)',borderRadius:18,padding:14,marginTop:16,fontSize:'.88rem',fontWeight:600}}>
                  ✅ Thanks for your review!
                </div>
              ) : (
                <div style={{marginTop:20}}>
                  <ReviewForm listingId={listing.id} onSubmitted={()=>setReviewSubmitted(true)}/>
                </div>
              )
            )}
          </div>
        </div>

        {/* Related */}
        {related.length>0 && (
          <div style={{marginTop:60}}>
            <h2 style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:'1.6rem',marginBottom:24}}>Related Listings</h2>
            <div className="grid-listings">
              {related.map((l,i)=><ListingCard key={l.id} listing={l} index={i}/>)}
            </div>
          </div>
        )}
      </div>

      {/* Zoom modal */}
      {zoom && (
        <div className="overlay" onClick={()=>setZoom(false)}>
          <div style={{maxWidth:760,width:'100%'}} onClick={e=>e.stopPropagation()}>
            <img src={listing.images?.[active]} alt={listing.title} style={{width:'100%',borderRadius:26,border:'3px solid var(--ink)'}}/>
          </div>
        </div>
      )}

      {/* Chat modal */}
      {chatOpen && (
        <div className="overlay" onClick={()=>setChatOpen(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <h2 style={{fontFamily:'var(--font-display)',fontWeight:800,marginBottom:16}}>Message {listing.owner?.name}</h2>
            <textarea className="input" value={msg} onChange={e=>setMsg(e.target.value)} placeholder={`Hi! Is "${listing.title}" still available?`} style={{minHeight:120}}/>
            <div style={{display:'flex',gap:10,marginTop:16}}>
              <button className="btn" onClick={()=>setChatOpen(false)}>Cancel</button>
              <button className="btn btn-primary" style={{flex:1}} onClick={sendMessage} disabled={sending}>
                {sending?<Ico n="loader" c="w-5 h-5 spin"/>:'Send Message'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Report modal */}
      {reportOpen && (
        <ReportModal target={{ type: 'listing', id: listing.id, label: listing.title }} onClose={() => setReportOpen(false)} />
      )}
    </div>
  );
}


export default ListingDetail;
