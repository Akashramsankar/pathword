export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-5JXQDVYBK3';

// Log the pageview with a specific path
export const pageview = (url) => {
  if (GA_MEASUREMENT_ID && GA_MEASUREMENT_ID !== 'G-5JXQDVYBK3' && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
};

// Log specific events
// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = ({ action, category, label, value }) => {
  if (GA_MEASUREMENT_ID && GA_MEASUREMENT_ID !== 'G-5JXQDVYBK3' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value, // Optional: a numerical value
    });
  }
};