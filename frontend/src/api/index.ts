import axios from 'axios';
import { Problems, TestResult } from '../types';

// ======================= 修改重点 =======================
// 1. 读取环境变量中的后端域名
// 这里的 VITE_API_BASE_URL 需要你在 Zeabur 环境变量里设置
// 如果本地开发，默认回退到 localhost:3001
const BACKEND_HOST = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// 2. 拼接完整的 API 路径
// 你的后端代码里写了 app.use('/api/diff-test', ...)，所以这里要保留这个后缀
const API_BASE_URL = `${BACKEND_HOST}/api/diff-test`;
// =======================================================

export const api = {
  // 获取题目列表
  getProblems: async (): Promise<Problems> => {
    // 最终请求地址会变成：https://backend-xxx.zeabur.app/api/diff-test/problems
    const response = await axios.get(`${API_BASE_URL}/problems`);
    return response.data;
  },

  // 上传可执行文件并开始对拍
  uploadAndTest: async (pa: string, problem: number, file: File): Promise<{ testId: string }> => {
    const formData = new FormData();
    formData.append('executable', file);
    formData.append('pa', pa);
    formData.append('problem', problem.toString());

    const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 获取测试结果
  getTestResult: async (testId: string): Promise<TestResult> => {
    const response = await axios.get(`${API_BASE_URL}/result/${testId}`);
    return response.data;
  },
};