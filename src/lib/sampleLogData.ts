import { LogLevel } from './logger';
import { firestore } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Sample user data
const sampleUsers = [
  { id: 'user1', email: 'john.doe@example.com' },
  { id: 'user2', email: 'jane.smith@example.com' },
  { id: 'user3', email: 'admin@testprephaven.com' },
  { id: undefined, email: undefined } // anonymous user
];

// Sample IP addresses
const sampleIPs = [
  '192.168.1.1',
  '10.0.0.1',
  '172.16.0.1',
  '8.8.8.8',
  '123.45.67.89'
];

// Sample user agents
const sampleUserAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
];

// Sample paths
const samplePaths = [
  '/api/auth/signin',
  '/api/auth/signout',
  '/api/save-test-result',
  '/api/user/profile',
  '/dashboard',
  '/ielts',
  '/french',
  '/admin/logs',
  '/courses/french-a1'
];

// Sample messages by log level
const sampleMessages = {
  [LogLevel.INFO]: [
    'User signed in successfully',
    'Course module completed',
    'Profile updated',
    'New course material accessed',
    'Subscription payment processed',
    'User registered for exam',
    'Test result saved successfully'
  ],
  [LogLevel.WARNING]: [
    'Failed login attempt',
    'Password reset requested multiple times',
    'Payment processing delay',
    'File upload exceeds size limit',
    'User session expired',
    'API rate limit approaching threshold',
    'Database query taking longer than expected'
  ],
  [LogLevel.ERROR]: [
    'Database connection failed',
    'Payment processing error',
    'API integration failure',
    'File upload error',
    'Authentication service unavailable',
    'Unhandled exception in course module',
    'Invalid form submission data'
  ],
  [LogLevel.SECURITY]: [
    'Multiple failed login attempts detected',
    'Suspicious API request pattern',
    'Unauthorized resource access attempt',
    'Possible SQL injection attempt',
    'Abnormal user behavior detected',
    'Rate limit exceeded',
    'Possible XSS attempt detected'
  ]
};

// Sample error objects
const sampleErrors = [
  new Error('Network request failed'),
  new TypeError('Cannot read property of undefined'),
  new ReferenceError('Variable is not defined'),
  new SyntaxError('Unexpected token in JSON'),
  new RangeError('Invalid array length')
];

// Generate random metadata based on log level
function generateRandomMetadata(level: LogLevel) {
  switch (level) {
    case LogLevel.INFO:
      return {
        action: ['login', 'signup', 'update', 'view', 'complete'][Math.floor(Math.random() * 5)],
        duration: Math.floor(Math.random() * 1000),
        resourceId: `resource_${Math.floor(Math.random() * 1000)}`
      };
    case LogLevel.WARNING:
      return {
        attemptCount: Math.floor(Math.random() * 5) + 1,
        resourceType: ['user', 'course', 'payment', 'file'][Math.floor(Math.random() * 4)],
        threshold: Math.floor(Math.random() * 100)
      };
    case LogLevel.ERROR:
      return {
        errorCode: `ERR_${Math.floor(Math.random() * 1000)}`,
        service: ['database', 'auth', 'payment', 'storage', 'api'][Math.floor(Math.random() * 5)],
        requestId: `req_${Math.floor(Math.random() * 10000)}`
      };
    case LogLevel.SECURITY:
      return {
        attemptCount: Math.floor(Math.random() * 20) + 1,
        severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
        pattern: ['repeated_access', 'invalid_input', 'unauthorized', 'injection'][Math.floor(Math.random() * 4)]
      };
    default:
      return {};
  }
}

