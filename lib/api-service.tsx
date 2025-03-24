import axios from "axios";
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

export const testScraper = async (
  url: string,
  actions: any[],
  cookieBannerXPaths: string[]
) => {
  return axios
    .post(`${backendUrl}/test-scraper`, {
      url,
      actions,
      cookieBannerXPaths,
    })
    .then((response) => {
      return response.data;
    });
};

export const testScraperAi = async (
  url: string,
  cookieBannerXPaths: string[]
) => {
  return axios
    .post(`${backendUrl}/test-ai`, {
      url,
      cookieBannerXPaths,
    })
    .then((response) => {
      return response.data;
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

export const sendIngredientsImage = async (image: File) => {
  const formData = new FormData();
  formData.append("image", image);

  return axios
    .post(`${backendUrl}/analyze-image`, formData)
    .then((response) => {
      return response.data.ingredients;
    })
    .catch((error) => {
      console.error(error);
      return {
        ingredients: [],
      };
    });
};
