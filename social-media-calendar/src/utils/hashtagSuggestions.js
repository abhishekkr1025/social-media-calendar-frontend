/**
 * Hashtag Suggestions Utility
 * 
 * Provides relevant hashtag suggestions based on content and industry
 */

export const HASHTAG_CATEGORIES = {
  business: [
    '#Business', '#Entrepreneur', '#Success', '#Marketing', '#BusinessTips',
    '#SmallBusiness', '#Startup', '#Leadership', '#Innovation', '#Growth',
    '#BusinessOwner', '#Entrepreneurship', '#Strategy', '#BusinessGrowth', '#CEO'
  ],
  
  technology: [
    '#Tech', '#Technology', '#Innovation', '#AI', '#MachineLearning',
    '#Software', '#Coding', '#Programming', '#Developer', '#TechNews',
    '#Digital', '#Cloud', '#Cybersecurity', '#DataScience', '#IoT'
  ],
  
  marketing: [
    '#Marketing', '#DigitalMarketing', '#SocialMedia', '#ContentMarketing', '#SEO',
    '#Branding', '#Advertising', '#MarketingStrategy', '#OnlineMarketing', '#Growth',
    '#SocialMediaMarketing', '#EmailMarketing', '#MarketingTips', '#Brand', '#Content'
  ],
  
  fitness: [
    '#Fitness', '#Workout', '#Health', '#Gym', '#FitnessMotivation',
    '#HealthyLifestyle', '#Exercise', '#Training', '#FitLife', '#Wellness',
    '#FitnessGoals', '#HealthyLiving', '#FitFam', '#GymLife', '#Nutrition'
  ],
  
  food: [
    '#Food', '#Foodie', '#Delicious', '#Yummy', '#FoodPorn',
    '#Cooking', '#Recipe', '#Homemade', '#FoodPhotography', '#Tasty',
    '#FoodLover', '#Instafood', '#Chef', '#Foodstagram', '#Eat'
  ],
  
  travel: [
    '#Travel', '#TravelPhotography', '#Wanderlust', '#Adventure', '#Explore',
    '#TravelGram', '#Vacation', '#Tourism', '#TravelBlogger', '#Traveling',
    '#TravelTheWorld', '#Destination', '#Trip', '#TravelAddict', '#Traveler'
  ],
  
  fashion: [
    '#Fashion', '#Style', '#OOTD', '#FashionBlogger', '#Fashionista',
    '#InstaFashion', '#FashionStyle', '#Outfit', '#Trendy', '#FashionWeek',
    '#StreetStyle', '#FashionPhotography', '#FashionDesign', '#StyleInspo', '#Look'
  ],
  
  photography: [
    '#Photography', '#Photo', '#Photographer', '#PhotoOfTheDay', '#InstaPhoto',
    '#PicOfTheDay', '#PhotoShoot', '#Camera', '#Art', '#Portrait',
    '#NaturePhotography', '#PhotographyLovers', '#Canon', '#Nikon', '#PhotographyLife'
  ],
  
  motivation: [
    '#Motivation', '#Inspiration', '#Success', '#Goals', '#Mindset',
    '#MotivationalQuotes', '#Inspire', '#SuccessQuotes', '#Believe', '#Dream',
    '#PositiveVibes', '#Hustle', '#Grind', '#NeverGiveUp', '#KeepGoing'
  ],
  
  lifestyle: [
    '#Lifestyle', '#Life', '#LifestyleBlogger', '#Daily', '#Instagood',
    '#LifestylePhotography', '#LifestyleDesign', '#HealthyLifestyle', '#Vibe', '#Mood',
    '#LifestyleBlog', '#LifestyleGoals', '#Aesthetic', '#Vibes', '#DailyLife'
  ],
  
  ecommerce: [
    '#Shop', '#Shopping', '#OnlineShopping', '#Sale', '#ShopNow',
    '#Ecommerce', '#OnlineStore', '#ShopSmall', '#ShopLocal', '#Deal',
    '#Discount', '#NewArrival', '#LimitedEdition', '#FreeShipping', '#BuyNow'
  ],
  
  realestate: [
    '#RealEstate', '#Property', '#Home', '#House', '#Realtor',
    '#RealEstateAgent', '#HomesForSale', '#RealEstateLife', '#Investment', '#Luxury',
    '#DreamHome', '#HouseHunting', '#PropertyForSale', '#RealEstateInvesting', '#NewHome'
  ]
};

/**
 * Get trending hashtags (simulated - in production, fetch from API)
 */
export const getTrendingHashtags = () => {
  return [
    '#Trending', '#Viral', '#FYP', '#ForYou', '#Explore',
    '#TrendingNow', '#ViralPost', '#Popular', '#Hot', '#MustSee'
  ];
};

/**
 * Get seasonal hashtags based on current date
 */
