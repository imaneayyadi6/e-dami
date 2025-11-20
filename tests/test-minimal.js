
import express from 'express';

const app = express();


app.use(express.json());


app.get('/test', (req, res) => {
  res.json({ message: 'Test OK', timestamp: new Date().toISOString() });
});


app.post('/api/utilisateurs/login', (req, res) => {
  console.log('Login attempt:', req.body);
  res.json({
    message: 'Login test successful',
    token: 'test-token-123',
    user: { id: 1, email: req.body.email }
  });
});


app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

const PORT = 4000;

app.listen(PORT, () => {
  console.log(`✅ Serveur de test démarré sur le port ${PORT}`);
  console.log(`🔗 Test: http://localhost:${PORT}/test`);
  console.log(`❤️ Health: http://localhost:${PORT}/health`);
  console.log(`🔐 Login: POST http://localhost:${PORT}/api/utilisateurs/login`);
});


process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});
