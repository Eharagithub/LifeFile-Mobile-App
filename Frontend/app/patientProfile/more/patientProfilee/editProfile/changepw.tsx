import React, { useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../../../../../config/firebaseConfig'; 
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
// Mailjet API credentials (move to env or backend for production)
const MAILJET_API_KEY = '948706932835dab7124eeac007e991e3';
const MAILJET_API_SECRET = 'de3b30027cccfa3800cfccaae6847d0d';
// ---------------------------------------------

interface ChangePwProps {
  visible: boolean;
  onClose: () => void;
}

type SecurityStep = 'reauthenticate' | 'verifyEmailOtp';

export const ChangePw: React.FC<ChangePwProps> = ({ visible, onClose }) => {
  const [step, setStep] = useState<SecurityStep>('reauthenticate');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');

  // Step 1: Check old password and trigger the email OTP
  const handleReauthentication = async () => {
    setError(null);
    if (!oldPassword || !newPassword || !confirmPassword) {
      return setError('Please fill in all password fields.');
    }
    if (newPassword !== confirmPassword) {
      return setError('The new passwords do not match.');
    }

    setLoading(true);
    const user = auth.currentUser;
    if (!user || !user.email) {
      setLoading(false);
      return setError('You are not logged in correctly.');
    }

    try {
      // First, check if the old password is correct
      const credential = EmailAuthProvider.credential(user.email, oldPassword);
      await reauthenticateWithCredential(user, credential);

      // --- Password is correct, now send the email OTP ---
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Save the OTP and an expiry time in Firestore
      const otpRef = doc(db, 'passwordChangeOtps', user.uid);
      await setDoc(otpRef, {
        otp: generatedOtp,
        createdAt: serverTimestamp(),
      });

      // --- Send email using Mailjet REST API via fetch ---
      const mailjetUrl = 'https://api.mailjet.com/v3.1/send';
      const mailjetBody = {
        Messages: [
          {
            From: {
              Email: 'no-reply@yourdomain.com', // Use a verified sender email from your Mailjet account
              Name: 'LifeFile - A Smart Health Record & Consultation Companion',
            },
            To: [
              {
                Email: user.email,
                Name: user.displayName || 'Valued User',
              },
            ],
            Subject: 'Your Password Change Verification Code',
            HTMLPart: `
              <h3>Security Verification</h3>
              <p>Hello,</p>
              <p>To finish changing your password, please use the following verification code:</p>
              <h2 style="font-size: 28px; letter-spacing: 4px; text-align: center;">${generatedOtp}</h2>
              <p>This code will expire in 10 minutes. If you did not request this change, please secure your account immediately.</p>
            `,
          },
        ],
      };
      const mailjetResponse = await fetch(mailjetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa(`${MAILJET_API_KEY}:${MAILJET_API_SECRET}`),
        },
        body: JSON.stringify(mailjetBody),
      });
      if (!mailjetResponse.ok) {
        throw new Error('Failed to send verification email.');
      }

      setStep('verifyEmailOtp'); // Move to the next screen

    } catch (err: any) {
      console.error('Error during re-auth or email sending:', err);
      if (err.code === 'auth/wrong-password') {
        setError('The old password you entered is incorrect.');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Check the email OTP and finalize the password change
  const handleOtpVerification = async () => {
    setError(null);
    if (!otpCode || otpCode.length !== 6) {
      return setError('Please enter the 6-digit code from your email.');
    }

    setLoading(true);
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return setError('You are not logged in.');
    }

    try {
      const otpRef = doc(db, 'passwordChangeOtps', user.uid);
      const otpDoc = await getDoc(otpRef);

      if (!otpDoc.exists()) throw new Error('No OTP found. Please try again.');

      const { otp: savedOtp, createdAt } = otpDoc.data();
      const timeDiffMinutes = (new Date().getTime() - createdAt.toDate().getTime()) / 60000;

      if (savedOtp !== otpCode) throw new Error('The code you entered is incorrect.');
      if (timeDiffMinutes > 10) throw new Error('The code has expired. Please try again.');

      // --- OTP is correct! Now, finally update the password ---
      await updatePassword(user, newPassword);

      Alert.alert(
        'Password Changed Successfully',
        'Your password has been updated. You will now be logged out for security.',
        [{ text: 'OK', onPress: () => auth.signOut().then(handleClose) }]
      );

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Function to reset everything when the popup is closed
  const handleClose = () => {
    setStep('reauthenticate');
    setError(null);
    setLoading(false);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setOtpCode('');
    onClose();
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={handleClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close-circle" size={26} color="#6b7280" />
          </TouchableOpacity>
          
          {step === 'reauthenticate' && (
            <>
              <Text style={styles.title}>Change Password</Text>
              <Text style={styles.label}>Old Password</Text>
              <TextInput style={styles.input} secureTextEntry value={oldPassword} onChangeText={setOldPassword} />
              <Text style={styles.label}>New Password</Text>
              <TextInput style={styles.input} secureTextEntry value={newPassword} onChangeText={setNewPassword} />
              <Text style={styles.label}>Confirm New Password</Text>
              <TextInput style={styles.input} secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />
              <TouchableOpacity style={styles.submitButton} onPress={handleReauthentication} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Continue</Text>}
              </TouchableOpacity>
            </>
          )}

          {step === 'verifyEmailOtp' && (
            <>
              <Text style={styles.title}>Check Your Email</Text>
              <Text style={styles.subtitle}> We have sent a 6-digit code to your registered email address. Please enter it below.</Text>
              <Text style={styles.label}>6-Digit Verification Code</Text>
              <TextInput style={styles.input} keyboardType="number-pad" maxLength={6} value={otpCode} onChangeText={setOtpCode} />
              <TouchableOpacity style={styles.submitButton} onPress={handleOtpVerification} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Verify & Change Password</Text>}
              </TouchableOpacity>
            </>
          )}

          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)' },
  modalContainer: { width: '90%', backgroundColor: '#fff', borderRadius: 15, padding: 25 },
  closeButton: { position: 'absolute', top: 15, right: 15 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1f2937', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 14, color: '#4b5563', textAlign: 'center', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8, marginTop: 10 },
  input: { height: 50, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, paddingHorizontal: 15, fontSize: 16 },
  submitButton: { backgroundColor: '#8B5CF6', paddingVertical: 15, borderRadius: 10, alignItems: 'center', marginTop: 25 },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  errorText: { color: '#ef4444', fontSize: 14, textAlign: 'center', marginTop: 15 },
});
