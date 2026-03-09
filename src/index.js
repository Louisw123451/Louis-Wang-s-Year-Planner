import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import LandingPage from './LandingPage';

const PROJECTS_KEY = 'ganttProjects';

function readProjects() {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function saveUpdatedProject(updated) {
  try {
    const list = readProjects();
    const next = list.map((p) => (p.id === updated.id ? updated : p));
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(next));
  } catch (e) { /* ignore */ }
}

function Root() {
  const [activeProject, setActiveProject] = useState(null);

  if (activeProject) {
    return (
      <App
        project={activeProject}
        onExit={() => setActiveProject(null)}
        onProjectUpdate={(updated) => {
          saveUpdatedProject(updated);
          setActiveProject(null);
        }}
      />
    );
  }

  return <LandingPage onOpen={(project) => setActiveProject(project)} />;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
