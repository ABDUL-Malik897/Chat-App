import axios from "axios";

const API = axios.create({
    baseURL:  "http://localhost:4000" 
});
API.interceptors.request.use((req) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.token) {
        req.headers.Authorization = `Bearer ${user.token}`;
    } else {
        console.log("NO TOKEN FOUND");
    }
    return req;
});

API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (
            error.response?.status === 401 &&
            error.response?.data?.message ===
                "Session expired. Please login again."
        ) {
            localStorage.removeItem("user");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default API;