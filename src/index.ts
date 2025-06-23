import express from 'express';
import { Request, Response } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

// Routes
import locationsRoutes from './routes/location.routes';
import conditionRoutes from './routes/condition.routes';

dotenv.config();

const app = express();
app.use(express.json());

app.use('/locations', locationsRoutes);
app.use('/conditions', conditionRoutes)

app.get('/', (req: Request, res: Response) => {
    res.send('Hello, World!');
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
})