const express = require('express');
const router = express.Router();
const { geocodeAddress } = require('../services/mapService');

/**
 * POST /api/map/geocode
 * 接收地址，返回经纬度
 */
router.post('/geocode', async (req, res) => {
    const { address, apiKey } = req.body;

    if (!address) {
        return res.status(400).json({ error: 'Address is required.' });
    }
    if (!apiKey) {
        return res.status(400).json({ error: 'Map API key is required.' });
    }

    try {
        const coordinates = await geocodeAddress(address, apiKey);
        console.log('Geocoding endpoint result for address:', address, coordinates);
        if (coordinates) {
            res.status(200).json(coordinates);
        } else {
            res.status(404).json({ error: 'Could not find coordinates for the given address.' });
        }
    } catch (error) {
        console.error('Geocoding endpoint error:', error);
        res.status(500).json({ error: 'Failed to geocode address.' });
    }
});

module.exports = router;

