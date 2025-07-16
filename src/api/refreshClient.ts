import axios from "axios";

// 创建一个专门用于刷新 token 的 axios 实例
export const refreshClient = axios.create({
	baseURL: import.meta.env.VITE_APP_BASE_API,
	timeout: 50000,
	headers: { "Content-Type": "application/json;charset=utf-8" },
});

export default refreshClient;
