const express = require('express');
const router = express.Router();
const { verifyToken } = require('./../middlewares/auth.middleware.js');
const Strategy = require('./../models/strategy.model.js');
const StrategyAgent = require('./../models/strategyAgent.model.js');
const StrategyUser = require('./../models/strategyUser.model.js');

router.get('/strategies', verifyToken, async (req, res, next) => {
	try {
		const { search = '', site = '', agents = '', map = '', favorites = '0' } = req.query;
		const strategies = await Strategy.find({ map: map })
			.populate('bombSiteLocation')
			.lean();

		const strategyIds = strategies.map((strategy) => strategy._id);
		const links = await StrategyAgent.find({ strategy: { $in: strategyIds } })
			.populate('agent')
			.lean();
		const favoriteLinks = await StrategyUser.find({
			strategy: { $in: strategyIds },
			user: req.payload.id,
		}).lean();
		const favoriteIds = new Set(favoriteLinks.map((link) => String(link.strategy)));
		const agentsByStrategy = new Map();

		links.forEach((link) => {
			const key = String(link.strategy);
			const current = agentsByStrategy.get(key) || [];
			current.push(link.agent);
			agentsByStrategy.set(key, current);
		});

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

module.exports = router;
