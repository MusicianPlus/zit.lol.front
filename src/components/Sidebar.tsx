import React from 'react';
import { Nav, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import logo from '../assets/logo_transparent.png';

const Sidebar: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="sidebar">
            <div className="sidebar-header-card">
                <div className="logo">
                    <img src={logo} alt="Zit Base Logo" />
                </div>
            </div>
            <Form.Control type="text" placeholder="Search..." className="mb-3" />
            <Nav className="flex-column">
                <h6 className="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1">
                    <span>{t('pcb_management')}</span>
                </h6>
                <Nav.Link as={Link} to="/pcb-creator">
                    <i className="bi bi-plus-circle"></i>
                    {t('create_new_pcb')}
                </Nav.Link>
                <Nav.Link as={Link} to="/pcb-manager">
                    <i className="bi bi-card-list"></i>
                    {t('pcb_bom_management')}
                </Nav.Link>
                <Nav.Link as={Link} to="/pcb-mapper">
                    <i className="bi bi-arrows-angle-contract"></i>
                    {t('pcb_mapping')}
                </Nav.Link>

                <h6 className="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1">
                    <span>{t('inventory')}</span>
                </h6>
                <Nav.Link as={Link} to="/stock-manager">
                    <i className="bi bi-box-seam"></i>
                    {t('inventory_management')}
                </Nav.Link>
                <Nav.Link as={Link} to="/csv-uploader">
                    <i className="bi bi-cloud-upload"></i>
                    {t('upload_components_csv')}
                </Nav.Link>

                <h6 className="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1">
                    <span>{t('production')}</span>
                </h6>
                <Nav.Link as={Link} to="/production-planner">
                    <i className="bi bi-calendar-check"></i>
                    {t('production_planning')}
                </Nav.Link>
            </Nav>
        </div>
    );
};

export default Sidebar;