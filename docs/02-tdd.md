**Technical Design Document (TDD)**

**Project Name:** Northern Legacy E-Commerce Portal 

**Developer:** Greg Farrel 

**Date:** 2026-02-14 

**1. Architecture & Tech Stack**

**Frontend:** React.js (Vite), Custom CSS, Zustand
**Backend:** Node.js, Express.js
**Database:** MongoDB Atlas (Mongoose ODM) 
**Infrastructure:** AWS ECS (Fargate), AWS VPC, AWS WAF, S3 Object Lock

**2. Database Schema (MongoDB)**

**Model: Users**
- `_id`: ObjectId
- `authProvider`: Enum ["local", "google", "facebook"]
- `googleId`, `facebookId`: String
- `email`: String (Required, Unique)
- `passwordHash`, `sessionToken`: String
- `firstName`, `lastName`, `dateOfBirth`: String
- `isVerified`: Boolean (Default: false)
- `verificationRefNumber`, `idDocumentHash`, `idExpirationDate`: String
- `preferredFirstName`, `preferredLastName`: String
- `syncName`: Boolean
- `phoneNumber`, `contactEmail`: String
- `syncEmail`, `emailOptIn`, `smsOptIn`, `mailOptIn`, `isAnonymized`: Boolean
- `smsOptInTimestamp`: Date
- `address`: Object { street, city, postalCode, terrainType, lat, lng }
- `mailingAddress`: Object { street, city, postalCode }
- `syncAddresses`: Boolean
- `linkedAch`, `linkedDebit`: String
- `deliveryStrikes`: Array of Dates
- `isDeliveryBanned`: Boolean (Default: false)
- `role`: Enum ["customer", "admin", "budtender", "driver"] (Default: "customer")
- `savedCart`: Array [{ product (Ref: Product), qty }]

**Model: Products**
- `_id`: ObjectId
- `name`, `brand`: String (Required)
- `category`: Enum ["Flower", "Vape", "Edible", "Concentrate", "Pre-Roll", "Tincture", "Accessory"] (Required)
- `strainType`: Enum ["Sativa", "Indica", "Hybrid", "N/A", ""]
- `strainLineage`, `description`: String
- `price`: Number (Required)
- `image`: String (Required)
- `stockQuantity`: Number (Required, Default: 0)
- `metrcPackageUid`: String (Required, Unique)
- `thcContent`: Number
- `testingStatus`: Enum ["Not Submitted", "TestPassed", "RetestPassed", "Failed"]
- `weightInOunces`, `concentrateGrams`: Number (Default: 0)
- `isLimitedRelease`, `isOnSpecial`: Boolean (Default: false)

**Model: Orders**
- `_id`: ObjectId
- `customerId`: ObjectId (Ref: User, Required)
- `items`: Array [{ name, category, quantity, priceAtPurchase, weightInOunces, concentrateGrams, metrcPackageUid, productId (Ref: Product) }]
- `totalAmount`, `totalWeightInOunces`, `totalConcentrateGrams`: Number
- `orderPlacedAt`, `orderPaidAt`, `orderFulfilledAt`: Date
- `shippingAddress`: Object { address, city, postalCode, terrainType, deliveryDate, deliveryTimeSlot, lat, lng }
- `paymentMethod`: String (Required)
- `orderType`: Enum ["In-Store POS", "In-Store Pickup", "Land Delivery", "Water Delivery"] (Required)
- `status`: Enum ["Paid-Pending Delivery", "Paid-Pending Pickup", "Unpaid-Pending Pickup", "Completed", "Cancelled"] (Required)
- `metrcApiStatus`: Enum ["Pending", "Success", "Failed - Queued for Retry"]
- `metrcSalesReceiptId`, `handoffToken`: String
- `deliveryCoordinates`: GeoJSON Point { type, coordinates: [Number] }

