//export const GA_MEASUREMENT_ID ='G-5JXQDVYBK3';
export const GA_MEASUREMENT_ID ='';

// Log the pageview with a specific path
export const pageview = (url) => {
  if (window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
};

// Log specific events
// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = ({ action, category, label, value }) => {
  if (window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value, // Optional: a numerical value
    });
  }
};