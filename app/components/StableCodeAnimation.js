'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export default function StableCodeAnimation({ type = 'login' }) {
  const [currentExample, setCurrentExample] = useState(0);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [completedLines, setCompletedLines] = useState([]);
  const [isTyping, setIsTyping] = useState(true);
  const [showCursor, setShowCursor] = useState(true);

  const typingTimeoutRef = useRef();
  const exampleTimeoutRef = useRef();
  const cursorIntervalRef = useRef();

  const codeExamples = type === 'login' ? [
    {
      title: "Welcome Back, Developer!",
      language: "JavaScript",
      fileName: "dashboard.js",
      lines: [
        "// Welcome back to KODESPACE",
        "const developer = await authenticateUser(credentials);",
        "",
        "if (developer.isVerified) {",
        "  console.log(`Welcome back, ${developer.name}!`);",
        "  ",
        "  // Load your projects",
        "  const projects = await developer.getProjects();",
        "  const snippets = await developer.getSnippets();",
        "  ",
        "  // Connect to community",
        "  developer.connectToCommunity();",
        "  ",
        "  return {",
        "    status: 'success',",
        "    message: 'Ready to code amazing things!',",
        "    data: { projects, snippets }",
        "  };",
        "}"
      ]
    },
    {
      title: "Loading Your Workspace",
      language: "Python",
      fileName: "workspace.py",
      lines: [
        "# KODESPACE - Your coding sanctuary",
        "import kodespace",
        "from datetime import datetime",
        "",
        "class DeveloperWorkspace:",
        "    def __init__(self, user_id):",
        "        self.user = kodespace.User(user_id)",
        "        self.projects = []",
        "        self.last_login = datetime.now()",
        "    ",
        "    async def load_workspace(self):",
        "        print(f'Welcome back, {self.user.name}!')",
        "        ",
        "        # Restore your session",
        "        self.projects = await self.user.get_projects()",
        "        favorites = await self.user.get_bookmarks()",
        "        ",
        "        return f'Loaded {len(self.projects)} projects'"
      ]
    },
    {
      title: "Dashboard Initialization",
      language: "TypeScript",
      fileName: "types.ts",
      lines: [
        "// TypeScript interfaces for KODESPACE",
        "interface Developer {",
        "  id: string;",
        "  name: string;",
        "  email: string;",
        "  level: 'junior' | 'mid' | 'senior' | 'lead';",
        "  reputation: number;",
        "  joinedAt: Date;",
        "}",
        "",
        "interface DashboardData {",
        "  user: Developer;",
        "  stats: {",
        "    totalSnippets: number;",
        "    verifiedSnippets: number;",
        "    totalLikes: number;",
        "  };",
        "  recentActivity: Activity[];",
        "}"
      ]
    }
  ] : [
    {
      title: "Starting Your Journey",
      language: "JavaScript",
      fileName: "onboarding.js",
      lines: [
        "// Welcome to KODESPACE - Start your coding journey",
        "const newDeveloper = {",
        "  name: formData.fullName,",
        "  email: formData.email,",
        "  level: 'Rising Star',",
        "  joinedAt: new Date(),",
        "  reputation: 0",
        "};",
        "",
        "console.log('🚀 Creating your developer profile...');",
        "",
        "// Initialize your workspace",
        "const workspace = await createWorkspace(newDeveloper);",
        "const achievements = initializeAchievements();",
        "",
        "console.log('✨ Your coding adventure begins now!');",
        "console.log('Ready to share amazing code with the world?');"
      ]
    },
    {
      title: "Building Your Profile",
      language: "Python",
      fileName: "profile.py",
      lines: [
        "# KODESPACE Profile Builder",
        "import kodespace",
        "from typing import Optional",
        "",
        "class DeveloperProfile:",
        "    def __init__(self, name: str, email: str):",
        "        self.name = name",
        "        self.email = email",
        "        self.level = 'Junior Developer'",
        "        self.skills: list[str] = []",
        "        self.projects: list[dict] = []",
        "    ",
        "    def add_skill(self, skill: str) -> None:",
        "        if skill not in self.skills:",
        "            self.skills.append(skill)",
        "            print(f'Added skill: {skill} 🎯')",
        "    ",
        "    def level_up(self) -> str:",
        "        levels = ['Junior', 'Mid-Level', 'Senior', 'Lead']",
        "        # Your growth journey starts here!",
        "        return f'Leveling up to {levels[1]}! 🚀'"
      ]
    },
    {
      title: "Your Success Framework",
      language: "React",
      fileName: "Success.jsx",
      lines: [
        "// React Component: Your path to success",
        "import React, { useState, useEffect } from 'react';",
        "import { motion } from 'framer-motion';",
        "",
        "const SuccessJourney = ({ developer }) => {",
        "  const [milestones, setMilestones] = useState([]);",
        "  const [currentGoal, setCurrentGoal] = useState(null);",
        "  ",
        "  useEffect(() => {",
        "    // Initialize your success roadmap",
        "    const roadmap = generateRoadmap(developer.level);",
        "    setMilestones(roadmap);",
        "  }, [developer]);",
        "  ",
        "  return (",
        "    <motion.div className='success-container'>",
        "      <h1>Welcome to Your Success Story! 🌟</h1>",
        "      <p>Every expert was once a beginner.</p>",
        "    </motion.div>",
        "  );",
        "};"
      ]
    }
  ];

  // Syntax highlighting function
  const highlightSyntax = (line) => {
    if (!line) return <span>&nbsp;</span>;

    // Handle comments
    if (line.trim().startsWith('//') || line.trim().startsWith('#')) {
      return <span className="text-green-400">{line}</span>;
    }

    // Simple syntax highlighting
    const keywords = ['const', 'let', 'var', 'function', 'class', 'interface', 'import', 'from', 'export', 'default', 'async', 'await', 'if', 'else', 'return', 'def', 'self', 'useEffect', 'useState'];
    const words = line.split(/(\s+)/);

    return (
      <span>
        {words.map((word, index) => {
          const cleanWord = word.trim();
          if (keywords.includes(cleanWord)) {
            return <span key={index} className="text-purple-400">{word}</span>;
          } else if (word.includes('"') || word.includes("'") || word.includes('`')) {
            return <span key={index} className="text-yellow-300">{word}</span>;
          } else if (word.includes('(') && !word.startsWith('(')) {
            const funcName = word.split('(')[0];
            const rest = word.slice(funcName.length);
            return (
              <span key={index}>
                <span className="text-cyan-400">{funcName}</span>
                {rest}
              </span>
            );
          } else {
            return <span key={index} className="text-gray-100">{word}</span>;
          }
        })}
      </span>
    );
  };

  // Stable typing animation with cleanup
  const startTyping = useCallback(() => {
    const currentCode = codeExamples[currentExample];
    const currentLineText = currentCode.lines[currentLine] || '';

    if (currentChar < currentLineText.length) {
      // Continue typing current line
      typingTimeoutRef.current = setTimeout(() => {
        setCurrentChar(prev => prev + 1);
      }, Math.random() * 50 + 30);
    } else {
      // Line completed, move to next line
      typingTimeoutRef.current = setTimeout(() => {
        setCompletedLines(prev => [...prev, currentLineText]);
        setCurrentChar(0);

        if (currentLine < currentCode.lines.length - 1) {
          setCurrentLine(prev => prev + 1);
        } else {
          // Example completed
          setIsTyping(false);
          exampleTimeoutRef.current = setTimeout(() => {
            setCurrentExample(prev => (prev + 1) % codeExamples.length);
            setCurrentLine(0);
            setCurrentChar(0);
            setCompletedLines([]);
            setIsTyping(true);
          }, 3000);
        }
      }, 400);
    }
  }, [currentExample, currentLine, currentChar, codeExamples]);

  // Start typing when component mounts or state changes
  useEffect(() => {
    if (isTyping) {
      startTyping();
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (exampleTimeoutRef.current) {
        clearTimeout(exampleTimeoutRef.current);
      }
    };
  }, [isTyping, startTyping]);

  // Cursor blinking
  useEffect(() => {
    cursorIntervalRef.current = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => {
      if (cursorIntervalRef.current) {
        clearInterval(cursorIntervalRef.current);
      }
    };
  }, []);

  const currentCode = codeExamples[currentExample];
  const currentLineText = currentCode.lines[currentLine] || '';
  const typedText = currentLineText.slice(0, currentChar);

  const features = type === 'login' ? [
    {
      icon: "⚡",
      title: "Instant Access",
      description: "Jump right back into your projects and continue where you left off"
    },
    {
      icon: "🏆",
      title: "Your Achievements",
      description: "View your coding milestones and community contributions"
    },
    {
      icon: "🚀",
      title: "Advanced Tools",
      description: "Access professional development tools and AI-powered insights"
    }
  ] : [
    {
      icon: "🌟",
      title: "Start Strong",
      description: "Join a community of 12,000+ passionate developers building the future"
    },
    {
      icon: "📈",
      title: "Grow Fast",
      description: "Learn from verified code examples and expert feedback"
    },
    {
      icon: "🎯",
      title: "Achieve More",
      description: "Unlock achievements and climb the developer leaderboard"
    }
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center space-x-3 mb-4">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl animate-pulse-glow">
            <span className="text-white font-bold text-xl">K</span>
          </div>
          <div className="text-left">
            <div className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              KODESPACE
            </div>
            <div className="text-sm text-purple-300 font-mono">v2.0.1 - Professional Edition</div>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          {type === 'login' ? 'Welcome Back, Developer!' : 'Ready to Code the Future?'}
        </h2>
        <p className="text-purple-200">
          {type === 'login'
            ? 'Your workspace is ready and waiting'
            : 'Join the elite developer community'
          }
        </p>
      </div>

      {/* Professional Code Editor */}
      <div className="flex-1 mb-6">
        <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-purple-500/30 backdrop-blur-xl">
          {/* Editor Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full hover:bg-red-400 transition-colors cursor-pointer"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full hover:bg-yellow-400 transition-colors cursor-pointer"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full hover:bg-green-400 transition-colors cursor-pointer"></div>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <span className="text-gray-400 text-sm font-mono">{currentCode.fileName}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs font-medium border border-green-500/30">
                ● LIVE
              </div>
              <div className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs font-medium border border-purple-500/30">
                {currentCode.language}
              </div>
            </div>
          </div>

          {/* Code Content with Line Numbers */}
          <div className="flex">
            {/* Line Numbers */}
            <div className="bg-gray-850 px-4 py-4 text-gray-500 text-sm font-mono leading-relaxed border-r border-gray-700 select-none">
              {completedLines.map((_, index) => (
                <div key={index} className="h-6 flex items-center">
                  {(index + 1).toString().padStart(2, ' ')}
                </div>
              ))}
              {isTyping && (
                <div className="h-6 flex items-center text-purple-400">
                  {(completedLines.length + 1).toString().padStart(2, ' ')}
                </div>
              )}
            </div>

            {/* Code Content */}
            <div className="flex-1 p-4 font-mono text-sm leading-relaxed overflow-hidden min-h-80">
              {/* Completed Lines */}
              {completedLines.map((line, index) => (
                <div key={index} className="h-6 flex items-center">
                  {highlightSyntax(line)}
                </div>
              ))}

              {/* Current Typing Line */}
              {isTyping && (
                <div className="h-6 flex items-center">
                  {highlightSyntax(typedText)}
                  <span className={`inline-block w-2 h-5 bg-purple-400 ml-1 ${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100`}>
                  </span>
                </div>
              )}

              {/* Placeholder for remaining lines */}
              <div className="mt-2">
                <div className="text-gray-600 text-xs">
                  {type === 'login' ? '// Restoring your workspace...' : '// Building your future...'}
                </div>
              </div>
            </div>
          </div>

          {/* Editor Footer */}
          <div className="px-4 py-2 bg-gray-800 border-t border-gray-700 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-4 text-gray-400">
              <span>UTF-8</span>
              <span>{currentCode.language}</span>
              <span>Line {completedLines.length + 1}, Column {currentChar + 1}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400">Connected to KODESPACE</span>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center space-x-2 py-3 bg-gray-850">
            {codeExamples.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentExample
                    ? 'bg-purple-400 scale-125'
                    : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 gap-3 mb-6">
        {features.map((feature, index) => (
          <div
            key={index}
            className="flex items-start space-x-3 p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 hover:bg-white/15 transition-all duration-300 animate-slide-in-left"
            style={{
              animationDelay: `${index * 150}ms`
            }}
          >
            <div className="text-2xl flex-shrink-0">{feature.icon}</div>
            <div>
              <h4 className="font-semibold text-white mb-1">{feature.title}</h4>
              <p className="text-sm text-purple-200 leading-relaxed">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Stats Footer */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
          <div className="text-lg font-bold text-white">12K+</div>
          <div className="text-xs text-purple-200">Developers</div>
        </div>
        <div className="text-center p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
          <div className="text-lg font-bold text-white">89K+</div>
          <div className="text-xs text-purple-200">Snippets</div>
        </div>
        <div className="text-center p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
          <div className="text-lg font-bold text-white">99%</div>
          <div className="text-xs text-purple-200">Verified</div>
        </div>
      </div>
    </div>
  );
}