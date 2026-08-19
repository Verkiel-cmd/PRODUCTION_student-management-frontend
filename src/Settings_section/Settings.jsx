import { Link, useNavigate } from 'react-router-dom';
import React, { useEffect, useState, useRef } from 'react';
import '../Webstyles/main_side.css';
import config from '../Auth_section/config';
import usePullToRefresh from '../Hooks/Refreshpull';

function Settings() {

    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkModeState") === "enabled");

    const [preview, setPreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [picMsg, setPicMsg] = useState({ text: '', type: '' });
    const [uploading, setUploading] = useState(false);

    //UPDATES REAL TIME USERNAME
    const [username, setUsername] = useState('');
    const [userMsg, setUserMsg] = useState({ text: '', type: '' });
    const [savingUsername, setSavingUsername] = useState(false);


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

    const handleUsernameSubmit = async (e) => {
      e.preventDefault();
      setSavingUsername(true);
      setUserMsg({ text: '', type: '' });
      try {
          const res = await fetch(`${config.API_URL}/update-username`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ username })
          });
          const data = await res.json();
          if (data.success) {
              setUserMsg({ text: data.message, type: 'green' });

              //UPDATE USERS USERNAME
              const stored = JSON.parse(localStorage.getItem('user') || '{}');
              stored.username = username;
              localStorage.setItem('user', JSON.stringify(stored));
          } else {
              setUserMsg({ text: data.message, type: 'red' });
          }
      } catch {
          setUserMsg({ text: 'Server error. Try again.', type: 'red' });
      } finally {
          setSavingUsername(false);
      }
  };


    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate allowed MIME types
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            setPicMsg({ text: 'Only JPEG, PNG, or WEBP allowed.', type: 'red' });
            return;
        }
        // Validate max size (3 MB)
        if (file.size > 3 * 1024 * 1024) {
            setPicMsg({ text: 'Image must be under 3MB.', type: 'red' });
            return;
        }

        setSelectedFile(file);
        setPreview(URL.createObjectURL(file)); // Blob URL for instant preview
        setPicMsg({ text: '', type: '' });
    };

    const handleUploadPicture = async () => {
        if (!selectedFile) return;
        setUploading(true);
        setPicMsg({ text: '', type: '' });

        // --- Replace this setTimeout with your actual API call ---
        //setTimeout(() => {
            //setUploading(false);
            //setSelectedFile(null);
            //setPicMsg({ text: 'Profile picture updated.', type: 'green' });
        //}, 700);
    //};

        try {
            const formData = new FormData();
            formData.append('profilePicture', selectedFile);
            const res = await fetch(`${config.API_URL}/upload-profile-picture`, {
                method: 'POST',
                credentials: 'include',
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                setPreview(data.pictureUrl);
                setSelectedFile(null);
                setPicMsg({ text: data.message, type: 'green' });

                //UPDATE USERS PHOTO
                const stored = JSON.parse(localStorage.getItem('user') || '{}');
                stored.username = username;
                localStorage.setItem('user', JSON.stringify(stored));
            } else {
                setPicMsg({ text: data.message, type: 'red' });
            }
        } catch {
            setPicMsg({ text: 'Upload failed. Try again.', type: 'red' });
        } finally {
            setUploading(false);
        }
    };

    useEffect(() => {
        fetch(`${config.API_URL}/api/user-details`, {
            credentials: 'include'
        })
        .then(res => res.json())
        .then(data => {
            if (data.success && data.user.username) setUsername(data.user.username);
            if (data.success && data.user.profile_picture) setPreview(data.user.profile_picture);
        })
        .catch(() => {});
    }, []);


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












            {/* SECTION FOR PROFILE SETTINGS */}
            <section className="settings-section">
                <h3 className="settings-section-title">Profile Settings</h3>

                <div className="settings-profile-area">
                    <div
                        className="settings-avatar-wrapper"
                        onClick={() => fileInputRef.current.click()}
                    >
                        {preview ? (
                            <img src={preview} alt="Profile" className="settings-avatar-img" />
                        ) : (
                            <span className="settings-avatar-placeholder">No photo</span>
                        )}
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                    />

                    <button
                        className="settings-btn-text"
                        onClick={() => fileInputRef.current.click()}
                    >
                        Change photo
                    </button>

                    {selectedFile && (
                        <button
                            className="settings-btn settings-btn-primary"
                            onClick={handleUploadPicture}
                            disabled={uploading}
                        >
                            {uploading ? 'Uploading...' : 'Save photo'}
                        </button>
                    )}

                    {picMsg.text && (
                        <p className={`settings-msg settings-msg-${picMsg.type}`}>
                            {picMsg.text}
                        </p>
                    )}
                </div>

                <form onSubmit={handleUsernameSubmit} className="settings-form-group">
                    <label className="settings-label" htmlFor="username-input">
                        Username
                    </label>
                    <input
                        id="username-input"
                        type="text"
                        className="settings-input"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        minLength={3}
                        required
                    />
                    <button
                        type="submit"
                        className="settings-btn settings-btn-primary"
                        disabled={savingUsername}
                    >
                        {savingUsername ? 'Saving...' : 'Save username'}
                    </button>

                    {userMsg.text && (
                        <p className="settings-msg settings-msg-green">{userMsg.text}</p>
                    )}
                </form>
            </section>













            {/* SECTION FOR APPEARANCE DARK/MODE SETTINGS */}
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

