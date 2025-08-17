import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './db/conn.js';
import userRoutes from './routes/userRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import forumRoutes from './routes/forumRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import goalsRoutes from './routes/goals.js';
import adminRoutes from './routes/adminRoutes.js'

import path from 'path';
import { fileURLToPath } from 'url';



dotenv.config();
connectDB();

const app = express();

// Enable CORS for frontend origin
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); 

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/forums', forumRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});