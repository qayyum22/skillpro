import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, orderBy, getDocs, limit, startAfter } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { LogLevel } from '@/lib/logger';
import { getAuth } from 'firebase/auth';

// Convert a Firebase log entry to a CSV row
function logToCsv(log: any): string {
  // Format timestamp
  const timestamp = log.timestamp?.toDate 
    ? log.timestamp.toDate().toISOString()
    : 'Unknown';
  
  // Escape fields for CSV
  const escapeForCsv = (value: any): string => {
    if (value === undefined || value === null) return '';
    const str = String(value).replace(/"/g, '""');
    return `"${str}"`;
  };
  
  // Basic fields
  const fields = [
    escapeForCsv(log.id),
    escapeForCsv(log.level),
    escapeForCsv(timestamp),
    escapeForCsv(log.message),
    escapeForCsv(log.userId || ''),
    escapeForCsv(log.userEmail || ''),
    escapeForCsv(log.path || ''),
    escapeForCsv(log.ip || '')
  ];
  
  // Add serialized metadata if it exists
  if (log.metadata) {
    fields.push(escapeForCsv(JSON.stringify(log.metadata)));
  } else {
    fields.push('');
  }
  
  return fields.join(',');
}

// Generate CSV header
function getCsvHeader(): string {
  return '"ID","Level","Timestamp","Message","User ID","User Email","Path","IP","Metadata"';
}

export async function GET(request: NextRequest) {
  try {
    // Check authorization
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get request parameters
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'json';
    const levelFilter = searchParams.get('level') as LogLevel | null;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const maxResults = parseInt(searchParams.get('maxResults') || '5000', 10);
    
    // Build the query
    const logsCollection = collection(firestore, 'systemLogs');
    let logsQuery = query(logsCollection, orderBy('timestamp', 'desc'));
    
    // Apply filters
    if (levelFilter) {
      logsQuery = query(logsQuery, where('level', '==', levelFilter));
    }
    
    // Date range filters
    if (startDate) {
      const startDateTime = new Date(startDate);
      // Convert to Firestore Timestamp
      const startTimestamp = {
        seconds: Math.floor(startDateTime.getTime() / 1000),
        nanoseconds: 0
      };
      logsQuery = query(logsQuery, where('timestamp', '>=', startTimestamp));
    }
    
    if (endDate) {
      const endDateTime = new Date(endDate);
      // Convert to Firestore Timestamp
      const endTimestamp = {
        seconds: Math.floor(endDateTime.getTime() / 1000),
        nanoseconds: 999999999
      };
      logsQuery = query(logsQuery, where('timestamp', '<=', endTimestamp));
    }
    
    // Limit results
    logsQuery = query(logsQuery, limit(maxResults));
    
    // Execute query
    const snapshot = await getDocs(logsQuery);
    
    if (snapshot.empty) {
      return format === 'csv'
        ? new Response(getCsvHeader(), {
            headers: {
              'Content-Type': 'text/csv',
              'Content-Disposition': 'attachment; filename=logs-export.csv'
            }
          })
        : NextResponse.json({ logs: [] });
    }
    
    // Process results based on format
    if (format === 'csv') {
      // Generate CSV
      const csvRows = [getCsvHeader()];
      
      snapshot.docs.forEach(doc => {
        const log = { id: doc.id, ...doc.data() };
        csvRows.push(logToCsv(log));
      });
      
      const csv = csvRows.join('\n');
      
      // Return CSV as downloadable file
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename=logs-export.csv'
        }
      });
    } else {
      // Return JSON
      const logs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return NextResponse.json({ logs });
    }
  } catch (error) {
    console.error('Error exporting logs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 