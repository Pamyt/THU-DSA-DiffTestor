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
  const [testId, setTestId] = useState<string>('');

  const handleProblemSelect = (pa: string, problem: number) => {
    setSelectedPA(pa);
    setSelectedProblem(problem);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            清华大学数据结构对拍系统
          </h1>
          <p className="text-gray-600">
            THU DSA DiffTestor - 自动化程序正确性验证
          </p>
        </header>

        <div className="max-w-3xl mx-auto">
          {stage === 'select' && (
            <ProblemSelector onSelect={handleProblemSelect} />
          )}

          {stage === 'upload' && (
            <FileUpload
              pa={selectedPA}
              problem={selectedProblem}
              onUpload={handleFileUpload}
              onBack={handleBack}
            />
          )}

          {stage === 'testing' && testId && (
            <TestResultDisplay testId={testId} onBack={handleBack} />
          )}
        </div>

        <footer className="text-center mt-12 text-gray-500 text-sm">
          <p>© 2025 THU DSA DiffTestor. 用于数据结构课程程序测试.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
