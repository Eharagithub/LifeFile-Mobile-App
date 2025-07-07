
import axios from 'axios';

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
    name: 'Hiru News',
    url: 'https://hirunews.lk',
    rssUrl: 'https://www.hirunews.lk/rss',
    language: 'si',
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
    rssUrl: 'https://www.divaina.com/rss',
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
    name: 'CNN Health',
    url: 'https://cnn.com/health',
    rssUrl: 'http://rss.cnn.com/rss/edition_health.rss',
    language: 'en',
    type: 'global',
    enabled: true
  },
  {
    name: 'Reuters Health',
    url: 'https://reuters.com/health',
    rssUrl: 'https://www.reuters.com/arc/outboundfeeds/rss/category/health/?outputType=xml',
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
  private maxRetries: number = 3;
  private retryDelay: number = 1000;
  private concurrentLimit: number = 5; // Limit concurrent requests
  private requestTimeout: number = 10000;

  constructor() {
    this.apiKey = process.env.NEWS_API_KEY || '917d23718b24403f9e391f0e5610377e';
    this.newsApiBaseUrl = 'https://newsapi.org/v2';
  }

  // Main function to get health news from ALL sources
  async getAllHealthNews(): Promise<NewsItem[]> {
    try {
      console.log('🔍 Fetching health news from ALL available sources...');
      
      const allNewsPromises: Promise<NewsItem[]>[] = [];
      
      // 1. Fetch from RSS feeds (all sources in parallel)
      const enabledSources = NEWS_SOURCES.filter(source => source.enabled);
      console.log(`📡 Fetching from ${enabledSources.length} sources...`);
      
      // Group sources for concurrent processing
      const sourceGroups = this.groupArray(enabledSources, this.concurrentLimit);
      
      for (const group of sourceGroups) {
        const groupPromises = group.map(source => this.fetchFromSingleSource(source));
        allNewsPromises.push(...groupPromises);
      }
      
      // 2. Fetch from NewsAPI (global sources)
      allNewsPromises.push(this.fetchFromNewsAPI());
      
      // 3. Fetch from additional APIs if available
      allNewsPromises.push(this.fetchFromAlternativeAPIs());
      
      // Execute all promises concurrently
      console.log(`⚡ Executing ${allNewsPromises.length} concurrent requests...`);
      const allResults = await Promise.allSettled(allNewsPromises);
      
      // Combine all successful results
      const allNews: NewsItem[] = [];
      let successCount = 0;
      let failCount = 0;
      
      allResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          allNews.push(...result.value);
          successCount++;
        } else {
          console.error(`❌ Request ${index + 1} failed:`, result.reason);
          failCount++;
        }
      });
      
      console.log(`✅ ${successCount} sources successful, ${failCount} failed`);
      console.log(`📰 Total raw news items collected: ${allNews.length}`);
      
      // Filter, categorize, and sort
      const healthNews = this.filterHealthAndLifestyleNews(allNews);
      console.log(`🏥 Health/lifestyle news after filtering: ${healthNews.length}`);
      
      const categorizedNews = this.categorizeNews(healthNews);
      const sortedNews = this.sortNewsByPriority(categorizedNews);
      const deduplicatedNews = this.removeDuplicates(sortedNews);
      
      console.log(`📊 Final processed news count: ${deduplicatedNews.length}`);
      
      return deduplicatedNews;
      
    } catch (error) {
      console.error('❌ Error in getAllHealthNews:', error);
      throw new Error('Failed to fetch health news from all sources');
    }
  }

  // Fetch from a single source (RSS or API)
  private async fetchFromSingleSource(source: NewsSource): Promise<NewsItem[]> {
    try {
      console.log(`📡 Fetching from ${source.name}...`);
      
      if (source.rssUrl) {
        return await this.fetchFromRSSFeed(source);
      } else {
        return await this.fetchFromSourceAPI(source);
      }
      
    } catch (error) {
      console.error(`❌ Error fetching from ${source.name}:`, error);
      return [];
    }
  }

  // Fetch from RSS feed for a specific source
  private async fetchFromRSSFeed(source: NewsSource): Promise<NewsItem[]> {
    try {
      if (!source.rssUrl) return [];
      
      const response = await this.fetchWithRetry(source.rssUrl);
      const newsItems = this.parseRSSFeed(response.data, source.name, source.language);
      
      // Mark items with source info
      return newsItems.map(item => ({
        ...item,
        source: source.name,
        isLocal: source.type === 'local',
        sourceType: 'rss' as const,
        language: source.language
      }));
      
    } catch (error) {
      console.error(`❌ RSS fetch failed for ${source.name}:`, error);
      return [];
    }
  }

  // Fetch from NewsAPI with health queries
  private async fetchFromNewsAPI(): Promise<NewsItem[]> {
    try {
      console.log('📡 Fetching from NewsAPI...');
      
      const healthQueries = [
        'health OR medical OR wellness',
        'fitness OR nutrition OR diet',
        'hospital OR doctor OR medicine',
        'covid OR vaccine OR virus',
        'mental health OR stress OR anxiety'
      ];
      
      const promises = healthQueries.map(query => 
        this.fetchNewsAPIQuery(query)
      );
      
      const results = await Promise.allSettled(promises);
      const allNews: NewsItem[] = [];
      
      results.forEach(result => {
        if (result.status === 'fulfilled') {
          allNews.push(...result.value);
        }
      });
      
      return allNews;
      
    } catch (error) {
      console.error('❌ NewsAPI fetch failed:', error);
      return [];
    }
  }

  // Fetch from NewsAPI with specific query
  private async fetchNewsAPIQuery(query: string): Promise<NewsItem[]> {
    try {
      const response = await axios.get(`${this.newsApiBaseUrl}/everything`, {
        params: {
          q: query,
          language: 'en',
          sortBy: 'publishedAt',
          pageSize: 20,
          apiKey: this.apiKey
        },
        timeout: this.requestTimeout
      });

      if (response.data.articles) {
        return response.data.articles.map((article: any) => ({
          title: article.title,
          link: article.url,
          source: article.source.name,
          date: article.publishedAt,
          description: article.description,
          imageUrl: article.urlToImage,
          language: 'en',
          isLocal: false,
          sourceType: 'api' as const
        }));
      }
      
      return [];
    } catch (error) {
      console.error(`❌ NewsAPI query failed for "${query}":`, error);
      return [];
    }
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

  // Sort news by priority, date, and source reliability
  private sortNewsByPriority(news: NewsItem[]): NewsItem[] {
    return news.sort((a, b) => {
      const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
      const priorityDiff = (priorityOrder[b.priority || 'low'] - priorityOrder[a.priority || 'low']);
      
      if (priorityDiff !== 0) return priorityDiff;
      
      // Prioritize local news
      if (a.isLocal && !b.isLocal) return -1;
      if (!a.isLocal && b.isLocal) return 1;
      
      // Sort by date
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
      
      let title = '';
      let link = '';
      let description = '';
      let date = '';
      
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
      
      if (!title || !link || !link.startsWith('http')) {
        return null;
      }
      
      return {
        title,
        link,
        source: sourceName,
        date: date || new Date().toISOString(),
        description,
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
      const response = await axios.get(url, {
        timeout: this.requestTimeout,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'application/rss+xml, application/xml, text/xml',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache'
        },
        maxRedirects: 5
      });
      
      return response;
    } catch (error) {
      if (retryCount < this.maxRetries) {
        console.log(`Retrying ${url} (attempt ${retryCount + 1}/${this.maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * (retryCount + 1)));
        return this.fetchWithRetry(url, retryCount + 1);
      }
      throw error;
    }
  }

  // Helper method to fetch from source-specific API
  private async fetchFromSourceAPI(source: NewsSource): Promise<NewsItem[]> {
    // Implement specific API calls for sources that have APIs
    // This would be customized based on each source's API
    console.log(`API fetch not implemented for ${source.name}`);
    return [];
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