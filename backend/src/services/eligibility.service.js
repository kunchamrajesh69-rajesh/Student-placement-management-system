/**
 * Placement Eligibility Evaluation Service
 * Evaluates whether a student meets all criteria for a specific job drive.
 * Provides granular, human-readable explanations for eligibility status.
 */

class EligibilityService {
  /**
   * Evaluate eligibility of a student against a job drive's criteria
   * @param {Object} student - Student document with department, cgpa, backlogs, batch, skills
   * @param {Object} jobDrive - JobDrive document with eligibilityCriteria
   * @returns {Object} - { isEligible: boolean, reasons: string[], breakdown: object }
   */
  static evaluate(student, jobDrive) {
    if (!student || !jobDrive) {
      return {
        isEligible: false,
        reasons: ['Invalid student or drive record supplied for evaluation'],
        breakdown: {}
      };
    }

    const criteria = jobDrive.eligibilityCriteria || {};
    const reasons = [];
    const breakdown = {
      cgpa: { passed: true, studentValue: student.cgpa, required: criteria.minCgpa || 0 },
      activeBacklogs: { passed: true, studentValue: student.activeBacklogs || 0, maxAllowed: criteria.maxBacklogs ?? 0 },
      historicalBacklogs: { passed: true, studentValue: student.historicalBacklogs || 0, allowed: criteria.allowHistoricalBacklogs ?? true },
      department: { passed: true, studentDept: student.department?._id || student.department, eligibleDepts: criteria.eligibleDepartments || [] },
      batch: { passed: true, studentBatch: student.batch, eligibleBatches: criteria.eligibleBatches || [] },
      skills: { passed: true, missingSkills: [] }
    };

    // 1. CGPA Check
    const minCgpa = criteria.minCgpa !== undefined ? criteria.minCgpa : 0;
    if (student.cgpa < minCgpa) {
      breakdown.cgpa.passed = false;
      reasons.push(`CGPA (${student.cgpa.toFixed(2)}) is below the required cutoff of ${minCgpa.toFixed(2)}`);
    }

    // 2. Active Backlogs Check
    const maxBacklogs = criteria.maxBacklogs !== undefined ? criteria.maxBacklogs : 0;
    if (student.activeBacklogs > maxBacklogs) {
      breakdown.activeBacklogs.passed = false;
      reasons.push(`Active backlogs (${student.activeBacklogs}) exceed maximum allowed (${maxBacklogs})`);
    }

    // 3. Historical Backlogs Check (if drive strictly disallows any past backlogs)
    if (criteria.allowHistoricalBacklogs === false && student.historicalBacklogs > 0) {
      breakdown.historicalBacklogs.passed = false;
      reasons.push(`Drive strictly requires 0 historical backlogs (Student has had ${student.historicalBacklogs})`);
    }

    // 4. Department Check
    if (criteria.eligibleDepartments && criteria.eligibleDepartments.length > 0) {
      const studentDeptId = student.department?._id ? student.department._id.toString() : student.department?.toString();
      const eligibleDeptIds = criteria.eligibleDepartments.map((dept) => (dept._id ? dept._id.toString() : dept.toString()));

      if (!studentDeptId || !eligibleDeptIds.includes(studentDeptId)) {
        breakdown.department.passed = false;
        reasons.push('Your academic department is not included in the eligible departments list for this drive');
      }
    }

    // 5. Graduation Batch Check
    if (criteria.eligibleBatches && criteria.eligibleBatches.length > 0) {
      if (!student.batch || !criteria.eligibleBatches.includes(Number(student.batch))) {
        breakdown.batch.passed = false;
        reasons.push(`Your graduation batch (${student.batch}) is not eligible for this drive (Eligible: ${criteria.eligibleBatches.join(', ')})`);
      }
    }

    // 6. Required Skills Matching (optional criteria check)
    if (criteria.requiredSkills && criteria.requiredSkills.length > 0) {
      const studentSkills = (student.skills || []).map((s) => s.toLowerCase().trim());
      const missing = criteria.requiredSkills.filter(
        (reqSkill) => !studentSkills.includes(reqSkill.toLowerCase().trim())
      );
      if (missing.length > 0) {
        breakdown.skills.passed = false;
        breakdown.skills.missingSkills = missing;
        reasons.push(`Missing essential skills: ${missing.join(', ')}`);
      }
    }

    const isEligible = reasons.length === 0;

    return {
      isEligible,
      reasons,
      breakdown
    };
  }

  /**
   * Filter and classify a list of students into eligible and ineligible
   * @param {Array} students 
   * @param {Object} jobDrive 
   */
  static classifyStudents(students, jobDrive) {
    const eligible = [];
    const ineligible = [];

    students.forEach((student) => {
      const evaluation = EligibilityService.evaluate(student, jobDrive);
      if (evaluation.isEligible) {
        eligible.push({ student, evaluation });
      } else {
        ineligible.push({ student, evaluation });
      }
    });

    return { eligible, ineligible };
  }
}

module.exports = EligibilityService;
