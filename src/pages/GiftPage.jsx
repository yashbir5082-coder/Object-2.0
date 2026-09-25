import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBirthday } from '../context/BirthdayContext';
import { calculateAge, formatDate } from '../utils/dateUtils';
import { generateGreeting, getGreetingTemplates } from '../utils/greetingGenerator';
import './GiftPage.css';

/* ---- Memory Card Component ---- */
function MemoryCard({ memory, index }) {
  const [flipped, setFlipped] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  const togglePlay = (e) => {
    e.stopPropagation();
    if (!memory.previewUrl) return;

    if (audioRef.current) {
      if (playing) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {});
      }
      setPlaying(!playing);
    }
  };

  return (
    <motion.div
      className="memory-card-container"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <div
        className={`memory-card ${flipped ? 'flipped' : ''}`}
        onClick={() => setFlipped(!flipped)}
      >
        {/* Front */}
        <div className="memory-front">
          {memory.photoUrl ? (
            <img
              src={memory.photoUrl}
              alt={memory.caption || 'Memory'}
              className="memory-photo"
              loading="lazy"
            />
          ) : (
            <div className="memory-placeholder">
              <span className="memory-placeholder-icon">📸</span>
              {memory.caption && (
                <p className="memory-placeholder-caption">{memory.caption}</p>
              )}
            </div>
          )}
          {memory.songName && (
            <div className="memory-song-badge" onClick={togglePlay}>
              <span className="song-icon">{playing ? '⏸️' : '🎵'}</span>
              <span className="song-name">{memory.songName}</span>
            </div>
          )}
        </div>

        {/* Back */}
        <div className="memory-back">
          <p className="memory-caption">{memory.caption || 'A beautiful memory ✨'}</p>
          {memory.songName && (
            <div className="memory-song-info">
              <p className="song-title">🎵 {memory.songName}</p>
              <p className="song-artist">{memory.artist || ''}</p>
              <button className="btn btn-secondary btn-sm" onClick={togglePlay}>
                {playing ? '⏸ Pause' : '▶ Play'}
              </button>
            </div>
          )}
          <p className="memory-hint text-sm">Tap to flip back</p>
        </div>
      </div>

      {memory.previewUrl && (
        <audio
          ref={audioRef}
          src={memory.previewUrl}
          onEnded={() => setPlaying(false)}
          preload="none"
        />
      )}
    </motion.div>
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
  const recipientName = giftData?.recipient?.name || 'Friend';

  return (
    <div className="gift-page">
      {/* ---- Section 1: Memories ---- */}
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
              ? 'A collection of our beautiful memories together'
              : 'Special memories curated just for you'}
          </p>
        </motion.div>

        {memories.length > 0 ? (
          <div className="memories-grid">
            {memories.map((memory, i) => (
              <MemoryCard key={memory.id || i} memory={memory} index={i} />
            ))}
          </div>
        ) : (
          <motion.div
            className="no-memories glass-card"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className="no-memories-icon">🌟</span>
            <p>This gift was made with love!</p>
            <p className="text-sm">Memories make every moment special ✨</p>
          </motion.div>
        )}
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
