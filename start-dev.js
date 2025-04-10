const { spawn } = require('child_process');
const chalk = require('chalk') || { green: text => text, red: text => text, blue: text => text, yellow: text => text };
const path = require('path');
const fs = require('fs');

// Determine platform-specific commands
const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';
const nodeCmd = isWindows ? 'node.exe' : 'node';

console.log(chalk.blue('🚀 Starting development environment...'));

// Check if the port is available
const checkPortAvailable = (port) => {
  const net = require('net');
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port);
  });
};

// Start the backend server
const startServer = async () => {
  try {
    const port = 5001; // Default port
    const isPortAvailable = await checkPortAvailable(port);
    
    if (!isPortAvailable) {
      console.log(chalk.yellow(`⚠️ Warning: Port ${port} is already in use!`));
      console.log(chalk.yellow('This might be another instance of the server.'));
      console.log(chalk.yellow('Continuing anyway, but you might encounter connection issues.'));
    }
    
    console.log(chalk.green('🔌 Starting backend server...'));
    const server = spawn(nodeCmd, ['server.cjs'], {
      stdio: 'inherit',
      env: { ...process.env, PORT: port }
    });

    server.on('error', (err) => {
      console.error(chalk.red('❌ Failed to start server:'), err);
    });

    return server;
  } catch (error) {
    console.error(chalk.red('❌ Error starting server:'), error);
    process.exit(1);
  }
};

// Start the frontend dev server
const startClient = () => {
  try {
    console.log(chalk.green('🌐 Starting frontend dev server...'));
    const client = spawn(npmCmd, ['run', 'dev'], {
      stdio: 'inherit'
    });

    client.on('error', (err) => {
      console.error(chalk.red('❌ Failed to start client:'), err);
    });

    return client;
  } catch (error) {
    console.error(chalk.red('❌ Error starting client:'), error);
    process.exit(1);
  }
};

// Write the API URL to .env file if it doesn't exist
const setupEnvFile = () => {
  try {
    const envPath = path.join(__dirname, '.env');
    if (!fs.existsSync(envPath)) {
      console.log(chalk.blue('📄 Creating .env file with API URL...'));
      fs.writeFileSync(envPath, 'VITE_API_URL=http://localhost:5001\n');
    } else {
      // Check if VITE_API_URL is in the .env file
      const envContent = fs.readFileSync(envPath, 'utf8');
      if (!envContent.includes('VITE_API_URL=')) {
        console.log(chalk.blue('📄 Adding API URL to .env file...'));
        fs.appendFileSync(envPath, '\nVITE_API_URL=http://localhost:5001\n');
      }
    }
  } catch (error) {
    console.error(chalk.yellow('⚠️ Warning: Failed to set up .env file:'), error);
  }
};

// Main function to start everything
const main = async () => {
  setupEnvFile();
  
  // Start the server first
  const serverProcess = await startServer();
  
  // Then start the client
  const clientProcess = startClient();
  
  // Handle process termination
  const cleanup = () => {
    console.log(chalk.blue('\n🛑 Shutting down development environment...'));
    if (serverProcess) serverProcess.kill();
    if (clientProcess) clientProcess.kill();
  };
  
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  process.on('exit', cleanup);
};

main().catch(err => {
  console.error(chalk.red('❌ Fatal error:'), err);
  process.exit(1);
}); 