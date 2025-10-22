import Navbar from './components/Navbar';
import LiveCodeEditor from './components/LiveCodeEditor';
import InteractiveStats from './components/InteractiveStats';
import CommunityShowcase from './components/CommunityShowcase';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(99 102 241) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }}></div>
      </div>

      <Navbar />

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          {/* Terminal Window */}
          <div className="inline-block bg-gray-900 backdrop-blur-xl rounded-2xl border border-gray-200 shadow-2xl mb-12 overflow-hidden">
            <div className="flex items-center px-4 py-3 bg-gray-800 border-b border-gray-200">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="flex-1 text-center">
                <span className="text-gray-400 text-sm font-mono">kodespace.dev</span>
              </div>
            </div>
            <div className="p-8 font-mono text-left">
              <div className="text-green-400 mb-2">$ welcome to</div>
              <div className="text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                KODESPACE
              </div>
              <div className="text-gray-300 mb-4">
                <span className="text-cyan-400">const</span> <span className="text-yellow-400">purpose</span> = {'"'}
                <span className="text-green-400">Share, Verify & Learn Code</span>{'"'};
              </div>
              <div className="text-gray-400">// Where developers build the future together</div>
            </div>
          </div>

          <p className="mt-8 max-w-3xl mx-auto text-xl text-gray-700 leading-relaxed">
            Join the elite community of developers. Share your code, get expert verification,
            and contribute to an AI-powered knowledge base that's revolutionizing how we code.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              href="/auth/signup"
              className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Start Coding
              </span>
            </Link>

            <Link
              href="/snippets"
              className="group px-8 py-4 border-2 border-purple-600 text-purple-600 font-semibold rounded-xl hover:border-purple-700 hover:text-white hover:bg-purple-600 transition-all duration-300"
            >
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Explore Code
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Live Demo Section */}
      <div className="relative z-10 py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 rounded-full border border-green-200 mb-6">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
              <span className="text-green-700 text-sm font-mono">// Try It Live</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Interactive Code Playground
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Experience our live code editor - write, run, and share instantly
            </p>
          </div>

          <LiveCodeEditor />
        </div>
      </div>

      {/* Interactive Stats Section */}
      <div className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full border border-blue-200 mb-6">
              <span className="text-blue-700 text-sm font-mono">// Live Statistics</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Growing Developer Community
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of developers already building the future
            </p>
          </div>

          <InteractiveStats />
        </div>
      </div>

      {/* Community Showcase */}
      <CommunityShowcase />

      {/* Features Section */}
      <div className="relative z-10 py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-purple-100 rounded-full border border-purple-200 mb-6">
              <span className="text-purple-700 text-sm font-mono">// Features</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Developers Choose Us
            </h2>
            <p className="text-xl text-gray-600">Professional tools for professional developers</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: "Lightning Fast Sharing",
                description: "Share code snippets with syntax highlighting for 50+ languages. Real-time preview and instant publishing.",
                gradient: "from-blue-500 to-cyan-500"
              },
              {
                icon: (
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: "Expert Verification",
                description: "Senior developers review and verify code quality. Build trust through peer validation and expert insights.",
                gradient: "from-purple-500 to-pink-500"
              },
              {
                icon: (
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                ),
                title: "AI-Powered Intelligence",
                description: "Our AI learns from verified code to provide intelligent suggestions and automated code analysis.",
                gradient: "from-emerald-500 to-teal-500"
              }
            ].map((feature, index) => (
              <div key={index} className="group relative">
                <div className="h-full p-8 bg-white rounded-2xl border border-gray-200 hover:border-purple-300 transition-all duration-300 hover:transform hover:scale-105 shadow-lg hover:shadow-xl">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-6`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Developer Ranks Section */}
      <div className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 rounded-full border border-green-200 mb-6">
              <span className="text-green-700 text-sm font-mono">// Progression System</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Level Up Your Career
            </h2>
            <p className="text-xl text-gray-600">Gain recognition and unlock new privileges as you contribute</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                rank: 'Junior Developer',
                desc: 'Start your journey, learn from the community',
                icon: '🌱',
                color: 'from-green-500 to-emerald-500',
                border: 'border-green-500/30'
              },
              {
                rank: 'Mid-Level Developer',
                desc: 'Contribute actively, help fellow developers',
                icon: '⚡',
                color: 'from-blue-500 to-cyan-500',
                border: 'border-blue-500/30'
              },
              {
                rank: 'Senior Developer',
                desc: 'Verify code quality, mentor others',
                icon: '👑',
                color: 'from-purple-500 to-pink-500',
                border: 'border-purple-500/30'
              },
              {
                rank: 'Lead Developer',
                desc: 'Guide teams, shape technical decisions',
                icon: '🎯',
                color: 'from-orange-500 to-red-500',
                border: 'border-orange-500/30'
              },
              {
                rank: 'Principal Engineer',
                desc: 'Drive innovation, architect solutions',
                icon: '🚀',
                color: 'from-indigo-500 to-purple-500',
                border: 'border-indigo-500/30'
              },
              {
                rank: 'Moderator',
                desc: 'Maintain community standards and culture',
                icon: '🛡️',
                color: 'from-slate-500 to-slate-600',
                border: 'border-slate-500/30'
              },
            ].map((item, index) => (
              <div key={index} className="group relative">
                <div className={`h-full p-6 bg-white backdrop-blur-xl rounded-2xl border border-gray-200 hover:border-purple-300 transition-all duration-300 hover:transform hover:scale-105 shadow-lg hover:shadow-xl`}>
                  <div className="flex items-center mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-xl mr-4`}>
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{item.rank}</h3>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 py-20 bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Join the Elite?
          </h2>
          <p className="text-xl text-slate-300 mb-12">
            Start contributing to the future of development today
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/auth/signup"
              className="px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Join KODESPACE
            </Link>
            <Link
              href="/snippets"
              className="px-10 py-4 border-2 border-white/20 text-white font-bold rounded-xl hover:bg-white/10 transition-all duration-300"
            >
              Browse Code
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
