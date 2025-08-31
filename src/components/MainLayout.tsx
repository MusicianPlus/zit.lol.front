import React, { Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Container, Dropdown } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

// MainLayout'un kendi içindeki bileşen import'ları
const PcbManager = React.lazy(() => import('../modules/pcb-management/PcbManager.tsx'));
const CsvUploader = React.lazy(() => import('../modules/importer/CsvUploader.tsx'));
const PcbCreator = React.lazy(() => import('../modules/pcb-management/PcbCreator.tsx'));
const StockManager = React.lazy(() => import('../modules/stock-management/StockManager.tsx').then(module => ({ default: module.default })));
const ProductionPlanner = React.lazy(() => import('../modules/production/ProductionPlanner.tsx'));
const PcbMapper = React.lazy(() => import('../modules/pcb-management/PcbMapper.tsx'));
import Sidebar from './Sidebar.tsx';
import logo from '../assets/logo.png';

const getPageTitle = (pathname: string) => {
    switch (pathname) {
        case '/':
            return 'Dashboard';
        case '/pcb-manager':
            return 'PCB BOM Management';
        case '/pcb-mapper':
            return 'PCB Mapping';
        case '/csv-uploader':
            return 'Upload Components (CSV)';
        case '/pcb-creator':
            return 'Create New PCB';
        case '/stock-manager':
            return 'Inventory Management';
        case '/production-planner':
            return 'Production Planning';
        default:
            return 'ERP';
    }
};

const MainLayout = () => {
    const { logout, user } = useAuth();
    const { t } = useTranslation();
    const location = useLocation();

    const Home = () => (
        <div className="text-center">
            <img
                src={logo}
                alt="Zit Base Logo"
                className="img-fluid"
                style={{ maxWidth: '150px' }}
            />
            <h1>{t('welcome')}</h1>
            <p>{t('select_action')}</p>
        </div>
    );

    return (
        <div className="main-layout">
            <Sidebar />
            <div className="main-content">
                <header className="header">
                    <h2>{getPageTitle(location.pathname)}</h2>
                    <Dropdown as="div" className="user-menu">
                        <Dropdown.Toggle as="a" className="btn btn-link">
                            <i className="bi bi-person-circle"></i>
                            <span className="ms-2">{user?.username}</span>
                        </Dropdown.Toggle>
                        <Dropdown.Menu align="end">
                            <Dropdown.Item onClick={logout}>{t('logout')}</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </header>
                <div className="page-content page-container">
                    <Suspense fallback={<div>{t('loading')}</div>}>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/pcb-manager" element={<PcbManager />} />
                            <Route path="/pcb-mapper" element={<PcbMapper />} />
                            <Route path="/csv-uploader" element={<CsvUploader />} />
                            <Route path="/pcb-creator" element={<PcbCreator />} />
                            <Route path="/stock-manager" element={<StockManager />} />
                            <Route path="/production-planner" element={<ProductionPlanner />} />
                        </Routes>
                    </Suspense>
                </div>
            </div>
        </div>
    );
};

export default MainLayout;