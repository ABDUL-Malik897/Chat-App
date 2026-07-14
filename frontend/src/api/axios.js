import axios from "axios";

const API = axios.create({
    baseURL: ["http://localhost:4000",process.env.REACT_APP_API_URL_DEPLOY]
});

API.interceptors.request.use((req) => {
    const user = JSON.parse(localStorage.getItem("user"));

    // console.log("INTERCEPTOR USER:", user);

    if (user?.token) {
        req.headers.Authorization = `Bearer ${user.token}`;
        // console.log("TOKEN SENT:", user.token);
    } else {
        console.log("NO TOKEN FOUND");
    }

    return req;
});

export default API;