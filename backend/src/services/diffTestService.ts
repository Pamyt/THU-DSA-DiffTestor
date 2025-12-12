import { spawn, exec } from 'child_process'; // 保留 exec 用于 promisify
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import PQueue from 'p-queue'; // 必须安装: npm install p-queue
import { TestResult, TestDetail } from '../types';
import { MAX_TEST_CASES } from '../config/problems';

const execAsync = promisify(exec);

// ==========================================
// 核心优化 1: 全局任务队列
// concurrency: 1 保证同一时刻服务器只编译运行 1 个任务
// 其他人的请求会排队，防止服务器 CPU 爆炸
// ==========================================
const requestQueue = new PQueue({ concurrency: 1 });

// 存储测试结果
const testResults = new Map<string, TestResult>();

// 辅助函数：休眠 (让出 CPU 时间片给 Web 服务)
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ==========================================
// 工具函数：随机数生成 (对数分布优化)
// ==========================================

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomLogInt(min: number, max: number): number {
  if (min > max) [min, max] = [max, min];
  const effectiveMin = Math.max(1, min);
  const logMin = Math.log(effectiveMin);
  const logMax = Math.log(max);
  const r = logMin + Math.random() * (logMax - logMin);
  let result = Math.floor(Math.exp(r));
  if (result < min) result = min;
  if (result > max) result = max;
  return result;
}

function randomSignedLogInt(limit: number): number {
  const sign = Math.random() < 0.5 ? 1 : -1;
  const logMax = Math.log(limit + 1);
  const r = Math.random() * logMax;
  const magnitude = Math.floor(Math.exp(r));
  return sign * magnitude;
}

function randomVisibleChar(): string {
  const ascii = randomInt(33, 126);
  return String.fromCharCode(ascii);
}

function randomString(length: number): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += randomVisibleChar();
  }
  return result;
}

// ==========================================
// 数据生成逻辑 (generateInput)
// 优化点：使用数组 buffer 替代字符串 += 拼接，防止 GC 卡顿
// ==========================================

