import React, { useState, useEffect, useRef } from 'react';

const PROJECTS_KEY = 'ganttProjects';
const THEME_KEY    = 'ganttTheme';
const ACCENT_KEY   = 'ganttAccent';

// Words that cycle in the hero headline
const CYCLE_WORDS = ['year', 'quarter', 'projects', 'sprints', 'goals', 'roadmap'];

// Accent colour definitions 鈥?using inline style values so Tailwind purging never drops them
const ACCENTS = [
  { id: 'blue',   label: 'Blue',   from: '#60a5fa', via: '#67e8f9', to: '#818cf8', btnBg: '#2563eb', btnHover: '#3b82f6', dot: '#3b82f6', glow: 'rgba(37,99,235,0.20)' },
  { id: 'purple', label: 'Purple', from: '#c084fc', via: '#f9a8d4', to: '#818cf8', btnBg: '#9333ea', btnHover: '#a855f7', dot: '#a855f7', glow: 'rgba(147,51,234,0.20)' },
  { id: 'green',  label: 'Green',  from: '#34d399', via: '#5eead4', to: '#22d3ee', btnBg: '#059669', btnHover: '#10b981', dot: '#10b981', glow: 'rgba(5,150,105,0.20)' },
  { id: 'orange', label: 'Orange', from: '#fb923c', via: '#fcd34d', to: '#facc15', btnBg: '#f97316', btnHover: '#fb923c', dot: '#f97316', glow: 'rgba(249,115,22,0.20)' },
];

function readProjects() {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function writeProjects(list) {
  try {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(list));
  } catch (e) { /* ignore */ }
}

// One-time migration: if the user had tasks saved before the landing page existed,
// import them as "Louis Wang's Year Planner" so they appear in the project list.
function migrateExistingPlanner(currentList) {
  const MIGRATED_KEY = 'ganttMigrated_v1';
  if (localStorage.getItem(MIGRATED_KEY)) return currentList; // already done

  try {
    const rawTasks = localStorage.getItem('ganttTasks');
    const rawRange = localStorage.getItem('ganttTimelineRange');
    if (!rawTasks) {
      localStorage.setItem(MIGRATED_KEY, '1');
      return currentList;
    }
    const tasks = JSON.parse(rawTasks);
    const range = rawRange ? JSON.parse(rawRange) : { start: '2025-11-01', end: '2026-12-31' };
    if (!Array.isArray(tasks) || tasks.length === 0) {
      localStorage.setItem(MIGRATED_KEY, '1');
      return currentList;
    }
    const migrated = {
      id: Date.now(),
      name: "Louis Wang's Year Planner",
      start: range.start || '2025-11-01',
      end: range.end || '2026-12-31',
      tasks,
    };
    const next = [migrated, ...currentList];
    writeProjects(next);
    localStorage.setItem(MIGRATED_KEY, '1');
    return next;
  } catch (e) {
    localStorage.setItem(MIGRATED_KEY, '1');
    return currentList;
  }
}

const FEATURES = [
  { icon: '🗂️', title: 'Multiple Planners', desc: 'Create separate planners for different projects or years.' },
  { icon: '🖱️', title: 'Drag & Resize', desc: 'Move and resize tasks directly on the timeline with your mouse.' },
  { icon: '↩️', title: 'Undo / Redo', desc: 'Full undo/redo history so you can experiment freely.' },
  { icon: '🎨', title: 'Color Coded', desc: 'Assign colors to tasks for instant visual grouping.' },
  { icon: '📝', title: 'Task Notes', desc: 'Attach notes to any task for extra context.' },
  { icon: '📤', title: 'Import / Export', desc: 'Back up or share planners as JSON files.' },
];

