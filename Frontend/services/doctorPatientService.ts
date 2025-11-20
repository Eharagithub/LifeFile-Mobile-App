import axios, { isAxiosError } from 'axios';
import { getBackendUrl } from '../config/backendConfig';

// Types for API responses and requests
export interface CheckDuplicateResponse {
  success: boolean;
  isDuplicate: boolean;
  existingLinkId?: string;
  status?: string;
  message: string;
}

export interface PatientData {
  nic: string;
  fullName: string;
  phone: string;
}

export interface SendVerificationResponse {
  success: boolean;
  linkId: string;
  smsSent: boolean;
  devOtp?: string;
  providerInfo?: string;
  message?: string;
}

export interface PatientLink {
  linkId: string;
  patientId: string;
  nic: string;
  fullName: string;
  contactNumber: string;
  status: 'invited' | 'pending' | 'verified';
  createdAt: string;
  verifiedAt?: string;
}

export interface GetDoctorPatientsResponse {
  success: boolean;
  patients: PatientLink[];
  count: number;
}

export interface VerifyCodeResponse {
  success: boolean;
  linkedPatientId?: string;
  message: string;
}

export interface ResendOtpResponse {
  success: boolean;
  smsSent: boolean;
  message: string;
  devOtp?: string;
}

export interface VerifyCodeRequest {
  doctorId: string;
  linkId: string;
  code: string;
  patientAuthUid?: string;
}

// Service class for doctor-patient operations
class DoctorPatientService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = getBackendUrl();
  }

  /**
   * Check if patient already exists in doctor's list by NIC
   */
  async checkDuplicatePatient(
    nic: string,
    doctorId: string
  ): Promise<CheckDuplicateResponse> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/checkDuplicatePatient`,
        { nic, doctorId }
      );
      return response.data;
    } catch (error) {
      console.error('Error checking duplicate patient:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Send verification SMS to a patient
   */
  async sendVerification(
    nic: string,
    fullName: string,
    phone: string,
    doctorId: string
  ): Promise<SendVerificationResponse> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/sendVerification`,
        { nic, fullName, phone, doctorId }
      );
      return response.data;
    } catch (error) {
      console.error('Error sending verification:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Verify OTP code entered by doctor
   */
  async verifyCode(payload: VerifyCodeRequest): Promise<VerifyCodeResponse> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/verifyCode`,
        payload
      );
      return response.data;
    } catch (error) {
      console.error('Error verifying code:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get all patients linked to a doctor, with optional status filter
   */
  async getDoctorPatients(
    doctorId: string,
    status?: string
  ): Promise<GetDoctorPatientsResponse> {
    try {
      const payload: any = { doctorId };
      if (status) {
        payload.status = status;
      }
      const response = await axios.post(
        `${this.baseUrl}/api/getDoctorPatients`,
        payload
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching doctor patients:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Resend OTP to a patient
   */
  async resendOtp(
    doctorId: string,
    linkId: string
  ): Promise<ResendOtpResponse> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/resendOtp`,
        { doctorId, linkId }
      );
      return response.data;
    } catch (error) {
      console.error('Error resending OTP:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Claim a public patient profile (for patient signup flow)
   */
  async claimPublicPatient(
    publicPatientId: string,
    patientUid: string
  ): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/claimPublicPatient`,
        { publicPatientId, patientUid }
      );
      return response.data;
    } catch (error) {
      console.error('Error claiming public patient:', error);
      throw this.handleError(error);
    }
  }

  // Helper methods

  /**
   * Format phone number (remove special characters, ensure length)
   */
  formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    // Sri Lankan numbers can be 9 or 10 digits
    if (cleaned.length === 9) {
      return '+94' + cleaned;
    }
    if (cleaned.length === 10 && cleaned.startsWith('0')) {
      return '+94' + cleaned.substring(1);
    }
    // Assume it already has country code or return as-is
    return '+' + cleaned;
  }

  /**
   * Validate NIC format (Sri Lankan NIC)
   */
  validateNIC(nic: string): boolean {
    // Sri Lankan NIC can be 9 digits or 12 digits with V/X at end
    const nicRegex = /^(\d{9}[VX]|\d{12})$/i;
    return nicRegex.test(nic.trim().toUpperCase());
  }

  /**
   * Validate phone number
   */
  validatePhone(phone: string): boolean {
    const cleaned = phone.replace(/\D/g, '');
    // Sri Lankan numbers: 9 or 10 digits
    return cleaned.length === 9 || cleaned.length === 10;
  }

  /**
   * Validate patient data before submission
   */
  validatePatientData(data: PatientData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.nic || !this.validateNIC(data.nic)) {
      errors.push('Invalid NIC format');
    }

    if (!data.fullName || data.fullName.trim().length === 0) {
      errors.push('Full name is required');
    }

    if (!data.phone || !this.validatePhone(data.phone)) {
      errors.push('Invalid phone number');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get status color for UI display
   */
  getStatusColor(status: string): string {
    switch (status) {
      case 'verified':
        return '#4CAF50'; // Green
      case 'pending':
        return '#FF9800'; // Orange
      case 'invited':
        return '#2196F3'; // Blue
      default:
        return '#999999'; // Gray
    }
  }

  /**
   * Get status display text
   */
  getStatusText(status: string): string {
    switch (status) {
      case 'verified':
        return 'Verified ✓';
      case 'pending':
        return 'Awaiting Verification';
      case 'invited':
        return 'Invitation Sent';
      default:
        return 'Unknown';
    }
  }

  /**
   * Handle API errors uniformly
   */
  private handleError(error: any): Error {
    if (isAxiosError(error)) {
      if (error.response) {
        // Server responded with error status
        const message =
          error.response.data?.message ||
          `Server error: ${error.response.status}`;
        return new Error(message);
      } else if (error.request) {
        // Request was made but no response
        return new Error('No response from server. Check your connection.');
      }
    }
    return new Error(error.message || 'An unknown error occurred');
  }
}

// Export singleton instance
export default new DoctorPatientService();