import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    // Check database connection
    let dbStatus = 'disconnected';
    try {
      await connectDB();
      dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    } catch (error) {
      dbStatus = 'error';
    }

    // Current system metrics
    const currentMemory = process.memoryUsage();
    const systemMetrics = {
      memory: {
        heapUsed: Math.round(currentMemory.heapUsed / 1024 / 1024 * 100) / 100,
        heapTotal: Math.round(currentMemory.heapTotal / 1024 / 1024 * 100) / 100,
        usage: Math.round((currentMemory.heapUsed / currentMemory.heapTotal) * 100)
      },
      uptime: Math.round(process.uptime()),
      version: process.version,
      platform: process.platform
    };

    const metrics = {
      timestamp: new Date().toISOString(),
      system: systemMetrics,
      database: {
        status: dbStatus
      }
    };

    return NextResponse.json(metrics, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to generate metrics',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}