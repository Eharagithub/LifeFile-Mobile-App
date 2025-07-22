// App.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { styles } from './healthtips.styles';
import BottomNavigation from '@/app/common/BottomNavigation';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface TaskItem {
//   id: string;
//   title: string;
//   subtitle: string;
//   time: string;
//   type: 'meeting' | 'task';
//   attendees?: string[];
id: string;
  title: string;
  description: string;
  time: string;
  date: string;
  type: 'reminder' | 'appointment' | 'medication' | 'general';
  priority: 'low' | 'medium' | 'high';
  read: boolean;
}

interface CalendarDay {
  date: number;
  isToday: boolean;
  dayName: string;
}

const NotificationScreen: React.FC = () => {
  const [alerts, setAlerts] = useState<TaskItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('2024-01-23');
  const [selectedMonth, setSelectedMonth] = useState<number>(1); // 1-12
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const calendarDays: CalendarDay[] = [
    { date: 13, isToday: false, dayName: 'Sat' },
    { date: 14, isToday: false, dayName: 'Sun' },
    { date: 15, isToday: true, dayName: 'Mon' },
    { date: 16, isToday: false, dayName: 'Tue' },
    { date: 17, isToday: false, dayName: 'Wed' },
  ];

   const handleBack = () => {
    router.back();
  };

  const tasks: TaskItem[] = [
    {
      id: '1',
      title: 'Doctor Appointment',
      description: 'Cardiology checkup at City Hospital',
      time: '10:30 AM',
      date: '2024-01-23',
      type: 'appointment',
      priority: 'high',
      read: false,
    },
    {
      id: '2',
      title: 'Medication Reminder',
      description: 'Take blood pressure medication',
      time: '2:00 PM',
      date: '2024-01-23',
      type: 'medication',
      priority: 'medium',
      read: false,
    },
    {
      id: '3',
      title: 'Exercise Session',
      description: 'Morning workout routine',
      time: '6:00 AM',
      date: '2024-01-24',
      type: 'reminder',
      priority: 'low',
      read: true,
    },
    {
      id: '4',
      title: 'Check asset',
      description: '',
      time: '5:00 PM',
      date: '2024-01-25',
      type: 'general',
      priority: 'low',
      read: false,
    }
  ];

  // Define mockAlerts for use in loadAlerts
  const mockAlerts: TaskItem[] = [
    {
      id: '1',
      title: 'Doctor Appointment',
      description: 'Cardiology checkup at City Hospital',
      time: '10:30 AM',
      date: '2024-01-23',
      type: 'appointment',
      priority: 'high',
      read: false,
    },
    {
      id: '2',
      title: 'Medication Reminder',
      description: 'Take blood pressure medication',
      time: '2:00 PM',
      date: '2024-01-23',
      type: 'medication',
      priority: 'medium',
      read: false,
    },
    {
      id: '3',
      title: 'Exercise Session',
      description: 'Morning workout routine',
      time: '6:00 AM',
      date: '2024-01-24',
      type: 'reminder',
      priority: 'low',
      read: true,
    },
    {
      id: '4',
      title: 'General Alert',
      description: 'Check asset',
      time: '5:00 PM',
      date: '2024-01-25',
      type: 'general',
      priority: 'low',
      read: false,
    }
  ];
   useEffect(() => {
      loadAlerts();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
  
    const loadAlerts = () => {
      // Simulate API call
      setTimeout(() => {
        setAlerts(mockAlerts);
        setRefreshing(false);
      }, 1000);
    };
  
    const onRefresh = () => {
      setRefreshing(true);
      loadAlerts();
    };

  const renderCalendarDay = (day: CalendarDay, index: number) => (
    <TouchableOpacity
      key={index}
      style={[styles.calendarDay, day.isToday && styles.todayDay]}
    >
      <Text style={[styles.dayName, day.isToday && styles.todayDayName]}>
        {day.dayName}
      </Text>
      <Text style={[styles.dayDate, day.isToday && styles.todayDayDate]}>
        {day.date}
      </Text>
    </TouchableOpacity>
  );

   // Generate all days for the selected month/year for the picker
  const getMonthDates = (year: number, month: number) => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const datesArr: string[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const mm = String(month).padStart(2, '0');
      const dd = String(day).padStart(2, '0');
      datesArr.push(`${year}-${mm}-${dd}`);
    }
    return datesArr;
  };
  const dates = getMonthDates(selectedYear, selectedMonth);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return 'calendar-outline';
      case 'medication':
        return 'medical-outline';
      case 'reminder':
        return 'alarm-outline';
      default:
        return 'notifications-outline';
    }
  };

   const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#FF6B6B';
      case 'medium':
        return '#FFB800';
      case 'low':
        return '#4ECDC4';
      default:
        return '#6C7CE7';
    }
  };

  const markAsRead = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, read: true } : alert
    ));
  };

  const deleteAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };
 const renderDateItem = ({ item }: { item: string }) => {
     // Show only day part in the UI
     const day = item.split('-')[2];
     return (
       <TouchableOpacity
         style={[
           styles.dateItem as import('react-native').ViewStyle,
           item === selectedDate ? (styles.selectedDateItem as import('react-native').ViewStyle) : undefined
         ]}
         onPress={() => setSelectedDate(item)}
       >
         <Text style={[
           styles.dateText as import('react-native').TextStyle,
           item === selectedDate ? (styles.selectedDateText as import('react-native').TextStyle) : undefined
         ]}>
           {day}
         </Text>
       </TouchableOpacity>
     );
   };
 
   const renderAlertItem = ({ item }: { item: TaskItem }) => (
     <TouchableOpacity
       style={[
         styles.alertItem as import('react-native').ViewStyle,
         !item.read ? (styles.unreadAlert as import('react-native').ViewStyle) : undefined
       ]}
       onPress={() => markAsRead(item.id)}
     >
       <View style={styles.alertContent as import('react-native').ViewStyle}>
         <View style={styles.alertHeader as import('react-native').ViewStyle}>
           <View style={[
             styles.typeIcon as import('react-native').ViewStyle,
             { backgroundColor: getPriorityColor(item.priority) + '20' }
           ]}>
             <Ionicons 
               name={getTypeIcon(item.type) as any} 
               size={20} 
               color={getPriorityColor(item.priority)} 
             />
           </View>
           <View style={styles.alertInfo as import('react-native').ViewStyle}>
             <Text style={styles.alertTitle as import('react-native').TextStyle}>{item.title}</Text>
             <Text style={styles.alertDescription as import('react-native').TextStyle}>{item.description}</Text>
             <Text style={styles.alertTime as import('react-native').TextStyle}>{item.time}</Text>
           </View>
           <TouchableOpacity
             style={styles.deleteButton as import('react-native').ViewStyle}
             onPress={() => deleteAlert(item.id)}
           >
             <Ionicons name="close" size={20} color="#999" />
           </TouchableOpacity>
         </View>
         {!item.read && <View style={styles.unreadIndicator as import('react-native').ViewStyle} />}
       </View>
     </TouchableOpacity>
   );
 
   const renderEmptyState = () => (
     <View style={styles.emptyState as import('react-native').ViewStyle}>
       <View style={styles.emptyIconContainer as import('react-native').ViewStyle}>
         <Ionicons name="notifications-off-outline" size={80} color="#E0E0E0" />
       </View>
       <Text style={styles.emptyTitle as import('react-native').TextStyle}>No alerts</Text>
       <Text style={styles.emptyDescription as import('react-native').TextStyle}>
         You&apos;re all caught up! New alerts will appear here.
       </Text>
       <TouchableOpacity style={styles.refreshButton as import('react-native').ViewStyle} onPress={onRefresh}>
         <Ionicons name="refresh" size={20} color="#6C7CE7" />
         <Text style={styles.refreshButtonText as import('react-native').TextStyle}>Refresh</Text>
       </TouchableOpacity>
     </View>
   );
 
   // Filter alerts by selected date
   const filteredAlerts = alerts.filter(alert => alert.date === selectedDate);
 
   // Month navigation handlers
   const handlePrevMonth = () => {
     if (selectedMonth === 1) {
       setSelectedMonth(12);
       setSelectedYear(selectedYear - 1);
     } else {
       setSelectedMonth(selectedMonth - 1);
     }
     // Set selectedDate to first day of new month
     setSelectedDate(`${selectedYear}-${String(selectedMonth === 1 ? 12 : selectedMonth - 1).padStart(2, '0')}-01`);
   };
   const handleNextMonth = () => {
     if (selectedMonth === 12) {
       setSelectedMonth(1);
       setSelectedYear(selectedYear + 1);
     } else {
       setSelectedMonth(selectedMonth + 1);
     }
     // Set selectedDate to first day of new month
     setSelectedDate(`${selectedYear}-${String(selectedMonth === 12 ? 1 : selectedMonth + 1).padStart(2, '0')}-01`);
   };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.dateInfo}>
          <Text style={styles.dateText}>November 15, 2021</Text>
          <Text style={styles.todayTitle}>Today</Text>
        </View>
        <View style={styles.profileAvatar}>
          <View style={styles.avatarPlaceholder} />
        </View>
      </View>

      {/* Calendar Strip - replaced with horizontal date picker */}
      <View style={styles.dateSelector as import('react-native').ViewStyle}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <TouchableOpacity onPress={handlePrevMonth} style={{ padding: 8 }}>
            <Feather name="chevron-left" size={20} color="#6C7CE7" />
          </TouchableOpacity>
          <Text style={{ fontWeight: '600', fontSize: 16, color: '#6C7CE7', marginHorizontal: 8 }}>
            {`${selectedYear} - ${selectedMonth.toString().padStart(2, '0')}`}
          </Text>
          <TouchableOpacity onPress={handleNextMonth} style={{ padding: 8 }}>
            <Feather name="chevron-right" size={20} color="#6C7CE7" />
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateList}>
          {dates.map(date => (
            <TouchableOpacity
              key={date}
              style={[
                styles.dateItem as import('react-native').ViewStyle,
                date === selectedDate ? (styles.selectedDateItem as import('react-native').ViewStyle) : undefined
              ]}
              onPress={() => setSelectedDate(date)}
            >
              <Text style={[
                styles.dateText as import('react-native').TextStyle,
                date === selectedDate ? (styles.selectedDateText as import('react-native').TextStyle) : undefined
              ]}>
                {date.split('-')[2]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Alerts List */}
      <View style={styles.alertsContainer as import('react-native').ViewStyle}>
        {filteredAlerts.length > 0 ? (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.alertsList}>
            {filteredAlerts.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.alertItem as import('react-native').ViewStyle,
                  !item.read ? (styles.unreadAlert as import('react-native').ViewStyle) : undefined
                ]}
                onPress={() => markAsRead(item.id)}
              >
                <View style={styles.alertContent as import('react-native').ViewStyle}>
                  <View style={styles.alertHeader as import('react-native').ViewStyle}>
                    <View style={[
                      styles.typeIcon as import('react-native').ViewStyle,
                      { backgroundColor: getPriorityColor(item.priority) + '20' }
                    ]}>
                      <Ionicons 
                        name={getTypeIcon(item.type) as any} 
                        size={20} 
                        color={getPriorityColor(item.priority)} 
                      />
                    </View>
                    <View style={styles.alertInfo as import('react-native').ViewStyle}>
                      <Text style={styles.alertTitle as import('react-native').TextStyle}>{item.title}</Text>
                      <Text style={styles.alertDescription as import('react-native').TextStyle}>{item.description}</Text>
                      <Text style={styles.alertTime as import('react-native').TextStyle}>{item.time}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteButton as import('react-native').ViewStyle}
                      onPress={() => deleteAlert(item.id)}
                    >
                      <Ionicons name="close" size={20} color="#999" />
                    </TouchableOpacity>
                  </View>
                  {!item.read && <View style={styles.unreadIndicator as import('react-native').ViewStyle} />}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyState as import('react-native').ViewStyle}>
            <View style={styles.emptyIconContainer as import('react-native').ViewStyle}>
              <Ionicons name="notifications-off-outline" size={80} color="#E0E0E0" />
            </View>
            <Text style={styles.emptyTitle as import('react-native').TextStyle}>No alerts</Text>
            <Text style={styles.emptyDescription as import('react-native').TextStyle}>
              You&apos;re all caught up! New alerts will appear here.
            </Text>
            <TouchableOpacity style={styles.refreshButton as import('react-native').ViewStyle} onPress={onRefresh}>
              <Ionicons name="refresh" size={20} color="#6C7CE7" />
              <Text style={styles.refreshButtonText as import('react-native').TextStyle}>Refresh</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
 {/* Bottom Navigation */}
          <BottomNavigation activeTab="notification" />
    </SafeAreaView>
  );
};

export default NotificationScreen;