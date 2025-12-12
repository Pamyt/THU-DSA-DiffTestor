import React, { useState, useEffect } from 'react';
import { Problems, Problem } from '../types';
import { api } from '../api';

interface ProblemSelectorProps {
  onSelect: (pa: string, problem: number, problemName: string) => void;
}

const ProblemSelector: React.FC<ProblemSelectorProps> = ({ onSelect }) => {
  const [problems, setProblems] = useState<Problems | null>(null);

  useEffect(() => {
    api.getProblems().then(setProblems);
  }, []);

  const handleProblemClick = (pa: string, problemId: number, problemName: string) => {
    onSelect(pa, problemId, problemName);
  };

  if (!problems) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const paColors = {
    PA1: 'from-blue-500 to-blue-600',
    PA2: 'from-purple-500 to-purple-600',
    PA3: 'from-pink-500 to-pink-600',
    PA4: 'from-indigo-500 to-indigo-600',
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">选择题目</h2>
        <p className="text-gray-600">点击题目卡片开始对拍</p>
      </div>

      {Object.entries(problems).map(([paName, paProblems]) => (
        <div
          key={paName}
          className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
        >
          {/* PA 标题卡片 */}
          <div className={`bg-gradient-to-r ${paColors[paName as keyof typeof paColors]} px-6 py-4`}>
            <h3 className="text-2xl font-bold text-white">{paName}</h3>
            <p className="text-white text-opacity-90 text-sm mt-1">
              {paProblems.length} 个题目
            </p>
          </div>

          {/* 题目小卡片 */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paProblems.map((problem: Problem) => (
                <button
                  key={problem.id}
                  onClick={() => handleProblemClick(paName, problem.id, problem.name)}
                  className="group relative bg-gradient-to-br from-gray-50 to-gray-100 hover:from-blue-50 hover:to-blue-100 rounded-xl p-5 text-left transition-all duration-300 hover:shadow-md hover:scale-105 border-2 border-gray-200 hover:border-blue-400"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-gray-500 mb-1">
                        题目 {problem.id}
                      </div>
                      <div className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                        {problem.name}
                      </div>
                    </div>
                    <div className="ml-2 w-8 h-8 rounded-full bg-blue-100 group-hover:bg-blue-500 flex items-center justify-center transition-colors">
                      <svg
                        className="w-4 h-4 text-blue-600 group-hover:text-white transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    点击开始对拍
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProblemSelector;
