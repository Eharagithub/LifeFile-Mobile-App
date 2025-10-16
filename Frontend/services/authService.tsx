import { auth, db } from '../config/firebaseConfig';
//import { Alert } from 'react-native';

export interface UserData {
  personal?: {
    fullName: string;
    dateOfBirth: string;
    nic: string;
    gender: string;
    address?: string;
    contactNumber?: string;
    profilePicture?: string;
    createdAt: string;
    updatedAt: string;
  };
  health?: {
    weight: string;
    height: string;
    bmi?: string;
    bloodType?: string;
    allergies?: string;
    chronicDiseases?: string;
    surgeries?: string;
    medications?: string;
    ongoingTreatments?: string;
    lifestyle: {
      smoker: string;
      dietaryPreference?: string;
      alcoholConsumption: string;
      hereditaryConditions?: string;
    };
    termsAccepted: boolean;
    updatedAt: string;
  };
  registrationCompleted?: boolean;
  registrationCompletedAt?: string;
  email: string;
  createdAt: string;
  lastLoginAt: string;
  role?: 'patient' | 'doctor';
}

class AuthService {
  // Cache to avoid spamming the console with repeated permission warnings per UID
  private permissionWarnCache: Record<string, { patientWarned?: boolean; doctorWarned?: boolean }> = {};

  // Email validation
  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Password validation
  private validatePassword(password: string): { isValid: boolean; message?: string } {
    if (password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters long' };
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!/(?=.*\d)/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one number' };
    }
    return { isValid: true };
  }

  // Sanitize user input
  private sanitizeInput(input: string): string {
    return input.trim().replace(/[<>]/g, '');
  }

