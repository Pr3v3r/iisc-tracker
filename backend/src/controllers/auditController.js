const AuditLog = require('../models/AuditLog');

const getAuditLogs = async (req, res) => {
  try {
    const deletions = await AuditLog.find({ eventType: 'DELETION' })
      .sort({ createdAt: -1 });

    const postpones = await AuditLog.find({ eventType: 'POSTPONE' })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { deletions, postpones } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { getAuditLogs };