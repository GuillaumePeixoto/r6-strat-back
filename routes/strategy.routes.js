const express = require('express');
const router = express.Router();
const { verifyToken } = require('./../middlewares/auth.middleware.js');
const Strategy = require('./../models/strategy.model.js');
const User = require('./../models/user.model.js');
const Agent = require('./../models/agent.model.js');

router.get('/strategies', verifyToken, async (req, res, next) => {
	try {
		const query = req.query;

		const [strategies, user] = await Promise.all([
			Strategy.find({ map: query.map })
				.populate('map', 'name slug thumbnail')
				.populate('bombSiteLocation')
				.lean(),
			User.findById(req.payload.id).select('favorites').lean(),
		]);

		const favoriteIds = new Set((user?.favorites || []).map((id) => String(id)));

		const agentIds = [
			...new Set(
				strategies.flatMap((s) => (s.infosStrategy.agents || []).map((a) => a.id_agent))
			),
		];

		const agentsData = await Agent.find({ _id: { $in: agentIds } }).select('name iconAgent').lean();
		const agentsMap = new Map(agentsData.map((a) => [String(a._id), a]));

		let selectedAgents = req.query['agents[]'] ?? [];
		if (typeof selectedAgents == 'string') {
			selectedAgents = [selectedAgents];
		}

		const shaped = strategies
			.map((strategy) => ({
				id: String(strategy._id),
				title: strategy.title,
				map_slug: strategy.map?.slug,
				map_name: strategy.map?.name,
				map_thumbnail: strategy.map?.thumbnail,
				bombsite_name: strategy.bombSiteLocation?.zoneName, // 👈 corrigé
				bombsite_id: strategy.bombSiteLocation?._id,
				is_favorite_for_me: favoriteIds.has(String(strategy._id)),
				agents: (strategy.infosStrategy.agents || [])
					.map((a) => agentsMap.get(String(a.id_agent)))
					.filter(Boolean)
					.map((agent) => ({ id: String(agent._id), name: agent.name, icon: agent.iconAgent })),
			}))
			.filter((strategy) => !query?.search || strategy.title.toLowerCase().includes(query?.search.toLowerCase()))
			.filter((strategy) => !query?.site || String(strategy.bombsite_id) === query?.site)
			.filter((strategy) => !selectedAgents.length || strategy.agents.some((a) =>
				true
			))
			.filter((strategy) => {
				if(!selectedAgents.length) return true;

				const strategyAgentIds = strategy.agents.map((a) => a.id);

				return selectedAgents.every((id_agent) =>
					strategyAgentIds.includes(id_agent)
				)
			})
			.filter((strategy) => query?.favorites !== '1' || strategy.is_favorite_for_me);

		res.status(200).json(shaped);
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

router.put('/strategies/:id', verifyToken, async (req, res, next) => {
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

router.patch('/favorites/:strategyId', verifyToken, async (req, res, next) => {
	try {
		const userId = req.payload.id; // récupéré depuis le token, comme pour changePassword
		const { strategyId } = req.params;

		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ message: 'Utilisateur introuvable' });
		}

		const alreadyFavorite = user.favorites.some((id) => id.toString() === strategyId);

		if (alreadyFavorite) {
			user.favorites = user.favorites.filter((id) => id.toString() !== strategyId);
		} else {
			user.favorites.push(strategyId);
		}

		await user.save();

		res.status(200).json({ isFavorite: !alreadyFavorite });
	} catch (err) {
		next(err);
	}
});

module.exports = router;
