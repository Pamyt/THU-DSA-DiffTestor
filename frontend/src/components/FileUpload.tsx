import React, { useState } from 'react';

interface FileUploadProps {
  pa: string;
  problem: number;
  onUpload: (file: File) => void;
  onBack: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ pa, problem, onUpload, onBack }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          {pa} - 题目 {problem}
        </h2>
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          ← 返回
        </button>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept=".cpp"
          onChange={handleFileChange}
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer"
        >
          <div className="space-y-2">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="text-gray-600">
              <span className="text-blue-600 hover:text-blue-700 font-medium">
                点击上传
              </span>
              {' '}或拖拽文件到此处
            </div>
            <p className="text-xs text-gray-500">
              支持 .cpp 文件 (将在服务器端编译)
            </p>
          </div>
        </label>
      </div>

      {selectedFile && (
        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600">
            已选择文件: <span className="font-medium">{selectedFile.name}</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            大小: {(selectedFile.size / 1024).toFixed(2)} KB
          </p>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!selectedFile}
        className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
      >
        开始对拍
      </button>
    </div>
  );
};

export default FileUpload;
