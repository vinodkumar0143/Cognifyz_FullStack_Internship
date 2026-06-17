const { emailQueue, reportQueue, notificationQueue } = require('../queues/jobQueue');
const redisService = require('../services/redisService');

const triggeredJobs = [];
const mockJobsDb = {};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runMockWorker(id, type, jobData) {
  mockJobsDb[id] = { 
    id, 
    type, 
    state: 'active', 
    progress: 0, 
    result: null, 
    timestamp: Date.now() 
  };

  try {
    if (type === 'email') {
      const to = jobData.to || 'recipient@example.com';
      console.log(`📧 [MOCK Worker]: Starting email job ${id} to ${to}`);
      
      mockJobsDb[id].progress = 10;
      await delay(1000);
      
      mockJobsDb[id].progress = 50;
      console.log(`📧 [MOCK Worker]: Assembling body for job ${id}`);
      await delay(1000);
      
      mockJobsDb[id].progress = 90;
      console.log(`📧 [MOCK Worker]: Dispatching email for job ${id}`);
      await delay(1000);
      
      mockJobsDb[id].progress = 100;
      mockJobsDb[id].state = 'completed';
      mockJobsDb[id].result = { status: 'Sent', to, timestamp: new Date() };
      console.log(`✅ [MOCK Worker] Email job ${id} completed. Recipient: ${to}`);

    } else if (type === 'report') {
      const reportType = jobData.reportType || 'Standard System Report';
      const user = jobData.user || 'System Admin';
      console.log(`📊 [MOCK Worker]: Generating report job ${id} (type: ${reportType}) for user: ${user}`);
      
      for (let i = 1; i <= 5; i++) {
        await delay(1000);
        const progress = i * 20;
        mockJobsDb[id].progress = progress;
        console.log(`📊 [MOCK Worker]: Compiling report ${id} - ${progress}% finished`);
      }
      
      mockJobsDb[id].state = 'completed';
      mockJobsDb[id].result = { status: 'Generated', reportUrl: `/downloads/reports/${id}.csv`, user };
      console.log(`✅ [MOCK Worker] Report job ${id} completed. Download path: /downloads/reports/${id}.csv`);

    } else if (type === 'notification') {
      const userId = jobData.userId || 'User_' + Math.floor(Math.random() * 1000);
      console.log(`🔔 [MOCK Worker]: Dispatching notification job ${id} to user: ${userId}`);
      
      mockJobsDb[id].progress = 30;
      await delay(1000);
      
      mockJobsDb[id].progress = 100;
      mockJobsDb[id].state = 'completed';
      mockJobsDb[id].result = { status: 'Dispatched', userId };
      console.log(`✅ [MOCK Worker] Notification job ${id} completed. Target User: ${userId}`);
    }
  } catch (err) {
    mockJobsDb[id].state = 'failed';
    mockJobsDb[id].failedReason = err.message;
    console.error(`❌ [MOCK Worker] Job ${id} failed:`, err.message);
  }
}

module.exports = {
  createJob: async (req, res) => {
    const { type, data } = req.body;

    if (!type || !['email', 'report', 'notification'].includes(type)) {
      return res.status(400).json({ success: false, error: 'Invalid job type' });
    }

    const isConnected = redisService.isConnected();
    const jobId = isConnected ? null : 'mock_' + Math.floor(Math.random() * 100000);

    if (!isConnected) {
      // Process in mock in-memory queue mode
      const jobInfo = { id: jobId, type, timestamp: Date.now() };
      triggeredJobs.push(jobInfo);
      if (triggeredJobs.length > 50) {
        triggeredJobs.shift();
      }

      console.log(`📡 Queue: Job ${jobId} of type "${type}" added to mock in-memory queue.`);
      
      // Execute worker asynchronously
      runMockWorker(jobId, type, data || {});

      return res.status(202).json({
        success: true,
        message: `Job ${jobId} queued successfully (In-Memory Fallback)`,
        job: jobInfo
      });
    }

    try {
      let job;
      const jobData = data || {};
      if (type === 'email') {
        job = await emailQueue.add({
          to: jobData.to || 'recipient@example.com',
          subject: jobData.subject || 'Automated Work Queue Notification',
          body: jobData.body || 'Simulated body content for email job.'
        });
      } else if (type === 'report') {
        job = await reportQueue.add({
          reportType: jobData.reportType || 'Standard System Report',
          user: jobData.user || 'System Admin'
        });
      } else if (type === 'notification') {
        job = await notificationQueue.add({
          userId: jobData.userId || 'User_' + Math.floor(Math.random() * 1000),
          message: jobData.message || 'Custom in-app event trigger.'
        });
      }

      const jobInfo = { id: job.id, type, timestamp: job.timestamp };
      triggeredJobs.push(jobInfo);
      if (triggeredJobs.length > 50) {
        triggeredJobs.shift();
      }

      console.log(`📡 Queue: Job ${job.id} of type "${type}" added to queue.`);

      return res.status(202).json({
        success: true,
        message: `Job ${job.id} queued successfully`,
        job: jobInfo
      });
    } catch (err) {
      console.error('❌ Failed to add job to queue:', err.message);
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  getJobStatus: async (req, res) => {
    const { id } = req.params;
    const { type } = req.query;

    if (!redisService.isConnected()) {
      const job = mockJobsDb[id];
      if (!job) {
        return res.status(404).json({ success: false, error: 'Job not found' });
      }
      return res.json({
        success: true,
        job
      });
    }

    try {
      let queue;
      if (type === 'email') queue = emailQueue;
      else if (type === 'report') queue = reportQueue;
      else if (type === 'notification') queue = notificationQueue;
      else return res.status(400).json({ success: false, error: 'Valid job type query param is required' });

      const job = await queue.getJob(id);
      if (!job) {
        return res.status(404).json({ success: false, error: 'Job not found' });
      }

      const state = await job.getState();
      const progress = job.progress();
      const result = job.returnvalue;
      const failedReason = job.failedReason;

      return res.json({
        success: true,
        job: {
          id: job.id,
          type,
          state,
          progress,
          result,
          failedReason,
          timestamp: job.timestamp
        }
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  listJobs: async (req, res) => {
    if (!redisService.isConnected()) {
      const detailedJobs = triggeredJobs.map(tj => {
        const job = mockJobsDb[tj.id];
        return {
          id: tj.id,
          type: tj.type,
          state: job ? job.state : 'waiting',
          progress: job ? job.progress : 0,
          timestamp: tj.timestamp
        };
      });
      return res.json({ success: true, jobs: detailedJobs, redisConnected: false });
    }

    try {
      const detailedJobs = [];
      for (const tJob of triggeredJobs) {
        let queue;
        if (tJob.type === 'email') queue = emailQueue;
        else if (tJob.type === 'report') queue = reportQueue;
        else if (tJob.type === 'notification') queue = notificationQueue;

        const job = await queue.getJob(tJob.id);
        if (job) {
          const state = await job.getState();
          const progress = job.progress();
          detailedJobs.push({
            id: job.id,
            type: tJob.type,
            state,
            progress,
            timestamp: tJob.timestamp
          });
        }
      }
      return res.json({ success: true, jobs: detailedJobs, redisConnected: true });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
};
