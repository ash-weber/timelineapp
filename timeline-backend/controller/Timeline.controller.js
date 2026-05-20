const prisma = require('../config/db');


exports.saveTimelineData = async (req, res) => {
  try {
    const { name, events } = req.body;
    const clientMac = req.headers['x-device-mac'];

    if (!clientMac) {
      return res.status(400).json({ success: false, error: "Device Identification (MAC Header) Missing" });
    }

    if (!name || !events || events.length === 0) {
      return res.status(400).json({ success: false, error: "Missing Name or Events Data" });
    }

    const newDataset = await prisma.timelineDataset.create({
      data: {
        name: name,
        macAddress: clientMac,
        events: {
          create: events.map(event => ({
            title: event.name || event.title,
            date: new Date(event.date),
            description: event.description || ''
          }))
        }
      },
      include: { events: true }
    });

    res.status(201).json({ success: true, dataset: newDataset });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


exports.getUniqueNames = async (req, res) => {
  try {
    const clientMac = req.headers['x-device-mac'];

    if (!clientMac || clientMac === 'undefined' || clientMac === 'null') {
      return res.status(200).json({ success: true, datasets: [] });
    }

    const datasets = await prisma.timelineDataset.findMany({
      where: {
        macAddress: clientMac
      },
      select: { id: true, name: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, datasets });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


exports.getTimelineDataByName = async (req, res) => {
  try {
    const { name } = req.params;
    const clientMac = req.headers['x-device-mac'];

    if (!clientMac) {
      return res.status(400).json({ success: false, error: "Device Identification Missing" });
    }

    const dataset = await prisma.timelineDataset.findFirst({
      where: { 
        name: decodeURIComponent(name),
        macAddress: clientMac
      },
      include: {
        events: { orderBy: { date: 'asc' } }
      }
    });

    if (!dataset) {
      return res.status(404).json({ success: false, error: "Timeline not found or unauthorized access" });
    }

    res.status(200).json({
      success: true,
      data: dataset.events,
      timelineName: dataset.name
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


exports.getTimelineDataById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const clientMac = req.headers['x-device-mac'];

    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: "Invalid ID format" });
    }
    if (!clientMac) {
      return res.status(400).json({ success: false, error: "Device Identification Missing" });
    }

    const dataset = await prisma.timelineDataset.findUnique({
      where: { id }
    });

    if (!dataset || dataset.macAddress !== clientMac) {
      return res.status(404).json({ success: false, error: "Timeline not found or unauthorized access" });
    }

    const fullDataset = await prisma.timelineDataset.findUnique({
      where: { id },
      include: { events: { orderBy: { date: 'asc' } } }
    });

    res.status(200).json({ success: true, dataset: fullDataset });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


exports.updateTimeline = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, events } = req.body;
    const clientMac = req.headers['x-device-mac'];

    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: "Invalid ID format" });
    }
    if (!clientMac) {
      return res.status(400).json({ success: false, error: "Device Identification Missing" });
    }

    const existing = await prisma.timelineDataset.findUnique({ where: { id } });
    if (!existing || existing.macAddress !== clientMac) {
      return res.status(404).json({ success: false, error: "Timeline not found or unauthorized access" });
    }

    
    await prisma.$transaction(async (tx) => {
      await tx.timelineDataset.update({
        where: { id },
        data: { name: name || existing.name }
      });

      if (events && events.length > 0) {
        const operations = events.map((event) => {
          const parsedId = parseInt(event.id, 10);

          if (event.id && !isNaN(parsedId)) {
            return tx.timelineData.update({
              where: { id: parsedId },
              data: {
                title: event.title || event.name || '',
                date: event.date ? new Date(event.date) : new Date(),
                description: event.description || ''
              }
            });
          } 
          
          else {
            return tx.timelineData.create({
              data: {
                timelineDatasetId: id,
                title: event.title || event.name || 'Untitled Event',
                date: event.date ? new Date(event.date) : new Date(),
                description: event.description || ''
              }
            });
          }
        });

        await Promise.all(operations);
      }
    }, { timeout: 30000 }); 
    const updated = await prisma.timelineDataset.findUnique({
      where: { id },
      include: { events: { orderBy: { date: 'asc' } } }
    });

    res.status(200).json({ success: true, dataset: updated });
  } catch (error) {
    console.error("Prisma Transaction Failed:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};


exports.deleteTimeline = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const clientMac = req.headers['x-device-mac'];

    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: "Invalid ID format" });
    }
    if (!clientMac) {
      return res.status(400).json({ success: false, error: "Device Identification Missing" });
    }

    const existing = await prisma.timelineDataset.findUnique({ where: { id } });
    if (!existing || existing.macAddress !== clientMac) {
      return res.status(404).json({ success: false, error: "Timeline not found or unauthorized access" });
    }

    await prisma.timelineDataset.delete({
      where: { id }
    });

    res.status(200).json({ success: true, message: "Timeline and linked records deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};