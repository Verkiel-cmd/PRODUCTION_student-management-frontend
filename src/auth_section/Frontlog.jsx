import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../Webstyles/login_style.css';
import config from '../auth_section/config';
import { useNavigate } from 'react-router-dom';

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
    const [emailErrorMessage, setemailErrorMessage] = useState('');
    const [googleErrorMessage, setgoogleErrorMessage] = useState('');
    const [PassworderrorType, setPasswordErrorType] = useState(null);
    const [passwordErrorMessage, setpasswordErrorMessage] = useState('');
    const [networkErrorMessage, setnetworkErrorMessage] = useState(null);
    const [loggedInUser, setLoggedInUser] = useState(null);

    // Add state variables for registration form
    const [isUsernameFocusedRegister, setIsUsernameFocusedRegister] = useState(false);
    const [isEmailFocusedRegister, setIsEmailFocusedRegister] = useState(false);
    const [isPasswordFocusedRegister, setIsPasswordFocusedRegister] = useState(false);
    const [isPasswordVisibleRegister, setIsPasswordVisibleRegister] = useState(false);
    const [emailRegister, setEmailRegister] = useState('');
    const [passwordRegister, setPasswordRegister] = useState('');
    const [errorRegister, setErrorRegister] = useState('');
    const [NetworkerrorRegister, setNetworkErrorRegister] = useState(null);
    const [RegistererrorType, setRegisterErrorType] = useState(null);
    const [username, setUsername] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [usernameError, setUsernameError] = useState(false);
    const [usernameErrortype, setUsernameErrorType] = useState(false);

    const navigate = useNavigate();

    const toggleForm = () => {
        const logregBox = document.querySelector('.log-reg-box');
        logregBox.classList.toggle('active');
    };

    const toggleDropdown = () => {
        const dropdownContent = document.querySelector('.dropdown-content');
        dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
    };

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

      const handleRegisterSubmit = (event) => {
        event.preventDefault();

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!emailRegex.test(emailRegister)) {
            setRegisterErrorType("email");
            setErrorRegister("Please enter a valid email address.");
            return;
        }

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
                    setNetworkErrorRegister(error.response.data.message || 'Something went wrong \nduring registration');
                } else {
                    console.error('Network error:', error);
                    setNetworkErrorRegister('Network error');
                }
            });
    };

    const handleLoginSubmit = async (event) => {
        event.preventDefault();
        
        setEmailErrorType(null);
        setemailErrorMessage('');
        setpasswordErrorMessage('');
        setnetworkErrorMessage('');
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
                setemailErrorMessage('Invalid credentials');
                setpasswordErrorMessage('Invalid credentials');
            }
        } catch (error) {
            console.error('Login error:', error);
        
            if (!error.response) {
                setnetworkErrorMessage('Network error \nPlease check your connection.');
            } else if (error.response.status === 400) {
                const { field, messageEmail, messagePassword } = error.response.data;
        
                if (field === 'email') {
                    setEmailErrorType('email');
                    setemailErrorMessage(messageEmail || 'Invalid email');
                } else if (field === 'password') {
                    setPasswordErrorType('password');
                    setpasswordErrorMessage(messagePassword || 'Invalid password');
                } else {
                    // Fallback
                    setEmailErrorType('email');
                    setPasswordErrorType('password');
                    setemailErrorMessage('Invalid email or password');
                    setpasswordErrorMessage('Invalid email or password');
                }
            } else {
                setnetworkErrorMessage('An unexpected error occurred\n Please try again later.');
            }
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

    const handleGoogleSuccess = async (response) => {
        const token = response.credential;
        if (!token) {
            setgoogleErrorMessage('Google Sign-In failed  \nNo token received.');
            return;
        }

        try {
           const res = await axios.post('https://student-management-backend-a2q4.onrender.com/google-login',
             { token }, { withCredentials: true });
            if (res.data.success && res.data.user) {
                // Extract user data directly from res.data
            const userData = {
                userId: res.data.userId,
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
        }
    };

    const handleGoogleFailure = (error) => {
        console.error('Google Sign-In error:', error);
        setgoogleErrorMessage('Google Sign-In was unsuccessful  \nPlease try again.');
    };
    
   
    return (

        <div>
            <header className="header">
                <nav className="navbar">
                    <a href="#">Home</a>
                    <a href="#">About</a>
                    <a href="#">Service</a>
                    <a href="#">Contact</a>
                </nav>

                <div className="dropdown">
                    <button className="dropbtn" onClick={toggleDropdown}>Courses</button>
                    <div className="dropdown-content">
                        <div className="dropdown-line"></div>
                        <a href="#">Link 1</a>
                        <div className="dropdown-line"></div>
                        <a href="#">Link 2</a>
                        <div className="dropdown-line"></div>
                        <a href="#">Link 3</a>
                        <div className="dropdown-line"></div>
                    </div>
                </div>

                <form action="#" className="search-bar">
                    <input type="text" placeholder="Search" />
                    <button type="submit"><i className="bx bx-search-alt-2"></i></button>
                </form>
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
                            {emailErrorMessage && (
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
                                    {emailErrorMessage}
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
                            {passwordErrorMessage && (
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
                                    {passwordErrorMessage}
                                </div>
                            )}

                            {/* Display error message */}
                            {networkErrorMessage && (
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
                                    {networkErrorMessage}
                                </div>
                            )}

                            {/* Display error message */}
                            {googleErrorMessage && (
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
                                    gap: '4px'
                                }}>
                                    <i className='bx bx-error-circle' style={{ fontSize: '20px' }}></i> {/* Add an icon */}
                                    {googleErrorMessage}
                                </div>
                            )}

                            <div className="google-login">
                                <GoogleOAuthProvider clientId="824956744352-a4sj5egukjh1csk8galsalp6v4i73gbq.apps.googleusercontent.com">
                                    <GoogleLogin
                                        onSuccess={handleGoogleSuccess}
                                        onError={handleGoogleFailure}
                                        useOneTap={false}
                                        flow="implicit"
                                    />
                                </GoogleOAuthProvider>
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
                            <button type="submit" className="btn">Sign in</button>

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
                                    gap: '8px'
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

                            <div className={`input-box ${RegistererrorType === 'email' ? 'input-error' : ''}`}>
                                <span className="icon"><i className="bx bxs-envelope"></i></span>
                                <input
                                    type="email"
                                    value={emailRegister}
                                    onFocus={() => setIsEmailFocusedRegister(true)}
                                    onBlur={() => setIsEmailFocusedRegister(false)}
                                    onChange={(e) => setEmailRegister(e.target.value)}
                                    required
                                />
                                <label className={emailRegister || isEmailFocusedRegister ? 'focused' : ''}>Email</label>
                            </div>


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
                                disabled={!agreedToTerms}
                            >
                                Sign Up
                            </button>

                            <div className="login_register">
                                <p>Already have an account? <a href="#" className="login-link" onClick={toggleForm}>Sign In</a>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div >
        
    );
};

export default Frontlog;