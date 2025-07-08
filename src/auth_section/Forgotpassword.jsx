import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import  config from'../auth_section/config';


const Forgotpassword = () => {
    
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [stage, setStage] = useState('email');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSendOTP = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${config.API_URL}/send-otp`, { email });
            if (response.data.success) {
                setStage('otp');
                setSuccess('OTP sent to your email');
                setError('');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP');
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${config.API_URL}/verify-otp`, { email, otp });
            if (response.data.success) {
                setStage('reset');
                setSuccess('OTP verified successfully');
                setError('');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP');
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

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

            <Button variant="primary" type="submit" className="w-100">
                Send OTP
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
                <Form.Control
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength="6"
                    required
                />
            </Form.Group>

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

            <Button variant="primary" type="submit" className="w-100">
                Reset Password
            </Button>
        </Form>
    );

    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
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