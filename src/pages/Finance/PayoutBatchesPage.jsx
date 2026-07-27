import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPayoutBatches, exportBatchCSV, downloadBlobAsFile } from '../../services/financeService';
import './PayoutBatchesPage.css';

const PayoutBatchesPage = () => {
  const navigate = useNavigate();

  const [batches, setBatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [exportingBatchId, setExportingBatchId] = useState(null);

  const fetchBatches = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getPayoutBatches();
      setBatches(data);
    } catch (err) {
      console.error('Failed to load payout batches:', err);
      setError('Failed to load payout batches. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleExportCSV = async (batchId) => {
    setExportingBatchId(batchId);
    try {
      const blob = await exportBatchCSV(batchId);
      downloadBlobAsFile(blob, `${batchId}_export.csv`);
    } catch (err) {
      console.error(`Failed to export batch ${batchId}:`, err);
      alert(`Export failed: ${err.message}`);
    } finally {
      setExportingBatchId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'PAID':
        return <span className="batch-status-badge status-paid">Paid</span>;
      case 'PROCESSING':
        return <span className="batch-status-badge status-processing">Processing</span>;
      default:
        return <span className="batch-status-badge status-pending">{status || 'Pending'}</span>;
    }
  };

  return (
    <div className="payout-batches-container">
      {/* Page Header */}
      <div className="payout-header-section">
        <div>
          <h1 className="payout-page-title">Payout Batches</h1>
          <p className="payout-page-subtitle">
            Created batches ready for bank export
          </p>
        </div>
        <button
          className="nav-to-review-btn"
          onClick={() => navigate('/finance/batch-review')}
        >
          ← Batch Review Queue
        </button>
      </div>

      {error && (
        <div className="payout-alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {/* Main Batches Table Card */}
      <div className="payout-table-card">
        {isLoading ? (
          <div className="payout-loading-state">
            <div className="payout-spinner"></div>
            <span>Loading payout batches...</span>
          </div>
        ) : batches.length === 0 ? (
          <div className="payout-empty-state">
            <div className="empty-icon">📦</div>
            <h3>No payout batches created yet</h3>
            <p>Go to Batch Review queue to select approved reports and generate your first batch.</p>
            <button
              className="create-first-batch-btn"
              onClick={() => navigate('/finance/batch-review')}
            >
              Go to Batch Review
            </button>
          </div>
        ) : (
          <table className="payout-table">
            <thead>
              <tr>
                <th>BATCH ID</th>
                <th>REPORTS</th>
                <th>TOTAL</th>
                <th>CREATED</th>
                <th>STATUS</th>
                <th style={{ textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((batch) => {
                const isExporting = exportingBatchId === batch.batchId;
                return (
                  <tr key={batch.batchId}>
                    <td className="col-batch-id">{batch.batchId}</td>
                    <td className="col-reports-count">
                      {batch.reportsCount} report{batch.reportsCount !== 1 ? 's' : ''}
                    </td>
                    <td className="col-batch-total">
                      ₹{batch.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="col-batch-date">{batch.createdDate}</td>
                    <td>{getStatusBadge(batch.status)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="export-csv-btn"
                        onClick={() => handleExportCSV(batch.batchId)}
                        disabled={isExporting}
                      >
                        {isExporting ? 'Exporting...' : 'Export CSV'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PayoutBatchesPage;
export { PayoutBatchesPage };
