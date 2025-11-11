# Patient Linking & Mobile Verification — Feature Specification

## Summary
This feature lets a doctor create or link a patient profile using the patient's NIC (national identity number). If the NIC already exists, the doctor's dashboard links to the existing patient record. If the NIC is new, a provisional public profile is created and the patient is invited. The system sends a one-time verification code by SMS; the patient must verify the code to confirm ownership of the phone/NIC. Only after verification can the doctor access the patient's sensitive data.

---

## Goals
- Avoid duplicate patient profiles by NIC.
- Let doctors link to existing patient data by NIC while protecting patient privacy.
- Securely verify patient ownership of the phone number and NIC before granting doctor access.
- Keep sensitive operations server-side and protected by Firestore rules.

---

## High-level user stories
- Doctor invites existing patient by NIC → system links to existing profile → server sends SMS OTP → patient verifies → doctor gets access (link status = verified).
- Doctor invites non-existing NIC → system creates provisional public profile and doctor link (status = invited) → server sends SMS OTP → patient signs up and verifies → system links auth account to profile and updates doctor link (verified).

---

## Components
1. Frontend (React Native / Expo)
   - `Create Patient` modal (doctor): NIC + phone + name inputs (already in repo).
   - `Verify Invite` screen (patient): NIC + OTP entry; calls backend to verify.
   - Replace client-side dev-code generation with server callable `sendVerification`.

2. Backend: Firebase Cloud Functions (Node 18+, `firebase-admin`)
   - `sendVerification` (callable)
     - Creates or finds `publicPatients` by NIC, creates `Doctor/{doctorId}/patients/{linkId}`, generates OTP, stores hashed OTP + expiry, sends SMS (Twilio).
   - `verifyCode` (callable)
     - Verifies code, marks verification and doctor link as verified, optionally attaches `Patient/{uid}` to public profile if patient is signed in.
   - `claimPublicPatient` (callable) — optional during patient signup to atomically attach `Patient/{uid}` to public profile.

3. Firestore data model
   - `publicPatients/{docId}`
     - nic, fullName, phone, invitedByDoctor, invitedAt, claimedBy?, claimedAt?
   - `Doctor/{doctorId}/patients/{linkId}`
     - patientId (publicPatients id or Patient uid), nic, fullName, contactNumber, status (pending|invited|verified), createdAt, verifiedAt?
   - `Doctor/{doctorId}/patients/{linkId}/verification/sms`
     - codeHash, createdAt, expiresAt, verified, attempts
   - `Patient/{uid}` (existing patient profile)

---

## Security & Firestore rules (summary)
- Keep existing `Patient/{uid}` owner-only rules.
- Allow doctors to manage their own `Doctor/{doctorId}/**` subtree.
- Add a controlled `publicPatients` index:
  - `read/create` allowed only for authenticated doctor accounts.
  - `update/delete` restricted to the inviting doctor.

_Note:_ exact rules text is prepared separately and must be deployed to Firestore. Use the Firebase Emulator Suite to test rules before deploying.

---

## Cloud Function contracts
### sendVerification (callable)
- Auth: required (doctor)
- Input: { nic: string, phone: string, fullName?: string }
- Output: { success: boolean, linkId?: string, message?: string }
- Behavior: ensure publicPatients exists (transaction), create doctor link, generate OTP, store hashed OTP with expiry, send SMS, return linkId.

### verifyCode (callable)
- Auth: optional (patient may not be signed-in); `patientAuthUid` may be provided
- Input: { doctorId: string, linkId: string, code: string, patientAuthUid?: string }
- Output: { success: boolean, linkedPatientId?: string, message?: string }
- Behavior: validate OTP, mark verification and link verified, if patient signed in attach `Patient/{uid}` and update links.

---

## Detailed user flows
### A. Doctor creates/link patient
1. Doctor enters Full Name, NIC, Phone → taps Create.
2. Frontend calls `sendVerification`.
3. sendVerification ensures `publicPatients` exists (transactionally), creates `Doctor/{doctorId}/patients/{linkId}`, stores hashed OTP with expiry, sends SMS.
4. Frontend shows success; doctor sees link with status `pending`/`invited`.

### B. Patient verifies
1. Patient opens the app (or deep link from SMS), enters NIC + OTP.
2. App calls `verifyCode`.
3. verifyCode checks OTP, marks verification, sets `Doctor` link status to `verified` and `verifiedAt`.
4. If patient is signed-in, `Patient/{uid}` is created/linked to `publicPatients`, Doctor links are updated to reference `Patient/{uid}`.

### C. Patient signs up after invite
1. Patient signs up and provides NIC.
2. Client calls `claimPublicPatient` (or `verifyCode` with auth) to atomically attach `Patient/{uid}` to `publicPatients` and update doctor links.

---

## Edge cases and error handling
- Race conditions: use transactions or NIC-based doc IDs for `publicPatients` to prevent duplicates.
- Expired/wrong code: increment attempts, lock after N failures, require re-send.
- SMS delivery failure: Cloud Function should retry and log; notify doctor if send fails.
- Abuse/rate-limit: throttle `sendVerification` per NIC and per doctor.

---

## Acceptance criteria
- E2E: Doctor invites existing NIC → patient receives SMS → patient verifies → doctor link becomes `verified` and sensitive data is accessible.
- New NIC: Doctor invites → publicPatients created → patient signs up → patient claims profile → doctor link updated to reference Patient/{uid}.
- Security tests with Firestore rules: only doctors can create/read `publicPatients` and only owner doctors can manage their `Doctor/{uid}` subtree.

---

## Implementation & rollout plan
1. Implement Cloud Functions and Twilio integration (or mock if Twilio not yet available).
2. Update Firestore rules and test with Emulator.
3. Replace client dev-code generation with `sendVerification` callable.
4. Add `Verify Invite` screen and wire to `verifyCode`.
5. Add `claimPublicPatient` during signup to attach `Patient/{uid}`.
6. Run integration tests and roll out.

---

## Next steps I can take (pick one)
- Scaffold Cloud Functions (sendVerification, verifyCode, claimPublicPatient) with Twilio placeholders and README.
- Implement the in-app `Verify Invite` screen and wire it to the functions.
- Provide the exact Firestore rules file ready to deploy (I can add it to repo).

If you want one of these now, tell me which and I’ll scaffold it.

---

_Last updated: 2025-11-11_
