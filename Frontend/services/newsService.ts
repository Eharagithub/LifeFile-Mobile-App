import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NewsItem {
  title: string;
  link: string;
  source?: string;
  date?: string;
  description?: string;
  imageUrl?: string;
  language?: string;
  category?: 'health' | 'lifestyle' | 'medical' | 'wellness' | 'nutrition' | 'fitness';
  priority?: 'high' | 'medium' | 'low';
  isLocal?: boolean;
  sourceType?: 'rss' | 'api' | 'scrape';
}

interface NewsSource {
  name: string;
  url: string;
  language: 'en' | 'si';
  type: 'local' | 'global';
  apiKey?: string;
  rssUrl?: string;
  enabled: boolean;
}

// Enhanced configuration for all news sources
const NEWS_SOURCES: NewsSource[] = [
  // Sri Lankan Local Sources
  {
    name: 'Ada Derana',
    url: 'https://adaderana.lk',
    rssUrl: 'https://www.adaderana.lk/rss.php',
    language: 'en',
    type: 'local',
    enabled: true
  },
  {
    name: 'Daily Mirror',
    url: 'https://dailymirror.lk',
    rssUrl: 'https://www.dailymirror.lk/rss',
    language: 'en',
    type: 'local',
    enabled: true
  },
  {
    name: 'Ceylon Today',
    url: 'https://ceylontoday.lk',
    rssUrl: 'https://www.ceylontoday.lk/rss',
    language: 'en',
    type: 'local',
    enabled: true
  },
  {
    name: 'Daily News',
    url: 'https://dailynews.lk',
    rssUrl: 'https://www.dailynews.lk/rss',
    language: 'en',
    type: 'local',
    enabled: true
  },
  {
    name: 'Daily FT',
    url: 'https://ft.lk',
    rssUrl: 'https://www.ft.lk/rss',
    language: 'en',
    type: 'local',
    enabled: true
  },

  {
    name: 'Lankadeepa',
    url: 'https://lankadeepa.lk',
    rssUrl: 'https://www.lankadeepa.lk/rss',
    language: 'si',
    type: 'local',
    enabled: true
  },
  {
    name: 'Divaina',
    url: 'https://divaina.com',
    rssUrl: 'https://divaina.lk/feed/',
    language: 'si',
    type: 'local',
    enabled: true
  },
  // Global Sources
  {
    name: 'BBC Health',
    url: 'https://bbc.com/health',
    rssUrl: 'https://feeds.bbci.co.uk/news/health/rss.xml',
    language: 'en',
    type: 'global',
    enabled: true
  },
  {
    name: 'Medical News Today',
    url: 'https://medicalnewstoday.com',
    rssUrl: 'https://www.medicalnewstoday.com/news-sitemap.xml',
    language: 'en',
    type: 'global',
    enabled: false  // Disabled Medical News Today alerts
  },
  {
    name: 'Healthline',
    url: 'https://healthline.com',
    rssUrl: 'https://www.healthline.com/rss/health-news',
    language: 'en',
    type: 'global',
    enabled: true
  },
  // {
  //   name: 'WebMD',
  //   url: 'https://webmd.com',
  //   rssUrl: 'https://www.webmd.com/rss/rss.aspx?RSSSource=RSS_PUBLIC',
  //   language: 'en',
  //   type: 'global',
  //   enabled: true
  // },
  {
    name: 'CNN Health',
    url: 'https://cnn.com/health',
    rssUrl: undefined,
    language: 'en',
    type: 'global',
    enabled: true
  },
  {
    name: 'Reuters Health',
    url: 'https://reuters.com/health',
    rssUrl: undefined,
    language: 'en',
    type: 'global',
    enabled: true
  },
  {
    name: 'WHO News',
    url: 'https://who.int/news',
    rssUrl: 'https://www.who.int/rss-feeds/news-english.xml',
    language: 'en',
    type: 'global',
    enabled: true
  }
];

