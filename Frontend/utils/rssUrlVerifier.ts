// utils/rssUrlVerifier.ts
import axios from 'axios';

interface RSSVerificationResult {
  url: string;
  name: string;
  status: 'success' | 'failed' | 'invalid';
  statusCode?: number;
  error?: string;
  itemCount?: number;
  responseTime?: number;
  contentType?: string;
  isValidRSS?: boolean;
}

class RSSUrlVerifier {
  private timeout: number = 8000;
  private maxRetries: number = 2;

  // Verify a single RSS URL
  async verifyRSSUrl(url: string, name: string): Promise<RSSVerificationResult> {
    const startTime = Date.now();
    
    try {
      console.log(`🔍 Verifying RSS: ${name} - ${url}`);
      
      const response = await axios.get(url, {
        timeout: this.timeout,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache'
        },
        maxRedirects: 5,
        validateStatus: (status) => status < 500 // Accept 4xx as valid response to check
      });

      const responseTime = Date.now() - startTime;
      const contentType = response.headers['content-type'] || '';
      
      if (response.status >= 400) {
        return {
          url,
          name,
          status: 'failed',
          statusCode: response.status,
          error: `HTTP ${response.status}`,
          responseTime,
          contentType
        };
      }

      // Check if response contains RSS/XML content
      const isValidRSS = this.isValidRSSContent(response.data);
      const itemCount = this.countRSSItems(response.data);

      return {
        url,
        name,
        status: isValidRSS ? 'success' : 'invalid',
        statusCode: response.status,
        responseTime,
        contentType,
        isValidRSS,
        itemCount
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      return {
        url,
        name,
        status: 'failed',
        error: errorMessage,
        responseTime
      };
    }
  }

