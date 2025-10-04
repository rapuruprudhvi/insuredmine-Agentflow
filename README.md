# AgentFlow - Insurance Policy Management System

A Node.js application built for managing insurance policies, agents, users, carriers, and policy categories with automated scheduling capabilities.

## Project Overview

This system manages insurance data across multiple collections and provides APIs for data upload, search, aggregation, and message scheduling. The application uses worker threads for efficient file processing and includes real-time CPU monitoring with auto-restart capabilities.

## Requirements

- Node.js (v14 or higher)
- MongoDB (running on localhost:27017)
- npm or yarn package manager

## Installation Steps

1. Clone the repository:
```bash
git clone <repository-url>
cd insuredmine-AgentFlow
```

2. Install all dependencies:
```bash
npm install
```

3. Ensure MongoDB is running:
```bash
mongosh --eval "db.version()"
```

4. Create the uploads directory:
```bash
mkdir uploads
```

5. Start the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on port 3000.

## Database Collections

The system uses 6 separate MongoDB collections:

### 1. Agent Collection
- `agent_name` - Agent's name

### 2. User Collection
- `first_name` - User's first name
- `dob` - Date of birth
- `address` - Street address
- `phone_number` - Contact number
- `state` - State code
- `zip_code` - ZIP/Postal code
- `email` - Email address (unique)
- `gender` - Male/Female/Other
- `user_type` - Type of user (e.g., customer)

### 3. Account Collection
- `account_name` - Account name
- `user_id` - Reference to User collection

### 4. LOB Collection (Line of Business / Policy Category)
- `category_name` - Policy category (e.g., Auto, Home, Health, Life)

### 5. Carrier Collection
- `company_name` - Insurance company name

### 6. Policy Collection
- `policy_number` - Unique policy number
- `policy_start_date` - Start date of policy
- `policy_end_date` - End date of policy
- `policy_category_id` - Reference to LOB collection
- `company_id` - Reference to Carrier collection
- `user_id` - Reference to User collection

## Task 1: Policy Management APIs

### 1.1 Upload XLSX/CSV File (Using Worker Threads)

Upload CSV or XLSX files to import policy data into MongoDB. The system uses worker threads to process files without blocking the main thread.

**Endpoint:** `POST /api/upload`

**Method:** POST
**Content-Type:** multipart/form-data
**Field Name:** file

**Accepted File Formats:**
- CSV (.csv)
- Excel (.xlsx, .xls)

**CSV/XLSX Column Headers Required:**
```
agent_name, first_name, dob, address, phone_number, state, zip_code, email,
gender, user_type, account_name, category_name, company_name, policy_number,
policy_start_date, policy_end_date
```

**Postman Setup:**
1. Method: POST
2. URL: `http://localhost:3000/api/upload`
3. Body: form-data
4. Key: `file` (type: File)
5. Value: Select your CSV/XLSX file

**Example Response:**
```json
{
  "success": true,
  "message": "File processed successfully",
  "data": {
    "agents": 10,
    "users": 10,
    "accounts": 10,
    "lobs": 4,
    "carriers": 5,
    "policies": 10,
    "errors": []
  }
}
```

### 1.2 Search Policy by Username

Search for policy information using a username (first name).

**Endpoint:** `GET /api/policy/search?username=<name>`

**Method:** GET
**Query Parameter:** username (required)

**Postman Setup:**
1. Method: GET
2. URL: `http://localhost:3000/api/policy/search?username=John`

**Example Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "...",
      "policy_number": "POL12345",
      "policy_start_date": "2024-01-01T00:00:00.000Z",
      "policy_end_date": "2024-12-31T00:00:00.000Z",
      "policy_category_id": {
        "_id": "...",
        "category_name": "Auto"
      },
      "company_id": {
        "_id": "...",
        "company_name": "ABC Insurance"
      },
      "user_id": {
        "_id": "...",
        "first_name": "John",
        "email": "john@example.com",
        "phone_number": "555-1234"
      }
    }
  ]
}
```

### 1.3 Aggregated Policy by User

Get aggregated policy information grouped by each user, showing total policies per user.

**Endpoint:** `GET /api/policy/aggregated`

**Method:** GET

**Postman Setup:**
1. Method: GET
2. URL: `http://localhost:3000/api/policy/aggregated`

