const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const { verifyToken } = require("./../middlewares/auth.middleware.js");
const Map = require('./../models/map.model.js');
const BombMapLocation = require('./../models/bombMapLocation.model.js');
const Strategy = require('./../models/strategy.model.js');


router.get('/maps', verifyToken, async (req, res, next) => {

    try {
        const response = await Map.aggregate([
            {
                $lookup: {
                    from: 'strategies',  // le nom de la collection MongoDB (généralement le pluriel en minuscule du nom du modèle)
                    localField: '_id',   // le champ de Map à comparer
                    foreignField: 'map', // le champ de Strategy qui référence la map
                    as: 'strategies',    // le nom temporaire du tableau résultat
                },
            },
            {
                $addFields: {
                    strategiesCount: { $size: '$strategies' }, // compte les éléments du tableau
                },
            },
            {
                $project: {
                    strategies: 0, // on retire le tableau complet des stratégies, on ne garde que le compte
                },
            },
        ]);

        if (!response) {
            res.sendStatus(204);
            return;
        }

        res.status(200).json(response);
    } catch (err) {
        next(err);
    }

})

router.get('/maps/:slug', verifyToken, async (req, res, next) => {
    try {
        const includes = String(req.query.include || '')
            .split(',')
            .map((value) => value.trim())
            .filter(Boolean);
        const includeBombSites = includes.includes('bombSites');
        const includeStrategies = includes.includes('strategies');
        const map = await Map.findOne({ slug: req.params.slug }).lean();

        if (!map) {
            return res.status(404).json({ errorMessage: 'MAP_NOT_FOUND' });
        }
        const response = { ...map };

        if (includeBombSites) {
            response.bombMapLocations = await BombMapLocation.find({ map: map._id }).lean();
        }

        if (includeStrategies) {
            response.strategies = await Strategy.find({ map: map._id }).lean();
            response.strategiesCount = response.strategies.length;
        }

        res.status(200).json(response);
    } catch (err) {
        next(err);
    }
});

module.exports = router;