import React from 'react';
import { Nav, Offcanvas } from 'react-bootstrap';
import { Link } from 'react-router-dom';

// Logo dosyasını import etmeyi unutmayın
import logo from '../assets/logo_transparent.png'; // components'tan src'ye çık, sonra assets'e gir

const Sidebar = ({ show, handleClose }) => {
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
                        <span>PCB Yönetimi</span>
                    </h6>
                    <Nav.Link as={Link} to="/pcb-creator" onClick={handleClose}>
                        Yeni PCB Oluştur
                    </Nav.Link>
                    <Nav.Link as={Link} to="/pcb-manager" onClick={handleClose}>
                        PCB BOM Yönetimi
                    </Nav.Link>
                    <Nav.Link as={Link} to="/pcb-mapper" onClick={handleClose}>
                        PCB Eşleştirme
                    </Nav.Link>

                    <h6 className="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1">
                        <span>Envanter</span>
                    </h6>
                    <Nav.Link as={Link} to="/stock-manager" onClick={handleClose}>
                        Envanter Yönetimi
                    </Nav.Link>
                    <Nav.Link as={Link} to="/csv-uploader" onClick={handleClose}>
                        CSV ile Komponent Yükle
                    </Nav.Link>

                    <h6 className="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1">
                        <span>Üretim</span>
                    </h6>
                    <Nav.Link as={Link} to="/production-planner" onClick={handleClose}>
                        Üretim Planlama
                    </Nav.Link>
                </Nav>
            </Offcanvas.Body>
        </Offcanvas>
    );
};

export default Sidebar;