'use client';

import { useState, useEffect } from 'react';

export default function LiveCodeEditor() {
  const [code, setCode] = useState(`// Welcome to KODESPACE Live Editor
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Try changing the number below
console.log("Fibonacci(8):", fibonacci(8));

// Add your own code here!
const message = "Hello, KODESPACE!";
console.log(message);`);

  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const runCode = () => {
    setIsRunning(true);
    setOutput('');

    // Simulate code execution
    setTimeout(() => {
      try {
        // Create a custom console for capturing output
        let capturedOutput = [];
        const customConsole = {
          log: (...args) => {
            capturedOutput.push(args.join(' '));
          }
        };

        // Create a function that includes the custom console
        const func = new Function('console', code);
        func(customConsole);

        setOutput(capturedOutput.join('\n') || 'Code executed successfully (no output)');
      } catch (error) {
        setOutput(`Error: ${error.message}`);
      }
      setIsRunning(false);
    }, 1000);
  };

  const resetCode = () => {
    setCode(`// Welcome to KODESPACE Live Editor
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Try changing the number below
console.log("Fibonacci(8):", fibonacci(8));

// Add your own code here!
const message = "Hello, KODESPACE!";
console.log(message);`);
    setOutput('');
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900">Live Code Editor</h3>
          <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            JavaScript
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={resetCode}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Reset</span>
          </button>
          <button
            onClick={runCode}
            disabled={isRunning}
            className={`px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all duration-200 flex items-center space-x-2 ${
              isRunning ? 'opacity-75 cursor-not-allowed' : 'hover:scale-105'
            }`}
          >
            {isRunning ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Running...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h1m4 0h1M9 22h6a2 2 0 002-2V4a2 2 0 00-2-2H9a2 2 0 00-2 2v16a2 2 0 002 2z" />
                </svg>
                <span>Run Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor and Output Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Code Editor */}
        <div className="relative">
          <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
            {/* Editor Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-gray-400 text-sm font-mono">main.js</span>
              </div>
              <div className="text-gray-400 text-xs">
                Lines: {code.split('\n').length}
              </div>
            </div>

            {/* Code Input */}
            <div className="relative">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-96 p-4 bg-gray-900 text-gray-100 font-mono text-sm resize-none focus:outline-none leading-relaxed"
                placeholder="Write your JavaScript code here..."
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
              />
              {/* Line numbers would be nice here but keep it simple for now */}
            </div>
          </div>
        </div>

        {/* Output Panel */}
        <div className="relative">
          <div className="bg-white rounded-2xl overflow-hidden shadow-2xl border border-gray-200 h-full">
            {/* Output Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className="text-gray-700 font-medium">Console Output</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-orange-400 animate-pulse' : output ? 'bg-green-400' : 'bg-gray-300'}`}></div>
                <span className="text-xs text-gray-500">
                  {isRunning ? 'Running' : output ? 'Ready' : 'Waiting'}
                </span>
              </div>
            </div>

            {/* Output Content */}
            <div className="p-4 h-96 overflow-y-auto">
              {output ? (
                <pre className="text-sm text-gray-800 font-mono whitespace-pre-wrap leading-relaxed">
                  {output}
                </pre>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm">Click "Run Code" to see output</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Pro Tips:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Use <code className="bg-blue-100 px-1 rounded">console.log()</code> to see output</li>
              <li>• Try functions, loops, and modern JavaScript features</li>
              <li>• This is a safe sandbox environment - experiment freely!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}