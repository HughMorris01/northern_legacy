# 🌲 Northern Legacy E-Commerce & Logistics Portal 🚤

Northern Legacy is a licensed microbusiness dispensing cannabis products in the 1000 Islands region of Upstate New York. This platform acts as a custom, vertically integrated regulatory gatekeeper, enabling fully compliant e-commerce ordering for both **Mainland (Land)** and **Maritime (Water)** delivery.

Built to handle the extreme geographic complexity of the St. Lawrence River border region, the system enforces strict geofencing, verifies delivery coordinates remain within U.S. sovereign waters, and interfaces directly with state compliance tracking (Metrc).

---

## 🚀 Key Features

* **🔒 The Compliance Gate:** Mandatory 21+ age gating integrated with third-party SOC-2 compliant Identity Verification (OCR + Biometric Liveness). Unique IDs are cryptographically hashed to prevent ban evasion.
* **🗺️ Border-Zone Geofencing:** HTML5 GPS coordinate enforcement (ignoring easily spoofed IP addresses) and active VPN/Proxy detection to prevent international boundary violations.
* **🚤 Maritime Logistics & Dynamic Anchoring:** Intelligent routing that calculates Haversine distances for water-based deliveries, utilizing Google Plus Codes for unaddressable docks and islands.
* **💳 High-Risk ACH Payment Engine:** Closed-loop, tokenized bank-to-bank checkout flow with a built-in state/local tax calculator and strict 7-day logistics forfeiture protocols.
* **📱 Omnichannel Architecture:** A centralized backend powering a Customer Web Portal, an In-Store Budtender POS (Point of Sale), and an Offline-First Driver PWA (Progressive Web App) equipped with dual-scan (QR + 2D Barcode) electronic signature capture.
* **📈 Metrc API Integration:** Automated, bi-directional syncing for incoming wholesale manifests and real-time outbound sales receipts.

---

## 🛠️ Tech Stack

**Frontend:**
* React.js (v18+)
* Vite (Build Tooling)
* Tailwind CSS & shadcn/ui (Styling & Accessibility)
* Zustand (Global State Management)
* vite-plugin-pwa (Offline Service Workers for Driver App)

**Backend & Database:**
* Node.js & Express.js
* MongoDB Atlas (Dedicated / Mongoose ODM)
* JSON Web Tokens (JWT) & bcryptjs (Auth & Security)
* Helmet & CORS (Network Protection)

---

## 💻 Local Development Setup

To run this application locally, you will need Node.js installed and access to the MongoDB Atlas cluster.

### 1. Clone the Repository
\`\`\`bash
git clone https://github.com/hughmorris01/northern_legacy.git
cd northern-legacy
\`\`\`

### 2. Install Dependencies
This project uses a monorepo structure. You must install dependencies for both the frontend and backend.
\`\`\`bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
\`\`\`

### 3. Environment Variables
Use env.example to create a `.env` file in the `backend` directory. Do **not** commit this file to version control. Request the active keys from the repository administrator.

\`\`\`text
# /backend/.env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0...
JWT_SECRET=your_jwt_secret_key
METRC_API_KEY=your_metrc_integration_key
\`\`\`

### 4. Start the Development Servers
Open two separate terminal windows or a split terminal.

**Terminal 1 (Backend):**
\`\`\`bash
cd backend
npm run dev
\`\`\`
*(Server will start on `http://localhost:5000`)*

**Terminal 2 (Frontend):**
\`\`\`bash
cd frontend
npm run dev
\`\`\`
*(Vite UI will start on `http://localhost:5173`)*

---

## ⚖️ License & Confidentiality
**Proprietary Software.** This source code is the confidential and proprietary property of Excelsior Genetics, LLC. Unauthorized copying, distribution, or modification is strictly prohibited.
