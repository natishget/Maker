import axios from "axios";

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_IS_PRODUCTION === "true"
      ? process.env.NEXT_PUBLIC_BACKEND_API
      : process.env.NEXT_PUBLIC_LOCAL_API || "",
  withCredentials: true,
});

// const api = axios.create({
//     baseURL: "http://localhost:3001",
//     withCredentials: true,
// });

export default api;
