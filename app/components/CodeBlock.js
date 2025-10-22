'use client';

import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function CodeBlock({
  code,
  language = 'text',
  showCopyButton = true,
  maxHeight = null,
  theme = 'dark'
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  // Language mapping for better syntax highlighting
  const getLanguage = (lang) => {
    const langMap = {
      'javascript': 'javascript',
      'typescript': 'typescript',
      'python': 'python',
      'java': 'java',
      'c++': 'cpp',
      'c#': 'csharp',
      'php': 'php',
      'ruby': 'ruby',
      'go': 'go',
      'rust': 'rust',
      'swift': 'swift',
      'kotlin': 'kotlin',
      'dart': 'dart',
      'html': 'markup',
      'css': 'css',
      'sql': 'sql',
      'bash': 'bash',
      'powershell': 'powershell',
      'dockerfile': 'docker',
      'yaml': 'yaml',
      'json': 'json',
      'xml': 'xml'
    };

    return langMap[lang.toLowerCase()] || 'text';
  };

  const style = theme === 'dark' ? oneDark : oneLight;

  return (
    <div className="relative">
      {showCopyButton && (
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 z-10 flex items-center px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded transition-colors"
        >
          {copied ? (
            <>
              <span className="mr-1">✓</span>
              Copied!
            </>
          ) : (
            <>
              <span className="mr-1">📋</span>
              Copy
            </>
          )}
        </button>
      )}

      <SyntaxHighlighter
        language={getLanguage(language)}
        style={style}
        customStyle={{
          margin: 0,
          borderRadius: '0.5rem',
          fontSize: '14px',
          lineHeight: '1.5',
          maxHeight: maxHeight,
          overflow: maxHeight ? 'auto' : 'visible',
        }}
        showLineNumbers={true}
        wrapLines={true}
        wrapLongLines={true}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}