/**
 * Finance Service — Mock Data & Service API Abstraction.
 * All functions return Promises to simulate network latency and test UI loading states.
 */

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let nextBatchNumber = 45;

let initialReportsQueue = [
  {
    id: 'EXP-1182',
    reportTitle: 'Team offsite supplies',
    dept: 'Engineering',
    amount: 3200,
    riskScore: 12,
    approvedBy: 'Sunita Kapoor',
    approvedDate: 'Jul 20, 2026',
  },
  {
    id: 'EXP-1175',
    reportTitle: 'Airport cab - quarterly review',
    dept: 'Sales',
    amount: 850,
    riskScore: 6,
    approvedBy: 'Anil Bhatia',
    approvedDate: 'Jul 19, 2026',
  },
  {
    id: 'EXP-1178',
    reportTitle: 'Team lunch - sprint close',
    dept: 'Engineering',
    amount: 2100,
    riskScore: 18,
    approvedBy: 'Sunita Kapoor',
    approvedDate: 'Jul 19, 2026',
  },
  {
    id: 'EXP-1164',
    reportTitle: 'Software subscription annual renewal',
    dept: 'Engineering',
    amount: 14500,
    riskScore: 78,
    approvedBy: 'Priya Sharma',
    approvedDate: 'Jul 18, 2026',
  },
  {
    id: 'EXP-1159',
    reportTitle: 'Client dinner - Q2 review',
    dept: 'Sales',
    amount: 6800,
    riskScore: 45,
    approvedBy: 'Anil Bhatia',
    approvedDate: 'Jul 17, 2026',
  },
  {
    id: 'EXP-1152',
    reportTitle: 'Office stationery & printing',
    dept: 'HR',
    amount: 1250,
    riskScore: 4,
    approvedBy: 'Ramesh V',
    approvedDate: 'Jul 16, 2026',
  },
  {
    id: 'EXP-1148',
    reportTitle: 'Overseas conference flights',
    dept: 'Marketing',
    amount: 38900,
    riskScore: 82,
    approvedBy: 'Sunita Kapoor',
    approvedDate: 'Jul 15, 2026',
  },
  {
    id: 'EXP-1141',
    reportTitle: 'Local taxi fare reimbursement',
    dept: 'Sales',
    amount: 420,
    riskScore: 2,
    approvedBy: 'Anil Bhatia',
    approvedDate: 'Jul 14, 2026',
  },
];

let initialPayoutBatches = [
  {
    batchId: 'PB-0044',
    reportsCount: 7,
    totalAmount: 184200,
    createdDate: 'Jul 20',
    status: 'PAID',
  },
  {
    batchId: 'PB-0043',
    reportsCount: 11,
    totalAmount: 291600,
    createdDate: 'Jul 13',
    status: 'PAID',
  },
  {
    batchId: 'PB-0042',
    reportsCount: 9,
    totalAmount: 152900,
    createdDate: 'Jul 06',
    status: 'PAID',
  },
];

function matchesSearch(report, search) {
  const q = search.toLowerCase().trim();
  return (
    report.id.toLowerCase().includes(q) ||
    report.reportTitle.toLowerCase().includes(q) ||
    report.dept.toLowerCase().includes(q) ||
    report.approvedBy.toLowerCase().includes(q)
  );
}

/**
 * Fetches manager-approved reports matching filter criteria.
 * @param {object} params
 * @param {string} [params.search]
 * @param {string} [params.dept]
 * @param {number} [params.minAmount]
 * @param {number} [params.maxAmount]
 * @param {number} [params.maxRisk]
 * @returns {Promise<Array>}
 */
export async function getBatchReviewReports({ search, dept, minAmount, maxAmount, maxRisk } = {}) {
  await delay(350);
  return initialReportsQueue.filter((r) => {
    if (search && !matchesSearch(r, search)) return false;
    if (dept && dept !== 'ALL' && r.dept.toLowerCase() !== dept.toLowerCase()) return false;
    if (minAmount != null && !isNaN(minAmount) && r.amount < Number(minAmount)) return false;
    if (maxAmount != null && !isNaN(maxAmount) && r.amount > Number(maxAmount)) return false;
    if (maxRisk != null && !isNaN(maxRisk) && r.riskScore > Number(maxRisk)) return false;
    return true;
  });
}

/**
 * Fetches created payout batches list.
 * @returns {Promise<Array>}
 */
export async function getPayoutBatches() {
  await delay(350);
  return [...initialPayoutBatches];
}

/**
 * Creates a payout batch from selected report IDs.
 * @param {Array<string>} reportIds
 * @returns {Promise<object>}
 */
export async function createPayoutBatch(reportIds) {
  await delay(450);
  if (!reportIds || reportIds.length === 0) {
    throw new Error('Please select at least one report to create a payout batch.');
  }

  const selected = initialReportsQueue.filter((r) => reportIds.includes(r.id));
  const newBatchId = `PB-${String(nextBatchNumber++).padStart(4, '0')}`;
  const totalAmount = selected.reduce((sum, r) => sum + r.amount, 0);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const createdDate = `${months[now.getMonth()]} ${String(now.getDate()).padStart(2, '0')}`;

  const newBatch = {
    batchId: newBatchId,
    reportsCount: selected.length,
    totalAmount,
    createdDate,
    status: 'PROCESSING',
    reports: selected,
  };

  initialPayoutBatches.unshift(newBatch);
  initialReportsQueue = initialReportsQueue.filter((r) => !reportIds.includes(r.id));

  return newBatch;
}

/**
 * Generates and exports a CSV Blob for a given batch ID.
 * @param {string} batchId
 * @returns {Promise<Blob>}
 */
export async function exportBatchCSV(batchId) {
  await delay(300);
  const batch = initialPayoutBatches.find((b) => b.batchId === batchId);
  if (!batch) {
    throw new Error(`Batch ${batchId} not found.`);
  }

  let csvContent = `Batch ID,Reports Count,Total Amount (INR),Created Date,Status\n`;
  csvContent += `"${batch.batchId}",${batch.reportsCount},${batch.totalAmount},"${batch.createdDate}","${batch.status}"\n\n`;

  if (batch.reports && batch.reports.length > 0) {
    csvContent += `Report ID,Report Title,Department,Amount (INR),Risk Score,Approved By\n`;
    batch.reports.forEach((r) => {
      csvContent += `"${r.id}","${r.reportTitle.replace(/"/g, '""')}","${r.dept}",${r.amount},${r.riskScore},"${r.approvedBy}"\n`;
    });
  }

  return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
}

/**
 * Triggers browser download for a Blob.
 * @param {Blob} blob
 * @param {string} filename
 */
export function downloadBlobAsFile(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
