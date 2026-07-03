import { useState, useRef } from 'react';
import { Lock, Tag, CalendarDays, Gift, Repeat, Rocket } from 'lucide-react';
import { useApp } from './AppContext';
import Navbar from './NavBar';
import { Ico } from './icons';
import { CATS, CONDITIONS } from './constants';

function CreateListing() {
  const { user, addListing, navigate, toast } = useApp();
  const [images, setImages] = useState([]); // [{ file, preview }] — preview is a base64 data URL for the thumbnail grid
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title:'', description:'', price:'', type:'sell', category:'', condition:'New', location:'', tags:'', rental_duration:'', deposit:'' });
  const fileRef = useRef(null);
  const set = (k) => (e) => setForm(p=>({...p,[k]:e.target.value}));

  if (!user) {
    return (<div style={{minHeight:'100vh'}}><Navbar/><div className="flex items-center justify-center flex-col gap-4" style={{minHeight:'70vh'}}>
      <Lock className="w-16 h-16" strokeWidth={1.5} style={{color:'var(--text-soft)'}}/>
      <h2 style={{fontFamily:'var(--font-display)',fontWeight:800}}>Sign in to list items</h2>
      <button className="btn btn-primary" onClick={()=>navigate('/login')}>Sign in</button>
    </div></div>);
  }

  const handleFiles = (files) => {
    Array.from(files).slice(0, 6-images.length).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImages(p => [...p, { file, preview: ev.target.result }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const onDrop = (e) => {
    e.preventDefault(); setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeImage = (i) => setImages(p => p.filter((_,idx)=>idx!==i));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Add a title'); return; }
    if (!form.category) { toast.error('Select a category'); return; }
    if (images.length === 0) { toast.error('Add at least one photo'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.set('title', form.title);
      fd.set('description', form.description);
      fd.set('price', form.price === '' ? '0' : form.price);
      fd.set('category', form.category);
      fd.set('condition', form.condition);
      fd.set('type', form.type);
      fd.set('location', form.location);
      fd.set('tags', form.tags);
      fd.set('rental_duration', form.rental_duration);
      fd.set('deposit', form.deposit === '' ? '0' : form.deposit);
      images.forEach(({ file }) => fd.append('images', file));

      const listing = await addListing(fd);
      toast.success(`"${form.title}" listed successfully!`);
      navigate(`/listing/${listing.id}`);
    } catch (err) {
      toast.error(err.message || 'Could not create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{minHeight:'100vh'}}>
      <Navbar/>
      <div className="container section" style={{paddingTop:32,maxWidth:780}}>
        <button className="btn btn-ghost btn-sm" style={{marginBottom:20}} onClick={()=>window.history.back()}>
          <Ico n="chevleft" c="w-4 h-4"/> Back
        </button>
        <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:32}}>
          <div style={{width:48,height:48,borderRadius:14,background:'var(--violet)',display:'flex',alignItems:'center',justifyContent:'center',border:'2.5px solid var(--ink)',boxShadow:'var(--sh-1) var(--shadow-col)'}}>
            <Ico n="plus" c="w-6 h-6" style={{stroke:'#fff'}}/>
          </div>
          <div>
            <h1 style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:'1.8rem'}}>Create Listing</h1>
            <p style={{color:'var(--text-soft)'}}>List your item in under 2 minutes</p>
          </div>
        </div>

        <form onSubmit={submit}>
          {/* Listing Type */}
          <div className="field">
            <label>Listing Type</label>
            <div className="radio-cards">
              {[['sell',Tag,'Sell'],['rent',CalendarDays,'Rent'],['donate',Gift,'Donate'],['exchange',Repeat,'Exchange']].map(([v,Icon,l])=>(
                <label key={v} className={`radio-card flex items-center justify-center gap-2 ${form.type===v?'sel':''}`} data-type={v} onClick={()=>setForm(p=>({...p,type:v}))}>
                  <input type="radio" name="type" value={v} checked={form.type===v} readOnly/>
                  <Icon className="w-4 h-4" strokeWidth={2.25}/> {l}
                </label>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className="field">
            <label>Photos (up to 6)</label>
            <div className={`dropzone ${dragging?'drag':''}`}
              onDragOver={e=>{e.preventDefault();setDragging(true);}}
              onDragLeave={()=>setDragging(false)}
              onDrop={onDrop}
              onClick={()=>fileRef.current?.click()}
            >
              <Ico n="upload" c="w-10 h-10" style={{margin:'0 auto 10px',stroke:'var(--ink)'}}/>
              <p style={{fontWeight:700}}>Drag & drop photos here</p>
              <p style={{color:'var(--text-soft)',fontSize:'.85rem',marginTop:4}}>or <span className="browse">browse files</span> · JPG, PNG, WEBP</p>
              <input ref={fileRef} type="file" accept="image/*" multiple style={{display:'none'}} onChange={e=>handleFiles(e.target.files)}/>
            </div>
            {images.length > 0 && (
              <div className="thumb-grid">
                {images.map(({preview},i)=>(
                  <div key={i} className="thumb">
                    <img src={preview} alt={`Preview ${i+1}`}/>
                    <button type="button" onClick={()=>removeImage(i)}>×</button>
                    {i===0 && <div className="cover-tag">COVER</div>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Title */}
          <div className="field">
            <label>Item Name</label>
            <input className="input" value={form.title} onChange={set('title')} placeholder="e.g. Engineering Maths Textbook" required/>
          </div>

          {/* Description */}
          <div className="field">
            <label>Description</label>
            <textarea className="input" value={form.description} onChange={set('description')} placeholder="Describe condition, what's included, pickup details…"/>
          </div>

          {/* Price */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            <div className="field">
              <label>{form.type==='donate'?'Price (₹0 for free)':'Price (₹)'}</label>
              <div className="price-input">
                <span>₹</span>
                <input className="input" type="number" min="0" value={form.price} onChange={set('price')} placeholder="0" style={{paddingLeft:36}}/>
              </div>
            </div>
            {form.type==='rent' && (
              <div className="field">
                <label>Deposit (₹)</label>
                <div className="price-input">
                  <span>₹</span>
                  <input className="input" type="number" min="0" value={form.deposit} onChange={set('deposit')} placeholder="500" style={{paddingLeft:36}}/>
                </div>
              </div>
            )}
          </div>

          {form.type==='rent' && (
            <div className="field">
              <label>Rental Duration</label>
              <select className="input" value={form.rental_duration} onChange={set('rental_duration')}>
                <option value="">Select duration</option>
                <option value="Per day">Per day</option>
                <option value="Per week">Per week</option>
                <option value="Per month">Per month</option>
                <option value="Per semester">Per semester</option>
              </select>
            </div>
          )}

          {/* Category + Condition */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            <div className="field">
              <label>Category</label>
              <select className="input" value={form.category} onChange={set('category')} required>
                <option value="">Select category</option>
                {CATS.map(c=><option key={c.name} value={c.name}>{c.emoji} {c.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Condition</label>
              <select className="input" value={form.condition} onChange={set('condition')}>
                {CONDITIONS.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Location + Tags */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            <div className="field">
              <label>Pickup Location</label>
              <input className="input" value={form.location} onChange={set('location')} placeholder="e.g. Hostel B, Gate 3"/>
            </div>
            <div className="field">
              <label>Tags (comma-separated)</label>
              <input className="input" value={form.tags} onChange={set('tags')} placeholder="e.g. laptop, gaming, hp"/>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{marginTop:8,fontSize:'1.05rem',padding:'16px'}}>
            {loading ? <><Ico n="loader" c="w-5 h-5 spin"/> Publishing…</> : <><Rocket className="w-5 h-5" strokeWidth={2.25}/> Publish Listing</>}
          </button>
        </form>
      </div>
    </div>
  );
}


export default CreateListing;
