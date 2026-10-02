// Helper script to run hardhat commands
// Usage: node run-hardhat.js <command> [args...]
const { execSync } = require('child_process');
const args = process.argv.slice(2).join(' ');
try {
  execSync(`node node_modules/hardhat/internal/cli/bootstrap.js ${args}`, {
    cwd: __dirname,
    stdio: 'inherit',
    env: { ...process.env, NODE_PATH: __dirname + '/node_modules' }
  });
} catch (e) {
  process.exit(e.status || 1);
}
