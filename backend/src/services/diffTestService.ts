import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { TestResult, TestDetail } from '../types';
import { MAX_TEST_CASES } from '../config/problems';

const execAsync = promisify(exec);

// 存储测试结果
const testResults = new Map<string, TestResult>();

/**
 * 生成随机整数
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
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

/**
 * 生成测试输入数据
 */
function generateInput(pa: string, problem: number): string {
  if (pa === 'PA1') {
    if (problem === 1) {
      // Gift题目
      // n ≤ 40, 0 < c1i, c2i, P ≤ 10^9
      const n = randomInt(1, 40);
      const P = randomInt(1, 1000000000);
      let input = `${n} ${P}\n`;
      
      for (let i = 0; i < n; i++) {
        const c1 = randomInt(1, 1000000000);
        const c2 = randomInt(1, 1000000000);
        input += `${c1} ${c2}\n`;
      }
      
      return input;
    } else if (problem === 2) {
      // filename题目
      // N, M ≤ 1000, K ≤ 100
      const N = randomInt(1, 1000);
      const M = randomInt(1, 1000);
      const K = randomInt(1, 100);
      const A = randomString(N);
      const B = randomString(M);
      
      return `${N} ${M} ${K}\n${A}\n${B}\n`;
    }
  } else if (pa === 'PA2') {
    if (problem === 1) {
      // Risk题目
      // 1 ≤ n ≤ 10^6
      const n = randomInt(1, 1000000);
      let input = `${n}\n`;
      
      // 生成每日确诊人数 xi ≤ 2*10^6
      const cases = [];
      for (let i = 0; i < n; i++) {
        cases.push(randomInt(0, 2000000));
      }
      input += cases.join(' ') + '\n';
      
      // 生成追溯天数 mi, 保证 mi ≤ mi-1 + 1, 1 ≤ mi < 2^32
      const m = [];
      m.push(randomInt(1, 1000));
      for (let i = 1; i < n; i++) {
        m.push(randomInt(1, Math.min(m[i-1] + 1, 10000)));
      }
      input += m.join(' ') + '\n';
      
      // 生成 T 组阈值, 1 ≤ T ≤ 10^5
      const T = randomInt(1, 100000);
      input += `${T}\n`;
      for (let i = 0; i < T; i++) {
        const p = randomInt(0, 2000000);
        const q = randomInt(p + 1, 4000000);
        input += `${p} ${q}\n`;
      }
      
      return input;
    } else if (problem === 2) {
      // Polynomial题目
      // 生成随机多项式表达式
      // 字符集: 0123456789x-+*^()
      // 次幂 k ≤ 4, 字符串长度 0 < n ≤ 1000000
      const depth = randomInt(1, 4);
      return generatePolynomialExpression(depth);
    } else if (problem === 3) {
      // Triangulation题目
      // 3 ≤ n ≤ 10^6
      const n = randomInt(3, 1000000);
      let input = `${n}\n`;
      
      // 生成x-单调多边形
      const points = generateMonotonePolygon(n);
      for (const [x, y] of points) {
        input += `${x} ${y}\n`;
      }
      
      return input;
    }
  } else if (pa === 'PA3') {
    if (problem === 1) {
      // Match题目
      // 0 ≤ n ≤ 400,000, 0 ≤ m ≤ 400,000
      const n = randomInt(0, 400000);
      const m = randomInt(0, 400000);
      
      let input = `${n} ${m}\n`;
      
      // 初始字符串
      if (n > 0) {
        let initString = '';
        for (let i = 0; i < n; i++) {
          initString += String.fromCharCode(randomInt(97, 122)); // a-z
        }
        input += `${initString}\n`;
      } else {
        input += '\n';
      }
      
      // 生成m个操作
      let currentLen = n;
      for (let i = 0; i < m; i++) {
        const opType = randomInt(1, 4);
        
        if (opType === 1 && currentLen < 400000) {
          // 插入操作: 1 p c
          const p = randomInt(0, currentLen);
          const c = String.fromCharCode(randomInt(97, 122));
          input += `1 ${p} ${c}\n`;
          currentLen++;
        } else if (opType === 2 && currentLen > 0) {
          // 删除操作: 2 p
          const p = randomInt(0, currentLen - 1);
          input += `2 ${p}\n`;
          currentLen--;
        } else if (opType === 3 && currentLen > 1) {
          // 翻转操作: 3 p q
          const p = randomInt(0, currentLen - 1);
          const q = randomInt(p + 1, currentLen);
          input += `3 ${p} ${q}\n`;
        } else if (opType === 4 && currentLen > 0) {
          // 检测操作: 4 p q len
          const maxLen = Math.min(10, currentLen); // 限制检测长度
          const len = randomInt(1, maxLen);
          const p = randomInt(0, currentLen - len);
          const q = randomInt(0, currentLen - len);
          input += `4 ${p} ${q} ${len}\n`;
        } else {
          // 回退到检测操作
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
      // Kidd题目
      // 1 ≤ n < 2^31, 1 ≤ m ≤ 200,000
      const n = randomInt(1, 2147483647);
      const m = randomInt(1, 200000);
      
      let input = `${n} ${m}\n`;
      
      // 生成m个操作
      for (let i = 0; i < m; i++) {
        // 随机选择 H (翻转) 或 Q (查询)
        const isFlip = Math.random() < 0.6;
        
        if (isFlip) {
          // H s t: 翻转操作
          const s = randomInt(1, n);
          const t = randomInt(s, Math.min(n, s + 1000000));
          input += `H ${s} ${t}\n`;
        } else {
          // Q s t: 查询操作
          const s = randomInt(1, n);
          const t = randomInt(s, Math.min(n, s + 1000000));
          input += `Q ${s} ${t}\n`;
        }
      }
      
      return input;
    } else if (problem === 3) {
      // NearestNeighbor题目
      // 2 ≤ d ≤ 5, 1 ≤ n ≤ 10^5, 1 ≤ q ≤ 2×10^5
      const d = randomInt(2, 5); // 维数
      const n = randomInt(1, 100000); // 向量个数
      const q = randomInt(1, 200000); // 查询个数
      
      let input = `${d} ${n}\n`;
      
      // 生成n个向量
      for (let i = 0; i < n; i++) {
        const vector = [];
        for (let j = 0; j < d; j++) {
          vector.push(randomInt(-10000000, 10000000));
        }
        input += vector.join(' ') + '\n';
      }
      
      input += `${q}\n`;
      
      // 生成q个查询
      for (let i = 0; i < q; i++) {
        const query = [];
        for (let j = 0; j < d; j++) {
          query.push(randomInt(-10000000, 10000000));
        }
        input += query.join(' ') + '\n';
      }
      
      return input;
    }
  } else if (pa === 'PA4') {
    if (problem === 1) {
      // Game题目
      // 1 <= N,M <= 100,000
      const N = randomInt(1, 100000);
      const M = randomInt(1, Math.min(100000, N * (N - 1) / 2));
      
      let input = `${N} ${M}\n`;
      
      // 生成每个关卡的速度 1 <= t[i] <= 10,000
      const times = [];
      for (let i = 0; i < N; i++) {
        times.push(randomInt(1, 10000));
      }
      input += times.join(' ') + '\n';
      
      // 生成M条道路，保证存在一条从1到N的路径
      const edges = new Set<string>();
      
      // 需要保证闲缺一条从1到N的路径
      for (let i = 1; i < N; i++) {
        const u = randomInt(1, i);
        const v = i + 1;
        const key = u < v ? `${u}-${v}` : `${v}-${u}`;
        if (!edges.has(key)) {
          edges.add(key);
          input += `${u} ${v}\n`;
        }
      }
      
      // 增加剩余的边
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
      // Component题目
      // 1 <= n, k, q <= 10^6, 0 <= m <= 10^6
      // 限制数据规模以保证测试速度
      const n = randomInt(1, 10000);
      const m = randomInt(0, Math.min(10000, n * (n - 1) / 2));
      const k = randomInt(1, n);
      const q = randomInt(1, 10000);
      
      let input = `${n} ${m} ${k} ${q}\n`;
      
      // 生成点的权值 0 <= a[i] < 10^9
      const weights = [];
      for (let i = 0; i < n; i++) {
        weights.push(randomInt(0, 1000000000));
      }
      input += weights.join(' ') + '\n';
      
      // 生成m条初始边
      const edges = new Set<string>();
      for (let i = 0; i < m; i++) {
        let u, v;
        do {
          u = randomInt(1, n);
          v = randomInt(1, n);
        } while (u === v && edges.has(`${u}-${v}`));
        
        const key = u < v ? `${u}-${v}` : `${v}-${u}`;
        edges.add(key);
        input += `${u} ${v}\n`;
      }
      
      // 生成q个操作
      for (let i = 0; i < q; i++) {
        const op = Math.random() < 0.5 ? 1 : 2;
        
        if (op === 1) {
          // 加边操作
          const u = randomInt(1, n);
          const v = randomInt(1, n);
          input += `1 ${u} ${v}\n`;
        } else {
          // 查询操作
          const u = randomInt(1, n);
          input += `2 ${u}\n`;
        }
      }
      
      return input;
    } else if (problem === 3) {
      // ChromPoly题目
      // 1 <= n < 30, 1 <= m < 70
      const n = randomInt(3, 29);
      const m = randomInt(1, Math.min(69, n * (n - 1) / 2));
      
      let input = `${n} ${m}\n`;
      
      // 生成m条不重复的边，不会有自环
      const edges = new Set<string>();
      for (let i = 0; i < m; i++) {
        let u, v;
        do {
          u = randomInt(0, n);
          v = randomInt(0, n);
        } while (u === v || edges.has(u < v ? `${u}-${v}` : `${v}-${u}`));
        
        const key = u < v ? `${u}-${v}` : `${v}-${u}`;
        edges.add(key);
        input += `${u} ${v}\n`;
      }
      
      return input;
    }
  }
  
  // 默认返回空字符串
  return '';
}

/**
 * 生成随机多项式表达式
 */
function generatePolynomialExpression(depth: number): string {
  if (depth === 0 || Math.random() < 0.3) {
    // 基本情况: 返回 x 或数字
    return Math.random() < 0.5 ? 'x' : String(randomInt(1, 99));
  }
  
  const op = ['+', '-', '*'][randomInt(0, 2)];
  const left = generatePolynomialExpression(depth - 1);
  const right = generatePolynomialExpression(depth - 1);
  
  // 随机决定是否添加括号、次幂等
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
 * 生成x-单调多边形
 */
function generateMonotonePolygon(n: number): [number, number][] {
  // 生成n个不同的x坐标
  const xCoords: number[] = [];
  const used = new Set<number>();
  
  while (xCoords.length < n) {
    const x = randomInt(-1000000000, 1000000000);
    if (!used.has(x)) {
      used.add(x);
      xCoords.push(x);
    }
  }
  
  // 按x坐标排序
  xCoords.sort((a, b) => a - b);
  
  // 分成上下两部分
  const mid = Math.floor(n / 2);
  const upperChain: [number, number][] = [];
  const lowerChain: [number, number][] = [];
  
  // 生成上链(单调增)
  let prevY = randomInt(-1000000000, 1000000000);
  for (let i = 0; i < mid; i++) {
    upperChain.push([xCoords[i], prevY]);
    prevY += randomInt(1, 100000);
  }
  
  // 生成下链(单调减)
  prevY = randomInt(-1000000000, 1000000000);
  for (let i = n - 1; i >= mid; i--) {
    lowerChain.push([xCoords[i], prevY]);
    prevY -= randomInt(1, 100000);
  }
  
  // 合并为逆时针顺序
  const points = [...upperChain, ...lowerChain];
  
  return points;
}

/**
 * 编译C++源文件
 */
async function compileCpp(cppPath: string): Promise<string> {
  const outputPath = cppPath.replace('.cpp', '');
  try {
    await execAsync(`g++ -std=c++17 -O2 "${cppPath}" -o "${outputPath}"`, {
      timeout: 30000, // 30秒编译超时
    });
    return outputPath;
  } catch (error: any) {
    throw new Error(`编译失败: ${error.message}`);
  }
}

/**
 * 运行可执行文件
 */
async function runExecutable(execPath: string, input: string): Promise<string> {
  try {
    const { stdout } = await execAsync(`echo "${input}" | "${execPath}"`, {
      timeout: 5000, // 5秒超时
      maxBuffer: 1024 * 1024 // 1MB缓冲
    });
    return stdout.trim();
  } catch (error: any) {
    throw new Error(`执行失败: ${error.message}`);
  }
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
  
  // 标准程序现位于 backend/standard-programs，编译后 __dirname 指向 dist/
  return path.join(__dirname, `../../standard-programs/${pa}/${problemName}`);
}

/**
 * 运行对拍测试
 */
export async function runDiffTest(
  testId: string,
  pa: string,
  problem: number,
  userCppPath: string
): Promise<void> {
  // 初始化测试结果
  const result: TestResult = {
    testId,
    status: 'running',
    currentTestCase: 0,
    totalTestCases: MAX_TEST_CASES,
    details: []
  };
  testResults.set(testId, result);

  const standardExecPath = getStandardProgramPath(pa, problem);

  // 检查标准程序是否存在
  if (!fs.existsSync(standardExecPath)) {
    result.status = 'failed';
    result.error = {
      input: '',
      expectedOutput: '',
      actualOutput: '',
      testCaseNumber: 0
    };
    console.error(`标准程序不存在: ${standardExecPath}`);
    return;
  }

  let userExecPath = '';

  try {
    // 编译用户的C++程序
    userExecPath = await compileCpp(userCppPath);
    // 运行测试用例
    for (let i = 1; i <= MAX_TEST_CASES; i++) {
      result.currentTestCase = i;

      // 生成测试输入
      const input = generateInput(pa, problem);

      // 运行标准程序
      const expectedOutput = await runExecutable(standardExecPath, input);

      // 运行用户程序
      const actualOutput = await runExecutable(userExecPath, input);

      // 比较输出
      const passed = expectedOutput === actualOutput;

      const detail: TestDetail = {
        testCaseNumber: i,
        input,
        expectedOutput,
        actualOutput,
        passed
      };

      result.details.push(detail);

      if (!passed) {
        // 第一次错误就停止
        result.status = 'failed';
        result.error = {
          input,
          expectedOutput,
          actualOutput,
          testCaseNumber: i
        };
        break;
      }
    }

    // 如果所有测试都通过
    if (result.status === 'running') {
      result.status = 'passed';
    }

  } catch (error: any) {
    result.status = 'failed';
    result.error = {
      input: '',
      expectedOutput: '',
      actualOutput: error.message,
      testCaseNumber: result.currentTestCase
    };
  } finally {
    // 清理用户上传的文件和编译产物
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
