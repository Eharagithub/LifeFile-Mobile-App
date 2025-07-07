import axios from 'axios';

// Configuration
const CONFIG = {
  API_TIMEOUT: 15000,
  MAX_RETRIES: 3,
  CACHE_EXPIRY: 1800000, // 30 minutes
  MIN_NEWS_ITEMS: 8,
  MAX_NEWS_ITEMS: 20,
  USE_FALLBACK_DATA: true,
  USE_LOCAL_CACHE: true,
  NEWS_API_KEY: process.env.NEWS_API_KEY || 'your-api-key-here'
};

// User agents for rotation
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  'LifeFile-Health-App/2.0'
];

// API endpoints
const API_ENDPOINTS = {
  ESANA: 'https://esana-api.vercel.app/EsanaV3',
  HELAKURU: 'https://api.helakuru.lk/api/v1/news',
  ADA_DERANA: 'https://www.adaderana.lk/rss.php',
  HIRU_NEWS: 'https://www.hirunews.lk/rss/english.xml',
  LANKADEEPA: 'https://www.lankadeepa.lk/rss/latest',
  WHO_NEWS: 'https://www.who.int/feeds/entity/mediacentre/news/en/rss.xml',
  GLOBAL_NEWS: 'https://newsapi.org/v2/top-headlines',
  HEALTH_GOV: 'https://health.gov/news.json'
};

// Comprehensive health keywords
const HEALTH_KEYWORDS = {
  english: [
    'health', 'hospital', 'disease', 'covid', 'vaccine', 'medicine', 'treatment', 'doctor', 'patient',
    'medical', 'clinic', 'healthcare', 'emergency', 'virus', 'infection', 'symptom', 'cure', 'therapy',
    'drug', 'surgery', 'prevention', 'diagnosis', 'prescription', 'pharmacy', 'epidemic', 'pandemic',
    'wellness', 'nutrition', 'mental health', 'nursing', 'ambulance', 'immunity', 'blood', 'cancer', 
    'dengue', 'diet', 'exercise', 'fitness', 'heart', 'diabetes', 'stroke', 'cholesterol', 'hypertension',
    'pregnancy', 'birth', 'pediatric', 'geriatric', 'cardiology', 'neurology', 'dermatology', 'ophthalmology',
    'psychiatry', 'psychology', 'dentist', 'dental', 'vaccination', 'immunization', 'disability', 
    'rehabilitation', 'first aid', 'ICU', 'emergency room', 'lifestyle', 'wellbeing', 'public health',
    'medical research', 'clinical trial', 'health insurance', 'telemedicine', 'mental wellness'
  ],
  sinhala: [
    'ආරෝග්‍යය', 'රෝග', 'වෛද්‍ය', 'රෝහල', 'කොවිඩ්', 'ප්‍රතිකාර', 'ඖෂධ', 'රෝගියා',
    'සෞඛ්‍ය', 'මහජන සෞඛ්‍ය', 'වසංගත', 'එන්නත', 'ප්‍රතිශක්තිකරණය', 'ලෙඩ', 'බෙහෙත්',
    'දෙංගු', 'රුධිරය', 'පිළිකා', 'හෘදය', 'ශල්‍යකර්මය', 'වයිරස', 'බෝවන', 'ගිලන් රථ',
    'දියවැඩියාව', 'අධික රුධිර පීඩනය', 'ව්‍යායාම', 'රෝග නිවාරණය', 'රෝග විනිශ්චය',
    'මානසික සෞඛ්‍ය', 'ළමා රෝග', 'මාතෘ සායනය', 'ගර්භණී', 'ප්‍රසූත', 'වකුගඩු', 'අක්මාව',
    'පෝෂණය', 'ආහාර', 'ජල ජනිත', 'වාත ජනිත', 'ජීවන රටාව', 'යහපැවැත්ම', 'සෞඛ්‍ය රක්ෂණය'
  ]
};

// Interfaces
interface NewsItem {
  title: string;
  link: string;
  source: string;
  date: string;
  description?: string;
  imageUrl?: string;
  language: 'en' | 'si';
  category?: string;
  priority?: number; // 1-5, where 1 is highest priority
}

interface CacheItem {
  timestamp: number;
  data: NewsItem[];
}

interface EsanaPost {
  title: string;
  title_en?: string;
  content: { data: string; data_en?: string; type?: string }[];
  link?: string;
  source?: string;
  created_at?: string;
  category?: string;
  urlToImage?: string;
}

