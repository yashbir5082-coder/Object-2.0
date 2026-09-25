import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBirthday } from '../context/BirthdayContext';
import { generateShareableLink } from '../utils/encoder';
import { generateGreeting, getGreetingTemplates } from '../utils/greetingGenerator';
import { searchSongs } from '../utils/musicApi';
import { compressImage } from '../utils/imageUpload';
import './EditorPage.css';

const STEPS = [
  { id: 'basic', label: 'Basic Info', icon: '👤' },
  { id: 'memories', label: 'Memories', icon: '📸' },
  { id: 'greeting', label: 'Greeting', icon: '💌' },
  { id: 'preview', label: 'Preview', icon: '👁️' },
  { id: 'share', label: 'Share', icon: '🔗' },
];

const LETTER_TEMPLATES = [
  { id: 'classic_parchment', name: 'Classic Parchment', emoji: '📜' },
  { id: 'modern_gradient', name: 'Modern Gradient', emoji: '🌈' },
  { id: 'floral_garden', name: 'Floral Garden', emoji: '🌸' },
  { id: 'night_sky', name: 'Night Sky', emoji: '🌌' },
];

const GREETING_STYLES = getGreetingTemplates();

export default function EditorPage() {
  const { giftData, updateGiftData } = useBirthday();
  const [step, setStep] = useState(0);
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [songQuery, setSongQuery] = useState('');
  const [songResults, setSongResults] = useState([]);
  const [searchingMusic, setSearchingMusic] = useState(false);
  const [activeMemoryIdx, setActiveMemoryIdx] = useState(null);
  const fileInputRef = useRef(null);

  const currentStep = STEPS[step];

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const goNext = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
  };
  const goBack = () => {
    if (step > 0) setStep(step - 1);
  };

  // ----- Basic Info -----
  const updateRecipient = (field, value) => {
    updateGiftData((prev) => ({
      ...prev,
      recipient: { ...prev.recipient, [field]: value },
    }));
  };

  const updateSender = (field, value) => {
    updateGiftData((prev) => ({
      ...prev,
      sender: { ...prev.sender, [field]: value },
    }));
  };

  // ----- Memories -----
  const addMemory = () => {
    updateGiftData((prev) => ({
      ...prev,
      memories: [
        ...prev.memories,
        {
          id: `mem_${Date.now()}`,
          photoUrl: '',
          caption: '',
          songId: '',
          previewUrl: '',
          songName: '',
          artist: '',
        },
      ],
    }));
  };

  const updateMemory = (idx, field, value) => {
    updateGiftData((prev) => {
      const memories = [...prev.memories];
      memories[idx] = { ...memories[idx], [field]: value };
      return { ...prev, memories };
    });
  };

  const removeMemory = (idx) => {
    updateGiftData((prev) => ({
      ...prev,
      memories: prev.memories.filter((_, i) => i !== idx),
    }));
  };

  const handlePhotoUpload = async (idx, file) => {
    if (!file) return;
    try {
      const compressed = await compressImage(file, 600, 0.7);
      updateMemory(idx, 'photoUrl', compressed);
    } catch (err) {
      console.error('Photo upload failed:', err);
    }
  };

  const handleSongSearch = async () => {
    if (!songQuery.trim()) return;
    setSearchingMusic(true);
    try {
      const results = await searchSongs(songQuery, 8);
      setSongResults(results);
    } catch {
      setSongResults([]);
    }
    setSearchingMusic(false);
  };

  const selectSong = (song, memoryIdx) => {
    updateMemory(memoryIdx, 'songId', song.id);
    updateMemory(memoryIdx, 'songName', song.name);
    updateMemory(memoryIdx, 'artist', song.artist);
    updateMemory(memoryIdx, 'previewUrl', song.previewUrl);
    setSongResults([]);
    setSongQuery('');
    setActiveMemoryIdx(null);
  };

  // ----- Greeting -----
  const handleGenerateGreeting = (templateId) => {
    if (!giftData.recipient.name || !giftData.recipient.birthDate) return;
    const result = generateGreeting({
      recipientName: giftData.recipient.name,
      birthDate: giftData.recipient.birthDate,
      senderName: giftData.sender.name || 'Your Friend',
      templateId,
    });
    updateGiftData((prev) => ({
      ...prev,
      greeting: {
        ...prev.greeting,
        text: result.text,
        templateId: result.templateId,
      },
    }));
  };

  // ----- Share -----
  const handleGenerate = () => {
    // Strip base64 photos for URL (keep only small data)
    const shareData = {
      ...giftData,
      memories: giftData.memories.map((m) => ({
        ...m,
        // Keep photos if they're URL-based, strip large base64
        photoUrl: m.photoUrl?.startsWith('http') ? m.photoUrl : 
                  m.photoUrl?.length < 5000 ? m.photoUrl : '',
      })),
    };
    const link = generateShareableLink(shareData);
    setGeneratedLink(link || '');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = generatedLink;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const shareWhatsApp = () => {
    const text = `🎂 I made a special birthday surprise for you! Open it here: ${generatedLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // ----- Validation -----
  const isStepValid = () => {
    switch (currentStep.id) {
      case 'basic':
        return giftData.recipient.name && giftData.recipient.birthDate && giftData.sender.name;
      default:
        return true;
    }
  };

  return (
    <div className="editor-page">
      {/* Progress Bar */}
      <div className="editor-progress">
        {STEPS.map((s, i) => (
          <div
            key={s.id}
            className={`progress-step ${i <= step ? 'active' : ''} ${i === step ? 'current' : ''}`}
            onClick={() => i < step && setStep(i)}
          >
            <span className="progress-icon">{s.icon}</span>
            <span className="progress-label">{s.label}</span>
            {i < STEPS.length - 1 && <div className="progress-line" />}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="editor-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep.id}
            className="step-content"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            {/* ---- STEP: Basic Info ---- */}
            {currentStep.id === 'basic' && (
              <div className="step-basic">
                <h2 className="heading-lg gradient-text">Who's the birthday star? ⭐</h2>
                <div className="form-group">
                  <label className="label">Their Name</label>
                  <input
                    className="input-field"
                    placeholder="e.g. Priya"
                    value={giftData.recipient.name}
                    onChange={(e) => updateRecipient('name', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="label">Their Birth Date</label>
                  <input
                    type="date"
                    className="input-field"
                    value={giftData.recipient.birthDate}
                    onChange={(e) => updateRecipient('birthDate', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="label">Your Name</label>
                  <input
                    className="input-field"
                    placeholder="e.g. Yash"
                    value={giftData.sender.name}
                    onChange={(e) => updateSender('name', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* ---- STEP: Memories ---- */}
            {currentStep.id === 'memories' && (
              <div className="step-memories">
                <h2 className="heading-lg gradient-text">Add Memories 📸</h2>
                <p className="text-body">Upload photos and attach songs to each memory</p>

                <div className="memories-editor-list">
                  {giftData.memories.map((mem, idx) => (
                    <div key={mem.id} className="memory-editor-card glass-card">
                      <div className="memory-editor-header">
                        <span className="memory-number">Memory #{idx + 1}</span>
                        <button
                          className="btn-remove"
                          onClick={() => removeMemory(idx)}
                          title="Remove"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Photo */}
                      <div className="memory-photo-upload">
                        {mem.photoUrl ? (
                          <div className="photo-preview">
                            <img src={mem.photoUrl} alt="Memory" />
                            <button
                              className="btn-change-photo"
                              onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = 'image/*';
                                input.onchange = (e) => handlePhotoUpload(idx, e.target.files[0]);
                                input.click();
                              }}
                            >
                              Change
                            </button>
                          </div>
                        ) : (
                          <button
                            className="photo-upload-btn"
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'image/*';
                              input.onchange = (e) => handlePhotoUpload(idx, e.target.files[0]);
                              input.click();
                            }}
                          >
                            <span>📷</span>
                            <span>Upload Photo</span>
                          </button>
                        )}
                      </div>

                      {/* Caption */}
                      <input
                        className="input-field"
                        placeholder="Add a caption..."
                        value={mem.caption}
                        onChange={(e) => updateMemory(idx, 'caption', e.target.value)}
                      />

                      {/* Song */}
                      <div className="memory-song-section">
                        {mem.songName ? (
                          <div className="selected-song">
                            <span>🎵 {mem.songName}</span>
                            <span className="song-artist-tag">{mem.artist}</span>
                            <button
                              className="btn-remove-song"
                              onClick={() => {
                                updateMemory(idx, 'songId', '');
                                updateMemory(idx, 'songName', '');
                                updateMemory(idx, 'artist', '');
                                updateMemory(idx, 'previewUrl', '');
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setActiveMemoryIdx(activeMemoryIdx === idx ? null : idx)}
                          >
                            🎵 Add Song
                          </button>
                        )}

                        {/* Song Search */}
                        {activeMemoryIdx === idx && (
                          <div className="song-search-panel">
                            <div className="song-search-bar">
                              <input
                                className="input-field"
                                placeholder="Search for a song..."
                                value={songQuery}
                                onChange={(e) => setSongQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSongSearch()}
                              />
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={handleSongSearch}
                                disabled={searchingMusic}
                              >
                                {searchingMusic ? '...' : '🔍'}
                              </button>
                            </div>
                            {songResults.length > 0 && (
                              <div className="song-results">
                                {songResults.map((song) => (
                                  <button
                                    key={song.id}
                                    className="song-result-item"
                                    onClick={() => selectSong(song, idx)}
                                  >
                                    {song.imageUrl && (
                                      <img src={song.imageUrl} alt="" className="song-thumb" />
                                    )}
                                    <div className="song-result-info">
                                      <span className="song-result-name">{song.name}</span>
                                      <span className="song-result-artist">{song.artist}</span>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <button className="btn btn-secondary add-memory-btn" onClick={addMemory}>
                  ➕ Add Memory
                </button>
              </div>
            )}

            {/* ---- STEP: Greeting ---- */}
            {currentStep.id === 'greeting' && (
              <div className="step-greeting">
                <h2 className="heading-lg gradient-text">Write a Greeting 💌</h2>

                {/* Letter Template Selector */}
                <div className="form-group">
                  <label className="label">Letter Style</label>
                  <div className="template-grid">
                    {LETTER_TEMPLATES.map((t) => (
                      <button
                        key={t.id}
                        className={`template-option ${
                          giftData.greeting.letterTemplateId === t.id ? 'selected' : ''
                        }`}
                        onClick={() =>
                          updateGiftData((prev) => ({
                            ...prev,
                            greeting: { ...prev.greeting, letterTemplateId: t.id },
                          }))
                        }
                      >
                        <span className="template-emoji">{t.emoji}</span>
                        <span className="template-name">{t.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Greeting Style */}
                <div className="form-group">
                  <label className="label">Greeting Tone</label>
                  <div className="greeting-style-options">
                    {GREETING_STYLES.map((gs) => (
                      <button
                        key={gs.id}
                        className={`btn btn-sm ${
                          giftData.greeting.templateId === gs.id ? 'btn-primary' : 'btn-secondary'
                        }`}
                        onClick={() => handleGenerateGreeting(gs.id)}
                      >
                        {gs.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Editable Text */}
                <div className="form-group">
                  <label className="label">Greeting Message (editable)</label>
                  <textarea
                    className="textarea-field greeting-textarea"
                    value={giftData.greeting.text}
                    onChange={(e) =>
                      updateGiftData((prev) => ({
                        ...prev,
                        greeting: { ...prev.greeting, text: e.target.value },
                      }))
                    }
                    placeholder="Click a tone above to auto-generate, or write your own message..."
                    rows={12}
                  />
                </div>
              </div>
            )}

            {/* ---- STEP: Preview ---- */}
            {currentStep.id === 'preview' && (
              <div className="step-preview">
                <h2 className="heading-lg gradient-text">Preview Your Gift 👁️</h2>
                <div className="preview-summary glass-card">
                  <div className="preview-item">
                    <span className="preview-label">For:</span>
                    <span className="preview-value">{giftData.recipient.name || '—'}</span>
                  </div>
                  <div className="preview-item">
                    <span className="preview-label">Birthday:</span>
                    <span className="preview-value">{giftData.recipient.birthDate || '—'}</span>
                  </div>
                  <div className="preview-item">
                    <span className="preview-label">From:</span>
                    <span className="preview-value">{giftData.sender.name || '—'}</span>
                  </div>
                  <div className="preview-item">
                    <span className="preview-label">Memories:</span>
                    <span className="preview-value">{giftData.memories.length} added</span>
                  </div>
                  <div className="preview-item">
                    <span className="preview-label">Greeting:</span>
                    <span className="preview-value">
                      {giftData.greeting.text ? '✅ Written' : '❌ Empty'}
                    </span>
                  </div>
                  <div className="preview-item">
                    <span className="preview-label">Letter Style:</span>
                    <span className="preview-value">
                      {LETTER_TEMPLATES.find((t) => t.id === giftData.greeting.letterTemplateId)
                        ?.name || 'Classic'}
                    </span>
                  </div>
                </div>

                {/* Memory Thumbnails */}
                {giftData.memories.length > 0 && (
                  <div className="preview-memories">
                    <h4>Memory Previews</h4>
                    <div className="preview-thumbs">
                      {giftData.memories.map((m, i) => (
                        <div key={i} className="preview-thumb">
                          {m.photoUrl ? (
                            <img src={m.photoUrl} alt={m.caption} />
                          ) : (
                            <div className="thumb-placeholder">📸</div>
                          )}
                          <span className="thumb-caption">{m.caption || `Memory ${i + 1}`}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Greeting Preview */}
                {giftData.greeting.text && (
                  <div className="preview-greeting">
                    <h4>Greeting Preview</h4>
                    <div className="preview-greeting-text">
                      {giftData.greeting.text.substring(0, 200)}...
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ---- STEP: Share ---- */}
            {currentStep.id === 'share' && (
              <div className="step-share">
                <h2 className="heading-lg gradient-text">Share Your Gift! 🔗</h2>
                <p className="text-body">
                  Generate a unique link and send it to{' '}
                  <strong>{giftData.recipient.name || 'your friend'}</strong>
                </p>

                {!generatedLink ? (
                  <button
                    className="btn btn-primary btn-lg pulse-glow"
                    onClick={handleGenerate}
                  >
                    ✨ Generate Link
                  </button>
                ) : (
                  <div className="share-result">
                    <div className="link-display">
                      <input
                        className="input-field link-input"
                        value={generatedLink}
                        readOnly
                        onClick={(e) => e.target.select()}
                      />
                      <button
                        className={`btn ${copied ? 'btn-copied' : 'btn-primary'}`}
                        onClick={handleCopy}
                      >
                        {copied ? '✅ Copied!' : '📋 Copy'}
                      </button>
                    </div>

                    <div className="share-buttons">
                      <a
                        className="btn btn-primary"
                        href={generatedLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: 'none' }}
                      >
                        🎁 Open & Experience Gift
                      </a>
                      <button className="btn btn-whatsapp" onClick={shareWhatsApp}>
                        📱 Share on WhatsApp
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({
                              title: `🎂 Birthday Surprise for ${giftData.recipient.name}`,
                              text: 'I made a special birthday gift for you!',
                              url: generatedLink,
                            });
                          }
                        }}
                      >
                        🔗 Share
                      </button>
                    </div>

                    <p className="share-note text-sm">
                      💡 The recipient will need to enter their birth date to unlock the gift!
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="editor-nav">
        {step > 0 && (
          <button className="btn btn-secondary" onClick={goBack}>
            ← Back
          </button>
        )}
        <div style={{ flex: 1 }} />
        {step < STEPS.length - 1 && (
          <button
            className="btn btn-primary"
            onClick={goNext}
            disabled={!isStepValid()}
          >
            Next →
          </button>
        )}
      </div>
    </div>
  );
}
