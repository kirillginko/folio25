// Image optimization utilities
export const optimizeCloudinaryUrl = (url, options = {}) => {
  const { width = 400, quality = 'auto:low', format = 'webp' } = options;
  
  if (!url.includes('cloudinary.com')) return url;
  
  // Extract the upload part and modify it
  const uploadIndex = url.indexOf('/upload/');
  if (uploadIndex === -1) return url;
  
  const baseUrl = url.substring(0, uploadIndex + 8);
  const remainder = url.substring(uploadIndex + 8);
  
  return `${baseUrl}q_${quality},f_${format},w_${width}/${remainder}`;
};

export const optimizeFirebaseUrl = (url, options = {}) => {
  const { width = 400, quality = 75 } = options;
  
  if (!url.includes('firebasestorage.googleapis.com')) return url;
  
  // For Firebase, we can add query parameters to optimize
  const urlObj = new URL(url);
  urlObj.searchParams.set('width', width);
  urlObj.searchParams.set('quality', quality);
  
  return urlObj.toString();
};

// Responsive image sizes for better optimization
export const getResponsiveSizes = (breakpoints = {}) => {
  const defaultBreakpoints = {
    mobile: 320,
    tablet: 768,
    desktop: 1200,
    ...breakpoints
  };
  
  return `(max-width: ${defaultBreakpoints.mobile}px) 200px, (max-width: ${defaultBreakpoints.tablet}px) 300px, (max-width: ${defaultBreakpoints.desktop}px) 400px, 500px`;
};

// Lazy loading intersection observer
export const createLazyLoadObserver = (callback, options = {}) => {
  const defaultOptions = {
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  };
  
  return new IntersectionObserver(callback, defaultOptions);
};