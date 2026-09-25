import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useBirthday } from '../context/BirthdayContext';
import { calculateAge } from '../utils/dateUtils';
import './HappyBirthday.css';

export default function HappyBirthday() {
  const { giftData, navigateTo } = useBirthday();
  const hasLaunched = useRef(false);

  const name = giftData?.recipient?.name || 'Amazing Human';
  const age = giftData?.recipient?.birthDate
    ? calculateAge(giftData.recipient.birthDate)
    : '??';

  useEffect(() => {
    if (hasLaunched.current) return;
    hasLaunched.current = true;

    // Burst confetti from multiple angles
    const duration = 4000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ['#ff6b9d', '#c084fc', '#67e8f9', '#fbbf24', '#34d399'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ['#ff6b9d', '#c084fc', '#67e8f9', '#fbbf24', '#34d399'],
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();

    // Big center burst
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 100,
        origin: { x: 0.5, y: 0.5 },
        colors: ['#ff6b9d', '#c084fc', '#67e8f9', '#fbbf24', '#fb7185'],
      });
    }, 500);
  }, []);

  return (
    <div className="page birthday-page">
      {/* Stars Background */}
      <div className="birthday-stars">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="star"
            style={{
              '--x': `${Math.random() * 100}%`,
              '--y': `${Math.random() * 100}%`,
              '--size': `${Math.random() * 3 + 1}px`,
              '--delay': `${Math.random() * 3}s`,
              '--duration': `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <motion.div
        className="birthday-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Emoji Rain */}
        <div className="emoji-rain">
          {['🎈', '🎊', '🎉', '🥳', '🎂', '🎁', '💖', '✨', '🌟', '🎵'].map((e, i) => (
            <span
              key={i}
              className="rain-emoji"
              style={{
                '--x': `${5 + i * 10}%`,
                '--delay': `${i * 0.3}s`,
                '--duration': `${4 + Math.random() * 3}s`,
              }}
            >
              {e}
            </span>
          ))}
        </div>

        {/* Age Badge */}
        <motion.div
          className="age-badge"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 200, damping: 15 }}
        >
          <span className="age-number">{age}</span>
          <span className="age-label">years</span>
        </motion.div>

        {/* Happy Birthday Text */}
        <motion.div
          className="birthday-text-block"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <h1 className="birthday-heading heading-display">
            Happy Birthday
          </h1>
          <motion.h2
            className="birthday-name shimmer-text"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            {name}!
          </motion.h2>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          className="birthday-subtitle text-body"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          {giftData?.sender?.name
            ? `${giftData.sender.name} has prepared something special for you ✨`
            : 'Someone special has prepared a surprise for you ✨'}
        </motion.p>

        {/* Surprise Button */}
        <motion.button
          className="surprise-btn btn btn-primary btn-lg pulse-glow"
          onClick={() => navigateTo('cake')}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.8, type: 'spring' }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="surprise-icon">🎁</span>
          Open Your Surprise
          <span className="surprise-icon">🎁</span>
        </motion.button>
      </motion.div>
    </div>
  );
}