export const getSeasonalHashtags = () => {
  const month = new Date().getMonth();
  
  const seasonal = {
    0: ['#NewYear', '#January', '#NewYearNewMe', '#Goals2025', '#FreshStart'], // January
    1: ['#February', '#ValentinesDay', '#Love', '#Romance', '#Hearts'], // February
    2: ['#March', '#Spring', '#SpringTime', '#StPatricksDay', '#SpringVibes'], // March
    3: ['#April', '#Spring', '#Easter', '#AprilShowers', '#Springtime'], // April
    4: ['#May', '#Spring', '#MothersDay', '#Memorial Day', '#SpringSeason'], // May
    5: ['#June', '#Summer', '#SummerVibes', '#FathersDay', '#SummerTime'], // June
    6: ['#July', '#Summer', '#FourthOfJuly', '#IndependenceDay', '#SummerFun'], // July
    7: ['#August', '#Summer', '#SummerEnd', '#BackToSchool', '#SummerMemories'], // August
    8: ['#September', '#Fall', '#Autumn', '#FallVibes', '#BackToSchool'], // September
    9: ['#October', '#Fall', '#Halloween', '#Spooky', '#AutumnVibes'], // October
    10: ['#November', '#Fall', '#Thanksgiving', '#Grateful', '#FallSeason'], // November
    11: ['#December', '#Winter', '#Christmas', '#Holidays', '#NewYear'] // December
  };
  
  return seasonal[month] || [];
};

/**
 * Extract keywords from content
 */
export const extractKeywords = (content) => {
  if (!content) return [];
  
  // Remove common words
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'is', 'are', 'was', 'were', 'be', 'been', 'being'];
  
  // Extract words
  const words = content.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.includes(word));
  
  // Count frequency
  const frequency = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });
  
  // Sort by frequency
  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
};

/**
 * Generate hashtag suggestions based on content and category
 */
export const generateHashtagSuggestions = (content, category = null, maxSuggestions = 15) => {
  const suggestions = new Set();
  
  // Add category-specific hashtags
  if (category && HASHTAG_CATEGORIES[category]) {
    HASHTAG_CATEGORIES[category].slice(0, 8).forEach(tag => suggestions.add(tag));
  }
  
  // Add trending hashtags
  getTrendingHashtags().slice(0, 3).forEach(tag => suggestions.add(tag));
  
  // Add seasonal hashtags
  getSeasonalHashtags().slice(0, 2).forEach(tag => suggestions.add(tag));
  
  // Generate hashtags from keywords
  if (content) {
    const keywords = extractKeywords(content);
    keywords.forEach(keyword => {
      const hashtag = '#' + keyword.charAt(0).toUpperCase() + keyword.slice(1);
      suggestions.add(hashtag);
    });
  }
  
  // Convert to array and limit
  return Array.from(suggestions).slice(0, maxSuggestions);
};

/**
 * Analyze hashtag performance (simulated)
 */
export const analyzeHashtagPerformance = (hashtag) => {
  // In production, this would fetch real data from social media APIs
  const popularity = Math.floor(Math.random() * 100);
  const competition = Math.floor(Math.random() * 100);
  
  return {
    hashtag,
    popularity,
    competition,
    score: Math.floor((popularity + (100 - competition)) / 2),
    recommendation: popularity > 70 && competition < 50 ? 'Highly Recommended' :
                    popularity > 50 ? 'Recommended' :
                    'Consider Alternatives'
  };
};

/**
 * Get optimal hashtag count for platform
 */
export const getOptimalHashtagCount = (platform) => {
  const optimal = {
    instagram: { min: 11, max: 30, recommended: 20 },
    twitter: { min: 1, max: 2, recommended: 2 },
    facebook: { min: 1, max: 3, recommended: 2 },
    linkedin: { min: 3, max: 5, recommended: 4 },
    youtube: { min: 5, max: 15, recommended: 10 }
  };
  
  return optimal[platform] || { min: 1, max: 5, recommended: 3 };
};

/**
 * Format hashtags for different platforms
 */
export const formatHashtagsForPlatform = (hashtags, platform) => {
  const count = getOptimalHashtagCount(platform);
  const selected = hashtags.slice(0, count.recommended);
  
  switch (platform) {
    case 'instagram':
      // Instagram: hashtags at the end, separated by spaces
      return '\n\n' + selected.join(' ');
    
    case 'twitter':
      // Twitter: integrated into text or at end
      return ' ' + selected.join(' ');
    
    case 'linkedin':
      // LinkedIn: hashtags at the end, separated by spaces
      return '\n\n' + selected.join(' ');
    
    case 'facebook':
      // Facebook: minimal hashtags
      return '\n\n' + selected.join(' ');
    
    case 'youtube':
      // YouTube: comma-separated in description
      return '\n\nTags: ' + selected.map(h => h.replace('#', '')).join(', ');
    
    default:
      return '\n\n' + selected.join(' ');
  }
};

/**
 * Validate hashtag
 */
export const validateHashtag = (hashtag) => {
  // Remove # if present
  const tag = hashtag.replace(/^#/, '');
  
  // Check rules
  const rules = {
    minLength: tag.length >= 2,
    maxLength: tag.length <= 30,
    noSpaces: !/\s/.test(tag),
    noSpecialChars: /^[a-zA-Z0-9_]+$/.test(tag),
    notOnlyNumbers: !/^\d+$/.test(tag)
  };
  
  const isValid = Object.values(rules).every(r => r);
  
  return {
    isValid,
    rules,
    formatted: isValid ? '#' + tag : null
  };
};

/**
 * Get hashtag suggestions for multiple platforms
 */
export const getMultiPlatformHashtags = (content, category, platforms) => {
  const baseHashtags = generateHashtagSuggestions(content, category, 30);
  
  const result = {};
  platforms.forEach(platform => {
    const count = getOptimalHashtagCount(platform);
    result[platform] = baseHashtags.slice(0, count.recommended);
  });
  
  return result;
};

