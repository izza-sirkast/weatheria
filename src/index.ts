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

app.get('/country', async (req: Request, res: Response) => {
    try {
        const response = await axios.get(`http://dataservice.accuweather.com/locations/v1/cities/autocomplete`,
            {
                params: {
                    q: 'ban',
                    apikey: process.env.ACCUWEATHER_API_KEY,
                }
            }
        );

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
})