import { Router, Request, Response } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import Redis from 'ioredis';

const redis = new Redis();
dotenv.config();

const router = Router();

router.get('/find', async (req: Request, res: Response) => {
    let { city, countryid } = req.query;

    if (!city || !countryid) {
        res.status(400).json({ error: 'City and country ID are required' });
        return;
    }

    
    try {
        // Check Redis cache first
        const cacheKey = `conditions/find?city=${city}&countryid=${countryid}`;
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
            res.status(200).json(JSON.parse(cachedData));
            return;
        }

        const resLocations = await axios.get('http://dataservice.accuweather.com/locations/v1/cities/search', {
            params: {
                q: city,
                apikey: process.env.ACCUWEATHER_API_KEY,
            }
        })

        countryid = countryid.toString().toLowerCase();
        const location = resLocations.data.find((loc: any) => loc.Country.ID.toLowerCase() === countryid);

        if (!location) {
            res.status(404).json({ error: 'Location not found' });
            return;
        }

        const response = await axios.get(`http://dataservice.accuweather.com/currentconditions/v1/${location.Key}`,
            {
                params: {
                    apikey: process.env.ACCUWEATHER_API_KEY,
                }
            }
        )


        // Store in Redis cache for 1 hour
        await redis.set(cacheKey, JSON.stringify(response.data), 'EX', 3600);

        res.status(200).json(response.data);
        return;
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
        return;
    }
})

router.get('/:locationkey', async (req: Request, res: Response) => {
    const { locationkey } = req.params;

    if (!locationkey) {
        res.status(400).json({ error: 'Location key is required' });
        return;
    }

    try {
        // Check Redis cache first
        const cacheKey = `conditions/${locationkey}`;
        const cachedData = await redis.get(cacheKey);

        if (cachedData) {
            res.status(200).json(JSON.parse(cachedData));
            return;
        }

        const response = await axios.get(`http://dataservice.accuweather.com/currentconditions/v1/${locationkey}`,
            {
                params: {
                    apikey: process.env.ACCUWEATHER_API_KEY,
                }
            }
        )

        if (!response.data || response.data.length === 0) {
            res.status(404).json({ error: 'Location not found' });
            return;
        }

        // Store in Redis cache for 1 hour
        await redis.set(cacheKey, JSON.stringify(response.data), 'EX', 3600);

        res.status(200).json(response.data);
        return;
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
        return;
    }
})

export default router;

