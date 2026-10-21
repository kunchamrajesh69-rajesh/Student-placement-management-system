const EligibilityService = require('../services/eligibility.service');

describe('EligibilityService Unit Tests', () => {
  const dummyDrive = {
    _id: '660000000000000000000001',
    title: 'Senior Software Engineer',
    eligibilityCriteria: {
      minCgpa: 7.5,
      maxBacklogs: 0,
      allowHistoricalBacklogs: true,
      eligibleDepartments: ['660000000000000000000010', '660000000000000000000011'],
      eligibleBatches: [2025]
    }
  };

  test('should approve fully eligible student', () => {
    const student = {
      fullName: 'John Doe',
      department: '660000000000000000000010',
      batch: 2025,
      cgpa: 8.5,
      activeBacklogs: 0,
      historicalBacklogs: 0
    };

    const result = EligibilityService.evaluate(student, dummyDrive);
    expect(result.isEligible).toBe(true);
    expect(result.reasons.length).toBe(0);
    expect(result.breakdown.cgpa.passed).toBe(true);
    expect(result.breakdown.activeBacklogs.passed).toBe(true);
    expect(result.breakdown.department.passed).toBe(true);
    expect(result.breakdown.batch.passed).toBe(true);
  });

  test('should reject student when CGPA is below cutoff', () => {
    const student = {
      fullName: 'Low CGPA Student',
      department: '660000000000000000000010',
      batch: 2025,
      cgpa: 6.8,
      activeBacklogs: 0
    };

    const result = EligibilityService.evaluate(student, dummyDrive);
    expect(result.isEligible).toBe(false);
    expect(result.breakdown.cgpa.passed).toBe(false);
    expect(result.reasons[0]).toContain('below the required cutoff');
  });

  test('should reject student with active backlogs when max allowed is 0', () => {
    const student = {
      fullName: 'Backlog Student',
      department: '660000000000000000000010',
      batch: 2025,
      cgpa: 8.0,
      activeBacklogs: 2
    };

    const result = EligibilityService.evaluate(student, dummyDrive);
    expect(result.isEligible).toBe(false);
    expect(result.breakdown.activeBacklogs.passed).toBe(false);
    expect(result.reasons[0]).toContain('Active backlogs (2) exceed maximum allowed');
  });

  test('should reject student from an ineligible department', () => {
    const student = {
      fullName: 'Civil Student',
      department: '660000000000000000000099', // Not in 10 or 11
      batch: 2025,
      cgpa: 8.5,
      activeBacklogs: 0
    };

    const result = EligibilityService.evaluate(student, dummyDrive);
    expect(result.isEligible).toBe(false);
    expect(result.breakdown.department.passed).toBe(false);
    expect(result.reasons[0]).toContain('department is not included');
  });

  test('should correctly classify an array of students into eligible and ineligible', () => {
    const students = [
      { fullName: 'S1', department: '660000000000000000000010', batch: 2025, cgpa: 8.5, activeBacklogs: 0 },
      { fullName: 'S2', department: '660000000000000000000010', batch: 2025, cgpa: 5.5, activeBacklogs: 0 },
      { fullName: 'S3', department: '660000000000000000000011', batch: 2025, cgpa: 7.9, activeBacklogs: 1 }
    ];

    const { eligible, ineligible } = EligibilityService.classifyStudents(students, dummyDrive);
    expect(eligible.length).toBe(1);
    expect(eligible[0].student.fullName).toBe('S1');
    expect(ineligible.length).toBe(2);
  });
});
