# Doctor Schedules Visit & Patient Analysis System

## Overview

This document consolidates all implementations related to:
1. **Doctor-Patient Linking** - Authorization and verification workflow
2. **Doctor Prescriptions** - Medication prescription system  
3. **Doctor Visit Scheduling** - Schedule and notify patients about visits
4. **Patient Dashboard** - View personal, health, vault, and lab records
5. **Patient Notifications** - Receive visit schedules and updates

---

## 1. Doctor-Patient Linking & Authorization

### Overview
The linking system establishes a secure connection between doctors and patients using:
- **NIC-based lookup** - Doctors find existing patients by NIC
- **OTP verification** - Confirms doctor's authorization
- **Status tracking** - pending → verified → authorized
- **Firestore authorization** - `Patient/{id}/doctors/{doctorId}` subcollection

### Implementation Flow

#### Step 1: Doctor Creates Patient Link (createPatient.tsx)
```
Doctor fills: Name, Age, NIC, Phone Number
  ↓
System checks Patient collection by NIC
  ├─ FOUND (existing patient):
  │  ├─ Create Doctor/{doctorId}/patients/{linkId}
  │  ├─ Set status: 'pending'
  │  └─ Generate 6-digit OTP
  │
  └─ NOT FOUND (new patient):
     ├─ Create in publicPatients (temporary)
     ├─ Create Doctor/{doctorId}/patients/{linkId}
     └─ Set status: 'invited'
```

**Key Features:**
- ✅ Duplicate patient prevention - Cannot add same patient twice
- ✅ Search capability - Doctors query Patient collection by NIC
- ✅ OTP generation - Automatic 6-digit code generation
- ✅ Real-time updates - Firestore listeners for status changes

#### Step 2: Patient Status Tracking (doctorHome.tsx)
```
Patients displayed with colored status badges:
- 🟢 GREEN (Verified) - Patient confirmed, full access granted
- 🟠 ORANGE (Pending) - Awaiting OTP verification
- 🔵 BLUE (Invited) - New patient, invitation sent
```

**Implementation:**
- Real-time patient list updates via Firestore listeners
- Status color coding for visual identification
- Patient link ID passed in navigation (`linkId` parameter)

#### Step 3: OTP Verification (patientDashboard.tsx)
```
Doctor clicks patient → OTP modal appears
  ↓
Doctor enters 6-digit OTP
  ↓
System validates against stored code
  ├─ ✅ VALID:
  │  ├─ Update status to 'verified'
  │  ├─ Create Patient/{patientId}/doctors/{doctorId}
  │  └─ Grant authorization
  │
  └─ ❌ INVALID:
     └─ Show "Invalid Code" error
```

**Security Features:**
- ✅ 6-digit OTP validation
- ✅ Authorization record creation
- ✅ Verification timestamp tracking
- ✅ Access control enforcement

### Firestore Data Structure
```
Doctor/{doctorId}/patients/{linkId}/
├── patientId: string
├── nic: string
├── fullName: string
├── contactNumber: string
├── status: 'pending' | 'verified' | 'invited'
├── createdAt: timestamp
└── verification/{doc}/sms/
    ├── code: string
    ├── phone: string
    ├── verified: boolean
    └── verifiedAt: timestamp

Patient/{patientId}/doctors/{doctorId}/
├── status: 'authorized'
├── linkId: string
└── authorizedAt: timestamp
```

---

## 2. Doctor Prescriptions - Active Medications

### Overview
Doctors can prescribe medications to patients which appear in the patient's Active Medications list.

### Implementation (patientMedications.tsx Modal)

#### Features:
- ✅ **Medication form** with fields:
  - Drug name
  - Dosage
  - Frequency (Once daily, Twice daily, etc.)
  - Duration
  - Notes
- ✅ **Data validation** - All fields required
- ✅ **Firestore storage** at `Patient/{patientId}/health/activemedications/medications/{docId}`
- ✅ **Real-time updates** - Changes reflect immediately in patient's list

#### Data Structure:
```
Patient/{patientId}/health/activemedications/medications/{docId}/
├── id: string
├── drugName: string
├── dosage: string
├── frequency: string
├── duration: string
├── notes: string
├── prescribedBy: doctorUid
├── prescribedAt: timestamp
└── status: 'Active'
```

#### Patient View (activemedications.tsx):
- Lists all prescribed medications
- Displays drug details (name, dosage, frequency, duration)
- Grouped display with professional styling
- Empty state when no medications

### Firestore Rules for Medications:
```javascript
match /health/activemedications/medications/{medicationId} {
  // Doctors (who have authorization) can read medications
  allow read: if isDoctorAuthorized(patientId);
  // Doctors can create/update medications
  allow create, update, write: if isDoctorUser() && 
    request.auth.uid == resource.data.prescribedBy;
}
```

