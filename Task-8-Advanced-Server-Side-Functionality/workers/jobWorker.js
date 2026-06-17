const { emailQueue, reportQueue, notificationQueue } = require('../queues/jobQueue');

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function startWorkers() {
  console.log('🔄 Initializing background workers...');

  // 1. Email Worker
  emailQueue.process(async (job) => {
    const { to, subject, body } = job.data;
    console.log(`📧 Worker: Starting email job ${job.id} to ${to}`);
    
    await job.progress(10);
    await delay(1000);
    
    await job.progress(50);
    console.log(`📧 Worker: Assembling body for job ${job.id}`);
    await delay(1000);
    
    await job.progress(90);
    console.log(`📧 Worker: Dispatching email for job ${job.id}`);
    await delay(1000);
    
    await job.progress(100);
    return { status: 'Sent', to, timestamp: new Date() };
  });

  emailQueue.on('completed', (job, result) => {
    console.log(`✅ Email job ${job.id} completed. Recipient: ${result.to}`);
  });

  emailQueue.on('failed', (job, err) => {
    console.error(`❌ Email job ${job.id} failed:`, err.message);
  });

  // 2. Report Worker
  reportQueue.process(async (job) => {
    const { reportType, user } = job.data;
    console.log(`📊 Worker: Generating report job ${job.id} (type: ${reportType}) for user: ${user}`);
    
    for (let i = 1; i <= 5; i++) {
      await delay(1000);
      const progress = i * 20;
      await job.progress(progress);
      console.log(`📊 Worker: Compiling report ${job.id} - ${progress}% finished`);
    }
    
    return { status: 'Generated', reportUrl: `/downloads/reports/${job.id}.csv`, user };
  });

  reportQueue.on('completed', (job, result) => {
    console.log(`✅ Report job ${job.id} completed. Download path: ${result.reportUrl}`);
  });

  reportQueue.on('failed', (job, err) => {
    console.error(`❌ Report job ${job.id} failed:`, err.message);
  });

  // 3. Notification Worker
  notificationQueue.process(async (job) => {
    const { userId, message } = job.data;
    console.log(`🔔 Worker: Dispatching notification job ${job.id} to user: ${userId}`);
    
    await job.progress(30);
    await delay(1000);
    
    await job.progress(100);
    return { status: 'Dispatched', userId };
  });

  notificationQueue.on('completed', (job, result) => {
    console.log(`✅ Notification job ${job.id} completed. Target User: ${result.userId}`);
  });

  notificationQueue.on('failed', (job, err) => {
    console.error(`❌ Notification job ${job.id} failed:`, err.message);
  });

  console.log('🚀 Background workers listening for jobs.');
}

module.exports = {
  startWorkers
};
