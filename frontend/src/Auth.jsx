import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, Bike, Laptop, Eye, EyeOff } from 'lucide-react';
import { useApp } from './AppContext';
import { Ico } from './icons';
import { api } from './api';
import handoffPhoto from './assets/campus-handoff.jpg';
import { EASE } from './Motion';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// Google Identity Services is loaded once, on demand, the first time the auth page opens.
let gsiPromise = null;
function loadGsi() {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!gsiPromise) {
    gsiPromise = new Promise((resolve, reject) => {
      const el = document.createElement('script');
      el.src = 'https://accounts.google.com/gsi/client';
      el.async = true;
      el.defer = true;
      el.onload = resolve;
      el.onerror = () => { gsiPromise = null; reject(new Error('Could not load Google sign-in.')); };
      document.head.appendChild(el);
    });
  }
  return gsiPromise;
}

const GoogleMark = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
);

/**
 * The official Google button (rendered by Google's script into `holder`), so it
 * always meets Google's branding rules. If the client ID isn't configured or the
 * script can't load, we fall back to a plain button that explains why.
 */
function GoogleButton({ mode, busy, onCredential, onUnavailable }) {
  const holder = useRef(null);
  const callbackRef = useRef(onCredential);
  useEffect(() => { callbackRef.current = onCredential; });
  const [state, setState] = useState(GOOGLE_CLIENT_ID ? 'loading' : 'unconfigured');

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    let cancelled = false;
    loadGsi()
      .then(() => {
        if (cancelled || !holder.current) return;
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (res) => callbackRef.current(res.credential),
          cancel_on_tap_outside: true,
        });
        holder.current.innerHTML = '';
        window.google.accounts.id.renderButton(holder.current, {
          type: 'standard', theme: 'outline', size: 'large', shape: 'pill', logo_alignment: 'left',
          text: mode === 'register' ? 'signup_with' : 'continue_with',
          width: Math.min(400, holder.current.offsetWidth || 400),
        });
        setState('ready');
      })
      .catch(() => { if (!cancelled) setState('error'); });
    return () => { cancelled = true; };
  }, [mode]);

  if (state === 'unconfigured' || state === 'error') {
    return (
      <button type="button" className="btn btn-block" style={{ gap: 10 }} onClick={() => onUnavailable(state)}>
        <GoogleMark /> Continue with Google
      </button>
    );
  }
  return (
    <div className={`google-slot ${state} ${busy ? 'busy' : ''}`}>
      <div ref={holder} className="google-holder" />
    </div>
  );
}

