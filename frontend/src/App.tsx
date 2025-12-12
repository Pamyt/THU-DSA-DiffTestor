import { useState } from 'react';
import ProblemSelector from './components/ProblemSelector';
import FileUpload from './components/FileUpload';
import TestResultDisplay from './components/TestResultDisplay';
import { api } from './api';

type Stage = 'select' | 'upload' | 'testing';

function App() {
  const [stage, setStage] = useState<Stage>('select');
  const [selectedPA, setSelectedPA] = useState<string>('');
  const [selectedProblem, setSelectedProblem] = useState<number>(0);
  const [selectedProblemName, setSelectedProblemName] = useState<string>('');
  const [testId, setTestId] = useState<string>('');

  const handleProblemSelect = (pa: string, problem: number, problemName: string) => {
    setSelectedPA(pa);
    setSelectedProblem(problem);
    setSelectedProblemName(problemName);
    setStage('upload');
  };

  const handleFileUpload = async (file: File) => {
    try {
      const response = await api.uploadAndTest(selectedPA, selectedProblem, file);
      setTestId(response.testId);
      setStage('testing');
    } catch (error) {
      console.error('上传失败:', error);
      alert('上传失败,请重试');
    }
  };

  const handleBack = () => {
    if (stage === 'upload') {
      setStage('select');
    } else if (stage === 'testing') {
      setStage('select');
      setTestId('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="text-center mb-12">
          <div className="inline-block mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            清华大学数据结构对拍系统
          </h1>
          <p className="text-gray-600 text-lg">
            THU DSA DiffTestor - 自动化程序正确性验证
          </p>
        </header>

        <div className="max-w-6xl mx-auto">
          {stage === 'select' && (
            <ProblemSelector onSelect={handleProblemSelect} />
          )}

          {stage === 'upload' && (
            <FileUpload
              pa={selectedPA}
              problem={selectedProblem}
              problemName={selectedProblemName}
              onUpload={handleFileUpload}
              onBack={handleBack}
            />
          )}

          {stage === 'testing' && testId && (
            <TestResultDisplay testId={testId} onBack={handleBack} />
          )}
        </div>

        <footer className="text-center mt-16 text-gray-500 text-sm">
          <p>© 2025 THU DSA DiffTestor. 用于数据结构课程程序测试.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
