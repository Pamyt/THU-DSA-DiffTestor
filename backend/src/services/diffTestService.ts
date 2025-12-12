import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { TestResult, TestDetail } from '../types';
import { MAX_TEST_CASES } from '../config/problems';

const execAsync = promisify(exec);

// 存储测试结果
const testResults = new Map<string, TestResult>();

// ==========================================
// 1. 随机数生成工具函数 (对数分布优化)
// ==========================================

/**
 * 生成随机整数 (均匀分布)
 * 用于：索引选择、操作类型选择 (1/2/3)
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 生成对数均匀分布的随机整数
 * 效果：小数字和大数字出现的概率接近。
 * 例如在 1-10000 中，生成 10 和生成 1000 的概率相似，能有效覆盖边界。
 */
function randomLogInt(min: number, max: number): number {
  if (min > max) [min, max] = [max, min];
  const effectiveMin = Math.max(1, min);
  
  const logMin = Math.log(effectiveMin);
  const logMax = Math.log(max);
  
  const r = logMin + Math.random() * (logMax - logMin);
  let result = Math.floor(Math.exp(r));
  
  // 修正边界
  if (result < min) result = min;
  if (result > max) result = max;
  
  return result;
}

/**
 * 生成带符号的对数随机整数
 * 用于：坐标、权值 (可能为负的情况)
 */
function randomSignedLogInt(limit: number): number {
  const sign = Math.random() < 0.5 ? 1 : -1;
  // 在 [1, limit+1] 范围取对数，然后减1以包含0
  const logMax = Math.log(limit + 1);
  const r = Math.random() * logMax;
  const magnitude = Math.floor(Math.exp(r)); // 这里不需要减1，让他稍微大一点点也没事
  return sign * magnitude;
}

/**
 * 生成随机可见ASCII字符
 */
function randomVisibleChar(): string {
  const ascii = randomInt(33, 126);
  return String.fromCharCode(ascii);
}

/**
 * 生成随机字符串
 */
function randomString(length: number): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += randomVisibleChar();
  }
  return result;
}

// ==========================================
// 2. 数据生成逻辑 (generateInput)
// ==========================================

/**
 * 生成测试输入数据
 */