function generateInput(pa: string, problem: number): string {
  const buffer: string[] = []; // 使用数组收集字符串
  
  if (pa === 'PA1') {
    if (problem === 1) { // Gift
      const n = randomLogInt(1, 40);
      const P = randomLogInt(1, 1000000000);
      buffer.push(`${n} ${P}`);
      for (let i = 0; i < n; i++) {
        buffer.push(`${randomLogInt(1, 1000000000)} ${randomLogInt(1, 1000000000)}`);
      }
    } else if (problem === 2) { // filename
      const N = randomLogInt(1, 1000);
      const M = randomLogInt(1, 1000);
      const K = randomLogInt(1, 100);
      buffer.push(`${N} ${M} ${K}`, randomString(N), randomString(M));
    }
  } else if (pa === 'PA2') {
    if (problem === 1) { // Risk
      const n = randomLogInt(1, 1000000);
      buffer.push(`${n}`);
      
      const cases = Array.from({length: n}, () => randomLogInt(0, 2000000));
      buffer.push(cases.join(' '));
      
      const m = [randomLogInt(1, 1000)];
      for (let i = 1; i < n; i++) m.push(randomInt(1, Math.min(m[i-1] + 1, 10000)));
      buffer.push(m.join(' '));
      
      const T = randomLogInt(1, 100000);
      buffer.push(`${T}`);
      for (let i = 0; i < T; i++) {
        const p = randomLogInt(0, 2000000);
        buffer.push(`${p} ${randomLogInt(p + 1, 4000000)}`);
      }
    } else if (problem === 2) { // Polynomial
      return generatePolynomialExpression(randomInt(1, 4));
    } else if (problem === 3) { // Triangulation
      const n = randomLogInt(3, 1000000);
      buffer.push(`${n}`);
      const points = generateMonotonePolygon(n);
      points.forEach(([x, y]) => buffer.push(`${x} ${y}`));
    }
  } else if (pa === 'PA3') {
    if (problem === 1) { // Match
      const n = randomLogInt(0, 400000);
      const m = randomLogInt(0, 400000);
      buffer.push(`${n} ${m}`);
      if (n > 0) buffer.push(randomString(n)); else buffer.push("");
      
      let currentLen = n;
      for (let i = 0; i < m; i++) {
        const op = randomInt(1, 4);
        if (op === 1 && currentLen < 400000) {
          buffer.push(`1 ${randomInt(0, currentLen)} ${randomVisibleChar()}`); currentLen++;
        } else if (op === 2 && currentLen > 0) {
          buffer.push(`2 ${randomInt(0, currentLen - 1)}`); currentLen--;
        } else if (op === 3 && currentLen > 1) {
          const p = randomInt(0, currentLen - 1);
          buffer.push(`3 ${p} ${randomInt(p + 1, currentLen)}`);
        } else {
          const maxL = Math.min(10, currentLen);
          const len = randomInt(1, maxL || 1);
          buffer.push(`4 ${randomInt(0, Math.max(0, currentLen - len))} ${randomInt(0, Math.max(0, currentLen - len))} ${len}`);
        }
      }
    } else if (problem === 2) { // Kidd
      const n = randomLogInt(1, 2147483647);
      const m = randomLogInt(1, 200000);
      buffer.push(`${n} ${m}`);
      for (let i = 0; i < m; i++) {
        const s = randomInt(1, n);
        const t = s + randomLogInt(0, Math.min(n - s, 100000000));
        buffer.push(`${Math.random() < 0.6 ? 'H' : 'Q'} ${s} ${t}`);
      }
    } else if (problem === 3) { // NearestNeighbor
      const d = randomInt(2, 5);
      const n = randomLogInt(1, 100000);
      const q = randomLogInt(1, 200000);
      buffer.push(`${d} ${n}`);
      for(let i=0; i<n; i++) buffer.push(Array.from({length:d}, ()=>randomSignedLogInt(1e7)).join(' '));
      buffer.push(`${q}`);
      for(let i=0; i<q; i++) buffer.push(Array.from({length:d}, ()=>randomSignedLogInt(1e7)).join(' '));
    }
  } else if (pa === 'PA4') {
    if (problem === 1) { // Game
      const N = randomLogInt(1, 100000);
      const maxM = Math.min(100000, N * (N - 1) / 2);
      const M = randomLogInt(Math.max(1, N-1), maxM);
      buffer.push(`${N} ${M}`, Array.from({length:N}, ()=>randomLogInt(1,10000)).join(' '));
      
      const edges = new Set<string>();
      const addEdge = (u:number, v:number) => {
        const k = u<v?`${u}-${v}`:`${v}-${u}`;
        if(!edges.has(k)) { edges.add(k); buffer.push(`${u} ${v}`); return true; }
        return false;
      };
      for(let i=1; i<N; i++) addEdge(randomInt(1, i), i+1);
      while(edges.size < M) { const u=randomInt(1, N), v=randomInt(1, N); if(u!==v) addEdge(u, v); }
    } else if (problem === 2) { // Component
      const n = randomLogInt(1, 10000);
      const m = randomLogInt(0, Math.min(10000, n*(n-1)/2));
      const k = randomLogInt(1, n);
      const q = randomLogInt(1, 10000);
      buffer.push(`${n} ${m} ${k} ${q}`, Array.from({length:n}, ()=>randomLogInt(0, 1e9)).join(' '));
      
      const edges = new Set<string>();
      for(let i=0; i<m; i++) {
        let u,v,t=0; do { u=randomInt(1,n); v=randomInt(1,n); t++; } while((u===v || edges.has(u<v?`${u}-${v}`:`${v}-${u}`)) && t<100);
        if(t<100) { edges.add(u<v?`${u}-${v}`:`${v}-${u}`); buffer.push(`${u} ${v}`); }
      }
      for(let i=0; i<q; i++) buffer.push(Math.random()<0.5 ? `1 ${randomInt(1,n)} ${randomInt(1,n)}` : `2 ${randomInt(1,n)}`);
    } else if (problem === 3) { // ChromPoly
      const n = randomInt(3, 29);
      const m = randomInt(1, Math.min(69, n*(n-1)/2));
      buffer.push(`${n} ${m}`);
      const edges = new Set<string>();
      for(let i=0; i<m; i++) {
        let u,v,t=0; do { u=randomInt(0,n); v=randomInt(0,n); t++; } while((u===v || edges.has(u<v?`${u}-${v}`:`${v}-${u}`)) && t<100);
        if(t<100) { edges.add(u<v?`${u}-${v}`:`${v}-${u}`); buffer.push(`${u} ${v}`); }
      }
    }
  }
  return buffer.join('\n') + '\n';
}

