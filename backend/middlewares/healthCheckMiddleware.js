import mongoose from 'mongoose';
import { logger } from './loggerMiddleware.js';


const checkDatabaseHealth = async () => {
  try {
    const state = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    return {
      status: state === 1 ? 'healthy' : 'unhealthy',
      state: states[state],
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name
    };
  } catch (error) {
    logger.error('Database health check failed', { error: error.message });
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
};


const checkMemoryHealth = () => {
  const memUsage = process.memoryUsage();
  const totalMem = memUsage.heapTotal;
  const usedMem = memUsage.heapUsed;
  const usagePercent = (usedMem / totalMem) * 100;

  return {
    status: usagePercent > 90 ? 'warning' : 'healthy',
    heapUsed: Math.round(usedMem / 1024 / 1024) + ' MB',
    heapTotal: Math.round(totalMem / 1024 / 1024) + ' MB',
    usagePercent: Math.round(usagePercent) + '%',
    external: Math.round(memUsage.external / 1024 / 1024) + ' MB',
    rss: Math.round(memUsage.rss / 1024 / 1024) + ' MB'
  };
};


const checkDiskHealth = () => {
  try {
    const fs = require('fs');
    const stats = fs.statSync('.');
    return {
      status: 'healthy',
      message: 'Disk access OK'
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
};


export const healthCheck = async (req, res) => {
  try {
    const startTime = Date.now();
    
    
    const [database, memory, disk] = await Promise.all([
      checkDatabaseHealth(),
      Promise.resolve(checkMemoryHealth()),
      Promise.resolve(checkDiskHealth())
    ]);

    const responseTime = Date.now() - startTime;
    
    
    const overallStatus = 
      database.status === 'healthy' && 
      memory.status === 'healthy' && 
      disk.status === 'healthy' 
        ? 'healthy' 
        : 'unhealthy';

    const healthData = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Math.round(process.uptime()),
      responseTime: `${responseTime}ms`,
      version: '1.0.0',
      environment: process.env.NODE_ENV,
      checks: {
        database,
        memory,
        disk
      }
    };

    
    logger.info('Health check performed', {
      status: overallStatus,
      responseTime,
      database: database.status,
      memory: memory.status
    });

    const statusCode = overallStatus === 'healthy' ? 200 : 503;
    res.status(statusCode).json(healthData);

  } catch (error) {
    logger.error('Health check failed', { error: error.message });
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
};


export const detailedHealthCheck = async (req, res) => {
  try {
    const startTime = Date.now();
    
    const [database, memory, disk] = await Promise.all([
      checkDatabaseHealth(),
      Promise.resolve(checkMemoryHealth()),
      Promise.resolve(checkDiskHealth())
    ]);

    const responseTime = Date.now() - startTime;
    
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTime,
      version: '1.0.0',
      environment: process.env.NODE_ENV,
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      pid: process.pid,
      checks: {
        database,
        memory,
        disk
      },
      metrics: {
        cpuUsage: process.cpuUsage(),
        memoryUsage: process.memoryUsage(),
        loadAverage: process.platform !== 'win32' ? require('os').loadavg() : null
      }
    };

    res.status(200).json(healthData);

  } catch (error) {
    logger.error('Detailed health check failed', { error: error.message });
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
};


export const readinessCheck = async (req, res) => {
  try {
    const database = await checkDatabaseHealth();
    
    if (database.status === 'healthy') {
      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        status: 'not ready',
        timestamp: new Date().toISOString(),
        reason: 'Database not connected'
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
};


export const livenessCheck = (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
};
