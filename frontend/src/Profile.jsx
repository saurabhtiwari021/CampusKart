/* ── Profile ──────────────────────────────────────────────────────────── */
import { useState, useEffect } from 'react';
import { useApp } from './AppContext';
import Navbar from './NavBar';
import { Ico } from './icons';
import { ListingCard } from './ListingCard';
import { ReviewList } from './Reviews';
import { api } from './api';
import { DEMO_SELLER } from './seedData';
import { ReportModal } from './ReportModal';

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
          <div className="avatar" style={{width:110,height:110,fontSize:'2rem',border:'4px solid var(--ink)',boxShadow:'6px 6px 0 var(--ink)'}}>{profileUser.name?.[0]?.toUpperCase()}</div>
          <div style={{marginBottom:12}}>
            <h1 style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:'1.6rem',display:'flex',alignItems:'center',gap:10}}>
              {profileUser.name} <Ico n="shield" c="w-5 h-5" style={{stroke:'#3b82f6'}}/>
            </h1>
            <p style={{color:'var(--text-soft)',fontSize:'.9rem'}}>{profileUser.college} · ⭐ {profileUser.rating||'New'} · {profileUser.review_count} reviews</p>
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

        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginTop:24,maxWidth:480}}>
          {[['📦',profileListings.length,'Listings'],['⭐',profileUser.rating||0,'Rating'],['💬',profileUser.review_count,'Reviews']].map(([e,v,l])=>(
            <div key={l} className="card" style={{textAlign:'center',padding:'16px 10px'}}>
              <div style={{fontSize:'1.6rem',fontWeight:800,fontFamily:'var(--font-display)'}}>{v}</div>
              <div style={{fontSize:'.78rem',color:'var(--text-soft)',fontWeight:600,marginTop:2}}>{e} {l}</div>
            </div>
          ))}
        </div>

        <div className="profile-tabs">
          {['listings','reviews','achievements'].map(t=>(
            <button key={t} className={tab===t?'active':''} onClick={()=>setTab(t)} style={{textTransform:'capitalize'}}>{t}</button>
          ))}
        </div>

        {tab==='listings' && (
          profileListings.length===0 ? (
            <div className="empty-state"><div style={{fontSize:64}}>📦</div><h3>No listings yet</h3></div>
          ) : (
            <div className="grid-listings">{profileListings.map((l,i)=><ListingCard key={l.id} listing={l} index={i}/>)}</div>
          )
        )}
        {tab==='reviews' && (
          reviewsLoading ? (
            <div style={{display:'flex',justifyContent:'center',padding:40}}><Ico n="loader" c="w-6 h-6 spin"/></div>
          ) : profileReviews.length===0 ? (
            <div className="empty-state"><div style={{fontSize:64}}>⭐</div><h3>No reviews yet</h3><p style={{color:'var(--text-soft)'}}>Reviews appear after completed trades.</p></div>
          ) : (
            <ReviewList reviews={profileReviews}/>
          )
        )}
        {tab==='achievements' && (
          <div style={{display:'flex',flexWrap:'wrap',gap:12,marginTop:16}}>
            {['🥇 First Sale','📚 Book Dealer','⭐ Top Rated','🚀 Early Adopter'].map(a=>(
              <div key={a} style={{display:'flex',alignItems:'center',gap:8,padding:'10px 18px',borderRadius:999,border:'2.5px solid var(--ink)',background:'var(--yellow)',fontWeight:700,fontSize:'.88rem',boxShadow:'var(--sh-1) var(--shadow-col)'}}>{a}</div>
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
