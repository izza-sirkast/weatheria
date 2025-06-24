import { Router } from 'express';
import { Request, Response } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import Redis from 'ioredis';

const redis = new Redis();
dotenv.config();

const router = Router();

router.get('/find', async (req: Request, res: Response) => {
    const { q } = req.query;

    if (!q) {
        res.status(400).json({ error: 'Query parameter "q" is required' });
        return;
    }

    try {
        // Check Redis cache first
        const cacheKey = `locations/find?q=${q}`;
        const cachedData = await redis.get(cacheKey);

        if (cachedData) {
            res.status(200).json(JSON.parse(cachedData));
            return;
        }

        const response = await axios.get(`http://dataservice.accuweather.com/locations/v1/cities/autocomplete`,
            {
                params: {
                    q,
                    apikey: process.env.ACCUWEATHER_API_KEY,
                }
            }
        );

        if (!response.data || response.data.length === 0) {
            res.status(404).json({ error: 'No locations found' });
            return;
        }

        // Store in Redis cache for 1 hour
        await redis.set(cacheKey, JSON.stringify(response.data), 'EX', 3600);

        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
})

export default router;