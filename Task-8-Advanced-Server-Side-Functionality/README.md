# Task 8: Advanced Server-Side Functionality

This project implements advanced server-side backend features in Node.js and Express: custom middleware, background job queue processing (Bull/Redis), and server-side response caching (Redis). It comes with a premium interactive Glassmorphic dashboard to visually test and verify all operations.

---

## Features & Core Components

### 1. Middleware Architecture
* **Custom Request Logger (`middleware/logger.js`)**: Captures HTTP request metadata (`method`, `URL`, `timestamp`, `status code`) and logs detailed metrics, including accurate execution duration in milliseconds, by hooking into the response object's `finish` event.
* **Custom JSON Body Parser (`middleware/parser.js`)**: Aggregates incoming TCP stream chunks and decodes them into structured JSON assigned to `req.body`, complete with robust error handling for malformed JSON payloads.

### 2. Redis Caching Layer
* **Response Cache (`controllers/cacheController.js` & `services/redisService.js`)**:
  * Simulates a heavy database operations query (takes exactly 2000ms).
  * Automatically intercepts calls, searches for cached stats in Redis, and replies immediately on a **Cache HIT** (<10ms).
  * On a **Cache MISS**, queries the database, commits the result to Redis with a TTL of 30 seconds, and serves the client.
  * Demonstrates substantial performance improvements, visible through dynamic response time graphs on the UI.
  * Supports manual eviction of cached keys.

### 3. Background Job Queue
* **Producer-Worker Queue (`queues/jobQueue.js` & `workers/jobWorker.js`)**:
  * Uses **Bull** (backed by Redis) to offload time-consuming tasks from the main thread.
  * Supports three asynchronous job types:
    1. **Email Dispatch**: Simulates templates assembly and SMTP handshake (3 seconds).
    2. **Report Compilation**: Simulates heavy table collation, updating progress in 20% increments (5 seconds).
    3. **Notifications Dispatch**: Simulates web pushes (1 second).
  * Emits status changes (Completed/Failed/Progress) directly to console logs.
  * Real-time polling updates are rendered on the UI dashboard with active progress bars.

---

## Prerequisites & Redis Setup for Windows

To run the background queues and cache features, **Redis** must be installed and running on your system.

### Option A: Install via WSL (Windows Subsystem for Linux) - *Recommended*
1. Open PowerShell or Command Prompt and run:
   ```bash
   wsl --install
   ```
2. Once Linux is installed, open the WSL terminal and install Redis:
   ```bash
   sudo apt-get update
   sudo apt-get install redis-server
   ```
3. Start the Redis server:
   ```bash
   sudo service redis-server start
   ```
4. Verify Redis is running:
   ```bash
   redis-cli ping
   # Expected Output: PONG
   ```

### Option B: Use Memurai (Native Windows Redis port)
1. Download the installer from the [Memurai Developer website](https://www.memurai.com/).
2. Run the installer. It will automatically register Redis as a Windows Service running on port `6379`.

### Option C: Run using Docker
If you have Docker Desktop installed, spin up a Redis container with:
```bash
docker run -d --name redis-container -p 6379:6379 redis
```

---

## Installation & Setup

1. Open a terminal in the task directory:
   ```bash
   cd Task-8-Advanced-Server-Side-Functionality
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the application:
   ```bash
   npm start
   ```
4. Open your web browser and navigate to:
   ```
   http://localhost:3000
   ```

*Note: If Redis is not running, the application will boot in **graceful fallback mode**. Caching will fall back to dynamic database responses, and background queues will notify you that Redis is offline rather than crashing the server process.*

---

## API Documentation

### Caching
* **`GET /api/data`**: Returns dashboard metrics.
  * Response Headers:
    * `X-Cache-Status`: `HIT` or `MISS`
    * `X-Response-Time`: Duration in ms (e.g. `2004ms` or `2ms`)
* **`DELETE /api/data/cache`**: Manually evicts the cached database stats key.

### Queues
* **`POST /api/jobs`**: Queues a background job.
  * Body: `{ "type": "email" | "report" | "notification", "data": { ... } }`
* **`GET /api/jobs`**: Returns a list of jobs triggered in the current session.
* **`GET /api/jobs/:id?type=type`**: Queries current status (progress, state, logs).

### Logs
* **`GET /api/logs`**: Fetches the rolling log buffer from the server.
* **`DELETE /api/logs`**: Clears the console logs buffer.
