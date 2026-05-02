"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Settings,
  User,
  AlertCircle,
  Sun,
  Moon,
  Pencil,
  Copy,
  Check,
} from 'lucide-react';
import styles from './translator.module.css';
import ASLDetector, { ASLDetectorRef } from '../../components/ASLdetector';

const QUICK_MESSAGES = [
  { id: 'help',   label: 'Help Needed' },
  { id: 'yes',    label: 'Yes'         },
  { id: 'no',     label: 'No'          },
  { id: 'water',  label: 'Need Water'  },
  { id: 'thanks', label: 'Thank You'   },
];

const COLOR_MAP: Record<string, string> = {
  pink:   '#ffb3c6',
  green:  '#2ecc71',
  blue:   '#3b82f6',
  red:    '#e74c3c',
  purple: '#8b5cf6',
  cyan:   '#06b6d4',
  yellow: '#facc15',
  orange: '#fb923c',
};

export default function TranslatorPage() {
  const [leftCollapsed,   setLeftCollapsed]   = useState(false);
  const [rightCollapsed,  setRightCollapsed]  = useState(false);
  const [quickMsgOpen,    setQuickMsgOpen]    = useState(false);
  const [showAddInput,    setShowAddInput]    = useState(false);
  const [customText,      setCustomText]      = useState('');
  const [customMessages,  setCustomMessages]  = useState<string[]>([]);
  const [displayMode,     setDisplayMode]     = useState<'camera' | 'mediapipe' | 'both'>('both');
  const [landmarkColor,   setLandmarkColor]   = useState(COLOR_MAP.pink);
  const [quickMsgEnabled, setQuickMsgEnabled] = useState(true);
  const [theme,           setTheme]           = useState<'dark' | 'light'>('dark');
  const [letter,          setLetter]          = useState('—');
  const [letterScore,     setLetterScore]     = useState(0);
  const [progress,        setProgress]        = useState(0);
  const [cameraReady,     setCameraReady]     = useState(false);
  const [cameraError,     setCameraError]     = useState(false);
  const [sentence,        setSentence]        = useState('');
  const [copied,          setCopied]          = useState(false);
  const [voices,          setVoices]          = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice,   setSelectedVoice]   = useState<SpeechSynthesisVoice | null>(null);

  // ── Profile ──────────────────────────────────────────
  const [profileName,     setProfileName]     = useState('Juan Dela Cruz');
  const [profileAge,      setProfileAge]      = useState('21');
  const [profileLocation, setProfileLocation] = useState('Iligan City');
  const [profileBio,      setProfileBio]      = useState('Student / CCS');
  const [editingProfile,  setEditingProfile]  = useState(false);
  const [draftName,       setDraftName]       = useState('');
  const [draftAge,        setDraftAge]        = useState('');
  const [draftLocation,   setDraftLocation]   = useState('');
  const [draftBio,        setDraftBio]        = useState('');

  // ── Contacts ─────────────────────────────────────────
  const [contacts, setContacts] = useState([
    { name: 'Maria Dela Cruz', number: '09123456789' },
    { name: 'Pedro Santos',    number: '09987654321' },
  ]);
  const [editingContactIdx, setEditingContactIdx] = useState<number | null>(null);
  const [editContactName,   setEditContactName]   = useState('');
  const [editContactNumber, setEditContactNumber] = useState('');
  const [showAddContact,    setShowAddContact]    = useState(false);
  const [newContactName,    setNewContactName]    = useState('');
  const [newContactNumber,  setNewContactNumber]  = useState('');
  const [addContactError,   setAddContactError]   = useState('');

  const detectorRef = useRef<ASLDetectorRef>(null);

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [theme]);

  useEffect(() => {
    const synth = window.speechSynthesis;
    const loadVoices = () => {
      const available = synth.getVoices();
      if (available.length > 0) {
        setVoices(available);
        setSelectedVoice(prev => prev ?? available[0]);
      }
    };
    loadVoices();
    synth.onvoiceschanged = loadVoices;
    return () => { synth.onvoiceschanged = null; };
  }, []);

  const addCustomMessage = () => {
    if (customText.trim()) {
      setCustomMessages(prev => [...prev, customText.trim()]);
      setCustomText('');
      setShowAddInput(false);
    }
  };

  const speakText = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(trimmed);
    if (selectedVoice) utt.voice = selectedVoice;
    window.speechSynthesis.speak(utt);
  };

  const handleSpace = () => {
    const current = detectorRef.current?.sentence ?? sentence;
    if (!current.endsWith(' ')) {
      detectorRef.current?.addSpace();
    }
    speakText(current);
  };

  const handleCopy = () => {
    if (!sentence) return;
    navigator.clipboard.writeText(sentence).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  const startEditProfile = () => {
    setDraftName(profileName);
    setDraftAge(profileAge);
    setDraftLocation(profileLocation);
    setDraftBio(profileBio);
    setEditingProfile(true);
  };

  const saveProfile = () => {
    if (draftName.trim())     setProfileName(draftName.trim());
    if (draftAge.trim())      setProfileAge(draftAge.trim());
    if (draftLocation.trim()) setProfileLocation(draftLocation.trim());
    setProfileBio(draftBio.trim());
    setEditingProfile(false);
  };

  const startEditContact = (idx: number) => {
    setEditingContactIdx(idx);
    setEditContactName(contacts[idx].name);
    setEditContactNumber(contacts[idx].number);
  };

  const saveContact = (idx: number) => {
    if (!editContactName.trim() || !editContactNumber.trim()) return;
    setContacts(prev => prev.map((c, i) =>
      i === idx ? { name: editContactName.trim(), number: editContactNumber.trim() } : c
    ));
    setEditingContactIdx(null);
  };

  const addContact = () => {
    if (!newContactName.trim())   { setAddContactError('Name is required.');         return; }
    if (!newContactNumber.trim()) { setAddContactError('Phone number is required.'); return; }
    setContacts(prev => [...prev, { name: newContactName.trim(), number: newContactNumber.trim() }]);
    setNewContactName('');
    setNewContactNumber('');
    setAddContactError('');
    setShowAddContact(false);
  };

  const cancelAddContact = () => {
    setNewContactName('');
    setNewContactNumber('');
    setAddContactError('');
    setShowAddContact(false);
  };

  const selectedColorKey =
    Object.entries(COLOR_MAP).find(([, v]) => v === landmarkColor)?.[0] ?? 'pink';

  const cls = (...parts: (string | false | undefined)[]) =>
    parts.filter(Boolean).join(' ');

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button
            onClick={() => setLeftCollapsed(c => !c)}
            className={cls(styles.headerToggle, !leftCollapsed && styles.headerToggleActive)}
            title="Toggle Profile"
          >
            <User size={17} />
          </button>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                fill="none" stroke="#0d0d0d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m5 15 3-3 3 3"/><path d="M2 21h20"/>
                <path d="M22 17v-6a2 2 0 0 0-2-2h-3"/>
                <path d="M15 13V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v7"/>
              </svg>
            </div>
            <h1>Senyas.IO</h1>
          </div>
        </div>

        <div className={styles.headerRight}>
          <div className={styles.liveIndicator}>
            <span>Translator Mode</span>
            <span
              className={styles.liveDot}
              style={{ background: cameraReady ? '#22c55e' : '#ef4444' }}
            />
          </div>
          <button
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            className={styles.headerToggle}
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <button
            onClick={() => setRightCollapsed(c => !c)}
            className={cls(styles.headerToggle, !rightCollapsed && styles.headerToggleActive)}
            title="Toggle Settings"
          >
            <Settings size={17} />
          </button>
        </div>
      </header>

      <main className={styles.main}>
        {leftCollapsed && (
          <button
            onClick={() => setLeftCollapsed(false)}
            className={cls(styles.sidebarOpenTrigger, styles.leftTrigger)}
            title="Open Profile"
          >
            <ChevronRight size={14} />
          </button>
        )}

        <motion.aside
          initial={false}
          animate={{ width: leftCollapsed ? 0 : 320 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className={cls(styles.sidebar, styles.leftSidebar)}
        >
          <AnimatePresence>
            {!leftCollapsed && (
              <motion.div
                key="left"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className={styles.sidebarContent}
              >
                {/* ── Profile Section ───────────────────────── */}
                <div className={styles.profileSection}>
                  <div className={styles.profileAvatar}>
                    <User size={24} />
                  </div>

                  {editingProfile ? (
                    <div className={styles.profileEditForm}>
                      <input
                        className={styles.profileInput}
                        value={draftName}
                        onChange={e => setDraftName(e.target.value)}
                        placeholder="Full name"
                      />
                      <div className={styles.profileInputRow}>
                        <input
                          className={styles.profileInput}
                          value={draftAge}
                          onChange={e => setDraftAge(e.target.value)}
                          placeholder="Age"
                        />
                        <input
                          className={styles.profileInput}
                          value={draftLocation}
                          onChange={e => setDraftLocation(e.target.value)}
                          placeholder="Location"
                        />
                      </div>
                      <textarea
                        className={styles.profileTextarea}
                        value={draftBio}
                        onChange={e => setDraftBio(e.target.value)}
                        placeholder="Bio"
                        rows={2}
                      />
                      <div className={styles.editActions}>
                        <button className={styles.saveBtn} onClick={saveProfile}>Save</button>
                        <button className={styles.cancelBtn} onClick={() => setEditingProfile(false)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className={styles.profileInfo}>
                        <p className={styles.profileName}>{profileName}</p>
                        <p className={styles.profileMeta}>Age: {profileAge} · {profileLocation}</p>
                      </div>
                      <div className={styles.bioBox}>&quot;{profileBio}&quot;</div>
                      <button className={styles.editProfileBtn} onClick={startEditProfile}>
                        <Pencil size={11} /> Edit Profile
                      </button>
                    </>
                  )}
                </div>

                {/* ── Contacts Section ──────────────────────── */}
                <div className={styles.contactsSection}>
                  <div className={styles.contactsHeader}>
                    <h4>Emergency Contacts</h4>
                    <button
                      className={styles.iconBtn}
                      onClick={() => { setShowAddContact(v => !v); setAddContactError(''); }}
                      title="Add contact"
                    >
                      <Plus
                        size={13}
                        style={{
                          transform: showAddContact ? 'rotate(45deg)' : 'none',
                          transition: 'transform 0.2s',
                        }}
                      />
                    </button>
                  </div>

                  <AnimatePresence>
                    {showAddContact && (
                      <motion.div
                        key="add-contact"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div className={styles.contactForm}>
                          <input
                            className={styles.contactInput}
                            value={newContactName}
                            onChange={e => { setNewContactName(e.target.value); setAddContactError(''); }}
                            placeholder="Contact name"
                          />
                          <input
                            className={styles.contactInput}
                            value={newContactNumber}
                            onChange={e => { setNewContactNumber(e.target.value); setAddContactError(''); }}
                            placeholder="Phone number"
                          />
                          {addContactError && <p className={styles.formError}>{addContactError}</p>}
                          <div className={styles.editActions}>
                            <button className={styles.saveBtn} onClick={addContact}>Add</button>
                            <button className={styles.cancelBtn} onClick={cancelAddContact}>Cancel</button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {contacts.map((contact, idx) => (
                    <div key={idx} className={styles.contactCard}>
                      {editingContactIdx === idx ? (
                        <>
                          <input
                            className={styles.contactInput}
                            value={editContactName}
                            onChange={e => setEditContactName(e.target.value)}
                            placeholder="Contact name"
                          />
                          <input
                            className={styles.contactInput}
                            value={editContactNumber}
                            onChange={e => setEditContactNumber(e.target.value)}
                            placeholder="Phone number"
                          />
                          <div className={styles.editActions}>
                            <button className={styles.saveBtn} onClick={() => saveContact(idx)}>Save</button>
                            <button className={styles.cancelBtn} onClick={() => setEditingContactIdx(null)}>Cancel</button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className={styles.contactCardTop}>
                            <p className={styles.contactName}>{contact.name}</p>
                            <button
                              className={styles.iconBtnTiny}
                              onClick={() => startEditContact(idx)}
                              title="Edit contact"
                            >
                              <Pencil size={11} />
                            </button>
                          </div>
                          <p className={styles.contactNumber}>{contact.number}</p>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                <div className={styles.sidebarFooter}>
                  <button onClick={() => setLeftCollapsed(true)} className={styles.collapseBtn}>
                    <ChevronLeft size={13} />
                    Collapse
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.aside>

        <section className={styles.centerPanel}>
          <div className={styles.centerInner}>
            <div className={styles.cameraWrapper}>
              {cameraError ? (
                <div className={styles.deniedOverlay}>
                  <AlertCircle size={32} style={{ color: '#ef4444', opacity: 0.6 }} />
                  <p className={styles.deniedTitle}>Camera Access Denied</p>
                  <p className={styles.deniedSub}>
                    Allow camera access in your browser to use the ASL translator.
                  </p>
                </div>
              ) : (
                <div className={styles.cameraInner}>
                  <ASLDetector
                    ref={detectorRef}
                    landmarkColor={landmarkColor}
                    displayMode={displayMode}
                    onLetterChange={(l, s) => { setLetter(l); setLetterScore(s); }}
                    onSentenceChange={setSentence}
                    onProgressChange={setProgress}
                    onCameraReady={setCameraReady}
                    onCameraError={() => setCameraError(true)}
                  />
                  {!cameraReady && (
                    <div className={styles.cameraLoadingOverlay}>
                      <div className={styles.spinner} />
                      <span className={styles.cameraPlaceholderLabel}>Starting camera…</span>
                    </div>
                  )}
                  {cameraReady && (
                    <div className={styles.liveBadge}>
                      <span className={styles.liveDot} style={{ background: '#22c55e' }} />
                      <span className={styles.liveText}>LIVE</span>
                    </div>
                  )}
                  {cameraReady && progress > 0 && (
                    <div className={styles.holdProgressBar}>
                      <span className={styles.holdTimer}>{letter}</span>
                      <div className={styles.holdBarTrack}>
                        <div className={styles.holdBarFill} style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className={styles.letterRing}>
              <span className={styles.ringLabel}>Detected</span>
              <span className={cls(styles.ringLetter, progress > 0 && styles.pop)}>
                {letter}
              </span>
              {letterScore > 0 && (
                <span className={styles.ringScore}>{letterScore}%</span>
              )}
            </div>

            <div className={styles.translationOutput}>
              <p className={styles.outputLabel}>Translation</p>
              <textarea
                className={cls(styles.outputText, styles.outputTextarea)}
                value={sentence}
                placeholder="Spell letters to begin…"
                onChange={e => {
                  const val = e.target.value;
                  setSentence(val);
                  detectorRef.current?.setSentenceText(val);
                }}
                rows={2}
              />
              <div className={styles.outputActions}>
                <button
                  onClick={() => detectorRef.current?.deleteLastChar()}
                  className={styles.outputActionBtn}
                >
                  Delete
                </button>
                <button
                  onClick={handleSpace}
                  className={styles.outputActionBtn}
                >
                  Space
                </button>
                <button
                  onClick={handleCopy}
                  disabled={!sentence}
                  className={cls(styles.outputActionBtn, copied && styles.copySuccess)}
                  title="Copy translation"
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <button
                  onClick={() => { detectorRef.current?.clearSentence(); setSentence(''); }}
                  className={cls(styles.outputActionBtn, styles.danger)}
                >
                  Clear
                </button>
              </div>
            </div>

            <div className={styles.quickSection}>
              <button className={styles.emergencyBtn}>
                <AlertCircle size={15} />
                Emergency
              </button>

              <div className={styles.quickBar}>
                <button
                  onClick={() => quickMsgEnabled && setQuickMsgOpen(o => !o)}
                  disabled={!quickMsgEnabled}
                  className={styles.quickMainBtn}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round">
                    <path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>
                  </svg>
                  Quick Message
                </button>
                <button
                  onClick={() => setShowAddInput(v => !v)}
                  className={styles.quickPlusBtn}
                  title="Add custom message"
                >
                  <Plus
                    size={20}
                    style={{
                      transform: showAddInput ? 'rotate(45deg)' : 'none',
                      transition: 'transform 0.2s',
                    }}
                  />
                </button>
              </div>

              <AnimatePresence>
                {showAddInput && (
                  <motion.div
                    key="add-input"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className={styles.addMsgInput}>
                      <input
                        type="text"
                        placeholder="Type a custom message…"
                        value={customText}
                        onChange={e => setCustomText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addCustomMessage()}
                      />
                      <button onClick={addCustomMessage} className={styles.addMsgSubmit}>
                        Add
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {quickMsgOpen && (
                  <motion.div
                    key="quick-grid"
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 10, opacity: 0 }}
                    className={styles.quickGrid}
                  >
                    {QUICK_MESSAGES.map((msg, i) => (
                      <motion.button
                        key={msg.id}
                        initial={{ scale: 0.92, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.04 }}
                        className={styles.quickBtn}
                        onClick={() => speakText(msg.label)}
                      >
                        {msg.label}
                      </motion.button>
                    ))}
                    {customMessages.map((msg, i) => (
                      <motion.button
                        key={`c-${i}`}
                        initial={{ scale: 0.92, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={cls(styles.quickBtn, styles.quickBtnCustom)}
                        onClick={() => speakText(msg)}
                      >
                        {msg}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {rightCollapsed && (
          <button
            onClick={() => setRightCollapsed(false)}
            className={cls(styles.sidebarOpenTrigger, styles.rightTrigger)}
            title="Open Settings"
          >
            <ChevronLeft size={14} />
          </button>
        )}

        <motion.aside
          initial={false}
          animate={{ width: rightCollapsed ? 0 : 320 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className={cls(styles.sidebar, styles.rightSidebar)}
        >
          <AnimatePresence>
            {!rightCollapsed && (
              <motion.div
                key="right"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className={styles.sidebarContent}
              >
                <h3>Settings</h3>

                <div className={styles.settingGroup}>
                  <p className={styles.settingGroupTitle}>Features</p>
                  <div className={styles.settingRow}>
                    <span className={styles.settingLabel}>Quick Message</span>
                    <button
                      onClick={() => setQuickMsgEnabled(v => !v)}
                      className={cls(styles.toggle, !quickMsgEnabled && styles.off)}
                      aria-pressed={quickMsgEnabled}
                    >
                      <div className={styles.toggleKnob} />
                    </button>
                  </div>
                </div>

                <div className={styles.settingGroup}>
                  <p className={styles.settingGroupTitle}>Mediapipe Color</p>
                  <div className={styles.colorGrid}>
                    {Object.entries(COLOR_MAP).map(([name, hex]) => (
                      <button
                        key={name}
                        onClick={() => setLandmarkColor(hex)}
                        className={cls(styles.colorChip, selectedColorKey === name && styles.active)}
                        style={{
                          background: hex,
                          opacity: selectedColorKey === name ? 1 : 0.45,
                        }}
                        title={name.charAt(0).toUpperCase() + name.slice(1)}
                      />
                    ))}
                  </div>
                </div>

                <div className={styles.settingGroup}>
                  <p className={styles.settingGroupTitle}>Display Mode</p>
                  <div className={styles.displayModeList}>
                    {(['camera', 'mediapipe', 'both'] as const).map(mode => (
                      <button
                        key={mode}
                        onClick={() => setDisplayMode(mode)}
                        className={cls(styles.displayModeOption, displayMode === mode && styles.active)}
                      >
                        <span className={styles.radioCircle}>
                          {displayMode === mode && <span className={styles.radioDot} />}
                        </span>
                        {mode === 'camera'
                          ? 'Camera Only'
                          : mode === 'mediapipe'
                          ? 'Mediapipe Only'
                          : 'Both'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.settingGroup}>
                  <p className={styles.settingGroupTitle}>Voice</p>
                  <select
                    className={styles.voiceSelect}
                    value={selectedVoice?.name ?? ''}
                    onChange={e => setSelectedVoice(voices.find(v => v.name === e.target.value) ?? null)}
                  >
                    {voices.length === 0 && <option value="">No voices available</option>}
                    {voices.map(v => (
                      <option key={v.name} value={v.name}>{v.name}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.settingGroup}>
                  <p className={styles.settingGroupTitle}>Theme</p>
                  <div className={styles.themeToggleRow}>
                    <button
                      onClick={() => setTheme('dark')}
                      className={cls(styles.themeBtn, theme === 'dark' && styles.active)}
                    >
                      <Moon size={13} /> Night
                    </button>
                    <button
                      onClick={() => setTheme('light')}
                      className={cls(styles.themeBtn, theme === 'light' && styles.active)}
                    >
                      <Sun size={13} /> Light
                    </button>
                  </div>
                </div>

                <div className={styles.sidebarFooter}>
                  <button onClick={() => setRightCollapsed(true)} className={styles.collapseBtn}>
                    <ChevronRight size={13} />
                    Minimize
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.aside>
      </main>
    </div>
  );
}