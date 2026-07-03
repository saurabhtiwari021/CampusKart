import { useState } from 'react';
import { BookOpen, Bike, Laptop } from 'lucide-react';
import { useApp } from './AppContext';
import { Ico } from './icons';
import { api } from './api';
import handoffPhoto from './assets/campus-handoff.jpg';
import sellStallPhoto from './assets/campus-sell-stall.jpg';

function AuthPage({ mode }) {
  const { login, navigate, toast } = useApp();
  const [tab, setTab] = useState(mode || 'login');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name:'', email:'', password:'' });
  const set = (k) => (e) => setForm(p=>({...p,[k]:e.target.value}));

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
        <div style={{position:'absolute',bottom:-80,right:-80,width:300,height:300,borderRadius:'50%',background:'rgba(255,255,255,.12)'}}/>
        <div style={{position:'absolute',top:80,right:60,width:120,height:120,borderRadius:'50%',background:'rgba(255,205,60,.25)'}}/>
        <button className="logo" style={{color:'#fff',background:'none',border:'none',cursor:'pointer',position:'relative',zIndex:1}} onClick={()=>navigate('/')}>
          <div style={{background:'rgba(255,255,255,.2)',border:'2px solid rgba(255,255,255,.5)',borderRadius:10,width:38,height:38,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,transform:'rotate(-4deg)'}}>C</div>
          CampusKart
        </button>
        <div style={{position:'relative',zIndex:1}}>
          <h2 style={{fontFamily:'var(--font-display)',fontSize:'2.4rem',fontWeight:800,lineHeight:1.05,marginBottom:16}}>Your campus<br/>marketplace.</h2>
          <p style={{color:'rgba(255,255,255,.75)',maxWidth:'32ch'}}>Buy, sell, rent and exchange with students on your campus. Textbooks, cycles, gadgets and more.</p>
          <div className="flex flex-col gap-3 mt-8">
            {[[BookOpen,'Textbooks from ₹50'],[Bike,'Rent cycles by the month'],[Laptop,'Verified campus sellers']].map(([Icon,t])=>(
              <div key={t} className="flex items-center gap-3 text-white/90 font-semibold text-[.95rem]">
                <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={2}/> {t}
              </div>
            ))}
          </div>
          <div className="auth-side-photo">
            <img src={sellStallPhoto} alt="Students trading items at a campus sell stall"/>
            <span className="auth-side-photo-tag">Live campus trades</span>
          </div>
        </div>
        <p style={{color:'rgba(255,255,255,.5)',fontSize:'.8rem',position:'relative',zIndex:1}}>10,000+ students trading daily</p>
      </div>

      {/* Form side */}
      <div className="auth-form-side">
        <div className="auth-form-glow"/>
        <div className="auth-box">
          <button className="logo" style={{background:'none',border:'none',cursor:'pointer',marginBottom:24}} onClick={()=>navigate('/')}>
            <div className="mark">C</div>
          </button>
          <h1 style={{fontFamily:'var(--font-display)',fontSize:'2rem',fontWeight:800,marginBottom:4}}>
            {tab==='login'?'Welcome back':'Create account'}
          </h1>
          <p style={{color:'var(--text-soft)',marginBottom:24,fontSize:'.95rem'}}>
            {tab==='login'?'Log in to continue trading.':'Join your campus marketplace.'}
          </p>

          <div className="auth-tabs">
            <button className={tab==='login'?'active':''} onClick={()=>setTab('login')}>Log in</button>
            <button className={tab==='register'?'active':''} onClick={()=>setTab('register')}>Sign up</button>
          </div>

          <form onSubmit={submit}>
            {tab==='register' && (
              <div className="field">
                <label>Full Name</label>
                <input className={`input ${''}`} value={form.name} onChange={set('name')} placeholder="Priya Sharma" required/>
              </div>
            )}
            <div className="field">
              <label>Email</label>
              <input className="input" type="email" value={form.email} onChange={set('email')} placeholder="yourname@kiit.ac.in" required/>
              <p style={{fontSize:'.78rem',color:'var(--text-soft)',marginTop:4}}>Use your KIIT college email (@kiit.ac.in)</p>
            </div>
            <div className="field">
              <label>Password</label>
              <input className="input" type="password" value={form.password} onChange={set('password')} placeholder="Min 6 characters" required/>
            </div>
            {tab==='login' && (
              <div style={{marginBottom:16}}>
                <button type="button" className="btn btn-ghost btn-sm" style={{padding:0,boxShadow:'none',color:'var(--violet-deep)',fontWeight:700}}>Forgot password?</button>
              </div>
            )}
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? <Ico n="loader" c="w-5 h-5 spin"/> : tab==='login'?'Log in':'Create account'}
            </button>
          </form>

          <div className="auth-divider"><span>OR</span></div>

          <button className="btn btn-block" style={{gap:10}} onClick={()=>{toast.info('Google login coming soon!'); }}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>

          <p style={{textAlign:'center',fontSize:'.9rem',marginTop:20}}>
            {tab==='login'?'No account?':'Have an account?'}{' '}
            <button className="btn btn-ghost btn-sm" style={{padding:0,boxShadow:'none',color:'var(--violet-deep)',fontWeight:700}} onClick={()=>setTab(tab==='login'?'register':'login')}>
              {tab==='login'?'Sign up':'Log in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}


export default AuthPage;
