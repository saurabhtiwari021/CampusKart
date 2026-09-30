import { useState, useEffect } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { BookOpen, Laptop, Armchair, Bike, Shirt, Dumbbell, PenLine, ShieldCheck, Sparkles, Camera, MessageCircle, Handshake, GraduationCap, Star } from 'lucide-react';
import { useApp } from './AppContext';
import Navbar from './NavBar';
import { Ico } from './icons';
import { ListingCard, CardSkeleton } from './ListingCard';
import { CATS } from './constants';
import { Reveal } from './Reveal';
import { SplitWords, fadeUp, EASE } from './Motion';
import HeroIllustration from './HeroIllustration';
import heroPhoto from './assets/campus-market-preview.jpg';

const CAT_ICON = { Books: BookOpen, Electronics: Laptop, Furniture: Armchair, Cycles: Bike, Clothing: Shirt, Sports: Dumbbell, Stationery: PenLine };

/* The arch still-life leans a few degrees toward the pointer and the two
   floating labels drift the opposite way: depth in answer to the visitor's
   own movement, not motion for its own sake. */
function HeroStage() {
  const reduce = useReducedMotion();
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 70, damping: 16, mass: 0.7 });
  const sy = useSpring(py, { stiffness: 70, damping: 16, mass: 0.7 });
  const rotateY = useTransform(sx, [-1, 1], [-5, 5]);
  const rotateX = useTransform(sy, [-1, 1], [4, -4]);
  const chipX = useTransform(sx, [-1, 1], [12, -12]);
  const chipY = useTransform(sy, [-1, 1], [8, -8]);

  const onMove = (e) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set(((e.clientX - r.left) / r.width - 0.5) * 2);
    py.set(((e.clientY - r.top) / r.height - 0.5) * 2);
  };
  const onLeave = () => { px.set(0); py.set(0); };
  const chipIn = (delay) => reduce ? {} : ({ initial: { opacity: 0, scale: 0.85 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.7, ease: EASE, delay } });

  return (
    <div className="hero-visual hidden lg:flex" onMouseMove={onMove} onMouseLeave={onLeave} style={{ perspective: 1200 }}>
      <motion.div className="hero-art-wrap" style={reduce ? undefined : { rotateX, rotateY, transformStyle: 'preserve-3d' }}>
        <HeroIllustration className="hero-art"/>
      </motion.div>
      <motion.span className="hero-float hero-float-a" style={reduce ? undefined : { x: chipX, y: chipY }} {...chipIn(1.3)}><ShieldCheck className="w-4 h-4" strokeWidth={2}/> Verified sellers</motion.span>
      <motion.span className="hero-float hero-float-b" style={reduce ? undefined : { x: chipX, y: chipY }} {...chipIn(1.5)}><Sparkles className="w-4 h-4" strokeWidth={2}/> 10k+ students</motion.span>
    </div>
  );
}

