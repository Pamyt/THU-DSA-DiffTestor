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
    <div className="bg-white rounded-xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">对拍结果</h2>
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回
        </button>
      </div>

      {/* 状态显示 */}
      <div className="mb-4">
        {result.status === 'running' && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-4 shadow-md">
            <div className="flex items-center">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
              <div className="flex-1">
                <p className="font-bold text-blue-900">对拍中...</p>
                <p className="text-xs text-blue-700 mt-0.5">
                  进度: {result.currentTestCase} / {result.totalTestCases}
                </p>
              </div>
            </div>
            <div className="mt-2 w-full bg-blue-200 rounded-full h-2 shadow-inner">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300 shadow-sm"
                style={{ width: `${(result.currentTestCase / result.totalTestCases) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {result.status === 'passed' && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-4 shadow-md">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3 shadow-lg">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-green-900 text-lg">🎉 恭喜!你已对拍通过本题!</p>
                <p className="text-xs text-green-700 mt-0.5">
                  所有 {result.totalTestCases} 个测试用例全部通过
                </p>
              </div>
            </div>
          </div>
        )}

        {result.status === 'failed' && result.error && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 rounded-lg p-4 shadow-md">
            <div className="flex items-start">
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0 shadow-lg">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-red-900 text-lg">对拍失败</p>
                <p className="text-xs text-red-700 mt-0.5">
                  在第 {result.error.testCaseNumber} 个测试用例处发现错误
                </p>

                <div className="mt-3 space-y-2">
                  <div>
                    <p className="text-xs font-bold text-red-800 mb-1 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      输入:
                    </p>
                    <pre className="bg-white border-2 border-red-200 rounded-lg p-3 text-xs overflow-x-auto break-words whitespace-pre-wrap max-w-full shadow-sm">
                      {result.error.input}
                    </pre>
                  </div>

                  <div>
                    <p className="text-sm font-bold text-red-800 mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      标准输出:
                    </p>
                    <pre className="bg-white border-2 border-red-200 rounded-lg p-3 text-xs overflow-x-auto break-words whitespace-pre-wrap max-w-full shadow-sm">
                      {result.error.expectedOutput}
                    </pre>
                  </div>

                  <div>
                    <p className="text-sm font-bold text-red-800 mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      你的输出:
                    </p>
                    <pre className="bg-white border-2 border-red-200 rounded-lg p-3 text-xs overflow-x-auto break-words whitespace-pre-wrap max-w-full shadow-sm">
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
            className="w-full bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800 py-2 px-4 rounded-lg transition-all font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            {showDetails ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                隐藏详情
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                查看详情
              </>
            )}
          </button>

          {showDetails && (
            <div className="mt-3 max-h-80 overflow-y-auto rounded-lg">
              <div className="space-y-2">
                {[...result.details].reverse().map((detail) => (
                  <div
                    key={detail.testCaseNumber}
                    className={`border-2 rounded-lg p-3 shadow-md transition-all ${
                      detail.passed 
                        ? 'border-green-300 bg-gradient-to-r from-green-50 to-emerald-50' 
                        : 'border-red-300 bg-gradient-to-r from-red-50 to-pink-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs flex items-center gap-1">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs text-white ${
                          detail.passed ? 'bg-green-500' : 'bg-red-500'
                        }`}>
                          {detail.testCaseNumber}
                        </span>
                        测试用例 #{detail.testCaseNumber}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-semibold shadow-sm ${
                          detail.passed ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                        }`}
                      >
                        {detail.passed ? '✓ 通过' : '✗ 失败'}
                      </span>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <span className="font-semibold text-gray-700">输入:</span>
                        <pre className="bg-white border rounded-lg p-2 mt-1 overflow-x-auto break-words whitespace-pre-wrap max-w-full shadow-sm">
                          {detail.input}
                        </pre>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">标准输出:</span>
                        <pre className="bg-white border rounded-lg p-2 mt-1 overflow-x-auto break-words whitespace-pre-wrap max-w-full shadow-sm">
                          {detail.expectedOutput}
                        </pre>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">你的输出:</span>
                        <pre className="bg-white border rounded-lg p-2 mt-1 overflow-x-auto break-words whitespace-pre-wrap max-w-full shadow-sm">
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
