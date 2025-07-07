import axios from 'axios';
import RSSUrlVerifier from '../utils/rssUrlVerifier';

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
      // console.log('🔍 Fetching health news from ALL available sources...');
      
      const allNewsPromises: Promise<NewsItem[]>[] = [];
      
      // 1. Fetch from RSS feeds (all sources in parallel)
      const enabledSources = NEWS_SOURCES.filter(source => source.enabled);
      // console.log(`📡 Fetching from ${enabledSources.length} sources...`);
      
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
      
      // Enrich news items with images from article pages
      // console.log(`🖼️ Enriching news items with images...`);
      const enrichedNews = await this.enrichNewsItemsWithImages(deduplicatedNews);
      
      
      
      return enrichedNews;
      
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
      
      console.log(`📡 Fetching RSS from ${source.name}: ${source.rssUrl}`);
      
      const response = await this.fetchWithRetry(source.rssUrl);
      
      if (!response.data) {
        console.log(`⚠️  Empty response from ${source.name}`);
        return [];
      }
      
      const newsItems = this.parseRSSFeed(response.data, source.name, source.language);
      
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
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ RSS fetch failed for ${source.name}: ${errorMessage}`);
      
      // Check if it's a 404 error or other connection issue
      if (errorMessage.includes('404') || errorMessage.includes('status code') || errorMessage.includes('ENOTFOUND')) {
        console.log(`🔍 RSS URL may be incorrect for ${source.name}. Trying alternative methods...`);
        
        // Try alternative RSS URL formats if this is a common source
        const verifier = new RSSUrlVerifier();
        const alternativeUrls = verifier.getAlternativeRSSUrls()[source.name];
        
        if (alternativeUrls && alternativeUrls.length > 0) {
          // Only try alternative URLs that are different from the current one
          const otherUrls = alternativeUrls.filter((url: string) => url !== source.rssUrl);
          
          if (otherUrls.length > 0) {
            console.log(`🔄 Trying alternative RSS URL for ${source.name}`);
            
            // Create a temporary source with the alternative URL
            const tempSource = { ...source, rssUrl: otherUrls[0] };
            return await this.fetchFromSourceAPI(tempSource);
          }
        }
        
        return await this.fetchFromSourceAPI(source);
      }
      
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

  // Extract image from article HTML
  private async extractImageFromArticle(url: string): Promise<string | null> {
    try {
      // console.log(`🖼️ Fetching image from article: ${url}`);
      
      const response = await axios.get(url, {
        timeout: this.requestTimeout,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html',
          'Accept-Language': 'en-US,en;q=0.9'
        },
        maxRedirects: 5
      });
      
      if (!response.data || typeof response.data !== 'string') {
        return null;
      }
      
      // Try to find Open Graph image tag first (most reliable)
      const ogImageMatch = response.data.match(/<meta[^>]*property=["']og:image["'][^>]*content=["'](https?:\/\/[^"']+)["'][^>]*>/i);
      if (ogImageMatch && ogImageMatch[1]) {
        return ogImageMatch[1];
      }
      
      // Try Twitter card image
      const twitterImageMatch = response.data.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["'](https?:\/\/[^"']+)["'][^>]*>/i);
      if (twitterImageMatch && twitterImageMatch[1]) {
        return twitterImageMatch[1];
      }
      
      // Look for schema.org structured data
      const schemaMatch = response.data.match(/"image":\s*"(https?:\/\/[^"]+)"/i);
      if (schemaMatch && schemaMatch[1]) {
        return schemaMatch[1];
      }
      
      // Find first large image in the article content
      const imgMatches = response.data.match(/<img[^>]*src=["'](https?:\/\/[^"']+)["'][^>]*>/ig);
      if (imgMatches && imgMatches.length > 0) {
        for (const imgTag of imgMatches) {
          // Skip small icons, avatars, etc.
          if (imgTag.includes('width="') || imgTag.includes('height="')) {
            const widthMatch = imgTag.match(/width=["'](\d+)["']/i);
            const heightMatch = imgTag.match(/height=["'](\d+)["']/i);
            
            if (widthMatch && heightMatch) {
              const width = parseInt(widthMatch[1], 10);
              const height = parseInt(heightMatch[1], 10);
              
              // Only use reasonably sized images
              if (width >= 300 && height >= 200) {
                const srcMatch = imgTag.match(/src=["'](https?:\/\/[^"']+)["']/i);
                if (srcMatch && srcMatch[1]) {
                  return srcMatch[1];
                }
              }
            }
          }
          
          // If no width/height attributes, check for common image patterns
          if (imgTag.includes('featured') || 
              imgTag.includes('article') || 
              imgTag.includes('header') || 
              imgTag.includes('main')) {
            const srcMatch = imgTag.match(/src=["'](https?:\/\/[^"']+)["']/i);
            if (srcMatch && srcMatch[1]) {
              return srcMatch[1];
            }
          }
        }
        
        // If we haven't found a suitable image yet, just use the first one
        const firstImgMatch = imgMatches[0].match(/src=["'](https?:\/\/[^"']+)["']/i);
        if (firstImgMatch && firstImgMatch[1]) {
          return firstImgMatch[1];
        }
      }
      
      return null;
      
    } catch (error) {
      console.error(`❌ Error extracting image from article: ${error}`);
      return null;
    }
  }

  // Enrich news items with images
  private async enrichNewsItemsWithImages(news: NewsItem[]): Promise<NewsItem[]> {
    // Items without images
    const itemsWithoutImages = news.filter(item => !item.imageUrl && item.link);
    
    if (itemsWithoutImages.length === 0) {
      return news;
    }
    
    console.log(`🖼️ Fetching images for ${itemsWithoutImages.length} news items...`);
    
    // Process in batches to avoid overwhelming the network
    const batchSize = 3;
    const batches = [];
    
    for (let i = 0; i < itemsWithoutImages.length; i += batchSize) {
      batches.push(itemsWithoutImages.slice(i, i + batchSize));
    }
    
    for (const batch of batches) {
      const batchPromises = batch.map(async (item) => {
        if (!item.imageUrl && item.link) {
          try {
            const imageUrl = await this.extractImageFromArticle(item.link);
            if (imageUrl) {
            
              item.imageUrl = imageUrl;
            }
          } catch (error) {
            console.error(`❌ Error enriching item with image: ${error}`);
          }
        }
        return item;
      });
      
      await Promise.allSettled(batchPromises);
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
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