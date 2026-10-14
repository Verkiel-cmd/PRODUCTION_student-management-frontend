import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../Auth_section/config';
import '../Webstyles/login_style.css';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = config.API_URL;

const InviteAdmin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const rules = useMemo(() => ({
    length: form.password.length >= 8,
    upper: /[A-Z]/.test(form.password),
    lower: /[a-z]/.test(form.password),
    number: /[0-9]/.test(form.password),
    symbol: /[^A-Za-z0-9]/.test(form.password)
  }), [form.password]);

  const strength = useMemo(() => {
    if (!form.password) return { percent: 0, label: 'Strength: —', color: '#444' };
    let score = 0;
    if (rules.length) score++;
    if (form.password.length >= 12) score++;
    if (form.password.length >= 16) score++;
    if (rules.upper) score++;
    if (rules.lower) score++;
    if (rules.number) score++;
    if (rules.symbol) score++;
    if (score <= 2) return { percent: 33, label: 'Weak', color: '#e03131' };
    if (score <= 5) return { percent: 66, label: 'Medium', color: '#f59f00' };
    return { percent: 100, label: 'Strong', color: '#37b24d' };
  }, [form.password, rules]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.username.trim()) newErrors.username = 'Username required';
    if (!form.email.trim()) newErrors.email = 'Email required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Invalid email';
    if (!form.password) newErrors.password = 'Password required';
    else if (form.password.length < 8) newErrors.password = 'Min 8 characters';
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords must match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    setSuccess('');
    
    try {
      const res = await axios.post('/admin/invite', {
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password
      });
      
      if (res.data.success) {
        setSuccess(`Admin "${res.data.admin.username}" created! They can now log in.`);
        setForm({ username: '', email: '', password: '', confirmPassword: '' });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to invite admin';
      setErrors({ submit: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="log-reg-box" style={{ maxWidth: '480px', margin: '60px auto' }}>
      <div className="form-box register" style={{ opacity: 1, transform: 'none', pointerEvents: 'auto' }}>
        <form onSubmit={handleSubmit}>
          <h2>Invite New Admin</h2>
          
          {success && (
            <div style={{color:'green',marginBottom:'16px',padding:'10px',background:'#e8f5e9',borderRadius:'8px',border:'1px solid #4caf50'}}>
              {success}
            </div>
          )}
          
          {errors.submit && (
            <div style={{color:'red',marginBottom:'16px',padding:'10px',background:'#fdeaea',borderRadius:'8px',border:'1px solid #e53935'}}>
              {errors.submit}
            </div>
          )}

          <div className="input-box">
            <span className="icon"><i className="bx bx-user-circle"></i></span>
            <input name="username" value={form.username} onChange={handleChange} placeholder="Username" required />
            {errors.username && <span style={{color:'red',fontSize:'12px',marginTop:'4px',display:'block'}}>{errors.username}</span>}
          </div>

          <div className="input-box">
            <span className="icon"><i className="bx bxs-envelope"></i></span>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" required />
            {errors.email && <span style={{color:'red',fontSize:'12px',marginTop:'4px',display:'block'}}>{errors.email}</span>}
          </div>

          <div className="input-box">
            <span className="icon"><i className="bx bx-lock-alt"></i></span>
            <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" required />
            {errors.password && <span style={{color:'red',fontSize:'12px',marginTop:'4px',display:'block'}}>{errors.password}</span>}
          </div>

          <div className="input-box">
            <span className="icon"><i className="bx bx-lock-alt"></i></span>
            <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="Confirm Password" required />
            {errors.confirmPassword && <span style={{color:'red',fontSize:'12px',marginTop:'4px',display:'block'}}>{errors.confirmPassword}</span>}
          </div>

          {form.password && (
            <div className="password-strength" style={{marginBottom:'16px'}}>
              <div className="strength-label" style={{color: strength.color}}>{strength.label}</div>
              <div className="strength-bar"><div className="strength-fill" style={{width:`${strength.percent}%`,backgroundColor:strength.color}}/></div>
              <ul className="requirement-list">
                {[
                  {key:'length',text:'8+ chars',met:rules.length},
                  {key:'upper',text:'Uppercase',met:rules.upper},
                  {key:'lower',text:'Lowercase',met:rules.lower},
                  {key:'number',text:'Number',met:rules.number},
                  {key:'symbol',text:'Symbol',met:rules.symbol}
                ].map(r => (
                  <li key={r.key} className={`requirement-item ${r.met?'met':''}`}>
                    <span className="requirement-check">{r.met?'✓':'○'}</span>{r.text}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button type="submit" className="btn" disabled={loading} style={{width:'100%'}}>
            {loading ? 'Inviting...' : 'Invite Admin'}
          </button>

          <p style={{textAlign:'center',marginTop:'16px',color:'#666'}}>
            <button type="button" onClick={() => navigate('/dashboard_section/Dashboard')} style={{background:'none',border:'none',color:'#007bff',cursor:'pointer'}}>
              ← Back to Dashboard
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default InviteAdmin;