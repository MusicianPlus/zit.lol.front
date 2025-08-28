import React, { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Container, Navbar, Button } from 'react-bootstrap';

// MainLayout'un kendi içindeki bileşen import'ları
import PcbManager from './PcbManager';
import CsvUploader from './CsvUploader';
import PcbCreator from './PcbCreator';
import StockManager from './StockManager';
import ProductionPlanner from './ProductionPlanner';
import PcbMapper from './PcbMapper';
import Sidebar from './Sidebar';
import logo from '../assets/logo_transparent.png';

const MainLayout = ({ handleLogout }) => {
    // Yan menünün açık/kapalı durumu, varsayılan olarak açık başlar
    const [showSidebar, setShowSidebar] = useState(true);

    const handleShowSidebar = () => setShowSidebar(true);
    const handleCloseSidebar = () => setShowSidebar(false);

    // Anasayfa bileşeni (Home) artık MainLayout içinde tanımlanıyor
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
            {/* Çıkış butonu */}
            <Button variant="danger" onClick={handleLogout} className="mt-3">
                Çıkış Yap
            </Button>
        </div>
    );

    return (
        <>
            {/* Navbar - Sadece menü butonu ve marka adı */}
            <Navbar fixed="top" className="bg-primary navbar-dark shadow-sm">
                <Container fluid>
                    {/* Tek menü butonu */}
                    <Button variant="primary" onClick={handleShowSidebar} className="me-2">
                        <i className="bi bi-list"></i> {/* Bootstrap Icons kullanılıyorsa */}
                    </Button>
                    <Navbar.Brand as={Link} to="/">Zit Base</Navbar.Brand>
                </Container>
            </Navbar>

            {/* Yan menü bileşeni */}
            <Sidebar show={showSidebar} handleClose={handleCloseSidebar} />

            {/* Ana İçerik Alanı */}
            <div className="main-content" style={{ marginTop: '5rem' }}>
                <Container>
                    <Routes>
                        {/* Tüm ana uygulama rotaları */}
                        <Route path="/" element={<Home />} />
                        <Route path="/pcb-manager" element={<PcbManager />} />
                        <Route path="/pcb-mapper" element={<PcbMapper />} />
                        <Route path="/csv-uploader" element={<CsvUploader />} />
                        <Route path="/pcb-creator" element={<PcbCreator />} />
                        <Route path="/stock-manager" element={<StockManager />} />
                        <Route path="/production-planner" element={<ProductionPlanner />} />
                    </Routes>
                </Container>
            </div>
        </>
    );
};

export default MainLayout;