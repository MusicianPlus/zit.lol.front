import React from 'react';
import { Nav, Offcanvas } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Import useTranslation

// Logo dosyasını import etmeyi unutmayın
import logo from '../assets/logo_transparent.png'; // components'tan src'ye çık, sonra assets'e gir

interface SidebarProps {
    show: boolean;
    handleClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ show, handleClose }) => {
    const { t } = useTranslation(); // Initialize useTranslation

    return (
        <Offcanvas show={show} onHide={handleClose} placement="start" scroll={true}>
            <Offcanvas.Header closeButton>
                {/* Eski Offcanvas.Title yerine img etiketi ekliyoruz */}
                <img
                    src={logo}
                    alt="Zit lol Logo"
                    className="img-fluid"
                    style={{ maxWidth: '150px' }} // Logoyu daha küçük tutmak için isteğe bağlı stil
                />
            </Offcanvas.Header>
            <Offcanvas.Body>
                <Nav className="flex-column">
                    <h6 className="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1">
                        <span>{t('pcb_management')}</span> {/* Translated */}
                    </h6>
                    <Nav.Link as={Link} to="/pcb-creator" onClick={handleClose}>
                        {t('create_new_pcb')} {/* Translated */}
                    </Nav.Link>
                    <Nav.Link as={Link} to="/pcb-manager" onClick={handleClose}>
                        {t('pcb_bom_management')} {/* Translated */}
                    </Nav.Link>
                    <Nav.Link as={Link} to="/pcb-mapper" onClick={handleClose}>
                        {t('pcb_mapping')} {/* Translated */}
                    </Nav.Link>

                    <h6 className="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1">
                        <span>{t('inventory')}</span> {/* Translated */}
                    </h6>
                    <Nav.Link as={Link} to="/stock-manager" onClick={handleClose}>
                        {t('inventory_management')} {/* Translated */}
                    </Nav.Link>
                    <Nav.Link as={Link} to="/csv-uploader" onClick={handleClose}>
                        {t('upload_components_csv')} {/* Translated */}
                    </Nav.Link>

                    <h6 className="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1">
                        <span>{t('production')}</span> {/* Translated */}
                    </h6>
                    <Nav.Link as={Link} to="/production-planner" onClick={handleClose}>
                        {t('production_planning')} {/* Translated */}
                    </Nav.Link>
                </Nav>
            </Offcanvas.Body>
        </Offcanvas>
    );
};

export default Sidebar;