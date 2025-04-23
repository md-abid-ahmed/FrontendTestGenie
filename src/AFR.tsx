import React, { useState, useEffect } from 'react';
import './AFR.css';

interface SingleAccountResponse {
  "Account Number": string;
  "Date": number;
  "Waivers Applied": string[];
  "Waivers Count": number;
  "Waivers not applied": string[];
}

interface MultipleAccountResponse {
  "Account Number": string;
  "Date": number;
  "Waivers Applied": string[];
  "Waivers Count": number;
  "Waivers not applied": string[];
}

interface FeeSummaryResponse {
  "account_number": string;
  "detailed_breakdown": Array<{
    "Applied Mnemonics": string[];
    "Fee Amount": number;
    "Fee Date (CYYMMDD)": number;
    "Service Charge to Pay": number;
    "Waived": boolean;
  }>;
  "end_fee_date": string;
  "start_fee_date": string;
  "total_paid": number;
  "total_saved": number;
}

interface MnemonicUsageResponse {
  "mnemonic": string;
  "usage_count": number;
  "percentage": number;
}

const AFR: React.FC = () => {
  // State variables
  const [queryType, setQueryType] = useState<string>('single');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [accountNumbers, setAccountNumbers] = useState<string>('');
  const [feeDate, setFeeDate] = useState<string>('');
  const [startFeeDate, setStartFeeDate] = useState<string>('');
  const [endFeeDate, setEndFeeDate] = useState<string>('');
  const [singleResponse, setSingleResponse] = useState<SingleAccountResponse | null>(null);
  const [multipleResponse, setMultipleResponse] = useState<MultipleAccountResponse[] | null>(null);
  const [feeSummaryResponse, setFeeSummaryResponse] = useState<FeeSummaryResponse | null>(null);
  const [mnemonicUsage, setMnemonicUsage] = useState<MnemonicUsageResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('search');

  // Fetch most used mnemonics on component mount
  useEffect(() => {
    fetchMostUsedMnemonics();
  }, []);

  const fetchMostUsedMnemonics = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/mnemonic_usage');
      if (!response.ok) throw new Error('Failed to fetch mnemonic usage data');
      const data = await response.json();
      setMnemonicUsage(data);
    } catch (err) {
      console.error('Error fetching mnemonic usage:', err);
      setError('Failed to load mnemonic usage data');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSingleResponse(null);
    setMultipleResponse(null);
    setFeeSummaryResponse(null);

    try {
      switch (queryType) {
        case 'single':
          await fetchSingleAccount();
          break;
        case 'multiple':
          await fetchMultipleAccounts();
          break;
        case 'summary':
          await fetchFeeSummary();
          break;
        default:
          setError('Invalid query type');
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('An error occurred while processing your request');
    } finally {
      setLoading(false);
    }
  };

  const fetchSingleAccount = async () => {
    const response = await fetch('http://127.0.0.1:5000/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        account_number: accountNumber,
        fee_date: parseInt(feeDate),
      }),
    });

    if (!response.ok) throw new Error('Failed to fetch single account data');
    const data = await response.json();
    setSingleResponse(data);
  };

  const fetchMultipleAccounts = async () => {
    const accountArray = accountNumbers.split(',').map(acc => acc.trim());
    
    const response = await fetch('http://127.0.0.1:5000/post_search_multiple', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        account_numbers: accountArray,
        fee_date: parseInt(feeDate),
      }),
    });

    if (!response.ok) throw new Error('Failed to fetch multiple account data');
    const data = await response.json();
    setMultipleResponse(data);
  };

  const fetchFeeSummary = async () => {
    const response = await fetch('http://127.0.0.1:5000/fee_summary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        account_number: accountNumber,
        start_fee_date: parseInt(startFeeDate),
        end_fee_date: parseInt(endFeeDate),
      }),
    });

    if (!response.ok) throw new Error('Failed to fetch fee summary data');
    const data = await response.json();
    setFeeSummaryResponse(data);
  };

  const renderSingleResponse = () => {
    if (!singleResponse) return null;

    return (
      <div className="response-container">
        <h3>Account Waiver Information</h3>
        <div className="response-card">
          <div className="response-header">
            <div className="response-title">Account: {singleResponse["Account Number"]}</div>
            <div className="response-subtitle">Date: {singleResponse["Date"]}</div>
          </div>
          <div className="response-body">
            <div className="waiver-section">
              <h4>Waivers Applied ({singleResponse["Waivers Count"]})</h4>
              <ul className="waiver-list">
                {singleResponse["Waivers Applied"].map((waiver, index) => (
                  <li key={`applied-${index}`} className="waiver-item applied">
                    <span className="waiver-icon">✓</span>
                    <span className="waiver-text">{waiver}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="waiver-section">
              <h4>Waivers Not Applied</h4>
              <ul className="waiver-list">
                {singleResponse["Waivers not applied"].map((waiver, index) => (
                  <li key={`not-applied-${index}`} className="waiver-item not-applied">
                    <span className="waiver-icon">✗</span>
                    <span className="waiver-text">{waiver}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="waiver-summary">
              <div className="waiver-status">
                <span className={`status-indicator ${singleResponse["Waivers Count"] > 0 ? 'status-applied' : 'status-not-applied'}`}></span>
                <span className="status-text">
                  {singleResponse["Waivers Count"] > 0 ? 'Waiver Applied' : 'No Waivers Applied'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMultipleResponse = () => {
    if (!multipleResponse) return null;

    return (
      <div className="response-container">
        <h3>Multiple Accounts Waiver Information</h3>
        {multipleResponse.map((account, accountIndex) => (
          <div key={`account-${accountIndex}`} className="response-card">
            <div className="response-header">
              <div className="response-title">Account: {account["Account Number"]}</div>
              <div className="response-subtitle">Date: {account["Date"]}</div>
            </div>
            <div className="response-body">
              <div className="waiver-section">
                <h4>Waivers Applied ({account["Waivers Count"]})</h4>
                <ul className="waiver-list">
                  {account["Waivers Applied"].map((waiver, index) => (
                    <li key={`applied-${accountIndex}-${index}`} className="waiver-item applied">
                      <span className="waiver-icon">✓</span>
                      <span className="waiver-text">{waiver}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="waiver-section">
                <h4>Waivers Not Applied</h4>
                <ul className="waiver-list">
                  {account["Waivers not applied"].map((waiver, index) => (
                    <li key={`not-applied-${accountIndex}-${index}`} className="waiver-item not-applied">
                      <span className="waiver-icon">✗</span>
                      <span className="waiver-text">{waiver}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="waiver-summary">
                <div className="waiver-status">
                  <span className={`status-indicator ${account["Waivers Count"] > 0 ? 'status-applied' : 'status-not-applied'}`}></span>
                  <span className="status-text">
                    {account["Waivers Count"] > 0 ? 'Waiver Applied' : 'No Waivers Applied'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderFeeSummary = () => {
    if (!feeSummaryResponse) return null;

    return (
      <div className="response-container">
        <h3>Fee Summary</h3>
        <div className="summary-card">
          <div className="summary-header">
            <div className="summary-title">Account: {feeSummaryResponse.account_number}</div>
            <div className="summary-dates">
              <span>Period: {feeSummaryResponse.start_fee_date} - {feeSummaryResponse.end_fee_date}</span>
            </div>
          </div>
          
          <div className="summary-totals">
            <div className="total-item">
              <span className="total-label">Total Paid:</span>
              <span className="total-value">${feeSummaryResponse.total_paid.toFixed(2)}</span>
            </div>
            <div className="total-item saved">
              <span className="total-label">Total Saved:</span>
              <span className="total-value">${feeSummaryResponse.total_saved.toFixed(2)}</span>
            </div>
          </div>
          
          <h4>Detailed Breakdown</h4>
          <div className="detailed-breakdown">
            {feeSummaryResponse.detailed_breakdown.map((item, index) => (
              <div key={`breakdown-${index}`} className="breakdown-item">
                <div className="breakdown-header">
                  <span className="breakdown-date">Date: {item["Fee Date (CYYMMDD)"]}</span>
                  <span className={`breakdown-status ${item.Waived ? 'waived' : 'not-waived'}`}>
                    {item.Waived ? 'Waived' : 'Not Waived'}
                  </span>
                </div>
                
                <div className="breakdown-details">
                  <div className="breakdown-fee">
                    <span className="breakdown-label">Fee Amount:</span>
                    <span className="breakdown-value">${item["Fee Amount"].toFixed(2)}</span>
                  </div>
                  <div className="breakdown-charge">
                    <span className="breakdown-label">Service Charge:</span>
                    <span className="breakdown-value">${item["Service Charge to Pay"].toFixed(2)}</span>
                  </div>
                </div>
                
                {item["Applied Mnemonics"].length > 0 && (
                  <div className="applied-mnemonics">
                    <span className="mnemonics-label">Applied Mnemonics:</span>
                    <ul className="mnemonics-list">
                      {item["Applied Mnemonics"].map((mnemonic, mIndex) => (
                        <li key={`mnemonic-${index}-${mIndex}`} className="mnemonic-item">{mnemonic}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderMnemonicUsage = () => {
    return (
      <div className="mnemonic-usage-container">
        <h3>Most Used Mnemonics</h3>
        <div className="mnemonic-chart">
          {mnemonicUsage.map((item, index) => (
            <div key={`mnemonic-usage-${index}`} className="mnemonic-usage-item">
              <div className="mnemonic-usage-bar-container">
                <div 
                  className="mnemonic-usage-bar" 
                  style={{ width: `${item.percentage}%` }}
                ></div>
                <span className="mnemonic-usage-label">{item.mnemonic}</span>
                <span className="mnemonic-usage-count">{item.usage_count}</span>
              </div>
              <div className="mnemonic-usage-percentage">{item.percentage.toFixed(1)}%</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderForm = () => {
    return (
      <form onSubmit={handleSubmit} className="search-form">
        <div className="form-group">
          <label htmlFor="queryType">Query Type</label>
          <select
            id="queryType"
            value={queryType}
            onChange={(e) => setQueryType(e.target.value)}
            className="form-control"
          >
            <option value="single">Single Account</option>
            <option value="multiple">Multiple Accounts</option>
            <option value="summary">Fee Summary</option>
          </select>
        </div>

        {queryType === 'single' && (
          <>
            <div className="form-group">
              <label htmlFor="accountNumber">Account Number</label>
              <input
                type="text"
                id="accountNumber"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="form-control"
                placeholder="Enter account number"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="feeDate">Fee Date (CYYMMDD)</label>
              <input
                type="text"
                id="feeDate"
                value={feeDate}
                onChange={(e) => setFeeDate(e.target.value)}
                className="form-control"
                placeholder="Enter fee date in CYYMMDD format"
                required
              />
            </div>
          </>
        )}

        {queryType === 'multiple' && (
          <>
            <div className="form-group">
              <label htmlFor="accountNumbers">Account Numbers (comma separated)</label>
              <input
                type="text"
                id="accountNumbers"
                value={accountNumbers}
                onChange={(e) => setAccountNumbers(e.target.value)}
                className="form-control"
                placeholder="Enter account numbers separated by commas"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="feeDate">Fee Date (CYYMMDD)</label>
              <input
                type="text"
                id="feeDate"
                value={feeDate}
                onChange={(e) => setFeeDate(e.target.value)}
                className="form-control"
                placeholder="Enter fee date in CYYMMDD format"
                required
              />
            </div>
          </>
        )}

        {queryType === 'summary' && (
          <>
            <div className="form-group">
              <label htmlFor="accountNumber">Account Number</label>
              <input
                type="text"
                id="accountNumber"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="form-control"
                placeholder="Enter account number"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="startFeeDate">Start Date (CYYMMDD)</label>
              <input
                type="text"
                id="startFeeDate"
                value={startFeeDate}
                onChange={(e) => setStartFeeDate(e.target.value)}
                className="form-control"
                placeholder="Enter start date in CYYMMDD format"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="endFeeDate">End Date (CYYMMDD)</label>
              <input
                type="text"
                id="endFeeDate"
                value={endFeeDate}
                onChange={(e) => setEndFeeDate(e.target.value)}
                className="form-control"
                placeholder="Enter end date in CYYMMDD format"
                required
              />
            </div>
          </>
        )}

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Processing...' : 'Search'}
        </button>
      </form>
    );
  };

  return (
    <div className="afr-container">
      <header className="afr-header">
        <div className="logo-container">
          <div className="logo">
            <div className="stagecoach"></div>
            <span className="logo-text">Wells Fargo</span>
          </div>
          <h1>Account Fee Review</h1>
        </div>
        <div className="tabs">
          <button 
            className={`tab-btn ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            Fee Search
          </button>
          <button 
            className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            Mnemonic Analytics
          </button>
        </div>
      </header>

      <main className="afr-main">
        {activeTab === 'search' ? (
          <div className="search-container">
            <div className="panel search-panel">
              <h2>Fee Waiver Lookup</h2>
              {renderForm()}
              {error && <div className="error-message">{error}</div>}
            </div>
            
            <div className="panel results-panel">
              <h2>Results</h2>
              {loading ? (
                <div className="loading">
                  <div className="spinner"></div>
                  <p>Processing your request...</p>
                </div>
              ) : (
                <>
                  {queryType === 'single' && renderSingleResponse()}
                  {queryType === 'multiple' && renderMultipleResponse()}
                  {queryType === 'summary' && renderFeeSummary()}
                  {!singleResponse && !multipleResponse && !feeSummaryResponse && !loading && (
                    <div className="no-results">
                      <p>Enter search criteria and click Search to see results.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="analytics-container">
            <div className="panel full-width">
              {renderMnemonicUsage()}
            </div>
          </div>
        )}
      </main>

      <footer className="afr-footer">
        <p>© 2025 Wells Fargo. All rights reserved.</p>
        <p>Account Fee Review System v1.0</p>
      </footer>
    </div>
  );
};

export default AFR;