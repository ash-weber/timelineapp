const express = require('express');
const router = express.Router();
const timelineController = require('../controller/Timeline.controller'); // Unga controller path-ah verify pannikonga

router.post('/save', timelineController.saveTimelineData);

router.get('/datasets', timelineController.getUniqueNames);

router.get('/get/name/:name', timelineController.getTimelineDataByName);

router.get('/get/id/:id', timelineController.getTimelineDataById);

router.put('/update/:id', timelineController.updateTimeline);

router.delete('/delete/:id', timelineController.deleteTimeline);

module.exports = router;