import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import Root from './App.jsx';
import './tailwind.css';
import './style.css';

// Note: no <StrictMode> wrapper here on purpose. StrictMode double-invokes
// effects in dev, which would double the /auth/me check, the initial
// listings fetch, and — worse — open two Socket.io connections per login.
// The CDN version never had this behavior, and this phase is "same app,
// different build tool," so StrictMode is left out to match it exactly.
createRoot(document.getElementById('root')).render(
  <HashRouter>
    <Root />
  </HashRouter>
);
