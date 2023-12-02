import apiService from './apiService';

const hostBaseUrl = '/host';

const createHost = async (formData) => {
  try {
    const response = await apiService.post(`${hostBaseUrl}`, formData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getHosts = async () => {
  try {
    const response = await apiService.get(`${hostBaseUrl}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getHost = async (domain) => {
  try {
    const response = await apiService.get(
      `${hostBaseUrl}/${domain}/?start=${true}`
    );
  } catch (error) {
    throw error;
  }
};

export { createHost, getHost, getHosts };
