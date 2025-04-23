import React, { useState, useEffect } from 'react';
import './AFR.css';

interface WaiverInfo {
  "Account Number": string;
  "Date": number;
  "Waivers Applied": string[];
  "Waivers Count": number;
  "Waivers not applied": string[];
}

interface FeeSummary {
  "account_number": string;
  "detailed_breakdown": {
    "Applied Mnemonics": string[];
    "Fee Amount": number;
    "Fee Date (CYYMMDD)": number;
    "Service Charge to Pay": number;
    "Waived": boolean;
  }[];
  "end_fee_date": string;
  "start_fee_date": string;
  "total_paid": number;
  "total_saved": number;
}

interface PopularMnemonic {
  mnemonic: string;
  count: number;
}

const AFR: React.FC = () => {
  // State variables
  const [searchType, setSearchType] = useState<'single' | 'multiple' | 'summary'>('single');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [accountNumbers, setAccountNumbers] = useState<string>('');
  const [feeDate, setFeeDate] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [waiverInfo, setWaiverInfo] = useState<WaiverInfo | null>(null);
  const [multipleWaiverInfo, setMultipleWaiverInfo] = useState<any[] | null>(null);
  const [feeSummary, setFeeSummary] = useState<FeeSummary | null>(null);
  const [popularMnemonics, setPopularMnemonics] = useState<PopularMnemonic[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch popular mnemonics on component mount
  useEffect(() => {
    fetchPopularMnemonics();
  }, []);

  const fetchPopularMnemonics = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/popular_mnemonics');
      if (!response.ok) {
        throw new Error('Failed to fetch popular mnemonics');
      }
      const data = await response.json();
      setPopularMnemonics(data);
    } catch (err) {
      console.error('Error fetching popular mnemonics:', err);
      setError('Failed to load popular mnemonics. Please try again later.');
    }
  };

  const handleSingleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setWaiverInfo(null);
    
    try {
      const response = await fetch('http://127.0.0.1:5000/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account_number: accountNumber,
          fee_date: parseInt(feeDate)
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch waiver information');
      }

      const data = await response.json();
      setWaiverInfo(data);
    } catch (err) {
      console.error('Error fetching waiver info:', err);
      setError('Failed to fetch waiver information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMultipleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMultipleWaiverInfo(null);
    
    try {
      const accountArray = accountNumbers.split(',').map(acc => acc.trim());
      
      const response = await fetch('http://127.0.0.1:5000/post_search_multiple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account_numbers: accountArray,
          fee_date: parseInt(feeDate)
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch multiple waiver information');
      }

      const data = await response.json();
      setMultipleWaiverInfo(data);
    } catch (err) {
      console.error('Error fetching multiple waiver info:', err);
      setError('Failed to fetch multiple waiver information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFeeSummary = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFeeSummary(null);
    
    try {
      const response = await fetch('http://127.0.0.1:5000/fee_summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account_number: accountNumber,
          start_fee_date: parseInt(startDate),
          end_fee_date: parseInt(endDate)
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch fee summary');
      }

      const data = await response.json();
      setFeeSummary(data);
    } catch (err) {
      console.error('Error fetching fee summary:', err);
      setError('Failed to fetch fee summary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderPopularMnemonics = () => {
    if (popularMnemonics.length === 0) {
      return <div className="no-data">No popular mnemonics data available</div>;
    }

    return (
      <div className="popular-mnemonics">
        <h3>Most Used Mnemonics</h3>
        <div className="mnemonics-list">
          {popularMnemonics.slice(0, 5).map((item, index) => (
            <div key={index} className="mnemonic-item">
              <div className="mnemonic-name">{item.mnemonic}</div>
              <div className="mnemonic-count">{item.count}</div>
              <div className="mnemonic-bar">
                <div 
                  className="mnemonic-fill" 
                  style={{ width: `${Math.min(100, (item.count / Math.max(...popularMnemonics.map(m => m.count))) * 100)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSingleSearchForm = () => (
    <form onSubmit={handleSingleSearch} className="search-form">
      <div className="form-group">
        <label htmlFor="accountNumber">Account Number</label>
        <input
          type="text"
          id="accountNumber"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          required
          placeholder="Enter account number"
        />
      </div>
      <div className="form-group">
        <label htmlFor="feeDate">Fee Date (CYYMMDD)</label>
        <input
          type="text"
          id="feeDate"
          value={feeDate}
          onChange={(e) => setFeeDate(e.target.value)}
          required
          placeholder="Enter fee date (e.g., 1250204)"
        />
      </div>
      <button type="submit" className="btn-search" disabled={loading}>
        {loading ? 'Searching...' : 'Search'}
      </button>
    </form>
  );

  const renderMultipleSearchForm = () => (
    <form onSubmit={handleMultipleSearch} className="search-form">
      <div className="form-group">
        <label htmlFor="accountNumbers">Account Numbers (comma separated)</label>
        <input
          type="text"
          id="accountNumbers"
          value={accountNumbers}
          onChange={(e) => setAccountNumbers(e.target.value)}
          required
          placeholder="Enter account numbers (e.g., 1234,5678)"
        />
      </div>
      <div className="form-group">
        <label htmlFor="multipleDate">Fee Date (CYYMMDD)</label>
        <input
          type="text"
          id="multipleDate"
          value={feeDate}
          onChange={(e) => setFeeDate(e.target.value)}
          required
          placeholder="Enter fee date (e.g., 1250204)"
        />
      </div>
      <button type="submit" className="btn-search" disabled={loading}>
        {loading ? 'Searching...' : 'Search Multiple'}
      </button>
    </form>
  );

  const renderFeeSummaryForm = () => (
    <form onSubmit={handleFeeSummary} className="search-form">
      <div className="form-group">
        <label htmlFor="summaryAccount">Account Number</label>
        <input
          type="text"
          id="summaryAccount"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          required
          placeholder="Enter account number"
        />
      </div>
      <div className="form-group">
        <label htmlFor="startDate">Start Fee Date (CYYMMDD)</label>
        <input
          type="text"
          id="startDate"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
          placeholder="Enter start date (e.g., 1250101)"
        />
      </div>
      <div className="form-group">
        <label htmlFor="endDate">End Fee Date (CYYMMDD)</label>
        <input
          type="text"
          id="endDate"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          required
          placeholder="Enter end date (e.g., 1250401)"
        />
      </div>
      <button type="submit" className="btn-search" disabled={loading}>
        {loading ? 'Generating...' : 'Generate Summary'}
      </button>
    </form>
  );

  const renderSingleWaiverResults = () => {
    if (!waiverInfo) return null;

    return (
      <div className="results-container">
        <div className="results-header">
          <h3>Waiver Information</h3>
          <span className="account-badge">Account: {waiverInfo["Account Number"]}</span>
        </div>
        <div className="results-body">
          <div className="info-card">
            <div className="info-card-header">
              <h4>Waivers Applied ({waiverInfo["Waivers Count"]})</h4>
              <span className={`status-badge ${waiverInfo["Waivers Count"] > 0 ? 'success' : 'neutral'}`}>
                {waiverInfo["Waivers Count"] > 0 ? 'Waiver Active' : 'No Waivers'}
              </span>
            </div>
            <div className="info-card-body">
              {waiverInfo["Waivers Applied"].length > 0 ? (
                <ul className="waiver-list">
                  {waiverInfo["Waivers Applied"].map((waiver, idx) => (
                    <li key={idx} className="waiver-item applied">
                      <span className="waiver-icon">✓</span>
                      <span className="waiver-name">{waiver}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-data">No waivers applied</p>
              )}
            </div>
          </div>
          
          <div className="info-card">
            <div className="info-card-header">
              <h4>Waivers Not Applied</h4>
            </div>
            <div className="info-card-body">
              {waiverInfo["Waivers not applied"].length > 0 ? (
                <ul className="waiver-list">
                  {waiverInfo["Waivers not applied"].map((waiver, idx) => (
                    <li key={idx} className="waiver-item not-applied">
                      <span className="waiver-icon">✕</span>
                      <span className="waiver-name">{waiver}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-data">All waivers applied</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMultipleWaiverResults = () => {
    if (!multipleWaiverInfo) return null;

    return (
      <div className="results-container">
        <div className="results-header">
          <h3>Multiple Accounts Waiver Information</h3>
          <span className="date-badge">Date: {feeDate}</span>
        </div>
        <div className="multiple-results">
          {multipleWaiverInfo.map((account, idx) => (
            <div key={idx} className="account-result">
              <div className="account-header">
                <h4>Account: {account["Account Number"]}</h4>
                <span className={`status-badge ${account["Waivers Count"] > 0 ? 'success' : 'neutral'}`}>
                  {account["Waivers Count"] > 0 ? 'Waiver Active' : 'No Waivers'}
                </span>
              </div>
              
              <div className="account-details">
                <div className="waiver-section">
                  <h5>Applied ({account["Waivers Count"]})</h5>
                  {account["Waivers Applied"].length > 0 ? (
                    <ul className="mini-waiver-list">
                      {account["Waivers Applied"].map((waiver: string, widx: number) => (
                        <li key={widx} className="mini-waiver-item">{waiver}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="no-data-small">None</p>
                  )}
                </div>
                
                <div className="waiver-section">
                  <h5>Not Applied</h5>
                  {account["Waivers not applied"].length > 0 ? (
                    <ul className="mini-waiver-list not-applied-list">
                      {account["Waivers not applied"].slice(0, 3).map((waiver: string, widx: number) => (
                        <li key={widx} className="mini-waiver-item">{waiver}</li>
                      ))}
                      {account["Waivers not applied"].length > 3 && (
                        <li className="mini-waiver-item more-item">+{account["Waivers not applied"].length - 3} more</li>
                      )}
                    </ul>
                  ) : (
                    <p className="no-data-small">All applied</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderFeeSummaryResults = () => {
    if (!feeSummary) return null;

    return (
      <div className="results-container">
        <div className="results-header">
          <h3>Fee Summary</h3>
          <span className="account-badge">Account: {feeSummary.account_number}</span>
        </div>
        
        <div className="summary-stats">
          <div className="stat-card">
            <div className="stat-value">${feeSummary.total_saved.toFixed(2)}</div>
            <div className="stat-label">Total Saved</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">${feeSummary.total_paid.toFixed(2)}</div>
            <div className="stat-label">Total Paid</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{feeSummary.detailed_breakdown.length}</div>
            <div className="stat-label">Fee Transactions</div>
          </div>
        </div>
        
        <div className="timeline-container">
          <div className="timeline-header">
            <h4>Fee Transaction Timeline</h4>
            <div className="date-range">
              <span>{feeSummary.start_fee_date}</span>
              <span className="date-separator">to</span>
              <span>{feeSummary.end_fee_date}</span>
            </div>
          </div>
          
          <div className="timeline">
            {feeSummary.detailed_breakdown.map((item, idx) => (
              <div key={idx} className={`timeline-item ${item.Waived ? 'waived' : 'charged'}`}>
                <div className="timeline-date">
                  {String(item["Fee Date (CYYMMDD)"]).substring(0, 2)}/
                  {String(item["Fee Date (CYYMMDD)"]).substring(2, 4)}/
                  {String(item["Fee Date (CYYMMDD)"]).substring(4)}
                </div>
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <div className="timeline-amount">
                    ${item["Fee Amount"].toFixed(2)}
                    <span className={`timeline-status ${item.Waived ? 'waived-text' : 'charged-text'}`}>
                      {item.Waived ? 'Waived' : 'Charged'}
                    </span>
                  </div>
                  {item["Applied Mnemonics"].length > 0 && (
                    <div className="timeline-mnemonics">
                      <span className="mnemonics-label">Applied Mnemonics:</span>
                      {item["Applied Mnemonics"].map((mnemonic, midx) => (
                        <span key={midx} className="timeline-mnemonic">{mnemonic}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="afr-container">
      <div className="header">
        <div className="logo">
          <div className="logo-icon">
            <div className="stagecoach"></div>
          </div>
          <h1>Wells Fargo</h1>
        </div>
        <h2>Account Fee Review</h2>
      </div>
      
      {renderPopularMnemonics()}
      
      <div className="main-content">
        <div className="search-container">
          <div className="search-tabs">
            <button 
              className={`tab-button ${searchType === 'single' ? 'active' : ''}`}
              onClick={() => setSearchType('single')}
            >
              Single Account
            </button>
            <button 
              className={`tab-button ${searchType === 'multiple' ? 'active' : ''}`}
              onClick={() => setSearchType('multiple')}
            >
              Multiple Accounts
            </button>
            <button 
              className={`tab-button ${searchType === 'summary' ? 'active' : ''}`}
              onClick={() => setSearchType('summary')}
            >
              Fee Summary
            </button>
          </div>
          
          <div className="search-panel">
            {searchType === 'single' && renderSingleSearchForm()}
            {searchType === 'multiple' && renderMultipleSearchForm()}
            {searchType === 'summary' && renderFeeSummaryForm()}
          </div>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="results-section">
          {searchType === 'single' && renderSingleWaiverResults()}
          {searchType === 'multiple' && renderMultipleWaiverResults()}
          {searchType === 'summary' && renderFeeSummaryResults()}
        </div>
      </div>
      
      <footer className="footer">
        <p>© 2025 Wells Fargo. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AFR;