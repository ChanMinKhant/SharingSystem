import axios from 'axios';

const authBaseUrl = 'http://localhost:3000/auth';

const register = async (userData) => {
  try {
    const response = await axios.post(`${authBaseUrl}/register`, userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const login = async (userData) => {
  try {
    const response = await axios.post(`${authBaseUrl}/login`, userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const logout = async () => {
  try {
    const response = await axios.get(`${authBaseUrl}/logout`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const forgotPassword = async (email) => {
  try {
    const response = await axios.post(`${authBaseUrl}/forgotpassword`, {
      email,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const resetPassword = async (resetToken, newPassword) => {
  try {
    const response = await axios.patch(
      `${authBaseUrl}/resetpassword/${resetToken}`,
      { newPassword }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

const changePassword = async (passwordData) => {
  try {
    const response = await axios.patch(
      `${authBaseUrl}/changepassword`,
      passwordData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

const logoutAllDevices = async () => {
  try {
    const response = await axios.get(`${authBaseUrl}/logoutalldevices`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  logoutAllDevices,
};