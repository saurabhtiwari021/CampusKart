import { Routes, Route, useParams, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { AppProvider } from './AppContext';
import Landing from './Landing';
import AuthPage from './Auth';
import Marketplace from './Marketplace';
import CreateListing from './CreateListing';
import ListingDetail from './Listing';
import Dashboard from './Dashboard';
import Profile from './Profile';
import Admin from './Admin';

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};
function PageTransition({ children }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      variants={reduceMotion ? {} : pageVariants}
      initial="initial"
      animate="enter"
      exit="exit"
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

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
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Landing/></PageTransition>} />
        <Route path="/login" element={<PageTransition><AuthPage mode="login"/></PageTransition>} />
        <Route path="/register" element={<PageTransition><AuthPage mode="register"/></PageTransition>} />
        <Route path="/marketplace" element={<PageTransition><Marketplace/></PageTransition>} />
        <Route path="/create" element={<PageTransition><CreateListing/></PageTransition>} />
        <Route path="/listing/:id" element={<PageTransition><ListingRoute/></PageTransition>} />
        <Route path="/dashboard" element={<PageTransition><DashboardRoute/></PageTransition>} />
        <Route path="/dashboard/:section" element={<PageTransition><DashboardRoute/></PageTransition>} />
        <Route path="/u/:uid" element={<PageTransition><ProfileRoute/></PageTransition>} />
        <Route path="/admin" element={<PageTransition><Admin/></PageTransition>} />
        <Route path="*" element={<PageTransition><Landing/></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

function Root() {
  return <AppProvider><App/></AppProvider>;
}

export default Root;
