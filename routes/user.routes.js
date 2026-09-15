const User = require('./../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router()
const { verifyToken } = require("./../middlewares/auth.middleware");
const Strategy = require('../models/strategy.model');
const Agent = require('../models/agent.model');

router.post("/update-password", verifyToken, async (req, res, next) => {

    const userId = req.payload.id;
    const { current, newPassword, confirmPassword } = req.body;

    try {

        if (newPassword !== confirmPassword) {
            res.send(400).json({ message: 'Password and Password Repeat are not the same' });
        }

        const user = await User.findById(userId);
        const passwordMatch = await bcrypt.compare(current, user.password);
        if (!passwordMatch) {
            res.status(400).json({ message: "Password is wrong" });
            return;
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);

        await User.findByIdAndUpdate(
            userId,
            { password: hashedPassword },
            {
                runValidators: true,
            },
        );

        res.status(200).json({ message: 'Password updated' });

    } catch (err) {
        next(err);
    }
});

router.get('/profile', verifyToken, async (req, res, next) => {

    const userId = req.payload.id;
    const username = req.payload.username;

    // get Favorites strat (first 12)
    try {
        const favoritesList = await User.findById(userId, { _id: 0, image: 1, favorites: 1 }).select('favorites').lean();

        const [ownStrats, ownStratsTotal] = await Promise.all([
            Strategy.find({ user: userId }).populate('map', 'name slug thumbnail')
                .populate('bombSiteLocation').limit(12),
            Strategy.countDocuments({ user: userId }),
        ]);

        const favoriteStrats = await Strategy.find({ _id: { $in: (favoritesList.favorites.slice(0, 12) || []) } }).populate('map', 'name slug thumbnail')
            .populate('bombSiteLocation')

        const favoriteIds = new Set(favoritesList.favorites.map(String));
        const agentsData = await Agent.find({}).select('name iconAgent').lean();

        const formatStrategy = (strategy) => ({
            id: String(strategy._id),
            title: strategy.title,
            map_slug: strategy.map?.slug,
            map_name: strategy.map?.name,
            map_thumbnail: strategy.map?.thumbnail,
            bombsite_name: strategy.bombSiteLocation?.zoneName,
            bombsite_id: strategy.bombSiteLocation?._id,
            is_favorite_for_me: favoriteIds.has(String(strategy._id)),
            agents: (strategy.infosStrategy?.agents || [])
                .map((a) => {
                    let agentStrat = agentsData.find((agent) => a.id_agent == agent._id.toString())
                    return { id: String(agentStrat._id), name: agentStrat.name, icon: agentStrat.iconAgent }
                })
        });

        const ownStrategies = ownStrats.map(formatStrategy);
        const favoriteStrategies = favoriteStrats.map(formatStrategy);

        res.status(200).json({ username, image: favoritesList.image, ownStrategies: ownStrategies, ownStratsTotal, favoriteStrategies: favoriteStrategies, favoriteStrategiesTotal: favoritesList.favorites.length });
    } catch (err) {
        next(err);
    }


    // get own strat ( first 12 )

});

router.put('/change-profil-image', verifyToken, async (req, res, next) => {
    const { profilImage } = req.body;

    if (!profilImage) {
        return res.status(400).json({ message: "profilImage manquant" });
    }


    try {
        const updatedUser = await User.findByIdAndUpdate(req.payload.id, { image: profilImage });

        if (!updatedUser) {
            return res.status(404).json({ message: "Utilisateur introuvable" });
        }

        res.status(200).json({ message: "Image updated" });
    } catch (err) {
        next(err);
    }
})


module.exports = router;