---

## 3. Doctor Visit Scheduling

### Overview
Doctors schedule patient visits which:
- Are stored in `Patient/{patientId}/health/visitSchedule/scheduled/{visitId}`
- Are displayed as notifications to patients
- Include doctor name, date, time, and visit type
- Support marking as visited/completed

### Implementation (scheduleVisit.tsx Modal)

#### Features:
- ✅ **Date picker** - Select visit date (min: today)
- ✅ **Time picker** - Select visit time in HH:MM format
- ✅ **Visit type selector** - 6 visit type options:
  - General Checkup
  - Follow-up
  - Specialist Consultation
  - Lab Test
  - Procedure
  - Emergency
- ✅ **Notes field** - Optional additional notes
- ✅ **Full validation** - All required fields validated

#### Data Structure:
```
Patient/{patientId}/health/visitSchedule/scheduled/{visitId}/
├── id: string
├── visitDate: string (YYYY-MM-DD)
├── visitTime: string (HH:MM)
├── visitDateTime: string (ISO format)
├── visitType: string
├── notes: string (optional)
├── scheduledBy: doctorUid
├── doctorName: string (fetched from profile)
├── scheduledAt: timestamp
└── status: 'Scheduled'
```

#### Scheduling Flow (handleScheduleVisit in patientDashboard.tsx):
```
Doctor opens ScheduleVisitModal
  ↓
Fills: Date, Time, Visit Type, Notes
  ↓
Clicks "Schedule Visit"
  ├─ Fetch doctor's name from useUserProfile hook
  ├─ Save to visitSchedule/scheduled/{id}
  ├─ Save notification record with doctor name
  ├─ Refresh patient data
  └─ Close modal + Show success
```

#### Doctor Name Resolution:
1. **Primary**: From `useUserProfile()` hook (most efficient)
2. **Fallback**: Query Doctor collection by UID
3. **Default**: "Your doctor" if unavailable

### Firestore Rules for Visit Schedule:
```javascript
match /health/visitSchedule/scheduled/{visitId} {
  // Doctors can read visit schedule
  allow read: if isDoctorAuthorized(patientId);
  // Doctors can create visits
  allow create, write: if isDoctorUser();
  // Patients can read their scheduled visits
  allow read: if isPatient(patientId);
}
```

---

## 4. Patient Notifications System

### Overview
Patients receive notifications for:
- Scheduled visits (with doctor name, date, time)
- Prescribed medications
- Messages from doctors
- Other health updates

### Implementation (notification.tsx)

#### Features:
- ✅ **Dual source fetching**:
  - Scheduled visits from `Patient/{id}/health/visitSchedule/scheduled/`
  - Other notifications from `Patient/{id}/notifications/`
- ✅ **No duplicates** - Skips `visit_scheduled` type from notifications collection
- ✅ **Doctor name display** - Shows "DR. {doctorName} has scheduled..."
- ✅ **Date/time formatting** - Professional display of visit details
- ✅ **Mark as read** - Track read/unread status
- ✅ **Auto-refresh** - Updates when screen comes into focus via `useFocusEffect`

#### Notification Display:
```
📅 Scheduled Visit Card:
┌─────────────────────────────────┐
│ 📅 | Scheduled Visit             │
│    | DR. John Smith has scheduled│
│    | a visit on 15 Jan 2025 at   │
│    | 14:30                        │
│    | 📅 15 Jan 2025 at 14:30 ✓   │
└─────────────────────────────────┘
```

#### Features:
- ✅ Calendar icon for visit notifications
- ✅ Color-coded by type (purple for visits)
- ✅ Unread indicator (purple dot)
- ✅ Read/unread marking
- ✅ Chronological sorting (newest first)
- ✅ Empty state with helpful message
- ✅ Pull-to-refresh functionality

#### Header (Similar to ActiveMedications):
- Back button - Return to previous screen
- Title - "Notifications"
- Refresh button - Manual refresh

### Notification Data Structure:
```
Patient/{patientId}/notifications/{docId}/
├── id: string
├── type: 'visit_scheduled' | 'medication' | 'message'
├── title: string
├── message: string
├── visitDate?: string
├── visitTime?: string
├── visitType?: string
├── doctorName?: string
├── createdAt: timestamp
└── read: boolean

// For visit_scheduled type:
message: "DR. {doctorName} has scheduled a visit on {date} at {time}"
```

