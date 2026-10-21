const mongoose = require('mongoose');

const hrContactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    designation: { type: String, trim: true }
  },
  { _id: false }
);

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      unique: true,
      trim: true,
      index: true
    },
    website: {
      type: String,
      trim: true
    },
    industry: {
      type: String,
      required: [true, 'Industry type is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    address: {
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      country: { type: String, trim: true, default: 'India' }
    },
    hrContacts: [hrContactSchema],
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Blacklisted'],
      default: 'Active',
      index: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Company', companySchema);