interface HelakuruPost {
  title: string;
  description?: string;
  url: string;
  source: string;
  publishedAt: string;
  thumbnail?: string;
  category?: string;
}

interface GlobalNewsPost {
  title: string;
  description?: string;
  url: string;
  source: { name: string; id?: string };
  publishedAt: string;
  urlToImage?: string;
}

// Cache management
const newsCache: Record<string, CacheItem> = {};

class HealthNewsService {
  private static instance: HealthNewsService;
  private allHealthKeywords: string[];

  private constructor() {
    this.allHealthKeywords = [...HEALTH_KEYWORDS.english, ...HEALTH_KEYWORDS.sinhala];
  }

  static getInstance(): HealthNewsService {
    if (!HealthNewsService.instance) {
      HealthNewsService.instance = new HealthNewsService();
    }
    return HealthNewsService.instance;
  }

  // Utility functions
  private getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private getRandomUserAgent(): string {
    return USER_AGENTS[this.getRandomInt(0, USER_AGENTS.length - 1)];
  }

  private isCacheValid(key: string): boolean {
    if (!CONFIG.USE_LOCAL_CACHE) return false;
    const cacheItem = newsCache[key];
    if (!cacheItem?.data?.length) return false;
    return (Date.now() - cacheItem.timestamp) < CONFIG.CACHE_EXPIRY;
  }

  private updateCache(key: string, data: NewsItem[]): void {
    if (!CONFIG.USE_LOCAL_CACHE) return;
    newsCache[key] = { timestamp: Date.now(), data: [...data] };
  }

  private containsHealthContent(text: string): boolean {
    if (!text) return false;
    const lowerText = text.toLowerCase();
    return this.allHealthKeywords.some(keyword => 
      lowerText.includes(keyword.toLowerCase())
    );
  }

  private async retryApiCall<T>(
    apiCall: () => Promise<T>, 
    retries: number = CONFIG.MAX_RETRIES
  ): Promise<T> {
    try {
      return await apiCall();
    } catch (error: any) {
      if (retries <= 0) throw error;
      
      const waitTime = 1000 * (CONFIG.MAX_RETRIES - retries + 1) + this.getRandomInt(0, 1000);
      console.log(`API call failed, retrying in ${waitTime}ms... (${retries} attempts left)`);
      
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return this.retryApiCall(apiCall, retries - 1);
    }
  }

  // Health content filtering
  private isHealthRelated(title: string, description: string = '', category: string = ''): boolean {
    const fullText = `${title} ${description} ${category}`.toLowerCase();
    
    // Priority keywords for immediate identification
    const priorityKeywords = [
      'health', 'hospital', 'doctor', 'medicine', 'covid', 'vaccine', 'virus',
      'ආරෝග්‍යය', 'රෝහල', 'වෛද්‍ය', 'ඖෂධ', 'කොවිඩ්', 'සෞඛ්‍ය'
    ];
    
    if (priorityKeywords.some(keyword => fullText.includes(keyword.toLowerCase()))) {
      return true;
    }
    
    return this.containsHealthContent(fullText);
  }

