const mongoose = require('mongoose');

/**
 * Generic audit trail. `action` is a short machine-readable code
 * (see src/constants/activityActions.js), `metadata` holds
 * non-sensitive contextual details. NEVER store secrets/passwords here.
 */
const activityLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    targetType: {
      // e.g. 'Job', 'Application', 'User'
      type: String,
      default: null,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

activityLogSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
