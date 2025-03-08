const mockPracticeHistory = [
  {
    id: '1',
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    scores: {
      fluency: 5.5,
      pronunciation: 6.0,
      grammar: 5.5,
      vocabulary: 6.0,
      overall: 5.5
    },
    topic: 'Daily Routine'
  },
  {
    id: '2',
    date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
    scores: {
      fluency: 6.0,
      pronunciation: 6.0,
      grammar: 5.5,
      vocabulary: 6.5,
      overall: 6.0
    },
    topic: 'Hometown'
  },
  {
    id: '3',
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    scores: {
      fluency: 6.5,
      pronunciation: 6.0,
      grammar: 6.0,
      vocabulary: 6.5,
      overall: 6.5
    },
    topic: 'Free Time Activities'
  },
  {
    id: '4',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    scores: {
      fluency: 6.5,
      pronunciation: 6.0,
      grammar: 6.5,
      vocabulary: 7.0,
      overall: 6.5
    },
    topic: 'Technology'
  }
];

// Mock detailed results for display
const mockDetailedResult: SpeechAnalysisResult = {
  fluency: {
    score: 6.5,
    examples: [
      "Well, I think that, um, technology plays a very important role in our lives today.",
      "I use my smartphone for, you know, various purposes like communication and, uh, entertainment."
    ],
    feedback: "You demonstrate reasonably good fluency with some hesitations. Your ideas are generally connected, though occasionally there are noticeable pauses and fillers like 'um' and 'uh'."
  },
  vocabulary: {
    score: 7.0,
    examples: [
      "I find it quite convenient to access information instantaneously.",
      "Many traditional forms of entertainment have become somewhat obsolete."
    ],
    feedback: "You use a good range of vocabulary with some less common and idiomatic expressions. You demonstrate flexibility in word choice and generally avoid repetition."
  },
  grammar: {
    score: 6.5,
    examples: [
      "If I had more time, I would probably spend less time on social media.",
      "Technology has been evolving rapidly over the past decade."
    ],
    feedback: "You use a mix of simple and complex sentence forms. There are some grammatical errors, but they rarely impede communication."
  },
  pronunciation: {
    score: 6.0,
    examples: [
      "Development /dɪˈveləpmənt/",
      "Particularly /pəˈtɪkjʊləli/"
    ],
    feedback: "Your pronunciation is generally clear, though there are some issues with word stress and intonation patterns. Certain sounds are mispronounced but rarely affect understanding."
  },
  overall: {
    score: 6.5,
    strengths: [
      "Good use of vocabulary related to technology",
      "Ability to express opinions clearly",
      "Generally coherent responses with logical organization"
    ],
    improvements: [
      "Reduce hesitations and filler words",
      "Work on pronunciation of specific sounds and word stress",
      "Increase use of complex grammatical structures"
    ]
  }
};