function AuthPage({ mode }) {
  const { login, navigate, toast } = useApp();
  const [tab, setTab] = useState(mode || 'login');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name:'', email:'', password:'' });
  const [showPw, setShowPw] = useState(false);
  const set = (k) => (e) => setForm(p=>({...p,[k]:e.target.value}));

  const onGoogleCredential = async (credential) => {
    if (!credential) { toast.error('Google did not return a sign-in token. Please try again.'); return; }
    setLoading(true);
    try {
      const { data } = await api.googleLogin(credential);
      login(data.user, data.token);
      toast.success(`Welcome, ${data.user.name?.split(' ')[0] || 'there'}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };
  const onGoogleUnavailable = (why) => toast.error(
    why === 'error' ? 'Could not reach Google. Check your connection and try again.' : 'Google sign-in is not set up yet. Add VITE_GOOGLE_CLIENT_ID to the frontend .env.'
  );

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (tab === 'login') {
        if (!form.email || !form.password) { toast.error('Fill in all fields'); return; }
        const { data } = await api.login(form.email.trim(), form.password);
        login(data.user, data.token);
        toast.success('Welcome back!'); navigate('/dashboard');
      } else {
        if (!form.name || !form.email || !form.password) { toast.error('Fill in all fields'); return; }
        if (form.password.length < 6) { toast.error('Password must be 6+ characters'); return; }
        const { data } = await api.signup(form.name.trim(), form.email.trim(), form.password);
        login(data.user, data.token);
        toast.success('Account created! Welcome aboard'); navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      {/* Brand side */}
      <div className="auth-side">
        <div className="auth-side-bg" style={{backgroundImage:`url(${handoffPhoto})`}}/>
        <div className="auth-side-scrim"/>
        <button className="logo" style={{color:'var(--ink)',background:'none',border:'none',cursor:'pointer',position:'relative',zIndex:1}} onClick={()=>navigate('/')}>
          <div className="mark" style={{background:'var(--paper)'}}>C</div>
          CampusKart
        </button>
        <div style={{position:'relative',zIndex:1}}>
          <h2 style={{fontFamily:'var(--font-display)',fontSize:'clamp(2.6rem,4.4vw,4rem)',fontWeight:300,lineHeight:1,letterSpacing:'-.03em',marginBottom:20}}>Your campus,<br/>one marketplace.</h2>
          <p style={{color:'rgba(35,26,22,.75)',maxWidth:'34ch',marginBottom:32}}>Buy, sell, rent and exchange with students on your campus. Textbooks, cycles, gadgets and more.</p>
          <div className="flex flex-col gap-3">
            {[[BookOpen,'Textbooks from ₹50'],[Bike,'Rent cycles by the month'],[Laptop,'Verified campus sellers']].map(([Icon,t],i)=>(
              <motion.div key={t} className="flex items-center gap-3 font-medium text-[.95rem]" style={{color:'var(--ink)'}}
                initial={{opacity:0,x:-16}} animate={{opacity:1,x:0}} transition={{duration:.7,ease:EASE,delay:.35+i*.12}}>
                <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={1.5}/> {t}
              </motion.div>
            ))}
          </div>
        </div>
        <p style={{color:'rgba(35,26,22,.6)',fontSize:'.82rem',position:'relative',zIndex:1}}>10,000+ students trading daily</p>
      </div>

      {/* Form side */}
      <div className="auth-form-side">
        <div className="auth-form-glow"/>
        <div className="auth-box">
          <button className="logo" style={{background:'none',border:'none',cursor:'pointer',marginBottom:24}} onClick={()=>navigate('/')}>
            <div className="mark">C</div>
          </button>
          <h1 style={{fontFamily:'var(--font-display)',fontSize:'2.8rem',fontWeight:300,letterSpacing:'-.03em',lineHeight:1.05,marginBottom:8}}>
            {tab==='login'?'Welcome back':'Create account'}
          </h1>
          <p style={{color:'var(--text-soft)',marginBottom:24,fontSize:'.95rem'}}>
            {tab==='login'?'Log in to continue trading.':'Join your campus marketplace.'}
          </p>

          <div className="auth-tabs">
            {[['login','Log in'],['register','Sign up']].map(([id,label])=>(
              <button key={id} type="button" className={tab===id?'active':''} onClick={()=>setTab(id)}>
                {tab===id && <motion.span layoutId="auth-tab-pill" className="auth-tab-pill" transition={{type:'spring',stiffness:420,damping:34}}/>}
                <span style={{position:'relative'}}>{label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={submit}>
            <AnimatePresence initial={false}>
              {tab==='register' && (
                <motion.div key="name" className="auth-collapse"
                  initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}}
                  transition={{duration:.32,ease:EASE}}>
                  <div className="field">
                    <label htmlFor="auth-name">Full Name</label>
                    <input id="auth-name" className="input" value={form.name} onChange={set('name')} placeholder="Priya Sharma" required/>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="field">
              <label htmlFor="auth-email">Email</label>
              <input id="auth-email" className="input" type="email" value={form.email} onChange={set('email')} placeholder="yourname@kiit.ac.in" required/>
              <p style={{fontSize:'.78rem',color:'var(--text-soft)',marginTop:4}}>Use your KIIT college email (@kiit.ac.in). Google sign-in works with it too.</p>
            </div>
            <div className="field">
              <label htmlFor="auth-password">Password</label>
              <div className="pw-wrap">
                <input id="auth-password" className="input" type={showPw?'text':'password'} value={form.password} onChange={set('password')} placeholder="Min 6 characters" required style={{paddingRight:48}}/>
                <button type="button" className="pw-toggle" onClick={()=>setShowPw(p=>!p)} aria-label={showPw?'Hide password':'Show password'}>
                  {showPw ? <EyeOff className="w-4 h-4" strokeWidth={2}/> : <Eye className="w-4 h-4" strokeWidth={2}/>}
                </button>
              </div>
            </div>
            {tab==='login' && (
              <div style={{marginBottom:16}}>
                <button type="button" className="btn btn-ghost btn-sm" style={{padding:0,boxShadow:'none',color:'var(--violet-deep)',fontWeight:600,textDecoration:'underline',textUnderlineOffset:3}}>Forgot password?</button>
              </div>
            )}
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? <Ico n="loader" c="w-5 h-5 spin"/> : tab==='login'?'Log in':'Create account'}
            </button>
          </form>

          <div className="auth-divider"><span>OR</span></div>

          <GoogleButton mode={tab} busy={loading} onCredential={onGoogleCredential} onUnavailable={onGoogleUnavailable}/>

          <p style={{textAlign:'center',fontSize:'.9rem',marginTop:20}}>
            {tab==='login'?'No account?':'Have an account?'}{' '}
            <button className="btn btn-ghost btn-sm" style={{padding:0,boxShadow:'none',color:'var(--ink)',fontWeight:600,textDecoration:'underline',textUnderlineOffset:3}} onClick={()=>setTab(tab==='login'?'register':'login')}>
              {tab==='login'?'Sign up':'Log in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}


export default AuthPage;
