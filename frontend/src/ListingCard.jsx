import { useState } from 'react';
import { useApp } from './AppContext';
import { Ico } from './icons';
import { TYPE_META, CONDITION_META } from './constants';
import { inr, timeAgo } from './utils';

export function ListingCard({ listing, index=0 }) {
  const { user, wishlist, toggleWishlist, navigate, toast } = useApp();
  const [pop, setPop] = useState(false);
  const saved = wishlist.includes(listing.id);
  const type = TYPE_META[listing.type] || TYPE_META.sell;
  const condition = CONDITION_META[listing.condition] || CONDITION_META.Good;
  const owner = listing.owner || {};

  const verified = /\.(edu|ac\.\w{2,3})$/i.test(owner.email || '');

  const handleHeart = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    toggleWishlist(listing.id);
    setPop(true); setTimeout(()=>setPop(false),350);
    toast[saved?'info':'success'](saved ? 'Removed from wishlist' : 'Saved to wishlist!');
  };

  return (
    <div className="listing-card" style={{animationDelay:`${Math.min(index*.04,.4)}s`}}>
      <a href={`#/listing/${listing.id}`} onClick={(e)=>{e.preventDefault();navigate(`/listing/${listing.id}`);}}>
        <div className="thumb-wrap">
          <img src={listing.images?.[0] || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80'} alt={listing.title} loading="lazy"/>
          <div className="badge-pos">
            <span className={`stamp ${type.cls}`}>{type.label}</span>
          </div>
          <button className={`heart-btn ${pop?'pop':''}`} onClick={handleHeart} aria-label="Wishlist">
            <Ico n={saved?'heart-fill':'heart'} c="w-4 h-4"/>
          </button>
          {listing.condition && <span className={`condition-badge ${condition.cls}`}>{listing.condition}</span>}
        </div>
        <div className="body">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',gap:8}}>
            <h4>{listing.title}</h4>
            <span className="price">{inr(listing.price)}</span>
          </div>
          <div className="meta">
            <Ico n="mappin" c="w-3 h-3"/>
            <span>{listing.location || 'Campus'}</span>
            <span>·</span>
            <span>{timeAgo(listing.created_at)}</span>
            <span className="ml-auto flex items-center gap-1"><Ico n="eye" c="w-3 h-3"/> {listing.views}</span>
          </div>
          <div className="seller-row">
            <span className="seller-avatar">
              {owner.picture ? <img src={owner.picture} alt=""/> : (owner.name?.[0]?.toUpperCase() || '?')}
            </span>
            <span className="seller-name">{owner.name || 'Unknown seller'}</span>
            {verified && <Ico n="shield" c="w-3.5 h-3.5" style={{stroke:'#3b82f6',flexShrink:0}}/>}
            {owner.college && <span className="flex-shrink-0" style={{opacity:.7}}>· {owner.college}</span>}
          </div>
        </div>
      </a>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="skel-card">
      <div style={{aspectRatio:'1/1'}} className="skel"/>
      <div style={{padding:14,display:'flex',flexDirection:'column',gap:8}}>
        <div className="skel skel-line" style={{width:'75%'}}/>
        <div className="skel skel-line" style={{width:'50%'}}/>
      </div>
    </div>
  );
}
