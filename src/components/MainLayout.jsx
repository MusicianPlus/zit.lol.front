import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate, Outlet } from 'react-router-dom';
import { Container, Navbar, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import routes from '../routes';

import Sidebar from './Sidebar';
import logo from '../assets/logo.png';

const MainLayout = () => {
    const [showSidebar, setShowSidebar] = useState(true);
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleShowSidebar = () => setShowSidebar(true);
    const handleCloseSidebar = () => setShowSidebar(false);

    const handleLogout = async () => {
        const result = await logout();
        if (result.success) {
            navigate('/login');
        }
    };

    const Home = () => (
        <div className="text-center">
                <img
                    src={logo}
                    alt="Zit lol Logo"
                    className="img-fluid"
                    style={{ maxWidth: '150px' }} // Logoyu daha küçük tutmak için isteğe bağlı stil
                />
            <h1>Hoş geldin!</h1>
            <p>Sol üstteki menüden işlem seçerek uygulamayı kullanmaya başlayabilirsin.</p>
            <Button variant="danger" onClick={handleLogout} className="mt-3">
                Çıkış Yap
            </Button>
        </div>
    );

    return (
        <>
            <Navbar fixed="top" className="bg-primary navbar-dark shadow-sm">
                <Container fluid>
                    <Button variant="primary" onClick={handleShowSidebar} className="me-2">
                        <i className="bi bi-list"></i>
                    </Button>
                    <Navbar.Brand as={Link} to="/">Zit Base</Navbar.Brand>
                </Container>
            </Navbar>

            <Sidebar show={showSidebar} handleClose={handleCloseSidebar} />

            <div className="main-content" style={{ marginTop: '5rem' }}>
                <Container>
                    <Routes>
                        {routes.find(route => route.path === '/').children.map((childRoute, index) => (
                            <Route
                                key={index}
                                path={childRoute.path}
                                element={<childRoute.component />}
                            />
                        ))}
                    </Routes>
                </Container>
            </div>
        </>
    );
};

export default MainLayout;