// Enhanced health-related keywords
const HEALTH_KEYWORDS = {
  english: [
    'health', 'medical', 'hospital', 'doctor', 'medicine', 'disease', 'virus', 'covid',
    'vaccine', 'vaccination', 'treatment', 'surgery', 'patient', 'clinic', 'pharmacy', 
    'wellness', 'fitness', 'nutrition', 'diet', 'exercise', 'mental health', 'diabetes', 
    'cancer', 'heart', 'cardiac', 'blood pressure', 'cholesterol', 'obesity', 'epidemic', 
    'pandemic', 'symptom', 'diagnosis', 'therapy', 'healthcare', 'medication', 'pharmaceutical',
    'medical research', 'clinical trial', 'prevention', 'immune', 'immunity', 'allergy', 
    'infection', 'rehabilitation', 'emergency', 'ambulance', 'first aid', 'health tips',
    'lifestyle', 'healthy living', 'sleep', 'stress', 'anxiety', 'depression', 'mindfulness',
    'yoga', 'meditation', 'supplements', 'vitamins', 'pregnancy', 'childcare', 'elderly care',
    'skin care', 'dental', 'vision', 'hearing', 'bone health', 'joint', 'arthritis',
    'respiratory', 'lung', 'breathing', 'asthma', 'allergies', 'food safety', 'hygiene'
  ],
  sinhala: [
    'සෞඛ්‍ය', 'වෛද්‍ය', 'රෝහල', 'ඖෂධ', 'රෝග', 'ප්‍රතිකාර', 'ශල්‍යකර්ම', 'රෝගී',
    'ක්ලිනික්', 'ෆාමසි', 'සෞඛ්‍ය සේවා', 'මානසික සෞඛ්‍ය', 'දියවැඩියාව', 'පිළිකා',
    'හෘද', 'රුධිර පීඩනය', 'කොලෙස්ටරෝල්', 'තරබාරුකම', 'වසංගත', 'ලක්ෂණ',
    'රෝග විනිශ්චය', 'චිකිත්සාව', 'පළමු ප්‍රතිකාර', 'ආරක්ෂණ', 'ප්‍රතිශක්තිකරණ',
    'ආසාදන', 'සෞඛ්‍ය උපදෙස්', 'ජීවන රටාව', 'නින්ද', 'මානසික සීදුර', 'ව්‍යායාම',
    'පෝෂණ', 'ආහාර', 'විටමින්', 'සුව', 'යෝග', 'භාවනා', 'ගර්භණී', 'ළමා සෞඛ්‍ය',
    'වැඩිහිටි සෞඛ්‍ය', 'දන්ත', 'ඇස්', 'ඇසීම', 'හුස්ම', 'ශ්වසන', 'ආහාර ආරක්ෂාව'
  ]
};

// Enhanced priority keywords
const PRIORITY_KEYWORDS = {
  high: [
    'outbreak', 'epidemic', 'pandemic', 'emergency', 'alert', 'warning', 'crisis', 'urgent',
    'breaking', 'death', 'fatal', 'dangerous', 'risk', 'threat', 'serious', 'critical'
  ],
  medium: [
    'vaccine', 'treatment', 'breakthrough', 'study', 'research', 'new', 'discovery',
    'clinical trial', 'approved', 'recommendation', 'guidelines', 'prevention', 'awareness'
  ],
  low: [
    'tips', 'advice', 'lifestyle', 'wellness', 'fitness', 'nutrition', 'exercise',
    'healthy', 'benefits', 'improve', 'maintain', 'natural', 'home remedies'
  ]
};

class newsService {
  private apiKey: string;
  private newsApiBaseUrl: string;
  private maxRetries: number = 2; // Reduced from 3 to 2
  private retryDelay: number = 500; // Reduced from 1000 to 500
  private concurrentLimit: number = 8; // Increased from 5 to 8
  private requestTimeout: number = 5000; // Reduced from 10000 to 5000
  
  // Add caching to improve performance
  private newsCache: {
    data: NewsItem[],
    timestamp: number,
    expiry: number
  } | null = null;
  private cacheDuration: number = 15 * 60 * 1000; // 15 minutes cache
  private maxItemsPerSource: number = 10; // Limit items per source

  constructor() {
    this.apiKey = process.env.NEWS_API_KEY || '917d23718b24403f9e391f0e5610377e';
    this.newsApiBaseUrl = 'https://newsapi.org/v2';
  }

