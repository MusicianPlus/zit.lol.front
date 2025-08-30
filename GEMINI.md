# GEMINI.md - Frontend Project Documentation for LLM

This document provides a comprehensive overview of the frontend application, designed to be easily parsable and understood by a Large Language Model (LLM) for development and maintenance tasks. It focuses exclusively on the frontend's purpose, architecture, modularity, technology stack, conventions, and key file structures.

## 1. Project Overview (Frontend Specific)

This project's frontend is a Single-Page Application (SPA) built with React and Vite. It serves as the user interface for the larger Enterprise Resource Planning (ERP) system. Its primary function is to provide an interactive and responsive experience for users, allowing them to interact with the backend API to manage various aspects of the ERP system, such as stock, BOMs, procurement, and production.

**Key Characteristics:**
*   **User Interface:** Provides all visual and interactive elements for the ERP system.
*   **Decoupled:** Operates independently from the backend, communicating via API calls.
*   **Modern Tooling:** Utilizes React for UI development and Vite for a fast development experience and optimized builds.

## 2. Architecture (Frontend Specific)

The frontend is the presentation layer of the three-tier architecture. It is a client-side application that runs in the user's web browser.

### 2.1. Frontend's Role
*   **Technology:** Single-Page Application (SPA) built with **React** and **Vite**.
*   **Interaction:** Communicates with the Backend API (Node.js/Express) to send user requests and receive data. It then renders this data to the user.
*   **Routing:** Manages client-side routing to provide a seamless navigation experience without full page reloads.

## 3. Modularity and Extensibility (Frontend Specific)

The frontend is designed to be highly modular, mirroring the modular structure of the backend. Each backend module typically has a corresponding set of React components that provide the user interface for that specific domain.

### 3.1. Frontend Module Structure
Frontend modules are primarily composed of React components, often grouped logically within the `frontend/src/components` directory. These components are responsible for rendering specific views, forms, or interactive elements related to a particular ERP domain.

### 3.2. Steps to Add a New Frontend Module
To integrate a new feature or module into the frontend, follow these steps:
1.  **Create Components:** Develop new React components within `frontend/src/components` that encapsulate the UI logic and presentation for the new module. These components will handle data display, user input, and interaction with the backend API.
2.  **Define Route:** Add a new route definition in `frontend/src/components/MainLayout.jsx`. This route will map a specific URL path (e.g., `/new-module`) to the newly created component, making it accessible via the application's navigation.
3.  **Update Navigation:** Integrate a link to the new module in the sidebar navigation, which is managed by `frontend/src/components/Sidebar.jsx`. This ensures users can easily access the new functionality.

## 4. Frontend Details

### 4.1. Technology Stack
*   **UI Library:** React
*   **Build Tool:** Vite
*   **Routing Library:** `react-router-dom`

### 4.2. Core Components

*   **`frontend/src/App.jsx`**: The root component of the React application. It is responsible for setting up the main routing structure using `react-router-dom` and often handles global concerns like authentication context.
*   **`frontend/src/components/MainLayout.jsx`**: Defines the overarching layout of the application. It typically includes the `Sidebar.jsx` and a content area where different module components are rendered based on the current route. This component ensures a consistent UI across the application.
*   **`frontend/src/components/Sidebar.jsx`**: Manages the primary navigation menu. It contains links to various modules and sections of the ERP application. Any new module added to the system will require a corresponding link here.
*   **Module Components**: Located within `frontend/src/components` (e.g., `StockManager.jsx`, `PcbManager.jsx`). These are specialized components that implement the user interface and logic for specific backend modules.

### 4.3. Routing
*   **Library:** `react-router-dom` is used for declarative routing within the single-page application.
*   **Route Definition:** Routes are primarily defined and managed within `frontend/src/App.jsx` and `frontend/src/components/MainLayout.jsx`. These files map URL paths to specific React components.

### 4.4. State Management
*   **Current Approach:** The application primarily uses a combination of local component state (managed by React's `useState` and `useReducer` hooks) and props drilling for passing data down the component tree.
*   **Future Considerations:** For more complex global state management needs, especially as the application grows, integrating dedicated state management libraries like Redux or MobX could be considered to centralize and streamline state logic.

### 4.5. API Interaction
*   The frontend communicates with the backend API via standard HTTP requests. While no specific library was mentioned in the `README.md`, it is common for React applications to use the built-in `fetch` API or a library like `axios` for making these requests.

## 5. Building and Running (Frontend Specific)

All commands for the frontend should be executed from within the `frontend/` directory.

*   **Installation:**
    ```bash
    npm install
    ```
    (This command installs all necessary Node.js packages and dependencies defined in `frontend/package.json`.)
*   **Running (Development Mode):**
    ```bash
    npm run dev
    ```
    (This command starts the Vite development server, which provides features like hot module replacement (HMR) for a fast development feedback loop. The application will typically be accessible at `http://localhost:5173` or a similar port.)
*   **Building for Production:**
    ```bash
    npm run build
    ```
    (This command compiles and bundles the React application for production deployment. The optimized static assets (HTML, CSS, JavaScript) will be generated in the `frontend/dist` directory, ready to be served by a web server.)

## 6. Development Conventions (Frontend Specific)

*   **Framework Adherence:** The frontend strictly follows React best practices and conventions.
*   **Code Quality:** `eslint` is configured and used to enforce code style, identify potential issues, and maintain code consistency across the frontend codebase.
*   **Component-Based Development:** Emphasis on creating reusable and modular React components.

## 7. Important Files and Directories (Frontend Specific)

This section highlights key files and directories within the `frontend/` project structure that are crucial for an LLM to understand the frontend's operational aspects and development environment.

*   **`frontend/package.json`**: Defines project metadata, scripts specific to the frontend (e.g., `dev`, `build`), and lists all frontend dependencies.
*   **`frontend/package-lock.json`**: Records the exact versions of frontend dependencies, ensuring consistent builds.
*   **`frontend/vite.config.js`**: The configuration file for Vite, defining how the project is built, served, and optimized.
*   **`frontend/src/main.jsx`**: The primary entry point for the React application. This file typically renders the root `App` component into the DOM.
*   **`frontend/src/App.jsx`**: (Already described in Core Components) The main application component, handling global routing and structure.
*   **`frontend/src/components/`**: This directory contains all reusable React components, including shared UI elements and module-specific components.
*   **`frontend/src/assets/`**: A common directory for storing static assets like images, icons, or fonts that are directly imported into components.
*   **`frontend/public/`**: Contains static assets that are served directly by the web server without being processed by Vite (e.g., `index.html`, `favicon.ico`).
*   **`frontend/dist/`**: The output directory where the production-ready, bundled, and optimized frontend application files are placed after running `npm run build`.
*   **`frontend/node_modules/`**: Contains all installed Node.js modules and libraries specifically for the frontend project.
