import { Link, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import '../Webstyles/main_side.css';

function Settings() {

    const navigate = useNavigate();

    const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkModeState") === "enabled");
    //const [showSettings, setShowSettings] = useState(false);
    //const toggleSettings = () => setShowSettings(!showSettings);

    // Toggle function
    const toggleDark = () => {
    setDarkMode((prev) => {
        const next = !prev;
        localStorage.setItem("darkModeState", next ? "enabled" : "disabled");
        document.body.classList.toggle("dark-mode-body", next);
        document.body.classList.toggle("dark-mode", next);
        return next;
    });
    };


useEffect(() => {
  document.documentElement.classList.toggle("dark-mode", darkMode);
  document.body.classList.toggle("dark-mode", darkMode);
}, [darkMode]);

return (
 <div className="settings-page">
      {/* Close button — top right, always visible */}
      <button
        className="settings-close-btn"
        onClick={() => navigate('/Student_lists/ListStud')}
        aria-label="Close settings"
      >
        ✕
      </button>

      <h1 className="settings-heading">Settings</h1>

      <section className="settings-section">
        <h3 className="settings-section-title">Appearance Settings</h3>

        {/* Row: status label on the left, toggle switch right next to it */}
        <div className="settings-row">
          <p className="settings-label">
            {darkMode ? 'Dark Mode Enabled 🌙' : 'Light Mode Enabled ☀️'}
          </p>

          <label className="switch">
            <input
              type="checkbox"
              checked={darkMode}
              onChange={toggleDark}
            />
            <span className="slider"></span>
          </label>
        </div>
      </section>
    </div>
  );
}

export default Settings;

