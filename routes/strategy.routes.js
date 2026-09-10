const express = require('express');
const router = express.Router();
const { verifyToken } = require('./../middlewares/auth.middleware.js');
const Strategy = require('./../models/strategy.model.js');
const StrategyUser = require('./../models/strategyUser.model.js');

router.get('/strategies', verifyToken, async (req, res, next) => {
	try {
		const { search = '', site = '', agents = '', map = '', favorites = '0' } = req.query;
		const strategies = await Strategy.find({ map: map })
			.populate('bombSiteLocation')
			.lean();

		const strategyIds = strategies.map((strategy) => strategy._id);
		const favoriteLinks = await StrategyUser.find({
			strategy: { $in: strategyIds },
			user: req.payload.id,
		}).lean();
		const favoriteIds = new Set(favoriteLinks.map((link) => String(link.strategy)));
		const agentsByStrategy = new Map();


		const selectedAgents = String(agents).split(',').filter(Boolean);
		const filtered = strategies
			.map((strategy) => ({
				...strategy,
				agents: agentsByStrategy.get(String(strategy._id)) || [],
				isFavorite: favoriteIds.has(String(strategy._id)),
			}))
			.filter((strategy) => !search || strategy.title.toLowerCase().includes(String(search).toLowerCase()))
			.filter((strategy) => !site || strategy.bombSiteLocation?.zoneName === site)
			.filter((strategy) => !selectedAgents.length || strategy.agents.some((agent) => selectedAgents.includes(String(agent._id))))
			.filter((strategy) => favorites !== '1' || strategy.isFavorite);

		res.status(200).json(filtered);
	} catch (err) {
		next(err);
	}
});

router.get('/strategies/:id', verifyToken, async (req, res, next) => {
	try {
		const strategy = await Strategy.findById(req.params.id)
			.populate('map')
			.populate('bombSiteLocation')
			.lean();

		if (!strategy) return res.status(404).json({ errorMessage: 'STRATEGY_NOT_FOUND' });
		res.status(200).json(strategy);
	} catch (err) {
		next(err);
	}
});

router.post('/strategies/:strategyId/favorite', verifyToken, async (req, res, next) => {
	try {
		await StrategyUser.findOneAndUpdate(
			{ strategy: req.params.strategyId, user: req.payload.id },
			{ strategy: req.params.strategyId, user: req.payload.id },
			{ upsert: true, new: true },
		);
		res.sendStatus(204);
	} catch (err) {
		next(err);
	}
});

router.delete('/strategies/:strategyId/favorite', verifyToken, async (req, res, next) => {
	try {
		await StrategyUser.deleteOne({ strategy: req.params.strategyId, user: req.payload.id });
		res.sendStatus(204);
	} catch (err) {
		next(err);
	}
});

// onst url = editMode ? `api/save-strategy/${editId}` : "/save-strategy";
router.post('/save-strategy', verifyToken, async (req, res, next) => {
	try {
		const { title, map_id, bombsite, walls, agents } = req.body
		const newStrategy = await Strategy.create({
			title,
			infosStrategy: {
				"walls": walls,
				"agents": agents
			},
			map: map_id,
			user: req.payload._id,
			bombSiteLocation: bombsite
		});
		res.status(201).json(newStrategy);
	} catch (err) {
		next(err);
	}
});

router.put('/api/strategies/:id', verifyToken, async (req, res, next) => {
	try {
		const { title, map_id, bombsite, walls, agents } = req.body
		const updated = await Strategy.findByIdAndUpdate(
			req.params.id,
			{
				title,
				infosStrategy: {
					"walls": walls,
					"agents": agents
				},
				map: map_id,
				user: req.payload._id,
				bombSiteLocation: bombsite
			},
			{ new: true }
		);
		res.json(updated);
	} catch (err) {
		next(err);
	}

});

module.exports = router;
