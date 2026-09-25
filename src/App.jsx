import { AnimatePresence, motion } from 'framer-motion';
import { useBirthday } from './context/BirthdayContext';
import Background from './components/shared/Background';
import LockScreen from './pages/LockScreen';
import HappyBirthday from './pages/HappyBirthday';
import CakePage from './pages/CakePage';
import GiftPage from './pages/GiftPage';
import EditorPage from './pages/EditorPage';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

function AppContent() {
  const { giftData, isUnlocked, isEditorMode, currentPage } = useBirthday();

  // If no data and not in editor mode, show editor by default
  if (!giftData && !isEditorMode) {
    return (
      <>
        <Background />
        <div className="page" style={{ textAlign: 'center', gap: '1.5rem' }}>
          <h1 className="heading-xl gradient-text">🎂 Birthday Gift Creator</h1>
          <p className="text-body" style={{ maxWidth: '400px' }}>
            Create a personalized birthday surprise for your loved ones!
          </p>
          <button
            className="btn btn-primary btn-lg pulse-glow"
            onClick={() => {
              window.location.hash = '#/create';
              window.location.reload();
            }}
          >
            ✨ Create Birthday Gift
          </button>
        </div>
      </>
    );
  }

  // Editor mode
  if (isEditorMode || currentPage === 'editor') {
    return (
      <>
        <Background />
        <EditorPage />
      </>
    );
  }

  // Recipient flow
  const renderPage = () => {
    if (!isUnlocked) {
      return (
        <motion.div key="lock" {...pageVariants} transition={{ duration: 0.5 }}>
          <LockScreen />
        </motion.div>
      );
    }

    switch (currentPage) {
      case 'birthday':
        return (
          <motion.div key="birthday" {...pageVariants} transition={{ duration: 0.5 }}>
            <HappyBirthday />
          </motion.div>
        );
      case 'cake':
        return (
          <motion.div key="cake" {...pageVariants} transition={{ duration: 0.5 }}>
            <CakePage />
          </motion.div>
        );
      case 'gift':
        return (
          <motion.div key="gift" {...pageVariants} transition={{ duration: 0.5 }}>
            <GiftPage />
          </motion.div>
        );
      case 'editor':
        return (
          <motion.div key="editor" {...pageVariants} transition={{ duration: 0.5 }}>
            <EditorPage />
          </motion.div>
        );
      default:
        return (
          <motion.div key="lock" {...pageVariants} transition={{ duration: 0.5 }}>
            <LockScreen />
          </motion.div>
        );
    }
  };

  return (
    <>
      <Background />
      <div className="page-bg" />
      <AnimatePresence mode="wait">{renderPage()}</AnimatePresence>
    </>
  );
}

export default function App() {
  return <AppContent />;
}
