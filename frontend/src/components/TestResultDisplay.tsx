import React, { useState, useEffect } from 'react';
import { TestResult } from '../types';
import { api } from '../api';

interface TestResultDisplayProps {
  testId: string;
  onBack: () => void;
}

const TestResultDisplay: React.FC<TestResultDisplayProps> = ({ testId, onBack }) => {
  const [result, setResult] = useState<TestResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const data = await api.getTestResult(testId);
        setResult(data);

        // 如果还在运行中,继续轮询
        if (data.status === 'running') {
          setTimeout(fetchResult, 1000);
        }
      } catch (error) {
        console.error('获取测试结果失败:', error);
      }
    };

    fetchResult();
  }, [testId]);

  if (!result) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">对拍结果</h2>
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          ← 返回
        </button>
      </div>

      {/* 状态显示 */}
      <div className="mb-6">
        {result.status === 'running' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
              <div>
                <p className="font-medium text-blue-900">对拍中...</p>
                <p className="text-sm text-blue-700">
                  进度: {result.currentTestCase} / {result.totalTestCases}
                </p>
              </div>
            </div>
            <div className="mt-3 w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(result.currentTestCase / result.totalTestCases) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {result.status === 'passed' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="h-6 w-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <p className="font-medium text-green-900">🎉 恭喜!你已对拍通过本题!</p>
                <p className="text-sm text-green-700">
                  所有 {result.totalTestCases} 个测试用例全部通过
                </p>
              </div>
            </div>
          </div>
        )}

        {result.status === 'failed' && result.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="h-6 w-6 text-red-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <div className="flex-1">
                <p className="font-medium text-red-900">对拍失败</p>
                <p className="text-sm text-red-700 mt-1">
                  在第 {result.error.testCaseNumber} 个测试用例处发现错误
                </p>

                <div className="mt-4 space-y-3">
                  <div>
                    <p className="text-xs font-medium text-red-800 mb-1">输入:</p>
                    <pre className="bg-white border border-red-200 rounded p-2 text-xs overflow-x-auto">
                      {result.error.input}
                    </pre>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-red-800 mb-1">标准输出:</p>
                    <pre className="bg-white border border-red-200 rounded p-2 text-xs overflow-x-auto">
                      {result.error.expectedOutput}
                    </pre>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-red-800 mb-1">你的输出:</p>
                    <pre className="bg-white border border-red-200 rounded p-2 text-xs overflow-x-auto">
                      {result.error.actualOutput}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 详情按钮 */}
      {result.details.length > 0 && (
        <div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-md transition-colors font-medium"
          >
            {showDetails ? '隐藏详情' : '查看详情'}
          </button>

          {showDetails && (
            <div className="mt-4 max-h-96 overflow-y-auto">
              <div className="space-y-3">
                {result.details.map((detail) => (
                  <div
                    key={detail.testCaseNumber}
                    className={`border rounded-lg p-3 ${
                      detail.passed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">
                        测试用例 #{detail.testCaseNumber}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          detail.passed ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                        }`}
                      >
                        {detail.passed ? '通过' : '失败'}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="font-medium">输入:</span>
                        <pre className="bg-white border rounded p-2 mt-1 overflow-x-auto">
                          {detail.input}
                        </pre>
                      </div>
                      <div>
                        <span className="font-medium">标准输出:</span>
                        <pre className="bg-white border rounded p-2 mt-1 overflow-x-auto">
                          {detail.expectedOutput}
                        </pre>
                      </div>
                      <div>
                        <span className="font-medium">你的输出:</span>
                        <pre className="bg-white border rounded p-2 mt-1 overflow-x-auto">
                          {detail.actualOutput}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TestResultDisplay;
