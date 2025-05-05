import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Webstyles/login_style.css';
import  config from'./config';



const Frontlog = () => {

    console.log('API URL:', config.VITE_API_URL);

    

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
        })
            .then(response => {
                console.log('Registration success:', response.data);
                if (response.data.success) {

                    // Update loggedInUser state with the new user's information
                    setLoggedInUser({
                        id: response.data.userId, // Assuming the backend returns userId
                        username: username,
                        email: emailRegister
                    });

                    // Update the local session
                    axios.post(`${config.API_URL}/session`, {
                        userId: response.data.userId,
                        username: username,
                        email: emailRegister
                    })
                        .then(() => {
                            console.log('Session updated successfully');

                            // Retrieve the username from the session
                            axios.get(`${config.API_URL}/session`)
                                .then(response => {
                                    const username = response.data.username;
                                    setLoggedInUser({ ...loggedInUser, username });
                                })
                                .catch(error => {
                                    console.error('Error retrieving session:', error);
                                });
                        })
                        .catch(error => {
                            console.error('Error updating session:', error);
                        });

                    // Optionally, store the user info in localStorage for persistence
                    localStorage.setItem('loggedInUser', JSON.stringify({
                        id: response.data.userId,
                        username: username,
                        email: emailRegister
                    }));

                    setRegisterErrorType(null);
                    setSuccessMessage('User registered successfully! Redirecting...');

                    setTimeout(() => {
                        window.location.href = response.data.redirectUrl;
                    }, 2000);

                } else {
                    setRegisterErrorType(response.data.message);
                }
            })
            .catch(error => {
                if (error.response) {
                    console.error('Registration error:', error.response.data);
                    setNetworkErrorRegister(error.response.data.message || 'Something went wrong during registration');
                } else {
                    console.error('Network error:', error);
                    setNetworkErrorRegister('Network error');
                }
            });
    };


    const handleLoginSubmit = (event) => {
        event.preventDefault();


        axios.post(`${config.API_URL}/login`, {
            email: email,
            password: password
        }, { withCredentials: true })
            .then(response => {
                console.log('Login success:', response.data);
                if (response.data.success) {
                    window.location.href = response.data.redirectUrl;
                } else {

                    setEmailErrorType(null);
                    setemailErrorMessage(response.data.message || 'Unexpected error occurred.');
                    setpasswordErrorMessage(response.data.message || 'Unexpected error occurred.');
                }
            })
            .catch((error) => {
                console.log('Caught error:', error);

                if (!error.response) {
                    console.error('Network error detected:', error);
                    setnetworkErrorMessage('Network error');
                } else if (error.response && error.response.data) {

                    const { messageEmail, messagePassword, field } = error.response.data;


                    console.log(`Error from server: message="${messageEmail}", "${messagePassword}", field="${field}"`);


                    setEmailErrorType(field);
                    setPasswordErrorType(field);
                    setemailErrorMessage(messageEmail);
                    setpasswordErrorMessage(messagePassword);
                } else {

                    console.error('Unexpected error:', error);
                    setnetworkErrorMessage('An unexpected error occurred. \nPlease try again.');
                }
            });
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

            console.error('Error checking username:', error);
            setUsernameErrorType('username');
        }
    };


















    const handleGoogleSuccess = (response) => {
        console.log('Google Sign-In response:', response);
    
        // Extract the token from the response
        const token = response.credential; // Use `credential` for @react-oauth/google
        if (!token) {
            setgoogleErrorMessage('Google Sign-In failed. No token received.');
            return;
        }
    
        // Send the token to the backend for verification
        axios
            .post(`${config.API_URL}/google-login`, { token }, { withCredentials: true })
            .then((res) => {
                if (res.data.success) {
                    // Store the user info in localStorage
                    localStorage.setItem('loggedInUser', JSON.stringify(res.data.user));
    
                    // Redirect to the protected route
                    window.location.href = '/ListStud';
                } else {
                    setgoogleErrorMessage(res.data.message || 'Google Sign-In failed. Please try again.');
                }
            })
            .catch((error) => {
                console.error('Google Sign-In failed:', error);
    
                if (error.response) {
                    console.error('Response data:', error.response.data);
                    setgoogleErrorMessage(error.response.data.message || 'Google Sign-In failed. Please try again.');
                } else {
                    setgoogleErrorMessage('An unexpected error occurred. \nPlease try again.');
                }
            });
    };

    const handleGoogleFailure = (response) => {
        console.error('Google Sign-In error:', response);
        setgoogleErrorMessage('Google Sign-In was unsuccessful. Please try again.');
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
                                <GoogleLogin
                                    clientId="824956744352-a4sj5egukjh1csk8galsalp6v4i73gbq.apps.googleusercontent.com"
                                    buttonText="Sign in with Google"
                                    onSuccess={handleGoogleSuccess}
                                    onFailure={handleGoogleFailure}
                                    cookiePolicy={'single_host_origin'}
                                    className="google-login-button"
                                />
                            </div>




                            <div className="remember-forgot" style={{ paddingTop: '30px' }}>
                                <label>
                                    <input type="checkbox"
                                        checked={rememberMe}
                                        onChange={handleRememberMeChange}
                                    />
                                    Remember me
                                </label>
                                <a href="/Forgotpassword">Forgot Password?</a>
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