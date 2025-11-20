🧠**Technical Documentation Version**

**Doctor–Patient Linking Process**

Step 1: Doctor adds a patient
- Doctor inputs patient name, NIC, and mobile number in the app.

Step 2: System validation
- The system checks if the NIC already exists in Firestore:
   1. If existing: Links the doctor to the patient’s existing record.
   2. If new: Creates a temporary public profile for that patient.


**If the Patient Already Exists**

Step 3:
- The system sends a verification code (OTP) via SMS to the patient’s registered mobile number (the number given during profile creation).do using webex 

Step 4:
- The doctor’s dashboard marks the patient as “pending” until verification is complete.

Step 5:
- When the doctor clicks on the patient card in doctorHome.tsx to view the patient’s data from patientDashboard, a popup requests the verification code (sent to the patient).

Step 6:
- System validates the verification attempt:

 Verifies that:
    1. The entered OTP matches the one sent to the patient.
    2. The patient’s registered mobile number and NIC match the doctor’s input.
        - if valid → The doctor gains access to the patient’s records stored in Firestore.
        - If invalid → An appropriate error popup appears:
            “Invalid code” → OTP mismatch
            “No such account found by this mobile number” → mobile number mismatch

Step 7:
- After successful verification, the patient is shown as “verified” in the doctor’s list.

Step 8:
- The doctor now has full access to view the patient’s medical history and health data.

step 9: if doctor again create the same patient who has already in his patient list after clicking in the "create patient" button it should appear a popup error message.

**If the Patient Is New to the App**

Step 9:
- The doctor creates a temporary patient profile using the NIC and name.

Step 10:
- The patient receives an invitation SMS to sign up in the app using the provided mobile number.

Step 11:
- The doctor’s interface shows the patient as “Invited” until the patient completes registration.

Step 12:
- Since no OTP verification is required at this stage, the doctor can open the patient’s dashboard (via the card in doctorHome.tsx) to update and manage preliminary details of the patient profile.


