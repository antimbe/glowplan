# Business Dashboard QA Checklist (`/dashboard/business`)

This checklist defines the technical and functional requirements for the Business Dashboard. Completion of all items signifies that the module is **Ready for Production**.

## 1. Establishment Profile (General Info)
- [ ] **Data Persistence**: Changes to name, description, and contact info (email/phone) are saved correctly.
- [ ] **Location Mapping**: Address, city, and postal code are correctly stored and reflected on the public page.
- [ ] **Privacy Settings**: 
    - [ ] "Masquer l'adresse exacte" hides street-level info for clients.
    - [ ] "Confirmation automatique" logic correctly sets new appointments to `confirmed` or `pending`.
- [ ] **Boutique Photos**:
    - [ ] Main photo can be uploaded/replaced/deleted.
    - [ ] Gallery photos (up to 7) can be managed with correct positions.
    - [ ] Storage cleanup occurs when photos are deleted or replaced.

## 2. Service Management
- [ ] **CRUD Operations**: Services can be created, edited, and archived (or deleted).
- [ ] **Pricing & Duration**: Numerical inputs for price (€) and duration (min) are validated and saved.
- [ ] **Display Order**: Services appear in the correct order in the booking tunnel.

## 3. Opening Hours
- [ ] **Weekly Schedule**: 7-day management with individual open/close toggles.
- [ ] **Breaks**: Support for mid-day breaks (e.g., 12:00 - 14:00) with proper validation (break must be within opening hours).
- [ ] **Data Sync**: Changes are immediately reflected in the available slots search for clients.

## 4. Appointments & Clients
- [ ] **Status Flow**:
    - [ ] `pending` appointments can be confirmed or cancelled by the professional.
    - [ ] `confirmed` appointments can be cancelled with a mandatory/optional reason.
- [ ] **Filtering**: Toggle between "Upcoming" and "Past/Cancelled" appointments works correctly.
- [ ] **Client Data**: Contact details (Email, Phone, Instagram) are clearly visible and clickable.
- [ ] **Real-time Updates**: Dashboard list updates automatically when a new booking occurs (Supabase Realtime).

## 5. Reviews Management
- [ ] **Visibility**: All client reviews are listed with their rating and comment.
- [ ] **Avg Rating**: The average rating is calculated correctly based on approved reviews.

## 6. UX & Technical Performance
- [ ] **Loading States**: Skeletons or spinners are shown during data fetching (preventing layout shifts).
- [ ] **Error Handling**: Graceful error messages for failed uploads or database updates.
- [ ] **Mobile Responsiveness**: All tabs (Services, Hours, etc.) are usable on small screens without horizontal scrolling issues.
- [ ] **Stability**: No infinite re-rendering loops (verified `ModalContext` and `useEstablishment` stabilization).

---
**Status: [ / ] In Progress**
**Goal: 100% Pass Rate for Production Deployment**
