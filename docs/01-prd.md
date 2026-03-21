**Project Name:** Northern Legacy E-Commerce Portal  
**Version:** 1.0  
**Status:** Approved for Development  
**Stakeholders:** Excelsior Genetics (Parent), Northern Legacy (Retail DBA)

**1. Executive Summary**
* **The Problem:** Delivering cannabis in the geographically complex St. Lawrence River border region requires overcoming extreme logistical hurdles, preventing international delivery spoofing, and adhering to strict New York State Office of Cannabis Management (OCM) regulations.
* **The Solution:** A vertically integrated regulatory gatekeeper and e-commerce platform that enables compliant ordering for both Mainland (Land) and Maritime (Water) delivery.
* **Value Proposition:** The system enforces a hard 30-mile delivery radius, executes strict identity verification, and integrates directly with state compliance systems (Metrc) to protect the dispensary's operating license while servicing unique island-based customers.

**2. Target Audience & User Personas**
* **Primary User:** Cannabis consumers in the 1000 Islands region seeking local In-Store Pickup, standard Land Delivery, or specialized Water Delivery to unaddressable docks and islands.
* **Admin Users:** Dispensary owners managing inventory and resolving ID verification flags, Budtenders utilizing the integrated Point of Sale (POS), and Boat Captains/Drivers fulfilling maritime and land manifests.
* **User Goals:** Customers need a frictionless way to schedule legal deliveries, while administrators require a system that fully automates state compliance, GPS tracking, and inventory parity.

**3. Functional Requirements**
* **User Authentication & Compliance:** Mandatory 21+ digital identity verification via OCR and biometric liveness checks.
* **Physical Verification (Dual-Scan):** Drivers execute a mandatory handoff protocol scanning a cryptographically secure QR Handoff Token and the customer's physical ID 2D barcode to release inventory.
* **Border-Zone Geofencing:** HTML5 device-level GPS enforcement blocks coordinates resolving to Canadian territory or VPN exit nodes.
* **Maritime Logistics:** Users drop a map pin to generate Google Plus Codes for unaddressable docks, hooking into a "Dynamic Anchor" algorithm that restricts time windows based on the first anchor order's location and a 15-mile water radius.
* **Inventory & Limits:** Real-time stock syncing and dynamic cart calculation that strictly prevents users from exceeding the NYS daily possession limits (3.0oz flower / 24.0g concentrate).
* **State Compliance:** Bi-directional Metrc API integration for real-time sales reporting and incoming wholesale manifest screening.

**4. Technical Requirements**

| Component | Technology |
| --- | --- |
| **Frontend** | React.js (Vite), Tailwind CSS |
| **State Management** | Zustand (for global cart and auth state) |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas (Dedicated Cluster, Mongoose) |
| **Infrastructure** | AWS ECS with Fargate, AWS WAF, AWS CloudTrail |

**5. User Flow & UX/UI Design**
* **Design Language:** Modern, accessible interface using Tailwind CSS and shadcn/ui to meet WCAG 2.1 Level AA ADA compliance.
* **Key Pages:** * **Customer:** Home/Menu, Interactive Cart, Shipping/Map Picker, Place Order, Profile Dashboard.
  * **Admin/Staff:** Dispatch Dashboard, In-Store POS, Driver Manifest App (Offline-First PWA).
* **Sitemap:** Guests can browse the menu but hit a "Compliance Gate" at checkout requiring ID verification and address validation before entering the payment flow.

**6. Non-Functional Requirements**
* **Performance:** First Contentful Paint (FCP) under 1.5 seconds on standard mobile LTE networks.
* **Security:** TLS 1.3 encryption in transit, AES-256 encryption at rest, and strict WORM (Write Once, Read Many) immutable audit logs for compliance retention.
* **Concurrency:** Optimistic concurrency control (transaction locks) to prevent overselling of limited-release inventory.
* **Resiliency:** Driver PWA utilizes Service Workers and IndexedDB for an "Offline-First" architecture to process ID scans and cache GPS breadcrumbs during international cellular dropouts on the river.

**7. Success Metrics (KPIs)**
* **Technical:** Zero lost GPS telematics logs and 100% successful offline synchronization for maritime drivers.
* **Business:** Seamless execution of the Dynamic Anchor routing algorithm to maximize driver efficiency within strict 3-hour route blocks.
* **Compliance:** 100% automated synchronization with the NYS Metrc system resulting in zero state audit violations.

**8. Timeline & Milestones**
*Development is structured across strategic phases rather than strict chronological dates, focusing on rolling out critical operational pillars:*
* **Phase 1: Foundation & Mainland Logistics** - Core platform build, cart logic, compliance gating, and implementation of land-based delivery routing.
* **Phase 2: Dispatch & Administration** - Rollout of the **Admin Dashboard** allowing management to view active orders, manage inventory, and visualize delivery routes.
* **Phase 3: In-Store Retail** - Implementation of the **Budtender Portal / POS**, connecting physical storefront sales to the centralized inventory and compliance engine.
* **Phase 4: Maritime Expansion** - Integration of **Maritime (Water) Delivery**, enabling dockside drops via Google Plus Codes and dynamic anchor mapping logic.
* **Phase 5: Fleet Operations** - Deployment of the **Offline-First Driver PWA** allowing delivery staff to perform dual-scan handoffs and record GPS telematics offline.

**9. Risks & Assumptions**
* **Assumption:** Customers in the 1000 Islands may lack standard street addresses, requiring map-based Plus Code generation.
* **Risk:** Border-zone cellular networks frequently roam to Canadian towers, causing IP spoofing and data loss.
* **Mitigation:** Enforcing HTML5 device-level GPS over IP geolocation, and utilizing MDM (Mobile Device Management) to lock driver tablets to US carriers and offline-first capabilities.