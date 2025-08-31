# GEMINI.md - Frontend Project Documentation for LLM

This document provides a comprehensive and detailed overview of the frontend application, designed to be easily parsable and understood by a Large Language Model (LLM) for development and maintenance tasks. It focuses exclusively on the frontend's purpose, architecture, modularity, technology stack, conventions, and key file structures.

## 1. Project Overview (Frontend Specific)

This project's frontend is a Single-Page Application (SPA) built with React and Vite. It serves as the user interface for the larger Enterprise Resource Planning (ERP) system. Its primary function is to provide an interactive and responsive experience for users, allowing them to interact with the backend API to manage various aspects of the ERP system, such as stock, BOMs, procurement, and production.

**Key Characteristics:**
*   **User Interface:** Provides all visual and interactive elements for the ERP system.
*   **Decoupled:** Operates independently from the backend, communicating via API calls.
*   **Modern Tooling:** Utilizes React for UI development and Vite for a fast development experience and optimized builds.
*   **Component-Based:** Built with a modular and reusable component architecture.
*   **Internationalization (i18n):** Supports multiple languages through the use of `i18next`.

## 2. Technology Stack

*   **UI Library:** [React](https://reactjs.org/) 18.x
*   **Build Tool:** [Vite](https://vitejs.dev/) 7.x
*   **Routing:** [React Router](https://reactrouter.com/) 6.x
*   **UI Framework:** [React Bootstrap](https://react-bootstrap.github.io/) 2.x
*   **API Communication:** [Axios](https://axios-http.com/)
*   **State Management:** React Hooks (`useState`, `useReducer`, `useContext`)
*   **Internationalization (i18n):** [i18next](https://www.i18next.com/) and [react-i18next](https://react.i18next.com/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)

## 3. Project Structure

The `frontend/src` directory is the heart of the application and is organized as follows:

*   **`api/`**: Contains all the API service files that are responsible for making requests to the backend. Each file typically corresponds to a specific backend module (e.g., `auth.js`, `stock.js`, `pcb.ts`).
*   **`assets/`**: Contains static assets such as images, logos, and fonts.
*   **`components/`**: Contains reusable and shared components that are used across multiple modules. This includes common UI elements like buttons, modals, and layout components.
    *   **`common/`**: A subdirectory for generic, reusable components (e.g., `ErrorBoundary.tsx`, `LoadingSpinner.tsx`, `PaginatedTable.tsx`).
*   **`context/`**: Contains React context providers, which are used for managing global state. The `AuthContext.tsx` is a key part of this directory.
*   **`modules/`**: This is the core of the application's modular architecture. Each subdirectory represents a specific feature or domain of the ERP system.
    *   **`auth/`**: Contains components related to user authentication (e.g., `Login.tsx`).
    *   **`bom-management/`**: Components for managing Bill of Materials (BOMs).
    *   **`component-management/`**: Components for managing the master list of components.
    *   **`importer/`**: Components for importing data, such as the `CsvUploader.tsx`.
    *   **`pcb-management/`**: Components for managing Printed Circuit Boards (PCBs), such as `PcbManager.tsx`, `PcbCreator.tsx`, and `PcbMapper.tsx`.
    *   **`procurement/`**: Components for managing procurement processes.
    *   **`production/`**: Components for managing production planning, such as `ProductionPlanner.tsx`.
    *   **`stock-management/`**: Components for managing stock and inventory, such as `StockManager.tsx`.
*   **`routes/`**: This directory is not currently used, but it could be used in the future to define the application's routes in a more organized way.
*   **`App.css`**: Global CSS styles for the application.
*   **`App.tsx`**: The root component of the application.
*   **`i18n.ts`**: The configuration file for `i18next`.
*   **`index.css`**: The main CSS file that is imported into `main.tsx`.
*   **`main.tsx`**: The entry point of the application.

## 4. Core Components

*   **`App.tsx`**: The root component that sets up the main router and wraps the application with the `AuthProvider` and `ErrorBoundary`.
*   **`MainLayout.tsx`**: Defines the main layout of the application, including the `Sidebar` and the main content area. It also defines the routes for the different modules.
*   **`Sidebar.tsx`**: The sidebar navigation component that provides links to the different modules.
*   **`Login.tsx`**: The login component that handles user authentication.

## 5. Modules

Each module in the `frontend/src/modules` directory is responsible for a specific feature of the ERP system. The modules are designed to be self-contained and independent of each other.

### 5.1. Authentication (`auth`)

*   **`Login.tsx`**: A form that allows users to log in to the application. It uses the `useAuth` hook to access the `login` function from the `AuthContext`.

### 5.2. Stock Management (`stock-management`)

*   **`StockManager.tsx`**: A component that displays a table of stock items and allows users to add, update, and delete stock. It uses the `stockApi` service to make API requests to the backend.

### 5.3. PCB Management (`pcb-management`)

*   **`PcbManager.tsx`**: A component for managing PCBs and their associated BOMs.
*   **`PcbCreator.tsx`**: A form for creating new PCBs.
*   **`PcbMapper.tsx`**: A component for mapping BOM items to existing components in the inventory.

### 5.4. Importer (`importer`)

*   **`CsvUploader.tsx`**: A component that allows users to upload CSV files to import data into the system.

### 5.5. Production (`production`)

*   **`ProductionPlanner.tsx`**: A component for planning production orders based on the availability of components.

## 6. State Management

State management in the application is handled primarily through a combination of local component state (`useState`) and global state managed by React Context and the `useReducer` hook.

### 6.1. Authentication State

The authentication state is managed by the `AuthContext` (`frontend/src/context/AuthContext.tsx`). This context provides the `isLoggedIn`, `user`, and `isLoading` state, as well as the `login` and `logout` functions.

The `AuthProvider` component uses a `useReducer` hook to manage the authentication state. The `authReducer` function handles the `LOGIN`, `LOGOUT`, and `SET_LOADING` actions.

## 7. API Interaction

The frontend communicates with the backend API using the `axios` library. The API service files are located in the `frontend/src/api` directory.

Each API service file exports an object that contains a set of functions for making API requests to a specific backend module. For example, the `stockApi` object in `frontend/src/api/stock.js` provides functions for getting, adding, updating, and deleting stock.

An `axios` instance is configured in `frontend/src/api/axiosInstance.js` to automatically include credentials (cookies) in all requests.

## 8. Routing

Routing is handled by the `react-router-dom` library. The main routes are defined in `frontend/src/components/MainLayout.tsx`.

The application uses lazy loading with `React.lazy` to split the code for each module into separate chunks. This improves the initial loading time of the application.

The `AuthRoutes` component in `frontend/src/App.tsx` handles the authentication-related routing. If the user is logged in, the `MainLayout` component is rendered. Otherwise, the user is redirected to the `/login` page.

## 9. Styling

Styling is handled by a combination of [React Bootstrap](https://react-bootstrap.github.io/) and custom CSS.

*   **React Bootstrap:** The application uses React Bootstrap components for the main UI elements, such as buttons, forms, tables, and modals.
*   **Custom CSS:** Custom CSS is used for fine-tuning the styles and for creating custom components. The main CSS files are `frontend/src/App.css` and `frontend/src/index.css`.
*   **Theme:** The application uses a custom theme based on the `brite.min.css` file.

## 10. Internationalization (i18n)

Internationalization is handled by the `i18next` and `react-i18next` libraries. The configuration file is `frontend/src/i18n.ts`.

The `useTranslation` hook is used in the components to access the translation function (`t`). The translation keys are defined in the `i18n.ts` file.

## 11. Building and Running

All commands for the frontend should be executed from within the `frontend/` directory.

*   **Installation:**
    ```bash
    npm install
    ```
*   **Running (Development Mode):**
    ```bash
    npm run dev
    ```
*   **Building for Production:**
    ```bash
    npm run build
    ```

## 12. Development Conventions

*   **Framework Adherence:** The frontend strictly follows React best practices and conventions.
*   **Code Quality:** `eslint` is configured and used to enforce code style, identify potential issues, and maintain code consistency across the frontend codebase.
*   **Component-Based Development:** Emphasis on creating reusable and modular React components.
*   **File Naming:** Component files are named using PascalCase (e.g., `StockManager.tsx`). API service files are named using camelCase (e.g., `stockApi.js`).
*   **Typing:** The application is written in TypeScript, and all props, state, and function parameters should be typed.
