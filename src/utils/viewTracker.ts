// View tracking utility using localStorage
const VIEW_STORAGE_KEY = 'story_views';
const USER_VIEWS_KEY = 'user_viewed_stories';

interface ViewData {
  [storyId: string]: number;
}

interface UserViewData {
  [storyId: string]: boolean;
}

// Get current view counts from localStorage
export function getViewCounts(): ViewData {
  try {
    const stored = localStorage.getItem(VIEW_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

// Get user's viewed stories
export function getUserViews(): UserViewData {
  try {
    const stored = localStorage.getItem(USER_VIEWS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

// Save view counts to localStorage
function saveViewCounts(views: ViewData): void {
  try {
    localStorage.setItem(VIEW_STORAGE_KEY, JSON.stringify(views));
  } catch {
    // Silently fail if localStorage is not available
  }
}

// Save user views to localStorage
function saveUserViews(userViews: UserViewData): void {
  try {
    localStorage.setItem(USER_VIEWS_KEY, JSON.stringify(userViews));
  } catch {
    // Silently fail if localStorage is not available
  }
}

// Increment view count for a story
export function incrementViewCount(storyId: string): number {
  const views = getViewCounts();
  const userViews = getUserViews();
  
  // Only increment if user hasn't viewed this story before
  if (!userViews[storyId]) {
    views[storyId] = (views[storyId] || 0) + 1;
    userViews[storyId] = true;
    
    saveViewCounts(views);
    saveUserViews(userViews);
  }
  
  return views[storyId] || 0;
}

// Get view count for a specific story
export function getViewCount(storyId: string): number {
  const views = getViewCounts();
  return views[storyId] || 0;
}

// Initialize default view counts for existing stories
export function initializeViewCounts(storyIds: string[]): void {
  const views = getViewCounts();
  let hasChanges = false;
  
  storyIds.forEach(storyId => {
    if (!(storyId in views)) {
      // Set random initial view count between 50-500 for existing stories
      views[storyId] = Math.floor(Math.random() * 450) + 50;
      hasChanges = true;
    }
  });
  
  if (hasChanges) {
    saveViewCounts(views);
  }
}