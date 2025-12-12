export interface Problem {
  id: number;
  name: string;
}

export interface Problems {
  PA1: Problem[];
  PA2: Problem[];
  PA3: Problem[];
  PA4: Problem[];
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
