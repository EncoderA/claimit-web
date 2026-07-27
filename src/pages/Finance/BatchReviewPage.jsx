import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBatchReviewReports, createPayoutBatch } from '../../services/financeService';
import './BatchReviewPage.css';

const DEPARTMENTS = ['ALL', 'Engineering', 'Sales', 'HR', 'Marketing'];

const BatchReviewPage = () => {
  const navigate = useNavigate();

  // Filters state
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('ALL');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [maxRisk, setMaxRisk] = useState('');

  // Data & UI states
  const [reports, setReports] = useState([]);
  const [allQueue, setAllQueue] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selection Set (stores IDs of selected reports across filter changes)
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Fetch reports on mount & filter change
  const fetchReports = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getBatchReviewReports({
        search,
        dept,
        minAmount: minAmount !== '' ? Number(minAmount) : null,
        maxAmount: maxAmount !== '' ? Number(maxAmount) : null,
        maxRisk: maxRisk !== '' ? Number(maxRisk) : null,
      });
      setReports(data);

      // Also get complete queue for calculating totals of hidden items
      const full = await getBatchReviewReports();
      setAllQueue(full);
    } catch (err) {
      console.error('Failed to load batch review reports:', err);
      setError('Failed to load reports. Please try refreshing.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, dept, minAmount, maxAmount, maxRisk]);

  // Compute selected metrics
  const selectedReportsList = useMemo(() => {
    return allQueue.filter((r) => selectedIds.has(r.id));
  }, [allQueue, selectedIds]);

  const selectedTotalSum = useMemo(() => {
    return selectedReportsList.reduce((sum, r) => sum + r.amount, 0);
  }, [selectedReportsList]);

  // Count how many selected items are hidden by active filters
  const visibleSelectedCount = useMemo(() => {
    return reports.filter((r) => selectedIds.has(r.id)).length;
  }, [reports, selectedIds]);

  const hiddenSelectedCount = selectedIds.size - visibleSelectedCount;

  // Toggle single item selection
  const toggleSelectOne = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Toggle select all visible
  const isAllVisibleSelected = reports.length > 0 && reports.every((r) => selectedIds.has(r.id));

  const toggleSelectAllVisible = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (isAllVisibleSelected) {
        reports.forEach((r) => next.delete(r.id));
      } else {
        reports.forEach((r) => next.add(r.id));
      }
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const clearFilters = () => {
    setSearch('');
    setDept('ALL');
    setMinAmount('');
    setMaxAmount('');
    setMaxRisk('');
  };

  // Handle Payout Batch Creation
  const handleCreateBatch = async () => {
    if (selectedIds.size === 0) return;

    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      const reportIdsArray = Array.from(selectedIds);
      const newBatch = await createPayoutBatch(reportIdsArray);
      
      setSuccessMessage(
        `Batch ${newBatch.batchId} created successfully! Contains ${newBatch.reportsCount} reports totaling ₹${newBatch.totalAmount.toLocaleString('en-IN')}.`
      );
      setSelectedIds(new Set());
      await fetchReports();
    } catch (err) {
      console.error('Failed to create payout batch:', err);
      setError(err.message || 'Failed to create payout batch. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRiskClass = (score) => {
    if (score > 70) return 'risk-badge risk-high';
    if (score >= 30) return 'risk-badge risk-med';
    return 'risk-badge risk-low';
  };

  return (
    <div className="batch-review-container">
      {/* Top Page Header */}
      <div className="batch-header-section">
        <div>
          <h1 className="batch-page-title">Batch Review</h1>
          <p className="batch-page-subtitle">
            Manager-approved reports ready for finance sign-off
          </p>
        </div>
        <button
          className="nav-to-batches-btn"
          onClick={() => navigate('/finance/payout-batches')}
        >
          View Payout Batches →
        </button>
      </div>

      {/* Error & Success Feedback Banners */}
      {error && (
        <div className="batch-alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="batch-alert alert-success">
          <span>{successMessage}</span>
          <button className="view-link-btn" onClick={() => navigate('/finance/payout-batches')}>
            View Batches
          </button>
        </div>
      )}

      {/* Filter Toolbar Section */}
      <div className="filter-bar-card">
        <div className="filter-inputs-grid">
          {/* Search Box */}
          <div className="filter-group">
            <label className="filter-label" htmlFor="filter-search-input">Search</label>
            <input
              id="filter-search-input"
              type="text"
              className="filter-input"
              placeholder="Title, employee, #ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Department Dropdown */}
          <div className="filter-group">
            <label className="filter-label" htmlFor="filter-dept-select">Department</label>
            <select
              id="filter-dept-select"
              className="filter-select"
              value={dept}
              onChange={(e) => setDept(e.target.value)}
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d === 'ALL' ? 'All Departments' : d}
                </option>
              ))}
            </select>
          </div>

          {/* Min Amount */}
          <div className="filter-group">
            <label className="filter-label" htmlFor="filter-min-amount">Min Amount (₹)</label>
            <input
              id="filter-min-amount"
              type="number"
              className="filter-input"
              placeholder="0"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
            />
          </div>

          {/* Max Amount */}
          <div className="filter-group">
            <label className="filter-label" htmlFor="filter-max-amount">Max Amount (₹)</label>
            <input
              id="filter-max-amount"
              type="number"
              className="filter-input"
              placeholder="No limit"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
            />
          </div>

          {/* Max Risk */}
          <div className="filter-group">
            <label className="filter-label" htmlFor="filter-max-risk">Max Risk Score</label>
            <input
              id="filter-max-risk"
              type="number"
              className="filter-input"
              placeholder="100"
              value={maxRisk}
              onChange={(e) => setMaxRisk(e.target.value)}
            />
          </div>
        </div>

        {(search || dept !== 'ALL' || minAmount || maxAmount || maxRisk) && (
          <div className="filter-actions-row">
            <button className="clear-filters-btn" onClick={clearFilters}>
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Main Queue Data Table */}
      <div className="table-card-container">
        {isLoading ? (
          <div className="table-loading-state">
            <div className="spinner"></div>
            <span>Loading review queue...</span>
          </div>
        ) : reports.length === 0 ? (
          <div className="table-empty-state">
            <div className="empty-icon">📁</div>
            <h3>
              {search || dept !== 'ALL' || minAmount || maxAmount || maxRisk
                ? 'No reports match your filters'
                : 'All reports have been reviewed'}
            </h3>
            <p>
              {search || dept !== 'ALL' || minAmount || maxAmount || maxRisk
                ? 'Try adjusting your search criteria or reset filters above.'
                : 'There are currently no manager-approved reports pending batch payout.'}
            </p>
            {(search || dept !== 'ALL' || minAmount || maxAmount || maxRisk) && (
              <button className="clear-filters-btn mt-2" onClick={clearFilters}>
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <table className="review-queue-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input
                    type="checkbox"
                    checked={isAllVisibleSelected}
                    onChange={toggleSelectAllVisible}
                    title="Select / Deselect all visible"
                  />
                </th>
                <th>ID</th>
                <th>REPORT</th>
                <th>DEPT</th>
                <th>AMOUNT</th>
                <th>RISK</th>
                <th>APPROVED BY</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((item) => {
                const isSelected = selectedIds.has(item.id);
                return (
                  <tr key={item.id} className={isSelected ? 'row-selected' : ''}>
                    <td>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(item.id)}
                      />
                    </td>
                    <td className="col-id">{item.id}</td>
                    <td className="col-report">
                      <div className="report-title">{item.reportTitle}</div>
                      <div className="report-meta">Approved {item.approvedDate}</div>
                    </td>
                    <td>
                      <span className="dept-badge">{item.dept}</span>
                    </td>
                    <td className="col-amount">
                      ₹{item.amount.toLocaleString('en-IN')}
                    </td>
                    <td>
                      <span className={getRiskClass(item.riskScore)}>
                        {item.riskScore}
                      </span>
                    </td>
                    <td className="col-approver">{item.approvedBy}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Sticky Selection Summary Action Bar */}
      {selectedIds.size > 0 && (
        <div className="sticky-selection-bar">
          <div className="selection-info">
            <span className="selection-count">
              <strong>{selectedIds.size}</strong> report{selectedIds.size > 1 ? 's' : ''} selected
            </span>
            <span className="selection-total">
              Total: <strong>₹{selectedTotalSum.toLocaleString('en-IN')}</strong>
            </span>
            {hiddenSelectedCount > 0 && (
              <span className="selection-hidden-note">
                ({hiddenSelectedCount} not shown by current filters)
              </span>
            )}
          </div>

          <div className="selection-actions">
            <button className="clear-selection-btn" onClick={clearSelection}>
              Clear selection
            </button>
            <button
              className="create-batch-btn"
              onClick={handleCreateBatch}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Batch...' : 'Create Payout Batch'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchReviewPage;
export { BatchReviewPage };
