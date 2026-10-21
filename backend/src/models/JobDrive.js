const mongoose = require('mongoose');

const eligibilityCriteriaSchema = new mongoose.Schema(
  {
    minCgpa: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
      default: 6.0
    },
    maxBacklogs: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    allowHistoricalBacklogs: {
      type: Boolean,
      default: true
    },
    eligibleDepartments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
      }
    ],
    eligibleBatches: [
      {
        type: Number
      }
    ],
    requiredSkills: [
      {
        type: String,
        trim: true
      }
    ]
  },
  { _id: false }
);

const salaryPackageSchema = new mongoose.Schema(
  {
    ctcLpa: {
      type: Number,
      required: [true, 'CTC in LPA is required']
    },
    stipendPerMonth: {
      type: Number,
      default: 0
    },
    breakup: {
      type: String,
      trim: true
    }
  },
  { _id: false }
);

const jobDriveSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company reference is required'],
      index: true
    },
    description: {
      type: String,
      required: [true, 'Job description is required']
    },
    jobType: {
      type: String,
      enum: ['Full-Time', 'Internship', 'Internship+FTE'],
      default: 'Full-Time'
    },
    location: {
      type: String,
      required: [true, 'Job location is required'],
      trim: true
    },
    salaryPackage: {
      type: salaryPackageSchema,
      required: true
    },
    requiredSkills: [
      {
        type: String,
        trim: true
      }
    ],
    eligibilityCriteria: {
      type: eligibilityCriteriaSchema,
      required: true
    },
    selectionProcess: [
      {
        type: String,
        trim: true
      }
    ],
    applicationDeadline: {
      type: Date,
      required: [true, 'Application deadline is required'],
      index: true
    },
    driveDate: {
      type: Date
    },
    status: {
      type: String,
      enum: ['Draft', 'Active', 'Closed', 'Completed'],
      default: 'Active',
      index: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

jobDriveSchema.index({ status: 1, applicationDeadline: 1 });

module.exports = mongoose.model('JobDrive', jobDriveSchema);
