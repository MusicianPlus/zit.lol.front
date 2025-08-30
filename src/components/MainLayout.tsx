import React, { useState, Suspense } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Container, Navbar, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next'; // Import useTranslation

// MainLayout'un kendi içindeki bileşen import'ları
const PcbManager = React.lazy(() => import('../modules/pcb-management/PcbManager.tsx'));
const CsvUploader = React.lazy(() => import('../modules/importer/CsvUploader.tsx'));
const PcbCreator = React.lazy(() => import('../modules/pcb-management/PcbCreator.tsx'));
const StockManager = React.lazy(() => import('../modules/stock-management/StockManager.tsx'));
const ProductionPlanner = React.lazy(() => import('../modules/production/ProductionPlanner.tsx'));
const PcbMapper = React.lazy(() => import('../modules/pcb-management/PcbMapper.tsx'));
import Sidebar from './Sidebar.tsx';
import logo from '../assets/logo.png';

const MainLayout = () => {
    const { handleLogout } = useAuth();
    const { t } = useTranslation(); // Initialize useTranslation

    // Yan menünün açık/kapalı durumu, varsayılan olarak açık başlar
    const [showSidebar, setShowSidebar] = useState<boolean>(true);

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
            <h1>{t('welcome')}</h1> {/* Translated */}
            <p>{t('select_action')}</p> {/* Translated */}
            {/* Çıkış butonu */}
            <Button variant="danger" onClick={handleLogout} className="mt-3">
                {t('logout')} {/* Translated */}
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
                    <Suspense fallback={<div>{t('loading')}</div>}> {/* Translated */}
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
                    </Suspense>
                </Container>
            </div>
        </>
    );
};

export default MainLayout;