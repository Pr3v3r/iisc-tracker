const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      enum: ['DELETION', 'POSTPONE'],
      required: true,
    },
    collegeName: {
      type: String,
      required: true,
    },
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      default: null,
    },
    performedBy: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    metadata: {
      field: String,       // 'followUpDate' or 'visitDate'
      oldDate: Date,
      newDate: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);