function generateInput(pa: string, problem: number): string {
  if (pa === 'PA1') {
    if (problem === 1) {
      // Gift
      const n = randomLogInt(1, 40);
      const P = randomLogInt(1, 1000000000);
      let input = `${n} ${P}\n`;
      
      for (let i = 0; i < n; i++) {
        const c1 = randomLogInt(1, 1000000000);
        const c2 = randomLogInt(1, 1000000000);
        input += `${c1} ${c2}\n`;
      }
      return input;

    } else if (problem === 2) {
      // filename
      const N = randomLogInt(1, 1000);
      const M = randomLogInt(1, 1000);
      const K = randomLogInt(1, 100);
      const A = randomString(N);
      const B = randomString(M);
      return `${N} ${M} ${K}\n${A}\n${B}\n`;
    }

  } else if (pa === 'PA2') {
    if (problem === 1) {
      // Risk
      const n = randomLogInt(1, 1000000);
      let input = `${n}\n`;
      
      const cases = [];
      for (let i = 0; i < n; i++) {
        cases.push(randomLogInt(0, 2000000));
      }
      input += cases.join(' ') + '\n';
      
      const m = [];
      m.push(randomLogInt(1, 1000));
      for (let i = 1; i < n; i++) {
        const limit = Math.min(m[i-1] + 1, 10000);
        m.push(randomInt(1, limit)); 
      }
      input += m.join(' ') + '\n';
      
      const T = randomLogInt(1, 100000);
      input += `${T}\n`;
      for (let i = 0; i < T; i++) {
        const p = randomLogInt(0, 2000000);
        const q = randomLogInt(p + 1, 4000000);
        input += `${p} ${q}\n`;
      }
      return input;

    } else if (problem === 2) {
      // Polynomial
      const depth = randomInt(1, 4);
      return generatePolynomialExpression(depth);

    } else if (problem === 3) {
      // Triangulation
      const n = randomLogInt(3, 1000000);
      let input = `${n}\n`;
      
      const points = generateMonotonePolygon(n);
      for (const [x, y] of points) {
        input += `${x} ${y}\n`;
      }
      return input;
    }

  } else if (pa === 'PA3') {
    if (problem === 1) {
      // Match
      const n = randomLogInt(0, 400000);
      const m = randomLogInt(0, 400000);
      
      let input = `${n} ${m}\n`;
      
      if (n > 0) {
        let initString = '';
        for (let i = 0; i < n; i++) {
          initString += String.fromCharCode(randomInt(97, 122));
        }
        input += `${initString}\n`;
      } else {
        input += '\n';
      }
      
      let currentLen = n;
      for (let i = 0; i < m; i++) {
        const opType = randomInt(1, 4);
        
        if (opType === 1 && currentLen < 400000) {
          const p = randomInt(0, currentLen);
          const c = String.fromCharCode(randomInt(97, 122));
          input += `1 ${p} ${c}\n`;
          currentLen++;
        } else if (opType === 2 && currentLen > 0) {
          const p = randomInt(0, currentLen - 1);
          input += `2 ${p}\n`;
          currentLen--;
        } else if (opType === 3 && currentLen > 1) {
          const p = randomInt(0, currentLen - 1);
          const q = randomInt(p + 1, currentLen);
          input += `3 ${p} ${q}\n`;
        } else if (opType === 4 && currentLen > 0) {
          const maxLen = Math.min(10, currentLen);
          const len = randomInt(1, maxLen);
          const p = randomInt(0, currentLen - len);
          const q = randomInt(0, currentLen - len);
          input += `4 ${p} ${q} ${len}\n`;
        } else {
          // Fallback (Avoid empty operations)
          if (currentLen > 0) {
            const maxLen = Math.min(10, currentLen);
            const len = randomInt(1, maxLen);
            const p = randomInt(0, currentLen - len);
            const q = randomInt(0, currentLen - len);
            input += `4 ${p} ${q} ${len}\n`;
          }
        }
      }
      return input;

    } else if (problem === 2) {
      // Kidd
      const n = randomLogInt(1, 2147483647);
      const m = randomLogInt(1, 200000);
      
      let input = `${n} ${m}\n`;
      
      for (let i = 0; i < m; i++) {
        const isFlip = Math.random() < 0.6;
        const s = randomInt(1, n);
        const maxLen = Math.min(n - s, 100000000); 
        const len = randomLogInt(0, maxLen); 
        const t = s + len;
        
        if (isFlip) {
          input += `H ${s} ${t}\n`;
        } else {
          input += `Q ${s} ${t}\n`;
        }
      }
      return input;

    } else if (problem === 3) {
      // NearestNeighbor
      const d = randomInt(2, 5);
      const n = randomLogInt(1, 100000);
      const q = randomLogInt(1, 200000);
      
      let input = `${d} ${n}\n`;
      
      for (let i = 0; i < n; i++) {
        const vector = [];
        for (let j = 0; j < d; j++) {
          vector.push(randomSignedLogInt(10000000));
        }
        input += vector.join(' ') + '\n';
      }
      
      input += `${q}\n`;
      for (let i = 0; i < q; i++) {
        const query = [];
        for (let j = 0; j < d; j++) {
          query.push(randomSignedLogInt(10000000));
        }
        input += query.join(' ') + '\n';
      }
      return input;
    }

  } else if (pa === 'PA4') {
    if (problem === 1) {
      // Game
      const N = randomLogInt(1, 100000);
      const maxM = Math.min(100000, N * (N - 1) / 2);
      const M = randomLogInt(Math.max(1, N-1), maxM);
      
      let input = `${N} ${M}\n`;
      
      const times = [];
      for (let i = 0; i < N; i++) {
        times.push(randomLogInt(1, 10000));
      }
      input += times.join(' ') + '\n';
      
      const edges = new Set<string>();
      // 保证连通性的骨架
      for (let i = 1; i < N; i++) {
        const u = randomInt(1, i);
        const v = i + 1;
        const key = u < v ? `${u}-${v}` : `${v}-${u}`;
        if (!edges.has(key)) {
          edges.add(key);
          input += `${u} ${v}\n`;
        }
      }
      // 随机加边
      while (edges.size < M) {
        const u = randomInt(1, N);
        const v = randomInt(1, N);
        if (u !== v) {
          const key = u < v ? `${u}-${v}` : `${v}-${u}`;
          if (!edges.has(key)) {
            edges.add(key);
            input += `${u} ${v}\n`;
          }
        }
      }
      return input;

    } else if (problem === 2) {
      // Component
      const n = randomLogInt(1, 10000);
      const m = randomLogInt(0, Math.min(10000, n * (n - 1) / 2));
      const k = randomLogInt(1, n);
      const q = randomLogInt(1, 10000);
      
      let input = `${n} ${m} ${k} ${q}\n`;
      
      const weights = [];
      for (let i = 0; i < n; i++) {
        weights.push(randomLogInt(0, 1000000000));
      }
      input += weights.join(' ') + '\n';
      
      const edges = new Set<string>();
      for (let i = 0; i < m; i++) {
        let u, v;
        let attempts = 0;
        do {
          u = randomInt(1, n);
          v = randomInt(1, n);
          attempts++;
        } while ((u === v || edges.has(u < v ? `${u}-${v}` : `${v}-${u}`)) && attempts < 100);
        
        if (attempts < 100) {
          const key = u < v ? `${u}-${v}` : `${v}-${u}`;
          edges.add(key);
          input += `${u} ${v}\n`;
        }
      }
      
      for (let i = 0; i < q; i++) {
        const op = Math.random() < 0.5 ? 1 : 2;
        if (op === 1) {
          const u = randomInt(1, n);
          const v = randomInt(1, n);
          input += `1 ${u} ${v}\n`;
        } else {
          const u = randomInt(1, n);
          input += `2 ${u}\n`;
        }
      }
      return input;

    } else if (problem === 3) {
      // ChromPoly
      const n = randomInt(3, 29);
      const m = randomInt(1, Math.min(69, n * (n - 1) / 2));
      
      let input = `${n} ${m}\n`;
      const edges = new Set<string>();
      for (let i = 0; i < m; i++) {
        let u, v;
        let attempts = 0;
        do {
          u = randomInt(0, n); 
          v = randomInt(0, n);
          attempts++;
        } while ((u === v || edges.has(u < v ? `${u}-${v}` : `${v}-${u}`)) && attempts < 100);
        
        if (attempts < 100) {
          const key = u < v ? `${u}-${v}` : `${v}-${u}`;
          edges.add(key);
          input += `${u} ${v}\n`;
        }
      }
      return input;
    }
  }
  
  return '';
}

