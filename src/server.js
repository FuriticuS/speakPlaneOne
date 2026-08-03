import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import projectsRoutes from './modules/projects/projectsRoutes.js';
import pagesRoutes from './modules/pages/pagesRoutes.js';
import blocksRoutes from './modules/blocks/blocksRoutes.js';
import errorMiddleware from './middleware/errorMiddleware.js';

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
app.use('/projects', projectsRoutes);
app.use('/projects/:projectId/pages', pagesRoutes);
app.use('/projects/:projectId/pages/:pageId/blocks', blocksRoutes);

app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
