import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarIcon, TrendingUpIcon, BarChart3Icon, FileTextIcon } from 'lucide-react';
import { getBandScoreDescription } from '@/services/speechAnalysis';

interface PracticeSession {
  id: string;
  date: string;
  scores: {
    fluency: number;
    pronunciation: number;
    grammar: number;
    vocabulary: number;
    overall: number;
  };
  topic: string;
}

interface ProgressDashboardProps {
  practiceHistory: PracticeSession[];
  onStartNewPractice: () => void;
}

const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ 
  practiceHistory,
  onStartNewPractice 
}) => {
  const [recentSessions, setRecentSessions] = useState<PracticeSession[]>([]);
  const [totalPractices, setTotalPractices] = useState(0);
  const [averageScore, setAverageScore] = useState(0);
  const [improvementRate, setImprovementRate] = useState(0);
  const [mostImprovedArea, setMostImprovedArea] = useState<string>('');
  const [skillsToImprove, setSkillsToImprove] = useState<string[]>([]);
  
  useEffect(() => {
    // Sort sessions by date (newest first)
    const sortedSessions = [...practiceHistory].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    setRecentSessions(sortedSessions.slice(0, 5));
    setTotalPractices(practiceHistory.length);
    
    // Calculate average score
    if (practiceHistory.length > 0) {
      const totalOverallScore = practiceHistory.reduce((sum, session) => sum + session.scores.overall, 0);
      setAverageScore(totalOverallScore / practiceHistory.length);
      
      // Calculate improvement rate if we have enough sessions
      if (practiceHistory.length >= 2) {
        const oldestSession = sortedSessions[sortedSessions.length - 1];
        const newestSession = sortedSessions[0];
        const scoreDifference = newestSession.scores.overall - oldestSession.scores.overall;
        
        // Calculate improvement as percentage
        const improvement = (scoreDifference / oldestSession.scores.overall) * 100;
        setImprovementRate(improvement);
        
        // Find most improved area
        const areas = ['fluency', 'pronunciation', 'grammar', 'vocabulary'] as const;
        let maxImprovement = -Infinity;
        let improvedArea = '';
        
        areas.forEach(area => {
          const areaImprovement = newestSession.scores[area] - oldestSession.scores[area];
          if (areaImprovement > maxImprovement) {
            maxImprovement = areaImprovement;
            improvedArea = area;
          }
        });
        
        setMostImprovedArea(improvedArea);
        
        // Determine skills to improve based on most recent session
        const weakestSkills = areas
          .map(area => ({ area, score: newestSession.scores[area] }))
          .sort((a, b) => a.score - b.score)
          .slice(0, 2)
          .map(({ area }) => area);
          
        setSkillsToImprove(weakestSkills);
      }
    }
  }, [practiceHistory]);
  
  // Helper to format dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };
  
  // Helper to get color based on score
  const getScoreColor = (score: number) => {
    if (score >= 7.5) return 'text-green-600';
    if (score >= 6) return 'text-amber-600';
    return 'text-red-600';
  };
  
  // Helper to calculate practice frequency
  const getPracticeFrequency = () => {
    if (practiceHistory.length < 2) return 'Not enough data';
    
    const sortedDates = practiceHistory
      .map(session => new Date(session.date).getTime())
      .sort((a, b) => a - b);
    
    const intervals = [];
    for (let i = 1; i < sortedDates.length; i++) {
      const diffDays = (sortedDates[i] - sortedDates[i-1]) / (1000 * 60 * 60 * 24);
      intervals.push(diffDays);
    }
    
    const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
    
    if (avgInterval <= 2) return 'Frequent (Every 1-2 days)';
    if (avgInterval <= 7) return 'Regular (Weekly)';
    if (avgInterval <= 14) return 'Occasional (Bi-weekly)';
    return 'Irregular (Less than monthly)';
  };
  
  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-start">
            <div className="bg-blue-100 p-2 rounded-full mr-3">
              <CalendarIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Practice Sessions</h3>
              <p className="text-2xl font-bold text-gray-800">{totalPractices}</p>
              <p className="text-xs text-gray-500">{getPracticeFrequency()}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-start">
            <div className="bg-indigo-100 p-2 rounded-full mr-3">
              <BarChart3Icon className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Average Score</h3>
              <div className="flex items-baseline">
                <p className="text-2xl font-bold text-gray-800">{averageScore.toFixed(1)}</p>
                <span className="text-sm ml-1 text-gray-500">/9</span>
              </div>
              <p className="text-xs text-gray-500">{getBandScoreDescription(averageScore)}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-start">
            <div className="bg-green-100 p-2 rounded-full mr-3">
              <TrendingUpIcon className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Improvement</h3>
              <p className={`text-2xl font-bold ${improvementRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {improvementRate > 0 ? '+' : ''}{improvementRate.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500">
                {improvementRate > 5 ? 'Great progress!' : improvementRate > 0 ? 'Making progress' : 'Keep practicing'}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-start">
            <div className="bg-amber-100 p-2 rounded-full mr-3">
              <FileTextIcon className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Most Improved</h3>
              <p className="text-2xl font-bold text-gray-800 capitalize">
                {mostImprovedArea || 'N/A'}
              </p>
              <p className="text-xs text-gray-500">
                {mostImprovedArea ? 'Keep it up!' : 'Practice more to see progress'}
              </p>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Progress Graph - Simplified version with visual bars */}
      {recentSessions.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Score Progression</h3>
          
          <div className="space-y-6">
            {recentSessions.slice(0, 5).reverse().map((session, index) => (
              <div key={session.id} className="relative">
                <div className="flex items-center mb-1">
                  <span className="text-sm font-medium w-24 truncate">{formatDate(session.date)}</span>
                  <div className="flex-grow h-3 bg-gray-200 rounded-full">
                    <div 
                      className="h-3 rounded-full bg-indigo-600" 
                      style={{ width: `${(session.scores.overall / 9) * 100}%` }}
                    ></div>
                  </div>
                  <span className={`ml-2 font-medium ${getScoreColor(session.scores.overall)}`}>
                    {session.scores.overall.toFixed(1)}
                  </span>
                </div>
                
                <div className="pl-24 grid grid-cols-4 gap-1">
                  {(Object.keys(session.scores) as Array<keyof typeof session.scores>)
                    .filter(key => key !== 'overall')
                    .map(skill => (
                      <div key={skill} className="text-xs">
                        <div className="flex justify-between mb-1">
                          <span className="capitalize text-gray-500">{skill.slice(0, 4)}</span>
                          <span className={getScoreColor(session.scores[skill])}>
                            {session.scores[skill].toFixed(1)}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-200 rounded-full">
                          <div 
                            className={`h-1.5 rounded-full ${
                              session.scores[skill] >= 7.5 ? 'bg-green-500' :
                              session.scores[skill] >= 6 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${(session.scores[skill] / 9) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))
                  }
                </div>
                
                {index < recentSessions.length - 1 && (
                  <div className="absolute left-12 top-8 bottom-0 border-l border-dashed border-gray-300"></div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
      
      {/* Recommendations */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Personalized Recommendations</h3>
        
        {practiceHistory.length > 0 ? (
          <div className="space-y-4">
            {skillsToImprove.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Focus Areas</h4>
                <div className="space-y-3">
                  {skillsToImprove.map(skill => (
                    <div key={skill} className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                      <h5 className="font-medium text-amber-800 capitalize">{skill}</h5>
                      <p className="text-sm text-gray-700 mt-1">
                        {skill === 'fluency' && 
                          "Try to speak more smoothly with fewer hesitations. Practice by recording yourself discussing familiar topics for 2 minutes without stopping."}
                        {skill === 'pronunciation' && 
                          "Focus on word stress and intonation patterns. Practice with minimal pairs and record yourself reading passages aloud."}
                        {skill === 'grammar' && 
                          "Work on using a variety of complex sentence structures. Pay attention to verb tenses and subject-verb agreement."}
                        {skill === 'vocabulary' && 
                          "Build your lexical resource by learning topic-specific vocabulary. Use new words in context to help remember them."}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Practice Suggestions</h4>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 text-indigo-800 text-sm font-medium mr-2">1</span>
                  <span className="text-gray-700">Complete a full speaking test simulation (all 3 parts)</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 text-indigo-800 text-sm font-medium mr-2">2</span>
                  <span className="text-gray-700">Practice with topics you haven't tried before</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 text-indigo-800 text-sm font-medium mr-2">3</span>
                  <span className="text-gray-700">Record yourself answering Part 2 questions with proper time management</span>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-600 mb-4">You haven't completed any speaking practice sessions yet.</p>
            <Button 
              onClick={onStartNewPractice}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Start Your First Practice
            </Button>
          </div>
        )}
      </Card>
      
      {/* Recent Practice History */}
      {recentSessions.length > 0 && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">Practice History</h3>
            <Button 
              onClick={onStartNewPractice}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              New Practice
            </Button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Topic
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Overall
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fluency
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vocabulary
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grammar
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pronunciation
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentSessions.map((session) => (
                  <tr key={session.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(session.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {session.topic}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={getScoreColor(session.scores.overall)}>
                        {session.scores.overall.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={getScoreColor(session.scores.fluency)}>
                        {session.scores.fluency.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={getScoreColor(session.scores.vocabulary)}>
                        {session.scores.vocabulary.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={getScoreColor(session.scores.grammar)}>
                        {session.scores.grammar.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={getScoreColor(session.scores.pronunciation)}>
                        {session.scores.pronunciation.toFixed(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ProgressDashboard;
