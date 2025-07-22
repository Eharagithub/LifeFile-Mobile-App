import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  dateText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  todayLabel: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileText: {
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  
  // Horizontal Calendar Styles
  calendarContainer: {
    marginBottom: 20,
  },
  calendarScrollContent: {
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  calendarDayContainer: {
    alignItems: 'center',
    marginHorizontal: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    minWidth: 60,
  },
  selectedDayContainer: {
    backgroundColor: '#8B5CF6',
  },
  dayName: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 8,
  },
  selectedDayName: {
    color: '#FFFFFF',
  },
  dayNumberContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  selectedDayNumber: {
    backgroundColor: '#FFFFFF',
  },
  todayDayNumber: {
    backgroundColor: '#E2E8F0',
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  selectedDayNumberText: {
    color: '#8B5CF6',
  },
  todayDayNumberText: {
    color: '#8B5CF6',
  },
  eventIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8B5CF6',
    marginTop: 2,
  },
  
  // Task List Styles
  taskList: {
    gap: 12,
  },
  taskItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  taskTime: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  taskSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
    lineHeight: 20,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarText: {
    fontSize: 14,
  },
  moreButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  
  // Empty State
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  
  // Bottom Navigation
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  navItem: {
    padding: 12,
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});