  // Main function to get health news from ALL sources
  async getAllHealthNews(): Promise<NewsItem[]> {
    try {
      // Check if we have valid cached data
      if (this.newsCache && 
          (Date.now() - this.newsCache.timestamp) < this.cacheDuration) {
        console.log('📦 Using cached news data...');
        return this.newsCache.data;
      }
      
      console.log('🔍 Fetching health news from sources...');
      const startTime = Date.now();
      
      // Prioritize sources - select fewer but more reliable sources
      // Get only the most reliable enabled sources
      const enabledSources = NEWS_SOURCES.filter(source => source.enabled)
        .sort((a, b) => {
          // Prefer sources with RSS URLs as they're generally faster
          if (a.rssUrl && !b.rssUrl) return -1;
          if (!a.rssUrl && b.rssUrl) return 1;
          return 0;
        })
        .slice(0, 10); // Limit to top 10 most reliable sources
      
      console.log(`📡 Fetching from ${enabledSources.length} prioritized sources...`);
      
      const allNewsPromises: Promise<NewsItem[]>[] = [];
      
      // Run all sources in parallel with increased concurrency
      const sourcePromises = enabledSources.map(source => this.fetchFromSingleSource(source));
      allNewsPromises.push(...sourcePromises);
      
      // Add NewsAPI as a reliable global source
      allNewsPromises.push(this.fetchFromNewsAPI());
      
      // Skip alternative APIs to save time
      // allNewsPromises.push(this.fetchFromAlternativeAPIs());
      
      // Execute all promises concurrently with a timeout
      console.log(`⚡ Executing ${allNewsPromises.length} concurrent requests...`);
      
      // Add a timeout promise to limit overall fetch time
      const timeoutPromise = new Promise<PromiseSettledResult<NewsItem[]>[]>(resolve => {
        setTimeout(() => {
          console.log('⏱️ Time limit reached for news fetching');
          resolve([]);
        }, 10000); // 10-second overall timeout
      });
      
      const allResults = await Promise.race([
        Promise.allSettled(allNewsPromises),
        timeoutPromise
      ]) as PromiseSettledResult<NewsItem[]>[];
      
      // Combine all successful results
      const allNews: NewsItem[] = [];
      let successCount = 0;
      let failCount = 0;
      
      allResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          // Limit the number of items per source to avoid overloading
          allNews.push(...result.value.slice(0, this.maxItemsPerSource));
          successCount++;
        } else {
          console.error(`❌ Request ${index + 1} failed:`, result.reason);
          failCount++;
        }
      });
      
      console.log(`✅ ${successCount} sources successful, ${failCount} failed`);
      console.log(`📰 Total raw news items collected: ${allNews.length}`);
      
      // Process the results
      const healthNews = this.filterHealthAndLifestyleNews(allNews);
      console.log(`🏥 Health/lifestyle news after filtering: ${healthNews.length}`);
      
      const categorizedNews = this.categorizeNews(healthNews);
      const sortedNews = this.sortNewsByPriority(categorizedNews);
      const deduplicatedNews = this.removeDuplicates(sortedNews);
      
      console.log(`📊 Final processed news count: ${deduplicatedNews.length}`);
      
      // Only enrich a limited number of items to save time
      const itemsToEnrich = deduplicatedNews.filter(item => !item.imageUrl).slice(0, 5);
      if (itemsToEnrich.length > 0) {
        console.log(`🖼️ Enriching ${itemsToEnrich.length} news items with images...`);
        await this.enrichNewsItemsWithImages(itemsToEnrich);
      }
      
      // Store in cache
      this.newsCache = {
        data: deduplicatedNews,
        timestamp: Date.now(),
        expiry: Date.now() + this.cacheDuration
      };
      
      const endTime = Date.now();
      console.log(`⏱️ Total fetch time: ${(endTime - startTime) / 1000} seconds`);
      
      return deduplicatedNews;
      
    } catch (error) {
      console.error('❌ Error in getAllHealthNews:', error);
      throw new Error('Failed to fetch health news from all sources');
    }
  }

  // Fetch from a single source (RSS or API)
  private async fetchFromSingleSource(source: NewsSource): Promise<NewsItem[]> {
    try {
      // console.log(`📡 Fetching from ${source.name}...`);
      
      if (source.rssUrl) {
        const result = await this.fetchFromRSSFeed(source);
        if (result.length > 0) {
          console.log(`✅ Successfully fetched ${result.length} items from ${source.name}`);
        } else {
          console.log(`⚠️  No items found from ${source.name}`);
        }
        return result;
      } else {
        console.log(`⚠️  ${source.name} has no RSS URL, trying alternative methods...`);
        return await this.fetchFromSourceAPI(source);
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ Error fetching from ${source.name}: ${errorMessage}`);
      return [];
    }
  }

  // Fetch from RSS feed for a specific source
  private async fetchFromRSSFeed(source: NewsSource): Promise<NewsItem[]> {
    try {
       if (!source.rssUrl) {
        console.log(`⚠️  No RSS URL for ${source.name}`);
        return [];
      }
      
      console.log(`📡 Fetching RSS from ${source.name}`);
      
      // Set a shorter timeout for RSS feeds to fail faster
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      
      try {
        const response = await this.fetchWithRetry(source.rssUrl);
        clearTimeout(timeoutId);
        
        if (!response.data) {
          console.log(`⚠️  Empty response from ${source.name}`);
          return [];
        }
        
        // Limit parsing time
        const newsItems = this.parseRSSFeed(response.data, source.name, source.language)
          .slice(0, this.maxItemsPerSource); // Only take the most recent items
        
        if (newsItems.length === 0) {
          console.log(`⚠️  No parseable items from ${source.name} RSS feed`);
          return [];
        }

        // Mark items with source info
        const markedItems = newsItems.map(item => ({
          ...item,
          source: source.name,
          isLocal: source.type === 'local',
          sourceType: 'rss' as const,
          language: source.language
        }));
        
        console.log(`✅ Successfully parsed ${markedItems.length} items from ${source.name}`);
        return markedItems;
        
      } catch {
        console.log(`⏱️ Timeout or error for ${source.name} RSS feed`);
        return [];
      }
      
    } catch {
      console.error(`❌ RSS fetch failed for ${source.name}`);
      
      // Skip trying alternative URLs to save time
      return [];
    }
  }

  // Fetch from NewsAPI with health queries
  private async fetchFromNewsAPI(): Promise<NewsItem[]> {
    try {
      console.log('📡 Fetching from NewsAPI...');
      
      // Use fewer queries to speed up the process
      const healthQueries = [
        'health OR medical OR wellness',
        'covid OR vaccine'
      ];
      
      // Add a timeout for NewsAPI queries
      const timeoutPromise = new Promise<NewsItem[]>(resolve => {
        setTimeout(() => {
          console.log('⏱️ NewsAPI timeout reached');
          resolve([]);
        }, 5000);
      });
      
      // Only fetch one query to reduce time
      const mainQueryPromise = this.fetchNewsAPIQuery(healthQueries[0]);
      
      // Race between the timeout and the actual fetch
      const result = await Promise.race([
        mainQueryPromise,
        timeoutPromise
      ]);
      
      return result;
      
    } catch {
      console.error('❌ NewsAPI fetch failed');
      return [];
    }
  }

  // Fetch from NewsAPI with specific query
  private async fetchNewsAPIQuery(query: string): Promise<NewsItem[]> {
    try {
      // Check if we're already in rate limit status to avoid making the request
      const rateLimited = await this.isInRateLimit();
      if (rateLimited) {
        console.log('⚠️ NewsAPI rate limit previously reached, using fallback data');
        return this.getNewsApiFallbackData();
      }

      const response = await axios.get(`${this.newsApiBaseUrl}/everything`, {
        params: {
          q: query,
          language: 'en',
          sortBy: 'publishedAt',
          pageSize: 10, // Reduced from 20 to lower API usage
          apiKey: this.apiKey
        },
        timeout: this.requestTimeout
      });

      if (response.data.articles) {
        return response.data.articles.map((article: any) => {
          // Ensure we have a valid image URL
          let imageUrl = article.urlToImage;
          
          // Check if the imageUrl is valid
          if (!imageUrl || 
              imageUrl === 'null' || 
              imageUrl === 'undefined' ||
              !imageUrl.startsWith('http')) {
            imageUrl = ''; // Reset invalid URLs to fetch later
          }
          
          return {
            title: article.title,
            link: article.url,
            source: article.source.name,
            date: article.publishedAt,
            description: article.description,
            imageUrl: imageUrl,
            language: 'en',
            isLocal: false,
            sourceType: 'api' as const
          };
        });
      }
      
      return [];
    } catch (error: any) {
      // Check if the error is due to rate limiting (HTTP 429)
      if (error.response && error.response.status === 429) {
        console.error(`⚠️ NewsAPI rate limit reached (429). Using fallback data.`);
        await this.setRateLimitStatus();
        return this.getNewsApiFallbackData();
      }
      
      console.error(`❌ NewsAPI query failed for "${query}"`);
      return [];
    }
  }
  
  // Track rate limit status to avoid unnecessary API calls
  private rateLimitKey = 'newsapi_ratelimit_timestamp';
  private rateLimitDuration = 12 * 60 * 60 * 1000; // 12 hours cooldown
  private rateLimitCheckComplete = false;
  private isRateLimited = false;
  
  private async isInRateLimit(): Promise<boolean> {
    // Return cached result if already checked this session
    if (this.rateLimitCheckComplete) {
      return this.isRateLimited;
    }
    
    try {
      const storedValue = await AsyncStorage.getItem(this.rateLimitKey);
      if (storedValue) {
        const timestamp = parseInt(storedValue, 10);
        this.isRateLimited = (Date.now() - timestamp) < this.rateLimitDuration;
      } else {
        this.isRateLimited = false;
      }
      this.rateLimitCheckComplete = true;
      return this.isRateLimited;
    } catch (e) {
      // In case AsyncStorage fails
      console.log('AsyncStorage error when checking rate limit', e);
      return false;
    }
  }
  
  private async setRateLimitStatus(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.rateLimitKey, Date.now().toString());
      this.isRateLimited = true;
      this.rateLimitCheckComplete = true;
    } catch (e) {
      console.log('AsyncStorage error when setting rate limit', e);
    }
  }
  
  // Provide fallback news data when API limits are reached
  private getNewsApiFallbackData(): NewsItem[] {
    // Current common health topics to use as fallback
    return [
      {
        title: "Study finds regular exercise may reduce risk of severe COVID-19 outcomes",
        link: "https://www.who.int/news-room/health-topics/physical-activity",
        source: "World Health Organization",
        date: new Date().toISOString(),
        description: "Regular physical activity is proven to help prevent and manage diseases such as heart disease, stroke, diabetes and several cancers. It also helps prevent hypertension, maintain healthy body weight and can improve mental health, quality of life and well-being.",
        imageUrl: "https://www.who.int/images/default-source/departments/social-media/social-determinants-of-health-sdh.jpg",
        language: "en",
        isLocal: false,
        sourceType: "api",
        category: "health",
        priority: "medium"
      },
      {
        title: "New guidelines released for managing hypertension in older adults",
        link: "https://www.who.int/news-room/fact-sheets/detail/hypertension",
        source: "Health Journal",
        date: new Date().toISOString(),
        description: "Recent medical research has led to updated guidelines for treating high blood pressure in older patients, emphasizing personalized approaches based on overall health status.",
        imageUrl: "https://www.who.int/images/default-source/wpro/countries/philippines/feature-stories/hypertension-blood-pressure-measurement.jpg",
        language: "en",
        isLocal: false,
        sourceType: "api",
        category: "medical",
        priority: "medium"
      },
      {
        title: "Nutritionists recommend Mediterranean diet for heart health benefits",
        link: "https://www.who.int/news-room/fact-sheets/detail/healthy-diet",
        source: "Nutrition Research",
        date: new Date().toISOString(),
        description: "The Mediterranean diet, rich in olive oil, nuts, fruits, vegetables, and fish, continues to show strong evidence for cardiovascular health improvements and longevity.",
        imageUrl: "https://www.who.int/images/default-source/wpro/health-topic/nutrition/img-nutrition-healthy-eating.jpg",
        language: "en",
        isLocal: false,
        sourceType: "api",
        category: "nutrition",
        priority: "low"
      },
      {
        title: "Mental health awareness focuses on post-pandemic anxiety and depression",
        link: "https://www.who.int/news-room/fact-sheets/detail/mental-health-strengthening-our-response",
        source: "Mental Health Foundation",
        date: new Date().toISOString(),
        description: "Health professionals are highlighting the importance of addressing lingering psychological effects from pandemic isolation and stress, with new approaches to community support.",
        imageUrl: "https://www.who.int/images/default-source/departments/mental-health/depression/woman-in-blue-shirt.jpg",
        language: "en",
        isLocal: false,
        sourceType: "api",
        category: "wellness",
        priority: "medium"
      },
      {
        title: "Advances in diabetes treatment show promise for improved quality of life",
        link: "https://www.who.int/news-room/fact-sheets/detail/diabetes",
        source: "Medical Innovations",
        date: new Date().toISOString(),
        description: "New diabetes management technologies and medications are making it easier for patients to maintain stable blood glucose levels with fewer complications.",
        imageUrl: "https://www.who.int/images/default-source/wpro/countries/philippines/feature-stories/8fea0583-1816-4169-b2b1-4f8e2e579135.jpg",
        language: "en",
        isLocal: false,
        sourceType: "api",
        category: "medical",
        priority: "medium"
      }
    ];
  }

  // Fetch from alternative APIs (you can add more API sources here)
  private async fetchFromAlternativeAPIs(): Promise<NewsItem[]> {
    try {
      console.log('📡 Fetching from alternative APIs...');
      
      const alternativeNews: NewsItem[] = [];
      
      // Example: Guardian API (you'll need to add API key)
      // const guardianNews = await this.fetchFromGuardianAPI();
      // alternativeNews.push(...guardianNews);
      
      // Example: New York Times API
      // const nytNews = await this.fetchFromNYTAPI();
      // alternativeNews.push(...nytNews);
      
      return alternativeNews;
      
    } catch (error) {
      console.error('❌ Alternative APIs fetch failed:', error);
      return [];
    }
  }

  // Enhanced health and lifestyle news filtering
  private filterHealthAndLifestyleNews(news: NewsItem[]): NewsItem[] {
    return news.filter(item => {
      if (!item.title) return false;
      
      const content = `${item.title} ${item.description || ''}`.toLowerCase();
      
      // Check English keywords
      const hasEnglishKeyword = HEALTH_KEYWORDS.english.some(keyword => 
        content.includes(keyword.toLowerCase())
      );
      
      // Check Sinhala keywords
      const hasSinhalaKeyword = HEALTH_KEYWORDS.sinhala.some(keyword => 
        content.includes(keyword)
      );
      
      // Additional lifestyle keywords
      const lifestyleKeywords = [
        'lifestyle', 'living', 'wellness', 'wellbeing', 'mindfulness', 'balance',
        'self-care', 'habits', 'routine', 'healthy living', 'life tips'
      ];
      
      const hasLifestyleKeyword = lifestyleKeywords.some(keyword => 
        content.includes(keyword)
      );
      
      return hasEnglishKeyword || hasSinhalaKeyword || hasLifestyleKeyword;
    });
  }

  // Enhanced categorization
  private categorizeNews(news: NewsItem[]): NewsItem[] {
    return news.map(item => ({
      ...item,
      category: this.getNewsCategory(item.title, item.description || ''),
      priority: this.getNewsPriority(item.title, item.description || '')
    }));
  }

  // Get news category with more detailed classification
  private getNewsCategory(title: string, description: string): NewsItem['category'] {
    const content = `${title} ${description}`.toLowerCase();
    
    const categories = {
      fitness: ['fitness', 'exercise', 'workout', 'gym', 'training', 'sport', 'physical activity'],
      nutrition: ['nutrition', 'diet', 'food', 'eating', 'meal', 'vitamin', 'supplement', 'recipe'],
      wellness: ['wellness', 'mental', 'stress', 'anxiety', 'mindfulness', 'meditation', 'sleep', 'relaxation'],
      lifestyle: ['lifestyle', 'living', 'habit', 'routine', 'balance', 'self-care', 'tips', 'advice'],
      medical: ['medical', 'clinical', 'surgery', 'hospital', 'doctor', 'physician', 'treatment', 'diagnosis']
    };
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => content.includes(keyword))) {
        return category as NewsItem['category'];
      }
    }
    
    return 'health';
  }

  // Get news priority with enhanced classification
  private getNewsPriority(title: string, description: string): NewsItem['priority'] {
    const content = `${title} ${description}`.toLowerCase();
    
    if (PRIORITY_KEYWORDS.high.some(keyword => content.includes(keyword))) {
      return 'high';
    }
    if (PRIORITY_KEYWORDS.medium.some(keyword => content.includes(keyword))) {
      return 'medium';
    }
    return 'low';
  }

  // Sort news by local first, then priority, then date
  private sortNewsByPriority(news: NewsItem[]): NewsItem[] {
    return news.sort((a, b) => {
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
  }

  // Remove duplicate news items
  private removeDuplicates(news: NewsItem[]): NewsItem[] {
    const seen = new Set<string>();
    const uniqueNews: NewsItem[] = [];
    
    for (const item of news) {
      // Create a unique key based on title and source
      const key = `${item.title.toLowerCase().trim()}-${item.source}`;
      
      if (!seen.has(key)) {
        seen.add(key);
        uniqueNews.push(item);
      }
    }
    
    return uniqueNews;
  }

  // Utility function to group array into chunks
  private groupArray<T>(array: T[], size: number): T[][] {
    const groups: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      groups.push(array.slice(i, i + size));
    }
    return groups;
  }

  // Enhanced RSS parsing (reused from original with improvements)
  private parseRSSFeed(xmlData: string, sourceName: string, language: string): NewsItem[] {
    const items: NewsItem[] = [];
    
    try {
      if (!xmlData || typeof xmlData !== 'string') {
        console.error(`Invalid XML data for ${sourceName}`);
        return items;
      }

      const cleanXml = xmlData.replace(/^\s*<\?xml[^>]*\?>\s*/, '').trim();
      
      // Check if this is a sitemap
      if (cleanXml.includes('<urlset') || cleanXml.includes('<sitemap>')) {
        console.log(`Detected sitemap format for ${sourceName}`);
        return this.parseSitemap(cleanXml, sourceName, language);
      }
      
      const itemPatterns = [
        /<item[^>]*>[\s\S]*?<\/item>/gi,
        /<entry[^>]*>[\s\S]*?<\/entry>/gi,
        /<article[^>]*>[\s\S]*?<\/article>/gi
      ];
      
      let matches: RegExpMatchArray | null = null;
      
      for (const pattern of itemPatterns) {
        matches = cleanXml.match(pattern);
        if (matches && matches.length > 0) {
          break;
        }
      }
      
      if (!matches || matches.length === 0) {
        console.log(`No RSS items found in ${sourceName} feed`);
        return items;
      }
      
      console.log(`Found ${matches.length} items in ${sourceName} feed`);
      
      matches.forEach((match, index) => {
        try {
          const item = this.parseRSSItem(match, sourceName, language);
          if (item) {
            items.push(item);
          }
        } catch (error) {
          console.error(`Error parsing RSS item ${index + 1} from ${sourceName}:`, error);
        }
      });
      
    } catch (error) {
      console.error(`Error parsing RSS feed from ${sourceName}:`, error);
    }
    
    return items;
  }
  
  // Parse sitemap format (for sites like Medical News Today)
  private parseSitemap(xmlData: string, sourceName: string, language: string): NewsItem[] {
    const items: NewsItem[] = [];
    
    try {
      // Extract URL entries from sitemap
      const urlEntries = xmlData.match(/<url>[\s\S]*?<\/url>/gi);
      
      if (!urlEntries || urlEntries.length === 0) {
        console.log(`No URL entries found in ${sourceName} sitemap`);
        return items;
      }
      
      console.log(`Found ${urlEntries.length} URL entries in ${sourceName} sitemap`);
      
      // Process only the first 20 entries to avoid overloading
      const processLimit = Math.min(urlEntries.length, 20);
      
      for (let i = 0; i < processLimit; i++) {
        const entry = urlEntries[i];
        
        // Extract location
        const locMatch = entry.match(/<loc>(.*?)<\/loc>/i);
        if (!locMatch || !locMatch[1]) continue;
        
        const url = this.cleanHtml(locMatch[1]);
        
        // Extract last modified date
        const lastmodMatch = entry.match(/<lastmod>(.*?)<\/lastmod>/i);
        const date = lastmodMatch ? lastmodMatch[1] : new Date().toISOString();
        
        // Extract image if available (some sitemaps include image data)
        let imageUrl = '';
        const imageMatch = entry.match(/<image:image>[\s\S]*?<image:loc>(.*?)<\/image:loc>[\s\S]*?<\/image:image>/i);
        if (imageMatch && imageMatch[1]) {
          imageUrl = this.cleanHtml(imageMatch[1]);
        }
        
        // Extract title from URL
        const urlParts = url.split('/');
        const lastPart = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2] || '';
        const title = lastPart
          .replace(/-/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase()); // Simple title case
        
        // If no image from sitemap, we'll fetch it from the article later
        const sitemapItem: NewsItem = {
          title: title,
          link: url,
          source: sourceName,
          date: date,
          description: `Health article from ${sourceName}`,
          language,
          isLocal: false,
          sourceType: 'rss' as const
        };
        
        if (imageUrl) {
          sitemapItem.imageUrl = imageUrl;
        }
        
        // For Medical News Today and similar sites, we can generate likely image URLs based on the article URL
        if (sourceName === 'Medical News Today') {
          // Extract the article ID or slug for image generation
          const articleMatch = url.match(/\/articles\/([^\/]+)/);
          if (articleMatch && articleMatch[1]) {
            const articleId = articleMatch[1];
            // Many health sites follow patterns for their featured images
            sitemapItem.imageUrl = `https://cdn-prod.medicalnewstoday.com/content/images/articles/${articleId.substring(0, 3)}/${articleId}-header-image.jpg`;
          }
        } else if (sourceName === 'Healthline') {
          // Similar approach for Healthline
          const slugMatch = url.match(/\/health\/([^\/]+)/);
          if (slugMatch && slugMatch[1]) {
            sitemapItem.imageUrl = `https://i0.wp.com/images-prod.healthline.com/${slugMatch[1]}-header.jpg`;
          }
        }
        
        items.push(sitemapItem);
      }
      
    } catch (error) {
      console.error(`Error parsing sitemap from ${sourceName}:`, error);
    }
    
    return items;
  }

  // Parse individual RSS item (reused from original)
  private parseRSSItem(itemXml: string, sourceName: string, language: string): NewsItem | null {
    try {
      const titlePatterns = [
        /<title(?:[^>]*)><!\[CDATA\[(.*?)\]\]><\/title>/i,
        /<title(?:[^>]*)>(.*?)<\/title>/i
      ];
      
      const linkPatterns = [
        /<link(?:[^>]*)><!\[CDATA\[(.*?)\]\]><\/link>/i,
        /<link(?:[^>]*)>(.*?)<\/link>/i,
        /<link[^>]*href=["'](.*?)["'][^>]*>/i
      ];
      
      const descriptionPatterns = [
        /<description(?:[^>]*)><!\[CDATA\[(.*?)\]\]><\/description>/i,
        /<description(?:[^>]*)>(.*?)<\/description>/i,
        /<summary(?:[^>]*)><!\[CDATA\[(.*?)\]\]><\/summary>/i,
        /<summary(?:[^>]*)>(.*?)<\/summary>/i
      ];
      
      const datePatterns = [
        /<pubDate(?:[^>]*)>(.*?)<\/pubDate>/i,
        /<published(?:[^>]*)>(.*?)<\/published>/i,
        /<updated(?:[^>]*)>(.*?)<\/updated>/i
      ];
      
      // New patterns for image extraction
      const imagePatterns = [
        /<enclosure[^>]*url=["'](.*?)["'][^>]*>/i,
        /<media:content[^>]*url=["'](.*?)["'][^>]*>/i,
        /<media:thumbnail[^>]*url=["'](.*?)["'][^>]*>/i,
        /<itunes:image[^>]*href=["'](.*?)["'][^>]*>/i,
        /<img[^>]*src=["'](.*?)["'][^>]*>/i
      ];
      
      let title = '';
      let link = '';
      let description = '';
      let date = '';
      let imageUrl = '';
      
      // Extract data using patterns
      for (const pattern of titlePatterns) {
        const match = itemXml.match(pattern);
        if (match && match[1]) {
          title = this.cleanHtml(match[1]);
          break;
        }
      }
      
      for (const pattern of linkPatterns) {
        const match = itemXml.match(pattern);
        if (match && match[1]) {
          link = match[1].trim();
          break;
        }
      }
      
      for (const pattern of descriptionPatterns) {
        const match = itemXml.match(pattern);
        if (match && match[1]) {
          description = this.cleanHtml(match[1]);
          break;
        }
      }
      
      for (const pattern of datePatterns) {
        const match = itemXml.match(pattern);
        if (match && match[1]) {
          date = match[1].trim();
          break;
        }
      }
      
      // Extract image URL if available
      for (const pattern of imagePatterns) {
        const match = itemXml.match(pattern);
        if (match && match[1]) {
          imageUrl = match[1].trim();
          break;
        }
      }
      
      // If no specific image tag found, try to extract from description
      if (!imageUrl && description) {
        const imgMatch = description.match(/<img[^>]*src=["'](https?:\/\/[^"']+)["'][^>]*>/i);
        if (imgMatch && imgMatch[1]) {
          imageUrl = imgMatch[1];
        }
      }
      
      if (!title || !link || !link.startsWith('http')) {
        return null;
      }
      
      return {
        title,
        link,
        source: sourceName,
        date: date || new Date().toISOString(),
        description,
        imageUrl,
        language,
        isLocal: true,
        sourceType: 'rss' as const
      };
      
    } catch (error) {
      console.error(`Error parsing RSS item from ${sourceName}:`, error);
      return null;
    }
  }

  // Clean HTML (reused from original)
  private cleanHtml(html: string): string {
    if (!html) return '';
    
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Enhanced fetch with retry (reused from original)
  private async fetchWithRetry(url: string, retryCount = 0): Promise<any> {
    try {
      console.log(`🔄 Fetching: ${url} (attempt ${retryCount + 1})`);

      const response = await axios.get(url, {
        timeout: this.requestTimeout,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'application/rss+xml, application/xml, text/xml',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        maxRedirects: 10,
        validateStatus: (status) => status < 400, // Accept redirects
        responseType: 'text' // Ensure we get text response
      });
      
      console.log(`✅ Successfully fetched from ${url} (${response.status})`);
      return response;
    
      } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(`❌ Fetch failed for ${url}: ${errorMessage}`);
      
      if (retryCount < this.maxRetries) {
        const delay = this.retryDelay * Math.pow(2, retryCount); // Exponential backoff
        console.log(`🔄 Retrying ${url} in ${delay}ms (attempt ${retryCount + 2}/${this.maxRetries + 1})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.fetchWithRetry(url, retryCount + 1);
      }
      
      console.log(`❌ Max retries reached for ${url}`);
      throw error;
    }
  }

  // Helper method to fetch from source-specific API
  private async fetchFromSourceAPI(source: NewsSource): Promise<NewsItem[]> {
     try {
      console.log(`🔄 Attempting API fetch for ${source.name}...`);
      
      // For sources without RSS, we can try alternative methods
      if (source.name === 'Hiru News' || source.name === 'CNN Health' || source.name === 'Reuters Health') {
        // These will be handled by NewsAPI if available
        console.log(`📰 ${source.name} will be fetched via NewsAPI in global fetch`);
        return [];
      }
      // For other sources, you could implement web scraping or specific API calls
      // This is where you'd add custom API integrations for sources that provide them
      
      console.log(`⚠️  No alternative API method available for ${source.name}`);
      return [];
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ API fetch failed for ${source.name}: ${errorMessage}`);
      return [];
    }
  }

  // Extract image from article HTML - optimized for speed
  private async extractImageFromArticle(url: string): Promise<string | null> {
    try {
      // Set a short timeout to avoid waiting too long
      const response = await axios.get(url, {
        timeout: 2000, // Very short timeout
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html'
        },
        maxRedirects: 2 // Fewer redirects to save time
      });
      
      if (!response.data || typeof response.data !== 'string') {
        return null;
      }
      
      // Only check Open Graph and Twitter image tags (fastest approach)
      // Check meta tags for images - most reliable and fastest approach
      const metaTagMatches = [
        // Open Graph image
        response.data.match(/<meta[^>]*property=["']og:image["'][^>]*content=["'](https?:\/\/[^"']+)["'][^>]*>/i),
        // Twitter card image
        response.data.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["'](https?:\/\/[^"']+)["'][^>]*>/i)
      ];
      
      // Return the first match found
      for (const match of metaTagMatches) {
        if (match && match[1]) {
          return match[1];
        }
      }
      
      // If no meta tags, get the first image with "featured" in the class or id
      const featuredImgMatch = response.data.match(/<img[^>]*(?:class|id)=["'][^"']*featured[^"']*["'][^>]*src=["'](https?:\/\/[^"']+)["'][^>]*>/i);
      if (featuredImgMatch && featuredImgMatch[1]) {
        return featuredImgMatch[1];
      }
      
      // As a last resort, get the first image that's not too small
      const firstImgMatch = response.data.match(/<img[^>]*src=["'](https?:\/\/[^"']+\.(?:jpg|jpeg|png|gif))["'][^>]*>/i);
      if (firstImgMatch && firstImgMatch[1]) {
        return firstImgMatch[1];
      }
      
      return null;
      
    } catch {
      // Skip error logging for performance
      return null;
    }
  }

  // Enrich news items with images
  private async enrichNewsItemsWithImages(news: NewsItem[]): Promise<NewsItem[]> {
    // Items without images - only take a few to speed up the process
    const itemsWithoutImages = news.filter(item => !item.imageUrl && item.link).slice(0, 5);
    
    if (itemsWithoutImages.length === 0) {
      return news;
    }
    
    console.log(`🖼️ Fetching images for ${itemsWithoutImages.length} prioritized news items...`);
    
    // Set a global timeout for the entire image enrichment process
    const imageEnrichmentTimeout = 3000; // 3 seconds max for all image enrichment
    const timeoutPromise = new Promise<void>(resolve => {
      setTimeout(() => {
        console.log('⏱️ Image enrichment timeout reached');
        resolve();
      }, imageEnrichmentTimeout);
    });
    
    // Create a race between the enrichment and timeout
    const enrichmentPromise = (async () => {
      // Process all items in parallel for speed
      const promises = itemsWithoutImages.map(async (item) => {
        if (!item.imageUrl && item.link) {
          try {
            // Individual timeout for each item
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            
            const imageUrl = await this.extractImageFromArticle(item.link);
            clearTimeout(timeoutId);
            
            if (imageUrl) {
              item.imageUrl = imageUrl;
            }
          } catch {
            // Silently ignore errors for speed
          }
        }
        return item;
      });
      
      // Wait for all items to complete or timeout
      await Promise.allSettled(promises);
    })();
    
    // Race between the enrichment and timeout
    await Promise.race([enrichmentPromise, timeoutPromise]);
    
    return news;
  }

  // Get summary statistics
  getSourceSummary(news: NewsItem[]): Record<string, any> {
    const summary = {
      totalNews: news.length,
      bySource: {} as Record<string, number>,
      byCategory: {} as Record<string, number>,
      byPriority: {} as Record<string, number>,
      byLanguage: {} as Record<string, number>,
      localVsGlobal: {
        local: news.filter(n => n.isLocal).length,
        global: news.filter(n => !n.isLocal).length
      }
    };

    news.forEach(item => {
      // Count by source
      if (item.source) {
        summary.bySource[item.source] = (summary.bySource[item.source] || 0) + 1;
      }
      
      // Count by category
      if (item.category) {
        summary.byCategory[item.category] = (summary.byCategory[item.category] || 0) + 1;
      }
      
      // Count by priority
      if (item.priority) {
        summary.byPriority[item.priority] = (summary.byPriority[item.priority] || 0) + 1;
      }
      
      // Count by language
      if (item.language) {
        summary.byLanguage[item.language] = (summary.byLanguage[item.language] || 0) + 1;
      }
    });

    return summary;
  }
}

// Export singleton instance
export const newsServiceInstance = new newsService();

// Main export function
export const getAllHealthNews = () => newsServiceInstance.getAllHealthNews();

// Export summary function
export const getHealthNewsSummary = (news: NewsItem[]) => newsServiceInstance.getSourceSummary(news);

export default newsServiceInstance;