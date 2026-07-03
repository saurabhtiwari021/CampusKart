import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Package } from 'lucide-react';
import { useApp } from './AppContext';
import Navbar from './NavBar';
import { Ico } from './icons';
import { ListingCard, CardSkeleton } from './ListingCard';
import { CATS, CONDITIONS, TYPES, TYPE_META } from './constants';
import { inr } from './utils';
import { api } from './api';

function Marketplace() {
  const { navigate, toast } = useApp();
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState(() => searchParams.get('q') || '');
  const [appliedSearch, setAppliedSearch] = useState(() => searchParams.get('q') || '');

  const [category, setCategory] = useState(() => searchParams.get('category') || 'All');
  const [type, setType] = useState(() => searchParams.get('type') || 'all');
  const [condition, setCondition] = useState('');
  const [sort, setSort] = useState('latest');

  const [maxPrice, setMaxPrice] = useState(30000);
  const [appliedMaxPrice, setAppliedMaxPrice] = useState(30000);

  const [view, setView] = useState('grid');

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchResults = () => {
    setLoading(true);
    api.listings
      .list({ q: appliedSearch, category, type, condition, maxPrice: appliedMaxPrice, sort })
      .then(({ data }) => setResults(data.listings))
      .catch((err) => { toast.error(err.message || 'Could not load listings'); setResults([]); })
      .finally(() => setLoading(false));
  };

  useEffect(fetchResults, [appliedSearch, category, type, condition, appliedMaxPrice, sort]);

  const submitSearch = (e) => {
    e.preventDefault();
    setAppliedSearch(search);
  };

  const commitMaxPrice = () => setAppliedMaxPrice(maxPrice);

  const clearFilters = () => {
    setCategory('All'); setType('all'); setCondition('');
    setMaxPrice(30000); setAppliedMaxPrice(30000);
    setSearch(''); setAppliedSearch('');
  };

  return (
    <div style={{minHeight:'100vh'}}>
      <Navbar/>
      <div className="container section" style={{paddingTop:32}}>
        <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:24,flexWrap:'wrap',gap:12}}>
          <div>
            <h1 style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:'clamp(1.8rem,4vw,2.4rem)'}}>
              {appliedSearch ? `Results for "${appliedSearch}"` : 'Marketplace'}
            </h1>
            <p style={{color:'var(--text-soft)',marginTop:4}}>{loading ? 'Searching…' : `${results.length} items available`}</p>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <select className="input" style={{width:'auto',padding:'9px 16px'}} value={sort} onChange={e=>setSort(e.target.value)}>
              <option value="latest">Latest</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>
            <div style={{display:'flex',borderRadius:999,border:'1.5px solid var(--border-strong)',overflow:'hidden',boxShadow:'var(--sh-1) var(--shadow-col)'}}>
              <button onClick={()=>setView('grid')} style={{padding:'9px 12px',background:view==='grid'?'var(--ink)':'var(--white)',color:view==='grid'?'var(--cream)':'var(--ink)',border:'none',cursor:'pointer',transition:'background .18s ease'}}><Ico n="grid" c="w-4 h-4"/></button>
              <button onClick={()=>setView('list')} style={{padding:'9px 12px',background:view==='list'?'var(--ink)':'var(--white)',color:view==='list'?'var(--cream)':'var(--ink)',border:'none',borderLeft:'1.5px solid var(--border-strong)',cursor:'pointer',transition:'background .18s ease'}}><Ico n="list" c="w-4 h-4"/></button>
            </div>
          </div>
        </div>

        <div className="market-layout">
          {/* Filters */}
          <aside className="filters card" style={{padding:20}}>
            <div style={{display:'flex',alignItems:'center',gap:8,fontFamily:'var(--font-display)',fontWeight:700,marginBottom:20}}>
              <Ico n="sliders" c="w-4 h-4"/> Filters
            </div>

            {/* Search */}
            <form className="filter-block" onSubmit={submitSearch}>
              <div className="filter-label">Search</div>
              <input className="input" placeholder="Keywords… (press Enter)" value={search} onChange={e=>setSearch(e.target.value)} style={{padding:'9px 12px',fontSize:'.88rem'}}/>
            </form>

            {/* Type */}
            <div className="filter-block">
              <div className="filter-label">Listing Type</div>
              <div className="chip-row">
                {TYPES.map(([v,l])=>(
                  <button key={v} className={`chip chip-sm ${type===v?'active':''}`} onClick={()=>setType(v)}>{l}</button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div className="filter-block">
              <div className="filter-label">Category</div>
              <div className="chip-row">
                {['All',...CATS.map(c=>c.name)].map(c=>(
                  <button key={c} className={`chip chip-sm ${category===c?'active':''}`} onClick={()=>setCategory(c)}>{c}</button>
                ))}
              </div>
            </div>

            {/* Condition */}
            <div className="filter-block">
              <div className="filter-label">Condition</div>
              <div className="chip-row">
                {CONDITIONS.map(c=>(
                  <button key={c} className={`chip chip-sm ${condition===c?'active':''}`} onClick={()=>setCondition(condition===c?'':c)}>{c}</button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="filter-block">
              <div className="filter-label">Max Price: {inr(maxPrice)}</div>
              <input type="range" min={0} max={30000} step={500} value={maxPrice}
                onChange={e=>setMaxPrice(+e.target.value)}
                onMouseUp={commitMaxPrice} onTouchEnd={commitMaxPrice}
                onKeyUp={commitMaxPrice}
                style={{width:'100%',accentColor:'var(--violet)'}}/>
            </div>

            <button className="btn btn-block btn-sm" onClick={clearFilters}>Clear Filters</button>
          </aside>

          {/* Grid */}
          <div>
            {loading && results.length===0 ? (
              <div className="grid-listings">{Array.from({length:9}).map((_,i)=><CardSkeleton key={i}/>)}</div>
            ) : results.length===0 ? (
              <div className="empty-state">
                <div className="icon-wrap"><Package className="w-11 h-11" strokeWidth={1.75}/></div>
                <h3>Nothing here yet</h3>
                <p style={{color:'var(--text-soft)',marginBottom:24}}>Try adjusting your filters or search query.</p>
                <button className="btn btn-primary" onClick={clearFilters}>Clear filters</button>
              </div>
            ) : (
              <div className={view==='grid' ? 'grid-listings' : ''} style={view==='list'?{display:'flex',flexDirection:'column',gap:16}:{}}>
                {results.map((l,i)=>(
                  view==='list' ? (
                    <div key={l.id} className="table-row" style={{cursor:'pointer'}} onClick={()=>navigate(`/listing/${l.id}`)}>
                      <img src={l.images?.[0]||'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=300&q=80'} alt={l.title} className="w-20 h-20 aspect-square object-cover rounded-xl flex-shrink-0" style={{border:'1.5px solid var(--border-strong)'}}/>
                      <div className="grow">
                        <div className="ttl">{l.title}</div>
                        <div style={{fontSize:'.82rem',color:'var(--text-soft)',marginTop:4}}>{l.category} · {l.condition} · {l.location}</div>
                        <span className={`stamp ${TYPE_META[l.type]?.cls} mt-2`} style={{display:'inline-flex',marginTop:8,fontSize:10}}>{TYPE_META[l.type]?.label}</span>
                      </div>
                      <div style={{fontFamily:'var(--font-display)',fontWeight:800,color:'var(--violet-deep)',fontSize:'1.15rem',flexShrink:0}}>{inr(l.price)}</div>
                    </div>
                  ) : (
                    <ListingCard key={l.id} listing={l} index={i}/>
                  )
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Marketplace;
