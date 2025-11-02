import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  FlatList,
  Alert,
  Linking,
  RefreshControl,
  StatusBar
} from 'react-native';
import { FontAwesome, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import styles from '../patientProfile/patientHome.styles';
import BottomNavigation from '../common/BottomNavigation';
import { useRouter } from 'expo-router';
import { auth } from '../../config/firebaseConfig';
import AuthService from '../../services/authService';
import { getAllHealthNews } from '../../services/newsService';

// Add global type declaration for EventEmitter
declare global {
  var EventEmitter: any | undefined;
}

interface NewsItem {
  title: string;
  link: string;
  source?: string;
  date?: string;
  description?: string;
  imageUrl?: string;
  language?: string; // 'en', 'si', or other language codes
  category?: 'health' | 'lifestyle' | 'medical' | 'wellness' | 'nutrition' | 'fitness';
  priority?: 'high' | 'medium' | 'low'; // For urgent health alerts
  isLocal?: boolean; // Sri Lankan vs Global news
}

interface UserProfile {
  fullName: string;
  firstName: string;
  lastName: string;
  profilePicture: string;
}

interface NewsStats {
  totalNews: number;
  localNews: number;
  globalNews: number;
  lastUpdated: string;
}

export default function PatientHome() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile>({
    fullName: '',
    firstName: '',
    lastName: '',
    profilePicture: ''
  });
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newsStats, setNewsStats] = useState<NewsStats>({
    totalNews: 0,
    localNews: 0,
    globalNews: 0,
    lastUpdated: ''
  });

  // Health-related keywords for filtering (English and Sinhala)
  const healthKeywords = useMemo(() => [
    // English keywords
    'health', 'medical', 'hospital', 'doctor', 'medicine', 'disease', 'virus', 'covid', 'vaccine',
    'treatment', 'surgery', 'patient', 'clinic', 'pharmacy', 'wellness', 'fitness', 'nutrition',
    'diet', 'exercise', 'mental health', 'diabetes', 'cancer', 'heart', 'blood pressure',
    'cholesterol', 'obesity', 'epidemic', 'pandemic', 'symptom', 'diagnosis', 'therapy',
    'healthcare', 'medication', 'pharmaceutical', 'medical research', 'clinical trial',

    // Sinhala keywords (transliterated)
    'සෞඛ්‍ය', 'වෛද්‍ය', 'රෝහල', 'ඖෂධ', 'රෝග', 'ප්‍රතිකාර', 'ශල්‍යකර්ම', 'රෝගී', 'ක්ලිනික්',
    'ෆාමසි', 'සෞඛ්‍ය සේවා', 'මානසික සෞඛ්‍ය', 'දියවැඩියාව', 'පිළිකා', 'හෘද', 'රුධිර පීඩනය',
    'කොලෙස්ටරෝල්', 'තරබාරුකම', 'වසංගත', 'ලක්ෂණ', 'රෝග විනිශ්චය', 'චිකිත්සාව'
  ], []);

  // Categorize news based on content
  const categorizeNews = (title: string, description: string = ''): NewsItem['category'] => {
    const content = `${title} ${description}`.toLowerCase();

    if (content.includes('fitness') || content.includes('exercise') || content.includes('workout') ||
      content.includes('gym') || content.includes('sport')) {
      return 'fitness';
    }
    if (content.includes('nutrition') || content.includes('diet') || content.includes('food') ||
      content.includes('vitamin') || content.includes('mineral')) {
      return 'nutrition';
    }
    if (content.includes('wellness') || content.includes('mental') || content.includes('stress') ||
      content.includes('meditation') || content.includes('yoga')) {
      return 'wellness';
    }
    if (content.includes('lifestyle') || content.includes('living') || content.includes('habit')) {
      return 'lifestyle';
    }
    if (content.includes('medical') || content.includes('clinical') || content.includes('surgery') ||
      content.includes('treatment') || content.includes('doctor')) {
      return 'medical';
    }
    return 'health';
  };

  // Filter health-related news
  const filterHealthNews = useCallback((newsItems: NewsItem[]): NewsItem[] => {
    return newsItems.filter(item => {
      const content = `${item.title} ${item.description || ''}`.toLowerCase();
      return healthKeywords.some(keyword =>
        content.includes(keyword.toLowerCase()) ||
        item.title.toLowerCase().includes(keyword.toLowerCase())
      );
    })
      .map(item => ({
        ...item,
        category: categorizeNews(item.title, item.description),
        isLocal: isLocalSource(item.source || ''),
        priority: getPriority(item.title, item.description || '')
      }));
  }, [healthKeywords]);

  // Check if source is local (Sri Lankan)
  const isLocalSource = (source: string): boolean => {
    const localSources = ['esana', 'helakuru', 'ada derana', 'hiru', 'lanka news', 'ceylon today', 'daily mirror'];
    return localSources.some(localSource =>
      source.toLowerCase().includes(localSource.toLowerCase())
    );
  };

  // Get priority based on urgent health keywords
  const getPriority = (title: string, description: string): NewsItem['priority'] => {
    const content = `${title} ${description}`.toLowerCase();
    const urgentKeywords = ['outbreak', 'epidemic', 'pandemic', 'alert', 'warning', 'emergency', 'crisis'];
    const highPriorityKeywords = ['vaccine', 'treatment', 'breakthrough', 'study', 'research'];

    if (urgentKeywords.some(keyword => content.includes(keyword))) {
      return 'high';
    }
    if (highPriorityKeywords.some(keyword => content.includes(keyword))) {
      return 'medium';
    }
    return 'low';
  };

  // Enhanced news loading with health filtering
  const loadNews = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Loading health news...');

      // Get health-related news from the API
      const healthNews = await getAllHealthNews();
      console.log(`Raw news items received: ${healthNews.length}`);

      // Filter only health and lifestyle related news
      const filteredHealthNews = filterHealthNews(healthNews);
      console.log(`Health-filtered news items: ${filteredHealthNews.length}`);

      // Sort local news first, then by priority and date
      const sortedNews = filteredHealthNews.sort((a, b) => {
        // First prioritize local news - always show local news at the top
        if (a.isLocal && !b.isLocal) return -1;
        if (!a.isLocal && b.isLocal) return 1;

        // For news of the same locality (both local or both global), sort by priority
        const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
        const priorityDiff = (priorityOrder[b.priority || 'low'] - priorityOrder[a.priority || 'low']);

        if (priorityDiff !== 0) return priorityDiff;

        // Finally sort by date for news with the same locality and priority
        const dateA = new Date(a.date || '');
        const dateB = new Date(b.date || '');
        return dateB.getTime() - dateA.getTime();
      });

      setNews(sortedNews);

      // Update statistics
      const localCount = sortedNews.filter(item => item.isLocal).length;
      const globalCount = sortedNews.length - localCount;

      setNewsStats({
        totalNews: sortedNews.length,
        localNews: localCount,
        globalNews: globalCount,
        lastUpdated: new Date().toLocaleString()
      });

      console.log(`News loaded successfully: ${localCount} local, ${globalCount} global`);

    } catch (error) {
      console.error("Error loading health news:", error);
      Alert.alert(
        "Error Loading Health News",
        "Unable to fetch the latest health news alerts. Please check your internet connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }, [filterHealthNews]);

  // Enhanced refresh with better user feedback
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadNews();
    } catch (error) {
      console.error("Error refreshing health news:", error);
      Alert.alert(
        "Error Refreshing",
        "Unable to refresh health news alerts. Please try again later."
      );
    } finally {
      setRefreshing(false);
    }
  };

  // Load news on component mount
  useEffect(() => {
    loadNews();
  }, [loadNews]);

  // Navigation handlers
  const handleViewHistory = () => {
    router.push('./viewHistory/viewhistory');
  };

  const handleMedications = () => {
    router.push('./activemedications');
  };

  const handleLabResults = () => {
    router.push('./labReports/labresults ');
  };

  // Fetch user profile data: listen for auth state and load patient name when available
  useEffect(() => {
    let mounted = true;

    const loadProfileForUid = async (uid: string) => {
      try {
        console.debug('[patientHome] loadProfileForUid uid=', uid);
        const roles = await AuthService.determineRoles(uid);
        console.debug('[patientHome] determineRoles =>', roles);
        if (roles.error === 'permission-denied') {
          console.warn('Permission denied when checking roles for uid=', uid);
          return;
        }

        const roleToUse: 'patient' | 'doctor' | null = roles.isPatient ? 'patient' : roles.isDoctor ? 'doctor' : null;
        if (!roleToUse) return;

        const res = await AuthService.getUserData(uid, roleToUse);
        console.debug('[patientHome] getUserData result:', res);
        if (res.success && res.data) {
          const data = res.data as any;
          const personal = data.personal || {} as any;
          // fallback chain for fullName: personal.fullName -> data.fullName -> auth.displayName -> email local-part
          let fullName = personal.fullName || data.fullName || '';
          if (!fullName && auth.currentUser?.displayName) fullName = auth.currentUser.displayName;
          if (!fullName && data.email) fullName = (data.email.split('@')[0] || '');
          const firstName = fullName.trim().split(' ')[0] || '';
          if (mounted) {
            setUserProfile(prev => ({ ...prev, fullName, firstName, profilePicture: personal.profilePicture || data.profilePicture || '' }));
          }
        } else {
          console.warn('getUserData failed for uid=', uid, res.error);
        }
      } catch (err) {
        console.error('Error loading user profile for uid=', uid, err);
      }
    };

    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user && user.uid) {
        loadProfileForUid(user.uid);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [router]);

  // Enhanced news item renderer with priority indicators
  const renderNewsItem = ({ item }: { item: NewsItem }) => (
    <TouchableOpacity
      style={[styles.articleItem]}
      onPress={() => Linking.openURL(item.link)}
    >
      <Image
        source={item.imageUrl ? { uri: item.imageUrl } : require('../../assets/images/who.jpg')}
        style={styles.articleImage}
        resizeMode="cover"
      />

      <View style={styles.articleContent}>
        <View style={styles.articleHeader}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category?.toUpperCase()}</Text>
          </View>
          {item.isLocal && (
            <View style={styles.localBadge}>
              <Text style={styles.localText}>🇱🇰 LOCAL</Text>
            </View>
          )}
        </View>

        <Text style={styles.articleTitle} numberOfLines={2}>{item.title}</Text>

        {item.description && (
          <Text style={styles.articleDescription} numberOfLines={2}>{item.description}</Text>
        )}

        <View style={styles.articleMetaContainer}>
          <View style={styles.articleMetaLeft}>
            <Text style={styles.articleMeta}>
              {item.source ? `${item.source}` : ''}
              {item.source && item.date ? ' • ' : ''}
              {item.date ? new Date(item.date).toLocaleDateString() : ''}
            </Text>
          </View>
          {item.language && (
            <View style={styles.languageTag}>
              <Text style={styles.languageTagText}>
                {item.language === 'si' ? 'සිං' : 'ENG'}
              </Text>
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity style={styles.bookmarkButton}>
        <FontAwesome name="bookmark-o" size={18} color="#888" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          {userProfile.profilePicture ? (
            <Image
              source={{ uri: userProfile.profilePicture }}
              style={styles.profileImage}
              defaultSource={require('../../assets/images/profile.jpg')}
            />
          ) : (
            <Image
              source={require('../../assets/images/profile.jpg')}
              style={styles.profileImage}
            />
          )}
          <View style={styles.welcomeText}>
            <Text style={styles.welcomeTitle}>Welcome!</Text>
            <Text style={styles.userName}>{userProfile.firstName || 'User'}</Text>
            <Text style={styles.welcomeSubtitle}>Stay updated with your health</Text>
          </View>
        </View>
      </View>


      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleViewHistory}
        >
          <View style={styles.actionIconContainer}>
            <FontAwesome name="stethoscope" size={22} color="#fff" />
          </View>
          <Text style={styles.actionText}>Health Timeline</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleMedications}
        >
          <View style={styles.actionIconContainer}>
            <MaterialCommunityIcons name="pill" size={24} color="#fff" />
          </View>
          <Text style={styles.actionText}>Active Medications</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleLabResults}
        >
          <View style={styles.actionIconContainer}>
            <FontAwesome name="file-text-o" size={22} color="#fff" />
          </View>
          <Text style={styles.actionText}>Lab Results</Text>
        </TouchableOpacity>
      </View>




      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Health News Alerts</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.refreshIconButton} onPress={onRefresh}>
            <Ionicons name="refresh" size={20} color="#874691" />
          </TouchableOpacity>
        </View>
      </View>


      {/* Last Updated Info */}
      <View style={styles.lastUpdatedContainer}>
        <Ionicons name="time" size={16} color="#666" />
        <Text style={styles.lastUpdatedText}>
          Last updated: {newsStats.lastUpdated}
        </Text>
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#874691']}
            title="Refreshing health news..."
          />
        }
      >

        {/* Health News Section*/}
        <View style={styles.articlesSection}>

          {/* News List*/}
          {loading ? (

            <View style={styles.noNewsContainer}>
              <Ionicons name="newspaper-outline" size={64} color="#ccc" />
              <Text style={styles.noNewsText}>
                Await to see health news alerts
              </Text>

              <TouchableOpacity
                style={styles.refreshButton}
                onPress={onRefresh}
              >
                <Ionicons name="refresh" size={20} color="#fff" />
                <Text style={styles.refreshButtonText}>Refresh field</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={news}
              renderItem={renderNewsItem}
              keyExtractor={(item, index) => `${item.link}-${index}`}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab="home" />
    </SafeAreaView>
  );
}