#### Fetch Logic Flow:
```
fetchNotifications():
  ├─ Query health/visitSchedule/scheduled/
  │  └─ Convert each visit to notification format with doctor name
  │
  └─ Query notifications collection
     └─ Skip type='visit_scheduled' to avoid duplicates
     └─ Include medication, message, and other notifications

Combine + Sort by createdAt (newest first)
Update state with allNotifications
```

### Firestore Rules for Notifications:
```javascript
match /notifications/{notificationId} {
  // Patients can read their notifications
  allow read: if isPatient(patientId);
  // Doctors can create notifications
  allow create, write: if isDoctorUser();
  // Patients can update read status
  allow update: if isPatient(patientId) && 
    request.resource.data.read == true;
}
```

---

## 5. Patient Dashboard - Data Access

### Overview
The patient dashboard displays all patient data accessible to authorized doctors:
- Personal information (name, age, gender, blood type)
- Health records (allergies, active medications)
- Vault records (medical documents by date)
- Lab records (test results by date)
- Next scheduled visit

### Data Fetching (firestoreQueries.ts)

#### Data Paths:
```
Personal Data:
└─ Patient/{patientId}/personal/{doc}/

Health/Common Data:
└─ Patient/{patientId}/health/common/{doc}/
   ├── bloodType
   ├── allergies
   └── active_medications

Vault Records (Medical Documents):
└─ Patient/{patientId}/health/history/vault/{date}/documents/{docId}/

Lab Records (Test Results):
└─ Patient/{patientId}/health/history/labs/{date}/documents/{docId}/

Next Scheduled Visit:
└─ Patient/{patientId}/health/visitSchedule/scheduled/
   (Ordered by visitDate ASC, limited to 1)
```

#### Data Handling:

**Allergies:**
- Can be stored as string ("peanuts,shellfish") or array
- Automatically converts string to array by splitting on comma

**Medications:**
- Field names: `active_medications` or `medications`
- Automatically checks both with fallback

**Records Organization:**
- Vault and Lab records grouped by date
- Sorted newest first (descending)
- Supports nested document structure

**Next Visit:**
```
{
  date: string (YYYY-MM-DD),
  time: string (HH:MM),
  type: string,
  doctor: string (doctor name)
}
```

### Dashboard Display (patientDashboard.tsx):

#### Tabs:
1. **Overview Tab**:
   - Patient info (name, age, gender, blood type)
   - Allergies display
   - Active medications list
   - Next scheduled visit card

2. **History Tab**:
   - Vault records grouped by date
   - Expandable date groups
   - Document details (name, date, file type)

3. **Reports Tab**:
   - Lab records grouped by date
   - Test results display
   - Doctor notes if available

### Features:
- ✅ Real-time data updates
- ✅ Proper error handling
- ✅ Loading states
- ✅ Authorization verification
- ✅ Data format compatibility

---

## 6. Firestore Security Rules

### Core Functions:
```javascript
// Check if user is a doctor
function isDoctorUser() {
  return get(/databases/$(database)/documents/Doctor/$(request.auth.uid)).data != null;
}

// Check if user is a patient
function isPatient(patientId) {
  return request.auth.uid == patientId;
}

// Check if doctor is authorized for patient
function isDoctorAuthorized(patientId) {
  return exists(/databases/$(database)/documents/Patient/$(patientId)/doctors/$(request.auth.uid));
}
```

### Collection Rules:

#### Doctor Collection:
- Doctors can read their own profile
- Only authorized users can create

#### Patient Collection:
- Doctors can read only authorized patient info
- Patients can read their own data
- Personal, health, vault, lab records protected by authorization

#### Medications:
- Doctors (authorized) can read/write
- Patients can read their own

#### Visit Schedule:
- Doctors can schedule visits
- Patients can read their scheduled visits

#### Notifications:
- Doctors can create notifications
- Patients can read their notifications
- Patients can update read status

---

## 7. Key Features Implemented

### ✅ Doctor Features:
- [x] Find existing patients by NIC
- [x] Link new and existing patients
- [x] OTP verification for authorization
- [x] Schedule visits with date/time picker
- [x] Prescribe medications to patients
- [x] View patient health records
- [x] View patient vault documents
- [x] View patient lab reports
- [x] Display patient allergies and medications
- [x] Track patient next scheduled visit

### ✅ Patient Features:
- [x] Receive visit schedule notifications with doctor name
- [x] View scheduled visits in notifications
- [x] Mark notifications as read
- [x] View prescribed medications
- [x] See personal health information
- [x] Access vault documents
- [x] Access lab reports
- [x] Auto-refresh notifications on screen focus

### ✅ Security Features:
- [x] NIC-based patient lookup
- [x] OTP verification workflow
- [x] Doctor authorization tracking
- [x] Firestore rule-based access control
- [x] Read/write permission enforcement
- [x] Authorization verification on data access

