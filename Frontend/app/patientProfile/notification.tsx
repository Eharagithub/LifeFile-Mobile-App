import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { styles } from './notification.styles';
import BottomNavigation from '@/app/common/BottomNavigation';
import { db, auth } from '../../config/firebaseConfig';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  visitDate?: string;
  visitTime?: string;
  visitType?: string;
  createdAt: string;
  read: boolean;
}

interface ScheduledVisit {
  id: string;
  visitDate: string;
  visitTime: string;
  visitType: string;
  notes?: string;
  scheduledBy?: string;
  doctorName?: string;
  scheduledAt: string;
  status: string;
}

const NotificationScreen: React.FC = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [scheduledVisits, setScheduledVisits] = useState<ScheduledVisit[]>([]);  // eslint-disable-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(true);

  const fetchNotifications = React.useCallback(async () => {
    try {
      setLoading(true);
      const patientUid = auth.currentUser?.uid;
      console.log('🔍 Fetching notifications and scheduled visits for patient:', patientUid);
      
      if (!patientUid) {
        console.warn('⚠️ No patient UID found');
        setNotifications([]);
        setScheduledVisits([]);
        setLoading(false);
        return;
      }

      const allNotifications: Notification[] = [];

      // Fetch scheduled visits directly from health/visitSchedule/scheduled
      try {
        const visitsSnapshot = await db
          .collection('Patient')
          .doc(patientUid)
          .collection('health')
          .doc('visitSchedule')
          .collection('scheduled')
          .orderBy('visitDate', 'asc')
          .get();

        const visits: ScheduledVisit[] = [];
        visitsSnapshot.forEach((doc) => {
          const visitData = doc.data();
          console.log('📋 Raw visit data from Firestore:', {
            id: doc.id,
            doctorName: visitData.doctorName,
            visitDate: visitData.visitDate,
            visitTime: visitData.visitTime,
          });
          visits.push({
            id: doc.id,
            ...visitData,
          } as ScheduledVisit);
        });

        console.log('📅 Scheduled visits loaded:', visits.length);
        
        // Convert scheduled visits to notification format
        const visitNotifications: Notification[] = visits.map(visit => {
          const doctorDisplayName = visit.doctorName || 'Your doctor';
          console.log('🔄 Converting visit to notification:', {
            visitId: visit.id,
            doctorName: visit.doctorName,
            doctorDisplayName: doctorDisplayName,
          });
          return {
            id: `visit_${visit.id}`,
            type: 'visit_scheduled',
            title: 'Scheduled Visit',
            message: `DR. ${doctorDisplayName} has scheduled a visit on ${new Date(visit.visitDate).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })} at ${visit.visitTime}`,
            visitDate: visit.visitDate,
            visitTime: visit.visitTime,
            visitType: visit.visitType,
            createdAt: visit.scheduledAt,
            read: false,
          };
        });

        allNotifications.push(...visitNotifications);
        setScheduledVisits(visits);
      } catch (visitsErr) {
        console.error('⚠️ Error fetching scheduled visits:', visitsErr);
        setScheduledVisits([]);
      }

      // Fetch other notifications from notifications collection
      try {
        const notifSnapshot = await db
          .collection('Patient')
          .doc(patientUid)
          .collection('notifications')
          .orderBy('createdAt', 'desc')
          .get();

        const notifs: Notification[] = [];
        notifSnapshot.forEach((doc) => {
          const data = doc.data();
          // Skip visit_scheduled type notifications as they're handled separately from visitSchedule collection
          if (data.type !== 'visit_scheduled') {
            notifs.push({
              id: doc.id,
              ...data,
            } as Notification);
          }
        });

        console.log('✅ Notifications loaded:', notifs.length);
        allNotifications.push(...notifs);
      } catch (notifErr) {
        console.error('⚠️ Error fetching notifications:', notifErr);
      }

      // Sort all notifications by createdAt (visits first, then others)
      allNotifications.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA; // Newest first
      });

      setNotifications(allNotifications);
    } catch (err) {
      console.error('❌ Error in fetchNotifications:', err);
      setNotifications([]);
      setScheduledVisits([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Refresh notifications when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('📬 Notification screen focused, refreshing...');
      fetchNotifications();
    }, [fetchNotifications])
  );

  const markAsRead = async (notificationId: string) => {
    try {
      const patientUid = auth.currentUser?.uid;
      if (!patientUid) return;

      await db
        .collection('Patient')
        .doc(patientUid)
        .collection('notifications')
        .doc(notificationId)
        .update({ read: true });

      // Update local state
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (err) {
      console.error('❌ Error marking as read:', err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'visit_scheduled':
        return 'calendar-check';
      case 'medication':
        return 'pill';
      case 'message':
        return 'message-text';
      default:
        return 'bell';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'visit_scheduled':
        return '#7d4c9e';
      case 'medication':
        return '#4CAF50';
      case 'message':
        return '#2196F3';
      default:
        return '#999';
    }
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !item.read && styles.unreadNotification,
      ]}
      onPress={() => !item.read && markAsRead(item.id)}
    >
      <View
        style={[
          styles.notificationIcon,
          { backgroundColor: getNotificationColor(item.type) + '20' },
        ]}
      >
        <MaterialCommunityIcons
          name={getNotificationIcon(item.type)}
          size={24}
          color={getNotificationColor(item.type)}
        />
      </View>

      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationMessage}>{item.message}</Text>

        {item.visitDate && (
          <View style={styles.visitDetails}>
            <MaterialCommunityIcons name="calendar" size={14} color="#7d4c9e" />
            <Text style={styles.visitDetailsText}>
              {new Date(item.visitDate).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })} at {item.visitTime}
            </Text>
          </View>
        )}

        <Text style={styles.notificationTime}>
          {new Date(item.createdAt).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>

      {!item.read && <View style={styles.unreadIndicator} />}
    </TouchableOpacity>
  );

  const handleBack = () => {
    router.back();
  };

  const handleRefresh = () => {
    fetchNotifications();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
        >
          <Feather name="chevron-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Alerts</Text>
        <TouchableOpacity onPress={handleRefresh}>
          <MaterialCommunityIcons
            name="refresh"
            size={24}
            color="#7d4c9e"
          />
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7d4c9e" />
        </View>
      ) : notifications.length > 0 ? (
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.notificationsList}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="bell-off" size={64} color="#ddd" />
          <Text style={styles.emptyText}>No Alerts</Text>
          <Text style={styles.emptySubtext}>You&apos;re all caught up!</Text>
        </View>
      )}

      {/* Bottom Navigation */}
      <BottomNavigation activeTab="notification" />
    </SafeAreaView>
  );
};

export default NotificationScreen;