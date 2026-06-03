# 📑 Invoice Application

Welcome to the **Invoice Application**! This is a modern, responsive, and feature-rich React web application designed to help businesses manage their product catalog, track sales, generate invoices, and analyze revenue trends.

---

## ✨ Features

- **🔒 Authentication & Security**: Complete user registration and login flow with session persistence.
- **📊 Business Dashboard**: Real-time sales analytics, including:
  - Interactive trend lines for revenue analysis.
  - Top-selling products charts.
  - Quick date filters (Today, Week, Month, Year, and Custom range).
- **📦 Catalog Management**: Create, update, and manage products/services:
  - Upload catalog item preview pictures.
  - Configure sales rates and default discounts.
  - Export the catalog to CSV.
- **📝 Invoice Editor**: Fast and keyboard-shortcut friendly invoice generator:
  - Dynamic calculations for sub-totals, tax amounts, and final billing totals.
  - Keyboard shortcuts (`Ctrl+Enter` to save, `Alt+N` to add a new line).
  - Copy and delete line items on the fly.
  - Export invoices database to CSV format.
- **🖨️ Professional Print Mode**: High-quality corporate printable A4 layout with print-specific stylesheet overrides.

---

## 🛠️ Tech Stack

- **Framework**: React 19 (TypeScript)
- **Bundler & Tooling**: Vite
- **UI Components**: Material-UI (MUI) Icons & Selects
- **Styling**: Vanilla CSS (Modular folder structure per page/component)
- **HTTP Client**: Axios (for API integrations)

---

## 🚀 Getting Started

### Prerequisites

Ensure you have **Node.js** (v18 or higher) and **npm** installed on your system.

### Installation

1. Clone or extract the project directory.
2. Open a terminal in the project root and run:
   ```bash
   npm install
   ```

### Running Locally

To start the local development server with Hot Module Replacement (HMR):
```bash
npm run dev
```
Once started, open the local URL in your browser (typically `http://localhost:5173`).

### Production Build

To compile the application code-splitting, bundle assets, and perform type-safe production check:
```bash
npm run build
```
The output assets will be created in the `dist/` directory.

### Preview Build

To preview the built production bundle locally:
```bash
npm run preview
```

---

## 📁 Project Structure

```text
src/
├── assets/         # App logo and static SVGs
├── components/     # Reusable UI layouts, buttons, cards, inputs, and modals
├── context/        # React context providers (Authentication, Toast notifications)
├── hooks/          # Custom hooks wrapping API endpoints (useAuthApi, useItemsApi, useInvoicesApi)
├── pages/          # Page layouts (Login, Signup, Catalog list, Invoices dashboard, Print views)
├── routes/         # Lazy-loaded router declarations
├── services/       # Base Axios instance and global utility helpers
└── types/          # Strict TypeScript interface declarations
```

---

## 🎹 Keyboard Shortcuts (Invoice Editor)

Increase your productivity using these built-in keys inside the Invoice Editor page:
- **`Alt + N`**: Instantly add a new blank line item.
- **`Ctrl + Enter`** (or `Cmd + Enter` on macOS): Save/Submit the invoice.
