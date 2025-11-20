// services/firestoreQueries.ts
import { db } from '../config/firebaseConfig';

export interface DocumentRecord {
  id: string;
  title: string;
  description: string;
  type: 'vault' | 'lab';
  data: any;
}

export interface DateGroup {
  date: string;
  documents: DocumentRecord[];
}

/**
 * Fetch patient personal data
 */
export const fetchPatientPersonalData = async (patientUid: string) => {
  console.log('📋 Fetching personal data for patient:', patientUid);
  
  try {
    const patientDoc = await db
      .collection('Patient')
      .doc(patientUid)
      .get();

    if (!patientDoc.exists) {
      throw new Error('Patient document not found');
    }

    const patientData = patientDoc.data();
    const personalData = patientData?.personal;

    if (!personalData) {
      console.log('⚠️ No personal data found');
      return null;
    }

    console.log('✅ Personal data found:', personalData);

    // Calculate age from dateOfBirth - FIXED for DD/MM/YYYY format
    let age = 0;
    if (personalData.dateOfBirth) {
      let birthDate;
      
      // Handle different date formats
      if (personalData.dateOfBirth.includes('/')) {
        // Format: "01/11/2022"
        const [day, month, year] = personalData.dateOfBirth.split('/');
        birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else {
        // Format: ISO string or other
        birthDate = new Date(personalData.dateOfBirth);
      }
      
      const today = new Date();
      age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      console.log('🎂 Age calculated from DOB:', age);
    }

    return {
      name: personalData.fullName || 'Unknown',
      age: age || 0,
      location: personalData.gender || 'Unknown',
      bloodType: 'N/A', // Will be updated from health data
      nextVisit: 'TBD',
    };
  } catch (error) {
    console.error('❌ Error fetching personal data:', error);
    throw error;
  }
};

/**
 * Fetch patient health/common data (allergies, medications, etc.)
 */
export const fetchPatientHealthData = async (patientUid: string) => {
  console.log('🔍 Fetching health/common data for patient:', patientUid);
  
  try {
    const healthSnapshot = await db
      .collection('Patient')
      .doc(patientUid)
      .collection('health')
      .get();

    if (healthSnapshot.empty) {
      console.log('⚠️ No health collection found');
      return { allergies: [], medications: [], bloodType: 'N/A' };
    }

    // Get the common document
    const commonDocs = healthSnapshot.docs.filter(doc => doc.id === 'common');
    if (commonDocs.length === 0) {
      console.log('⚠️ No common document found in health collection');
      return { allergies: [], medications: [], bloodType: 'N/A' };
    }

    const commonData = commonDocs[0].data();
    console.log('✅ Health/common data found:', commonData);

    // Process allergies
    let allergiesArray: any[] = [];
    if (commonData.allergies) {
      if (typeof commonData.allergies === 'string') {
        allergiesArray = commonData.allergies.split(',').map((a: string) => a.trim()).filter((a: string) => a);
      } else if (Array.isArray(commonData.allergies)) {
        allergiesArray = commonData.allergies;
      }
    }

    const allergies = allergiesArray.map((allergy: any, index: number) => ({
      id: String(index),
      name: typeof allergy === 'string' ? allergy : (allergy.name || 'Unknown'),
      description: allergy.description || '',
    }));

    // Process medications
    let medsArray = commonData.active_medications || commonData.medications || [];
    if (typeof medsArray === 'string' && medsArray === '') {
      medsArray = [];
    }
    if (!Array.isArray(medsArray)) {
      medsArray = [];
    }

    const medications = medsArray.map((med: any, index: number) => ({
      id: String(index),
      name: med.name || 'Unknown',
      dosage: med.dosage || 'N/A',
      frequency: med.frequency || 'N/A',
      duration: med.duration || 'N/A',
      status: med.status || 'Active',
    }));

    return {
      allergies,
      medications,
      bloodType: commonData.bloodType || 'N/A'
    };
  } catch (error) {
    console.error('❌ Error fetching health data:', error);
    throw error;
  }
};

/**
 * Fetch vault records with enhanced debugging
 */
export const fetchVaultRecords = async (patientUid: string): Promise<DateGroup[]> => {
  console.log('🗂️ Fetching vault records for patient:', patientUid);
  
  try {
    // Get all vault date folders
    const vaultSnapshot = await db
      .collection('Patient')
      .doc(patientUid)
      .collection('health')
      .doc('history')
      .collection('vault')
      .get();

    console.log('✅ Vault query returned', vaultSnapshot.docs.length, 'date folders');

    // If no vault records found, return empty array (this is normal)
    if (vaultSnapshot.empty) {
      console.log('ℹ️ No vault records found for this patient - this is normal if no documents uploaded yet');
      return [];
    }

    const vaultByDate: { [date: string]: DocumentRecord[] } = {};

    // Process each date folder
    for (const dateDoc of vaultSnapshot.docs) {
      const dateId = dateDoc.id;
      console.log('📄 Processing vault date:', dateId);

      try {
        // Get documents from the "documents" subcollection
        const docsSnapshot = await db
          .collection('Patient')
          .doc(patientUid)
          .collection('health')
          .doc('history')
          .collection('vault')
          .doc(dateId)
          .collection('documents')
          .get();

        if (!docsSnapshot.empty) {
          console.log(`   ✅ Found ${docsSnapshot.docs.length} documents in vault/${dateId}/documents`);
          vaultByDate[dateId] = [];

          docsSnapshot.forEach((doc) => {
            const docData = doc.data();
            console.log('   📋 Vault doc:', doc.id, docData.name || docData.originalName);
            
            vaultByDate[dateId].push({
              id: doc.id,
              title: docData.name || docData.originalName || 'Document',
              description: docData.type || '',
              type: 'vault',
              data: docData
            });
          });
        } else {
          console.log(`   ⚠️ No documents found in vault/${dateId}/documents`);
          vaultByDate[dateId] = [];
        }
      } catch (err) {
        console.log(`   ❌ Error accessing vault/${dateId}/documents:`, err);
        vaultByDate[dateId] = [];
      }
    }

    // Sort dates in descending order
    const sortedVaultDates = Object.keys(vaultByDate)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    console.log('📊 Sorted vault dates:', sortedVaultDates);
    
    const vaultData = sortedVaultDates.map(date => ({
      date,
      documents: vaultByDate[date] || []
    }));

    console.log('✅ Vault records loaded:', vaultData.length, 'dates with documents');
    return vaultData;

  } catch (error: any) {
    console.error('❌ Error fetching vault records:', error);
    
    // Handle permission errors gracefully
    if (error.code === 'permission-denied' || error.code === 'missing-or-insufficient-permissions') {
      console.warn('⚠️ Permission denied for vault records.');
      return [];
    }
    
    // If the main vault collection doesn't exist, return empty array
    if (error.code === 'not-found') {
      console.log('⚠️ Vault collection not found');
      return [];
    }
    
    throw error;
  }
};

/**
 * Fetch lab records for a patient
 */
export const fetchLabRecords = async (patientUid: string): Promise<DateGroup[]> => {
  console.log('🧪 Fetching lab records for patient:', patientUid);
  
  try {
    // Get all lab date folders
    const labSnapshot = await db
      .collection('Patient')
      .doc(patientUid)
      .collection('health')
      .doc('history')
      .collection('labs')
      .get();

    console.log('✅ Lab query returned', labSnapshot.docs.length, 'date folders');

    const labByDate: { [date: string]: DocumentRecord[] } = {};

    // Process each date folder
    for (const dateDoc of labSnapshot.docs) {
      const dateId = dateDoc.id;
      console.log('📄 Processing lab date:', dateId);

      try {
        // Get documents from the "documents" subcollection
        const docsSnapshot = await db
          .collection('Patient')
          .doc(patientUid)
          .collection('health')
          .doc('history')
          .collection('labs')
          .doc(dateId)
          .collection('documents')
          .get();

        if (!docsSnapshot.empty) {
          console.log(`   ✅ Found ${docsSnapshot.docs.length} documents in labs/${dateId}/documents`);
          labByDate[dateId] = [];

          docsSnapshot.forEach((doc) => {
            const docData = doc.data();
            console.log('   📋 Lab doc:', doc.id, docData.name || docData.originalName);
            
            labByDate[dateId].push({
              id: doc.id,
              title: docData.name || docData.originalName || 'Lab Report',
              description: docData.type || '',
              type: 'lab',
              data: docData
            });
          });
        } else {
          console.log(`   ⚠️ No documents found in labs/${dateId}/documents`);
          labByDate[dateId] = [];
        }
      } catch (err) {
        console.log(`   ❌ Error accessing labs/${dateId}/documents:`, err);
        labByDate[dateId] = [];
      }
    }

    // Sort dates in descending order
    const sortedLabDates = Object.keys(labByDate)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    console.log('📊 Sorted lab dates:', sortedLabDates);
    
    const labData = sortedLabDates.map(date => ({
      date,
      documents: labByDate[date] || []
    }));

    console.log('✅ Lab records loaded:', labData.length, 'dates with documents');
    return labData;

  } catch (error: any) {
    console.error('❌ Error fetching lab records:', error);
    // If the main labs collection doesn't exist, return empty array
    if (error.code === 'not-found') {
      console.log('⚠️ Labs collection not found, returning empty array');
      return [];
    }
    throw error;
  }
};

/**
 * DEBUG function to check Firestore structure
 */
export const debugFirestoreStructure = async (patientUid: string) => {
  console.log('🕵️ DEBUG: Checking Firestore structure for patient:', patientUid);
  
  try {
    // Check if health/history exists
    const historyDoc = await db
      .collection('Patient')
      .doc(patientUid)
      .collection('health')
      .doc('history')
      .get();

    console.log('📋 History document exists:', historyDoc.exists);

    if (!historyDoc.exists) {
      console.log('❌ No history document found');
      return;
    }

    // Check vault structure
    try {
      const vaultRef = db
        .collection('Patient')
        .doc(patientUid)
        .collection('health')
        .doc('history')
        .collection('vault');

      const vaultDates = await vaultRef.get();
      console.log('🗓️ Vault dates found:', vaultDates.docs.map(d => d.id));
      console.log('📋 Total vault date folders:', vaultDates.size);

      // Check one vault date for documents
      if (vaultDates.docs.length > 0) {
        const sampleDate = vaultDates.docs[0];
        console.log(`🔍 Sample vault date ${sampleDate.id}:`, sampleDate.data());
        
        try {
          const docsRef = vaultRef.doc(sampleDate.id).collection('documents');
          const docs = await docsRef.get();
          console.log(`   📂 Documents in vault/${sampleDate.id}/documents:`, docs.docs.length);
          docs.docs.forEach(doc => {
            console.log(`      - ${doc.id}:`, doc.data().name || doc.data().originalName);
          });
        } catch (err) {
          console.log(`   ❌ Cannot access documents subcollection:`, err);
        }
      } else {
        console.log('ℹ️ No vault date folders found - patient has no vault records');
      }
    } catch (vaultErr: any) {
      console.log('❌ Vault collection access error:', vaultErr);
      if (vaultErr.code === 'permission-denied') {
        console.log('⚠️ Permission denied for vault collection');
      }
    }

    // Check labs structure
    try {
      const labsRef = db
        .collection('Patient')
        .doc(patientUid)
        .collection('health')
        .doc('history')
        .collection('labs');

      const labDates = await labsRef.get();
      console.log('🧪 Lab dates found:', labDates.docs.map(d => d.id));

      // Check one lab date for documents
      if (labDates.docs.length > 0) {
        const sampleDate = labDates.docs[0];
        console.log(`🔍 Sample lab date ${sampleDate.id}:`, sampleDate.data());
        
        try {
          const docsRef = labsRef.doc(sampleDate.id).collection('documents');
          const docs = await docsRef.get();
          console.log(`   📂 Documents in labs/${sampleDate.id}/documents:`, docs.docs.length);
          docs.docs.forEach(doc => {
            console.log(`      - ${doc.id}:`, doc.data().name || doc.data().originalName);
          });
        } catch (err) {
          console.log(`   ❌ Cannot access documents subcollection:`, err);
        }
      }
    } catch (labsErr) {
      console.log('❌ Labs collection access error:', labsErr);
    }

  } catch (error) {
    console.error('❌ Debug error:', error);
  }
};

/**
 * ENHANCED DEBUG: Check vault structure in detail
 */
export const debugVaultStructure = async (patientUid: string) => {
  console.log('🔍 ENHANCED DEBUG: Checking vault structure for patient:', patientUid);
  
  try {
    // Check the exact vault path
    const vaultRef = db
      .collection('Patient')
      .doc(patientUid)
      .collection('health')
      .doc('history')
      .collection('vault');

    const vaultDates = await vaultRef.get();
    console.log('🗓️ Vault dates found:', vaultDates.docs.map(d => d.id));
    console.log('📋 Total vault date folders:', vaultDates.size);

    // If no dates found, check if vault exists at all
    if (vaultDates.empty) {
      console.log('❌ No vault date folders found at path: Patient/{uid}/health/history/vault');
      
      // Let's check if there are any documents directly in vault (without date folders)
      try {
        const allVaultDocs = await vaultRef.get();
        console.log('🔍 Checking for documents directly in vault (no date folders):', allVaultDocs.docs.length);
        allVaultDocs.docs.forEach(doc => {
          console.log(`   - ${doc.id}:`, doc.data());
        });
      } catch (err) {
        console.log('❌ Cannot access vault directly:', err);
      }

      // Check alternative vault paths
      await checkAlternativeVaultPaths(patientUid);
    } else {
      // If dates found, check each one
      vaultDates.docs.forEach(dateDoc => {
        console.log(`📅 Vault date ${dateDoc.id}:`, dateDoc.data());
      });
    }

  } catch (error) {
    console.error('❌ Error debugging vault structure:', error);
  }
};

/**
 * Check for vault records in alternative locations
 */
const checkAlternativeVaultPaths = async (patientUid: string) => {
  console.log('🕵️ Checking alternative vault paths...');
  
  const alternativePaths = [
    // Path 1: Direct under health (no history)
    ['Patient', patientUid, 'health', 'vault'],
    // Path 2: Direct under patient (no health/history)
    ['Patient', patientUid, 'vault'],
    // Path 3: Under health but different structure
    ['Patient', patientUid, 'health', 'history', 'vault', 'documents'],
  ];

  for (const path of alternativePaths) {
    try {
      let ref: any = db;
      path.forEach(segment => {
        if (ref.collection) {
          ref = ref.collection(segment);
        }
      });
      
      const snapshot = await ref.get();
      console.log(`🔍 Path ${path.join('/')}: ${snapshot.docs.length} documents`);
      
      if (!snapshot.empty) {
        snapshot.docs.forEach((doc: any) => {
          console.log(`   - ${doc.id}:`, Object.keys(doc.data()));
        });
      }
    } catch (err: any) {
      console.log(`❌ Cannot access ${path.join('/')}:`, err.message);
    }
  }
};

/**
 * Fetch active medications for a patient
 */
export const fetchActiveMedications = async (patientUid: string) => {
  console.log('🔍 Fetching active medications for patient:', patientUid);

  try {
    const medicationsSnapshot = await db
      .collection('Patient')
      .doc(patientUid)
      .collection('health')
      .doc('activemedications')
      .collection('medications')
      .where('status', '==', 'Active')
      .get();

    if (medicationsSnapshot.empty) {
      console.log('⚠️ No active medications found');
      return [];
    }

    const medications: any[] = [];
    medicationsSnapshot.forEach((doc) => {
      const medData = doc.data();
      medications.push({
        id: doc.id,
        ...medData,
      });
    });

    console.log('✅ Active medications found:', medications.length);
    return medications;
  } catch (err: any) {
    console.error('❌ Error fetching active medications:', err);
    return [];
  }
};

/**
 * Fetch next scheduled visit for a patient
 */
export const fetchNextScheduledVisit = async (patientUid: string) => {
  console.log('🔍 Fetching next scheduled visit for patient:', patientUid);

  try {
    const visitSnapshot = await db
      .collection('Patient')
      .doc(patientUid)
      .collection('health')
      .doc('visitSchedule')
      .collection('scheduled')
      .where('visitDate', '>=', new Date().toISOString().split('T')[0])
      .orderBy('visitDate', 'asc')
      .limit(1)
      .get();

    if (visitSnapshot.empty) {
      console.log('⚠️ No upcoming visits found');
      return null;
    }

    const visitData = visitSnapshot.docs[0].data();
    console.log('✅ Next visit found:', visitData);
    return {
      id: visitSnapshot.docs[0].id,
      ...visitData,
    };
  } catch (err: any) {
    console.error('❌ Error fetching next visit:', err);
    return null;
  }
};