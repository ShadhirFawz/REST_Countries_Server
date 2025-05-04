// app.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import countryRoutes from './routes/countryRoutes.js';
import favoriteRoutes from './routes/favoriteRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/countries', countryRoutes);
app.use('/api/favorites', favoriteRoutes);

export const server = app.listen(0); // 0 means random port
export default app;