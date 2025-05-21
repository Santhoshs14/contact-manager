const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', (req, res) => {
    const { firstName, lastName, countryCode, contactNumber, dob, email, picture } = req.body;
    const query = `INSERT INTO contacts (firstName, lastName, countryCode, contactNumber, dob, email, picture, deleted)
                 VALUES (?, ?, ?, ?, ?, ?, ?, 0)`;
    db.query(query, [firstName, lastName, countryCode, contactNumber, dob, email, picture], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ id: result.insertId });
    });
});

router.get('/', (req, res) => {
    db.query("SELECT * FROM contacts WHERE deleted = 0", (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

router.get('/deleted', (req, res) => {
    db.query("SELECT * FROM contacts WHERE deleted = 1", (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

router.put('/delete/:id', (req, res) => {
    db.query("UPDATE contacts SET deleted = 1 WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json(err);
        res.sendStatus(200);
    });
});

router.put('/recover/:id', (req, res) => {
    db.query("UPDATE contacts SET deleted = 0 WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json(err);
        res.sendStatus(200);
    });
});
router.put('/:id', (req, res) => {
    const { firstName, lastName, countryCode, contactNumber, dob, email, picture } = req.body;
    const query = `UPDATE contacts SET firstName=?, lastName=?, countryCode=?, contactNumber=?, dob=?, email=?, picture=? WHERE id=?`;
    db.query(query, [firstName, lastName, countryCode, contactNumber, dob, email, picture, req.params.id], (err) => {
        if (err) return res.status(500).json(err);
        res.sendStatus(200);
    });
});
router.delete("/permanent/:id", (req, res) => {
    const query = "DELETE FROM contacts WHERE id = ?";
    db.query(query, [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.sendStatus(200);
    });
});

module.exports = router;