**Example Response:**
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "_id": "...",
      "user_name": "John",
      "user_email": "john@example.com",
      "total_policies": 2,
      "policies": [
        {
          "policy_number": "POL12345",
          "policy_start_date": "2024-01-01T00:00:00.000Z",
          "policy_end_date": "2024-12-31T00:00:00.000Z",
          "category_name": "Auto",
          "carrier_name": "ABC Insurance"
        },
        {
          "policy_number": "POL67890",
          "policy_start_date": "2024-02-01T00:00:00.000Z",
          "policy_end_date": "2025-01-31T00:00:00.000Z",
          "category_name": "Home",
          "carrier_name": "XYZ Insurance"
        }
      ]
    }
  ]
}
```

## Task 2: Server Monitoring & Message Scheduling

### 2.1 Real-time CPU Monitoring with Auto-restart

The server continuously monitors CPU usage every 5 seconds. When CPU utilization reaches 70% or higher, the server automatically restarts.

**Implementation:**
- Monitoring interval: 5 seconds
- Threshold: 70% CPU usage
- Action: Automatic server restart via `process.exit(1)`
- When using nodemon, the server restarts automatically

**Console Output:**
```
CPU Usage: 18.02%
CPU Usage: 15.87%
CPU usage is at 72.45%. Restarting server...
```

### 2.2 Schedule Message Insertion

Schedule a message to be inserted into the database at a specific day and time.

**Endpoint:** `POST /api/message/schedule`

**Method:** POST
**Content-Type:** application/json

**Request Body Parameters:**
- `message` (required) - The message content
- `day` (required) - Date in YYYY-MM-DD format
- `time` (required) - Time in HH:MM:SS format (24-hour)
- `recipient_email` (required) - Email address of recipient
- `recipient_name` (optional) - Name of recipient

**Postman Setup:**
1. Method: POST
2. URL: `http://localhost:3000/api/message/schedule`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
```json
{
  "message": "Your policy is expiring soon!",
  "day": "2025-10-15",
  "time": "09:00:00",
  "recipient_email": "john@example.com",
  "recipient_name": "John"
}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Message scheduled successfully",
  "data": {
    "id": "68e0ced2422566670756aeba",
    "message": "Your policy is expiring soon!",
    "scheduled_for": "2025-10-15T09:00:00.000Z",
    "recipient_email": "john@example.com",
    "recipient_name": "John",
    "status": "pending"
  }
}
```

**Console Output (when scheduled time arrives):**
```
Message sent at Wed Oct 15 2025 09:00:00 GMT+0530
To: john@example.com (John)
Message: Your policy is expiring soon!
```

### 2.3 Get All Scheduled Messages

Retrieve all scheduled messages from the database.

**Endpoint:** `GET /api/message/scheduled`

**Method:** GET

**Postman Setup:**
1. Method: GET
2. URL: `http://localhost:3000/api/message/scheduled`

**Example Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "...",
      "message": "Your policy is expiring soon!",
      "scheduled_day": "2025-10-15T00:00:00.000Z",
      "scheduled_time": "09:00:00",
      "recipient_email": "john@example.com",
      "recipient_name": "John",
      "status": "pending",
      "createdAt": "2025-10-04T12:00:00.000Z",
      "updatedAt": "2025-10-04T12:00:00.000Z"
    }
  ]
}
```

## Complete API Endpoint List

### Health & Info
- `GET /health` - Server health check
- `GET /` - API information and endpoint list

### File Upload (Task 1.1)
- `POST /api/upload` - Upload CSV/XLSX file with policy data

### Policy Search & Aggregation (Task 1.2 & 1.3)
- `GET /api/policy/search?username=<name>` - Search policies by username
- `GET /api/policy/aggregated` - Get aggregated policies by user

### Message Scheduling (Task 2.2)
- `POST /api/message/schedule` - Schedule a message for future insertion
- `GET /api/message/scheduled` - Get all scheduled messages

## Testing in Postman

### Step-by-Step Test Flow

1. **Check Server Health**
   - GET `http://localhost:3000/health`

2. **Upload Sample Data**
   - POST `http://localhost:3000/api/upload`
   - Attach CSV/XLSX file with sample data

3. **Search for a User's Policies**
   - GET `http://localhost:3000/api/policy/search?username=John`

