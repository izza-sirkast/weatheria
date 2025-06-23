import { Router } from 'express';
import { Request, Response } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

router.get('/find', async (req: Request, res: Response) => {
    const { q } = req.query;

    try {
        const response = await axios.get(`http://dataservice.accuweather.com/locations/v1/cities/autocomplete`,
            {
                params: {
                    q,
                    apikey: process.env.ACCUWEATHER_API_KEY,
                }
            }
        );

        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
})

export default router;