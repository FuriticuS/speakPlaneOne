import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);

app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  res.status(status).json({
    message: err.message || 'Internal server error',
    status: status,
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