**Model: DeliverySchedules**
- `_id`: ObjectId
- `date`: String (Format: YYYY-MM-DD, Required)
- `timeSlot`: Enum ["Morning (8am - 12pm)", "Afternoon (12pm - 4pm)", "Evening (4pm - 8pm)"] (Required)
- `status`: Enum ["Open", "Anchored", "Full"] (Default: "Open")
- `anchorCoordinates`: Object { lat, lng }
- `currentOrderCount`: Number (Default: 0, Max: 12)

**3. API Endpoints (Express.js)**

| **Method** | **Endpoint** | **Description** | **Auth Required** |
| --- | --- | --- | --- |
| **POST** | `/api/users/register` | Creates a new user profile. | **No** |
| **POST** | `/api/users/login` | Authenticates user via email and password. | **No** |
| **POST** | `/api/users/google` | Authenticates user via Google OAuth credential. | **No** |
| **POST** | `/api/users/logout` | Clears the JWT HTTP-only cookie to log out. | **No** |
| **GET** | `/api/users/profile` | Retrieves the authenticated user's profile data. | **Yes** |
| **PUT** | `/api/users/profile` | Updates user preferences, addresses, and marketing opt-ins. | **Yes** |
| **DELETE** | `/api/users/profile` | Anonymizes the user's PII and closes the account. | **Yes** |
| **GET** | `/api/users/cart` | Retrieves the user's securely saved cart from the database. | **Yes** |
| **PUT** | `/api/users/cart` | Synchronizes the local Zustand cart to the database. | **Yes** |
| **GET** | `/api/products` | Fetches the full public catalog of available inventory. | **No** |
| **GET** | `/api/products/:id` | Fetches details for a specific product by its ID. | **No** |
| **POST** | `/api/orders` | Enforces compliance limits, deducts inventory, and creates order. | **Yes** |
| **GET** | `/api/orders/myorders` | Retrieves all historical transactions for the logged-in user. | **Yes** |
| **GET** | `/api/orders/:id` | Securely retrieves a specific order by ID. | **Yes** |
| **POST** | `/api/delivery/slots` | Calculates Haversine distance and returns dynamic time slots. | **Yes** |
| **POST** | `/api/webhooks/id-verification` | Receives async IDV success/fail status from Persona/Jumio. | **No (Webhook)** |

***4. Backend Controllers & Functions**

**File: `orderController.js`**
- `addOrderItems`: Acts as the primary transaction gatekeeper. Validates cart limits, enforces $100 delivery minimums, and calculates aggregate weight/concentrates against NYS daily possession constraints. Implements race-condition mitigation for both inventory shortages and Dynamic Anchor slot capacity/distance rules. Generates secure QR handoff tokens, executes inventory deduction, plants route anchors, and persists the order.
- `getOrderById`: Fetches specific order details securely for the authorized customer or system admin.
- `getMyOrders`: Retrieves historical transactions for the authenticated user session.

**File: `deliveryController.js`**
- `getDeliverySlots`: Generates a rolling 3-day delivery schedule based on global store settings and daily cutoff hours. Calculates dynamic availability by running user coordinates against existing route anchors using the Haversine distance formula to strictly enforce the 8-mile routing radius and 12-order vehicle capacity limits.

**File: `productController.js`**
- `getProducts`: Fetches the full public catalog of available inventory from the database.
- `getProductById`: Retrieves specific, detailed information for a single product by its MongoDB ID.

**File: `userController.js`**
- `authUser`: Authenticates users via standard email/password, generates secure session tokens, and returns a signed JWT.
- `googleAuth`: Processes Google OAuth credentials via the `google-auth-library`, seamlessly links returning users to existing accounts, or creates new passwordless profiles before returning a signed JWT.
- `registerUser`: Validates input and creates a new local user profile, immediately authenticating them.
- `logoutUser`: Destroys the authenticated session by clearing the HTTP-only JWT cookie.
- `saveUserCart` & `getUserCart`: Synchronizes the frontend Zustand shopping cart array with the user's permanent database record for cross-device state persistence.
- `getUserProfile`: Securely retrieves the authenticated user's personal details, linked payment methods, and saved addresses.
- `updateUserProfile`: Updates granular user preferences, marketing opt-ins, and dual payment methods. Contains specific logic to conditionally sync preferred/legal names and physical/mailing addresses based on verification status and terrain type.
- `deleteAccount`: Executes a strict profile teardown to comply with consumer data privacy regulations. Overwrites user PII with anonymized strings, nullifies ID document hashes, clears saved carts/addresses, and permanently disables the account.

