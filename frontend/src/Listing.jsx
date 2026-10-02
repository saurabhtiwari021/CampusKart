import { useState } from 'react';
import { Frown, Crown, Star, CheckCircle2 } from 'lucide-react';
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
import { Reveal } from './Reveal';

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
    toast[saved?'info':'success'](saved?'Removed from wishlist':'Saved to wishlist!');
  };

  const share = () => { navigator.clipboard?.writeText(window.location.href); toast.success('Link copied to clipboard!'); };

  const sendMessage = async () => {
    const trimmed = msg.trim();
    if (!trimmed) return;
    setSending(true);
    try {
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
      <div className="flex items-center justify-center flex-col gap-4" style={{minHeight:'70vh'}}>
        <Frown className="w-16 h-16" strokeWidth={1.5} style={{color:'var(--text-soft)'}}/>
        <h2 style={{fontFamily:'var(--font-display)',fontWeight:500}}>Listing not found</h2>
        <button className="btn btn-primary" onClick={()=>navigate('/marketplace')}>Browse Marketplace</button>
      </div>
    </div>
  );

  const isOwner = user && listing.owner?.user_id === user.user_id;
  const canReview = user && !isOwner && ['sold','rented'].includes(listing.status);

  return (
    <div style={{minHeight:'100vh'}}>
      <Navbar/>
      <div className="container section" style={{paddingTop:24}}>
        <nav className="crumbs" aria-label="Breadcrumb">
          <button onClick={()=>navigate('/marketplace')}>Marketplace</button><span aria-hidden="true">/</span>
          <button onClick={()=>navigate(`/marketplace?category=${listing.category}`)}>{listing.category}</button><span aria-hidden="true">/</span>
          <span aria-current="page">{listing.title}</span>
        </nav>

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
          <div className="detail-info">
            <span className={`stamp ${type.cls}`}>{type.label}</span>
            <h1 style={{fontFamily:'var(--font-display)',fontWeight:500,fontSize:'clamp(2rem,3.6vw,3.2rem)',marginTop:18,lineHeight:1.05}}>{listing.title}</h1>
            <div style={{display:'flex',alignItems:'center',gap:12,marginTop:12,fontSize:'.85rem',color:'var(--text-soft)',flexWrap:'wrap'}}>
              <span style={{display:'flex',alignItems:'center',gap:4}}><Ico n="mappin" c="w-4 h-4"/> {listing.location||'Campus'}</span>
              <span>· {listing.condition}</span>
              <span>· <Ico n="eye" c="w-3.5 h-3.5 inline-block" style={{display:'inline',verticalAlign:'middle'}}/> {listing.views} views</span>
              <span>· {timeAgo(listing.created_at)}</span>
            </div>

            <div className="detail-price" style={{background:'linear-gradient(135deg, var(--jade), var(--jade-deep))',WebkitBackgroundClip:'text',color:'transparent'}}>{inr(listing.price)}</div>
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
              <div className="flex items-center gap-2" style={{background:'var(--tint)',border:'1px solid var(--tone-deep)',borderRadius:18,padding:14,marginTop:16,fontSize:'.88rem',fontWeight:600}}>
                <Crown className="w-4 h-4" strokeWidth={2.25} style={{color:'var(--violet)'}}/> This is your listing
              </div>
            )}

            {/* Rent calendar — only for rent listings, and not shown to the owner (they can't book their own listing) */}
            {listing.type==='rent' && !isOwner && <RentCalendar listing={listing}/>}

            {/* Description */}
            <div style={{marginTop:28}}>
              <h3 style={{fontFamily:'var(--font-display)',fontSize:'1.4rem',marginBottom:12,paddingTop:24,borderTop:'1px solid var(--hairline)'}}>Description</h3>
              <p style={{color:'var(--text-soft)',lineHeight:1.7,whiteSpace:'pre-line'}}>{listing.description||'No description provided.'}</p>
            </div>

            {/* Details */}
            <dl className="spec" style={{marginTop:28}}>
              <dt>Category</dt><dd>{listing.category}</dd>
              {listing.condition && <><dt>Condition</dt><dd>{listing.condition}</dd></>}
              <dt>Pickup</dt><dd>{listing.location||'Campus'}</dd>
              {listing.type==='rent' && listing.rental_duration && <><dt>Rental</dt><dd>{listing.rental_duration}</dd></>}
              {listing.type==='rent' && listing.deposit>0 && <><dt>Deposit</dt><dd>₹{listing.deposit}</dd></>}
              <dt>Listed</dt><dd>{timeAgo(listing.created_at)}</dd>
            </dl>

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
                    <Ico n="shield" c="w-4 h-4" style={{stroke:'var(--sage-deep)'}}/>
                  </div>
                  <div className="flex items-center gap-1 flex-wrap" style={{fontSize:'.82rem',color:'var(--text-soft)',marginTop:2}}>
                    {listing.owner.rating>0 && <><Star className="w-3.5 h-3.5" style={{fill:'var(--ochre)',stroke:'var(--ochre)'}}/> {listing.owner.rating} · {listing.owner.review_count} reviews ·</>} {listing.owner.college}
                  </div>
                </div>
              </div>
            )}

            {/* Leave a review — only once the listing is sold/rented and you're not the owner */}
            {canReview && (
              reviewSubmitted ? (
                <div className="flex items-center gap-2" style={{background:'#EEF3EC',border:'1px solid var(--sage)',borderRadius:18,padding:14,marginTop:16,fontSize:'.88rem',fontWeight:600}}>
                  <CheckCircle2 className="w-4 h-4" strokeWidth={2.25} style={{color:'var(--teal)'}}/> Thanks for your review!
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
          <div style={{marginTop:80}}>
            <Reveal blur>
              <h2 style={{fontFamily:'var(--font-display)',fontWeight:400,fontSize:'2.2rem',marginBottom:40,textAlign:'center',background:'linear-gradient(135deg, var(--ink), var(--jade))',WebkitBackgroundClip:'text',color:'transparent'}}>You may also like</h2>
            </Reveal>
            <div className="grid-listings">
              {related.map((l,i)=><Reveal key={l.id} delay={i*80} scale><ListingCard listing={l} index={i}/></Reveal>)}
            </div>
          </div>
        )}
      </div>

      {/* Zoom modal */}
      {zoom && (
        <div className="overlay" onClick={()=>setZoom(false)}>
          <div style={{maxWidth:760,width:'100%'}} onClick={e=>e.stopPropagation()}>
            <img src={listing.images?.[active]} alt={listing.title} style={{width:'100%',borderRadius:26,border:'none'}}/>
          </div>
        </div>
      )}

      {/* Chat modal */}
      {chatOpen && (
        <div className="overlay" onClick={()=>setChatOpen(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <h2 style={{fontFamily:'var(--font-display)',fontWeight:500,marginBottom:16}}>Message {listing.owner?.name}</h2>
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