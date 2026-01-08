import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

// Configure axios to send cookies automatically
axios.defaults.withCredentials = true;

// --------- REGISTER ---------
export const registerJudge = async (username, password) => {
  const response = await axios.post(`${API_URL}/judge/register`, {
    username,
    password,
  });
  return response.data;
};

export const registerTeam = async (schoolName, password, participants) => {
  const response = await axios.post(`${API_URL}/team/register`, {
    schoolName,
    password,
    participants,
  });
  return response.data;
};

// --------- LOGIN ---------
export const loginAdmin = async (username, password) => {
  const response = await axios.post(`${API_URL}/admin/login`, {
    username,
    password,
  });
  return response.data;
};

export const loginJudge = async (username, password) => {
  const response = await axios.post(`${API_URL}/judge/login`, {
    username,
    password,
  });
  return response.data;
};

export const loginTeam = async (schoolName, password) => {
  const response = await axios.post(`${API_URL}/team/login`, {
    schoolName,
    password,
  });
  return response.data;
};

export const loginVoter = async (name, schoolName) => {
  const response = await axios.post(`${API_URL}/voter/login`, {
    name,
    schoolName,
  });
  return response.data;
};

// --------- LOGOUT ---------
export const logout = async () => {
  const response = await axios.post(`${API_URL}/logout`);
  return response.data;
};

// --------- CHECK AUTH ---------
export const checkAuth = async () => {
  try {
    const response = await axios.get(`${API_URL}/check`);
    return response.data;
  } catch (error) {
    throw error;
  }
};