function generatePolynomialExpression(depth: number): string {
  if (depth === 0 || Math.random() < 0.3) return Math.random() < 0.5 ? 'x' : String(randomInt(1, 99));
  const op = ['+', '-', '*'][randomInt(0, 2)];
  const l = generatePolynomialExpression(depth - 1), r = generatePolynomialExpression(depth - 1);
  return Math.random() < 0.3 ? `(${l}${op}${r})^${randomInt(1,4)}` : (Math.random()<0.2 ? `(${l}${op}${r})` : `${l}${op}${r}`);
}

function generateMonotonePolygon(n: number): [number, number][] {
  const x = new Set<number>(); while(x.size < n) x.add(randomSignedLogInt(1e9));
  const xs = Array.from(x).sort((a,b)=>a-b);
  const mid = Math.floor(n/2);
  const upper = [], lower = [];
  let py = randomSignedLogInt(1e9); for(let i=0; i<mid; i++) { upper.push([xs[i], py]); py += randomLogInt(1, 1e5); }
  py = randomSignedLogInt(1e9); for(let i=n-1; i>=mid; i--) { lower.push([xs[i], py]); py -= randomLogInt(1, 1e5); }
  return [...upper as [number, number][], ...lower as [number, number][]];
}

// ==========================================
// 核心运行逻辑 (编译 & Spawn)
// ==========================================

/**
 * 编译C++源文件
 * 优化 2: nice -n 19 (最低优先级)
 * 优化 3: -O0 (无优化，编译最快)
 */
async function compileCpp(cppPath: string): Promise<string> {
  const outputPath = cppPath.replace('.cpp', '');
  try {
    await execAsync(`nice -n 19 g++ -std=c++17 -O0 "${cppPath}" -o "${outputPath}"`, {
      timeout: 30000, 
    });
    return outputPath;
  } catch (error: any) {
    throw new Error(`编译失败: ${error.message}`);
  }
}

/**
 * 运行可执行文件
 * 优化 4: 使用 ulimit 限制内存和 CPU
 */
function runExecutable(execPath: string, input: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // 使用 sh -c 包裹命令，以便使用 ulimit
    // ulimit -v 262144 (256MB) 防止 OOM
    // ulimit -t 5 (5秒 CPU 时间) 防止死循环
    // nice -n 19 降低优先级
    const cmd = `ulimit -v 262144 && ulimit -t 5 && nice -n 19 "${execPath}"`;
    
    const child = spawn('sh', ['-c', cmd], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdoutData = '', stderrData = '';
    
    // JS层超时保险
    const timeout = setTimeout(() => {
        try { process.kill(child.pid as number, 'SIGKILL'); } catch(e) {}
        reject(new Error('Time Limit Exceeded (5000ms)'));
    }, 5100);

    // 收集标准输出 (带截断，防止爆内存)
    child.stdout.on('data', c => {
      if(stdoutData.length < 1024 * 1024) { // 只保留前 1MB
        stdoutData += c.toString();
      } else if (!stdoutData.endsWith('...[Truncated]')) {
        stdoutData += '...[Truncated]';
        // 可选：如果输出太大，直接杀掉进程，视策略而定
        // child.kill(); 
      }
    });

    child.stderr.on('data', c => stderrData += c.toString());
    
    // 忽略 stdin broken pipe 错误
    child.stdin.on('error', () => {}); 

    child.on('close', code => {
      clearTimeout(timeout);
      if(code === 0) resolve(stdoutData.trim());
      else reject(new Error(`Runtime Error (Exit Code ${code}): ${stderrData}`));
    });

    // 写入输入
    try { 
        child.stdin.write(input); 
        child.stdin.end(); 
    } catch(e) { 
        clearTimeout(timeout); 
        reject(e); 
    }
  });
}

