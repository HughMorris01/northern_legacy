**Technical Design Document (TDD)**

**Project Name:** Northern Legacy E-Commerce Portal 

**Developer:** Greg Farrel 

**Date:** 2026-02-14 

**1. Architecture & Tech Stack**

**Frontend:** React.js (Vite), Tailwind CSS, Zustand
**Backend:** Node.js, Express.js
**Database:** MongoDB Atlas (Mongoose ODM) 
**Infrastructure:** AWS ECS (Fargate), AWS VPC, AWS WAF, S3 Object Lock

**2. Database Schema (MongoDB)**

**Model: Users** 
- `_id`: ObjectId
- `firstName`, `lastName`: String (Required)
- `email`: String (Unique)
- `passwordHash`: String
- `idDocumentHash`: String (Unique hash to prevent duplicate accounts)
- `isVerified`: Boolean (Default: false)
- `deliveryStrikes`: Array of Timestamps
- `isDeliveryBanned`: Boolean
- `role`: Enum ["customer", "admin", "budtender", "driver"]
- `smsOptIn`: Boolean

**Model: Products** [cite: 331-341]
- `_id`: ObjectId
- `name`, `category`: String
- `price`, `stockQuantity`, `weightInOunces`: Number
- `isLimitedRelease`: Boolean
- `metrcPackageUid`: String
- `metrcLabStatus`: Enum ["TestPassed", "Testing", "Failed"]

**Model: Orders** [cite: 348-360]
- `_id`: ObjectId
- `customerId`: ObjectId (Ref: Users)
- `items`: Array [{ productId, quantity, priceAtPurchase, metrcPackageUid }]
- `orderType`: Enum ["In-Store POS", "In-Store Pickup", "Land Delivery", "Water Delivery"]
- `status`: Enum ["Pending", "Awaiting Pickup", "Paid", "Completed", "Cancelled"]
- `handoffToken`: String
- `totalAmount`: Number

**Model: RouteManifests** 
- `_id`: ObjectId
- `deliveryDate`: Date
- `terrainType`: Enum ["Land", "Water"]
- `timeWindow`: Enum ["Morning", "Afternoon", "Evening"]
- `anchorCoordinates`: Object { lat, lng }
- `isLocked`: Boolean

**Model: DeliveryTelematics** 
- `_id`: ObjectId
- `driverId`: ObjectId (Ref: Users)
- `location`: Object { lat, lng }
- `timestamp`: Timestamp

**3. API Endpoints (Express.js)**

| **Method** | **Endpoint** | **Description** | **Auth Required** |
| --- | --- | --- | --- |
| **POST** | `/api/v1/auth/register` | Creates a new user profile and returns JWT.  | **No** |
| **POST** | `/api/v1/webhooks/id-verification` | Receives async IDV status from Persona/Jumio. | **No (Webhook)** |
| **POST** | `/api/v1/orders/checkout` | Processes ACH payment, generates QR Token, creates order. | **Yes (Customer)** |
| **PUT** | `/api/v1/orders/:id/status` | Updates order status and triggers Metrc API push. | **Yes (Admin/Staff)** |
| **GET** | `/api/v1/logistics/available-windows` | Returns available Dynamic Anchor time windows. | **Yes** |
| **POST** | `/api/v1/deliveries/:orderId/verify-handoff` | Validates QR Token and 2D Barcode scan data. | **Yes (Driver)** |
| **POST** | `/api/v1/deliveries/telematics` | Receives offline-cached GPS breadcrumbs from drivers. | **Yes (Driver)** |

**4. Backend Controllers & Functions**

**File: `orderController.js`**
- `addOrderItems`: Validates cart limits, enforces $100 delivery minimums, calculates aggregate weight against NYS compliance constraints, generates secure QR handoff tokens, executes inventory deduction, and persists order.
- `getOrderById`: Fetches specific order details securely for the authorized customer or system admin.
- `getMyOrders`: Retrieves historical transactions for the authenticated user session.

**File: `deliveriesController.js`**
- `verifyHandoff`: Acts as the Dual-Scan protocol gatekeeper, preventing drivers from releasing product until the ID data and QR signature securely match the database. 
- `processTelematics`: Ingests queued location objects from the offline Service Worker to maintain OCM compliant driver routing histories. 

**5. Frontend Architecture (React)**

**5.1. Page Routes**
- **`/`**: Catalog menu with dynamic scarcity indicators. 
- **`/cart`**: Compliance engine enforcing 3.0oz / 24.0g NYS limits with visual progress bars. 
- **`/shipping`**: Uses Google Autocomplete to enforce 30-mile Land / 15-mile Water delivery boundaries and generates Plus Codes. 
- **`/admin`**: Role-restricted hub for inventory Metrc synchronization, staff management, and delivery exception handling. 
- **`/driver`**: PWA Offline-First manifest viewer and barcode scanner for captains and drivers. 

**5.2. State Management Strategy**
- **Zustand (`cartStore.js` / `authStore.js`):** Lightweight client-side state managing the current shopping cart arrays, user session data, and complex merge-conflict resolutions between guest carts and authenticated profiles.

**5.3. Styling Guidelines**
- **Tailwind CSS:** Fully utilizes utility classes for strict design uniformity, grid layouts, and mobile-first responsive design without bulky CSS stylesheets. 

**6. Third-Party APIs & Integrations**

- **Identity Verification (Persona/Jumio Sandbox):**
  - **Purpose:** OCR parsing of physical ID cards and biometric liveness validation. 
  - **Implementation:** Webhooks utilized to flip `isVerified` booleans without retaining raw PII image files. 
- **State Compliance (Metrc):**
  - **Purpose:** NYS OCM mandate for tracking incoming wholesale manifests and reporting real-time sales data. 
- **Payments (Aeropay / Dutchie Pay):**
  - **Purpose:** MRB-friendly ACH bank transfers to circumvent federal credit card restrictions. [cite: 489, 490]
  - **Implementation:** Handles mandatory upfront delivery prepayments and automated ACH refunds for failed deliveries. 
- **Google Maps Platform:**
  - **Purpose:** Geocoding for border validation, Plus Code generation, and Haversine matrix calculations for the Dynamic Anchor algorithm. [cite: 493, 494, 495, 496]
- **Communications (Twilio / SendGrid):**
  - **Purpose:** TCPA/10DLC compliant SMS marketing and transactional routing alerts (1-hour window notifications). 