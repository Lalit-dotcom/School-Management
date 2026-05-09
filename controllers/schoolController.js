const db = require('../config/db.js');
const calculateDistance = require('../utils/distance.js');

const addSchool = (req, res) => {
    const { name, address, latitude, longitude } = req.body;

    // Validation
    if (!name || !address || latitude === undefined || longitude === undefined) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required'
        });
    }

    if (
        typeof latitude !== 'number' ||
        typeof longitude !== 'number'
    ) {
        return res.status(400).json({
            success: false,
            message: 'Latitude and Longitude must be numbers'
        });
    }
    const query = `
        INSERT INTO schools (name, address, latitude, longitude)
        VALUES (?, ?, ?, ?)
    `;

    db.query(query, [name, address, latitude, longitude], (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        res.status(201).json({
            success: true,
            message: 'School added successfully',
            schoolId: result.insertId
        });
    });
};

// List Schools API
const listSchools = (req, res) => {
    const userLat = parseFloat(req.query.latitude);
    const userLon = parseFloat(req.query.longitude);

    if (isNaN(userLat) || isNaN(userLon)) {
        return res.status(400).json({
            success: false,
            message: 'Valid latitude and longitude are required'
        });
    }

    const query = 'SELECT * FROM schools';

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        const schoolsWithDistance = results.map((school) => {
            const distance = calculateDistance(
                userLat,
                userLon,
                school.latitude,
                school.longitude
            );

            return {
                ...school,
                distance: Number(distance.toFixed(2))
            };
        });

        schoolsWithDistance.sort((a, b) => a.distance - b.distance);

        res.status(200).json({
            success: true,
            count: schoolsWithDistance.length,
            schools: schoolsWithDistance
        });
    });
};

module.exports = {
    addSchool,
    listSchools
};