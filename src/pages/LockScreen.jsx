import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBirthday } from '../context/BirthdayContext';
import { validateBirthDate } from '../utils/dateUtils';
import './LockScreen.css';

export default function LockScreen() {
  const { giftData, unlock } = useBirthday();
  const [dateValue, setDateValue] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const lockRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!dateValue) {
      setError('Please enter a date');
      return;
    }

    if (validateBirthDate(dateValue, giftData?.recipient?.birthDate)) {
      setIsUnlocking(true);
      setError('');
      // Play unlock animation then transition
      setTimeout(() => {
        unlock();
      }, 1500);
    } else {
      setAttempts((prev) => prev + 1);
      setError('Wrong date! Try again 💔');
      if (attempts >= 2) {
        setShowHint(true);
      }
      // Shake animation
      if (lockRef.current) {
        lockRef.current.classList.add('shake');
        setTimeout(() => lockRef.current?.classList.remove('shake'), 500);
      }
    }
  };

  const recipientName = giftData?.recipient?.name || 'Someone Special';

  return (
    <div className="page lock-page">
      <AnimatePresence>
        {!isUnlocking ? (
          <motion.div
            className="lock-container"
            ref={lockRef}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.5, filter: 'blur(20px)' }}
            transition={{ duration: 0.6 }}
          >
            {/* Lock Icon */}
            <motion.div
              className="lock-icon-wrapper"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="lock-icon">
                <div className="lock-shackle"></div>
                <div className="lock-body">
                  <div className="lock-keyhole"></div>
                </div>
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1
              className="lock-title"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              🎁 A Surprise Awaits
            </motion.h1>

            <motion.p
              className="lock-subtitle text-body"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Hey <span className="gradient-text">{recipientName}</span>! Enter your birthday to unlock your gift
            </motion.p>

            {/* Date Input Form */}
            <motion.form
              className="lock-form"
              onSubmit={handleSubmit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <div className="date-input-wrapper">
                <input
                  type="date"
                  className="date-input input-field"
                  value={dateValue}
                  onChange={(e) => {
                    setDateValue(e.target.value);
                    setError('');
                  }}
                  placeholder="Your Birthday"
                />
              </div>

              {error && (
                <motion.p
                  className="lock-error"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </motion.p>
              )}

              {showHint && (
                <motion.p
                  className="lock-hint"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  💡 Hint: It's {recipientName}'s birthday!
                </motion.p>
              )}

              <button type="submit" className="btn btn-primary btn-lg pulse-glow unlock-btn">
                🔓 Unlock My Surprise
              </button>
            </motion.form>

            {/* Decorative Elements */}
            <div className="lock-decorations">
              {['🎈', '🎂', '🎁', '✨', '🎉', '💝', '🌟', '🎊'].map((emoji, i) => (
                <span
                  key={i}
                  className="floating-emoji"
                  style={{
                    '--delay': `${i * 0.8}s`,
                    '--x': `${Math.random() * 100}%`,
                    '--duration': `${6 + Math.random() * 4}s`,
                  }}
                >
                  {emoji}
                </span>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="unlock-animation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="unlock-burst"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.5, 3], opacity: [1, 0.8, 0] }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />
            <motion.div
              className="unlock-text shimmer-text heading-display"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8, type: 'spring' }}
            >
              🎉 Unlocked!
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
