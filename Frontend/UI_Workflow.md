# UI Workflow — Frontend

This document describes the screen flows and high-level navigation for the Frontend app, separated into Patient and Doctor flows. It is derived from the code in the `app/` directory and the common UI components.

Conventions
- Route / file mapping uses the `app/` folder (Expo Router). Example: `app/patientProfile/patientHome.tsx` → route `/patientProfile/patientHome`.
- "Bottom navigation" refers to `app/common/BottomNavigation.tsx`. Doctor-specific bottom nav lives in `app/doctorProfile/doctorBottomNavigation.tsx`.
- "More" screens are nested under `app/patientProfile/more/`.

--

## Global entry points
- `app/_layout.tsx` — app layout and top-level navigation wrapper.
- `app/index.tsx` — landing / initial route; typically routes users to welcome/login or main area depending on auth.
- `app/common/welcomeScreen.tsx` and `app/common/landingpage.tsx` — early onboarding/marketing screens.

## Authentication & onboarding (shared)
- `app/auth/login.tsx` — sign-in screen.
- `app/auth/Auth/signup.tsx` — account creation (step 1: account fields).
- `app/auth/Auth/createProfile.tsx` — patient personal profile (step 2 for patients).
- `app/auth/Auth/createDocProfile.tsx` — doctor personal profile flow (doctor-specific fields).
- `app/auth/Auth/healthProfile.tsx` — patient health details (step 3 for patients).

Flow notes:
- Signup → on success: the app navigates to one of the `createProfile` or `createDocProfile` flows based on role. Those pages call services (`services/authService.tsx`) and then navigate to the home area.

## Patient flow (primary screens and navigation)
This is the typical experience for a patient user.

1) Landing & Auth
   - `app/index.tsx` → `welcomeScreen` / `landingpage` → `login` or `signup`.
   - Signup routes: `signup.tsx` → `createProfile.tsx` → `healthProfile.tsx`.

2) Main area (patient home)
   - `app/patientProfile/patientHome.tsx` (primary home/dashboard).
   - Global bottom navigation provided by `app/common/BottomNavigation.tsx` with tabs:
     - Home → `patientHome`
     - Alerts → `notification.tsx`
     - Chat → (project contains a chat tab placeholder — file `chat` may be present elsewhere)
     - More → opens `SideNavigation` or drawer with more options

3) Alerts & Notifications
   - `app/patientProfile/notification.tsx` — alerts list. Accessible from bottom nav.

4) Lab reports
   - `app/patientProfile/labReports/labresults.tsx` — lab reports list.
   - `app/patientProfile/labReports/detailedLab.tsx` — report detail.

5) Medical history & records
   - `app/patientProfile/viewHistory/viewhistory.tsx` — history view.
   - `app/patientProfile/activemedications.tsx` — active medications.

6) More / Profile area
   - `app/patientProfile/more/` contains:
     - `patientProfilee/MyProfile.tsx` — main patient profile page.
     - `patientProfilee/profilePage.tsx` — profile detail view.
     - `patientProfilee/uploads.tsx` — uploads (imaging, docs).
     - `patientProfilee/healthtips.tsx` — tips and static content.
     - `patientProfilee/editProfile/*` — edit flows: `personalinfooredit.tsx`, `contactInfor.tsx`, `changepw.tsx`.
     - `doctorSearch/doctorSearch.tsx` & `doctor_details.tsx` — search doctors and view details.

Typical patient actions
- From Home: view alerts, open lab results, view history, go to More → Edit Profile or Uploads.
- From More: navigate to Doctor Search to book/view doctors; open uploads to send documents.

## Doctor flow (primary screens and navigation)
This is the typical experience for a doctor user.

1) Auth & Onboarding
   - Signup chooses Doctor role and uses `app/auth/Auth/createDocProfile.tsx` for doctor-specific fields.

2) Doctor main area
   - `app/doctorProfile/doctorHome.tsx` — doctor dashboard / home screen.
   - `app/doctorProfile/doctorBottomNavigation.tsx` — custom bottom nav for doctor screens.

3) Doctor-specific screens
   - Additional doctor features are implemented under `app/doctorProfile/` (e.g., doctor listing, appointments). The repo contains `doctorHome.tsx` and `doctorBottomNavigation.tsx` as the main doctor area.

Typical doctor actions
- Login → Doctor Home: view patients, respond to consultations, update profile, access tools via doctor bottom nav.

## Shared components & services used by both flows
- `app/common/BottomNavigation.tsx` — patient bottom navigation.
- `app/common/sideNavigation.tsx` — drawer with links to deeper features.
- `components/*` — small UI components used across screens (e.g., `HapticTab.tsx`, `Collapsible.tsx`).
- `services/*` — API and business logic:
  - `services/authService.tsx` — authentication and user creation.
  - `services/predictionService.ts` — communicates with disease prediction backend (used by symptom-related flows).
  - `services/chatService.ts` / `newsService.ts` — other app services.
- `config/firebaseConfig.tsx` — firebase initialization used by auth and data storage.

## Routing matrix (quick reference)
- / (index) → `app/index.tsx`
- /login → `app/auth/login.tsx`
- /signup → `app/auth/Auth/signup.tsx`
- /auth/createProfile → `app/auth/Auth/createProfile.tsx` (patient)
- /auth/createDocProfile → `app/auth/Auth/createDocProfile.tsx` (doctor)
- /patientProfile/patientHome → `app/patientProfile/patientHome.tsx`
- /patientProfile/notification → `app/patientProfile/notification.tsx`
- /patientProfile/labReports/labresults → `app/patientProfile/labReports/labresults.tsx`
- /patientProfile/labReports/detailedLab → `app/patientProfile/labReports/detailedLab.tsx`
- /patientProfile/viewHistory → `app/patientProfile/viewHistory/viewhistory.tsx`
- /patientProfile/more/MyProfile → `app/patientProfile/more/patientProfilee/MyProfile.tsx`
- /doctorProfile/doctorHome → `app/doctorProfile/doctorHome.tsx`

## Notes, gaps and recommendations
- Some files referenced in docs (e.g., `statistics.tsx`) appear in documentation comments but may not exist in the current app folder — keep `app/` sources synchronized with design docs.
- Consider adding a `README.md` per major area (`auth/`, `patientProfile/`, `doctorProfile/`) describing intent and route names.
- For maintainability, add a `config/index.ts` barrel file that re-exports common config (e.g., firebase) and use it across screens to avoid long relative paths.
- Add a simple diagram (draw.io or Mermaid) to this file for a visual workflow — I can add a Mermaid block if you'd like.

---

If you want, I can:
- generate a Mermaid diagram for the patient and doctor flows and embed it at the top of this file;
- create per-screen short descriptions (inputs, outputs, important props) for the screens you care most about;
- add a `README.md` per major folder with development notes and hot reload tips.

Tell me which extras you want and I’ll add them.