  // Create user account
  async createUserAccount(email: string, password: string, confirmPassword: string, role: 'patient' | 'doctor'): Promise<{ success: boolean; uid?: string; error?: string }> {
    try {
      // Validate inputs
      if (!email || !password || !confirmPassword) {
        return { success: false, error: 'All fields are required' };
      }

      if (!this.validateEmail(email)) {
        return { success: false, error: 'Please enter a valid email address' };
      }

      if (password !== confirmPassword) {
        return { success: false, error: 'Passwords do not match' };
      }

      const passwordValidation = this.validatePassword(password);
      if (!passwordValidation.isValid) {
        return { success: false, error: passwordValidation.message };
      }

      // Create user account
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const uid = userCredential.user?.uid;

      if (!uid) {
        return { success: false, error: 'Failed to create user account' };
      }

      // Initialize user document in Firestore
      try {
        await this.initializeUserDocument(uid, email, role);
      } catch (initError: any) {
        console.error('Error initializing Firestore user document:', initError);

        // If this is a permission error when creating a Patient document, allow signup to continue
        // (some projects prefer server-side initialization for Patient docs). Do NOT delete the auth user in that case.
        if (role === 'patient' && initError && (initError.code === 'permission-denied' || initError.code === 'missing-permission')) {
          console.warn('Firestore initialization for Patient failed due to permissions. Allowing signup to continue; please ensure Patient collection rules permit client writes or initialize server-side.');
          return { success: true, uid };
        }

        // For other failures (including Doctor or non-permission errors) attempt cleanup of the created Auth user
        try {
          const createdUser = await auth.currentUser;
          if (createdUser && createdUser.uid === uid) {
            await createdUser.delete();
            console.warn('Deleted newly created auth user due to Firestore initialization failure');
          }
        } catch (cleanupErr) {
          console.error('Failed to cleanup created auth user:', cleanupErr);
        }

        // Surface a permission-specific message when appropriate
        if (initError && (initError.code === 'permission-denied' || initError.code === 'missing-permission')) {
          return { success: false, error: 'Failed to create account due to Firestore permissions. Please check Firestore rules.' };
        }

        return { success: false, error: 'Failed to create account. Please try again.' };
      }

      return { success: true, uid };
    } catch (error: any) {
      console.error('Error creating user account:', error);

      // Handle specific Firebase auth errors
      let errorMessage = 'Failed to create account. Please try again.';
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection';
          break;
      }

      return { success: false, error: errorMessage };
    }
  }

  // Initialize user document in Firestore
  private async initializeUserDocument(uid: string, email: string, role: 'patient' | 'doctor'): Promise<void> {
    // Force fresh auth token before any Firestore call
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    await user.getIdToken(true);

    console.log('Confirmed signed-in UID:', user.uid);

    const collectionName = role === 'patient' ? 'Patient' : 'Doctor';
    const userRef = db.collection(collectionName).doc(uid);

    const baseData = {
      email: this.sanitizeInput(email),
      role,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      registrationCompleted: false
    };

    // Create main user doc
    await userRef.set(baseData);

    // ✅ Only create structured health data if role is 'patient'
    if (role === 'patient') {
      // Create placeholder personal info
      await userRef.set({
        personal: {
          fullName: '',
          gender: '',
          dateOfBirth: '',
          nic: '',
          address: '',
          contactNumber: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      }, { merge: true });

      // Create empty health/common doc for later data updates
      await userRef.collection('health').doc('common').set({
        weight: '',
        height: '',
        bmi: '',
        bloodType: '',
        allergies: '',
        chronicDiseases: '',
        medications: '',
        surgeries: '',
        ongoingTreatments: '',
        lifestyle: {
          smoker: '',
          dietaryPreference: '',
          alcoholConsumption: '',
          hereditaryConditions: ''
        },
        termsAccepted: false,
        updatedAt: new Date().toISOString()
      });

      // medicalHistory/records structure (⚠ corrected Firestore path)
      const medHistoryRef = userRef
        .collection('health')
        .doc('common') // health/common
        .collection('medicalHistory')
        .doc('records'); // health/common/medicalHistory/records
      await medHistoryRef.set({
        initialized: true,
        uploadedAt: new Date().toISOString(),
      });
    }

    // ✅ DOCTORS: create personal + professional placeholders
    if (role === 'doctor') {
      await userRef.set({
        personal: {
          fullName: '',
          gender: '',
          dateOfBirth: '',
          nic: '',
          address: '',
          contactNumber: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        professionalInfo: {
          specialization: '',
          licenseNumber: '',
          yearsOfExperience: '',
          qualifications: '',
          availableTimes: [],
          updatedAt: new Date().toISOString()
        }
      }, { merge: true });
    }

  }


  // Save personal information
  async savePersonalInformation(uid: string, personalData: UserData['personal'], role: 'patient' | 'doctor'): Promise<{ success: boolean; error?: string }> {
    try {
      if (!uid || !personalData) {
        return { success: false, error: 'Invalid data provided' };
      }
  const collectionName = role === 'patient' ? 'Patient' : 'Doctor';
  const userRef = db.collection(collectionName).doc(uid);

      // Sanitize inputs
      const sanitizedData = {
        ...personalData,
        fullName: this.sanitizeInput(personalData.fullName),
        nic: this.sanitizeInput(personalData.nic),
        gender: this.sanitizeInput(personalData.gender),
        address: personalData.address ? this.sanitizeInput(personalData.address) : '',
        contactNumber: personalData.contactNumber ? this.sanitizeInput(personalData.contactNumber) : '',
        updatedAt: new Date().toISOString()
      };

      // Validate required fields
      if (!sanitizedData.fullName || !sanitizedData.dateOfBirth || !sanitizedData.nic || !sanitizedData.gender) {
        return { success: false, error: 'Please fill in all required fields' };
      }

      // Update user document
      await userRef.set({
        personal: sanitizedData
      }, { merge: true });

      return { success: true };
    } catch (error: any) {
      console.error('Error saving personal information:', error);
      return { success: false, error: 'Failed to save personal information' };
    }
  }

  // Save doctor professional information
  async saveDoctorInformation(uid: string, doctorData: {
    registrationNumber?: string;
    primarySpecialization?: string;
    primaryHospital?: string;
    medicalQualifications?: string;
    introduction?: string;
    experience?: string;
    conditions?: string;
    consultationDays?: string;
    consultationTimes?: string;
    eChannellingUrl?: string;
    primaryCity?: string;
    profilePicture?: string;
    fullName?: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      if (!uid || !doctorData) {
        return { success: false, error: 'Invalid data provided' };
      }

      // Sanitize some fields
      const sanitized = {
        fullName: doctorData.fullName ? this.sanitizeInput(doctorData.fullName) : '',
        registrationNumber: doctorData.registrationNumber ? this.sanitizeInput(doctorData.registrationNumber) : '',
        primarySpecialization: doctorData.primarySpecialization ? this.sanitizeInput(doctorData.primarySpecialization) : '',
        primaryHospital: doctorData.primaryHospital ? this.sanitizeInput(doctorData.primaryHospital) : '',
        medicalQualifications: doctorData.medicalQualifications ? this.sanitizeInput(doctorData.medicalQualifications) : '',
        introduction: doctorData.introduction ? this.sanitizeInput(doctorData.introduction) : '',
        experience: doctorData.experience ? this.sanitizeInput(doctorData.experience) : '',
        conditions: doctorData.conditions ? this.sanitizeInput(doctorData.conditions) : '',
        consultationDays: doctorData.consultationDays ? this.sanitizeInput(doctorData.consultationDays) : '',
        consultationTimes: doctorData.consultationTimes ? this.sanitizeInput(doctorData.consultationTimes) : '',
        eChannellingUrl: doctorData.eChannellingUrl ? this.sanitizeInput(doctorData.eChannellingUrl) : '',
        primaryCity: doctorData.primaryCity ? this.sanitizeInput(doctorData.primaryCity) : '',
        profilePicture: doctorData.profilePicture ? doctorData.profilePicture : '',
        updatedAt: new Date().toISOString()
      };

      // Write professionalInfo under Doctor/{uid}
      await db.collection('Doctor').doc(uid).set({
        professionalInfo: sanitized,
        // Also keep a top-level personal.fullName for display consistency
        personal: {
          fullName: sanitized.fullName,
          updatedAt: sanitized.updatedAt
        }
      }, { merge: true });

      return { success: true };
    } catch (error: any) {
      console.error('Error saving doctor information:', error);
      return { success: false, error: 'Failed to save doctor information' };
    }
  }

  // Save health information
  async saveHealthInformation(uid: string, healthData: UserData['health']): Promise<{ success: boolean; error?: string }> {
    try {
      if (!uid || !healthData) {
        return { success: false, error: 'Invalid data provided' };
      }
      const healthRef = db.collection('Patient').doc(uid).collection('health').doc('common');

      // Validate required fields
      if (!healthData.weight || !healthData.height) {
        return { success: false, error: 'Weight and height are required' };
      }

      if (!healthData.termsAccepted) {
        return { success: false, error: 'Please accept the terms and conditions' };
      }

      // Sanitize inputs
      const sanitizedData = {
        ...healthData,
        weight: this.sanitizeInput(healthData.weight),
        height: this.sanitizeInput(healthData.height),
        bloodType: healthData.bloodType ? this.sanitizeInput(healthData.bloodType) : '',
        allergies: healthData.allergies ? this.sanitizeInput(healthData.allergies) : '',
        chronicDiseases: healthData.chronicDiseases ? this.sanitizeInput(healthData.chronicDiseases) : '',
        surgeries: healthData.surgeries ? this.sanitizeInput(healthData.surgeries) : '',
        medications: healthData.medications ? this.sanitizeInput(healthData.medications) : '',
        ongoingTreatments: healthData.ongoingTreatments ? this.sanitizeInput(healthData.ongoingTreatments) : '',
        lifestyle: {
          ...healthData.lifestyle,
          hereditaryConditions: healthData.lifestyle.hereditaryConditions ?
            this.sanitizeInput(healthData.lifestyle.hereditaryConditions) : ''
        },
        updatedAt: new Date().toISOString()
      };
      await healthRef.set(sanitizedData, { merge: true });

      // Complete registration
      await db.collection('Patient').doc(uid).set({
        health: sanitizedData,
        registrationCompleted: true,
        registrationCompletedAt: new Date().toISOString()
      }, { merge: true });

      return { success: true };
    } catch (error: any) {
      console.error('Error saving health information:', error);
      return { success: false, error: 'Failed to save health information' };
    }
  }

  // Update user profile (for existing users)
  async updateUserProfile(uid: string, updates: Partial<UserData>, role: 'patient' | 'doctor'): Promise<{ success: boolean; error?: string }> {
    try {
      if (!uid) {
        return { success: false, error: 'User ID is required' };
      }

      // Get current user document
      const userDoc = await db.collection(role === 'patient' ? 'Patient' : 'Doctor')
        .doc(uid).get();
      if (!userDoc.exists) {
        return { success: false, error: 'User not found' };
      }

      // Sanitize updates
      const sanitizedUpdates: any = {};

      if (updates.personal) {
        sanitizedUpdates.personal = {
          ...updates.personal,
          fullName: updates.personal.fullName ? this.sanitizeInput(updates.personal.fullName) : undefined,
          address: updates.personal.address ? this.sanitizeInput(updates.personal.address) : undefined,
          contactNumber: updates.personal.contactNumber ? this.sanitizeInput(updates.personal.contactNumber) : undefined,
          updatedAt: new Date().toISOString()
        };
      }

      if (updates.health) {
        sanitizedUpdates.health = {
          ...updates.health,
          updatedAt: new Date().toISOString()
        };
      }

      // Update document
      await db.collection(role === 'patient' ? 'Patient' : 'Doctor').doc(uid).update(sanitizedUpdates);

      return { success: true };
    } catch (error: any) {
      console.error('Error updating user profile:', error);
      return { success: false, error: 'Failed to update profile' };
    }
  }

  // Get user data
  async getUserData(uid: string, role?: 'patient' | 'doctor'): Promise<{ success: boolean; data?: UserData; error?: string }> {
    try {
      if (!uid) {
        return { success: false, error: 'User ID is required' };
      }

      // If caller provides a role, read directly from that collection
      if (role) {
        const collectionName = role === 'patient' ? 'Patient' : 'Doctor';
        const userDoc = await db.collection(collectionName).doc(uid).get();
        if (!userDoc.exists) return { success: false, error: 'User not found' };
        const userData = userDoc.data() as UserData;
        return { success: true, data: userData };
      }

      // No role provided: try Patient first, then Doctor
      try {
        const patientDoc = await db.collection('Patient').doc(uid).get();
        if (patientDoc.exists) {
          return { success: true, data: patientDoc.data() as UserData };
        }
      } catch (err: any) {
        // If permission denied on Patient read, log and continue to try Doctor
        if (err.code === 'permission-denied') {
          console.warn('Permission denied reading Patient collection, will try Doctor collection', err);
        } else {
          console.error('Error reading Patient document:', err);
        }
      }

      try {
        const doctorDoc = await db.collection('Doctor').doc(uid).get();
        if (doctorDoc.exists) {
          return { success: true, data: doctorDoc.data() as UserData };
        }
      } catch (err: any) {
        if (err.code === 'permission-denied') {
          console.error('Permission denied reading Doctor collection:', err);
          return { success: false, error: 'Missing or insufficient permissions to read user profile (permission-denied)' };
        }
        console.error('Error reading Doctor document:', err);
      }

      return { success: false, error: 'User not found in Patient or Doctor collections' };
    } catch (error: any) {
      console.error('Error getting user data:', error);
      return { success: false, error: 'Failed to retrieve user data' };
    }
  }

  // Determine roles for a given UID without throwing on permission errors
  async determineRoles(uid: string): Promise<{ isPatient: boolean; isDoctor: boolean; error?: string }> {
    try {
      if (!uid) return { isPatient: false, isDoctor: false, error: 'Invalid UID' };

      let isPatient = false;
      let isDoctor = false;
      let patientReadDenied = false;
      let doctorReadDenied = false;

      try {
        const patientDoc = await db.collection('Patient').doc(uid).get();
        isPatient = !!patientDoc.exists;
      } catch (err: any) {
        if (err && (err.code === 'permission-denied' || err.code === 'auth/insufficient-permission')) {
          // Warn once per UID for patient read denial
          const cache = this.permissionWarnCache[uid] || {};
          if (!cache.patientWarned) {
            console.warn('Permission denied when checking Patient document for uid=' + uid + '. This warning is shown once per session.');
            cache.patientWarned = true;
            this.permissionWarnCache[uid] = cache;
          }
          patientReadDenied = true;
        } else {
          console.warn('Non-fatal error checking Patient document:', err);
        }
      }

      try {
        const doctorDoc = await db.collection('Doctor').doc(uid).get();
        isDoctor = !!doctorDoc.exists;
      } catch (err: any) {
        if (err && (err.code === 'permission-denied' || err.code === 'auth/insufficient-permission')) {
          // Warn once per UID for doctor read denial
          const cache = this.permissionWarnCache[uid] || {};
          if (!cache.doctorWarned) {
            console.warn('Permission denied when checking Doctor document for uid=' + uid + '. This warning is shown once per session.');
            cache.doctorWarned = true;
            this.permissionWarnCache[uid] = cache;
          }
          doctorReadDenied = true;
        } else {
          console.warn('Non-fatal error checking Doctor document:', err);
        }
      }

      // If both reads were denied, surface a permission error. Otherwise return whatever we could determine.
      if (patientReadDenied && doctorReadDenied) {
        // Log a single error when both reads are denied
        console.error('Permission denied when checking both Patient and Doctor documents for uid=' + uid + '.');
        return { isPatient: false, isDoctor: false, error: 'permission-denied' };
      }

      return { isPatient, isDoctor };
    } catch (error: any) {
      console.error('Error determining roles:', error);
      return { isPatient: false, isDoctor: false, error: 'failed' };
    }
  }

  // Sign in user (authenticate only; avoid Firestore reads/writes here to prevent permission errors on sign-in)
  async signInUser(email: string, password: string): Promise<{ success: boolean; uid?: string; error?: string }> {
    try {

      if (!email || !password) {
        return { success: false, error: 'Email and password are required' };
      }

      if (!this.validateEmail(email)) {
        return { success: false, error: 'Please enter a valid email address' };
      }

      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      const uid = userCredential.user?.uid;

      if (!uid) {
        return { success: false, error: 'Failed to sign in' };
      }

      // Don't perform Firestore reads/writes here. Caller should call determineRoles(uid) to discover roles.
      return { success: true, uid };
    } catch (error: any) {
      console.error('Error signing in:', error);
      let errorMessage = 'Failed to sign in. Please try again.';
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessage = 'Invalid email or password';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later';
          break;
      }

      return { success: false, error: errorMessage };
    }
  }

  // Sign out user
  async signOutUser(): Promise<{ success: boolean; error?: string }> {
    try {
      await auth.signOut();
      return { success: true };
    } catch (error: any) {
      console.error('Error signing out:', error);
      return { success: false, error: 'Failed to sign out' };
    }
  }

  // Reset password
  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!email) {
        return { success: false, error: 'Email is required' };
      }

      if (!this.validateEmail(email)) {
        return { success: false, error: 'Please enter a valid email address' };
      }

      await auth.sendPasswordResetEmail(email);
      return { success: true };
    } catch (error: any) {
      console.error('Error sending password reset email:', error);

      let errorMessage = 'Failed to send password reset email';
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
      }

      return { success: false, error: errorMessage };
    }
  }
}

export default new AuthService();