  // Verify multiple RSS URLs
  async verifyMultipleRSSUrls(sources: {name: string, url: string}[]): Promise<RSSVerificationResult[]> {
    console.log(`🔍 Verifying ${sources.length} RSS URLs...`);
    
    const results: RSSVerificationResult[] = [];
    
    // Process in batches to avoid overwhelming servers
    const batchSize = 3;
    for (let i = 0; i < sources.length; i += batchSize) {
      const batch = sources.slice(i, i + batchSize);
      
      const batchPromises = batch.map(source => 
        this.verifyRSSUrl(source.url, source.name)
      );
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            url: batch[index].url,
            name: batch[index].name,
            status: 'failed',
            error: 'Promise rejected'
          });
        }
      });
      
      // Wait between batches
      if (i + batchSize < sources.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }

  // Check if content is valid RSS/XML
  private isValidRSSContent(content: string): boolean {
    if (!content || typeof content !== 'string') return false;
    
    const cleanContent = content.trim().toLowerCase();
    
    // Check for RSS/XML indicators
    const rssIndicators = [
      '<rss',
      '<feed',
      '<channel',
      '<?xml',
      'xmlns',
      '<item',
      '<entry'
    ];
    
    return rssIndicators.some(indicator => cleanContent.includes(indicator));
  }

  // Count RSS items in content
  private countRSSItems(content: string): number {
    if (!content || typeof content !== 'string') return 0;
    
    const itemPatterns = [
      /<item[^>]*>[\s\S]*?<\/item>/gi,
      /<entry[^>]*>[\s\S]*?<\/entry>/gi
    ];
    
    for (const pattern of itemPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        return matches.length;
      }
    }
    
    return 0;
  }

  // Generate verification report
  generateReport(results: RSSVerificationResult[]): string {
    const successful = results.filter(r => r.status === 'success');
    const failed = results.filter(r => r.status === 'failed');
    const invalid = results.filter(r => r.status === 'invalid');
    
    let report = `\n📊 RSS URL Verification Report\n`;
    report += `=====================================\n`;
    report += `Total URLs tested: ${results.length}\n`;
    report += `✅ Successful: ${successful.length}\n`;
    report += `❌ Failed: ${failed.length}\n`;
    report += `⚠️  Invalid RSS: ${invalid.length}\n\n`;
    
    if (successful.length > 0) {
      report += `✅ WORKING RSS FEEDS:\n`;
      report += `----------------------\n`;
      successful.forEach(result => {
        report += `• ${result.name}\n`;
        report += `  URL: ${result.url}\n`;
        report += `  Items: ${result.itemCount || 0}\n`;
        report += `  Response Time: ${result.responseTime}ms\n`;
        report += `  Content Type: ${result.contentType || 'N/A'}\n\n`;
      });
    }
    
    if (failed.length > 0) {
      report += `❌ FAILED RSS FEEDS:\n`;
      report += `---------------------\n`;
      failed.forEach(result => {
        report += `• ${result.name}\n`;
        report += `  URL: ${result.url}\n`;
        report += `  Error: ${result.error || 'Unknown error'}\n`;
        report += `  Status Code: ${result.statusCode || 'N/A'}\n\n`;
      });
    }
    
    if (invalid.length > 0) {
      report += `⚠️  INVALID RSS CONTENT:\n`;
      report += `------------------------\n`;
      invalid.forEach(result => {
        report += `• ${result.name}\n`;
        report += `  URL: ${result.url}\n`;
        report += `  Issue: Content doesn't appear to be valid RSS/XML\n\n`;
      });
    }
    
    return report;
  }

  // Get alternative RSS URLs for common news sources
  getAlternativeRSSUrls(): Record<string, string[]> {
    return {
      'BBC Health': [
        'https://feeds.bbci.co.uk/news/health/rss.xml',
        'https://feeds.bbci.co.uk/news/rss.xml',
        'https://www.bbc.com/news/health/rss.xml'
      ],
      'CNN Health': [
        'http://rss.cnn.com/rss/edition_health.rss',
        'https://rss.cnn.com/rss/edition_health.rss',
        'http://rss.cnn.com/rss/cnn_health.rss'
      ],
      'Reuters Health': [
        'https://www.reuters.com/arc/outboundfeeds/rss/category/health/?outputType=xml',
        'https://feeds.reuters.com/reuters/health',
        'https://www.reuters.com/tools/rss/health'
      ],
      'Ada Derana': [
        'https://www.adaderana.lk/rss.php',
        'https://adaderana.lk/rss.php',
        'http://www.adaderana.lk/rss.php'
      ],
      'Daily Mirror': [
        'https://www.dailymirror.lk/rss',
        'https://dailymirror.lk/rss',
        'http://www.dailymirror.lk/rss'
      ],
      'Divaina': [
        'https://divaina.lk/feed/',
        'https://www.divaina.lk/feed',
        'http://divaina.lk/feed/'
      ],
      'Medical News Today': [
        'https://www.medicalnewstoday.com/news-sitemap.xml',
        'https://www.medicalnewstoday.com/content.xml',
        'https://www.medicalnewstoday.com/news/feed'
      ]
    };
  }
}

// Test function to verify current RSS URLs
export async function testCurrentRSSUrls(): Promise<void> {
  const verifier = new RSSUrlVerifier();
  
  const testUrls = [
    { name: 'BBC Health', url: 'https://feeds.bbci.co.uk/news/health/rss.xml' },
    { name: 'Ada Derana', url: 'https://www.adaderana.lk/rss.php' },
    { name: 'Daily Mirror', url: 'https://www.dailymirror.lk/rss' },
    { name: 'Ceylon Today', url: 'https://www.ceylontoday.lk/rss' },
    { name: 'Daily FT', url: 'https://www.ft.lk/rss' },
    { name: 'Medical News Today', url: 'https://www.medicalnewstoday.com/news-sitemap.xml' },
    { name: 'Healthline', url: 'https://www.healthline.com/rss/health-news' },
    { name: 'WebMD', url: 'https://www.webmd.com/rss/rss.aspx?RSSSource=RSS_PUBLIC' },
    { name: 'CNN Health (Test)', url: 'http://rss.cnn.com/rss/edition_health.rss' },
    { name: 'Hiru News (Test)', url: 'https://www.hirunews.lk/rss' },
    { name: 'Divaina', url: 'https://divaina.lk/feed/' }
  ];
  
  const results = await verifier.verifyMultipleRSSUrls(testUrls);
  const report = verifier.generateReport(results);
  
  console.log(report);
  
  // Return working URLs
  const workingUrls = results
    .filter(r => r.status === 'success')
    .map(r => ({ name: r.name, url: r.url, itemCount: r.itemCount }));
  
  console.log('\n🔧 RECOMMENDED RSS CONFIGURATION:');
  console.log('==================================');
  workingUrls.forEach(source => {
    console.log(`✅ ${source.name}: ${source.url} (${source.itemCount} items)`);
  });
}