function getStandardProgramPath(pa: string, problem: number): string {
  const map: any = { 'PA1': ['Gift', 'filename'], 'PA2': ['Risk', 'Polynomial', 'Triangulation'], 'PA3': ['Match', 'Kidd', 'NearestNeighbor'], 'PA4': ['Game', 'Component', 'ChromPoly'] };
  const name = map[pa]?.[problem-1];
  if(!name) throw new Error(`Unknown Problem: ${pa}-${problem}`);
  return path.join(__dirname, `../../standard-programs/${pa}/${name}`);
}

// ==========================================
// 真正的处理逻辑 (私有，被队列调用)
// ==========================================

async function _processDiffTest(testId: string, pa: string, problem: number, userCppPath: string) {
  const result: TestResult = { testId, status: 'running', currentTestCase: 0, totalTestCases: MAX_TEST_CASES, details: [] };
  testResults.set(testId, result);
  let userExecPath = '';

  try {
    const stdPath = getStandardProgramPath(pa, problem);
    if (!fs.existsSync(stdPath)) throw new Error('Standard program missing');
    try { fs.chmodSync(stdPath, '755'); } catch(e) {}

    // 1. 编译
    userExecPath = await compileCpp(userCppPath);
    
    // 优化 5: 编译后休息一下，处理积压请求
    await sleep(200);

    // 2. 循环对拍
    for (let i = 1; i <= MAX_TEST_CASES; i++) {
      result.currentTestCase = i;
      
      const input = generateInput(pa, problem);
      
      const [expected, actual] = await Promise.all([
        runExecutable(stdPath, input),
        runExecutable(userExecPath, input)
      ]);

      const passed = expected === actual;
      
      // 截断过长输出，防止前端卡死
      const TRUNCATE_LEN = 500;
      result.details.push({
        testCaseNumber: i,
        input: input.length > TRUNCATE_LEN ? input.substring(0, TRUNCATE_LEN) + '...' : input,
        expectedOutput: expected.length > TRUNCATE_LEN ? expected.substring(0, TRUNCATE_LEN) + '...' : expected,
        actualOutput: actual.length > TRUNCATE_LEN ? actual.substring(0, TRUNCATE_LEN) + '...' : actual,
        passed
      });

      // 优化 6: 每次跑完一个点，强制休息，让出 CPU 给主线程
      await sleep(100);

      if (!passed) {
        result.status = 'failed';
        result.error = { 
            input: input.slice(0, 1000), 
            expectedOutput: expected.slice(0, 1000), 
            actualOutput: actual.slice(0, 1000), 
            testCaseNumber: i 
        };
        break;
      }
    }
    if (result.status === 'running') result.status = 'passed';

  } catch (error: any) {
    result.status = 'failed';
    result.error = { input: '', expectedOutput: '', actualOutput: `System Error: ${error.message}`, testCaseNumber: result.currentTestCase };
    console.error(`DiffTest Error:`, error);
  } finally {
    try { if (fs.existsSync(userCppPath)) fs.unlinkSync(userCppPath); } catch(e) {}
    try { if (userExecPath && fs.existsSync(userExecPath)) fs.unlinkSync(userExecPath); } catch(e) {}
  }
}

/**
 * 运行对拍测试 (入口)
 * 任务会被加入队列，立即返回，前端通过轮询获取结果
 */
export async function runDiffTest(testId: string, pa: string, problem: number, userCppPath: string): Promise<void> {
  // 放入队列
  requestQueue.add(() => _processDiffTest(testId, pa, problem, userCppPath));
  console.log(`[Queue] Task added. Pending: ${requestQueue.pending}`);
}

export function getTestResult(testId: string): TestResult | undefined {
  return testResults.get(testId);
}