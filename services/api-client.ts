import axios from 'axios';

const API_URL = 'http://localhost:3000'; // Update with your actual API URL

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// You can add interceptors here later if needed (e.g., for JWT tokens)
apiClient.interceptors.request.use(async (config) => {
  // If you want to include the Supabase session token in every request:
  // const { data: { session } } = await supabase.auth.getSession();
  // if (session?.access_token) {
  //   config.headers.Authorization = `Bearer ${session.access_token}`;
  // }
  return config;
});
