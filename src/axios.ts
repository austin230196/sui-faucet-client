import axios from "axios";


export const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    validateStatus: (status: number) => {
        return status >= 200 && status < 600;
    },
    timeout: 10000,
    headers: {
        "Content-Type": "application/json"
    }
})