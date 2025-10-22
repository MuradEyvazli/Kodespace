import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();

    // Check database health
    let dbStatus = 'disconnected';
    let dbLatency = 0;
    let dbError = null;

    try {
      const dbStart = Date.now();
      await connectDB();
      dbLatency = Date.now() - dbStart;
      dbStatus = mongoose.connection.readyState === 1 ? 'healthy' : 'disconnected';
    } catch (error) {
      dbError = error instanceof Error ? error.message : 'Connection failed';
      dbStatus = 'unhealthy';
    }

    // Memory usage
    const memoryUsage = process.memoryUsage();
    const memory = {
      used: Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100,
      total: Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100,
      usage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)
    };

    const health = {
      status: dbStatus === 'healthy' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: Math.round(process.uptime()),
      environment: process.env.NODE_ENV,
      responseTime: Date.now() - startTime,
      services: {
        database: {
          status: dbStatus,
          latency: dbLatency,
          error: dbError
        },
        memory: {
          status: memory.usage > 80 ? 'warning' : 'healthy',
          ...memory
        }
      },
      node: {
        version: process.version,
        platform: process.platform
      }
    };

    const statusCode = health.status === 'healthy' ? 200 : 503;
    return NextResponse.json(health, { status: statusCode });

  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Internal server error'
      },
      { status: 503 }
    );
  }
}