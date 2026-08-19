import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import googleIcon from '../assets/google-icon.svg';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../Webstyles/login_style.css';
import config from './config';
import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.baseURL = config.API_URL;

const Frontlog = () => {

      
    // Add state variables for login form
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [success, setSuccessMessage] = useState('');
    const [isEmailFocused, setIsEmailFocused] = useState(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [EmailerrorType, setEmailErrorType] = useState(null);
    const [emailErrorMessageLogin, setemailErrorMessageLogin] = useState('');
    const [googleErrorMessage, setgoogleErrorMessage] = useState('');
    const [PassworderrorType, setPasswordErrorType] = useState(null);
    const [passwordErrorMessageLogin, setpasswordErrorMessageLogin] = useState('');
    //Network problem message at the very bottom
    const [networkErrorMessageLogin, setnetworkErrorMessageLogin] = useState(null);
    // ============================================================================
    const [isLoading, setIsLoading] = useState(false);
    const [GoogleLoading, setIsGoogleLoading] = useState(false);
    const [, setLoggedInUser] = useState(null);

    // Add state variables for registration form
    const [isUsernameFocusedRegister, setIsUsernameFocusedRegister] = useState(false);
    // ===============================================================================
    const [isEmailFocusedRegister, setIsEmailFocusedRegister] = useState(false);
    const [isPasswordFocusedRegister, setIsPasswordFocusedRegister] = useState(false);
    const [isPasswordVisibleRegister, setIsPasswordVisibleRegister] = useState(false);
    const [emailRegister, setEmailRegister] = useState('');

    // Add state variables for "valid email"
    const [successRegister, setSuccessRegister] = useState('');
    // ========================================================
    const [passwordRegister, setPasswordRegister] = useState('');
    const [errorRegister, setErrorRegister] = useState('');
    //Network problem message at the very bottom - register
    const [NetworkerrorRegister, setNetworkErrorRegister] = useState(null);
    // ====================================================================
    const [RegistererrorType, setRegisterErrorType] = useState(null);
    const [username, setUsername] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [usernameError, setUsernameError] = useState(false);
    const [usernameErrortype, setUsernameErrorType] = useState(false);
    const [lastUsedEmail, setLastUsedEmail] = useState(null);

    const navigate = useNavigate();

    const toggleForm = () => {
        const logregBox = document.querySelector('.log-reg-box');
        logregBox.classList.toggle('active');
    };

    // `toggleDropdown` was unused and removed to satisfy lint rules

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };
    const togglePasswordVisibilityRegister = () => {
        setIsPasswordVisibleRegister(!isPasswordVisibleRegister);
    };
    const handleRememberMeChange = (event) => {
        setRememberMe(event.target.checked);
        if (event.target.checked) {
            localStorage.setItem('rememberMe', 'true');
        } else {
            localStorage.removeItem('rememberMe');
        }
    };

    const handleEmailRegisterChange = (e) => {
        const value = e.target.value;
        setEmailRegister(value);

        if (!value.trim()) {
            setErrorRegister('');
            setSuccessRegister('');
            setRegisterErrorType(null);
            return;
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (emailRegex.test(value)) {
            setSuccessRegister('Valid email');
            setErrorRegister('');
            setRegisterErrorType(null);
        } else {
            setErrorRegister('Invalid email');
            setSuccessRegister('');
            setRegisterErrorType('email');
        }
    };

      const handleRegisterSubmit = (event) => {
        event.preventDefault();

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!emailRegex.test(emailRegister)) {
            setRegisterErrorType("email");
            setErrorRegister("Please enter a valid email address.");
            return;
        }
        
        setIsLoading(true);

        axios.post(`${config.API_URL}/register`, {
            username: username,
            email: emailRegister,
            password: passwordRegister,
            agreedToTerms: agreedToTerms
        }, { withCredentials: true })
            .then(response => {
                console.log('Registration success:', response.data);
               if (response.data.success) {
    // Set user state and localStorage from backend response
    const userData = {
        id: response.data.userId,
        username: response.data.username,
        email: response.data.email
    };
    setLoggedInUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));

    setRegisterErrorType(null);
    setSuccessMessage('User registered successfully! \nRedirecting...');
    setTimeout(() => {
        navigate('/Student_lists/ListStud', { replace: true });
    }, 2000);
}
            })
            .catch(error => {
                if (error.response) {
                    console.error('Registration error:', error.response.data);
                    const message = error.response.data.message || 'Something went wrong during registration';
                    //setNetworkErrorRegister(error.response.data.message || 'Something went wrong \nduring registration');
                if(message.toLowerCase().includes('email')) { //"includes - correct" - "include - wrong"
                    setRegisterErrorType('email');
                    setErrorRegister(message);
                    setSuccessRegister(''); //clears "Valid email" message
                }else{
                    setNetworkErrorRegister(message);
                }
                } else {
                    console.error('Network error:', error);
                    setNetworkErrorRegister('Network error');
                }
            }).finally(() => {
                setIsLoading(false);
            });
    };

    //FUNCTION PASSWORD METER CHECKER
    const rules = useMemo(() => ({
        length: passwordRegister.length >= 8,
        upper: /[A-Z]/.test(passwordRegister),
        lower: /[a-z]/.test(passwordRegister),
        number: /[0-9]/.test(passwordRegister),
        symbol: /[^A-Za-z0-9]/.test(passwordRegister)
    }), [passwordRegister]);

    //const allMet = useMemo(() => Object.values(rules).every(Boolean), [rules]);

    const strength = useMemo(() => {
        if (passwordRegister.length === 0) {
        return { percent: 0, label: 'Strength: —', color: '#444' };
        }

        let score = 0;
        if (rules.length) score++;
        if (passwordRegister.length >= 12) score++;
        if (passwordRegister.length >= 16) score++;
        if (rules.upper) score++;
        if (rules.lower) score++;
        if (rules.number) score++;
        if (rules.symbol) score++;

        if (score <= 2) return { percent: 33, label: 'Strength: Weak', color: '#e03131' };
        if (score <= 5) return { percent: 66, label: 'Strength: Medium', color: '#f59f00' };
        return { percent: 100, label: 'Strength: Strong', color: '#37b24d' };
    }, [passwordRegister, rules]);

    const requirements = [
        { key: 'length', text: 'At least 8 characters' },
        { key: 'upper', text: 'One uppercase letter (A-Z)' },
        { key: 'lower', text: 'One lowercase letter (a-z)' },
        { key: 'number', text: 'One number (0-9)' },
        { key: 'symbol', text: 'One special character (!@#$)' }
    ];

    const handleLoginSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        
        setEmailErrorType(null);
        setemailErrorMessageLogin('');
        setpasswordErrorMessageLogin('');
        setnetworkErrorMessageLogin('');
        setPasswordErrorType(null);

        try {
            console.log('Attempting login with:', { email });
            const response = await axios.post(`${config.API_URL}/login`, {
                email: email,
                password: password
                }, { withCredentials: true });
           

            console.log('Login response:', response.data);
            if (response.data.success) {
                // Create user object from response data
                const userData = {
                    id: response.data.userId,
                    username: response.data.username,
                    email: email
                };
                localStorage.setItem('user', JSON.stringify(userData));
                setLoggedInUser(userData);
                navigate('/Student_lists/ListStud', { replace: true });
            } else {
                setEmailErrorType('email');
                setPasswordErrorType('password');
                setemailErrorMessageLogin('Invalid credentials');
                setpasswordErrorMessageLogin('Invalid credentials');
            }
        } catch (error) {
            console.error('Login error:', error);
        
            if (!error.response) {
                setnetworkErrorMessageLogin('Network error \nPlease check your connection.');
            } else if (error.response.status === 400) {
                const { field, messageEmail, messagePassword } = error.response.data;
        
                if (field === 'email') {
                    setEmailErrorType('email');
                    setemailErrorMessageLogin(messageEmail || 'Invalid email');
                } else if (field === 'password') {
                    setPasswordErrorType('password');
                    setpasswordErrorMessageLogin(messagePassword || 'Invalid password');
                } else {
                    // Fallback
                    setEmailErrorType('email');
                    setPasswordErrorType('password');
                    setemailErrorMessageLogin('Invalid email or password');
                    setpasswordErrorMessageLogin('Invalid email or password');
                }
            } else {
                setnetworkErrorMessageLogin('An unexpected error occurred\n Please try again later.');
               }
    } finally {
        setIsLoading(false);
    }
};

  

    const handleUsernameChange = async (e) => {
        const newUsername = e.target.value;
        setUsername(newUsername);

        if (!newUsername.trim()) {
            setUsernameError('Username cannot be empty');
            setUsernameErrorType('username');
            return;
        }

        try {
            const response = await axios.post(`${config.API_URL}/check-username`, { username: newUsername });

            if (response.data.exists) {
                setUsernameError('Username already taken');
                setUsernameErrorType('username');
            } else {
                setUsernameError('');
                setUsernameErrorType(null);
            }
       } catch (error) {
        setUsernameError('Error checking username');
        setUsernameErrorType('username');
        console.error('Error checking username:', error);
    }
};


    //GOOGLE SIGN IN SAVE SESSION DISPLAY LAST USED EMAIL
    useEffect(() => {
            const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                if (parsedUser?.email) {
                    setLastUsedEmail(parsedUser.email);
                }
            } catch (err) {
                console.error('Failed to parse stored user:', err);
            }
        }
    }, []);

    const handleGoogleSuccess = async (response) => {
        const token = response.credential;
        if (!token) {
            setgoogleErrorMessage('Google Sign-In failed  \nNo token received.');
            return;
        }

        setIsGoogleLoading(true);

        try {
           const res = await axios.post('https://student-management-backend-a2q4.onrender.com/google-login',
             { token }, { withCredentials: true });

            if (res.data.success) {
                // Extract user data directly from res.data
            const userData = {
                 id: res.data.userId,          
                 username: res.data.username,   
                 email: res.data.email,         
                 picture: res.data.picture 
            };
            localStorage.setItem('user', JSON.stringify(userData));
            setLoggedInUser(userData);
                // Use navigate for redirection
                navigate('/Student_lists/ListStud', { replace: true });
            } else {
                setgoogleErrorMessage('Google Sign-In failed  \nPlease try again.');
            }
        } catch (error) {
            console.error('Google login error:', error);
            setgoogleErrorMessage(error.response?.data?.message || 'Google Sign-In failed  \nPlease try again.');
        } finally {
            setIsGoogleLoading(false);
        }
    };

    const handleGoogleFailure = (error) => {
        console.error('Google Sign-In error:', error);
        setgoogleErrorMessage('Google Sign-In was unsuccessful  \nPlease try again.');
    };
    
   
    return (
        <GoogleOAuthProvider clientId={config.GOOGLE_CLIENT_ID}>
        <div>
            <header className="header">
                <nav className="navbar">
                    <a href="#">Home</a>
                    <a href="#">About</a>
                    <a href="#">Service</a>
                    <a href="#">Contact</a>
                </nav>
            </header>

            <div className="background"></div>

           
               

                <div className="log-reg-box">
                    <div className="form-box login">
                        <form onSubmit={handleLoginSubmit}>
                            <h2>Sign in</h2>



                            <div className={`input-box ${EmailerrorType === 'email' ? 'input-error' : ''}`}>
                                <span className="icon"><i className="bx bxs-envelope"></i></span>
                                <input
                                    type="email"
                                    value={email}
                                    onFocus={() => setIsEmailFocused(true)}
                                    onBlur={() => setIsEmailFocused(false)}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={EmailerrorType === 'email' ? 'error' : ''}
                                    required
                                />

                                <label className={email || isEmailFocused ? 'focused' : ''}>Email</label>
                            </div>

                            {/* Display error message */}
                            {emailErrorMessageLogin && (
                                <div style={{
                                    margin: '10px 0',
                                    marginBottom: '20px',
                                    marginTop: '-20px',
                                    padding: '10px 15px',
                                    textAlign: 'center',
                                    color: 'red',
                                    fontWeight: '500',
                                    backgroundColor: 'white',
                                    border: '1px solid red',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    whiteSpace: 'pre-line',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}>
                                    <i className='bx bx-error-circle' style={{ fontSize: '20px' }}></i> {/* Add an icon */}
                                    {emailErrorMessageLogin}
                                </div>
                            )}

                            <div className={`input-box ${PassworderrorType === 'password' ? 'input-error' : ''}`}>
                                <input
                                    type={isPasswordVisible ? 'text' : 'password'}
                                    value={password}
                                    onFocus={() => setIsPasswordFocused(true)}
                                    onBlur={() => setIsPasswordFocused(false)}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={PassworderrorType === 'password' ? 'error' : ''}
                                    required
                                />

                                <label className={password || isPasswordFocused ? 'focused' : ''}>Password</label>
                                <span className="password-toggle" onClick={togglePasswordVisibility}>
                                    <i className={`fa ${isPasswordVisible ? 'fa-eye-slash' : 'fa-eye'}`} />
                                </span>
                            </div>

                            {/* Display error message */}
                            {passwordErrorMessageLogin && (
                                <div style={{
                                    margin: '10px 0',
                                    marginBottom: '20px',
                                    marginTop: '-20px',
                                    padding: '10px 15px',
                                    textAlign: 'center',
                                    color: 'red',
                                    fontWeight: '500',
                                    whiteSpace: 'pre-line',
                                    backgroundColor: 'white',
                                    border: '1px solid red',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}>
                                    <i className='bx bx-error-circle' style={{ fontSize: '20px' }}></i> {/* Add an icon */}
                                    {passwordErrorMessageLogin}
                                </div>
                            )}

                            {/* Display error message */}
                            {networkErrorMessageLogin && (
                                <div style={{
                                    margin: '10px 0',
                                    marginBottom: '20px',
                                    marginTop: '-20px',
                                    padding: '10px 15px',
                                    textAlign: 'center',
                                    color: 'red',
                                    fontWeight: '500',
                                    whiteSpace: 'pre-line',
                                    backgroundColor: 'white',
                                    border: '1px solid red',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}>
                                    <i className='bx bx-error-circle' style={{ fontSize: '20px' }}></i> {/* Add an icon */}
                                    {networkErrorMessageLogin}
                                </div>
                            )}

                            {/* Display error message */}
                            {googleErrorMessage && (
                                <div style={{
                                    margin: '10px 0',
                                    marginBottom: '27px',
                                    marginTop: '-20px',
                                    padding: '10px 15px',
                                    textAlign: 'center',
                                    color: 'red',
                                    fontWeight: '500',
                                    backgroundColor: 'white',
                                    border: '1px solid red',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    whiteSpace: 'pre-line',
                                    justifyContent: 'center',
                                    gap: '4px'
                                }}>
                                    <i className='bx bx-error-circle' style={{ fontSize: '20px' }}></i> {/* Add an icon */}
                                    {googleErrorMessage}
                                </div>
                            )}
                            <div className="google-login">
                            <div style={{ display: 'none' }}>
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={handleGoogleFailure}
                                />
                            </div>

                            <button
                                type="button"
                                className="google-login-button"
                                onClick={() => {
                                    const hiddenButton = document.querySelector(
                                        '.google-login div[style*="display: none"] div[role="button"]'
                                    );
                                    if (hiddenButton) hiddenButton.click();
                                }}
                                disabled={GoogleLoading}
                            >
                            {GoogleLoading ? (
                                
                                <span className="google-icon loader" aria-hidden="true"/>
                                ):(
                                <img src={googleIcon} alt="" className="google-icon" />
                                )}
                                <span>Sign in with Google</span>
                                {lastUsedEmail && (
                                    <span className="last-used-account">Last used</span>
                                )}
                            </button>
                        </div>




                            <div className="remember-forgot" style={{ paddingTop: '30px' }}>
                                <label>
                                    <input type="checkbox"
                                        checked={rememberMe}
                                        onChange={handleRememberMeChange}
                                    />
                                    Remember me
                                </label>
                                <a href="/auth_section/Forgotpassword">Forgot Password?</a>
                            </div>
                              <button
                                type="submit"
                                className="btn"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                    <span className="loader"></span>
                                    </>
                                
                            ):(
                                'Sign In'
                            )}
                            </button>

                            <div className="login_register">
                                <p>Don't have an account? <a href="#" className="register-link" onClick={toggleForm}>Sign Up</a>
                                </p>
                            </div>
                        </form>
                    </div>


















                    {/* CUT */}














                    <div className="form-box register">
                        <form onSubmit={handleRegisterSubmit}>



                            <h2>Sign Up</h2>

                            {/* Display success message */}
                            {success && (
                                <div style={{
                                    margin: '30px 0',
                                    marginBottom: '10px',
                                    padding: '10px 15px',
                                    textAlign: 'center',
                                    color: 'green',
                                    fontWeight: '500',
                                    backgroundColor: 'white',
                                    border: '1px solid green',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    width: '100%',
                                    maxWidth: '20rem',
                                    boxSizing: 'border-box'
                                }}>
                                    <i className='bx bx-check-circle' style={{ fontSize: '20px' }}></i> {/* Success icon */}
                                    {success}
                                </div>
                            )}

                            <div className={`input-box ${usernameErrortype === 'username' ? 'input-error' : ''}`}>
                                <span className="icon"><i className="bx bx-user-circle"></i></span>
                                <input
                                    type="text"
                                    value={username}
                                    onFocus={() => setIsUsernameFocusedRegister(true)}
                                    onBlur={() => setIsUsernameFocusedRegister(false)}
                                    onChange={handleUsernameChange}
                                    required
                                />
                                <label className={username || isUsernameFocusedRegister ? 'focused' : ''}>Username</label>
                            </div>

                            {/* Display error message if username is invalid */}
                            {usernameError && (
                                <div style={{
                                    margin: '10px 0',
                                    marginBottom: '10px',
                                    marginTop: '-20px',
                                    padding: '10px 15px',
                                    textAlign: 'center',
                                    color: 'red',
                                    fontWeight: '500',
                                    backgroundColor: 'white',
                                    border: '1px solid red',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}>
                                    <i className='bx bx-error-circle' style={{ fontSize: '20px' }}></i>
                                    {usernameError}
                                </div>
                            )}

                            {/* Display success message if email is valid */}
                            <div className={`input-box ${RegistererrorType === 'email' ? 'input-error' : ''} ${successRegister ? 'input-valid' : ''}`}>
                                <span className="icon"><i className="bx bxs-envelope"></i></span>
                                <input
                                    type="email"
                                    value={emailRegister}
                                    onFocus={() => setIsEmailFocusedRegister(true)}
                                    onBlur={() => setIsEmailFocusedRegister(false)}
                                    onChange={handleEmailRegisterChange}
                                    required
                                />
                                <label className={emailRegister || isEmailFocusedRegister ? 'focused' : ''}>Email</label>
                            </div>

                            {/* Display success message if email is valid */}
                            {successRegister && (
                                <div style={{
                                    margin: '10px 0', 
                                    marginBottom: '10px', 
                                    marginTop: '-20px',
                                    padding: '10px 15px', 
                                    textAlign: 'center', 
                                    color: 'green',
                                    fontWeight: '500', 
                                    backgroundColor: 'white',
                                    border: '1px solid green', borderRadius: '8px',
                                    display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', gap: '8px'
                                }}>
                                    <i className='bx bx-check-circle' style={{ fontSize: '20px' }}></i>
                                    {successRegister}
                                </div>
                            )}

                            {/* Display error message if email is invalid */}
                            {errorRegister && (
                                <div style={{
                                    margin: '10px 0',
                                    marginBottom: '10px',
                                    marginTop: '-20px',
                                    padding: '10px 15px',
                                    textAlign: 'center',
                                    color: 'red',
                                    fontWeight: '500',
                                    backgroundColor: 'white',
                                    border: '1px solid red',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}>
                                    <i className='bx bx-error-circle' style={{ fontSize: '20px' }}></i>
                                    {errorRegister}
                                </div>
                            )}

                            <div className={`input-box ${RegistererrorType === 'password' ? 'input-error' : ''}`}>
                                <input
                                    type={isPasswordVisibleRegister ? 'text' : 'password'}
                                    value={passwordRegister}
                                    onFocus={() => setIsPasswordFocusedRegister(true)}
                                    onBlur={() => setIsPasswordFocusedRegister(false)}
                                    onChange={(e) => setPasswordRegister(e.target.value)}
                                    required
                                />
                                <label className={passwordRegister || isPasswordFocusedRegister ? 'focused' : ''}>Password</label>
                                <span className="password-toggle" onClick={togglePasswordVisibilityRegister}>
                                    <i className={`fa ${isPasswordVisibleRegister ? 'fa-eye-slash' : 'fa-eye'}`} />
                                </span>
                            </div>

                            {/*<div class="strength-label" id="strengthLabel">Strength: —</div>

                                *<ul class="requirement-list" id="requirementList">
                                    <li class="requirement-item" data-rule="length">
                                    <span class="requirement-check">✓</span>At least 8 characters
                                    </li>
                                    <li class="requirement-item" data-rule="upper">
                                    <span class="requirement-check">✓</span>One uppercase letter (A-Z)
                                    </li>
                                    <li class="requirement-item" data-rule="lower">
                                    <span class="requirement-check">✓</span>One lowercase letter (a-z)
                                    </li>
                                    <li class="requirement-item" data-rule="number">
                                    <span class="requirement-check">✓</span>One number (0-9)
                                    </li>
                                    <li class="requirement-item" data-rule="symbol">
                                    <span class="requirement-check">✓</span>One special character (!@#$)
                                    </li>
                                </ul> */}

                                {/*MODERN PASSWORD CHECKER*/}
                                {passwordRegister.length > 0 && (
                                <div className="password-strength">
                                    <div className="strength-label" style={{ color: strength.color }}>
                                        {strength.label}
                                    </div>
                                    <div className="strength-bar">
                                        <div
                                            className="strength-fill"
                                            style={{
                                                width: `${strength.percent}%`,
                                                backgroundColor: strength.color
                                            }}
                                        />
                                    </div>
                                    <ul className="requirement-list">
                                        {requirements.map(({ key, text }) => (
                                            <li
                                                key={key}
                                                className={`requirement-item ${rules[key] ? 'met' : ''}`}
                                            >
                                                <span className="requirement-check">
                                                    {rules[key] ? '✓' : '○'}
                                                </span>
                                                {text}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}


                            {/* Display error message if email is invalid */}
                            {NetworkerrorRegister && (
                                <div style={{
                                    margin: '10px 0',
                                    marginBottom: '10px',
                                    marginTop: '-20px',
                                    padding: '10px 15px',
                                    textAlign: 'center',
                                    color: 'red',
                                    fontWeight: '500',
                                    backgroundColor: 'white',
                                    border: '1px solid red',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}>
                                    <i className='bx bx-error-circle' style={{ fontSize: '20px' }}></i>
                                    {NetworkerrorRegister}
                                </div>
                            )}


                            <div className="remember-forgot" style={{ paddingTop: '30px' }}>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={agreedToTerms}
                                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                                    />
                                    I agree to the terms & conditions
                                </label>
                            </div>

                            <button
                                type="submit"
                                className="btn"
                                disabled={!agreedToTerms || isLoading}
                            >
                                {isLoading ? (
                                    <>
                                    <span className="loader"></span>
                                    </>
                                
                            ):(
                                'Sign Up'
                            )}
                            </button>

                            <div className="login_register">
                                <p>Already have an account? <a href="#" className="login-link" onClick={toggleForm}>Sign In</a>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            </GoogleOAuthProvider>
        
    );
};

export default Frontlog;