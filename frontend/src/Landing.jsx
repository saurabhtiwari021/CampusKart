import { useState, useEffect } from 'react';
import { GraduationCap, ShoppingCart, Tag, Key, Flame, Camera, MessageCircle, Handshake, Heart, ShieldCheck, Sparkles } from 'lucide-react';
import { useApp } from './AppContext';
import Navbar from './NavBar';
import { Ico } from './icons';
import { ListingCard, CardSkeleton } from './ListingCard';
import { CATS } from './constants';
import { Reveal } from './Reveal';
import HeroIllustration from './HeroIllustration';
import heroPhoto from './assets/campus-market-preview.jpg';

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
      <section className="hero section hero-v2">
        <div className="hero-blob hero-blob-a"/>
        <div className="hero-blob hero-blob-b"/>
        <div className="container grid lg:grid-cols-[1.08fr,0.92fr] gap-16 items-center" style={{position:'relative',zIndex:1}}>
          <div>
          <span className="eyebrow"><GraduationCap className="w-3.5 h-3.5" strokeWidth={2.5}/> By students, for students</span>
          <h1 className="hero-headline">
            Buy. Sell. Rent.<br/><span className="hero-headline-accent">Right on campus.</span>
          </h1>
          <p className="hero-sub">
            Find textbooks, cycles, gadgets and dorm essentials from fellow students — or make some cash clearing out your room.
          </p>

          <div className="hero-search-row">
            <div className="nav-search" style={{flex:1,maxWidth:'none',margin:0}}>
              <form onSubmit={(e)=>{e.preventDefault();navigate(`/marketplace?q=${encodeURIComponent(q)}`)}}>
                <Ico n="search" style={{position:'absolute',left:18,top:'50%',transform:'translateY(-50%)',width:20,height:20,stroke:'var(--ink-soft)'}}/>
                <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search textbooks, cycles, gadgets…" style={{height:60,paddingLeft:52,fontSize:'1rem'}}/>
              </form>
            </div>
            <button className="btn btn-primary hero-search-btn" onClick={()=>navigate(`/marketplace?q=${encodeURIComponent(q)}`)}>
              <Ico n="search" c="w-5 h-5"/> Search
            </button>
          </div>

          {/* Buy · Sell · Rent action buttons */}
          <div className="hero-actions">
            <button onClick={()=>navigate('/marketplace?type=sell')} className="hero-cta hero-cta-buy">
              <ShoppingCart className="w-5 h-5" strokeWidth={2.25}/> Buy
            </button>
            <button onClick={()=>navigate('/create')} className="hero-cta hero-cta-sell">
              <Tag className="w-5 h-5" strokeWidth={2.25}/> Sell
            </button>
            <button onClick={()=>navigate('/marketplace?type=rent')} className="hero-cta hero-cta-rent">
              <Key className="w-5 h-5" strokeWidth={2.25}/> Rent
            </button>
          </div>

          <div className="hero-chips">
            {CATS.slice(0,7).map(c=>(
              <button key={c.name} className="chip" onClick={()=>navigate(`/marketplace?category=${c.name}`)}>
                {c.emoji} {c.name}
              </button>
            ))}
          </div>
          </div>

          <div className="hero-visual hidden lg:block">
            <div className="hero-visual-glow"/>
            <div className="hero-illo-wrap">
              <HeroIllustration className="hero-illo-main"/>
              <span className="hero-float-badge hero-float-badge-a"><ShieldCheck className="w-4 h-4" strokeWidth={2.5}/> Verified sellers</span>
              <span className="hero-float-badge hero-float-badge-b"><Sparkles className="w-4 h-4" strokeWidth={2.5}/> 10k+ students</span>
            </div>
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
            {CATS.map((c,i)=>(
              <Reveal key={c.name} delay={i*40} className="cat-tile" onClick={()=>navigate(`/marketplace?category=${c.name}`)}>
                <div className="ico" style={{background:c.color}}>{c.emoji}</div>
                <span style={{fontWeight:700,fontSize:'.88rem'}}>{c.name}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Trending */}
      <section className="section" style={{paddingTop:0}}>
        <div className="container">
          <div className="section-head">
            <div>
              <h2 className="flex items-center gap-2" style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:'clamp(1.9rem,4vw,2.6rem)'}}><Flame className="w-8 h-8" strokeWidth={2.25} style={{color:'var(--coral)'}}/> Trending Now</h2>
              <p style={{color:'var(--text-soft)',marginTop:4}}>Most popular listings this week</p>
            </div>
            <button className="btn btn-sm" onClick={()=>navigate('/marketplace')}>
              View all <Ico n="arrow" c="w-4 h-4"/>
            </button>
          </div>
          <div className="grid-listings">
            {loading ? Array.from({length:8}).map((_,i)=><CardSkeleton key={i}/>) : featured.map((l,i)=><Reveal key={l.id} delay={Math.min(i*40,240)}><ListingCard listing={l} index={i}/></Reveal>)}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="steps-band section">
        <div className="container">
          <h2 style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:'clamp(1.9rem,4vw,2.6rem)',marginBottom:40}}>How it works</h2>
          <div className="steps-grid">
            {[['List in seconds','Snap a photo, set a price, hit publish. Your item is live instantly.',Camera],
              ['Chat & agree','Message buyers directly, negotiate and arrange a campus meetup.',MessageCircle],
              ['Meet & trade','Hand over the item, get paid. Leave a review and build your rep.',Handshake]
            ].map(([t,d,Icon],i)=>(
              <Reveal key={i} delay={i*100}>
                <div className="step-num">{i+1}</div>
                <h3 className="flex items-center gap-2" style={{fontFamily:'var(--font-display)',fontSize:'1.25rem',fontWeight:700,marginBottom:10}}><Icon className="w-5 h-5" strokeWidth={2.25}/> {t}</h3>
                <p style={{color:'rgba(255,246,233,.7)'}}>{d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section">
        <div className="container">
          <h2 className="flex items-center gap-2" style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:'clamp(1.9rem,4vw,2.6rem)',marginBottom:36}}>Loved by students <Heart className="w-8 h-8" strokeWidth={2.25} style={{fill:'var(--coral)',stroke:'var(--ink)'}}/></h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:20}}>
            {[
              ['Got my entire sem\'s textbooks for under ₹1000. Total lifesaver!','Ananya R.','1st Year, CSE'],
              ['Sold my old cycle in 2 hours. Way easier than notice boards!','Karan V.','Final Year, ME'],
              ['Rented a mini fridge for the semester. Super smooth process.','Meera J.','2nd Year, ECE'],
            ].map(([q,n,yr],i)=>(
              <Reveal key={i} delay={i*80} className="card testimonial-card">
                <div className="stars">
                  {[0,1,2,3,4].map(s=><Ico key={s} n="star" c="w-4 h-4" style={{fill:'var(--yellow)',stroke:'var(--ink)',strokeWidth:1.5}}/>)}
                </div>
                <p style={{fontWeight:500,marginBottom:16}}>"{q}"</p>
                <div style={{fontSize:'.88rem'}}>
                  <span style={{fontWeight:700}}>{n}</span>
                  <span style={{color:'var(--text-soft)'}}> · {yr}</span>
                </div>
              </Reveal>
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
          <Reveal className="cta-band">
            <div className="cta-band-texture"/>
            <div className="blob" style={{width:220,height:220,top:-70,left:-70,opacity:.35}}/>
            <div className="blob" style={{width:160,height:160,bottom:-50,right:40,opacity:.25}}/>
            <div className="cta-band-inner">
              <div className="cta-band-copy">
                <h2 style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:'clamp(2rem,4.2vw,3rem)',lineHeight:1.05}}>Got stuff to sell?</h2>
                <p style={{marginTop:14,color:'rgba(255,255,255,.75)',maxWidth:'34ch'}}>List your first item in under a minute and reach thousands of students.</p>
                <button className="btn btn-premium-gold" style={{marginTop:28}} onClick={()=>navigate('/create')}>
                  Start selling <Ico n="arrow" c="w-4 h-4"/>
                </button>
              </div>
              <div className="cta-band-photo">
                <img src={heroPhoto} alt="Preview of the CampusKart marketplace — buy, sell and rent on campus" loading="lazy"/>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="site-footer">
        <div className="container footer-inner">
          <div className="logo"><div className="mark">C</div> CampusKart</div>
          <p className="flex items-center gap-1.5" style={{fontSize:'.85rem',color:'var(--text-soft)'}}>© 2026 CampusKart · Built for students <GraduationCap className="w-4 h-4" strokeWidth={2.25}/></p>
          <div className="flex gap-4">
            <button className="btn btn-ghost btn-sm" onClick={()=>navigate('/marketplace')}>Browse</button>
            <button className="btn btn-ghost btn-sm" onClick={()=>navigate('/login')}>Sign in</button>
          </div>
        </div>
      </footer>
    </div>
  );
}


export default Landing;
