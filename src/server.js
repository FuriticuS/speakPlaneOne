import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import blocksRoutes from './modules/blocks/blocksRoutes.js';
import profileRoutes from './modules/profile/profileRoutes.js';
import errorMiddleware from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CORS_ORIGIN || true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/blocks', blocksRoutes);
app.use('/profile', profileRoutes);

app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
