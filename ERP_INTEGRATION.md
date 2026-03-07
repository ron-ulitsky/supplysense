# ERP Integration Architecture for SupplySense

While SupplySense operates as a standalone AI Co-Pilot for demonstration purposes, its true value is unlocked when integrated directly with a manufacturer's existing Enterprise Resource Planning (ERP) systems (e.g., SAP S/4HANA, Oracle NetSuite, Microsoft Dynamics 365).

This document outlines the architectural approach for production integration.

## 1. Bi-Directional Data Flow

SupplySense requires a bi-directional data flow to function effectively as a Co-Pilot.

### Inbound (Read-Only) from ERP to SupplySense
To generate accurate trade-off simulations, the Agent needs real-time context:
*   **Inventory Levels:** Current on-hand quantities, safety stock targets, and warehouse locations.
*   **Open Purchase Orders (POs):** Quantities ordered, expected delivery dates, and supplier details.
*   **Supplier Master Data:** Supplier performance ratings, active contracts, and Service Level Agreements (SLAs).
*   **Bill of Materials (BOM):** To understand exactly which vehicle models are impacted by a component shortage.

**Integration Method:** 
*   **Modern ERPs:** RESTful APIs or OData services using OAuth 2.0 authentication. SupplySense would authenticate as an application service account.
*   **Legacy ERPs:** Nightly batch processing via secure file transfer (SFTP) of encrypted CSV/XML extracts to Google Cloud Storage, triggering a pipeline to ingest the data into SupplySense's database (e.g., Cloud SQL).

### Outbound (Write) from SupplySense to ERP
When the user clicks "Approve & Execute" in the Action Inbox, SupplySense needs to execute the transaction.
*   **PO Adjustments:** Modifying quantities or requested delivery dates on existing orders.
*   **Safety Stock Updates:** Adjusting minimum inventory thresholds based on recognized geopolitical risks.
*   **New Requisitions:** Generating new purchase requisitions for alternative suppliers.

**Integration Method:** 
*   Execution is strongly recommended via dedicated API endpoints that enforce the ERP's internal business logic and validation rules. 
*   SupplySense acts as the *requester*, but the ERP remains the ultimate System of Record. If an adjustment violates an ERP rule (e.g., exceeding a financial approval limit), the ERP API returns an error, which SupplySense displays back to the user.

## 2. Recommended Middleware Architecture

Instead of point-to-point connections directly from the Next.js application to the ERP, a robust enterprise deployment should utilize an Integration Platform as a Service (iPaaS) or an API Gateway.

### Architecture Diagram

1.  **SupplySense (Next.js / Google Cloud Run):** Generates the mitigation action (e.g., JSON payload: `{action: "update_po", po_number: "12345", new_qty: 500}`).
2.  **API Gateway (Google Cloud API Gateway / Apigee):** Receives the request, handles rate limiting, and validates the API key/JWT from SupplySense.
3.  **Integration Layer (Cloud Functions / Eventarc):** Translates the SupplySense JSON payload into the specific format required by the target ERP (e.g., transforming to SAP BAPI XML or NetSuite SuiteTalk SOAP).
4.  **Target ERP System:** Processes the mapped transaction and returns a success/error status.

## 3. Security and "Human-in-the-Loop"

*   **Principle of Least Privilege:** The service account utilized by SupplySense should only have API access to the specific modules (Inventory, Purchasing) required for its function, not full administrative access.
*   **Action Tracking:** Every action triggered from the Action Inbox must be logged with the ID of the human user who approved it, the original AI reasoning, and the transaction ID returned by the ERP for auditability.
*   **Safeguards:** Financial thresholds (e.g., "Cannot increase PO value by more than $50,000 without Director approval") should be enforced *both* within SupplySense's Intelligence Engine settings and redundantly at the ERP API level.