/**
 * 辅助函数：生成随机多项式
 */
function generatePolynomialExpression(depth: number): string {
  if (depth === 0 || Math.random() < 0.3) {
    return Math.random() < 0.5 ? 'x' : String(randomInt(1, 99));
  }
  
  const op = ['+', '-', '*'][randomInt(0, 2)];
  const left = generatePolynomialExpression(depth - 1);
  const right = generatePolynomialExpression(depth - 1);
  
  if (Math.random() < 0.3) {
    const power = randomInt(1, 4);
    return `(${left}${op}${right})^${power}`;
  } else if (Math.random() < 0.2) {
    return `(${left}${op}${right})`;
  } else {
    return `${left}${op}${right}`;
  }
}

/**
 * 辅助函数：生成x-单调多边形 (使用对数坐标)
 */
function generateMonotonePolygon(n: number): [number, number][] {
  const xCoords: number[] = [];
  const used = new Set<number>();
  
  while (xCoords.length < n) {
    const x = randomSignedLogInt(1000000000);
    if (!used.has(x)) {
      used.add(x);
      xCoords.push(x);
    }
  }
  xCoords.sort((a, b) => a - b);
  
  const mid = Math.floor(n / 2);
  const upperChain: [number, number][] = [];
  const lowerChain: [number, number][] = [];
  
  let prevY = randomSignedLogInt(1000000000);
  for (let i = 0; i < mid; i++) {
    upperChain.push([xCoords[i], prevY]);
    prevY += randomLogInt(1, 100000); // 随机增量
  }
  
  prevY = randomSignedLogInt(1000000000);
  for (let i = n - 1; i >= mid; i--) {
    lowerChain.push([xCoords[i], prevY]);
    prevY -= randomLogInt(1, 100000); // 随机减量
  }
  
  return [...upperChain, ...lowerChain];
}

// ==========================================
// 3. 核心运行逻辑 (Spawn & Compile)
// ==========================================

/**
 * 编译C++源文件
 */
async function compileCpp(cppPath: string): Promise<string> {
  const outputPath = cppPath.replace('.cpp', '');
  try {
    await execAsync(`nice -n 10 g++ -std=c++17 -O2 "${cppPath}" -o "${outputPath}"`, {
      timeout: 3000, 
    });
    return outputPath;
  } catch (error: any) {
    throw new Error(`编译失败: ${error.message}`);
  }
}

/**
 * 运行可执行文件 (使用 spawn 替代 exec)
 */
