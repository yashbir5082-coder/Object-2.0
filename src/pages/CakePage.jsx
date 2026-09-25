import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useBirthday } from '../context/BirthdayContext';
import { calculateAge } from '../utils/dateUtils';
import './CakePage.css';

export default function CakePage() {
  const { giftData, navigateTo } = useBirthday();
  const [candlesLit, setCandlesLit] = useState(true);
  const [cakeCut, setCakeCut] = useState(false);
  const [showGiftBtn, setShowGiftBtn] = useState(false);
  const [blowing, setBlowing] = useState(false);
  const [cutting, setCutting] = useState(false);

  const age = giftData?.recipient?.birthDate
    ? calculateAge(giftData.recipient.birthDate)
    : 5;

  // Limit candles for visual purposes
  const candleCount = Math.min(age, 12);

  const handleBlow = () => {
    if (!candlesLit) return;
    setBlowing(true);
    setTimeout(() => {
      setCandlesLit(false);
      setBlowing(false);
      // Smoke particles via confetti
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { x: 0.5, y: 0.35 },
        colors: ['#aaaaaa', '#cccccc', '#888888'],
        gravity: -0.3,
        ticks: 80,
        shapes: ['circle'],
        scalar: 0.8,
      });
      checkShowGift(false, cakeCut);
    }, 800);
  };

  const handleCut = () => {
    if (cakeCut) return;
    setCutting(true);
    setTimeout(() => {
      setCakeCut(true);
      setCutting(false);
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { x: 0.5, y: 0.55 },
        colors: ['#ff6b9d', '#fbbf24', '#c084fc', '#34d399'],
      });
      checkShowGift(candlesLit, true);
    }, 1000);
  };

  const checkShowGift = (isLit, isCut) => {
    if (!isLit || isCut) {
      setTimeout(() => setShowGiftBtn(true), 500);
    }
  };

  useEffect(() => {
    if (!candlesLit || cakeCut) {
      const timer = setTimeout(() => setShowGiftBtn(true), 800);
      return () => clearTimeout(timer);
    }
  }, [candlesLit, cakeCut]);

  return (
    <div className="page cake-page">
      <motion.div
        className="cake-content"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="cake-title heading-lg gradient-text">
          🎂 Make a Wish!
        </h2>
        <p className="text-body cake-subtitle">
          {candlesLit ? 'Blow the candles & cut your cake!' : cakeCut ? 'Time for your gift! 🎁' : 'Now cut the cake! 🔪'}
        </p>

        {/* Cake Container */}
        <div className={`cake-container ${cakeCut ? 'cake-cut' : ''} ${cutting ? 'cutting' : ''}`}>
          {/* Candles */}
          <div className="candles-row">
            {Array.from({ length: candleCount }).map((_, i) => (
              <div key={i} className="candle-wrapper" style={{ '--i': i, '--total': candleCount }}>
                <div className={`candle candle-color-${(i % 4) + 1}`}>
                  <AnimatePresence>
                    {candlesLit && (
                      <motion.div
                        className="flame-wrapper"
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.4, delay: i * 0.05 }}
                      >
                        <div className="flame">
                          <div className="flame-inner"></div>
                        </div>
                        <div className="flame-glow"></div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {!candlesLit && (
                    <div className="smoke-trail">
                      <div className="smoke-particle"></div>
                      <div className="smoke-particle s2"></div>
                      <div className="smoke-particle s3"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Cake Body */}
          <div className="cake-3d">
            {/* Top layer */}
            <div className="cake-layer cake-top">
              <div className="cake-frosting cake-frosting-top"></div>
              <div className="cake-drip-container">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="cake-drip" style={{ '--drip-i': i }} />
                ))}
              </div>
            </div>
            {/* Middle layer */}
            <div className="cake-layer cake-middle">
              <div className="cake-frosting cake-frosting-mid"></div>
              <div className="cake-decoration">
                {['🍓', '🫐', '🍒', '🍓', '🫐', '🍒'].map((f, i) => (
                  <span key={i} className="cake-fruit" style={{ '--fruit-i': i }}>{f}</span>
                ))}
              </div>
            </div>
            {/* Bottom layer */}
            <div className="cake-layer cake-bottom">
              <div className="cake-frosting cake-frosting-bot"></div>
            </div>
            {/* Plate */}
            <div className="cake-plate"></div>
          </div>

          {/* Cut knife animation */}
          {cutting && (
            <motion.div
              className="cut-knife"
              initial={{ x: -100, y: -80, rotate: -30 }}
              animate={{ x: 0, y: 0, rotate: 0 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
            >
              🔪
            </motion.div>
          )}

          {/* Cut line */}
          {cakeCut && <div className="cut-line" />}
        </div>

        {/* Action Buttons */}
        <div className="cake-actions">
          <motion.button
            className={`btn ${candlesLit ? 'btn-primary' : 'btn-secondary'} cake-action-btn`}
            onClick={handleBlow}
            disabled={!candlesLit || blowing}
            whileHover={candlesLit ? { scale: 1.05 } : {}}
            whileTap={candlesLit ? { scale: 0.95 } : {}}
          >
            {candlesLit ? '🌬️ Blow the Candles' : '✅ Candles Blown!'}
          </motion.button>

          <motion.button
            className={`btn ${!cakeCut ? 'btn-primary' : 'btn-secondary'} cake-action-btn`}
            onClick={handleCut}
            disabled={cakeCut || cutting}
            whileHover={!cakeCut ? { scale: 1.05 } : {}}
            whileTap={!cakeCut ? { scale: 0.95 } : {}}
          >
            {!cakeCut ? '🔪 Cut the Cake' : '✅ Cake Cut!'}
          </motion.button>
        </div>

        {/* Gift Button */}
        <AnimatePresence>
          {showGiftBtn && (
            <motion.button
              className="btn btn-primary btn-lg pulse-glow gift-reveal-btn"
              onClick={() => navigateTo('gift')}
              initial={{ y: 30, opacity: 0, scale: 0.8 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🎁 See Your Gift!
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
