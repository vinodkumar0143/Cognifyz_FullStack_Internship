document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const redisStatusDot = document.querySelector('#redis-status .status-dot');
  const redisStatusText = document.querySelector('#redis-status .status-text');
  
  const btnFetchData = document.getElementById('btn-fetch-data');
  const btnClearCache = document.getElementById('btn-clear-cache');
  const metricCacheStatus = document.getElementById('metric-cache-status');
  const metricResponseTime = document.getElementById('metric-response-time');
  const barChart = document.getElementById('bar-chart');
  const jsonViewer = document.getElementById('json-viewer');
  
  const jobButtons = document.querySelectorAll('.btn-action');
  const jobList = document.getElementById('job-list');
  
  const terminalBody = document.getElementById('terminal-body');
  const btnClearLogs = document.getElementById('btn-clear-logs');

  let activeJobs = {}; // Tracks polling intervals for active job IDs
  let responseTimesHistory = [];

  // 1. Connection check & initial logs
  async function checkRedisStatus() {
    try {
      const res = await fetch('/api/jobs');
      const data = await res.json();
      
      if (data.redisConnected) {
        redisStatusDot.className = 'status-dot connected';
        redisStatusText.textContent = 'Redis: Connected';
      } else {
        redisStatusDot.className = 'status-dot disconnected';
        redisStatusText.textContent = 'Redis: Disconnected (Fallback Mode)';
      }
    } catch (err) {
      redisStatusDot.className = 'status-dot disconnected';
      redisStatusText.textContent = 'Server: Offline';
    }
  }

  // 2. Fetch Caching Data
  async function fetchStats() {
    btnFetchData.disabled = true;
    metricCacheStatus.textContent = 'LOADING...';
    metricCacheStatus.className = 'metric-val';
    
    const clientStart = Date.now();
    try {
      const res = await fetch('/api/data');
      const data = await res.json();
      const clientDuration = Date.now() - clientStart;
      
      // Update Metrics
      metricCacheStatus.textContent = data.cacheStatus;
      metricCacheStatus.className = `metric-val ${data.cacheStatus === 'HIT' ? 'status-hit' : 'status-miss'}`;
      metricResponseTime.textContent = `${clientDuration} ms`;
      
      // Render JSON payload
      jsonViewer.textContent = JSON.stringify(data.data, null, 2);
      
      // Add bar to history chart
      addChartBar(clientDuration, data.cacheStatus);
      
      // Check Redis status
      checkRedisStatus();
    } catch (err) {
      metricCacheStatus.textContent = 'ERROR';
      metricCacheStatus.className = 'metric-val status-miss';
      metricResponseTime.textContent = '0 ms';
      jsonViewer.textContent = `Error fetching data: ${err.message}`;
    } finally {
      btnFetchData.disabled = false;
    }
  }

  function addChartBar(timeMs, status) {
    // Max height corresponds to 2200ms
    const percent = Math.min((timeMs / 2200) * 100, 100);
    
    const bar = document.createElement('div');
    bar.className = `chart-bar ${status.toLowerCase()}`;
    bar.style.height = `${Math.max(percent, 4)}%`; // Min height 4% for visibility
    bar.setAttribute('data-time', `${timeMs}ms (${status})`);
    
    barChart.appendChild(bar);
    barChart.scrollLeft = barChart.scrollWidth; // Auto scroll chart to the right
  }

  async function evictCache() {
    try {
      const res = await fetch('/api/data/cache', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        jsonViewer.textContent = 'Cache evicted successfully. Next API call will be a Cache MISS.';
        metricCacheStatus.textContent = 'EVICTED';
        metricCacheStatus.className = 'metric-val status-miss';
      } else {
        alert('Cache eviction failed: ' + data.error);
      }
    } catch (err) {
      alert('Error evicting cache: ' + err.message);
    }
  }

  // 3. Background Job Queue Triggering & Polling
  async function triggerJob(type) {
    // Generate dummy payload details
    let data = {};
    if (type === 'email') {
      data = {
        to: `user_${Math.floor(Math.random()*100)}@example.com`,
        subject: 'Real-Time Notification Verification',
        body: 'This is a queue processed asynchronous notification payload.'
      };
    } else if (type === 'report') {
      const reports = ['Financial audit', 'Inventory report', 'User engagement metric', 'Performance statistics'];
      data = {
        reportType: reports[Math.floor(Math.random() * reports.length)],
        user: 'Administrator'
      };
    } else if (type === 'notification') {
      data = {
        userId: `DEV_${Math.floor(Math.random()*1000)}`,
        message: 'System configuration modified'
      };
    }

    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data })
      });
      
      const responseData = await res.json();
      if (!responseData.success) {
        alert('Failed to queue job: ' + responseData.error);
        return;
      }
      
      const job = responseData.job;
      createJobCard(job.id, type, job.timestamp);
      pollJobStatus(job.id, type);
      checkRedisStatus();
    } catch (err) {
      alert('Error triggering queue: ' + err.message);
    }
  }

  function createJobCard(id, type, timestamp) {
    // Remove empty state if present
    const emptyState = jobList.querySelector('.empty-state');
    if (emptyState) emptyState.remove();
    
    const iconClass = type === 'email' ? 'fa-envelope text-email' :
                      type === 'report' ? 'fa-file-invoice-dollar text-report' : 'fa-bell text-notification';
                      
    const name = type.charAt(0).toUpperCase() + type.slice(1) + ' Dispatch';

    const card = document.createElement('div');
    card.className = 'job-item';
    card.id = `job-card-${id}`;
    card.innerHTML = `
      <div class="job-info-row">
        <div class="job-meta">
          <i class="fa-solid ${iconClass} job-type-icon"></i>
          <span class="job-name">${name}</span>
          <span class="job-id">#${id}</span>
        </div>
        <span class="job-status-tag status-waiting" id="job-status-${id}">WAITING</span>
      </div>
      <div class="progress-container">
        <div class="progress-bar" id="job-progress-${id}"></div>
      </div>
    `;
    
    jobList.insertBefore(card, jobList.firstChild);
  }

  function pollJobStatus(id, type) {
    if (activeJobs[id]) clearInterval(activeJobs[id]);

    activeJobs[id] = setInterval(async () => {
      try {
        const res = await fetch(`/api/jobs/${id}?type=${type}`);
        const data = await res.json();
        
        if (!data.success) {
          clearInterval(activeJobs[id]);
          return;
        }

        const job = data.job;
        const statusTag = document.getElementById(`job-status-${id}`);
        const progressBar = document.getElementById(`job-progress-${id}`);
        
        if (statusTag && progressBar) {
          // Update status class
          statusTag.textContent = job.state;
          statusTag.className = `job-status-tag status-${job.state}`;
          
          // Update progress bar
          progressBar.style.width = `${job.progress}%`;

          // Handle complete/failed states
          if (job.state === 'completed' || job.state === 'failed') {
            clearInterval(activeJobs[id]);
            delete activeJobs[id];
            
            if (job.state === 'completed') {
              document.getElementById(`job-card-${id}`).classList.add('completed');
            } else {
              document.getElementById(`job-card-${id}`).classList.add('failed');
            }
          }
        }
      } catch (err) {
        console.error('Job polling error:', err);
      }
    }, 800);
  }

  // 4. Server Logs Stream
  let lastLogsCount = 0;
  async function streamLogs() {
    try {
      const res = await fetch('/api/logs');
      const data = await res.json();
      
      if (data.success && data.logs) {
        // If logs list grew or changed, redraw
        if (data.logs.length !== lastLogsCount) {
          const isScrolledToBottom = terminalBody.scrollHeight - terminalBody.clientHeight <= terminalBody.scrollTop + 50;
          
          terminalBody.innerHTML = '';
          data.logs.forEach(log => {
            const row = document.createElement('div');
            row.className = `log-line ${log.type}`;
            row.textContent = `${log.message}`;
            terminalBody.appendChild(row);
          });
          
          lastLogsCount = data.logs.length;
          
          if (isScrolledToBottom) {
            terminalBody.scrollTop = terminalBody.scrollHeight;
          }
        }
      }
    } catch (err) {
      console.error('Log polling failed:', err);
    }
  }

  async function clearLogs() {
    try {
      await fetch('/api/logs', { method: 'DELETE' });
      terminalBody.innerHTML = '<div class="log-line info">[SYS] Logs cleared. Waiting for new requests...</div>';
      lastLogsCount = 0;
    } catch (err) {
      console.error('Failed to clear logs:', err);
    }
  }

  // Event Listeners
  btnFetchData.addEventListener('click', fetchStats);
  btnClearCache.addEventListener('click', evictCache);
  btnClearLogs.addEventListener('click', clearLogs);

  jobButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const jobType = btn.getAttribute('data-job');
      triggerJob(jobType);
    });
  });

  // Start polling
  checkRedisStatus();
  setInterval(checkRedisStatus, 5000);
  setInterval(streamLogs, 1200);
  streamLogs(); // Initial execution
});
