import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBirthday } from '../context/BirthdayContext';
import { generateGreeting } from '../utils/greetingGenerator';
import './GiftPage.css';

/* ---- 3D Rolling Showcase (Coverflow Carousel) ---- */
function RollingShowcase({ memories = [] }) {
  const [curIdx, setCurIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [lightboxImg, setLightboxImg] = useState(null);

  const audioRef = useRef(null);
  const touchStartX = useRef(null);

  const total = memories.length;
  const currentMem = memories[curIdx] || {};

  // Formatter for audio duration/current time
  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Autoplay song whenever active card changes
  const playCurrentSong = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentMem.previewUrl) {
      if (audio.src !== currentMem.previewUrl) {
        audio.src = currentMem.previewUrl;
      }
      audio.currentTime = 0;
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Autoplay blocked by browser policy until user interacts
          setIsPlaying(false);
        });
    } else {
      audio.pause();
      audio.src = '';
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
    }
  }, [currentMem]);

  useEffect(() => {
    playCurrentSong();
  }, [curIdx, playCurrentSong]);

  // Navigate to slide
  const navTo = (idx) => {
    if (idx < 0 || idx >= total) return;
    setCurIdx(idx);
  };

  const navPrev = () => navTo(curIdx - 1);
  const navNext = () => navTo(curIdx + 1);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxImg) {
        if (e.key === 'Escape') setLightboxImg(null);
        return;
      }
      if (e.key === 'ArrowLeft') navPrev();
      if (e.key === 'ArrowRight') navNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [curIdx, total, lightboxImg]);

  // Touch Swipe handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 40) {
      if (diff < 0) navNext();
      else navPrev();
    }
    touchStartX.current = null;
  };

  // Audio event listeners
  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrentTime(audio.currentTime);
    setDuration(audio.duration || 0);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    // Optionally auto-advance to next memory
    if (curIdx < total - 1) {
      navTo(curIdx + 1);
    }
  };

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      if (!audio.src && currentMem.previewUrl) {
        audio.src = currentMem.previewUrl;
      }
      audio.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    setIsMuted(audio.muted);
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pos * audio.duration;
  };

  if (total === 0) {
    return (
      <div className="no-memories glass-card">
        <span className="no-memories-icon">🌟</span>
        <p>This gift was made with love!</p>
        <p className="text-sm">Memories make every moment special ✨</p>
      </div>
    );
  }

  // Calculate track translation
  // Card width = 320px, margin = 16px each side (gap = 32px)
  const cardWidth = 320;
  const cardSpacing = 32;
  const trackOffset = -(curIdx * (cardWidth + cardSpacing));

  return (
    <div className="rolling-showcase-wrapper">
      {/* 3D Coverflow Scene */}
      <div
        className="carousel-scene"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="carousel-track"
          style={{
            transform: `translateX(calc(50% - ${cardWidth / 2}px + ${trackOffset}px))`,
          }}
        >
          {memories.map((mem, i) => {
            const dist = i - curIdx;
            let cardClass = 'c-card';
            if (dist === 0) cardClass += ' active';
            else if (dist === -1) cardClass += ' prev';
            else if (dist === -2) cardClass += ' prev2';
            else if (dist === 1) cardClass += ' next';
            else if (dist === 2) cardClass += ' next2';
            else cardClass += ' far';

            return (
              <div
                key={mem.id || i}
                className={cardClass}
                onClick={() => {
                  if (dist === 0) {
                    if (mem.photoUrl) setLightboxImg(mem.photoUrl);
                  } else {
                    navTo(i);
                  }
                }}
              >
                {/* Photo or Placeholder */}
                {mem.photoUrl ? (
                  <img
                    src={mem.photoUrl}
                    alt={mem.caption || `Memory ${i + 1}`}
                    className="card-img"
                    loading="lazy"
                  />
                ) : (
                  <div className="card-placeholder-box">
                    <span className="ph-icon">📸</span>
                    <span className="ph-text">Memory #{i + 1}</span>
                  </div>
                )}

                {/* Card Info Footer */}
                <div className="card-info">
                  <div className="card-label">
                    {mem.caption || `✨ Special Moment #${i + 1}`}
                  </div>
                  <div className="card-counter">
                    {i + 1} / {total}
                  </div>

                  {/* Equalizer & Song Indicator */}
                  {mem.songName && (
                    <div className="song-ind">
                      {dist === 0 && isPlaying && (
                        <div className="mbars">
                          <span className="mbar" />
                          <span className="mbar" />
                          <span className="mbar" />
                        </div>
                      )}
                      <span className="song-ind-title">
                        🎵 {mem.songName}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Controls: Arrows + Dots */}
      <div className="car-nav">
        <button
          className="navarr"
          onClick={navPrev}
          disabled={curIdx === 0}
          title="Previous Memory"
        >
          ‹
        </button>
        <div className="navdots">
          {memories.map((_, i) => (
            <span
              key={i}
              className={`ndot ${i === curIdx ? 'on' : ''}`}
              onClick={() => navTo(i)}
            />
          ))}
        </div>
        <button
          className="navarr"
          onClick={navNext}
          disabled={curIdx === total - 1}
          title="Next Memory"
        >
          ›
        </button>
      </div>

      {/* Audio Engine HUD */}
      <div className={`audio-hud ${currentMem.songName ? 'show' : ''}`}>
        <div className="hud-row">
          {isPlaying && (
            <div className="hbars">
              <span className="hb" />
              <span className="hb" />
              <span className="hb" />
              <span className="hb" />
            </div>
          )}
          <div className="hud-song">
            {currentMem.songName ? (
              <>
                <span className="hud-song-name">{currentMem.songName}</span>
                {currentMem.artist && (
                  <span className="hud-song-artist"> — {currentMem.artist}</span>
                )}
              </>
            ) : (
              '🎵 No song linked to this memory'
            )}
          </div>
          <div className="hud-ctrl">
            {currentMem.previewUrl && (
              <button
                className="hctl btn-pp"
                onClick={togglePlayPause}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? '⏸' : '▶'}
              </button>
            )}
            <button
              className="hctl btn-mute"
              onClick={toggleMute}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? '🔇' : '🔊'}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {currentMem.previewUrl && (
          <div className="hud-prog-wrap">
            <div className="hud-prog" onClick={handleSeek}>
              <div
                className="hud-fill"
                style={{
                  width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                }}
              />
            </div>
            <div className="hud-time">
              <span>{formatTime(currentTime)}</span>
              <span>/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Native Hidden Audio Element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        preload="auto"
      />

      {/* Fullscreen Photo Lightbox */}
      {lightboxImg && (
        <div className="lbox on" onClick={() => setLightboxImg(null)}>
          <span className="lbox-x" onClick={() => setLightboxImg(null)}>
            ✕
          </span>
          <img
            src={lightboxImg}
            alt="Fullscreen Memory"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

/* ---- Letter Templates ---- */
const letterStyles = {
  classic_parchment: {
    name: 'Classic Parchment',
    className: 'letter-parchment',
  },
  modern_gradient: {
    name: 'Modern Gradient',
    className: 'letter-modern',
  },
  floral_garden: {
    name: 'Floral Garden',
    className: 'letter-floral',
  },
  night_sky: {
    name: 'Night Sky',
    className: 'letter-nightsky',
  },
};

/* ---- Greeting Letter Component ---- */
function GreetingLetter({ giftData }) {
  const templateId = giftData?.greeting?.letterTemplateId || 'classic_parchment';
  const style = letterStyles[templateId] || letterStyles.classic_parchment;
  const font = giftData?.greeting?.font || 'Caveat';

  let greetingText = giftData?.greeting?.text;
  if (!greetingText && giftData?.recipient?.name) {
    const result = generateGreeting({
      recipientName: giftData.recipient.name,
      birthDate: giftData.recipient.birthDate,
      senderName: giftData.sender?.name || 'Your Friend',
      templateId: giftData.greeting?.templateId,
    });
    greetingText = result.text;
  }

  return (
    <motion.div
      className={`greeting-letter ${style.className}`}
      initial={{ opacity: 0, rotateX: 90 }}
      whileInView={{ opacity: 1, rotateX: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      <div className="letter-decorations">
        <span className="letter-corner tl">✿</span>
        <span className="letter-corner tr">✿</span>
        <span className="letter-corner bl">✿</span>
        <span className="letter-corner br">✿</span>
      </div>

      <div className="letter-content" style={{ fontFamily: `'${font}', cursive` }}>
        {greetingText ? (
          greetingText.split('\n').map((line, i) => (
            <p key={i} className={line.trim() === '' ? 'letter-spacer' : ''}>
              {line || '\u00A0'}
            </p>
          ))
        ) : (
          <p className="letter-placeholder">A special message awaits...</p>
        )}
      </div>
      <div className="letter-seal">💌</div>
    </motion.div>
  );
}

/* ---- Feedback Component ---- */
function FeedbackSection() {
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const emojis = [
    { emoji: '😍', label: 'Loved it!' },
    { emoji: '🥰', label: 'So sweet!' },
    { emoji: '😊', label: 'Nice!' },
    { emoji: '🥲', label: 'Emotional' },
    { emoji: '😢', label: 'Made me cry' },
  ];

  const handleSubmit = () => {
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <motion.div
        className="feedback-thanks"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <span className="feedback-thanks-emoji">💝</span>
        <p>Thank you for your feedback!</p>
      </motion.div>
    );
  }

  return (
    <div className="feedback-section">
      <h3 className="heading-md gradient-text">How did you feel? 💭</h3>
      <div className="emoji-options">
        {emojis.map(({ emoji, label }) => (
          <button
            key={emoji}
            className={`emoji-btn ${selectedEmoji === emoji ? 'selected' : ''}`}
            onClick={() => setSelectedEmoji(emoji)}
            title={label}
          >
            <span className="emoji-icon">{emoji}</span>
            <span className="emoji-label">{label}</span>
          </button>
        ))}
      </div>
      {selectedEmoji && (
        <motion.div
          className="feedback-text-area"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
        >
          <textarea
            className="textarea-field"
            placeholder="Leave a message (optional)..."
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            rows={3}
          />
          <button className="btn btn-primary" onClick={handleSubmit}>
            Send Feedback 💌
          </button>
        </motion.div>
      )}
    </div>
  );
}

/* ---- Main Gift Page ---- */
export default function GiftPage() {
  const { giftData, startEditorMode } = useBirthday();

  const memories = giftData?.memories || [];

  return (
    <div className="gift-page">
      {/* ---- Section 1: Memories (3D Coverflow Showcase) ---- */}
      <section className="gift-section memories-section">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="heading-xl gradient-text">🎁 Your Gift</h2>
          <p className="text-body">
            {memories.length > 0
              ? 'A rolling showcase of our beautiful memories together'
              : 'Special memories curated just for you'}
          </p>
        </motion.div>

        {/* 3D Rolling Showcase */}
        <RollingShowcase memories={memories} />
      </section>

      <div className="section-divider" />

      {/* ---- Section 2: Greeting Letter ---- */}
      <section className="gift-section letter-section">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="heading-xl gradient-text">💌 A Letter For You</h2>
        </motion.div>

        <GreetingLetter giftData={giftData} />
      </section>

      <div className="section-divider" />

      {/* ---- Section 3: Feedback ---- */}
      <section className="gift-section feedback-wrapper">
        <FeedbackSection />
      </section>

      <div className="section-divider" />

      {/* ---- Section 4: Create Your Own ---- */}
      <section className="gift-section create-section">
        <motion.div
          className="create-cta glass-card"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="heading-lg">🎈 Wish Birthday to Your Loved Ones!</h3>
          <p className="text-body">
            Create your own personalized birthday surprise and share it with someone special
          </p>
          <button
            className="btn btn-primary btn-lg pulse-glow"
            onClick={startEditorMode}
          >
            ✨ Create My Own Gift
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="gift-footer">
        <p className="text-sm">
          Made with 💝 | Birthday Gift App
        </p>
      </footer>
    </div>
  );
}
