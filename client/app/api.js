// import axios from "axios";

// // Create axios instance with default config
// const api = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002/api",
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // Request interceptor to add auth token if available
// api.interceptors.request.use(
//   (config) => {
//     // You can add auth token logic here later
//     // const token = localStorage.getItem('token');
//     // if (token) {
//     //   config.headers.Authorization = `Bearer ${token}`;
//     // }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Response interceptor for error handling
// api.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   (error) => {
//     // Handle common errors here
//     if (error.response?.status === 401) {
//       // Handle unauthorized access
//       console.error("Unauthorized access");
//     }
//     return Promise.reject(error);
//   }
// );

// // API methods for your chat app
// export const authAPI = {
//   login: (credentials) => api.post("/user/login", credentials),
//   signup: (userData) => api.post("/user/signup", userData),
//   // Add more auth methods as needed
// };

// export const userAPI = {
//   getProfile: () => api.get("/user/profile"),
//   updateProfile: (data) => api.put("/user/profile", data),
// };

// export default api;

import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log("Authentication failed - redirecting to login");

      // Redirect to login
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Authentication API functions
export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await api.post("/user/login", credentials);
      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  signup: async (userData) => {
    try {
      const response = await api.post("/user/signup", userData);
      return response.data;
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  },
};

// User management functions
export async function getAllusers() {
  try {
    const response = await api.get("/user");
    return response.data;
  } catch (error) {
    console.error("Get users error:", error);
    throw error;
  }
}

export async function getUserBYId(id) {
  try {
    const response = await api.get(`/user/${id}`);
    return response.data;
  } catch (error) {
    console.error("Get user error:", error);
    throw error;
  }
}

// Chat API functions
export async function createOrGetPrivateChat(otherUserId) {
  try {
    const response = await api.post("/chats/private", { otherUserId });
    return response.data;
  } catch (error) {
    console.error("Create or get private chat error:", error);
    throw error;
  }
}

export async function getPrivateChatById(id) {
  try {
    const response = await api.get(`/chats/${id}`);
    return response.data;
  } catch (error) {
    console.error("Get user error:", error);
    throw error;
  }
}

export async function createGroupChat(groupData) {
  try {
    const response = await api.post("/chats/group", {
      groupName: groupData.groupName,
      groupDescription: groupData.groupDescription,
    });
    return response.data;
  } catch (error) {
    console.error("Create group chat error:", error);
    throw error;
  }
}

export async function getUserChats(query) {
  try {
    const response = await api.get(`/chats/user/chats?search=${query}`);
    return response.data;
  } catch (error) {
    console.error("Get user chats error:", error);
    throw error;
  }
}

// Group API functions
export async function addUserToGroup(groupData) {
  try {
    const response = await api.put("/chats/group", {
      userId: groupData.userId,
      chatId: groupData.chatId,
    });
    return response.data;
  } catch (error) {
    console.error("Add user to group error:", error);
    throw error;
  }
}

export async function uploadFile(file) {
  try {
    const formData = new FormData();
    console.log("formData:", formData);
    formData.append("file", file);
    const response = await api.post("/chats/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Upload file error:", error);
    throw error;
  }
}