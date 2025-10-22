'use client';

import { useState, useEffect } from 'react';

export default function AuthAnimation({ type = 'login' }) {
  const [currentCode, setCurrentCode] = useState(0);
  const [typingText, setTypingText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  const codeExamples = type === 'login' ? [
    {
      title: "Welcome Back, Developer!",
      code: `// Reconnecting to KODESPACE...
const developer = authenticate(credentials);

if (developer.isVerified) {
  console.log("Welcome back, " + developer.name);
  developer.loadProjects();
  developer.connectToCommunity();
}

// Your coding journey continues here
return dashboard.render();`,
      language: "JavaScript"
    },
    {
      title: "Access Your Code Vault",
      code: `# Python: Loading your snippets
import kodespace

user = kodespace.login(email, password)

# Retrieve your saved snippets
snippets = user.get_my_snippets()
favorites = user.get_bookmarks()

print(f"Welcome back! You have {len(snippets)} snippets")
print("Ready to code amazing things!")`,
      language: "Python"
    },
    {
      title: "Resume Your Journey",
      code: `// TypeScript: Dashboard initialization
interface Developer {
  name: string;
  level: string;
  snippets: number;
  reputation: number;
}

const loadDashboard = async (): Promise<Developer> => {
  const user = await authenticateUser();
  return {
    name: user.name,
    level: user.level,
    snippets: user.totalSnippets,
    reputation: user.reputation
  };
};`,
      language: "TypeScript"
    }
  ] : [
    {
      title: "Join the Elite Developers",
      code: `// Creating your developer profile...
const newDeveloper = {
  name: form.fullName,
  email: form.email,
  level: "Junior Developer",
  joined: new Date(),
  reputation: 0
};

console.log("Welcome to KODESPACE!");
console.log("Your coding adventure begins now!");

// Ready to share amazing code?
return profile.create(newDeveloper);`,
      language: "JavaScript"
    },
    {
      title: "Build Your Coding Legacy",
      code: `# Python: Your journey starts here
import kodespace
from datetime import datetime

class Developer:
    def __init__(self, name, email):
        self.name = name
        self.email = email
        self.joined = datetime.now()
        self.level = "Rising Star"

    def start_journey(self):
        print(f"Welcome {self.name}!")
        print("Ready to code the future?")

new_dev = Developer(name, email)
new_dev.start_journey()`,
      language: "Python"
    },
    {
      title: "Start Your Success Story",
      code: `// React: Building your first component
import React, { useState } from 'react';

const DeveloperProfile = () => {
  const [achievements, setAchievements] = useState([]);
  const [isReady, setIsReady] = useState(true);

  return (
    <div className="developer-journey">
      <h1>Welcome to KODESPACE!</h1>
      <p>Your success story starts here</p>
      {isReady && <StartCoding />}
    </div>
  );
};

export default DeveloperProfile;`,
      language: "React"
    }
  ];

  const features = type === 'login' ? [
    {
      icon: "🚀",
      title: "Your Dashboard Awaits",
      description: "Access your personal coding dashboard with all your snippets and achievements"
    },
    {
      icon: "💎",
      title: "Elite Status",
      description: "Continue building your reputation in the developer community"
    },
    {
      icon: "🎯",
      title: "Pick Up Where You Left",
      description: "Resume your coding projects and collaborate with fellow developers"
    }
  ] : [
    {
      icon: "🌟",
      title: "Start Your Journey",
      description: "Join thousands of developers sharing and learning code together"
    },
    {
      icon: "⚡",
      title: "Instant Verification",
      description: "Get your code reviewed by expert developers and build trust"
    },
    {
      icon: "🔥",
      title: "Level Up Fast",
      description: "Earn achievements and climb the developer ranks in our community"
    }
  ];

  // Typing animation effect
  useEffect(() => {
    const currentExample = codeExamples[currentCode];
    const fullText = currentExample.code;

    if (isTyping) {
      let index = 0;
      const typingInterval = setInterval(() => {
        if (index <= fullText.length) {
          setTypingText(fullText.slice(0, index));
          index++;
        } else {
          setIsTyping(false);
          clearInterval(typingInterval);

          // Wait 3 seconds then move to next example
          setTimeout(() => {
            setCurrentCode((prev) => (prev + 1) % codeExamples.length);
            setTypingText('');
            setIsTyping(true);
          }, 3000);
        }
      }, 50);

      return () => clearInterval(typingInterval);
    }
  }, [currentCode, isTyping, codeExamples]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg animate-pulse-glow">
            <span className="text-white font-bold text-xl">K</span>
          </div>
          <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            KODESPACE
          </span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          {type === 'login' ? 'Welcome Back!' : 'Join the Revolution!'}
        </h2>
        <p className="text-purple-200">
          {type === 'login'
            ? 'Ready to continue your coding journey?'
            : 'Start your developer journey with us'
          }
        </p>
      </div>

      {/* Animated Code Display */}
      <div className="flex-1 mb-8">
        <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-purple-500/20">
          {/* Terminal Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>
              <span className="text-gray-400 text-sm font-mono">{codeExamples[currentCode].title.toLowerCase().replace(/\s+/g, '-')}.{codeExamples[currentCode].language.toLowerCase()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs font-medium">
                LIVE
              </div>
              <div className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs font-medium">
                {codeExamples[currentCode].language}
              </div>
            </div>
          </div>

          {/* Code Content */}
          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-purple-300 mb-2">
                {codeExamples[currentCode].title}
              </h3>
            </div>

            <pre className="text-sm text-gray-100 font-mono leading-relaxed min-h-[300px]">
              <code>
                {typingText}
                {isTyping && <span className="animate-pulse bg-purple-400 text-purple-400">|</span>}
              </code>
            </pre>
          </div>

          {/* Progress Dots */}
          <div className="flex justify-center space-x-2 pb-4">
            {codeExamples.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentCode
                    ? 'bg-purple-400 scale-125'
                    : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Features List */}
      <div className="space-y-4">
        {features.map((feature, index) => (
          <div
            key={index}
            className="flex items-start space-x-4 p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 hover:bg-white/15 transition-all duration-300 animate-slide-in-left"
            style={{ animationDelay: `${index * 200}ms` }}
          >
            <div className="text-2xl">{feature.icon}</div>
            <div>
              <h4 className="font-semibold text-white mb-1">{feature.title}</h4>
              <p className="text-sm text-purple-200 leading-relaxed">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Stats */}
      <div className="mt-8 grid grid-cols-3 gap-4 text-center">
        <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
          <div className="text-xl font-bold text-white">12K+</div>
          <div className="text-xs text-purple-200">Developers</div>
        </div>
        <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
          <div className="text-xl font-bold text-white">89K+</div>
          <div className="text-xs text-purple-200">Snippets</div>
        </div>
        <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
          <div className="text-xl font-bold text-white">99%</div>
          <div className="text-xs text-purple-200">Verified</div>
        </div>
      </div>
    </div>
  );
}