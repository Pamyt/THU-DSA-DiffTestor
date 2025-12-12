import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import diffTestRouter from './routes/diffTest';

const app: Express = express();
const PORT = process.env.PORT || 3001;

// 创建必要的目录
const uploadsDir = path.join(__dirname, '../uploads');
const tempDir = path.join(__dirname, '../temp');
const resultsDir = path.join(__dirname, '../results');

[uploadsDir, tempDir, resultsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.use('/api/diff-test', diffTestRouter);

// 健康检查
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
