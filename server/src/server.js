const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// When running as a standalone server (local dev or traditional hosting)
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`\n🚀 ATS Server running on port ${PORT}`);
        console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`   Root: http://localhost:${PORT}/`);
        console.log(`   Health check: http://localhost:${PORT}/api/health`);
        console.log(`   API base: http://localhost:${PORT}/api\n`);
      });
    })
    .catch((err) => {
      console.error('Failed to start server:', err.message);
    });
}

module.exports = app;
