export interface ProblemConfig {
  pa: string;
  problem: number;
  name: string;
}

export interface TestResult {
  testId: string;
  status: 'running' | 'passed' | 'failed';
  currentTestCase: number;
  totalTestCases: number;
  error?: {
    input: string;
    expectedOutput: string;
    actualOutput: string;
    testCaseNumber: number;
  };
  details: TestDetail[];
}

export interface TestDetail {
  testCaseNumber: number;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
}
