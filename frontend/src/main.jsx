import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import Root from './App.jsx';
import './tailwind.css';
import './style.css';

createRoot(document.getElementById('root')).render(
  <HashRouter>
    <Root />
  </HashRouter>
);
