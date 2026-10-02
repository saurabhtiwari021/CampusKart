import { useState, useEffect } from 'react';
import { Package, Star, MessageCircle, Trophy, BookOpen, Rocket } from 'lucide-react';
import { useApp } from './AppContext';
import Navbar from './NavBar';
import { Ico } from './icons';
import { ListingCard } from './ListingCard';
import { ReviewList } from './Reviews';
import { api } from './api';
import { DEMO_SELLER } from './seedData';
import { ReportModal } from './ReportModal';
import { Reveal } from './Reveal';

function Profile({ uid: profileId }) {
  const { listings, user, navigate, toast } = useApp();
  const [tab, setTab] = useState('listings');
  const [profileReviews, setProfileReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const profileUser = user?.user_id === profileId ? user : DEMO_SELLER;
  const profileListings = listings.filter(l=>l.owner?.user_id===profileId);

  useEffect(() => {
    if (tab!=='reviews') return;
    setReviewsLoading(true);
    api.reviews.byUser(profileId)
      .then(({ data }) => setProfileReviews(data.reviews))
      .catch(() => toast.error('Could not load reviews'))
      .finally(() => setReviewsLoading(false));
  }, [tab, profileId]);

  return (
    <div style={{minHeight:'100vh'}}>
      <Navbar/>
      <div className="container section" style={{paddingTop:24}}>
        <button className="btn btn-ghost btn-sm" style={{marginBottom:16}} onClick={()=>window.history.back()}><Ico n="chevleft" c="w-4 h-4"/> Back</button>

        <div className="profile-cover"/>

        <div className="profile-head">
          <div className="avatar" style={{width:110,height:110,fontSize:'2rem',border:'5px solid var(--paper)',boxShadow:'0 14px 34px rgba(35,26,22,.14)'}}>{profileUser.name?.[0]?.toUpperCase()}</div>
          <div style={{marginBottom:12}}>
            <h1 style={{fontFamily:'var(--font-display)',fontWeight:600,fontSize:'1.8rem',display:'flex',alignItems:'center',gap:10}}>
              {profileUser.name} <Ico n="shield" c="w-5 h-5" style={{stroke:'var(--sage-deep)'}}/>
            </h1>
            <p className="flex items-center gap-1 flex-wrap" style={{color:'var(--text-soft)',fontSize:'.9rem'}}>{profileUser.college} · <Star className="w-3.5 h-3.5" style={{fill:'var(--ochre)',stroke:'var(--ochre)'}}/> {profileUser.rating||'New'} · {profileUser.review_count} reviews</p>
          </div>
          {user?.user_id === profileId && (
            <button className="btn btn-sm ml-auto" style={{marginLeft:'auto',marginBottom:12}} onClick={()=>navigate('/dashboard/settings')}>
              <Ico n="edit" c="w-4 h-4"/> Edit Profile
            </button>
          )}
          {user && user.user_id !== profileId && (
            <button className="btn btn-icon ml-auto" style={{marginLeft:'auto',marginBottom:12}} onClick={()=>setReportOpen(true)} title="Report user">
              <Ico n="flag" c="w-4 h-4"/>
            </button>
          )}
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginTop:28,maxWidth:520}}>
          {[[Package,profileListings.length,'Listings'],[Star,profileUser.rating||0,'Rating'],[MessageCircle,profileUser.review_count,'Reviews']].map(([Icon,v,l],i)=>(
            <Reveal key={l} delay={i*100} scale className="card" style={{textAlign:'center',padding:'20px 14px'}}>
              <div style={{fontSize:'2rem',fontWeight:600,fontFamily:'var(--font-display)',color:'var(--jade)'}}>{v}</div>
              <div className="flex items-center justify-center gap-1" style={{fontSize:'.78rem',color:'var(--text-soft)',fontWeight:600,marginTop:2}}><Icon className="w-3.5 h-3.5" strokeWidth={2}/> {l}</div>
            </Reveal>
          ))}
        </div>

        <div className="profile-tabs">
          {['listings','reviews','achievements'].map(t=>(
            <button key={t} className={tab===t?'active':''} onClick={()=>setTab(t)} style={{textTransform:'capitalize'}}>{t}</button>
          ))}
        </div>

        {tab==='listings' && (
          profileListings.length===0 ? (
            <div className="empty-state"><div className="icon-wrap"><Package className="w-11 h-11" strokeWidth={1.75}/></div><h3>No listings yet</h3></div>
          ) : (
            <div className="grid-listings">{profileListings.map((l,i)=><ListingCard key={l.id} listing={l} index={i}/>)}</div>
          )
        )}
        {tab==='reviews' && (
          reviewsLoading ? (
            <div className="flex justify-center p-10"><Ico n="loader" c="w-6 h-6 spin"/></div>
          ) : profileReviews.length===0 ? (
            <div className="empty-state"><div className="icon-wrap"><Star className="w-11 h-11" strokeWidth={1.75}/></div><h3>No reviews yet</h3><p style={{color:'var(--text-soft)'}}>Reviews appear after completed trades.</p></div>
          ) : (
            <ReviewList reviews={profileReviews}/>
          )
        )}
        {tab==='achievements' && (
          <div style={{display:'flex',flexWrap:'wrap',gap:12,marginTop:16}}>
            {[[Trophy,'First Sale'],[BookOpen,'Book Dealer'],[Star,'Top Rated'],[Rocket,'Early Adopter']].map(([Icon,a],i)=>(
              <Reveal key={a} delay={i*80} scale as="div" className="flex items-center gap-2" style={{padding:'12px 22px',borderRadius:999,border:'1px solid rgba(13,107,78,0.15)',background:'linear-gradient(135deg, rgba(238,243,238,0.8), #fff)',fontWeight:700,fontSize:'.92rem',boxShadow:'0 4px 16px rgba(13,107,78,0.08)',backdropFilter:'blur(8px)'}}>
                <Icon className="w-4 h-4" strokeWidth={2.25}/> {a}
              </Reveal>
            ))}
          </div>
        )}
      </div>
      {reportOpen && (
        <ReportModal target={{ type: 'user', id: profileId, label: profileUser.name }} onClose={() => setReportOpen(false)} />
      )}
    </div>
  );
}


export default Profile;
