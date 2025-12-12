import express, { Request, Response, Router } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { runDiffTest, getTestResult } from '../services/diffTestService';
import { PROBLEMS } from '../config/problems';

const router: Router = express.Router();

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if (ext !== '.cpp') {
      return cb(new Error('只允许上传C++源文件(.cpp)'));
    }
    cb(null, true);
  }
});

// 获取题目列表
router.get('/problems', (req: Request, res: Response) => {
  res.json(PROBLEMS);
});

// 上传程序并开始对拍
router.post('/upload', upload.single('executable'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '没有上传文件' });
    }

    const { pa, problem } = req.body;
    
    if (!pa || !problem) {
      return res.status(400).json({ error: '缺少PA或题目编号' });
    }

    // 验证PA和题目是否存在
    if (!PROBLEMS[pa as keyof typeof PROBLEMS]) {
      return res.status(400).json({ error: '无效的PA' });
    }

    const testId = uuidv4();
    const filePath = req.file.path;

    // 开始异步对拍测试
    runDiffTest(testId, pa, parseInt(problem), filePath);

    res.json({ 
      testId,
      message: '对拍测试已开始',
      status: 'running'
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取对拍结果
router.get('/result/:testId', (req: Request, res: Response) => {
  const { testId } = req.params;
  const result = getTestResult(testId);

  if (!result) {
    return res.status(404).json({ error: '未找到测试结果' });
  }

  res.json(result);
});

export default router;