4. **Get Aggregated Data**
   - GET `http://localhost:3000/api/policy/aggregated`

5. **Schedule a Message**
   - POST `http://localhost:3000/api/message/schedule`
   - Body:
   ```json
   {
     "message": "Policy renewal reminder",
     "day": "2025-10-20",
     "time": "14:30:00",
     "recipient_email": "john@example.com",
     "recipient_name": "John"
   }
   ```

6. **View Scheduled Messages**
   - GET `http://localhost:3000/api/message/scheduled`

## Project Structure

```
insuredmine-AgentFlow/
├── config/
│   └── db.js                    # MongoDB connection
├── controllers/
│   ├── uploadController.js      # File upload handler
│   ├── policyController.js      # Policy search & aggregation
│   └── messageController.js     # Message scheduling logic
├── models/
│   ├── Agent.js                 # Agent schema
│   ├── User.js                  # User schema
│   ├── Account.js               # Account schema
│   ├── LOB.js                   # Line of Business schema
│   ├── Carrier.js               # Insurance Carrier schema
│   ├── Policy.js                # Policy schema
│   └── ScheduledMessage.js      # Scheduled Message schema
├── routes/
│   ├── upload.js                # Upload routes
│   ├── policy.js                # Policy routes
│   └── message.js               # Message routes
├── utils/
│   └── cpuMonitor.js            # CPU monitoring with auto-restart
├── workers/
│   └── uploadWorker.js          # Worker thread for file processing
├── uploads/                     # Uploaded files directory
├── server.js                    # Application entry point
├── package.json                 # Dependencies
└── README.md                    # Documentation
```

## Key Features Implemented

### Task 1 Features:
✅ API to upload XLSX/CSV files using worker threads
✅ Separate collections for Agent, User, Account, LOB, Carrier, and Policy
✅ Search API to find policies by username
✅ Aggregated policy data grouped by user

### Task 2 Features:
✅ Real-time CPU monitoring every 5 seconds
✅ Automatic server restart at 70% CPU usage
✅ POST API to schedule messages with day and time
✅ Message insertion into DB at scheduled time
✅ Recipient email and name tracking

## How It Works

### File Upload Process (Worker Threads)
1. File is uploaded via multipart/form-data
2. Multer saves file to `uploads/` directory
3. Main thread spawns a worker thread
4. Worker thread:
   - Connects to MongoDB independently
   - Parses CSV/XLSX file
   - Processes each row and creates/updates records
   - Uses upsert to avoid duplicates
   - Returns summary with counts and errors
5. File is deleted after processing
6. Response sent to client

### CPU Monitoring Process
1. Every 5 seconds, CPU usage is checked
2. Percentage is logged to console
3. If usage >= 70%, server initiates restart
4. When using nodemon, server automatically restarts
5. All scheduled messages are restored on restart

### Message Scheduling Process
1. Message details are saved to DB with status: "pending"
2. `node-schedule` creates a cron job for the specified date/time
3. When time arrives, message is logged to console
4. Database record is updated to status: "completed"
5. On server restart, all pending messages are rescheduled

## Dependencies

```json
{
  "express": "^4.18.2",
  "mongoose": "^8.0.0",
  "multer": "^1.4.5-lts.1",
  "xlsx": "^0.18.5",
  "csv-parser": "^3.0.0",
  "node-schedule": "^2.1.1",
  "os-utils": "^0.0.14"
}
```

## Sample CSV Data Format

```csv
agent_name,first_name,dob,address,phone_number,state,zip_code,email,gender,user_type,account_name,category_name,company_name,policy_number,policy_start_date,policy_end_date
Alice Agent,John,14-05-1990,123 Main St,555-1234,CA,90001,john@example.com,Male,customer,JohnAccount,Auto,ABC Insurance,POL12345,01-01-2024,31-12-2024
Bob Agent,Mary,22-08-1985,456 Oak Ave,555-5678,NY,10001,mary@example.com,Female,customer,MaryAccount,Health,Good Health Insurance,POL54321,01-03-2024,28-02-2025
```

## Troubleshooting

**MongoDB Connection Error:**
```bash
# Start MongoDB
mongod
```

**Port 3000 in Use:**
```bash
# Change port
PORT=4000 npm start
```

**Uploads Directory Missing:**
```bash
mkdir uploads
```