  // News source fetchers
  private async fetchEsanaNews(): Promise<NewsItem[]> {
    try {
      console.log('Fetching Esana health news...');
      
      if (this.isCacheValid('esana')) {
        return newsCache['esana'].data;
      }

      const response = await this.retryApiCall(async () => {
        await new Promise(resolve => setTimeout(resolve, this.getRandomInt(100, 1000)));
        
        return axios.get(API_ENDPOINTS.ESANA, {
          timeout: CONFIG.API_TIMEOUT,
          headers: {
            'User-Agent': this.getRandomUserAgent(),
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
      });

      if (!response.data?.Posts) {
        console.warn('No posts from Esana API');
        return [];
      }

      const healthPosts = response.data.Posts.filter((post: EsanaPost) => {
        const title = post.title || '';
        const content = post.content?.map(c => c.data).join(' ') || '';
        return this.isHealthRelated(title, content, post.category);
      });

      const newsItems: NewsItem[] = healthPosts.map((post: EsanaPost) => ({
        title: post.title,
        link: post.link || '#',
        source: post.source || 'Esana',
        date: post.created_at ? new Date(post.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
        description: post.content?.[0]?.data?.substring(0, 150) + '...',
        imageUrl: post.urlToImage,
        language: /[\u0D80-\u0DFF]/.test(post.title) ? 'si' : 'en' as 'si' | 'en',
        priority: 3
      }));

      this.updateCache('esana', newsItems);
      console.log(`Fetched ${newsItems.length} Esana health news items`);
      return newsItems;

    } catch (error: any) {
      console.error('Esana API error:', error?.message);
      return [];
    }
  }

  private async fetchHelakuruNews(): Promise<NewsItem[]> {
    try {
      console.log('Fetching Helakuru health news...');
      
      if (this.isCacheValid('helakuru')) {
        return newsCache['helakuru'].data;
      }

      // Try multiple approaches for Helakuru
      const approaches = [
        // Direct API call
        async () => {
          return axios.get(API_ENDPOINTS.HELAKURU, {
            timeout: CONFIG.API_TIMEOUT,
            params: { category: 'health', lang: 'si', limit: 15 },
            headers: {
              'User-Agent': this.getRandomUserAgent(),
              'Accept': 'application/json'
            }
          });
        },
        // Proxy approach
        async () => {
          const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(
            `${API_ENDPOINTS.HELAKURU}?category=health&lang=si&limit=15`
          )}`;
          const response = await axios.get(proxyUrl, { timeout: CONFIG.API_TIMEOUT * 1.5 });
          return { data: JSON.parse(response.data.contents) };
        }
      ];

      let response;
      for (const approach of approaches) {
        try {
          response = await this.retryApiCall(approach, 2);
          break;
        } catch (error) {
          console.log('Helakuru approach failed, trying next...');
        }
      }

      if (!response?.data?.articles) {
        console.warn('No articles from Helakuru API');
        return [];
      }

      const healthPosts = response.data.articles.filter((post: HelakuruPost) => {
        return this.isHealthRelated(post.title, post.description, post.category);
      });

      const newsItems: NewsItem[] = healthPosts.map((post: HelakuruPost) => ({
        title: post.title,
        link: post.url,
        source: post.source || 'Helakuru',
        date: new Date(post.publishedAt).toLocaleDateString(),
        description: post.description,
        imageUrl: post.thumbnail,
        language: /[\u0D80-\u0DFF]/.test(post.title) ? 'si' : 'en' as 'si' | 'en',
        priority: 3
      }));

      this.updateCache('helakuru', newsItems);
      console.log(`Fetched ${newsItems.length} Helakuru health news items`);
      return newsItems;

    } catch (error: any) {
      console.error('Helakuru API error:', error?.message);
      return [];
    }
  }

  private async fetchSriLankanRSSNews(): Promise<NewsItem[]> {
    try {
      console.log('Fetching Sri Lankan RSS health news...');
      
      const rssUrls = [
        API_ENDPOINTS.ADA_DERANA,
        API_ENDPOINTS.HIRU_NEWS,
        API_ENDPOINTS.LANKADEEPA
      ];

      const rssResults = await Promise.allSettled(
        rssUrls.map(async (url) => {
          try {
            const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`;
            const response = await axios.get(proxyUrl, {
              timeout: CONFIG.API_TIMEOUT,
              headers: { 'User-Agent': this.getRandomUserAgent() }
            });
            
            if (response.data?.items) {
              return response.data.items.filter((item: any) => 
                this.isHealthRelated(item.title, item.description)
              ).map((item: any) => ({
                title: item.title,
                link: item.link,
                source: new URL(url).hostname.replace('www.', ''),
                date: new Date(item.pubDate).toLocaleDateString(),
                description: item.description?.substring(0, 150) + '...',
                imageUrl: item.thumbnail,
                language: /[\u0D80-\u0DFF]/.test(item.title) ? 'si' : 'en' as 'si' | 'en',
                priority: 2
              }));
            }
            return [];
          } catch (error) {
            console.warn(`RSS fetch failed for ${url}`);
            return [];
          }
        })
      );

      const allRssNews = rssResults
        .filter(result => result.status === 'fulfilled')
        .flatMap(result => (result as PromiseFulfilledResult<NewsItem[]>).value);

      console.log(`Fetched ${allRssNews.length} RSS health news items`);
      return allRssNews;

    } catch (error: any) {
      console.error('RSS news fetch error:', error?.message);
      return [];
    }
  }

  private async fetchGlobalHealthNews(): Promise<NewsItem[]> {
    try {
      console.log('Fetching global health news...');
      
      if (this.isCacheValid('global')) {
        return newsCache['global'].data;
      }

      if (!CONFIG.NEWS_API_KEY || CONFIG.NEWS_API_KEY === 'your-api-key-here') {
        console.warn('News API key not configured');
        return [];
      }

      const response = await this.retryApiCall(async () => {
        return axios.get(API_ENDPOINTS.GLOBAL_NEWS, {
          timeout: CONFIG.API_TIMEOUT,
          params: {
            apiKey: CONFIG.NEWS_API_KEY,
            category: 'health',
            language: 'en',
            pageSize: 15
          },
          headers: { 'User-Agent': this.getRandomUserAgent() }
        });
      });

      if (!response.data?.articles) {
        console.warn('No articles from global news API');
        return [];
      }

      const healthArticles = response.data.articles.filter((article: GlobalNewsPost) => {
        return this.isHealthRelated(article.title, article.description);
      });

      const newsItems: NewsItem[] = healthArticles.map((article: GlobalNewsPost) => ({
        title: article.title,
        link: article.url,
        source: article.source.name,
        date: new Date(article.publishedAt).toLocaleDateString(),
        description: article.description,
        imageUrl: article.urlToImage,
        language: 'en' as 'en',
        priority: 4
      }));

      this.updateCache('global', newsItems);
      console.log(`Fetched ${newsItems.length} global health news items`);
      return newsItems;

    } catch (error: any) {
      console.error('Global news API error:', error?.message);
      return [];
    }
  }

  private async fetchWHONews(): Promise<NewsItem[]> {
    try {
      console.log('Fetching WHO health news...');
      
      if (this.isCacheValid('who')) {
        return newsCache['who'].data;
      }

      const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(API_ENDPOINTS.WHO_NEWS)}`;
      
      const response = await this.retryApiCall(async () => {
        return axios.get(proxyUrl, {
          timeout: CONFIG.API_TIMEOUT,
          headers: { 'User-Agent': this.getRandomUserAgent() }
        });
      });

      if (!response.data?.items) {
        console.warn('No items from WHO RSS feed');
        return [];
      }

      const newsItems: NewsItem[] = response.data.items.map((item: any) => ({
        title: item.title,
        link: item.link,
        source: 'World Health Organization',
        date: new Date(item.pubDate).toLocaleDateString(),
        description: item.description?.substring(0, 150) + '...',
        imageUrl: item.thumbnail || 'https://www.who.int/images/default-source/default-album/who-logo.jpg',
        language: 'en' as 'en',
        priority: 1 // Highest priority for WHO news
      }));

      this.updateCache('who', newsItems);
      console.log(`Fetched ${newsItems.length} WHO health news items`);
      return newsItems;

    } catch (error: any) {
      console.error('WHO news fetch error:', error?.message);
      return [];
    }
  }

  // Fallback data
  private getFallbackNews(): NewsItem[] {
    const fallbackNews: NewsItem[] = [
      {
        title: "Regular Exercise Boosts Immune System",
        link: "#",
        source: "LifeFile Health",
        date: new Date().toLocaleDateString(),
        description: "Studies show moderate exercise strengthens immune response and reduces illness risk.",
        language: "en",
        priority: 5
      },
      {
        title: "නිතිපතා ව්‍යායාම ප්‍රතිශක්තිකරණය වැඩි කරයි",
        link: "#",
        source: "LifeFile Health",
        date: new Date().toLocaleDateString(),
        description: "මධ්‍යස්ථ ව්‍යායාම ප්‍රතිශක්තිකරණය ශක්තිමත් කරන බව අධ්‍යයනවලින් පෙන්වා දෙයි.",
        language: "si",
        priority: 5
      },
      {
        title: "Heart Health: Best Foods for Cardiovascular Wellness",
        link: "#",
        source: "LifeFile Health",
        date: new Date().toLocaleDateString(),
        description: "Discover the top foods that support heart health and prevent cardiovascular disease.",
        language: "en",
        priority: 5
      },
      {
        title: "හෘද සෞඛ්‍ය: හෘද සෞඛ්‍ය සඳහා හොඳම ආහාර",
        link: "#",
        source: "LifeFile Health",
        date: new Date().toLocaleDateString(),
        description: "හෘද සෞඛ්‍ය ආරක්ෂා කරන සහ හෘද රෝග වළක්වන ප්‍රධාන ආහාර සොයා ගන්න.",
        language: "si",
        priority: 5
      }
    ];

    return fallbackNews;
  }

  // Main public method
  public async getHealthNews(): Promise<NewsItem[]> {
    try {
      console.log('Starting health news aggregation...');
      
      // Check combined cache first
      if (this.isCacheValid('combined')) {
        console.log('Using cached health news');
        return newsCache['combined'].data;
      }

      // Fetch from all sources in parallel
      const [
        esanaNews,
        helakuruNews,
        rssNews,
        whoNews,
        globalNews
      ] = await Promise.allSettled([
        this.fetchEsanaNews(),
        this.fetchHelakuruNews(),
        this.fetchSriLankanRSSNews(),
        this.fetchWHONews(),
        this.fetchGlobalHealthNews()
      ]);

      // Combine successful results
      const allNews: NewsItem[] = [
        ...(esanaNews.status === 'fulfilled' ? esanaNews.value : []),
        ...(helakuruNews.status === 'fulfilled' ? helakuruNews.value : []),
        ...(rssNews.status === 'fulfilled' ? rssNews.value : []),
        ...(whoNews.status === 'fulfilled' ? whoNews.value : []),
        ...(globalNews.status === 'fulfilled' ? globalNews.value : [])
      ];

      console.log(`Total news items fetched: ${allNews.length}`);

      // Check if we have sufficient Sri Lankan news
      const sriLankanNews = allNews.filter(news => news.language === 'si');
      const globalHealthNews = allNews.filter(news => news.language === 'en');

      let finalNews: NewsItem[] = [];

      if (sriLankanNews.length > 0) {
        // We have Sri Lankan news, use both local and global
        finalNews = [...sriLankanNews, ...globalHealthNews];
      } else {
        // No Sri Lankan news, focus on global health news
        console.log('No Sri Lankan health news available, using global health news');
        finalNews = globalHealthNews;
      }

      // Remove duplicates
      const uniqueNews = finalNews.filter((news, index, self) => 
        index === self.findIndex(n => 
          n.link === news.link || 
          (n.title.toLowerCase() === news.title.toLowerCase() && n.source === news.source)
        )
      );

      // Sort by priority (lower number = higher priority) and then by date
      uniqueNews.sort((a, b) => {
        if (a.priority !== b.priority) {
          return (a.priority || 5) - (b.priority || 5);
        }
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

      // Ensure we have minimum items
      if (uniqueNews.length < CONFIG.MIN_NEWS_ITEMS && CONFIG.USE_FALLBACK_DATA) {
        console.log('Adding fallback news to meet minimum requirement');
        const fallbackNews = this.getFallbackNews();
        uniqueNews.push(...fallbackNews.slice(0, CONFIG.MIN_NEWS_ITEMS - uniqueNews.length));
      }

      // Limit to maximum items
      const limitedNews = uniqueNews.slice(0, CONFIG.MAX_NEWS_ITEMS);

      // Update cache
      this.updateCache('combined', limitedNews);

      console.log(`Final health news count: ${limitedNews.length}`);
      return limitedNews;

    } catch (error: any) {
      console.error('Health news aggregation error:', error?.message);
      
      // Try to use expired cache as fallback
      if (newsCache['combined']?.data?.length > 0) {
        console.log('Using expired cache as fallback');
        return newsCache['combined'].data;
      }
      
      // Last resort: return fallback news
      return CONFIG.USE_FALLBACK_DATA ? this.getFallbackNews() : [];
    }
  }

  // Additional utility methods
  public clearCache(): void {
    Object.keys(newsCache).forEach(key => {
      newsCache[key] = { timestamp: 0, data: [] };
    });
    console.log('News cache cleared');
  }

  public getCacheStatus(): Record<string, { valid: boolean; itemCount: number; lastUpdated: string }> {
    const status: Record<string, { valid: boolean; itemCount: number; lastUpdated: string }> = {};
    
    Object.keys(newsCache).forEach(key => {
      const cache = newsCache[key];
      status[key] = {
        valid: this.isCacheValid(key),
        itemCount: cache.data.length,
        lastUpdated: cache.timestamp ? new Date(cache.timestamp).toLocaleString() : 'Never'
      };
    });
    
    return status;
  }
}

// Export the singleton instance
export const healthNewsService = HealthNewsService.getInstance();

// Export the main function for backward compatibility
export async function getHealthNews(): Promise<NewsItem[]> {
  return healthNewsService.getHealthNews();
}

// Export types
export type { NewsItem, EsanaPost, HelakuruPost, GlobalNewsPost };