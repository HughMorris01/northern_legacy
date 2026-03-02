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
| **AUTH-01** | Identity Verification Gate | Attempt to access `/checkout` as a guest user. | App intercepts and redirects to login screen. | **PASS** | ![Guest User Cart](./media/image-1.png) ![Sent to Login](./media/image-2.png) |
| **AUTH-02** | 21+ Biometric Check | Submit ID and selfie via Persona sandbox. | `isVerified` toggles to True upon backend webhook confirmation. | **PASS** | ![alt text](./media/image-28.png) ![Verification Process](./media/image-29.png) ![Verification Completed](./media/image-30.png) ![isVerified true](./media/image-3.png) |
| **AUTH-03** | Cross-Tab Session Sync | Log in as "Tom" in Tab A and "Greg" in Tab B. | Tab A instantly updates to "Greg" to prevent session conflicts. | **PASS** | ![User A](./media/image-4.png) ![User B](./media/image-5.png) ![User A](./media/image-6.png)|

### Phase 2: Core E-Commerce & Inventory

| ID | Feature | Steps to Execute | Expected Result | Pass/Fail | Screenshot Proof |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **CRUD-01** | Real-Time Race Condition Inventory Locking | User Tom adds last 3 units of "Dubba Dosi" to cart and proceeds to checkout. Simultaneously User Greg adds 1 unit of "Dubba Dosi" to cart and proceeds to checkout. Tom places order before Greg taking all available inventory| Inventory is locked; User Greg sees that he must adjust cart . | **PASS** | ![User A](./media/image-7.png) ![User A adds](./media/image-8.png) ![User A Checkout](./media/image-31.png) ![User B](./media/image-32.png) ![User B Adds](./media/image-33.png) ![User B Checkout](./media/image-9.png) ![User A Fulfills](./media/image-10.png) ![User B Rejected](./media/image-11.png)|
| **CRUD-02** | In-Store Pickup Hold | Place a pickup order with "Pay In-Store" selected. | Order enters "Awaiting Pickup" status with 7 day countdown. | **PASS** | ![In-Store Pickup](./media/image-12.png) |
| **CRUD-03** | QR Handoff Token | Complete a delivery order via Aeropay ACH. | Secure QR code is generated in dashboard for driver scanning along with notification of delivery window. | **PASS** | ![Delivery Order](./media/image-16.png) |
| **CRUD-04** | Delivery Window & Smart Anchor Algorithm | User Tom places a delivery order for Theresa, NY in the Wednesday morning delivery window. User Greg places a delivery order for Clayton, NY (more than 8 miles from anchor) | The Wednesday Morning delivery window has been anchored by Tom and does not appear available to Greg | **PASS** | ![User Tom's Adderss](./media/image-34.png) ![Wednesday Morning Window](./media/image-35.png) ![User Greg's Address](./media/image-36.png) ![No Wednesday Morning Delivery](./media/image-37.png) |


### Phase 3: NYS Compliance & Geofencing

| ID | Feature | Steps to Execute | Expected Result | Pass/Fail | Screenshot Proof |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **COMP-01** | Flower/Concentrate Limits | Add 3.0oz of flower to cart. | Add button triggers toast warning and does not add additional product to cart | **PASS** | ![Legal Limit](./media/image-15.png) |
| **COMP-02** | Daily Purchase Cap | Attempt to place a second order after buying 3.0oz earlier that day. | Backend blocks order; UI shows "Legal Limit Exceeded" warning. | **PASS** | ![Daily Legal Limit](./media/image-13.png)|
| **COMP-3** | Merge Cart Limit Exceeded Scenario | Add items to cart as logged in guest, which persists in database. Logout and then create cart with guest user. Proceed to checkout which requires logging back in and select merge cart option to merge the newly created guest cart with the established user cart. | Highly visible red warning banner appears instructing user to reduce items to get back within legal compliance. | **PASS** | ![User Cart](./media/image-22.png) ![Logout](./media/image-43.png) ![Guest Cart](./media/image-23.png) ![Login Screen](./media/image-24.png) ![Merge Cart](./media/image-25.png) ![Legal Limit Exceeded](./media/image-26.png) ![Back in Compliance](./media/image-27.png) |
| **GEO-01** | Land Delivery Radius | Enter an address outside the 30-mile radius. | Geofencer resolves distance and blocks transaction. | **PASS** | ![Outside Delivery Zone](./media/image-14.png) |

### Phase 4: Third-Party Integrations

| ID | Feature | Steps to Execute | Expected Result | Pass/Fail | Screenshot Proof |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **INT-01** | Google Address Validation | Begin typing a standard street address. | App populates verified city/zip for land delivery. | **PASS** | ![Google Address Complete](./media/image-17.png) |
| **INT-02** | Persona Identity Verification | Create new user account and complete age verifcation process  | Profile screen updates from unverified to to verified | **PASS** | ![New User](./media/image-18.png) ![Verified User](./media/image-19.png) |

### Phase 5: UI/UX & Responsiveness

| ID | Feature | Steps to Execute | Expected Result | Pass/Fail | Screenshot Proof |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **UI-01** | Dynamic Scarcity Badges | View product with < 5 units remaining and add items to cart| UI renders "Only X remaining!" and updates on add to drive urgency. | **PASS** | ![4 Remaining](./media/image-20.png) ![3 Remaining](./media/image-21.png) ![Main Inventory Updated](./media/image-38.png)|
| **UI-02** | Profile Address Edit, Shipping Screen | Update user's default delivery address in the profile dashboard and select use profile address on shipping screen | New address should populate in shipping screen | **PASS** |![Old Address](./media/image-39.png) ![Edit Address](./media/image-40.png) ![Address Updated](./media/image-41.png) ![New Address Pulled to Shipping](./media/image-42.png)|

---

## 4. Final Sign-Off

*By signing below, the Lead Engineer confirms that the platform enforces all implemented NYS OCM mandates, specifically regarding possession limits, identity verification, and land-based geofencing.*

**Developer Signature:** _Greg Farrel_ **Date:** 2026-03-02