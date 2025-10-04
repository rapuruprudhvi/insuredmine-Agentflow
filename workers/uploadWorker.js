const { parentPort, workerData } = require('worker_threads');
const XLSX = require('xlsx');
const csv = require('csv-parser');
const fs = require('fs');
const mongoose = require('mongoose');

// Connect to MongoDB first
const initDB = async () => {
  await mongoose.connect('mongodb://localhost:27017/agentflow');
  console.log('Worker: MongoDB connected');
};

// Import models after MongoDB connection
const loadModels = () => {
  // Clear cached requires to get fresh model instances
  delete require.cache[require.resolve('../models/Agent')];
  delete require.cache[require.resolve('../models/User')];
  delete require.cache[require.resolve('../models/Account')];
  delete require.cache[require.resolve('../models/LOB')];
  delete require.cache[require.resolve('../models/Carrier')];
  delete require.cache[require.resolve('../models/Policy')];

  // Also clear from mongoose models
  delete mongoose.models['Agent'];
  delete mongoose.models['User'];
  delete mongoose.models['Account'];
  delete mongoose.models['LOB'];
  delete mongoose.models['Carrier'];
  delete mongoose.models['Policy'];

  // Require fresh models
  const Agent = require('../models/Agent');
  const User = require('../models/User');
  const Account = require('../models/Account');
  const LOB = require('../models/LOB');
  const Carrier = require('../models/Carrier');
  const Policy = require('../models/Policy');

  return { Agent, User, Account, LOB, Carrier, Policy };
};

const processFile = async (filePath, fileType) => {
  // Ensure DB is connected
  await initDB();

  // Load models after DB connection
  const { Agent, User, Account, LOB, Carrier, Policy } = loadModels();

  try {
    let data = [];

    if (fileType === 'xlsx') {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    } else if (fileType === 'csv') {
      data = await new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (row) => results.push(row))
          .on('end', () => resolve(results))
          .on('error', (error) => reject(error));
      });
    }

    // Process data and insert into respective collections
    const results = {
      agents: 0,
      users: 0,
      accounts: 0,
      lobs: 0,
      carriers: 0,
      policies: 0,
      errors: []
    };

    for (const row of data) {
      try {
        // Create or find Agent
        let agent = null;
        if (row.agent_name) {
          agent = await Agent.findOneAndUpdate(
            { agent_name: row.agent_name },
            { agent_name: row.agent_name },
            { upsert: true, new: true }
          );
          results.agents++;
        }

        // Create User
        let user = null;
        if (row.first_name && row.email) {
          user = await User.findOneAndUpdate(
            { email: row.email },
            {
              first_name: row.first_name,
              dob: row.dob ? new Date(row.dob) : new Date(),
              address: row.address || '',
              phone_number: row.phone_number || '',
              state: row.state || '',
              zip_code: row.zip_code || '',
              email: row.email,
              gender: row.gender || 'Other',
              user_type: row.user_type || 'standard'
            },
            { upsert: true, new: true }
          );
          results.users++;
        }

        // Create Account
        let account = null;
        if (row.account_name && user) {
          account = await Account.findOneAndUpdate(
            { account_name: row.account_name, user_id: user._id },
            {
              account_name: row.account_name,
              user_id: user._id
            },
            { upsert: true, new: true }
          );
          results.accounts++;
        }

        // Create or find LOB (Policy Category)
        let lob = null;
        if (row.category_name) {
          lob = await LOB.findOneAndUpdate(
            { category_name: row.category_name },
            { category_name: row.category_name },
            { upsert: true, new: true }
          );
          results.lobs++;
        }

        // Create or find Carrier
        let carrier = null;
        if (row.company_name) {
          carrier = await Carrier.findOneAndUpdate(
            { company_name: row.company_name },
            { company_name: row.company_name },
            { upsert: true, new: true }
          );
          results.carriers++;
        }

        // Create Policy
        if (row.policy_number && user && lob && carrier) {
          await Policy.findOneAndUpdate(
            { policy_number: row.policy_number },
            {
              policy_number: row.policy_number,
              policy_start_date: row.policy_start_date ? new Date(row.policy_start_date) : new Date(),
              policy_end_date: row.policy_end_date ? new Date(row.policy_end_date) : new Date(),
              policy_category_id: lob._id,
              company_id: carrier._id,
              user_id: user._id
            },
            { upsert: true, new: true }
          );
          results.policies++;
        }
      } catch (error) {
        results.errors.push({
          row: row,
          error: error.message
        });
      }
    }

    // Close MongoDB connection
    await mongoose.connection.close();

    // Send results back to main thread
    parentPort.postMessage({
      success: true,
      results: results
    });
  } catch (error) {
    parentPort.postMessage({
      success: false,
      error: error.message
    });
  }
};

// Start processing
processFile(workerData.filePath, workerData.fileType);