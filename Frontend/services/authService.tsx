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
}

class AuthService {
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
  async createUserAccount(email: string, password: string, confirmPassword: string): Promise<{ success: boolean; uid?: string; error?: string }> {
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
      await this.initializeUserDocument(uid, email);

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
  private async initializeUserDocument(uid: string, email: string): Promise<void> {
    const userData: Partial<UserData> = {
      email: this.sanitizeInput(email),
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      registrationCompleted: false
    };

    await db.collection('users').doc(uid).set(userData);
  }

  // Save personal information
  async savePersonalInformation(uid: string, personalData: UserData['personal']): Promise<{ success: boolean; error?: string }> {
    try {
      if (!uid || !personalData) {
        return { success: false, error: 'Invalid data provided' };
      }

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
      await db.collection('users').doc(uid).set({
        personal: sanitizedData
      }, { merge: true });

      return { success: true };
    } catch (error: any) {
      console.error('Error saving personal information:', error);
      return { success: false, error: 'Failed to save personal information' };
    }
  }

  // Save health information
  async saveHealthInformation(uid: string, healthData: UserData['health']): Promise<{ success: boolean; error?: string }> {
    try {
      if (!uid || !healthData) {
        return { success: false, error: 'Invalid data provided' };
      }

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

      // Complete registration
      await db.collection('users').doc(uid).set({
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
  async updateUserProfile(uid: string, updates: Partial<UserData>): Promise<{ success: boolean; error?: string }> {
    try {
      if (!uid) {
        return { success: false, error: 'User ID is required' };
      }

      // Get current user document
      const userDoc = await db.collection('users').doc(uid).get();
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
      await db.collection('users').doc(uid).update(sanitizedUpdates);

      return { success: true };
    } catch (error: any) {
      console.error('Error updating user profile:', error);
      return { success: false, error: 'Failed to update profile' };
    }
  }

  // Get user data
  async getUserData(uid: string): Promise<{ success: boolean; data?: UserData; error?: string }> {
    try {
      if (!uid) {
        return { success: false, error: 'User ID is required' };
      }

      const userDoc = await db.collection('users').doc(uid).get();
      if (!userDoc.exists) {
        return { success: false, error: 'User not found' };
      }

      const userData = userDoc.data() as UserData;
      return { success: true, data: userData };
    } catch (error: any) {
      console.error('Error getting user data:', error);
      return { success: false, error: 'Failed to retrieve user data' };
    }
  }

  // Sign in user
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

      // Update last login time
      await db.collection('users').doc(uid).update({
        lastLoginAt: new Date().toISOString()
      });

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