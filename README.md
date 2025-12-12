# THU DSA 对拍系统 (DiffTestor)

清华大学数据结构课程自动化对拍测试系统

## 项目简介

这是一个全栈Web应用,用于自动化测试数据结构课程的编程作业。系统可以对用户提交的程序与标准程序进行大量测试用例的对拍,快速发现程序错误。

## 功能特性

- ✅ 支持多个PA(Programming Assignment)和多道题目
- ✅ 网页界面选择PA和题目
- ✅ 上传C++源文件(.cpp)
- ✅ 服务器端自动编译(g++ -std=c++17 -O2)
- ✅ 自动进行最多10000次对拍测试
- ✅ 实时显示测试进度
- ✅ 详细的测试结果展示(输入、标准输出、实际输出)
- ✅ 第一次错误时自动停止并报告详情
- ✅ 全部通过时显示成功信息

## 技术栈

### 前端
- React 18
- TypeScript
- Tailwind CSS
- Vite
- Axios

### 后端
- Node.js
- Express
- TypeScript
- Multer (文件上传)

## 项目结构

```
THU-DSA-DiffTestor/
├── frontend/              # 前端应用
│   ├── src/
│   │   ├── components/   # React组件
│   │   ├── api/         # API调用
│   │   ├── types/       # TypeScript类型定义
│   │   ├── App.tsx      # 主应用组件
│   │   └── main.tsx     # 入口文件
│   ├── package.json
│   └── vite.config.ts
├── backend/              # 后端服务
│   ├── src/
│   │   ├── routes/      # API路由
│   │   ├── services/    # 业务逻辑
│   │   ├── types/       # TypeScript类型定义
│   │   ├── config/      # 配置文件
│   │   └── index.ts     # 服务器入口
│   ├── package.json
│   └── tsconfig.json
├── standard-programs/    # 标准程序目录
│   ├── PA1/
│   ├── PA2/
│   ├── PA3/
│   └── PA4/
├── package.json         # 根目录package.json
└── README.md
```

## 快速开始

### 1. 安装依赖

```bash
# 安装所有依赖(根目录、前端、后端)
npm run install:all
```

### 2. 配置标准程序

将标准程序的可执行文件放入对应目录:

```
standard-programs/
├── PA1/
│   ├── problem1     (或 problem1.exe)
│   └── problem2     (或 problem2.exe)
├── PA2/
│   ├── problem1
│   ├── problem2
│   └── problem3
...
```

### 3. 启动开发服务器

```bash
# 同时启动前端和后端
npm run dev

# 或分别启动
npm run dev:frontend  # 前端运行在 http://localhost:3000
npm run dev:backend   # 后端运行在 http://localhost:3001
```

### 4. 使用系统

1. 打开浏览器访问 `http://localhost:3000`
2. 选择PA和题目
3. 上传C++源文件(.cpp)
4. 系统自动编译并进行对拍测试
5. 查看测试结果

## 配置说明

### 后端环境变量

复制 `backend/.env.example` 为 `backend/.env` 并根据需要修改:

```env
PORT=3001
NODE_ENV=development
UPLOAD_DIR=./uploads
TEMP_DIR=./temp
MAX_TEST_CASES=10000
```

### 题目配置

题目配置在 `backend/src/config/problems.ts` 中定义:

```typescript
export const PROBLEMS = {
  PA1: [
    { id: 1, name: '题目1' },
    { id: 2, name: '题目2' }
  ],
  PA2: [
    { id: 1, name: '题目1' },
    { id: 2, name: '题目2' },
    { id: 3, name: '题目3' }
  ],
  // ...
};
```

## 自定义测试数据生成

在 `backend/src/services/diffTestService.ts` 中实现 `generateInput` 函数,根据不同的PA和题目生成相应的测试输入:

```typescript
function generateInput(pa: string, problem: number): string {
  // 根据PA和题目编号生成测试输入
  // 示例:
  if (pa === 'PA1' && problem === 1) {
    // 生成PA1题目1的测试数据
    return '...';
  }
  // ...
}
```

## 构建生产版本

```bash
# 构建前端和后端
npm run build

# 构建后的文件
# frontend/dist/ - 前端静态文件
# backend/dist/  - 后端编译后的JS文件
```

## API接口

### 获取题目列表
```
GET /api/diff-test/problems
```

### 上传程序并开始对拍
```
POST /api/diff-test/upload
Content-Type: multipart/form-data

参数:
- executable: C++源文件(.cpp)
- pa: PA编号(如 PA1)
- problem: 题目编号(如 1)

返回:
{
  "testId": "uuid",
  "message": "对拍测试已开始",
  "status": "running"
}
```

### 获取测试结果
```
GET /api/diff-test/result/:testId

返回:
{
  "testId": "uuid",
  "status": "running" | "passed" | "failed",
  "currentTestCase": 100,
  "totalTestCases": 10000,
  "error": { ... },  // 仅在失败时存在
  "details": [ ... ]  // 测试详情
}
```

## 注意事项

1. **环境要求**:服务器需要安装g++编译器(Linux环境)
2. **标准程序**:确保标准程序已编译并有执行权限
3. **输入输出**:所有程序必须使用标准输入/输出
4. **编译设置**:使用g++ -std=c++17 -O2编译,编译超时30秒
5. **执行超时**:每个测试用例默认超时5秒
6. **文件格式**:只接受.cpp源文件
7. **测试数据**:需要根据具体题目实现测试数据生成逻辑

## 后续任务

- [ ] 实现各个题目的测试数据生成逻辑
- [ ] 添加用户认证系统
- [ ] 添加测试历史记录
- [ ] 支持多种编程语言
- [ ] 添加性能分析功能
- [ ] 部署到生产环境

## 开发者

开发数据结构课程使用

## 许可证

MIT