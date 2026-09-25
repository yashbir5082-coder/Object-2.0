import { createContext, useContext, useState, useEffect } from 'react';
import { extractDataFromHash } from '../utils/encoder';

const BirthdayContext = createContext(null);

/**
 * Default data structure for a birthday gift.
 */
const defaultGiftData = {
  version: '1.0',
  recipient: {
    name: '',
    birthDate: '',
    gender: 'neutral',
  },
  sender: {
    name: '',
  },
  memories: [],
  greeting: {
    templateId: 'heartfelt',
    letterTemplateId: 'classic_parchment',
    customBgUrl: null,
    text: '',
    font: 'Caveat',
  },
  theme: {
    primaryColor: '#ff6b9d',
    bgStyle: 'stars',
  },
};

export function BirthdayProvider({ children }) {
  const [giftData, setGiftData] = useState(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isEditorMode, setIsEditorMode] = useState(false);
  const [currentPage, setCurrentPage] = useState('lock');

  // On mount, check URL hash for encoded data
  useEffect(() => {
    const hash = window.location.hash;

    if (hash.startsWith('#/gift/')) {
      const data = extractDataFromHash(hash);
      if (data) {
        setGiftData(data);
        setIsEditorMode(false);
        setIsUnlocked(false);
        setCurrentPage('lock');
      }
    } else if (hash === '#/create' || hash === '' || hash === '#/' || hash === '#') {
      setIsEditorMode(true);
      setGiftData({ ...defaultGiftData });
    }

    // Listen for hash changes
    const handleHashChange = () => {
      const newHash = window.location.hash;
      if (newHash.startsWith('#/gift/')) {
        const data = extractDataFromHash(newHash);
        if (data) {
          setGiftData(data);
          setIsEditorMode(false);
          setIsUnlocked(false);
          setCurrentPage('lock');
        }
      } else if (newHash === '#/create') {
        setIsEditorMode(true);
        setGiftData({ ...defaultGiftData });
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const unlock = () => {
    setIsUnlocked(true);
    setCurrentPage('birthday');
  };

  const navigateTo = (page) => {
    setCurrentPage(page);
  };

  const updateGiftData = (updater) => {
    setGiftData((prev) => {
      if (typeof updater === 'function') return updater(prev);
      return { ...prev, ...updater };
    });
  };

  const startEditorMode = () => {
    setIsEditorMode(true);
    setGiftData({ ...defaultGiftData });
    setCurrentPage('editor');
  };

  return (
    <BirthdayContext.Provider
      value={{
        giftData,
        setGiftData,
        updateGiftData,
        isUnlocked,
        unlock,
        isEditorMode,
        setIsEditorMode,
        startEditorMode,
        currentPage,
        navigateTo,
      }}
    >
      {children}
    </BirthdayContext.Provider>
  );
}

export function useBirthday() {
  const ctx = useContext(BirthdayContext);
  if (!ctx) throw new Error('useBirthday must be used within BirthdayProvider');
  return ctx;
}

export { defaultGiftData };