**File: `webhookController.js`**
- `handleIdVerificationWebhook`: Ingests asynchronous webhooks from the identity verification provider (Persona/Jumio). Parses OCR document data, applies cryptographic hashing to identification numbers to block duplicate account creation (ban evasion), stamps the user profile as `isVerified`, and generates mock compliance dates for sandbox testing.

**5. Frontend Architecture (React)**

**5.1. Page Routes**
- **`/` & `/merch`**: Main catalog views (`HomeScreen`, `MerchScreen`) for browsing standard inventory and merchandise.
- **`/product/:id`**: Detailed view for individual items (`ProductScreen`).
- **`/cart`**: Shopping cart (`CartScreen`) that acts as the initial compliance engine enforcing NYS limits.
- **`/login` & `/register`**: Account access and creation flows (`LoginScreen`, `RegisterScreen`).
- **`/verify`**: The mandatory identity verification gate (`VerificationScreen`).
- **Checkout Flow (`/order-type`, `/shipping`, `/payment`, `/placeorder`)**: A strict, multi-step funnel handling fulfillment selection, Google Autocomplete address validation/geofencing, payment method selection, and final order commit logic.
- **`/order/:id`**: Order success and history view (`OrderConfirmationScreen`) that renders dynamic details and the secure QR handoff token.
- **Profile Hub (`/profile`, `/profile/contact`, `/profile/delivery`, `/profile/bank`)**: A centralized dashboard (`ProfileDashboardScreen` and sub-screens) for managing PII, saved addresses, marketing opt-ins, and linked payment methods.

**5.2. State Management Strategy**
- **Zustand (`store/cartStore.js` & `store/authStore.js`):** Lightweight, unopinionated global state management. Handles the active shopping cart arrays, user session token persistence, and complex data synchronization (e.g., automatically merging a guest cart into a user's database cart upon login).

**5.3. Styling Guidelines**
- **Standard CSS & Dynamic Inline Styles:** The application utilizes standard CSS stylesheets (managed within the `src/styles/` directory) paired with dynamic React inline styles (`style={{...}}`) to handle conditional rendering, grid layouts, and mobile-first responsiveness, intentionally avoiding heavy utility-class frameworks like Tailwind CSS.

**6. Third-Party APIs & Integrations**

- **Identity Verification (Persona):**
  - **Purpose:** OCR parsing of physical ID cards and biometric liveness validation. 
  - **Implementation:** Webhooks utilized to flip `isVerified` booleans without retaining raw PII image files. 
- **Google OAuth / SSO:**
  - **Purpose:** Frictionless user authentication and account creation without requiring manual passwords.
  - **Implementation:** Frontend token generation via `@react-oauth/google`, validated securely on the backend using `google-auth-library` to automatically link or provision user profiles.
- **State Compliance (Metrc):**
  - **Purpose:** NYS OCM mandate for tracking incoming wholesale manifests and reporting real-time sales data. 
- **Payments (Aeropay / Dutchie Pay):**
  - **Purpose:** MRB-friendly ACH bank transfers to circumvent federal credit card restrictions. 
  - **Implementation:** Handles mandatory upfront delivery prepayments and automated ACH refunds for failed deliveries. 
- **Google Maps Platform:**
  - **Purpose:** Geocoding for border validation, Plus Code generation, and Haversine matrix calculations for the Dynamic Anchor algorithm. 
- **Communications (Twilio / SendGrid):**
  - **Purpose:** TCPA/10DLC compliant SMS marketing and transactional routing alerts (1-hour window notifications).