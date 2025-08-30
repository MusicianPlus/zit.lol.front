import React from 'react';
import Login from '../components/Login';
import MainLayout from '../components/MainLayout';
import PcbManager from '../components/PcbManager';
import CsvUploader from '../components/CsvUploader';
import PcbCreator from '../components/PcbCreator';
import StockManager from '../components/StockManager';
import ProductionPlanner from '../components/ProductionPlanner';
import PcbMapper from '../components/PcbMapper';

const routes = [
    {
        path: '/login',
        component: Login,
        exact: true,
        auth: false,
    },
    {
        path: '/',
        component: MainLayout,
        auth: true,
        children: [
            {
                path: '/',
                component: () => <div>Home</div>, // Placeholder for Home component
                exact: true,
            },
            {
                path: '/pcb-manager',
                component: PcbManager,
            },
            {
                path: '/pcb-mapper',
                component: PcbMapper,
            },
            {
                path: '/csv-uploader',
                component: CsvUploader,
            },
            {
                path: '/pcb-creator',
                component: PcbCreator,
            },
            {
                path: '/stock-manager',
                component: StockManager,
            },
            {
                path: '/production-planner',
                component: ProductionPlanner,
            },
        ],
    },
];

export default routes;
