/* ── Landing Page ─────────────────────────────────────────────────────── */
import { useState, useEffect } from 'react';
import { useApp } from './AppContext';
import Navbar from './NavBar';
import { Ico } from './icons';
import { ListingCard, CardSkeleton } from './ListingCard';
import { CATS } from './constants';

function Landing() {
  const { listings, navigate } = useApp();
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => { const t = setTimeout(()=>setLoading(false),800); return ()=>clearTimeout(t); }, []);

  const featured = listings.slice(0,8);
  const FAQS = [
    ['Is CampusKart free?','Yes! Browsing, listing and chatting are completely free for all students.'],
    ['How do payments work?','Payments are arranged between buyer and seller — usually cash or UPI on campus pickup.'],
    ['Can I rent instead of buy?','Absolutely! Many listings are for rent — cycles, mini fridges and more.'],
    ['Is it safe?','Trade with verified campus students, check ratings, and meet in public campus spots.'],
  ];
  const MARQUEE = ['📚 Books','💻 Electronics','🚲 Cycles','👕 Clothing','⚽ Sports','🛋️ Furniture','✏️ Stationery','🎵 Music','🎮 Gaming','🧪 Lab Equipment'];

  return (
    <div>
      <Navbar/>
      {/* Hero */}
      <section className="hero section">
        <div style={{position:'absolute',top:-80,right:-80,width:400,height:400,borderRadius:'50%',background:'rgba(108,60,233,.12)',zIndex:0}}/>
        <div style={{position:'absolute',bottom:20,left:-60,width:260,height:260,borderRadius:'50%',background:'rgba(255,92,114,.1)',zIndex:0}}/>
        <div className="container" style={{position:'relative',zIndex:1}}>
          <span className="eyebrow">🎓 By students, for students</span>
          <h1 style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:'clamp(2.8rem,7vw,5rem)',lineHeight:.96,letterSpacing:'-.02em',marginTop:20,marginBottom:20}}>
            Buy. Sell. Rent.<br/><span style={{color:'var(--violet)'}}>Right on campus.</span>
          </h1>
          <p style={{fontSize:'1.15rem',color:'var(--text-soft)',maxWidth:'46ch',marginBottom:32}}>
            Find textbooks, cycles, gadgets and dorm essentials from fellow students — or make some cash clearing out your room.
          </p>
          <div style={{display:'flex',gap:10,maxWidth:560,marginBottom:24}}>
            <div className="nav-search" style={{flex:1,maxWidth:'none',margin:0}}>
              <form onSubmit={(e)=>{e.preventDefault();navigate(`/marketplace?q=${encodeURIComponent(q)}`)}}>
                <Ico n="search" style={{position:'absolute',left:16,top:'50%',transform:'translateY(-50%)',width:20,height:20,stroke:'var(--ink-soft)'}}/>
                <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search textbooks, cycles, gadgets…" style={{height:58,paddingLeft:50,fontSize:'1rem',boxShadow:'var(--sh-1) var(--shadow-col)'}}/>
              </form>
            </div>
            <button className="btn btn-primary" onClick={()=>navigate(`/marketplace?q=${encodeURIComponent(q)}`)}>Search</button>
          </div>

          {/* Buy · Sell · Rent action buttons */}
          <div style={{display:'flex',flexWrap:'wrap',gap:14,marginBottom:28}}>
            <button
              onClick={()=>navigate('/marketplace?type=sell')}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='6px 6px 0 var(--ink)';}}
              onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='4px 4px 0 var(--ink)';}}
              style={{display:'flex',alignItems:'center',gap:10,padding:'13px 28px',borderRadius:50,background:'var(--violet)',color:'#fff',fontFamily:'var(--font-display)',fontWeight:700,fontSize:'1rem',border:'2.5px solid var(--ink)',boxShadow:'4px 4px 0 var(--ink)',cursor:'pointer',transition:'transform .15s,box-shadow .15s'}}>
              <span style={{fontSize:'1.3rem'}}>🛒</span> Buy
            </button>
            <button
              onClick={()=>navigate('/create')}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='6px 6px 0 var(--ink)';}}
              onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='4px 4px 0 var(--ink)';}}
              style={{display:'flex',alignItems:'center',gap:10,padding:'13px 28px',borderRadius:50,background:'var(--yellow)',color:'var(--ink)',fontFamily:'var(--font-display)',fontWeight:700,fontSize:'1rem',border:'2.5px solid var(--ink)',boxShadow:'4px 4px 0 var(--ink)',cursor:'pointer',transition:'transform .15s,box-shadow .15s'}}>
              <span style={{fontSize:'1.3rem'}}>🏷️</span> Sell
            </button>
            <button
              onClick={()=>navigate('/marketplace?type=rent')}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='6px 6px 0 var(--ink)';}}
              onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='4px 4px 0 var(--ink)';}}
              style={{display:'flex',alignItems:'center',gap:10,padding:'13px 28px',borderRadius:50,background:'#00C2A8',color:'#fff',fontFamily:'var(--font-display)',fontWeight:700,fontSize:'1rem',border:'2.5px solid var(--ink)',boxShadow:'4px 4px 0 var(--ink)',cursor:'pointer',transition:'transform .15s,box-shadow .15s'}}>
              <span style={{fontSize:'1.3rem'}}>🔑</span> Rent
            </button>
          </div>

          <div style={{display:'flex',flexWrap:'wrap',gap:10}}>
            {CATS.map(c=>(
              <button key={c.name} className="chip" onClick={()=>navigate(`/marketplace?category=${c.name}`)}>
                {c.emoji} {c.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="marquee-strip">
        <div className="marquee-track">
          {[...MARQUEE,...MARQUEE].map((m,i)=>{
            const spaceIdx = m.indexOf(' ');
            const emoji = m.slice(0, spaceIdx);
            const text = m.slice(spaceIdx);
            return (
              <span key={i} style={{display:'inline-flex',alignItems:'center',gap:6}}>
                <span style={{display:'inline-block',animation:'spin 3s linear infinite'}}>{emoji}</span>
                {text}&nbsp;
                <span style={{display:'inline-block',animation:'spin 2s linear infinite',margin:'0 8px'}}>✦</span>
                &nbsp;
              </span>
            );
          })}
        </div>
      </div>

      {/* Categories */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <h2 style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:'clamp(1.9rem,4vw,2.6rem)'}}>Browse by Category</h2>
              <p style={{color:'var(--text-soft)',marginTop:4}}>Find what you need fast</p>
            </div>
          </div>
          <div className="cat-grid">
            {CATS.map(c=>(
              <div key={c.name} className="cat-tile" onClick={()=>navigate(`/marketplace?category=${c.name}`)}>
                <div className="ico" style={{background:c.color}}>{c.emoji}</div>
                <span style={{fontWeight:700,fontSize:'.88rem'}}>{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending */}
      <section className="section" style={{paddingTop:0}}>
        <div className="container">
          <div className="section-head">
            <div>
              <h2 style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:'clamp(1.9rem,4vw,2.6rem)'}}>🔥 Trending Now</h2>
              <p style={{color:'var(--text-soft)',marginTop:4}}>Most popular listings this week</p>
            </div>
            <button className="btn btn-sm" onClick={()=>navigate('/marketplace')}>
              View all <Ico n="arrow" c="w-4 h-4"/>
            </button>
          </div>
          <div className="grid-listings">
            {loading ? Array.from({length:8}).map((_,i)=><CardSkeleton key={i}/>) : featured.map((l,i)=><ListingCard key={l.id} listing={l} index={i}/>)}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="steps-band section">
        <div className="container">
          <h2 style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:'clamp(1.9rem,4vw,2.6rem)',marginBottom:40}}>How it works</h2>
          <div className="steps-grid">
            {[['List in seconds','Snap a photo, set a price, hit publish. Your item is live instantly.','📸'],
              ['Chat & agree','Message buyers directly, negotiate and arrange a campus meetup.','💬'],
              ['Meet & trade','Hand over the item, get paid. Leave a review and build your rep.','🤝']
            ].map(([t,d,e],i)=>(
              <div key={i}>
                <div className="step-num">{i+1}</div>
                <h3 style={{fontFamily:'var(--font-display)',fontSize:'1.25rem',fontWeight:700,marginBottom:10}}>{e} {t}</h3>
                <p style={{color:'rgba(255,246,233,.7)'}}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section">
        <div className="container">
          <h2 style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:'clamp(1.9rem,4vw,2.6rem)',marginBottom:36}}>Loved by students ❤️</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:20}}>
            {[
              ['Got my entire sem\'s textbooks for under ₹1000. Total lifesaver!','Ananya R.','1st Year, CSE'],
              ['Sold my old cycle in 2 hours. Way easier than notice boards!','Karan V.','Final Year, ME'],
              ['Rented a mini fridge for the semester. Super smooth process.','Meera J.','2nd Year, ECE'],
            ].map(([q,n,yr],i)=>(
              <div key={i} className="card testimonial-card">
                <div className="stars">
                  {[0,1,2,3,4].map(s=><Ico key={s} n="star" c="w-4 h-4" style={{fill:'var(--yellow)',stroke:'var(--ink)',strokeWidth:1.5}}/>)}
                </div>
                <p style={{fontWeight:500,marginBottom:16}}>"{q}"</p>
                <div style={{fontSize:'.88rem'}}>
                  <span style={{fontWeight:700}}>{n}</span>
                  <span style={{color:'var(--text-soft)'}}> · {yr}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" style={{paddingTop:0}}>
        <div className="container" style={{maxWidth:760}}>
          <h2 style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:'clamp(1.9rem,4vw,2.6rem)',textAlign:'center',marginBottom:32}}>Questions?</h2>
          {FAQS.map(([q,a],i)=>(
            <div key={i} className={`faq-item ${openFaq===i?'open':''}`}>
              <div className="faq-q" onClick={()=>setOpenFaq(openFaq===i?null:i)}>
                <span>{q}</span>
                <Ico n="plus" c="w-5 h-5" style={{transform:openFaq===i?'rotate(45deg)':'none',transition:'transform .2s'}}/>
              </div>
              {openFaq===i && <div className="faq-a-in">{a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="section" style={{paddingTop:0}}>
        <div className="container">
          <div className="cta-band">
            <div className="blob" style={{width:200,height:200,top:-60,left:-60,opacity:.5}}/>
            <div className="blob" style={{width:140,height:140,bottom:-40,right:60,opacity:.3}}/>
            <h2 style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:'clamp(2rem,5vw,3.2rem)',position:'relative'}}>Got stuff to sell?</h2>
            <p style={{marginTop:12,color:'rgba(255,255,255,.8)',maxWidth:'36ch',margin:'12px auto 0',position:'relative'}}>List your first item in under a minute and reach thousands of students.</p>
            <button className="btn btn-yellow" style={{marginTop:28,position:'relative'}} onClick={()=>navigate('/create')}>
              Start selling <Ico n="arrow" c="w-4 h-4"/>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="site-footer">
        <div className="container footer-inner">
          <div className="logo"><div className="mark">C</div> CampusKart</div>
          <p style={{fontSize:'.85rem',color:'var(--text-soft)'}}>© 2026 CampusKart · Built for students 🎓</p>
          <div style={{display:'flex',gap:16}}>
            <button className="btn btn-ghost btn-sm" onClick={()=>navigate('/marketplace')}>Browse</button>
            <button className="btn btn-ghost btn-sm" onClick={()=>navigate('/login')}>Sign in</button>
          </div>
        </div>
      </footer>
    </div>
  );
}


export default Landing;
