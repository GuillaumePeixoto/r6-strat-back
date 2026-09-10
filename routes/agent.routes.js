const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const { verifyToken } = require('./../middlewares/auth.middleware.js');
const Agent = require('./../models/agent.model.js');
require('./../models/agentObject.model.js');

router.get('/agents', verifyToken, async (req, res, next) => {
	try {
		const agents = await Agent.find()
			.populate('utilities')
			.populate('agentObject')
			.sort({ name: 1 });
		res.status(200).json(agents);
	} catch (err) {
		next(err);
	}
});

module.exports = router;

