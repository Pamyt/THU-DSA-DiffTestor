import React, { useState, useEffect } from 'react';
import { Problems } from '../types';
import { api } from '../api';

interface ProblemSelectorProps {
  onSelect: (pa: string, problem: number) => void;
}

const ProblemSelector: React.FC<ProblemSelectorProps> = ({ onSelect }) => {
  const [problems, setProblems] = useState<Problems | null>(null);
  const [selectedPA, setSelectedPA] = useState<string>('');
  const [selectedProblem, setSelectedProblem] = useState<number>(0);

  useEffect(() => {
    api.getProblems().then(setProblems);
  }, []);

  const handlePAChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPA(e.target.value);
    setSelectedProblem(0);
  };

  const handleProblemChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProblem(parseInt(e.target.value));
  };

  const handleSubmit = () => {
    if (selectedPA && selectedProblem) {
      onSelect(selectedPA, selectedProblem);
    }
  };

  if (!problems) {
    return <div className="text-center py-4">加载中...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">选择题目</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            选择PA
          </label>
          <select
            value={selectedPA}
            onChange={handlePAChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">请选择PA</option>
            {Object.keys(problems).map((pa) => (
              <option key={pa} value={pa}>
                {pa}
              </option>
            ))}
          </select>
        </div>

        {selectedPA && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              选择题目
            </label>
            <select
              value={selectedProblem}
              onChange={handleProblemChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="0">请选择题目</option>
              {problems[selectedPA as keyof Problems].map((problem) => (
                <option key={problem.id} value={problem.id}>
                  题目 {problem.id}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!selectedPA || !selectedProblem}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          确认选择
        </button>
      </div>
    </div>
  );
};

export default ProblemSelector;