// Function to generate and add a random log entry
async function addRandomLog() {
  // Select random log level
  const levels = Object.values(LogLevel);
  const level = levels[Math.floor(Math.random() * levels.length)];
  
  // Select random user
  const user = sampleUsers[Math.floor(Math.random() * sampleUsers.length)];
  
  // Select random path
  const path = samplePaths[Math.floor(Math.random() * samplePaths.length)];
  
  // Select random message for the log level
  const messages = sampleMessages[level];
  const message = messages[Math.floor(Math.random() * messages.length)];
  
  // Generate random metadata
  const metadata = generateRandomMetadata(level);
  
  // For error logs, add an error object
  let stack = undefined;
  if (level === LogLevel.ERROR) {
    const error = sampleErrors[Math.floor(Math.random() * sampleErrors.length)];
    (metadata as any).errorName = error.name;
    (metadata as any).errorMessage = error.message;
    stack = error.stack;
  }
  // For security logs, add IP and user agent
  const ip = level === LogLevel.SECURITY 
    ? sampleIPs[Math.floor(Math.random() * sampleIPs.length)]
    : undefined;
    
  const userAgent = level === LogLevel.SECURITY
    ? sampleUserAgents[Math.floor(Math.random() * sampleUserAgents.length)]
    : undefined;
  
  // Create log entry
  const logEntry = {
    level,
    message,
    timestamp: serverTimestamp(),
    userId: user.id,
    userEmail: user.email,
    path,
    ip,
    userAgent,
    metadata,
    stack
  };
  
  // Remove undefined properties
  Object.keys(logEntry).forEach(key => {
    if (logEntry[key as keyof typeof logEntry] === undefined) {
      delete logEntry[key as keyof typeof logEntry];
    }
  });
  
  // Add to Firestore
  const logsCollection = collection(firestore, 'systemLogs');
  return addDoc(logsCollection, logEntry);
}

// Generate multiple log entries
export async function generateSampleLogs(count: number = 50) {
  console.log(`Generating ${count} sample logs...`);
  const promises = [];
  
  for (let i = 0; i < count; i++) {
    promises.push(addRandomLog());
  }
  
  return Promise.all(promises);
}

// Generate a specific distribution of logs (for testing UI with different log levels)
export async function generateDistributedSampleLogs(count: number = 50) {
  const distribution = {
    [LogLevel.INFO]: Math.floor(count * 0.5),      // 50% info logs
    [LogLevel.WARNING]: Math.floor(count * 0.2),   // 20% warning logs
    [LogLevel.ERROR]: Math.floor(count * 0.2),     // 20% error logs
    [LogLevel.SECURITY]: Math.floor(count * 0.1)   // 10% security logs
  };
  
  const promises = [];
  
  // Ensure we're generating the exact number requested
  let generatedCount = 0;
  for (const level of Object.values(LogLevel)) {
    generatedCount += distribution[level];
  }
  
  // Add any remaining to INFO
  if (generatedCount < count) {
    distribution[LogLevel.INFO] += (count - generatedCount);
  }
  
  console.log(`Generating ${count} distributed sample logs:`, distribution);
  
  // Generate logs according to distribution
  for (const level of Object.values(LogLevel)) {
    for (let i = 0; i < distribution[level]; i++) {
      promises.push(generateLogWithLevel(level));
    }
  }
  
  return Promise.all(promises);
}

// Generate a log with a specific level
async function generateLogWithLevel(level: LogLevel) {
  // Select random user
  const user = sampleUsers[Math.floor(Math.random() * sampleUsers.length)];
  
  // Select random path
  const path = samplePaths[Math.floor(Math.random() * samplePaths.length)];
  
  // Select random message for the log level
  const messages = sampleMessages[level];
  const message = messages[Math.floor(Math.random() * messages.length)];
  
  // Generate random metadata
  const metadata = generateRandomMetadata(level);
  
  // For error logs, add an error object
  let stack = undefined;
  if (level === LogLevel.ERROR) {
    const error = sampleErrors[Math.floor(Math.random() * sampleErrors.length)];
    (metadata as any).errorName = error.name;
    (metadata as any).errorMessage = error.message;
    stack = error.stack;
  }
  // For security logs, add IP and user agent
  const ip = level === LogLevel.SECURITY 
    ? sampleIPs[Math.floor(Math.random() * sampleIPs.length)]
    : undefined;
    
  const userAgent = level === LogLevel.SECURITY
    ? sampleUserAgents[Math.floor(Math.random() * sampleUserAgents.length)]
    : undefined;
  
  // Create log entry
  const logEntry = {
    level,
    message,
    timestamp: serverTimestamp(),
    userId: user.id,
    userEmail: user.email,
    path,
    ip,
    userAgent,
    metadata,
    stack
  };
  
  // Remove undefined properties
  Object.keys(logEntry).forEach(key => {
    if (logEntry[key as keyof typeof logEntry] === undefined) {
      delete logEntry[key as keyof typeof logEntry];
    }
  });
  
  // Add to Firestore
  const logsCollection = collection(firestore, 'systemLogs');
  return addDoc(logsCollection, logEntry);
} 