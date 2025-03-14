import axios from "axios";

// Use NEXT_PUBLIC prefix for client-side environment variables in Next.js
const backendUrl = process.env.NEXT_PUBLIC_API_URL;

export const getStatus = async () => {
  return axios
    .post(`${backendUrl}/status`)
    .then((response) => {
      if (response.status === 200) {
        return true;
      }
      return false;
    })
    .catch((error) => {
      console.error(error);
      return false;
    });
};

export const testScraper = async (url: string, actions: any[]) => {
  return axios
    .post(`${backendUrl}/test-scraper`, {
      url,
      actions,
    })
    .then((response) => {
      // Return the response data directly to preserve the exact format
      // Expected format: { price: number, error: { text: string, index: number, screenshot: string } }
      return response.data;
    })
    .catch((error) => {
      console.error(error);
      return {
        price: 0,
        error: {
          text: error.message || "Failed to connect to the server",
          index: 0,
          screenshot: null,
        },
      };
    });
};

export const pushToWordpress = async (url: string, actions: any[]) => {
  return axios
    .post(`${backendUrl}/push-to-wordpress`, {
      url,
      actions,
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error(error);
      return false;
    });
};

export const scrapeAll = async () => {
  return axios
    .post(`${backendUrl}/scrape-all`)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error(error);
      return false;
    });
};