---

## 8. Testing Workflow

### Test Case 1: Doctor Adds Existing Patient
```
1. Doctor logs in
2. Clicks "+ Create Patient"
3. Enters existing patient's NIC
4. Status shows "Pending" (orange)
5. Clicks patient → OTP modal appears
6. Enters OTP code
7. Status changes to "Verified" (green)
8. Dashboard loads patient data
9. Can view records, schedule visits, prescribe meds
```

### Test Case 2: Doctor Schedules Visit
```
1. Doctor in patient dashboard
2. Clicks "Schedule Visit"
3. Fills: Date, Time, Visit Type
4. Clicks "Schedule Visit"
5. Modal closes, data refreshed
6. Patient receives notification:
   "DR. {doctorName} has scheduled a visit on {date} at {time}"
7. Patient sees visit in notifications with doctor name
8. Visit appears in Next Visit card on dashboard
```

### Test Case 3: Doctor Prescribes Medication
```
1. Doctor in patient dashboard
2. Clicks "Prescribe Medication"
3. Fills: Drug name, Dosage, Frequency, Duration
4. Clicks "Add Medication"
5. Patient's Active Medications list updates
6. Shows prescription with all details
```

### Test Case 4: Patient Views Notifications
```
1. Patient navigates to Notifications
2. Sees scheduled visits with doctor name
3. Visits show date, time, and visit type
4. Can click to mark as read
5. Unread indicator (purple dot) visible
6. Pull-to-refresh updates list
7. Empty state when no notifications
```

---

## 9. Files Modified/Created

### Core Features:
| File | Purpose |
|------|---------|
| `app/doctorProfile/createPatient.tsx` | Doctor-patient linking, NIC lookup |
| `app/doctorProfile/patientDashboard.tsx` | Patient data display, visit scheduling, medications |
| `app/doctorProfile/patientMedications.tsx` | Medication prescription modal |
| `app/doctorProfile/scheduleVisit.tsx` | Visit scheduling modal |
| `app/patientProfile/activemedications.tsx` | Patient view of prescribed meds |
| `app/patientProfile/notification.tsx` | Patient notification center |
| `services/firestoreQueries.ts` | Firestore data fetching queries |
| `services/doctorPatientService.ts` | Doctor-patient linking service |
| `hooks/useUserProfile.tsx` | User profile hook (doctor name resolution) |

### Configuration:
| File | Purpose |
|------|---------|
| `config/backendConfig.ts` | Backend URL configuration |
| `FIRESTORE_RULES_TO_COPY.txt` | Security rules for Firebase |

---

## 10. Deployment Checklist

- [x] Doctor-patient linking implemented
- [x] OTP verification workflow
- [x] Visit scheduling system
- [x] Medication prescription system
- [x] Patient notification system
- [x] Firestore data structures
- [x] Security rules configured
- [x] Error handling and logging
- [x] Real-time updates
- [ ] Backend OTP via SMS (optional - currently alerts in dev)
- [ ] Production deployment

---

## 11. Important Notes

### Current Limitations:
- **OTP Delivery**: Currently shows in alert (dev mode). For production, integrate Twilio or SMS service.
- **Authorization**: Based on explicit `Patient/{id}/doctors/{doctorId}` records.
- **Permissions**: All access controlled via Firestore rules.

### Future Enhancements:
- [ ] Appointment reminder notifications (SMS/Push)
- [ ] Medication refill tracking
- [ ] Doctor notes and prescriptions history
- [ ] Patient feedback/rating system
- [ ] Two-way messaging system
- [ ] Video consultation integration
- [ ] Prescription QR codes
- [ ] Automated appointment emails

### Performance Optimizations:
- Real-time listeners for patient list updates
- Pagination for vault/lab records (if large datasets)
- Caching for doctor profile data
- Debounced search for NIC lookup

---

## 12. Support & Troubleshooting

### Common Issues:

**Issue**: "Missing or insufficient permissions"
- **Solution**: Ensure Firestore rules are published and doctor is authorized

**Issue**: OTP modal doesn't appear
- **Solution**: Verify patient status is "pending" and linkId is passed correctly

**Issue**: Doctor name shows as "Your doctor"
- **Solution**: Ensure Doctor profile has `personal.fullName` field populated

**Issue**: Notifications don't show scheduled visits
- **Solution**: Check visitSchedule/scheduled collection for visit records with doctor name

**Issue**: Duplicate patient error appearing
- **Solution**: Check Doctor/{doctorId}/patients for existing links with same NIC

---

## Document Version
- **Version**: 1.0
- **Last Updated**: November 20, 2025
- **Status**: Complete Implementation
