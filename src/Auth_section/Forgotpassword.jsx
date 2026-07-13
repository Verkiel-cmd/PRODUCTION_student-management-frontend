import React, { useState, useRef, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';
import '../Webstyles/main_side.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import  config from'./config';

const Forgotpassword = () => {

    

    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [stage, setStage] = useState('email');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

     //OTP VARIABLES
    const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
    const otpRefs = useRef([]);
    const [resendCooldown, setResendCooldown] = useState(0);

    useEffect(() => {
    if (resendCooldown === 0) return;

    const timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
}, [resendCooldown]);

     //RESEND OTP FUNCTION
     const handleOTPChange = (index, e) => {
        const newValues = [...otpValues];
        newValues[index] = e.target.value;
        setOtpValues(newValues);
        setOtp(newValues.join(''));

        if (e.target.value && index < 5) {
            otpRefs.current[index + 1].focus();
        }
    };

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await axios.post(`${config.API_URL}/send-otp`, { email });
            if (response.data.success) {
                setStage('otp');
                setSuccess('OTP sent to your email');
                setError('');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await axios.post(`${config.API_URL}/verify-otp`, { email, otp });
            if (response.data.success) {
                setStage('reset');
                setSuccess('OTP verified successfully');
                setError('');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP');
        } finally {
            setIsLoading(false);
        }
    };

        const handleResendOTP = async () => {
    try {
        const response = await axios.post(`${config.API_URL}/send-otp`, { email });
        if (response.data.success) {
            setSuccess('OTP resent to your email');
            setResendCooldown(30); //30-second countdown
        }
    } catch (err) {
        setError(err.response?.data?.message || 'Failed to resend OTP');
    }
};

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.post(`${config.API_URL}/reset-password`, {
                email,
                newPassword
            });

            if (response.data.success) {
                setSuccess('Password reset successfully');
                setTimeout(() => {
                    window.location.href = '/auth_section/Frontlog';
                }, 2000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setIsLoading(false);
        }
    };

    const renderEmailStage = () => (
        <Form onSubmit={handleSendOTP}>
            <h2 className="text-center mb-4">Forgot Password</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Form.Group className="mb-3">
                <Form.Label>Email Address</Form.Label>
                <Form.Control
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </Form.Group>

            <Button variant="primary" type="submit" className="opt-label w-100 d-flex justify-content-center align-items-center" disabled={isLoading}>
                {isLoading ? (
                    
                    <span className="otp loader"/>
                    ):(
                    'Send OTP'
                   )}
            </Button>
        </Form>
    );

        const renderOTPStage = () => (
        <Form onSubmit={handleVerifyOTP}>
            <h2 className="text-center mb-4">Verify OTP</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Form.Group className="mb-3">
                <Form.Label>OTP</Form.Label>
                <div className="d-flex gap-2 justify-content-between">
                    {otpValues.map((value, i) => (
                <Form.Control
                    key={i}
                    type="text"
                    value={value}
                    placeholder="Enter 6-digit OTP"
                    onChange={(e) => handleOTPChange(i,e)}
                    ref={(el) => (otpRefs.current[i] = el)}
                    maxLength="1"
                    className="otp-box"
                />
                    ))}
                </div>
            </Form.Group>

<div className="mb-3">
    <span
        onClick={!resendCooldown ? handleResendOTP : undefined}
        style={{
            color: resendCooldown > 0 ? '#b3b3b3' : '#007bff',
            cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            textDecoration: 'none',
            background: 'none',
            border: 'none',
            padding: 0,
        }}
    >
        {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
    </span>
</div>

            <Button variant="primary" type="submit" className="w-100">
                Verify OTP
            </Button>
        </Form>
    );

    const renderResetStage = () => (
        <Form onSubmit={handleResetPassword}>
            <h2 className="text-center mb-4">Reset Password</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Form.Group className="mb-3">
                <Form.Label>New Password</Form.Label>
                <Form.Control
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
            </Form.Group>

             <Button variant="primary" type="submit" className="opt-label w-100 d-flex justify-content-center align-items-center" disabled={isLoading}>
                {isLoading ? (
                    
                    <span className="otp loader"/>
                    ):(
                    'Reset Password'
                   )}
            </Button>
        </Form>
    );

    return (
        <Container className="forgot-password-page d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
            <Row>
                <Col md={12}>
                    <div className="p-4 border rounded shadow">
                        {stage === 'email' && renderEmailStage()}
                        {stage === 'otp' && renderOTPStage()}
                        {stage === 'reset' && renderResetStage()}
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default Forgotpassword;