const STEPS = [
  { n: '01', title: 'Create a planner', desc: 'Give it a name and choose a start and end date for the timeline.' },
  { n: '02', title: 'Add tasks', desc: 'Hit Add Task, fill in the name, dates and colour, then save.' },
  { n: '03', title: 'Drag to reschedule', desc: 'Grab any bar to move it. Drag the left or right edge to resize.' },
  { n: '04', title: 'Zoom & fit', desc: 'Use the zoom slider or hold Ctrl + scroll. Hit Fit to see everything at once.' },
  { n: '05', title: 'Export & share', desc: 'Click Export to download a JSON snapshot, or Import to restore one.' },
];

export default function LandingPage({ onOpen }) {
  const [projects, setProjects] = useState(() => migrateExistingPlanner(readProjects()));
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [start, setStart] = useState('2026-01-01');
  const [end, setEnd] = useState('2026-12-31');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const importRef = useRef();

  // 鈹€鈹€ Theme & accent 鈹€鈹€
  const [theme, setTheme]   = useState(() => localStorage.getItem(THEME_KEY)  || 'dark');
  const [accent, setAccent] = useState(() => localStorage.getItem(ACCENT_KEY) || 'blue');
  const isDark = theme === 'dark';
  const accentCfg = ACCENTS.find(a => a.id === accent) || ACCENTS[0];

  // Apply/remove light class on body so Google Translate combo override works
  useEffect(() => {
    document.body.classList.toggle('lp-light', !isDark);
    localStorage.setItem(THEME_KEY, theme);
    // Clean up when component unmounts (navigating to planner)
    return () => {
      document.body.classList.remove('lp-light');
    };
  }, [theme, isDark]);

  useEffect(() => {
    localStorage.setItem(ACCENT_KEY, accent);
  }, [accent]);

  // 鈹€鈹€ Rotating headline word 鈹€鈹€
  const [wordIdx, setWordIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setWordIdx(i => (i + 1) % CYCLE_WORDS.length);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  // 鈹€鈹€ Google Translate injection 鈹€鈹€
  useEffect(() => {
    if (document.getElementById('gt-script')) return; // already injected
    window.googleTranslateElementInit = () => {
      // eslint-disable-next-line no-new
      new window.google.translate.TranslateElement(
        { pageLanguage: 'en', layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE },
        'google_translate_element'
      );
    };
    const s = document.createElement('script');
    s.id  = 'gt-script';
    s.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    s.async = true;
    document.body.appendChild(s);
  }, []);

  // Persist projects list
  useEffect(() => { writeProjects(projects); }, [projects]);

  const openProject = (project) => {
    onOpen({ ...project });
  };

  const createProject = (e) => {
    e.preventDefault();
    const id = Date.now();
    const project = { id, name: name.trim() || 'My Planner', start, end, tasks: [] };
    const next = [project, ...projects];
    setProjects(next);
    setShowCreate(false);
    setName('');
    openProject(project);
  };

  const removeProject = (id) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setDeleteConfirm(null);
  };

  const importFile = (ev) => {
    const file = ev.target.files && ev.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        const id = Date.now();
        const project = {
          id,
          name: `Imported — ${new Date().toLocaleDateString()}`,
          start,
          end,
          tasks: Array.isArray(parsed) ? parsed : [],
        };
        const next = [project, ...projects];
        setProjects(next);
        openProject(project);
      } catch {
        alert('Invalid JSON file — please choose a valid planner export.');
      }
    };
    reader.readAsText(file);
    ev.target.value = '';
  };

  const formatRange = (s, e) => {
    const fmt = (d) => new Date(`${d}T00:00:00`).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    return `${fmt(s)} \u2192 ${fmt(e)}`;
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${isDark ? 'bg-[#0b0f1a] text-white' : 'bg-slate-100 text-slate-900'}`}>

      {/* 鈹€鈹€ NAV 鈹€鈹€ */}
      <nav className={`fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur border-b transition-colors duration-300 ${isDark ? 'bg-[#0b0f1a]/85 border-white/5' : 'bg-white/85 border-slate-200'}`}>
        {/* Left: logo + title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1a1a2e] flex items-center justify-center shrink-0 overflow-hidden">
            <img src="/gantt-planner-logo.svg" alt="logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-bold text-xl tracking-tight">Louis Wang's Year Planner</span>
        </div>

        {/* Right: Google Translate + colour dots + theme toggle + action buttons */}
        <div className="flex items-center gap-3 flex-wrap justify-end">

          {/* Google Translate */}
          <div id="google_translate_element" className="shrink-0" />

          {/* Accent colour picker */}
          <div className="flex items-center gap-1.5">
            {ACCENTS.map(a => (
              <button
                key={a.id}
                title={a.label}
                onClick={() => setAccent(a.id)}
                style={{ backgroundColor: a.dot, outline: accent === a.id ? `3px solid ${a.dot}` : 'none', outlineOffset: '2px' }}
                className="w-5 h-5 rounded-full transition opacity-75 hover:opacity-100"
              />
            ))}
          </div>

          {/* Dark / Light toggle */}
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className={`w-9 h-9 flex items-center justify-center rounded-lg text-lg transition ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-200'}`}
          >
            {isDark ? '☀️' : '🌙'}
          </button>

          {/* Import */}
          <label className={`px-4 py-2 rounded-lg text-base font-medium border cursor-pointer transition ${isDark ? 'border-white/20 hover:bg-white/10' : 'border-slate-300 hover:bg-slate-200'}`}>
            <input ref={importRef} type="file" accept=".json" onChange={importFile} className="hidden" />
            Import JSON
          </label>

          {/* New Planner */}
          <button
            onClick={() => setShowCreate(true)}
            style={{ backgroundColor: accentCfg.btnBg }}
            className="px-4 py-2 rounded-lg text-base font-semibold text-white transition hover:opacity-90"
          >
            + New Planner
          </button>
        </div>
      </nav>


      {/* 鈹€鈹€ HERO 鈹€鈹€ */}
      <section className={`relative flex flex-col items-center justify-center text-center pt-32 pb-24 px-6 overflow-hidden ${isDark ? '' : 'bg-gradient-to-b from-white to-slate-100'}`}>
        {/* glow blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[100px] pointer-events-none -z-10" style={{ backgroundColor: accentCfg.glow }} />
        <div className="absolute top-20 left-1/4 w-[250px] h-[250px] rounded-full blur-[80px] pointer-events-none opacity-40 -z-10" style={{ backgroundColor: accentCfg.glow }} />

        <span className={`inline-block mb-4 px-3 py-1 rounded-full text-xs font-semibold border tracking-widest uppercase ${isDark ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-blue-100 text-blue-600 border-blue-300'}`}>
          Visual Planning Tool
        </span>

        {/* Animated headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-tight mb-6 text-center w-full">
          {/* Line 1: "Plan your entire [rotating word]" — word in fixed-width box so "Plan your entire" never shifts */}
          <span style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', overflow: 'visible', whiteSpace: 'nowrap' }}>
            <span
              className="hero-gradient-text text-transparent"
              style={{ backgroundImage: `linear-gradient(135deg, ${accentCfg.from}, ${accentCfg.via}, ${accentCfg.to})`, marginRight: '0.25em' }}
            >
              Plan your entire
            </span>
            {/* Fixed-width slot sized to longest word ("projects") so static text never moves */}
            <span style={{ display: 'inline-block', width: '3.8em', overflow: 'visible', textAlign: 'left' }}>
              <span
                key={wordIdx}
                className="word-cycle hero-gradient-text text-transparent"
                style={{ backgroundImage: `linear-gradient(135deg, ${accentCfg.from}, ${accentCfg.via}, ${accentCfg.to})` }}
              >
                {CYCLE_WORDS[wordIdx]}
              </span>
            </span>
          </span>
          {/* Line 2: "at a glance" */}
          <span
            className="hero-gradient-text text-transparent block text-center"
            style={{ backgroundImage: `linear-gradient(135deg, ${accentCfg.from}, ${accentCfg.via}, ${accentCfg.to})` }}
          >
            at a glance
          </span>
        </h1>

        <p className={`text-lg max-w-xl mb-10 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          A fast, visual Gantt chart planner. Create tasks, drag them across a timeline, and keep every project on track — no sign-up required.
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <button
            onClick={() => setShowCreate(true)}
            style={{ backgroundColor: accentCfg.btnBg }}
            className="px-7 py-3 rounded-xl text-base font-semibold text-white shadow-lg transition hover:opacity-90"
          >
            Create your first planner &rarr;
          </button>
          {projects.length > 0 && (
            <a href="#planners" className={`px-7 py-3 rounded-xl text-base font-semibold border transition ${isDark ? 'border-white/20 hover:bg-white/10' : 'border-slate-300 hover:bg-slate-200'}`}>
              View my planners
            </a>
          )}
        </div>
      </section>

      {/* 鈹€鈹€ FEATURES 鈹€鈹€ */}
      <section className={`py-20 px-6 ${isDark ? 'bg-[#0e1220]' : 'bg-slate-200/60'}`}>
        <div className="max-w-5xl mx-auto">
          <p className={`text-center text-xs tracking-widest font-semibold uppercase mb-3 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Features</p>
          <h2 className="text-center text-3xl font-bold mb-12">Everything you need, nothing you don't</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className={`rounded-2xl border p-6 transition ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'}`}>
                <div className="text-3xl mb-3">{f.icon}</div>
                <div className="font-semibold mb-1">{f.title}</div>
                <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 鈹€鈹€ YOUR PLANNERS 鈹€鈹€ */}
      <section id="planners" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className={`text-xs tracking-widest font-semibold uppercase mb-1 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Your workspace</p>
              <h2 className="text-3xl font-bold">Your Planners</h2>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              style={{ backgroundColor: accentCfg.btnBg }}
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition hover:opacity-90"
            >
              + New Planner
            </button>
          </div>

          {projects.length === 0 ? (
            <div className={`flex flex-col items-center justify-center text-center py-20 rounded-2xl border border-dashed ${isDark ? 'border-white/15' : 'border-slate-300'}`}>
              <div className="text-5xl mb-4">📅</div>
              <div className="text-lg font-semibold mb-2">No planners yet</div>
              <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Create your first planner or import a JSON export.</p>
              <button
                onClick={() => setShowCreate(true)}
                style={{ backgroundColor: accentCfg.btnBg }}
                className="px-6 py-2 rounded-xl text-sm font-semibold text-white transition hover:opacity-90"
              >
                Create Planner
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.map((p) => (
                <div key={p.id}
                  className={`group relative flex flex-col rounded-2xl border overflow-hidden transition cursor-pointer ${isDark ? 'bg-white/5 border-white/10 hover:border-blue-500/50 hover:bg-white/10' : 'bg-white border-slate-200 hover:border-blue-400 shadow-sm hover:shadow-md'}`}
                  onClick={() => openProject(p)}>
                  {/* mini timeline bar preview */}
                  <div
                    className="h-2 w-full"
                    style={{ backgroundImage: `linear-gradient(to right, ${accentCfg.from}, ${accentCfg.via}, ${accentCfg.to})` }}
                  />
                  <div className="flex-1 p-5">
                    <div className="font-semibold text-base mb-1 truncate">{p.name}</div>
                    <div className={`text-xs mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{formatRange(p.start, p.end)}</div>
                    <div className="flex items-center gap-2 text-xs">
                      <span
                        style={{ backgroundColor: `${accentCfg.btnBg}20`, color: accentCfg.btnHover }}
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                      >
                        {(p.tasks || []).length} task{(p.tasks || []).length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <div className={`flex border-t ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
                    <button onClick={(e) => { e.stopPropagation(); openProject(p); }}
                      style={{ color: accentCfg.btnBg }}
                      className={`flex-1 py-3 text-sm font-medium transition ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-50'}`}>
                      Open &rarr;
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(p.id); }}
                      className={`px-4 py-3 text-sm text-red-400 hover:bg-red-600/10 transition border-l ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 鈹€鈹€ HOW IT WORKS 鈹€鈹€ */}
      <section className={`py-20 px-6 ${isDark ? 'bg-[#0e1220]' : 'bg-slate-200/60'}`}>
        <div className="max-w-3xl mx-auto">
          <p className={`text-center text-xs tracking-widest font-semibold uppercase mb-3 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>How it works</p>
          <h2 className="text-center text-3xl font-bold mb-12">Up and running in minutes</h2>
          <div className="space-y-6">
            {STEPS.map((s) => (
              <div key={s.n} className={`flex items-start gap-5 rounded-2xl border p-6 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                <span className="text-2xl font-black shrink-0" style={{ color: accentCfg.btnBg }}>{s.n}</span>
                <div>
                  <div className="font-semibold mb-1">{s.title}</div>
                  <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 鈹€鈹€ FOOTER 鈹€鈹€ */}
      <footer className={`py-8 px-6 border-t text-center text-xs ${isDark ? 'border-white/10 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
        Louis Wang's Year Planner 鈥?Built with React &amp; Tailwind CSS
      </footer>

      {/* 鈹€鈹€ CREATE MODAL 鈹€鈹€ */}
      {showCreate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className={`w-full max-w-md border rounded-2xl p-7 shadow-2xl ${isDark ? 'bg-[#131929] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <h3 className="text-xl font-bold mb-5">Create a new planner</h3>
            <form onSubmit={createProject} className="space-y-4">
              <div>
                <label className={`block text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Planner name</label>
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. 2026 Road Map"
                  className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 ${isDark ? 'bg-white/10 border-white/15 focus:ring-blue-500 placeholder-slate-500' : 'bg-slate-50 border-slate-300 focus:ring-blue-400 placeholder-slate-400'}`}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Start date</label>
                  <input type="date" value={start} onChange={(e) => setStart(e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 ${isDark ? 'bg-white/10 border-white/15 focus:ring-blue-500' : 'bg-slate-50 border-slate-300 focus:ring-blue-400'}`} />
                </div>
                <div>
                  <label className={`block text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>End date</label>
                  <input type="date" value={end} onChange={(e) => setEnd(e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 ${isDark ? 'bg-white/10 border-white/15 focus:ring-blue-500' : 'bg-slate-50 border-slate-300 focus:ring-blue-400'}`} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  style={{ backgroundColor: accentCfg.btnBg }}
                  className="flex-1 py-2.5 text-white rounded-xl font-semibold text-sm transition hover:opacity-90"
                >
                  Create Planner
                </button>
                <button type="button" onClick={() => setShowCreate(false)} className={`flex-1 py-2.5 border rounded-xl text-sm transition ${isDark ? 'border-white/20 hover:bg-white/10' : 'border-slate-300 hover:bg-slate-100'}`}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 鈹€鈹€ DELETE CONFIRM MODAL 鈹€鈹€ */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className={`w-full max-w-sm border rounded-2xl p-6 shadow-2xl ${isDark ? 'bg-[#131929] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <h3 className="text-lg font-bold mb-2">Delete planner?</h3>
            <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              This will permanently delete "<span className={isDark ? 'text-white font-medium' : 'text-slate-900 font-medium'}>{projects.find(p => p.id === deleteConfirm)?.name}</span>" and all its tasks. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => removeProject(deleteConfirm)} className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold text-sm transition">
                Delete
              </button>
              <button onClick={() => setDeleteConfirm(null)} className={`flex-1 py-2.5 border rounded-xl text-sm transition ${isDark ? 'border-white/20 hover:bg-white/10' : 'border-slate-300 hover:bg-slate-100'}`}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

