/* ── App Router ───────────────────────────────────────────────────────── */
import { Routes, Route, useParams } from 'react-router-dom';
import { AppProvider } from './AppContext';
import Landing from './Landing';
import AuthPage from './Auth';
import Marketplace from './Marketplace';
import CreateListing from './CreateListing';
import ListingDetail from './Listing';
import Dashboard from './Dashboard';
import Profile from './Profile';
import Admin from './Admin';

// Thin param-reading wrappers so the page components themselves keep the
// exact same prop-based signatures they had under the old manual router
// (ListingDetail({ id }), Dashboard({ section }), Profile({ uid })) —
// nothing inside those files needed to change for the routing swap.
function ListingRoute() {
  const { id } = useParams();
  return <ListingDetail id={id} />;
}
function DashboardRoute() {
  const { section } = useParams();
  return <Dashboard section={section || 'home'} />;
}
function ProfileRoute() {
  const { uid } = useParams();
  return <Profile uid={uid} />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing/>} />
      <Route path="/login" element={<AuthPage mode="login"/>} />
      <Route path="/register" element={<AuthPage mode="register"/>} />
      <Route path="/marketplace" element={<Marketplace/>} />
      <Route path="/create" element={<CreateListing/>} />
      <Route path="/listing/:id" element={<ListingRoute/>} />
      <Route path="/dashboard" element={<DashboardRoute/>} />
      <Route path="/dashboard/:section" element={<DashboardRoute/>} />
      <Route path="/u/:uid" element={<ProfileRoute/>} />
      <Route path="/admin" element={<Admin/>} />
      <Route path="*" element={<Landing/>} />
    </Routes>
  );
}

function Root() {
  return <AppProvider><App/></AppProvider>;
}

export default Root;
