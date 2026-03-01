# User Acceptance Testing (UAT) & Quality Assurance Plan

**Project Name:** Northern Legacy E-Commerce Portal
**Developer/Tester:** Greg Farrel
**Date of Testing:** 2026-02-28
**Project Version/Release:** v1.0 - Production Candidate

---

## 1. Testing Environment Checklist

- **Operating Systems Tested:** Windows 11 (Desktop), Android (Mobile Testing)
- **Browsers Tested:** Google Chrome (Desktop & Mobile)
- **Device Viewports:** - Desktop (1920x1080)
  - Mobile (390x844)

---

## 2. Testing Protocol & Evidence

- **Goal:** Verify that the platform strictly enforces New York State OCM compliance, land-based geofencing, and real-time inventory synchronization.
- **Status Codes:** - **PASS:** Feature meets all regulatory and functional requirements.
  - **FAIL:** Feature produces a logic error or compliance breach.
  - **FLAG:** Feature works, but requires UX refinement.

---

## 3. Test Cases

### Phase 1: Authentication & Compliance (The Gatekeeper)

| ID | Feature | Steps to Execute | Expected Result | Pass/Fail | Screenshot Proof |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **AUTH-01** | Identity Verification Gate | Attempt to access `/checkout` as a guest user. | App intercepts and redirects to IDV onboarding flow. | **PASS** | `image_d36b23.png` |
| **AUTH-02** | 21+ Biometric Check | Submit ID and selfie via Persona sandbox. | `isVerified` toggles to True upon backend webhook confirmation. | **PASS** | `image_d36b23.png` |
| **AUTH-03** | Cross-Tab Session Sync | Log in as "Tom" in Tab A and "Greg" in Tab B. | Tab A instantly updates to "Tom" to prevent session conflicts. | **PASS** | `image_d3605c.png` |

### Phase 2: Core E-Commerce & Inventory

| ID | Feature | Steps to Execute | Expected Result | Pass/Fail | Screenshot Proof |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **CRUD-01** | Real-Time Inventory Locking | Add last unit of "Dubba Dosi" to cart and attempt checkout. | Inventory is locked; second user sees "Out of Stock" immediately. | **PASS** | `image_d4547b.png` |
| **CRUD-02** | In-Store Pickup Hold | Place a pickup order with "Pay In-Store" selected. | Order enters "Awaiting Pickup" status with 24-hour countdown. | **PASS** | `image_d36b23.png` |
| **CRUD-03** | QR Handoff Token | Complete a delivery order via Aeropay ACH. | Secure QR code is generated in dashboard for driver scanning. | **PASS** | `image_d3603c.png` |

### Phase 3: NYS Compliance & Geofencing

| ID | Feature | Steps to Execute | Expected Result | Pass/Fail | Screenshot Proof |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **COMP-01** | Flower/Concentrate Limits | Add 3.13oz of flower to cart. | Checkout button is disabled; UI shows red progress bars. | **PASS** | `image_d4547b.png` |
| **COMP-02** | Daily Purchase Cap | Attempt to place a second order after buying 3.0oz earlier that day. | Backend blocks order; UI shows "Legal Limit Exceeded" warning. | **PASS** | `image_c972b7.png` |
| **GEO-01** | Land Delivery Radius | Enter an address outside the 30-mile radius. | Geofencer resolves distance and blocks transaction. | **PASS** | `EditDeliveryScreen.jsx` |

### Phase 4: Third-Party Integrations

| ID | Feature | Steps to Execute | Expected Result | Pass/Fail | Screenshot Proof |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **INT-01** | Google Address Validation | Begin typing a standard street address. | App populates verified city/zip for land delivery. | **PASS** | `ShippingScreen.jsx` |
| **INT-02** | Aeropay ACH Payment | Link bank account and authorize total amount including taxes. | Funds processed into escrow; order status updates to "Paid". | **PASS** | `image_d3603c.png` |

### Phase 5: UI/UX & Responsiveness

| ID | Feature | Steps to Execute | Expected Result | Pass/Fail | Screenshot Proof |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **UI-01** | Dynamic Scarcity Badges | View product with < 3 units remaining. | UI renders "Only X remaining!" to drive urgency. | **PASS** | `CartScreen.jsx` |
| **UI-02** | Limit Warning Banner | Cart state exceeds legal limits. | Highly visible red warning banner appears instructing user to reduce items. | **PASS** | `image_c972b7.png` |

---

## 4. Final Sign-Off

*By signing below, the Lead Engineer confirms that the platform enforces all implemented NYS OCM mandates, specifically regarding possession limits, identity verification, and land-based geofencing.*

**Developer Signature:** _Greg Farrel_ **Date:** 2026-02-28