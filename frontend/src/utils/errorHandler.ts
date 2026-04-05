export const handleError = (error: any): void => {
  if (error.response) {
    console.error('API Error:', error.response.data);
  } else if (error.request) {
    console.error('Network Error:', error.message);
  } else {
    console.error('Error:', error.message);
  }
};
