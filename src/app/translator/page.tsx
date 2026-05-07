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
  Mic,
  Type,
  Send,
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
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

// Cycle through these colors for contact avatars
const CONTACT_COLORS = [
  { bg: 'rgba(255, 179, 198, 0.18)', text: '#ffb3c6', textLight: '#d63a6b' },
  { bg: 'rgba(6, 182, 212, 0.18)',   text: '#06b6d4', textLight: '#0891b2' },
  { bg: 'rgba(139, 92, 246, 0.18)',  text: '#a78bfa', textLight: '#7c3aed' },
  { bg: 'rgba(250, 204, 21, 0.18)',  text: '#facc15', textLight: '#b45309' },
  { bg: 'rgba(46, 204, 113, 0.18)',  text: '#2ecc71', textLight: '#0f766e' },
];

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const formatPhone = (number: string): string => {
  const cleaned = number.replace(/\D/g, '');
  if (cleaned.length === 11 && cleaned.startsWith('09')) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  if (cleaned.length === 12 && cleaned.startsWith('63')) {
    return `+63 ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }
  return number;
};

type Contact = {
  name: string;
  relationship: string;
  number: string;
};

type ConvMessage = { id: string; speaker: 'hearing' | 'deaf'; text: string; timestamp: number; interim?: boolean };

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
  const [settingsOpen,    setSettingsOpen]    = useState(false);
  const [convMessages,    setConvMessages]    = useState<ConvMessage[]>([]);
  const [isListening,     setIsListening]     = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [manualInputOpen, setManualInputOpen] = useState(false);
  const [manualText,      setManualText]      = useState('');

  // Profile
  const [profileName,     setProfileName]     = useState('Juan Dela Cruz');
  const [profileAge,      setProfileAge]      = useState('21');
  const [profileLocation, setProfileLocation] = useState('Iligan City');
  const [profileBio,      setProfileBio]      = useState('Student / CCS');
  const [editingProfile,  setEditingProfile]  = useState(false);
  const [draftName,       setDraftName]       = useState('');
  const [draftAge,        setDraftAge]        = useState('');
  const [draftLocation,   setDraftLocation]   = useState('');
  const [draftBio,        setDraftBio]        = useState('');

  // Contacts (now with relationship)
  const [contacts, setContacts] = useState<Contact[]>([
    { name: 'Maria Dela Cruz', relationship: 'Mom',     number: '09123456789' },
    { name: 'Pedro Santos',    relationship: 'Brother', number: '09987654321' },
  ]);
  const [editingContactIdx,    setEditingContactIdx]    = useState<number | null>(null);
  const [editContactName,      setEditContactName]      = useState('');
  const [editContactRelation,  setEditContactRelation]  = useState('');
  const [editContactNumber,    setEditContactNumber]    = useState('');
  const [showAddContact,       setShowAddContact]       = useState(false);
  const [newContactName,       setNewContactName]       = useState('');
  const [newContactRelation,   setNewContactRelation]   = useState('');
  const [newContactNumber,     setNewContactNumber]     = useState('');
  const [addContactError,      setAddContactError]      = useState('');

  const [timeTick, setTimeTick] = useState(0);

  const detectorRef       = useRef<ASLDetectorRef>(null);
  const settingsRef       = useRef<HTMLDivElement>(null);
  const recognitionRef    = useRef<any>(null);
  const interimIdRef      = useRef<string | null>(null);
  const convFeedRef       = useRef<HTMLDivElement>(null);
  const pauseTimerRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCommittedRef   = useRef('');
  const speechDetectedRef  = useRef(false);

  // Sync both data-theme attribute AND .light class so global styles + module styles stay in sync
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
      root.classList.add('light');
    } else {
      root.removeAttribute('data-theme');
      root.classList.remove('light');
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

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      toast.error('Speech recognition not available in this browser. Try Chrome.', { duration: 5000 });
      return;
    }
    setSpeechSupported(true);
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';
    rec.onresult = (e: any) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const text = e.results[i][0].transcript.trim();
        if (!text) continue;
        if (!speechDetectedRef.current) {
          speechDetectedRef.current = true;
          toast.success('Speech detected', { duration: 1500 });
        }
        if (e.results[i].isFinal) {
          const fid = interimIdRef.current;
          interimIdRef.current = null;
          setConvMessages(prev => {
            const filtered = fid ? prev.filter(m => m.id !== fid) : prev;
            return [...filtered, { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, speaker: 'hearing', text, timestamp: Date.now() }];
          });
        } else {
          if (!interimIdRef.current) interimIdRef.current = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
          const id = interimIdRef.current;
          setConvMessages(prev => {
            const idx = prev.findIndex(m => m.id === id);
            if (idx !== -1) { const n = [...prev]; n[idx] = { ...n[idx], text }; return n; }
            return [...prev, { id, speaker: 'hearing', text, timestamp: Date.now(), interim: true }];
          });
        }
      }
    };
    rec.onerror = (e: any) => {
      if (e.error === 'not-allowed') {
        toast.error('Microphone access denied', { duration: 4000 });
        setIsListening(false);
      }
    };
    rec.onend = () => { setIsListening(false); interimIdRef.current = null; };
    recognitionRef.current = rec;
    return () => { rec.abort(); };
  }, []);

  useEffect(() => {
    if (!settingsOpen) return;
    const handler = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) setSettingsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [settingsOpen]);

  // Pause detection: auto-add deaf user's sentence after 2s of no signing
  useEffect(() => {
    if (!sentence.trim()) return;
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    pauseTimerRef.current = setTimeout(() => {
      const trimmed = sentence.trim();
      if (!trimmed || trimmed === lastCommittedRef.current) return;
      lastCommittedRef.current = trimmed;
      setConvMessages(prev => [...prev, {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        speaker: 'deaf',
        text: trimmed,
        timestamp: Date.now(),
      }]);
      setSentence('');
      detectorRef.current?.clearSentence();
    }, 2000);
    return () => { if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current); };
  }, [sentence]);

  // Refresh relative timestamps every 30s
  useEffect(() => {
    const id = setInterval(() => setTimeTick(n => n + 1), 30000);
    return () => clearInterval(id);
  }, []);

  // Restore manual input toggle from localStorage
  useEffect(() => {
    if (localStorage.getItem('senyas-manual-input-enabled') === 'true') {
      setManualInputOpen(true);
    }
  }, []);

  // Auto-scroll conversation feed to bottom on new messages
  useEffect(() => {
    const el = convFeedRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [convMessages]);

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

  const addDeafMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    lastCommittedRef.current = trimmed;
    setConvMessages(prev => [...prev, {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      speaker: 'deaf',
      text: trimmed,
      timestamp: Date.now(),
    }]);
  };

  const handleSpace = () => {
    const current = detectorRef.current?.sentence ?? sentence;
    if (!current.endsWith(' ')) {
      detectorRef.current?.addSpace();
    }
    speakText(current);
    addDeafMessage(current);
  };

  const toggleMic = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      toast('Stopped listening', { duration: 1500 });
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        speechDetectedRef.current = false;
        toast('🎙️ Listening for speech...', { duration: 2000 });
      } catch {}
    }
  };

  const sendManualMessage = () => {
    const trimmed = manualText.trim();
    if (!trimmed) return;
    addDeafMessage(trimmed);
    speakText(trimmed);
    setManualText('');
  };

  // timeTick is read here so re-renders from the 30s interval recalculate all timestamps
  const formatRelativeTime = (ts: number) => {
    void timeTick;
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 5)  return 'just now';
    if (diff < 60) return `${diff}s ago`;
    const mins = Math.floor(diff / 60);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs}h ago`;
    return new Date(ts).toLocaleDateString();
  };

  const handleCopy = () => {
    if (!sentence) return;
    navigator.clipboard.writeText(sentence).then(() => {
      setCopied(true);
      toast.success('Copied to clipboard', { duration: 1500 });
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
    setEditContactRelation(contacts[idx].relationship);
    setEditContactNumber(contacts[idx].number);
  };

  const saveContact = (idx: number) => {
    if (!editContactName.trim() || !editContactNumber.trim()) return;
    setContacts(prev => prev.map((c, i) =>
      i === idx ? {
        name: editContactName.trim(),
        relationship: editContactRelation.trim(),
        number: editContactNumber.trim(),
      } : c
    ));
    setEditingContactIdx(null);
  };

  const addContact = () => {
    if (!newContactName.trim())   { setAddContactError('Name is required.');         return; }
    if (!newContactNumber.trim()) { setAddContactError('Phone number is required.'); return; }
    setContacts(prev => [...prev, {
      name: newContactName.trim(),
      relationship: newContactRelation.trim(),
      number: newContactNumber.trim(),
    }]);
    setNewContactName('');
    setNewContactRelation('');
    setNewContactNumber('');
    setAddContactError('');
    setShowAddContact(false);
  };

  const cancelAddContact = () => {
    setNewContactName('');
    setNewContactRelation('');
    setNewContactNumber('');
    setAddContactError('');
    setShowAddContact(false);
  };

  const selectedColorKey =
    Object.entries(COLOR_MAP).find(([, v]) => v === landmarkColor)?.[0] ?? 'pink';

  const cls = (...parts: (string | false | undefined)[]) =>
    parts.filter(Boolean).join(' ');

  const profileInitials = getInitials(profileName);

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
            title="Toggle Conversation"
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
          {!leftCollapsed && (
            <button
              onClick={() => setLeftCollapsed(true)}
              className={cls(styles.edgeChevron, styles.edgeChevronLeft)}
              title="Collapse"
            >
              <ChevronLeft size={14} />
            </button>
          )}
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
                  <div className={styles.profileAvatarLarge}>
                    <span className={styles.profileAvatarInitials}>{profileInitials}</span>
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
                            value={newContactRelation}
                            onChange={e => setNewContactRelation(e.target.value)}
                            placeholder="Relationship (e.g. Mom, Doctor)"
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

                  {contacts.map((contact, idx) => {
                    const color = CONTACT_COLORS[idx % CONTACT_COLORS.length];
                    const initials = getInitials(contact.name);
                    const isLight = theme === 'light';
                    const accentText = isLight ? color.textLight : color.text;

                    return (
                      <div
                        key={idx}
                        className={styles.contactCard}
                        style={{
                          borderLeft: `3px solid ${accentText}`,
                        }}
                      >
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
                              value={editContactRelation}
                              onChange={e => setEditContactRelation(e.target.value)}
                              placeholder="Relationship"
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
                              <div
                                className={styles.contactAvatar}
                                style={{
                                  background: color.bg,
                                  color: accentText,
                                }}
                              >
                                {initials}
                              </div>
                              <div className={styles.contactInfo}>
                                <p className={styles.contactName}>{contact.name}</p>
                                {contact.relationship && (
                                  <p className={styles.contactRelationship}>{contact.relationship}</p>
                                )}
                              </div>
                              <button
                                className={styles.iconBtnTiny}
                                onClick={() => startEditContact(idx)}
                                title="Edit contact"
                              >
                                <Pencil size={11} />
                              </button>
                            </div>
                            <p
                              className={styles.contactNumber}
                              style={{
                                color: accentText,
                                textShadow: isLight ? 'none' : `0 0 12px ${color.bg}`,
                              }}
                            >
                              {formatPhone(contact.number)}
                            </p>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>

              
              </motion.div>
            )}
          </AnimatePresence>
        </motion.aside>

        <section className={styles.centerPanel}>
          <div className={styles.centerInner}>
              <div className={styles.settingsToolbar} ref={settingsRef}>
              <button className={styles.settingsPill} onClick={() => setSettingsOpen(o => !o)}>
                <Settings size={13} />
                Settings
              </button>
              {settingsOpen && (
                <div className={styles.settingsPopover}>
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
                    <div className={styles.selectWrapper}>
                      <span className={styles.selectColorDot} style={{ background: landmarkColor }} />
                      <select
                        className={cls(styles.voiceSelect, styles.colorSelect)}
                        value={selectedColorKey}
                        onChange={e => setLandmarkColor(COLOR_MAP[e.target.value])}
                      >
                        {Object.keys(COLOR_MAP).map(name => (
                          <option key={name} value={name}>{name.charAt(0).toUpperCase() + name.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className={styles.settingGroup}>
                    <p className={styles.settingGroupTitle}>Display Mode</p>
                    <select
                      className={styles.voiceSelect}
                      value={displayMode}
                      onChange={e => setDisplayMode(e.target.value as 'camera' | 'mediapipe' | 'both')}
                    >
                      <option value="camera">Camera Only</option>
                      <option value="mediapipe">Mediapipe Only</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                  <div className={styles.settingGroup} style={{ borderBottom: 'none', marginBottom: 0, paddingBottom: 0 }}>
                    <p className={styles.settingGroupTitle}>Voice</p>
                    <select
                      className={styles.voiceSelect}
                      value={selectedVoice?.name ?? ''}
                      onChange={e => setSelectedVoice(voices.find(v => v.name === e.target.value) ?? null)}
                    >
                      {voices.length === 0 && <option value="">No voices available</option>}
                      {voices.map(v => <option key={v.name} value={v.name}>{v.name}</option>)}
                    </select>
                  </div>
                </div>
              )}
            </div>

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
                    onCameraError={() => { setCameraError(true); toast.error('Camera access denied', { duration: 4000 }); }}
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
                <button onClick={() => detectorRef.current?.deleteLastChar()} className={styles.outputActionBtn}>Delete</button>
                <button onClick={handleSpace} className={styles.outputActionBtn}>Space</button>
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
              <button
                className={styles.emergencyBtn}
                onClick={() => {
                  const msg = 'EMERGENCY. I need help. This is urgent.';
                  speakText(msg);
                  addDeafMessage(msg);
                  toast.error('🚨 Emergency alert sent', { duration: 2500 });
                }}
              >
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
                      <button onClick={addCustomMessage} className={styles.addMsgSubmit}>Add</button>
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
                        onClick={() => { speakText(msg.label); addDeafMessage(msg.label); toast(`Sent: "${msg.label}"`, { duration: 1500 }); }}
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
                        onClick={() => { speakText(msg); addDeafMessage(msg); toast(`Sent: "${msg}"`, { duration: 1500 }); }}
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
            title="Open Conversation"
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
          {!rightCollapsed && (
            <button
              onClick={() => setRightCollapsed(true)}
              className={cls(styles.edgeChevron, styles.edgeChevronRight)}
              title="Minimize"
            >
              <ChevronRight size={14} />
            </button>
          )}
          <AnimatePresence>
            {!rightCollapsed && (
              <motion.div
                key="right"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className={cls(styles.sidebarContent, styles.convPanel)}
              >
                <div className={styles.convHeader}>
                  <h3>Conversation Mode</h3>
                  <button
                    className={cls(styles.convTypingToggle, manualInputOpen && styles.convTypingToggleActive)}
                    onClick={() => {
                      const next = !manualInputOpen;
                      setManualInputOpen(next);
                      localStorage.setItem('senyas-manual-input-enabled', String(next));
                    }}
                    title={manualInputOpen ? 'Hide text input' : 'Type a message'}
                  >
                    <Type size={14} />
                  </button>
                </div>

                {!speechSupported && (
                  <p style={{ fontSize: 11, color: '#ef4444', marginBottom: 12, fontStyle: 'italic' }}>
                    Speech recognition not available. Try Chrome or Edge.
                  </p>
                )}

                <button
                  className={cls(styles.micBtn, isListening && styles.micBtnListening)}
                  onClick={toggleMic}
                  disabled={!speechSupported}
                >
                  {isListening && <span className={styles.pulseRing} />}
                  <Mic size={14} />
                  {isListening ? 'Listening… Stop' : 'Tap to Listen'}
                </button>

                <div className={styles.convFeed} ref={convFeedRef}>
                  {convMessages.length === 0 && (
                    <p className={styles.convEmpty}>
                      Conversation will appear here.
                    </p>
                  )}
                  {convMessages.map(msg => {
                    const isUser = msg.speaker === 'deaf';
                    return (
                      <div
                        key={msg.id}
                        className={cls(styles.convMsgRow, isUser ? styles.convMsgRowUser : styles.convMsgRowSpeaker)}
                      >
                        <div className={cls(styles.convAvatarCircle, isUser ? styles.convAvatarUser : styles.convAvatarSpeaker)}>
                          {isUser ? profileInitials : <Mic size={13} />}
                        </div>
                        <div className={styles.convBubbleWrapper}>
                          <span className={styles.convMsgName}>
                            {isUser ? profileName : 'Speaker'}
                          </span>
                          <div
                            className={cls(
                              styles.convBubble,
                              isUser ? styles.convBubbleUser : styles.convBubbleSpeaker,
                              msg.interim && styles.convInterimBubble,
                            )}
                            onClick={() => speakText(msg.text)}
                            title="Tap to replay"
                          >
                            <p className={styles.convBubbleText}>{msg.text}</p>
                          </div>
                          <span className={styles.convMsgTime}>{formatRelativeTime(msg.timestamp)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {manualInputOpen && (
                  <div className={styles.manualInputRow}>
                    <input
                      type="text"
                      className={styles.manualInput}
                      placeholder="Type a message..."
                      value={manualText}
                      onChange={e => setManualText(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && sendManualMessage()}
                    />
                    <button className={styles.manualSendBtn} onClick={sendManualMessage}>
                      <Send size={14} />
                    </button>
                  </div>
                )}

                {convMessages.length > 0 && (
                  <button
                    className={styles.clearConvBtn}
                    onClick={() => {
                      if (window.confirm('Clear all messages?')) {
                        setConvMessages([]);
                        toast('Conversation cleared', { duration: 1500 });
                      }
                    }}
                  >
                    Clear Conversation
                  </button>
                )}


              </motion.div>
            )}
          </AnimatePresence>
        </motion.aside>
      </main>
      <Toaster
        position="bottom-center"
        richColors
        closeButton
        theme={theme}
        toastOptions={{
          style: {
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(var(--glass-blur))',
            WebkitBackdropFilter: 'blur(var(--glass-blur))',
            border: '1px solid var(--glass-border)',
            boxShadow: 'var(--glass-shadow)',
            color: 'var(--text-primary)',
          },
        }}
      />
    </div>
  );
}