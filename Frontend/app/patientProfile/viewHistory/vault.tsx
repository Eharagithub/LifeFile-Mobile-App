import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ActivityIndicator, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { db, auth } from '../../../config/firebaseConfig';
import styles from './viewhistory.styles';

export default function VaultView() {
  const { uid: uidParam, date: dateParam, docId: docIdParam } = useLocalSearchParams() as any;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [doc, setDoc] = useState<any>(null);

  const getCurrentUid = () => auth.currentUser ? auth.currentUser.uid : null;

  useEffect(() => {
    const uid = uidParam || getCurrentUid();
    const date = dateParam;
    const docId = docIdParam;
    if (!uid || !date || !docId) {
      Alert.alert('Missing params', 'Cannot load document: missing parameters');
      setLoading(false);
      return;
    }

    const loadDoc = async () => {
      setLoading(true);
      try {
        const docRef = db.collection('Patient').doc(uid)
          .collection('health').doc('history')
          .collection('vault').doc(date)
          .collection('documents').doc(docId);

        const snap = await docRef.get();
        if (snap.exists) {
          setDoc({ id: snap.id, ...(snap.data() || {}) });
          setLoading(false);
          return;
        }

        // Fallback: nested map
        const userDoc = await db.collection('Patient').doc(uid).get();
        if (userDoc.exists) {
          const data = userDoc.data() || {};
          const nested = (((data as any).health || {}).history || {}).vault || {};
          const dateNode = nested[date];
          const docMap = dateNode && dateNode.documents ? dateNode.documents : null;
          if (docMap && docMap[docId]) {
            setDoc({ id: docId, ...(docMap[docId] || {}) });
            setLoading(false);
            return;
          }
        }

        Alert.alert('Not found', 'Document not found');
      } catch (err) {
        console.error('Failed to load vault document:', err);
        Alert.alert('Error', 'Failed to load document');
      } finally {
        setLoading(false);
      }
    };

    loadDoc();
  }, [uidParam, dateParam, docIdParam]);

  const handleBack = () => router.back();

  if (loading) return (
    <SafeAreaView style={styles.container}>
      <ActivityIndicator size="large" color="#8B5CF6" style={{ marginTop: 40 }} />
    </SafeAreaView>
  );

  if (!doc) return (
    <SafeAreaView style={styles.container}>
      <Text style={{ padding: 20 }}>No document loaded.</Text>
    </SafeAreaView>
  );

  const isImage = doc.type && doc.type.startsWith('image');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={{ fontSize: 18 }}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{doc.name || 'Vault Document'}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ fontWeight: '600', marginBottom: 8 }}>Uploaded</Text>
        <Text style={{ marginBottom: 12 }}>{doc.uploadedAt ? (doc.uploadedAt.toDate ? doc.uploadedAt.toDate().toString() : String(doc.uploadedAt)) : ''}</Text>

        <Text style={{ fontWeight: '600', marginBottom: 8 }}>Type</Text>
        <Text style={{ marginBottom: 12 }}>{doc.type || '-'}</Text>

        {isImage && doc.contentBase64 ? (
          <Image source={{ uri: `data:${doc.type};base64,${doc.contentBase64}` }} style={{ width: '100%', height: 400, borderRadius: 8 }} />
        ) : (
          <Text style={{ color: '#6c757d' }}>Preview not available. You can implement download/open for this file type.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
