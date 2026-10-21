const mongoose = require('mongoose');

const stageHistorySchema = new mongoose.Schema(
  {
    stage: {
      type: String,
      required: true,
      enum: [
        'Applied',
        'Shortlisted',
        'Assessment',
        'Interview',
        'Selected',
        'Rejected',
        'Offered',
        'Joined'
      ]
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    remarks: {
      type: String,
      trim: true
    }
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
      index: true
    },
    jobDrive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobDrive',
      required: [true, 'Job drive reference is required'],
      index: true
    },
    currentStage: {
      type: String,
      enum: [
        'Applied',
        'Shortlisted',
        'Assessment',
        'Interview',
        'Selected',
        'Rejected',
        'Offered',
        'Joined'
      ],
      default: 'Applied',
      index: true
    },
    stageHistory: [stageHistorySchema],
    studentSnapshot: {
      cgpa: Number,
      activeBacklogs: Number,
      department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
      },
      batch: Number
    },
    isEligibleAtApply: {
      type: Boolean,
      default: true
    },
    appliedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Compound unique index prevents duplicate applications at database layer
applicationSchema.index({ student: 1, jobDrive: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
