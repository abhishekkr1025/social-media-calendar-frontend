/**
 * Bulk Operations Utility
 * 
 * Import/export posts in various formats (CSV, JSON, Excel-compatible)
 */

/**
 * Export posts to CSV format
 */
export const exportToCSV = (posts) => {
  if (!posts || posts.length === 0) {
    throw new Error('No posts to export');
  }

  // CSV headers
  const headers = ['Client', 'Date', 'Time', 'Content', 'Platforms', 'Status'];
  
  // Convert posts to CSV rows
  const rows = posts.map(post => {
    const now = Date.now();
    const postTime = new Date(`${post.date} ${post.time}`).getTime();
    const status = post.failed ? 'Failed' : (postTime < now ? 'Published' : 'Scheduled');
    
    return [
      post.clientName,
      post.date,
      post.time,
      `"${post.content.replace(/"/g, '""')}"`, // Escape quotes
      post.platforms.join(';'),
      status
    ];
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  return csvContent;
};

/**
 * Export posts to JSON format
 */
export const exportToJSON = (posts) => {
  if (!posts || posts.length === 0) {
    throw new Error('No posts to export');
  }

  return JSON.stringify(posts, null, 2);
};

/**
 * Import posts from CSV format
 */
export const importFromCSV = (csvContent) => {
  const lines = csvContent.trim().split('\n');
  
  if (lines.length < 2) {
    throw new Error('CSV file is empty or invalid');
  }

  // Parse headers
  const headers = lines[0].split(',').map(h => h.trim());
  
  // Validate required columns
  const requiredColumns = ['Client', 'Date', 'Time', 'Content', 'Platforms'];
  const missingColumns = requiredColumns.filter(col => !headers.includes(col));
  
  if (missingColumns.length > 0) {
    throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
  }

  // Parse rows
  const posts = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Parse CSV line (handle quoted fields)
    const values = parseCSVLine(line);
    
    if (values.length < requiredColumns.length) {
      console.warn(`Skipping invalid row ${i}: insufficient columns`);
      continue;
    }

    const post = {
      id: Date.now() + i,
      clientName: values[headers.indexOf('Client')],
      date: values[headers.indexOf('Date')],
      time: values[headers.indexOf('Time')],
      content: values[headers.indexOf('Content')].replace(/""/g, '"'), // Unescape quotes
      platforms: values[headers.indexOf('Platforms')].split(';').map(p => p.trim()),
      createdAt: new Date().toISOString()
    };

    // Validate post data
    if (validatePost(post)) {
      posts.push(post);
    } else {
      console.warn(`Skipping invalid row ${i}: validation failed`);
    }
  }

  return posts;
};

/**
 * Import posts from JSON format
 */
export const importFromJSON = (jsonContent) => {
  try {
    const data = JSON.parse(jsonContent);
    
    if (!Array.isArray(data)) {
      throw new Error('JSON must contain an array of posts');
    }

    // Validate and process each post
    const posts = data.map((post, index) => {
      if (!validatePost(post)) {
        throw new Error(`Invalid post at index ${index}`);
      }
      
      return {
        ...post,
        id: post.id || Date.now() + index,
        createdAt: post.createdAt || new Date().toISOString()
      };
    });

    return posts;
  } catch (err) {
    throw new Error(`JSON parsing failed: ${err.message}`);
  }
};

/**
 * Parse a CSV line handling quoted fields
 */
const parseCSVLine = (line) => {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // Add last field
  values.push(current.trim());

  return values;
};

/**
 * Validate post data
 */
const validatePost = (post) => {
  if (!post.clientName || typeof post.clientName !== 'string') return false;
  if (!post.date || !isValidDate(post.date)) return false;
  if (!post.time || !isValidTime(post.time)) return false;
  if (!post.content || typeof post.content !== 'string') return false;
  if (!Array.isArray(post.platforms) || post.platforms.length === 0) return false;
  
  return true;
};

/**
 * Validate date format (YYYY-MM-DD)
 */
const isValidDate = (dateString) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

/**
 * Validate time format (HH:MM)
 */
const isValidTime = (timeString) => {
  const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return regex.test(timeString);
};

/**
 * Download file to user's computer
 */
export const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export posts to CSV and download
 */
export const exportAndDownloadCSV = (posts, filename) => {
  const csv = exportToCSV(posts);
  const date = new Date().toISOString().split('T')[0];
  downloadFile(csv, filename || `social-media-posts-${date}.csv`, 'text/csv');
};

/**
 * Export posts to JSON and download
 */
export const exportAndDownloadJSON = (posts, filename) => {
  const json = exportToJSON(posts);
  const date = new Date().toISOString().split('T')[0];
  downloadFile(json, filename || `social-media-posts-${date}.json`, 'application/json');
};

/**
 * Read file content
 */
export const readFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      resolve(e.target.result);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Import posts from file
 */
export const importFromFile = async (file) => {
  const content = await readFile(file);
  const extension = file.name.split('.').pop().toLowerCase();

  switch (extension) {
    case 'csv':
      return importFromCSV(content);
    
    case 'json':
      return importFromJSON(content);
    
    default:
      throw new Error(`Unsupported file format: ${extension}`);
  }
};

/**
 * Generate CSV template for import
 */
export const generateCSVTemplate = () => {
  const headers = ['Client', 'Date', 'Time', 'Content', 'Platforms'];
  const examples = [
    ['Acme Corp', '2025-10-15', '10:00', 'Check out our new product!', 'facebook;instagram;twitter'],
    ['Tech Startup', '2025-10-16', '14:30', 'Join us for our webinar on AI', 'linkedin;twitter'],
    ['Fashion Brand', '2025-10-17', '09:00', 'New collection launching soon! #Fashion', 'instagram;facebook']
  ];

  const csvContent = [
    headers.join(','),
    ...examples.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csvContent;
};

/**
 * Download CSV template
 */
export const downloadCSVTemplate = () => {
  const template = generateCSVTemplate();
  downloadFile(template, 'social-media-posts-template.csv', 'text/csv');
};

/**
 * Duplicate posts with date offset
 */
export const duplicatePosts = (posts, daysOffset = 7) => {
  return posts.map(post => {
    const originalDate = new Date(post.date);
    const newDate = new Date(originalDate);
    newDate.setDate(newDate.getDate() + daysOffset);

    return {
      ...post,
      id: Date.now() + Math.random(),
      date: newDate.toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };
  });
};

/**
 * Merge imported posts with existing posts
 */
export const mergePosts = (existingPosts, newPosts, strategy = 'append') => {
  switch (strategy) {
    case 'append':
      // Add new posts to existing
      return [...existingPosts, ...newPosts];
    
    case 'replace':
      // Replace all existing posts
      return newPosts;
    
    case 'update':
      // Update existing posts with matching IDs, add new ones
      const existingIds = new Set(existingPosts.map(p => p.id));
      const updated = existingPosts.map(existing => {
        const match = newPosts.find(p => p.id === existing.id);
        return match || existing;
      });
      const newOnly = newPosts.filter(p => !existingIds.has(p.id));
      return [...updated, ...newOnly];
    
    default:
      throw new Error(`Unknown merge strategy: ${strategy}`);
  }
};

/**
 * Filter posts by date range
 */
export const filterPostsByDateRange = (posts, startDate, endDate) => {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();

  return posts.filter(post => {
    const postDate = new Date(post.date).getTime();
    return postDate >= start && postDate <= end;
  });
};

/**
 * Get import/export statistics
 */
export const getImportExportStats = (posts) => {
  const clients = new Set(posts.map(p => p.clientName));
  const platforms = new Set(posts.flatMap(p => p.platforms));
  const dateRange = posts.length > 0 ? {
    earliest: Math.min(...posts.map(p => new Date(p.date).getTime())),
    latest: Math.max(...posts.map(p => new Date(p.date).getTime()))
  } : null;

  return {
    totalPosts: posts.length,
    uniqueClients: clients.size,
    uniquePlatforms: platforms.size,
    dateRange: dateRange ? {
      start: new Date(dateRange.earliest).toISOString().split('T')[0],
      end: new Date(dateRange.latest).toISOString().split('T')[0]
    } : null
  };
};

