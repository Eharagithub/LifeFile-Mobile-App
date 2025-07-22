// styles.ts
import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },

  // Header Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: '#f8f9fa',
  },

  dateInfo: {
    flexDirection: 'column',
  },

  dateText: {
    fontSize: 14,
    color: '#8e8e93',
    marginBottom: 4,
    fontWeight: '400',
  },

  todayTitle: {
    fontSize: 32,
    fontWeight: '600',
    color: '#1c1c1e',
  },

  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },

  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e1e1e1',
    borderRadius: 20,
  },

  // Calendar Strip Styles
  calendarStrip: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 32,
    justifyContent: 'space-between',
  },

  calendarDay: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    minWidth: 48,
  },

  todayDay: {
    backgroundColor: '#1c1c1e',
  },

  dayName: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
    color: '#8e8e93',
  },

  todayDayName: {
    color: '#ffffff',
  },

  dayDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1c1e',
  },

  todayDayDate: {
    color: '#ffffff',
  },

  // Tasks Container Styles
  tasksContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },

  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  meetingItem: {
    backgroundColor: '#2c2c2e',
  },

  taskContent: {
    flex: 1,
  },

  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#1c1c1e',
  },

  meetingTitle: {
    color: '#ffffff',
  },

  taskSubtitle: {
    fontSize: 14,
    color: '#8e8e93',
    marginBottom: 12,
    lineHeight: 18,
  },

  meetingSubtitle: {
    color: '#a1a1a6',
  },

  attendeesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  attendeeAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 2,
    borderColor: '#ffffff',
  },

  attendeeCount: {
    fontSize: 12,
    color: '#8e8e93',
    marginLeft: 4,
    fontWeight: '500',
  },

  taskTimeContainer: {
    alignItems: 'flex-end',
  },

  taskTime: {
    fontSize: 14,
    color: '#8e8e93',
    fontWeight: '500',
  },

  meetingTime: {
    color: '#a1a1a6',
  },

  // Date Selector Styles
    dateSelector: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 20,
        paddingHorizontal: 10,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    dateList: {
        paddingHorizontal: 10,
    },

  dateItem: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    backgroundColor: '#F8F9FA',
  },
  selectedDateItem: {
    backgroundColor: '#6C7CE7',
  },

 
  selectedDateText: {
  color: '#FFFFFF',
  fontWeight: '600',
},
// Alerts Container
    alertsContainer: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    alertsList: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },

    // Alert Item Styles
    alertItem: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 15,
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    unreadAlert: {
        borderLeftWidth: 4,
        borderLeftColor: '#6C7CE7',
    },
    alertContent: {
        position: 'relative',
    },
    alertHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    typeIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    alertInfo: {
        flex: 1,
    },
    alertTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    alertDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 6,
        lineHeight: 20,
    },
    alertTime: {
        fontSize: 12,
        color: '#999',
        fontWeight: '500',
    },
    deleteButton: {
        padding: 5,
    },
    unreadIndicator: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#6C7CE7',
    },
    // Empty State Styles
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#F8F9FA',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
    },
    emptyDescription: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 30,
    },
    refreshButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#6C7CE7',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
    },
    refreshButtonText: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '600',
        marginLeft: 8,
    },

    // Bottom Navigation Styles
    bottomNavigation: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        paddingVertical: 10,
        paddingHorizontal: 20,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    navItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
    },
    activeNavItem: {
        // Active state styling handled by icon and text color
    },
    navText: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
        fontWeight: '500',
    },
    activeNavText: {
        color: '#6C7CE7',
        fontWeight: '600',
    },
}
);