/* ── Reviews (shared components) ─────────────────────────────────────────
 * Used by Listing.js (leave a review) and Profile.js / Dashboard.js
 * (display reviews a seller has received).
 */
import { useState } from 'react';
import { useApp } from './AppContext';
import { Ico } from './icons';
import { timeAgo } from './utils';
import { api } from './api';

/** Row of 5 stars. Pass `value` + `onChange` for an interactive picker, or
 * just `value` for a read-only display. */
function StarRating({ value, onChange, size=20 }) {
  const interactive = typeof onChange === 'function';
  return (
    <div style={{display:'flex',gap:4}}>
      {[1,2,3,4,5].map(n => (
        <button
          key={n}
          type="button"
          disabled={!interactive}
          onClick={()=>interactive && onChange(n)}
          style={{background:'none',border:'none',padding:0,cursor:interactive?'pointer':'default',lineHeight:0}}
          title={interactive ? `${n} star${n>1?'s':''}` : undefined}
        >
          <Ico n="star" c="" style={{
            width:size, height:size,
            fill: n<=value ? 'var(--yellow)' : 'none',
            stroke: n<=value ? 'var(--ink)' : 'var(--text-soft)',
          }}/>
        </button>
      ))}
    </div>
  );
}

/** Card for a single review — buyer, stars, comment, and which listing it was for. */
function ReviewCard({ review }) {
  return (
    <div className="card" style={{padding:16,marginBottom:12,display:'flex',gap:14}}>
      <div className="avatar" style={{width:40,height:40,fontSize:'1rem',flexShrink:0}}>
        {review.buyer?.name?.[0]?.toUpperCase() || '?'}
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,flexWrap:'wrap'}}>
          <div style={{fontWeight:700}}>{review.buyer?.name || 'A buyer'}</div>
          <div style={{fontSize:'.78rem',color:'var(--text-soft)'}}>{timeAgo(review.created_at)}</div>
        </div>
        <StarRating value={review.rating} size={15}/>
        {review.comment && <p style={{marginTop:8,color:'var(--text-soft)',lineHeight:1.6}}>{review.comment}</p>}
        {review.listing?.title && (
          <p style={{marginTop:8,fontSize:'.78rem',color:'var(--text-soft)'}}>On "{review.listing.title}"</p>
        )}
      </div>
    </div>
  );
}

/** Plain list of ReviewCards, newest first (the backend already sorts this way). */
export function ReviewList({ reviews }) {
  return <div>{reviews.map(r => <ReviewCard key={r.id} review={r}/>)}</div>;
}

/**
 * Leave-a-review form for a single listing. Gating (who's allowed to submit)
 * is enforced server-side — this form just submits and surfaces whatever
 * error the backend returns (e.g. "not sold yet", "already reviewed").
 */
export function ReviewForm({ listingId, onSubmitted }) {
  const { toast } = useApp();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (rating < 1) { toast.error('Pick a star rating first'); return; }
    setSubmitting(true);
    try {
      const { data } = await api.reviews.create(listingId, rating, comment.trim());
      toast.success('Review posted!');
      setRating(0); setComment('');
      onSubmitted && onSubmitted(data.review);
    } catch (err) {
      toast.error(err.message || 'Could not post review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card" style={{padding:18}}>
      <h3 style={{fontFamily:'var(--font-display)',fontWeight:700,marginBottom:12}}>Leave a review</h3>
      <StarRating value={rating} onChange={setRating} size={26}/>
      <textarea
        className="input"
        style={{marginTop:12,minHeight:90}}
        placeholder="How was the deal? (optional)"
        value={comment}
        onChange={e=>setComment(e.target.value)}
      />
      <button className="btn btn-primary btn-sm" style={{marginTop:12}} onClick={submit} disabled={submitting}>
        {submitting ? <Ico n="loader" c="w-4 h-4 spin"/> : 'Submit review'}
      </button>
    </div>
  );
}