// Test function to verify specific RSS URL
export async function testSpecificRSSUrl(sourceName: string, url: string): Promise<void> {
  const verifier = new RSSUrlVerifier();
  
  console.log(`🔍 Testing specific RSS URL for ${sourceName}: ${url}`);
  
  const result = await verifier.verifyRSSUrl(url, sourceName);
  
  console.log('\n📊 TEST RESULT:');
  console.log('===============');
  console.log(`Source: ${sourceName}`);
  console.log(`URL: ${url}`);
  console.log(`Status: ${result.status}`);
  
  if (result.status === 'success') {
    console.log(`Items Found: ${result.itemCount || 0}`);
    console.log(`Response Time: ${result.responseTime}ms`);
    console.log(`Content Type: ${result.contentType || 'N/A'}`);
    console.log('\n✅ This RSS URL is working correctly!');
  } else if (result.status === 'failed') {
    console.log(`Error: ${result.error || 'Unknown error'}`);
    console.log(`Status Code: ${result.statusCode || 'N/A'}`);
    
    // Suggest alternatives
    const alternatives = verifier.getAlternativeRSSUrls()[sourceName] || [];
    if (alternatives.length > 0) {
      console.log('\n🔄 Suggested Alternative URLs:');
      alternatives.forEach((altUrl, index) => {
        console.log(`${index + 1}. ${altUrl}`);
      });
    }
    
    console.log('\n❌ This RSS URL is not working!');
  } else {
    console.log('Content is not valid RSS format.');
    console.log('\n⚠️ This URL may not be a proper RSS feed!');
  }
}

// Verify all currently configured feeds in newsService without requiring file system access
export async function verifyConfiguredFeeds(): Promise<void> {
  const verifier = new RSSUrlVerifier();
  
  // Use hardcoded test URLs based on common sources in the app
  const testSources = [
    { name: 'BBC Health', url: 'https://feeds.bbci.co.uk/news/health/rss.xml' },
    { name: 'Ada Derana', url: 'https://www.adaderana.lk/rss.php' },
    { name: 'Daily Mirror', url: 'https://www.dailymirror.lk/rss' },
    { name: 'Ceylon Today', url: 'https://www.ceylontoday.lk/rss' },
    { name: 'Daily FT', url: 'https://www.ft.lk/rss' },
    { name: 'Medical News Today', url: 'https://www.medicalnewstoday.com/news-sitemap.xml' },
    { name: 'Healthline', url: 'https://www.healthline.com/rss/health-news' },
    { name: 'WebMD', url: 'https://www.webmd.com/rss/rss.aspx?RSSSource=RSS_PUBLIC' },
    { name: 'CNN Health', url: 'http://rss.cnn.com/rss/edition_health.rss' },
    { name: 'Hiru News', url: 'https://www.hirunews.lk/rss' },
    { name: 'Divaina', url: 'https://divaina.lk/feed/' }
  ];
  
  try {
    // Verify the sources
    console.log(`🔍 Verifying ${testSources.length} common news sources...`);
    
    const results = await verifier.verifyMultipleRSSUrls(testSources);
    const report = verifier.generateReport(results);
    
    console.log(report);
    
    // Suggest fixes for failing feeds
    const failed = results.filter(r => r.status === 'failed');
    
    if (failed.length > 0) {
      console.log('\n🔧 SUGGESTED FIXES:');
      console.log('===================');
      
      for (const feed of failed) {
        console.log(`\n❌ ${feed.name} (${feed.url}):`);
        console.log(`   Error: ${feed.error || 'Unknown error'}`);
        
        // Check for alternatives
        const alternatives = verifier.getAlternativeRSSUrls()[feed.name] || [];
        if (alternatives.length > 0) {
          console.log('   Try these alternatives:');
          for (const alt of alternatives) {
            if (alt !== feed.url) {
              console.log(`   • ${alt}`);
            }
          }
        }
      }
      
      console.log('\nTo fix, update the corresponding entries in newsService.ts');
    } else {
      console.log('\n✅ All RSS feeds are working!');
    }
    
  } catch (error) {
    console.error('❌ Error verifying configured feeds:', error);
  }
}

export default RSSUrlVerifier;