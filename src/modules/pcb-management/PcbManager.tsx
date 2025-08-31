import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Card, Form, Button, Row, Col, Tab, Tabs } from 'react-bootstrap';
import StatusAlert from '@/components/common/StatusAlert.tsx';
import LoadingSpinner from '@/components/common/LoadingSpinner.tsx';
import FormGroupSelect from '@/components/common/FormGroupSelect.tsx';
import PaginatedTable from '@/components/common/PaginatedTable.tsx';
import EmptyState from './common/EmptyState.tsx';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Pcb {
    pcb_id: string;
    pcb_name: string;
}

interface ComponentItem {
    component_id: string;
    manufacturer_part_number: string;
    component_name: string;
}

interface BomItem {
    [key: string]: string;
}

interface ColumnMapping {
    manufacturer_part_number: string;
    designator: string;
}

interface GroupedBomItem {
    component_id: string | null;
    manufacturer_part_number: string;
    quantity: number;
    designators: string[];
}

const PcbManager: React.FC = () => {
    const [pcbs, setPcbs] = useState<Pcb[]>([]);
    const [allComponents, setAllComponents] = useState<ComponentItem[]>([]);
    const [selectedPcbId, setSelectedPcbId] = useState<string>('');
    const [bomFile, setBomFile] = useState<File | null>(null);
    const [bomData, setBomData] = useState<BomItem[]>([]);
    const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
    const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
        manufacturer_part_number: '',
        designator: ''
    });
    const [componentSelections, setComponentSelections] = useState<{[key: number]: string}>({});
    const [status, setStatus] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const [activeTab, setActiveTab] = useState<string>('pcbSelect');

    const PCB_API_URL = `${API_BASE_URL}/api/pcb`;
    const COMPONENTS_API_URL = `${API_BASE_URL}/api/components`;

    // Sayfalama mantığı
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage] = useState<number>(20);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = bomData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(bomData.length / itemsPerPage);

    // PCB'leri ve tüm bileşenleri yükle
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const pcbRes = await axios.get<Pcb[]>(PCB_API_URL);
                setPcbs(pcbRes.data);
                const componentsRes = await axios.get<ComponentItem[]>(`${COMPONENTS_API_URL}/all`);
                setAllComponents(componentsRes.data);
            } catch (err: any) {
                setStatus('Veriler yüklenirken bir hata oluştu.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // BOM yüklendiğinde ve sütun eşleşmeleri yapıldığında otomatik eşleştirme yap
    useEffect(() => {
        if (bomData.length > 0 && columnMapping.manufacturer_part_number && allComponents.length > 0) {
            const newSelections: {[key: number]: string} = {};
            bomData.forEach((bomItem, index) => {
                const bomMpn = bomItem[columnMapping.manufacturer_part_number];
                // Envanterdeki bileşenlerde BOM MPN'sini ara
                const matchedComponent = allComponents.find(
                    comp => comp.manufacturer_part_number === bomMpn
                );

                if (matchedComponent) {
                    newSelections[index] = matchedComponent.component_id;
                }
            });
            setComponentSelections(newSelections);
        }
    }, [bomData, columnMapping.manufacturer_part_number, allComponents]); // Bu bağımlılıklar değiştiğinde çalışır


    const handlePcbSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const pcbId = e.target.value;
        setSelectedPcbId(pcbId);
        if (pcbId) {
            setActiveTab('bomUpload');
            setBomData([]);
            setCsvHeaders([]);
            setStatus('');
            setComponentSelections({});
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setBomFile(e.target.files[0]);
            setStatus('');
            setBomData([]);
            setCsvHeaders([]);
            setComponentSelections({});
        }
    };

    const handleBomUpload = async () => {
        if (!selectedPcbId) {
            setStatus('Lütfen önce bir PCB seçin.');
            return;
        }
        if (!bomFile) {
            setStatus('Lütfen bir BOM dosyası seçin.');
            return;
        }

        const formData = new FormData();
        formData.append('bomFile', bomFile);

        setStatus('BOM dosyası yükleniyor ve işleniyor...');
        setLoading(true);

        try {
            const res = await axios.post<{ bomData: BomItem[] }>(`${PCB_API_URL}/upload-bom`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (res.data.bomData.length > 0) {
                const headers = Object.keys(res.data.bomData[0]);
                setCsvHeaders(headers);
                setBomData(res.data.bomData);
                setStatus('BOM dosyası başarıyla yüklendi. Şimdi eşleştirme yapın.');
                setActiveTab('columnMapping');
            } else {
                setStatus('Yüklenen dosyada veri bulunamadı.');
            }
        } catch (err: any) {
            setStatus('Yükleme hatası: ' + (err.response?.data?.message || err.message));
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleColumnMappingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        const newMapping = { ...columnMapping, [name]: value };
        setColumnMapping(newMapping);
        
        if (newMapping.manufacturer_part_number && newMapping.designator) {
            setActiveTab('componentMatching');
        }
    };

    const handleComponentSelectChange = (e: React.ChangeEvent<HTMLSelectElement>, index: number) => {
        const { value } = e.target;
        setComponentSelections(prev => ({ ...prev, [index]: value }));
    };

    const handleFinalizeMapping = async () => {
        if (!columnMapping.manufacturer_part_number || !columnMapping.designator) {
            setStatus('Lütfen tüm zorunlu alanları eşleştirin.');
            return;
        }

        // Bileşenleri MPN'ye göre grupla ve adetlerini say
        const groupedBomData = bomData.reduce((acc: { [key: string]: GroupedBomItem }, item: BomItem, index: number) => {
            const mpn = item[columnMapping.manufacturer_part_number];
            const designator = item[columnMapping.designator];
            const componentId = componentSelections[index] || null;

            if (!acc[mpn]) {
                acc[mpn] = {
                    component_id: componentId,
                    manufacturer_part_number: mpn,
                    designators: [designator],
                    quantity: 1,
                    is_matched: !!componentId
                };
            } else {
                acc[mpn].designators.push(designator);
                acc[mpn].quantity++;
            }
            return acc;
        }, {});

        // Gruplanmış veriyi API'ye göndereceğimiz formata dönüştür
        const finalBomData: GroupedBomItem[] = Object.values(groupedBomData).map(item => ({
            component_id: item.component_id,
            manufacturer_part_number: item.manufacturer_part_number,
            quantity: item.quantity,
            designators: item.designators
        }));

        const unmappedCount = finalBomData.filter(item => !item.component_id).length;
        const mappedCount = finalBomData.length - unmappedCount;

        if (mappedCount === 0 && unmappedCount === 0) {
            setStatus('Kaydedilecek veri bulunamadı.');
            return;
        }

        setStatus(`BOM verileri (${mappedCount} eşleşmiş, ${unmappedCount} eşleşmemiş parça) backend'e gönderiliyor...`);
        setLoading(true);

        try {
            await axios.post(`${PCB_API_URL}/save-bom`, {
                pcbId: selectedPcbId,
                bomData: finalBomData
            });
            setStatus('BOM verileri başarıyla kaydedildi!');
        } catch (err: any) {
            setStatus('Kaydetme hatası: ' + (err.response?.data?.message || err.message));
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    
    const tableHeaders = [
        { label: 'Designator', key: 'designator' },
        { label: 'Parça No (BOM)', key: 'manufacturer_part_number' },
        { label: 'Envanterdeki Komponent', key: 'component_selection' }
    ];

    const renderBomRow = (item: BomItem, index: number) => {
        const actualIndex = indexOfFirstItem + index; // Calculate actual index for componentSelections
        return (
            <tr key={actualIndex}>
                <td className="align-middle">{item[columnMapping.designator]}</td>
                <td className="align-middle">{item[columnMapping.manufacturer_part_number]}</td>
                <td className="align-middle">
                    <Form.Select 
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleComponentSelectChange(e, actualIndex)} 
                        value={componentSelections[actualIndex] || ''}
                    >
                        <option value="">-- Eşleştir --</option>
                        {allComponents.map(comp => (
                            <option key={comp.component_id} value={comp.component_id}>
                                {comp.manufacturer_part_number} - {comp.component_name}
                            </option>
                        ))}
                    </Form.Select>
                </td>
            </tr>
        );
    };

    return (
        <>
            <Card className="shadow-sm mb-4 mx-auto">
                <Card.Header>
                    <h5 className="mb-0 text-primary fw-bold">PCB BOM Yönetimi</h5>
                </Card.Header>
                <Card.Body className="d-flex justify-content-center align-items-center flex-column">
                    <StatusAlert status={status} />

                    <Tabs
                        activeKey={activeTab}
                        onSelect={(k: string) => setActiveTab(k)}
                        id="uncontrolled-tab-example"
                        className="mb-3"
                    >
                        <Tab eventKey="pcbSelect" title="1. PCB Seçin">
                            <FormGroupSelect
                                label="Bir PCB Seçin"
                                name="selectedPcbId"
                                value={selectedPcbId}
                                onChange={handlePcbSelect}
                                options={pcbs.map(pcb => ({ value: pcb.pcb_id, label: pcb.pcb_name }))}
                                placeholder="-- PCB Seç --"
                            />
                        </Tab>

                        <Tab eventKey="bomUpload" title="2. BOM Yükle" disabled={!selectedPcbId}>
                            <Form.Group className="mb-4">
                                <Form.Label className="fw-bold">BOM Dosyasını Yükle</Form.Label>
                                <div className="d-flex align-items-center">
                                    <Form.Control
                                        type="file"
                                        onChange={handleFileChange}
                                        accept=".csv"
                                        className="me-2"
                                        disabled={loading}
                                    />
                                    <Button
                                        onClick={handleBomUpload}
                                        disabled={loading || !bomFile}
                                        variant="primary"
                                    >
                                        <LoadingSpinner show={loading} text="Yükleniyor..." /> Yükle
                                    </Button>
                                </div>
                            </Form.Group>
                        </Tab>

                        <Tab eventKey="columnMapping" title="3. Sütun Eşleştir" disabled={!bomData.length}>
                            <Form.Group className="mb-4">
                                <Form.Label className="fw-bold">Sütunları Eşleştir</Form.Label>
                                <Row>
                                    <Col md={6}>
                                        <FormGroupSelect
                                            label="Parça Numarası (MPN):"
                                            name="manufacturer_part_number"
                                            value={columnMapping.manufacturer_part_number}
                                            onChange={handleColumnMappingChange}
                                            options={csvHeaders.map(header => ({ value: header, label: header }))}
                                            placeholder="-- Seç --"
                                        />
                                    </Col>
                                    <Col md={6}>
                                        <FormGroupSelect
                                            label="Designator:"
                                            name="designator"
                                            value={columnMapping.designator}
                                            onChange={handleColumnMappingChange}
                                            options={csvHeaders.map(header => ({ value: header, label: header }))}
                                            placeholder="-- Seç --"
                                        />
                                    </Col>
                                </Row>
                            </Form.Group>
                        </Tab>

                        <Tab eventKey="componentMatching" title="4. Bileşenleri Eşleştir" disabled={!columnMapping.manufacturer_part_number || !columnMapping.designator}>
                            <PaginatedTable
                                headers={tableHeaders}
                                data={currentItems}
                                renderRow={renderBomRow}
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                            <div className="d-grid mt-4">
                                <Button
                                    variant="success"
                                    onClick={handleFinalizeMapping}
                                    disabled={loading}
                                >
                                    <LoadingSpinner show={loading} text="Kaydediliyor..." /> Eşleştirmeyi Onayla ve BOM'u Kaydet
                                </Button>
                            </div>
                        </Tab>
                    </Tabs>
                </Card.Body>
            </Card>
        </>
    );
};

export default PcbManager;