import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Login = ({ handleLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false); // Yeni state: "beni hatırla"
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            // Backend'deki yeni API uç noktasına istek gönder
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },

                credentials: 'include', // Include credentials
                body: JSON.stringify({ username, password, rememberMe }), // "beni hatırla" durumunu da gönder
            });

            const data = await response.json();

            if (response.ok) {
                // Başarılı giriş
                handleLogin(); // App.jsx'e token'ı ilet
                navigate('/');
            } else {
                setError(data.message || 'Giriş başarısız oldu.');
            }
        } catch (err) {
            console.error('Giriş hatası:', err);
            setError('Sunucuya bağlanılamadı. Lütfen tekrar deneyin.');
        }
    };

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
            <Card className="p-4 shadow" style={{ width: '400px' }}>
                <Card.Body>
                    <h2 className="text-center mb-4">Giriş Yap</h2>
                    {error && <Alert variant="danger">{error}</Alert>} {/* Hata mesajını göster */}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group id="username" className="mb-3">
                            <Form.Label>Kullanıcı Adı</Form.Label>
                            <Form.Control
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                autoFocus
                            />
                        </Form.Group>
                        <Form.Group id="password" className="mb-3">
                            <Form.Label>Şifre</Form.Label>
                            <Form.Control
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </Form.Group>
                        
                        {/* "Beni Hatırla" Checkbox'ı */}
                        <Form.Group id="remember-me" className="mb-3">
                            <Form.Check 
                                type="checkbox" 
                                label="Beni Hatırla" 
                                checked={rememberMe} 
                                onChange={(e) => setRememberMe(e.target.checked)} 
                            />
                        </Form.Group>
                        
                        <Button className="w-100" type="submit" variant="primary">
                            Giriş Yap
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Login;