function Landing() {
  const { listings, navigate } = useApp();
  const reduce = useReducedMotion();
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => { const t = setTimeout(()=>setLoading(false),800); return ()=>clearTimeout(t); }, []);

  const featured = listings.slice(0,8);
  const FAQS = [
    ['Is CampusKart free?','Yes! Browsing, listing and chatting are completely free for all students.'],
    ['How do payments work?','Payments are arranged between buyer and seller — usually cash or UPI on campus pickup.'],
    ['Can I rent instead of buy?','Absolutely! Many listings are for rent — cycles, mini fridges and more.'],
    ['Is it safe?','Trade with verified campus students, check ratings, and meet in public campus spots.'],
  ];
  const MARQUEE = ['Books','Electronics','Cycles','Clothing','Sports','Furniture','Stationery','Music','Gaming','Lab equipment'];
  const search = (e) => { e.preventDefault(); navigate(`/marketplace?q=${encodeURIComponent(q)}`); };

  return (
    <div>
      <Navbar/>

      {/* Hero */}
      <section className="hero hero-v2">
        <div className="container hero-grid">
          <div>
            <h1 className="hero-headline" aria-label="Everything a campus needs, passed hand to hand.">
              <SplitWords text="Everything a campus needs, passed hand to hand." delay={0.1}/>
            </h1>
            <motion.p className="hero-sub" {...fadeUp(0.75, reduce)}>Textbooks, cycles, lamps and dorm essentials from students you can actually meet. Or clear out your room and keep the cash.</motion.p>

            <motion.form className="hero-search" onSubmit={search} {...fadeUp(0.9, reduce)}>
              <Ico n="search" c="w-5 h-5" style={{stroke:'var(--ink-soft)',flexShrink:0}}/>
              <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search textbooks, cycles, gadgets" aria-label="Search listings"/>
              <button type="submit" className="btn btn-primary">Search</button>
            </motion.form>

            <motion.div className="hero-actions" {...fadeUp(1.02, reduce)}>
              <button className="btn btn-primary" onClick={()=>navigate('/marketplace?type=sell')}>Shop the marketplace</button>
              <button className="btn" onClick={()=>navigate('/create')}>Sell an item</button>
              <button className="link-u" onClick={()=>navigate('/marketplace?type=rent')}>Rent for a semester</button>
            </motion.div>

            <motion.p className="hero-trust" {...fadeUp(1.14, reduce)}><ShieldCheck className="w-4 h-4" strokeWidth={1.75}/> Sign-up needs a college email, so every seller is a student.</motion.p>
          </div>

          <HeroStage/>
        </div>
      </section>

      {/* Ticker */}
      <div className="marquee-strip" aria-hidden="true">
        <div className="marquee-track">
          {[...MARQUEE,...MARQUEE,...MARQUEE,...MARQUEE].map((m,i)=>(
            <span key={i}>{m}<i className="marquee-dot"/></span>
          ))}
        </div>
      </div>

      {/* Categories */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <h2 className="section-title">Browse by category</h2>
              <p className="section-sub">Start with what you need this week.</p>
            </div>
          </div>
          <div className="cat-grid">
            {CATS.map((c,i)=>{
              const Icon = CAT_ICON[c.name] || BookOpen;
              return (
                <Reveal key={c.name} delay={i*50} className="cat-tile" onClick={()=>navigate(`/marketplace?category=${c.name}`)}>
                  <div className="ico"><Icon className="w-5 h-5" strokeWidth={1.5}/></div>
                  <span className="nm">{c.name}</span>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trending */}
      <section className="section" style={{paddingTop:0}}>
        <div className="container">
          <div className="section-head">
            <div>
              <h2 className="section-title">Fresh on campus</h2>
              <p className="section-sub">The most looked-at listings this week.</p>
            </div>
            <button className="link-u" onClick={()=>navigate('/marketplace')}>View all listings</button>
          </div>
          <div className="grid-listings">
            {loading ? Array.from({length:8}).map((_,i)=><CardSkeleton key={i}/>) : featured.map((l,i)=><Reveal key={l.id} delay={Math.min(i*40,240)}><ListingCard listing={l} index={i}/></Reveal>)}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="steps-band section">
        <div className="container">
          <h2 className="section-title" style={{marginBottom:56}}>Three steps from<br/>your shelf to their hands</h2>
          <div className="steps-grid">
            {[['List in seconds','Snap a photo, set a price, hit publish. Your item is live instantly.',Camera],
              ['Chat and agree','Message buyers directly, negotiate and arrange a campus meetup.',MessageCircle],
              ['Meet and trade','Hand over the item, get paid. Leave a review and build your reputation.',Handshake]
            ].map(([t,d],i)=>(
              <Reveal key={i} delay={i*100} className="step">
                <div className="step-num">{i+1}</div>
                <h3>{t}</h3>
                <p>{d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Why CampusKart */}
      <section className="section">
        <div className="container">
          <h2 className="section-title" style={{marginBottom:64}}>Made for trading<br/>on campus</h2>
          <div className="quotes">
            {[
              [GraduationCap,'Campus-only accounts','Sign-up is limited to college email addresses, so you are always dealing with another student.'],
              [MessageCircle,'Chat that keeps up','Message sellers in real time, share photos, and see when your message has been read.'],
              [Star,'Reviews from real trades','Only the buyer of a completed sale or rental can leave a review, so ratings reflect real deals.'],
            ].map(([Icon,t,d],i)=>(
              <Reveal key={i} delay={i*100} className="pillar">
                <div className="ico"><Icon className="w-5 h-5" strokeWidth={1.5}/></div>
                <h3>{t}</h3>
                <p>{d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" style={{paddingTop:0}}>
        <div className="container faq-wrap">
          <div>
            <h2 className="section-title">Questions,<br/>answered</h2>
          </div>
          <div>
            {FAQS.map(([q,a],i)=>(
              <div key={i} className={`faq-item ${openFaq===i?'open':''}`}>
                <div className="faq-q" role="button" tabIndex={0} aria-expanded={openFaq===i} onClick={()=>setOpenFaq(openFaq===i?null:i)} onKeyDown={(e)=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); setOpenFaq(openFaq===i?null:i); } }}>
                  <span>{q}</span>
                  <Ico n="plus" c="w-5 h-5" style={{flexShrink:0,transform:openFaq===i?'rotate(45deg)':'none',transition:'transform .35s cubic-bezier(.22,1,.36,1)'}}/>
                </div>
                {openFaq===i && <div className="faq-a-in">{a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section" style={{paddingTop:0}}>
        <div className="container">
          <Reveal className="cta-band">
            <div className="cta-band-inner">
              <div className="cta-band-copy">
                <h2>Got stuff to sell?</h2>
                <p>List your first item in under a minute and reach thousands of students.</p>
                <button className="btn btn-premium-gold" style={{marginTop:32}} onClick={()=>navigate('/create')}>Start selling</button>
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
          <div>
            <div className="logo"><div className="mark">C</div> CampusKart</div>
            <p style={{marginTop:16,color:'rgba(250,246,241,.6)',maxWidth:'30ch'}}>The campus marketplace, made by students for students.</p>
          </div>
          <div className="footer-links">
            <button onClick={()=>navigate('/marketplace')}>Browse</button>
            <button onClick={()=>navigate('/create')}>Sell an item</button>
            <button onClick={()=>navigate('/marketplace?type=rent')}>Rent</button>
          </div>
          <div className="footer-links">
            <button onClick={()=>navigate('/login')}>Sign in</button>
            <button onClick={()=>navigate('/register')}>Create account</button>
          </div>
          <div className="footer-note"><span>© 2026 CampusKart</span><span>Built for students</span></div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
