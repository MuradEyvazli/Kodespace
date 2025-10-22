'use client';

import Navbar from '../components/Navbar';
import Link from 'next/link';

export default function About() {
  const teamMembers = [
    {
      name: "Alex Chen",
      role: "Founder & CEO",
      avatar: "AC",
      bio: "Former Google engineer with 10+ years in developer tools",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      name: "Sarah Kim",
      role: "CTO",
      avatar: "SK",
      bio: "Ex-Microsoft architect, expert in distributed systems",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      name: "Marcus Rodriguez",
      role: "Head of Community",
      avatar: "MR",
      bio: "Developer advocate with passion for open source",
      gradient: "from-emerald-500 to-teal-500"
    },
    {
      name: "Elena Volkov",
      role: "Lead Designer",
      avatar: "EV",
      bio: "UX expert focused on developer experience",
      gradient: "from-orange-500 to-red-500"
    }
  ];

  const milestones = [
    {
      year: "2023",
      title: "Founded",
      description: "KODESPACE was born from a simple idea: make code sharing better",
      icon: "🚀"
    },
    {
      year: "2024",
      title: "Community Growth",
      description: "Reached 10,000+ active developers and 50,000+ code snippets",
      icon: "📈"
    },
    {
      year: "2024",
      title: "AI Integration",
      description: "Launched AI-powered code analysis and verification system",
      icon: "🤖"
    },
    {
      year: "2025",
      title: "The Future",
      description: "Building the next generation of developer collaboration tools",
      icon: "🔮"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <div className="relative overflow-hidden pt-20 pb-16">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-purple-100 rounded-full border border-purple-200 mb-8">
              <span className="text-purple-700 text-sm font-mono">// About Us</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Building the Future of
              <span className="block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Developer Collaboration
              </span>
            </h1>

            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              KODESPACE is more than a code sharing platform. We're creating a global community
              where developers learn, share, and build amazing things together.
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full border border-blue-200 mb-6">
                <span className="text-blue-700 text-sm font-mono">// Our Mission</span>
              </div>

              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Democratizing Code Knowledge
              </h2>

              <div className="space-y-4 text-lg text-gray-600">
                <p>
                  We believe that great code should be accessible to everyone. Our platform
                  removes barriers between experienced developers and those just starting their journey.
                </p>
                <p>
                  Through expert verification, AI-powered insights, and community collaboration,
                  we're building the definitive source of high-quality code snippets.
                </p>
                <p>
                  Every snippet shared, every verification completed, and every developer helped
                  brings us closer to a world where coding knowledge flows freely.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
                <div className="flex items-center px-4 py-3 bg-gray-800 border-b border-gray-700">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-gray-400 text-sm font-mono">mission.js</span>
                  </div>
                </div>
                <div className="p-6 font-mono text-sm">
                  <div className="text-gray-400 mb-2">// Our core values</div>
                  <div className="text-cyan-400 mb-1">const mission = {`{"{"}`}</div>
                  <div className="text-gray-300 ml-4">
                    <div><span className="text-yellow-400">accessibility</span>: <span className="text-green-400">"Code for everyone"</span>,</div>
                    <div><span className="text-yellow-400">quality</span>: <span className="text-green-400">"Expert verified"</span>,</div>
                    <div><span className="text-yellow-400">community</span>: <span className="text-green-400">"Developers first"</span>,</div>
                    <div><span className="text-yellow-400">innovation</span>: <span className="text-green-400">"AI-powered future"</span></div>
                  </div>
                  <div className="text-cyan-400">{`};`}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-emerald-100 rounded-full border border-emerald-200 mb-6">
              <span className="text-emerald-700 text-sm font-mono">// Our Team</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Meet the Visionaries
            </h2>
            <p className="text-xl text-gray-600">
              Passionate developers building tools for developers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl p-6 border border-gray-200 hover:border-purple-300 transition-all duration-300 hover:transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <div className="text-center">
                  <div className={`w-20 h-20 bg-gradient-to-br ${member.gradient} rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    {member.avatar}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-purple-600 font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-orange-100 rounded-full border border-orange-200 mb-6">
              <span className="text-orange-700 text-sm font-mono">// Our Journey</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              The KODESPACE Story
            </h2>
            <p className="text-xl text-gray-600">
              From idea to global developer platform
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>

            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className={`flex items-center ${
                    index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                  }`}
                >
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8'}`}>
                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="text-4xl mb-3">{milestone.icon}</div>
                      <div className="text-2xl font-bold text-purple-600 mb-2">{milestone.year}</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{milestone.title}</h3>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  </div>

                  <div className="relative z-10">
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full border-4 border-white shadow-lg"></div>
                  </div>

                  <div className="w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-pink-100 rounded-full border border-pink-200 mb-6">
              <span className="text-pink-700 text-sm font-mono">// Our Values</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Drives Us
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "🌟",
                title: "Excellence",
                description: "We strive for the highest quality in everything we build and every interaction we have."
              },
              {
                icon: "🤝",
                title: "Community",
                description: "Developers helping developers. We believe in the power of collaboration and shared knowledge."
              },
              {
                icon: "🚀",
                title: "Innovation",
                description: "We're always pushing boundaries, exploring new technologies, and reimagining what's possible."
              }
            ].map((value, index) => (
              <div
                key={index}
                className="text-center p-8 bg-white rounded-2xl border border-gray-200 hover:border-purple-300 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <div className="text-6xl mb-6">{value.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Join Our Mission
          </h2>
          <p className="text-xl text-purple-100 mb-12">
            Be part of the community that's shaping the future of code sharing
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/auth/signup"
              className="px-8 py-4 bg-white text-purple-600 font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Start Contributing
            </Link>
            <Link
              href="/snippets"
              className="px-8 py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-all duration-300"
            >
              Explore Code
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}