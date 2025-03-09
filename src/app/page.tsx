import Image from "next/image";
import React from "react";
import Link from "next/link";
import { Languages, BookOpen, Globe, Calculator, ArrowRight, CheckCircle, Star, Users, Trophy, Sparkles, Brain, Zap } from "lucide-react";
import students from "../../public/students-studying.jpg";

export default function Home() {
  return (
    <div className="bg-white text-gray-900">
      {/* Hero Section - Redesigned with animated gradients and floating elements */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50">
        {/* Animated floating shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-60 -right-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-10 left-1/4 w-56 h-56 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 font-medium mb-6">
                <Sparkles className="w-4 h-4 mr-2" />
                <span>Powered by Advanced AI</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-6">
                Smart Learning,<br /> <span className="text-blue-600">AI-Powered Results</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8">
                Experience personalized education enhanced by artificial intelligence.
                Our platform adapts to your learning style and delivers custom-tailored content to maximize your success.
              </p>
              
              <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-4">
                <Link
                  href="/auth/signup"
                  className="px-6 py-3 text-lg font-medium text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:-translate-y-1"
                >
                  Get Started Free
                </Link>
                <Link
                  href="/about"
                  className="px-6 py-3 text-lg font-medium text-blue-700 bg-blue-100 rounded-lg shadow-lg hover:bg-blue-200 transition-all duration-300 transform hover:-translate-y-1"
                >
                  Learn More
                </Link>
              </div>
              
              {/* Social proof */}
              <div className="mt-10 flex items-center justify-center lg:justify-start">
                <div className="flex -space-x-2 mr-4">
                  {[1,2,3,4].map(i => (
                    <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-blue-${i*100} flex items-center justify-center text-white text-xs font-bold`}>
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-bold text-blue-600">4.9/5</span> from over 2,000 students
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/2 relative">
              {/* Decorative elements */}
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-blue-100 rounded-lg rotate-12 z-0"></div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-blue-200 rounded-lg -rotate-12 z-0"></div>
              
              {/* Main image with floating cards */}
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                <Image
                  className="w-full h-auto"
                  src={students}
                  width={600}
                  height={400}
                  alt="Students studying"
                />
                
                {/* Floating achievement card */}
                <div className="absolute -right-8 -bottom-4 bg-white p-3 rounded-lg shadow-lg transform rotate-3 animate-float">
                  <div className="flex items-center">
                    <Trophy className="text-yellow-500 h-6 w-6 mr-2" />
                    <div>
                      <div className="text-sm font-bold">Achievement Unlocked!</div>
                      <div className="text-xs text-gray-500">French Basics Mastered</div>
                    </div>
                  </div>
                </div>
                
                {/* Floating AI recommendation card */}
                <div className="absolute right-10 top-4 bg-white p-3 rounded-lg shadow-lg transform rotate-6 animate-float animation-delay-1000">
                  <div className="flex items-center">
                    <Brain className="text-blue-500 h-5 w-5 mr-2" />
                    <div>
                      <div className="text-xs font-bold">AI Recommendation</div>
                      <div className="text-xs text-gray-500">Focus on verb tenses next</div>
                    </div>
                  </div>
                </div>
                
                {/* Floating progress card */}
                <div className="absolute -left-8 top-10 bg-white p-3 rounded-lg shadow-lg transform -rotate-6 animate-float animation-delay-2000">
                  <div className="flex flex-col">
                    <div className="text-sm font-bold mb-1">Course Progress</div>
                    <div className="w-36 h-2 bg-gray-200 rounded-full">
                      <div className="w-3/4 h-2 bg-blue-600 rounded-full"></div>
                    </div>
                    <div className="text-xs text-right text-gray-500 mt-1">75% Complete</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section - New */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "15+", label: "Languages", icon: <Languages className="h-6 w-6 mx-auto mb-2 text-blue-500" /> },
              { value: "98%", label: "Success Rate", icon: <CheckCircle className="h-6 w-6 mx-auto mb-2 text-blue-500" /> },
              { value: "25,000+", label: "Students", icon: <Users className="h-6 w-6 mx-auto mb-2 text-blue-500" /> },
              { value: "24/7", label: "AI Support", icon: <Brain className="h-6 w-6 mx-auto mb-2 text-blue-500" /> }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                {stat.icon}
                <div className="text-3xl font-bold text-blue-600">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Features Section - New */}
      <div className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 font-medium mb-4">
              <Sparkles className="w-4 h-4 mr-2" />
              <span>Artificial Intelligence</span>
            </div>
            <h2 className="text-4xl font-bold mb-4">Powered by Advanced AI</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform leverages cutting-edge artificial intelligence to deliver personalized learning experiences tailored to your needs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {[
              {
                title: "Personalized Learning Path",
                icon: <Brain className="h-12 w-12 text-blue-600" />,
                description: "Our AI analyzes your learning style, strengths, and areas for improvement to create a custom curriculum just for you."
              },
              {
                title: "Intelligent Assessment",
                icon: <Zap className="h-12 w-12 text-purple-600" />,
                description: "Get detailed feedback on your performance with AI-powered analysis of speaking, writing, and comprehension skills."
              },
              {
                title: "Adaptive Difficulty",
                icon: <Sparkles className="h-12 w-12 text-indigo-600" />,
                description: "The platform automatically adjusts difficulty levels based on your progress, ensuring optimal challenge for faster learning."
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-8 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                <div className="bg-blue-50 inline-flex p-4 rounded-lg mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section - Redesigned with more visual appeal */}
      <div className="py-20 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-7xl mx-auto text-center px-6">
          <div className="inline-block mb-4 px-4 py-1 bg-blue-100 rounded-full text-blue-600 font-medium">
            Our Expertise
          </div>
          <h2 className="text-4xl font-bold">Explore Our Premium Courses</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Choose from our expertly designed programs enhanced with AI technology for personalized learning
          </p>
          
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[{
              title: "French Language",
              icon: <Languages className="h-10 w-10" />,
              description: "Immerse yourself in French with interactive lessons and real-world practice.",
              features: ["Conversational focus", "Native speakers", "Cultural immersion"]
            }, {
              title: "IELTS Preparation",
              icon: <BookOpen className="h-10 w-10" />,
              description: "Comprehensive preparation for all four IELTS modules with authentic practice tests.",
              features: ["Band 7+ strategies", "Mock interviews", "AI-powered feedback"]
            }, {
              title: "TOEFL Preparation",
              icon: <Globe className="h-10 w-10" />,
              description: "Master the TOEFL with targeted strategies and practice for each section.",
              features: ["Section-specific tactics", "Essay workshops", "Pronunciation clinic"]
            }, {
              title: "SATS Preparation",
              icon: <Calculator className="h-10 w-10" />,
              description: "Excel in your SATS with comprehensive math, reading, and writing preparation.",
              features: ["Problem-solving methods", "Vocabulary building", "Time management"]
            }].map((course, index) => (
              <div key={index} className="group relative bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                <div className="p-8">
                  <div className="p-4 bg-blue-600 text-white rounded-xl inline-flex transform -rotate-3 group-hover:rotate-0 transition-transform duration-300">
                    {course.icon}
                  </div>
                  <h3 className="mt-6 text-2xl font-semibold">{course.title}</h3>
                  <p className="mt-4 text-gray-600">{course.description}</p>
                  
                  <div className="mt-6 space-y-2">
                    {course.features.map((feature, i) => (
                      <div key={i} className="flex items-center text-sm text-gray-500">
                        <CheckCircle className="h-4 w-4 text-blue-500 mr-2" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-8">
                    <Link href={`/courses/${course.title.toLowerCase().replace(/\s+/g, '-')}`} className="inline-flex items-center text-blue-600 font-medium">
                      Explore course <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section - New */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-block mb-4 px-4 py-1 bg-blue-100 rounded-full text-blue-600 font-medium">
              Student Success Stories
            </div>
            <h2 className="text-4xl font-bold">What Our Students Say</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Alex Johnson",
                photo: "A",
                role: "IELTS Student",
                text: "The IELTS preparation program helped me achieve a band score of 8.0! The strategies and practice tests were invaluable.",
                rating: 5
              },
              {
                name: "Maria Rodriguez",
                photo: "M",
                role: "French Language Student",
                text: "I went from complete beginner to confidently speaking French in just 6 months. The immersive approach really works!",
                rating: 5
              },
              {
                name: "David Kim",
                photo: "D",
                role: "SATS Student",
                text: "My SAT score improved by 200 points after taking this course. The math strategies and writing tips were game-changers.",
                rating: 4
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-blue-50 p-6 rounded-2xl">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg mr-4">
                    {testimonial.photo}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < testimonial.rating ? "text-yellow-500" : "text-gray-300"}`} fill={i < testimonial.rating ? "currentColor" : "none"} />
                  ))}
                </div>
                <p className="text-gray-600">{testimonial.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section - Redesigned with more visual interest */}
      <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 py-24 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full border-8 border-white"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full border-8 border-white"></div>
        </div>
        
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center text-white px-6 relative z-10">
          <div className="inline-block mb-4 px-4 py-1 bg-blue-500 bg-opacity-30 rounded-full text-white font-medium">
            Limited Time Offer
          </div>
          <h2 className="text-4xl md:text-5xl font-bold max-w-3xl">
            Ready to transform your learning journey and achieve your language goals?</h2>
          <p className="mt-6 text-xl text-blue-100 max-w-2xl">
            Join thousands of successful students who have mastered languages and aced their exams with our proven methods and expert guidance.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center">
            <Link
              href="/auth/signup"
              className="px-8 py-4 bg-white text-blue-600 rounded-lg shadow-lg text-lg font-semibold hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 flex items-center"
            >
              Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <div className="flex items-center text-blue-100">
              <Users className="h-5 w-5 mr-2" />
              <span>Over 500 new students this month</span>
            </div>
          </div>
          
          {/* Floating badges */}
          <div className="absolute -left-12 bottom-10 bg-blue-800 bg-opacity-50 backdrop-blur-sm p-3 rounded-lg transform -rotate-6 hidden lg:block">
            <div className="flex items-center">
              <Trophy className="text-yellow-400 h-5 w-5 mr-2" />
              <div className="text-sm">Top-rated courses</div>
            </div>
          </div>
          <div className="absolute -right-6 top-12 bg-blue-800 bg-opacity-50 backdrop-blur-sm p-3 rounded-lg transform rotate-3 hidden lg:block">
            <div className="flex items-center">
              <Star className="text-yellow-400 h-5 w-5 mr-2" fill="currentColor" />
              <div className="text-sm">Guaranteed results</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer note about AI */}
      <div className="py-8 bg-gray-100 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <Brain className="h-5 w-5 text-blue-600 mr-2" />
            <span className="font-medium text-blue-600">Powered by Advanced Artificial Intelligence</span>
          </div>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            Our platform uses state-of-the-art AI technology to deliver personalized learning experiences. 
            The AI continually adapts to your learning style, providing custom recommendations and feedback.
          </p>
        </div>
      </div>
    </div>
  );
}

