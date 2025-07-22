import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './notification.styles';
import BottomNavigation from '@/app/common/BottomNavigation';

interface TaskItem {
  id: string;
  title: string;
  time: string;
  subtitle?: string;
  type: 'meeting' | 'task';
  avatars?: string[];
  date: string; // Format: 'YYYY-MM-DD'
}

interface CalendarDay {
  date: number;
  fullDate: string;
  dayName: string;
  isToday: boolean;
}

interface CalendarTaskUIProps {}

const CalendarTaskUI: React.FC<CalendarTaskUIProps> = () => {
  const currentDate = new Date();
  const [selectedDate, setSelectedDate] = useState<string>(
    currentDate.toISOString().split('T')[0]
  );

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Sample tasks for different dates
  const allTasks: TaskItem[] = [
    {
      id: '1',
      title: 'Meeting',
      time: '9:00 AM',
      subtitle: 'Discuss project roadmap for the new',
      type: 'meeting',
      avatars: ['👨‍💼', '👩‍💼', '👨‍💻'],
      date: '2024-11-13'
    },
    {
      id: '2',
      title: 'Icon set',
      time: '10:00 AM',
      subtitle: 'Design system icons',
      type: 'task',
      date: '2024-11-13'
    },
    {
      id: '3',
      title: 'Prototype',
      time: '2:00 PM',
      subtitle: 'Build interactive prototype',
      type: 'task',
      date: '2024-11-13'
    },
    {
      id: '4',
      title: 'Check asset',
      time: '4:00 PM',
      subtitle: 'Review and validate assets',
      type: 'task',
      date: '2024-11-13'
    },
    {
      id: '5',
      title: 'Team Standup',
      time: '10:00 AM',
      subtitle: 'Daily team sync meeting',
      type: 'meeting',
      avatars: ['👨‍💼', '👩‍💼'],
      date: '2024-11-14'
    },
    {
      id: '6',
      title: 'UI Review',
      time: '2:00 PM',
      subtitle: 'Review new interface designs',
      type: 'task',
      date: '2024-11-14'
    },
    {
      id: '7',
      title: 'Client Call',
      time: '11:00 AM',
      subtitle: 'Project status update call',
      type: 'meeting',
      avatars: ['👨‍💼'],
      date: '2024-11-15'
    }
  ];

  // Generate calendar days for current month
  const generateCalendarDays = (): CalendarDay[] => {
    const days: CalendarDay[] = [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Get days in current month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const fullDate = date.toISOString().split('T')[0];
      const dayName = dayNames[date.getDay()];
      const isToday = fullDate === currentDate.toISOString().split('T')[0];
      
      days.push({
        date: day,
        fullDate,
        dayName,
        isToday
      });
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();
  const tasksForSelectedDate = allTasks.filter(task => task.date === selectedDate);

  const renderCalendarDay = (day: CalendarDay) => {
    const isSelected = day.fullDate === selectedDate;
    const hasEvents = allTasks.some(task => task.date === day.fullDate);
    
    return (
      <TouchableOpacity
        key={day.fullDate}
        style={[
          styles.calendarDayContainer,
          isSelected && styles.selectedDayContainer
        ]}
        onPress={() => setSelectedDate(day.fullDate)}
      >
        <Text style={[
          styles.dayName,
          isSelected && styles.selectedDayName
        ]}>
          {day.dayName}
        </Text>
        <View style={[
          styles.dayNumberContainer,
          isSelected && styles.selectedDayNumber,
          day.isToday && !isSelected && styles.todayDayNumber
        ]}>
          <Text style={[
            styles.dayNumber,
            isSelected && styles.selectedDayNumberText,
            day.isToday && !isSelected && styles.todayDayNumberText
          ]}>
            {day.date}
          </Text>
        </View>
        {hasEvents && !isSelected && (
          <View style={styles.eventIndicator} />
        )}
      </TouchableOpacity>
    );
  };

  const renderTaskItem = (task: TaskItem) => (
    <TouchableOpacity key={task.id} style={styles.taskItem}>
      <View style={styles.taskHeader}>
        <Text style={styles.taskTitle}>{task.title}</Text>
        <Text style={styles.taskTime}>{task.time}</Text>
      </View>
      {task.subtitle && (
        <Text style={styles.taskSubtitle}>{task.subtitle}</Text>
      )}
      {task.type === 'meeting' && task.avatars && (
        <View style={styles.avatarContainer}>
          {task.avatars.map((avatar, index) => (
            <View key={index} style={styles.avatar}>
              <Text style={styles.avatarText}>{avatar}</Text>
            </View>
          ))}
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="add" size={16} color="#8B5CF6" />
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  const selectedDateObj = new Date(selectedDate);
  const formattedSelectedDate = `${monthNames[selectedDateObj.getMonth()]} ${selectedDateObj.getDate()}, ${selectedDateObj.getFullYear()}`;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.dateText}>
          {formattedSelectedDate}
        </Text>
        <Text style={styles.todayLabel}>Today</Text>
        <TouchableOpacity style={styles.profileButton}>
          <View style={styles.profileImage}>
            <Text style={styles.profileText}>👤</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Horizontal Calendar */}
        <View style={styles.calendarContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.calendarScrollContent}
          >
            {calendarDays.map(renderCalendarDay)}
          </ScrollView>
        </View>

        {/* Task List */}
        <View style={styles.taskList}>
          {tasksForSelectedDate.length > 0 ? (
            tasksForSelectedDate.map(renderTaskItem)
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No events for this date</Text>
            </View>
          )}
        </View>
      </ScrollView>

       {/* Bottom Navigation */}
      <BottomNavigation activeTab="notification" />
    </SafeAreaView>
  );
};

export default CalendarTaskUI;