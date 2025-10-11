# LifeFile Mobile App - Frontend Implementation Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Key Components](#key-components)
5. [Authentication Flow](#authentication-flow)
6. [Navigation System](#navigation-system)
7. [State Management](#state-management)
8. [UI/UX Components](#uiux-components)
9. [Integration Points](#integration-points)
10. [Setup and Installation](#setup-and-installation)

## Project Overview
LifeFile Mobile App is a healthcare management application built using React Native and Expo. The app provides features for patient profile management, health tracking, medical records management, and communication with healthcare providers.

## Technology Stack
- **Framework:** React Native with Expo
- **Navigation:** Expo Router
- **UI Components:** Custom components + React Native built-in components
- **Authentication:** Firebase Authentication
- **Data Storage:** Firebase Firestore
- **File Storage:** Firebase Storage
- **State Management:** React Context + Local State
- **Type System:** TypeScript
- **Styling:** StyleSheet API + Themed Components

## Project Structure

### Detailed Directory Structure
```
Frontend/
├── app/                              # Main application screens and navigation
│   ├── _layout.tsx                   # Root layout configuration
│   ├── index.tsx                     # Entry point
│   ├── auth/                         # Authentication related screens
│   │   ├── login.tsx                # Main login screen
│   │   ├── login.styles.ts          # Login screen styles
│   │   └── patientAuth/             # Patient-specific authentication
│   │       └── [other auth files]
│   ├── common/                       # Shared components and layouts
│   │   ├── AgentView.ts             # Agent view components
│   │   ├── BottomNavigation.tsx     # Bottom tab navigation
│   │   ├── landingpage.tsx          # Landing page component
│   │   ├── sideNavigation.tsx       # Side drawer navigation
│   │   ├── welcomeScreen.tsx        # Welcome screen
│   │   └── welcomeScreen.styles.ts  # Welcome screen styles
│   └── patientProfile/              # Patient profile management
│       ├── more/                    # Additional profile features
│       ├── labReports/             # Lab reports section
│       ├── viewHistory/            # Medical history view
│       ├── activemedications.tsx   # Active medications screen
│       ├── notification.tsx        # Notifications component
│       ├── patientHome.tsx        # Patient dashboard
│       ├── statistics.tsx         # Health statistics
│       └── updateProfile.tsx      # Profile update screen
├── assets/                        # Static assets
│   ├── fonts/                    # Custom fonts
│   │   └── SpaceMono-Regular.ttf
│   └── images/                   # Image assets
│       ├── adaptive-icon.png
│       ├── bandage.png
│       ├── logo.png
│       └── [other images]
├── components/                    # Reusable UI components
│   ├── ui/                       # UI element components
│   ├── Collapsible.tsx          # Collapsible component
│   ├── ExternalLink.tsx         # External link handler
│   ├── HapticTab.tsx           # Haptic feedback tab
│   ├── HelloWave.tsx           # Animation component
│   ├── LayoutReset.tsx         # Layout reset utility
│   ├── ParallaxScrollView.tsx  # Parallax scroll effect
│   ├── SafeAreaWrapper.tsx     # Safe area handler
│   ├── ScreenContainer.tsx     # Screen container wrapper
│   ├── ScreenLayout.tsx        # Screen layout component
│   ├── ThemedText.tsx         # Themed text component
│   └── ThemedView.tsx         # Themed view component
├── config/                     # Configuration files
│   ├── firebaseConfig.tsx     # Firebase configuration
│   └── initialize.ts          # App initialization
├── constants/                 # Global constants
│   └── Colors.ts             # Theme colors
├── hooks/                    # Custom React hooks
│   ├── useColorScheme.ts    # Theme hook
│   ├── useDimensions.ts     # Screen dimensions hook
│   └── useThemeColor.ts     # Theme color hook
├── services/                # API and backend services
│   ├── authService.tsx     # Authentication service
│   └── newsService.ts      # News feed service
├── utils/                  # Utility functions
│   └── rssUrlVerifier.ts  # RSS feed validator
└── docs/                  # Documentation
    ├── CrossPlatformLayoutGuide.md
    └── LayoutBestPractices.md
```

## Key Components

### Core Components
1. **SafeAreaWrapper** (`components/SafeAreaWrapper.tsx`)
   - Handles safe area insets for different devices
   - Provides consistent layout across devices

2. **ThemedComponents** (`components/ThemedView.tsx`, `ThemedText.tsx`)
   - Implements app-wide theming system
   - Supports light/dark mode

3. **ScreenLayout** (`components/ScreenLayout.tsx`)
   - Base layout for screens
   - Handles common screen patterns

### Navigation Components
1. **BottomNavigation** (`app/common/BottomNavigation.tsx`)
   - Main app navigation
   - Tab-based navigation structure

2. **SideNavigation** (`app/common/sideNavigation.tsx`)
   - Additional navigation options
   - Drawer navigation implementation

## Authentication Flow

### Components and Screens
1. **Login Screen** (`app/auth/login.tsx`)
   - Email/Password authentication
   - Social login options
   - Form validation

2. **Patient Authentication** (`app/auth/patientAuth/`)
   - Patient-specific authentication flow
   - Profile verification

### Implementation Steps
1. User enters credentials
2. Firebase Authentication validates
3. On success:
   - User profile is created/fetched
   - Navigation to main app
4. On failure:
   - Error handling
   - User feedback

## Navigation System

### Expo Router Implementation
- File-based routing system
- Dynamic route parameters
- Deep linking support

### Navigation Structure
```
app/
├── (tabs)/               # Tab-based navigation
├── (stack)/             # Stack navigation
└── (modal)/             # Modal screens
```

## State Management

### Authentication State
- Managed through Firebase Auth
- Context provider for app-wide access
- Persistence handling

### User Data State
- Firestore integration
- Real-time updates
- Caching strategy

## UI/UX Components

### Design System
1. **Colors** (`constants/Colors.ts`)
   - Brand colors
   - Semantic colors
   - Theme variations

2. **Typography**
   - Consistent text styles
   - Responsive sizing

3. **Layout Components**
   - Flex-based layouts
   - Grid systems
   - Spacing utilities

### Common UI Patterns
1. **Forms**
   - Input validation
   - Error handling
   - Submit handling

2. **Lists and Grids**
   - Data presentation
   - Pagination
   - Pull-to-refresh

## External Integrations and APIs

### Firebase Integration
1. **Authentication** (Firebase Auth)
   ```typescript
   import { auth } from '../config/firebaseConfig';
   ```
   - Email/Password authentication
   - Google Sign-In
   - Apple Sign-In
   - Phone number verification
   - Auth state persistence
   - Security rules implementation

2. **Firestore Database**
   ```typescript
   import { db } from '../config/firebaseConfig';
   ```
   - User profiles
   - Medical records
   - Appointment scheduling
   - Real-time updates
   - Offline data persistence
   - Data validation rules

3. **Cloud Storage**
   ```typescript
   import { storage } from '../config/firebaseConfig';
   ```

### API Integration
- RESTful endpoints
- GraphQL integration (if applicable)
- Error handling patterns

## Setup and Installation

### Prerequisites
- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation Steps
1. Clone the repository
   ```bash
   git clone https://github.com/Eharagithub/LifeFile-Mobile-App.git
   ```

2. Install dependencies
   ```bash
   cd Frontend
   npm install
   ```

3. Configure environment variables
   - Create `.env` file
   - Add Firebase configuration

4. Start the development server
   ```bash
   npx expo start
   ```

### Development Workflow
1. Feature branches
2. TypeScript validation
3. ESLint compliance
4. Testing procedures
5. Build and deployment

## Best Practices

### Code Organization
- Feature-based folder structure
- Consistent naming conventions
- Component documentation

### Performance Optimization
- Lazy loading
- Memory management
- Image optimization
- Cache management

### Security Considerations
- Authentication checks
- Data validation
- Secure storage
- API security

## Troubleshooting

### Common Issues
1. Build errors
2. Navigation issues
3. State management problems
4. Firebase integration issues

### Debug Tools
- React Native Debugger
- Firebase Console
- Chrome DevTools
- Expo Developer Tools

## Future Enhancements
1. Offline support
2. Push notifications
3. Real-time updates
4. Enhanced security features
5. Performance optimizations

## Contributing
Please refer to the contribution guidelines in the root README.md file for information on how to contribute to this project.

## Support
For support and questions:
1. Check existing documentation
2. Review issues on GitHub
3. Contact the development team