function runExecutable(execPath: string, input: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // 启动子进程
    const child = spawn(execPath, [], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdoutData = '';
    let stderrData = '';
    
    // 设置5秒超时，防止死循环
    const timeout = setTimeout(() => {
      child.kill();
      reject(new Error('Time Limit Exceeded (5000ms)'));
    }, 5000);

    // 收集标准输出
    child.stdout.on('data', (chunk) => {
      stdoutData += chunk.toString();
      // 限制输出大小为 10MB，防止 OOM
      if (stdoutData.length > 10 * 1024 * 1024) {
        child.kill();
        reject(new Error('Output Limit Exceeded (10MB)'));
      }
    });

    // 收集标准错误
    child.stderr.on('data', (chunk) => {
      stderrData += chunk.toString();
    });

    // 防止 Broken Pipe 报错
    child.stdin.on('error', (err) => {
      // 忽略或记录
    });

    // 监听结束
    child.on('close', (code) => {
      clearTimeout(timeout);
      
      if (code === 0) {
        resolve(stdoutData.trim());
      } else {
        const errorMsg = stderrData || `Process exited with code ${code}`;
        reject(new Error(`Runtime Error: ${errorMsg}`));
      }
    });

    // 写入输入数据 (避免 Shell 解析问题)
    try {
      child.stdin.write(input);
      child.stdin.end();
    } catch (err) {
      clearTimeout(timeout);
      reject(err);
    }
  });
}

/**
 * 获取标准程序路径
 */
function getStandardProgramPath(pa: string, problem: number): string {
  const problemNames: { [key: string]: string[] } = {
    'PA1': ['Gift', 'filename'],
    'PA2': ['Risk', 'Polynomial', 'Triangulation'],
    'PA3': ['Match', 'Kidd', 'NearestNeighbor'],
    'PA4': ['Game', 'Component', 'ChromPoly']
  };
  
  const problemName = problemNames[pa]?.[problem - 1];
  if (!problemName) {
    throw new Error(`未知的题目: ${pa} - ${problem}`);
  }
  
  return path.join(__dirname, `../../standard-programs/${pa}/${problemName}`);
}

/**
 * 运行对拍测试主函数
 */
export async function runDiffTest(
  testId: string,
  pa: string,
  problem: number,
  userCppPath: string
): Promise<void> {
  const result: TestResult = {
    testId,
    status: 'running',
    currentTestCase: 0,
    totalTestCases: MAX_TEST_CASES,
    details: []
  };
  testResults.set(testId, result);

  let standardExecPath = '';
  let userExecPath = '';

  try {
    standardExecPath = getStandardProgramPath(pa, problem);
    
    if (!fs.existsSync(standardExecPath)) {
      throw new Error(`标准程序不存在: ${standardExecPath}`);
    }
    
    // 赋予标准程序执行权限
    try {
      fs.chmodSync(standardExecPath, '755');
    } catch (e) {
      // 忽略
    }

    userExecPath = await compileCpp(userCppPath);

    for (let i = 1; i <= MAX_TEST_CASES; i++) {
      result.currentTestCase = i;

      const input = generateInput(pa, problem);

      const expectedOutput = await runExecutable(standardExecPath, input);
      const actualOutput = await runExecutable(userExecPath, input);

      const passed = expectedOutput === actualOutput;

      // 截断过长的输出，防止前端卡死
      const TRUNCATE_LEN = 1000;
      const detail: TestDetail = {
        testCaseNumber: i,
        input: input.length > TRUNCATE_LEN ? input.substring(0, TRUNCATE_LEN) + '... (truncated)' : input,
        expectedOutput: expectedOutput.length > TRUNCATE_LEN ? expectedOutput.substring(0, TRUNCATE_LEN) + '... (truncated)' : expectedOutput,
        actualOutput: actualOutput.length > TRUNCATE_LEN ? actualOutput.substring(0, TRUNCATE_LEN) + '... (truncated)' : actualOutput,
        passed
      };

      result.details.push(detail);

      if (!passed) {
        result.status = 'failed';
        result.error = {
          input: input.length > 2000 ? input.substring(0, 2000) + '...' : input,
          expectedOutput: expectedOutput.substring(0, 2000),
          actualOutput: actualOutput.substring(0, 2000),
          testCaseNumber: i
        };
        break;
      }
    }

    if (result.status === 'running') {
      result.status = 'passed';
    }

  } catch (error: any) {
    result.status = 'failed';
    const errorMsg = error.message || 'Unknown Error';
    result.error = {
      input: '',
      expectedOutput: '',
      actualOutput: `System Error: ${errorMsg}`,
      testCaseNumber: result.currentTestCase
    };
    console.error(`Test failed for ${testId}:`, error);
  } finally {
    try {
      if (fs.existsSync(userCppPath)) {
        fs.unlinkSync(userCppPath);
      }
      if (userExecPath && fs.existsSync(userExecPath)) {
        fs.unlinkSync(userExecPath);
      }
    } catch (error) {
      console.error('清理文件失败:', error);
    }
  }
}

/**
 * 获取测试结果
 */
export function getTestResult(testId: string): TestResult | undefined {
  return testResults.get(testId);
}