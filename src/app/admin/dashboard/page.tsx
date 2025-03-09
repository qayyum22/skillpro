"use client";
import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { useAuth } from "@/app/hooks/useAuth";
import logger, { LogLevel } from '@/lib/logger';
import { collection, query, where, orderBy, getDocs, Timestamp, limit, startAfter, endAt } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertTriangle, Info, Shield, AlertCircle, ArrowRight } from 'lucide-react';

// Add this interface before the code that uses userStats
interface UserStat {
    userId: string;
    userEmail: string;
    count: number;
    lastActivity: Date | null;
}

const Dashboard = () => {
    const { user, loading } = useAuth(true); // requireAdmin = true
    const [isLoading, setIsLoading] = useState(true);
    const [timeframeStats, setTimeframeStats] = useState<any[]>([]);
    const [logLevelDistribution, setLogLevelDistribution] = useState<any[]>([]);
    const [recentErrors, setRecentErrors] = useState<any[]>([]);
    const [securityAlerts, setSecurityAlerts] = useState<any[]>([]);
    const [userActivityStats, setUserActivityStats] = useState<any[]>([]);
    const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('week');

    // Generate dates for the selected timeframe
    const getTimeframeDates = () => {
        const now = new Date();
        const dates = [];
        let numDays = 0;
        
        switch (timeframe) {
            case 'day':
                numDays = 24; // 24 hours
                for (let i = 0; i < numDays; i++) {
                    const date = new Date(now);
                    date.setHours(date.getHours() - i);
                    dates.push(date);
                }
                break;
            case 'week':
                numDays = 7; // 7 days
                for (let i = 0; i < numDays; i++) {
                    const date = new Date(now);
                    date.setDate(date.getDate() - i);
                    dates.push(date);
                }
                break;
            case 'month':
                numDays = 30; // 30 days
                for (let i = 0; i < numDays; i++) {
                    const date = new Date(now);
                    date.setDate(date.getDate() - i);
                    dates.push(date);
                }
                break;
        }
        
        return dates.reverse(); // Reverse to get chronological order
    };

    // Fetch log statistics for the dashboard
    const fetchLogStatistics = async () => {
        if (loading || !user) return;
        
        setIsLoading(true);
        
        try {
            // Get date range based on timeframe
            const dates = getTimeframeDates();
            const startDate = dates[0];
            const endDate = new Date(dates[dates.length - 1]);
            // If timeframe is 'day', add 1 hour to end date to include the last hour
            // For 'week' and 'month', add 1 day to include the last day
            if (timeframe === 'day') {
                endDate.setHours(endDate.getHours() + 1);
            } else {
                endDate.setDate(endDate.getDate() + 1);
            }
            
            // Convert to Firestore Timestamps
            const startTimestamp = Timestamp.fromDate(startDate);
            const endTimestamp = Timestamp.fromDate(endDate);
            
            // Define period formatter based on timeframe
            const formatPeriod = (date: Date) => {
                if (timeframe === 'day') {
                    return date.toLocaleTimeString([], { hour: '2-digit' });
                } else {
                    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
                }
            };
            
            // Initialize timeframe data structure
            const timeframeData: Record<string, { period: string, info: number, warning: number, error: number, security: number, total: number, date: Date }> = {};
            
            // Initialize with all periods having 0 counts
            dates.forEach(date => {
                const period = formatPeriod(date);
                timeframeData[period] = {
                    period,
                    info: 0,
                    warning: 0,
                    error: 0,
                    security: 0,
                    total: 0,
                    date
                };
            });
            
            // Fetch log counts for each level within the date range
            const logsCollection = collection(firestore, 'systemLogs');
            const logsQuery = query(
                logsCollection,
                where('timestamp', '>=', startTimestamp),
                where('timestamp', '<=', endTimestamp),
                orderBy('timestamp')
            );
            
            const snapshot = await getDocs(logsQuery);
            
            // Process logs and group by period and level
            snapshot.docs.forEach(doc => {
                const log = doc.data();
                const timestamp = log.timestamp.toDate();
                const period = formatPeriod(timestamp);
                
                // If this period exists in our data structure
                if (timeframeData[period]) {
                    if (['info', 'warning', 'error', 'security'].includes(log.level)) {
                        (timeframeData[period] as any)[log.level]++;
                    }
                    timeframeData[period].total++;
                }
            });
            // Convert to array and sort by date
            const timeframeStats = Object.values(timeframeData).sort((a, b) => 
                a.date.getTime() - b.date.getTime()
            );
            
            setTimeframeStats(timeframeStats);
            
            // Calculate log level distribution
            const distribution = [
                { name: 'Info', value: 0, color: '#3B82F6' },
                { name: 'Warning', value: 0, color: '#F59E0B' },
                { name: 'Error', value: 0, color: '#EF4444' },
                { name: 'Security', value: 0, color: '#8B5CF6' }
            ];
            
            snapshot.docs.forEach(doc => {
                const log = doc.data();
                switch (log.level) {
                    case LogLevel.INFO:
                        distribution[0].value++;
                        break;
                    case LogLevel.WARNING:
                        distribution[1].value++;
                        break;
                    case LogLevel.ERROR:
                        distribution[2].value++;
                        break;
                    case LogLevel.SECURITY:
                        distribution[3].value++;
                        break;
                }
            });
            
            setLogLevelDistribution(distribution);
            
            // Fetch recent errors
            const errorsQuery = query(
                logsCollection,
                where('level', '==', LogLevel.ERROR),
                orderBy('timestamp', 'desc'),
                limit(5)
            );
            
            const errorsSnapshot = await getDocs(errorsQuery);
            const errors = errorsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            setRecentErrors(errors);
            
            // Fetch security alerts
            const securityQuery = query(
                logsCollection,
                where('level', '==', LogLevel.SECURITY),
                orderBy('timestamp', 'desc'),
                limit(5)
            );
            
            const securitySnapshot = await getDocs(securityQuery);
            const alerts = securitySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            setSecurityAlerts(alerts);
            
            // Fetch user activity stats (users with most logs)
            const userStats: Record<string, UserStat> = {};
            
            // Group logs by user
            snapshot.docs.forEach(doc => {
                const log = doc.data();
                if (log.userId) {
                    if (!userStats[log.userId]) {
                        userStats[log.userId] = {
                            userId: log.userId,
                            userEmail: log.userEmail || 'Unknown',
                            count: 0,
                            lastActivity: null
                        };
                    }
                    
                    userStats[log.userId].count++;
                    
                    // Track last activity - safely handle timestamp
                    if (log.timestamp && typeof log.timestamp.toDate === 'function') {
                        try {
                            const timestamp = log.timestamp.toDate();
                            const lastActivity = userStats[log.userId].lastActivity;
                            
                            // Update if no lastActivity yet or if this timestamp is more recent
                            if (lastActivity === null || timestamp > lastActivity) {
                                userStats[log.userId].lastActivity = timestamp;
                            }
                        } catch (error) {
                            console.error('Error converting timestamp:', error);
                            // Use current date as fallback if timestamp conversion fails
                            if (userStats[log.userId].lastActivity === null) {
                                userStats[log.userId].lastActivity = new Date();
                            }
                        }
                    } else if (log.timestamp instanceof Date) {
                        // Handle if timestamp is already a Date object
                        const lastActivity = userStats[log.userId].lastActivity;
                        
                        // Update if no lastActivity yet or if this timestamp is more recent
                        if (lastActivity === null || log.timestamp > lastActivity) {
                            userStats[log.userId].lastActivity = log.timestamp;
                        }
                    } else if (log.timestamp) {
                        // Handle if timestamp is a number or string that can be converted to Date
                        try {
                            const timestamp = new Date(log.timestamp);
                            if (!isNaN(timestamp.getTime())) {
                                const lastActivity = userStats[log.userId].lastActivity;
                                
                                // Update if no lastActivity yet or if this timestamp is more recent
                                if (lastActivity === null || timestamp > lastActivity) {
                                    userStats[log.userId].lastActivity = timestamp;
                                }
                            }
                        } catch (error) {
                            console.error('Error parsing timestamp:', error);
                        }
                    }
                }
            });
            
            // Convert to array and sort by count
            const userActivity = Object.values(userStats)
                .sort((a: any, b: any) => b.count - a.count)
                .slice(0, 5); // Top 5 users
            
            setUserActivityStats(userActivity);
        } catch (error) {
            console.error('Error fetching log statistics:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Load data when component mounts or timeframe changes
    useEffect(() => {
        fetchLogStatistics();
    }, [user, loading, timeframe]);

    const getLevelIcon = (level: LogLevel) => {
        switch (level) {
            case LogLevel.INFO:
                return <Info size={18} className="text-blue-500" />;
            case LogLevel.WARNING:
                return <AlertTriangle size={18} className="text-yellow-500" />;
            case LogLevel.ERROR:
                return <AlertCircle size={18} className="text-red-500" />;
            case LogLevel.SECURITY:
                return <Shield size={18} className="text-purple-500" />;
            default:
                return <Info size={18} className="text-gray-500" />;
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading...</div>;
    }

    if (!user) {
        return <div className="p-8 text-center">Unauthorized</div>;
    }

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">System Analytics Dashboard</h1>
            
            {/* Timeframe selector */}
            <div className="mb-6 flex justify-end">
                <div className="inline-flex bg-white rounded-md shadow-sm">
                    <button
                        onClick={() => setTimeframe('day')}
                        className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                            timeframe === 'day'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        24 Hours
                </button>
                    <button
                        onClick={() => setTimeframe('week')}
                        className={`px-4 py-2 text-sm font-medium ${
                            timeframe === 'week'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        7 Days
                </button>
                    <button
                        onClick={() => setTimeframe('month')}
                        className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                            timeframe === 'month'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        30 Days
                </button>
                </div>
            </div>

            {isLoading ? (
                <div className="p-8 text-center">
                    <div className="animate-spin w-8 h-8 border-t-2 border-blue-500 border-r-2 rounded-full mx-auto mb-2"></div>
                    <p className="text-gray-500">Loading analytics...</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                title: 'Total Logs',
                                value: timeframeStats.reduce((sum, stat) => sum + stat.total, 0),
                                bgColor: 'bg-blue-500',
                                textColor: 'text-blue-500'
                            },
                            {
                                title: 'Error Rate',
                                value: `${((timeframeStats.reduce((sum, stat) => sum + stat.error, 0) / 
                                    (timeframeStats.reduce((sum, stat) => sum + stat.total, 0) || 1)) * 100).toFixed(1)}%`,
                                bgColor: 'bg-red-500',
                                textColor: 'text-red-500'
                            },
                            {
                                title: 'Security Alerts',
                                value: timeframeStats.reduce((sum, stat) => sum + stat.security, 0),
                                bgColor: 'bg-purple-500',
                                textColor: 'text-purple-500'
                            },
                            {
                                title: 'Active Period',
                                value: timeframeStats.length ? 
                                    timeframeStats.reduce((max, stat) => stat.total > max.total ? stat : max, timeframeStats[0]).period : 
                                    'N/A',
                                bgColor: 'bg-green-500',
                                textColor: 'text-green-500'
                            }
                        ].map((stat, index) => (
                            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className={`h-2 ${stat.bgColor}`}></div>
                                <div className="p-6">
                                    <h3 className="text-lg font-medium text-gray-700">{stat.title}</h3>
                                    <p className={`text-3xl font-bold ${stat.textColor} mt-2`}>{stat.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {/* Log Activity Chart */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-4">Log Activity</h2>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={timeframeStats}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                        dataKey="period" 
                                        tick={{ fontSize: 12 }}
                                        interval={timeframe === 'month' ? 2 : 0}
                                    />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="info" name="Info" fill="#3B82F6" stackId="a" />
                                    <Bar dataKey="warning" name="Warnings" fill="#F59E0B" stackId="a" />
                                    <Bar dataKey="error" name="Errors" fill="#EF4444" stackId="a" />
                                    <Bar dataKey="security" name="Security" fill="#8B5CF6" stackId="a" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    
                    {/* Two Column Layout for Charts and Lists */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Log Level Distribution */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold mb-4">Log Level Distribution</h2>
                            <div className="h-60">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={logLevelDistribution}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {logLevelDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => [`${value} logs`, 'Count']} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        
                        {/* User Activity */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold mb-4">Top User Activity</h2>
                            {userActivityStats.length > 0 ? (
                                <div className="overflow-hidden">
                                    <table className="min-w-full">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {userActivityStats.map((user: any, index) => (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-sm">{user.userEmail}</td>
                                                    <td className="px-4 py-3 text-sm font-medium">{user.count} logs</td>
                                                    <td className="px-4 py-3 text-sm">
                                                        {user.lastActivity ? user.lastActivity.toLocaleString() : 'Unknown'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-6 text-gray-500">
                                    No user activity recorded
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Recent Issues */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Errors */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">Recent Errors</h2>
                                <Link 
                                    href="/admin/logs?level=error" 
                                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                                >
                                    View All <ArrowRight size={16} className="ml-1" />
                                </Link>
                            </div>
                            
                            {recentErrors.length > 0 ? (
                                <div className="space-y-4">
                                    {recentErrors.map((error: any) => (
                                        <div key={error.id} className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r">
                                            <div className="flex items-start">
                                                <AlertCircle className="text-red-500 mt-0.5 mr-3 flex-shrink-0" size={18} />
                                                <div>
                                                    <div className="font-medium">{error.message}</div>
                                                    <div className="text-sm text-gray-600 mt-1">
                                                        {error.timestamp?.toDate().toLocaleString() || 'Unknown'}
                                                    </div>
                                                    {error.metadata?.errorName && (
                                                        <div className="text-sm text-red-700 mt-1 font-mono">
                                                            {error.metadata.errorName}: {error.metadata.errorMessage}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-gray-500">
                                    No recent errors - that's great!
                                </div>
                            )}
                        </div>
                        
                        {/* Security Alerts */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">Security Alerts</h2>
                                <Link 
                                    href="/admin/logs?level=security" 
                                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                                >
                                    View All <ArrowRight size={16} className="ml-1" />
                                </Link>
                            </div>
                            
                            {securityAlerts.length > 0 ? (
                                <div className="space-y-4">
                                    {securityAlerts.map((alert: any) => (
                                        <div key={alert.id} className="border-l-4 border-purple-500 bg-purple-50 p-4 rounded-r">
                                            <div className="flex items-start">
                                                <Shield className="text-purple-500 mt-0.5 mr-3 flex-shrink-0" size={18} />
                                                <div>
                                                    <div className="font-medium">{alert.message}</div>
                                                    <div className="text-sm text-gray-600 mt-1">
                                                        {alert.timestamp?.toDate().toLocaleString() || 'Unknown'}
                                                    </div>
                                                    {alert.ip && (
                                                        <div className="text-sm text-purple-700 mt-1">
                                                            IP: {alert.ip}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-gray-500">
                                    No security alerts detected
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;