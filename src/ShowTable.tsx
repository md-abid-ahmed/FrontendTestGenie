import React, { useState, useEffect } from 'react';
import './ShowTable.css';

interface Scenario {
  endPoint: string;
  request: string;
  method: string;
  statuscode: number;
  additional_instructions: string[];
}

interface FileSaveLocation {
  requestFileSaveLocation: string;
  headerFileSaveLocation: string;
}

interface Background {
  base_url: string;
  header: string;
  annotations: string[];
  config: string[];
  additional_instructions: string[];
}

interface UserData {
  file_save_location: FileSaveLocation;
  file_name: string;
  background: Background;
  scenarios: Scenario[];
}

interface ShowTableProps {
  inputData: UserData;
  setInputData: React.Dispatch<React.SetStateAction<UserData>>;
}

const ShowTable: React.FC<ShowTableProps> = ({ inputData, setInputData }) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [animateIn, setAnimateIn] = useState<boolean>(false);
  const [editableScenarios, setEditableScenarios] = useState<Scenario[]>([]);

  useEffect(() => {
    // Simulate data loading
    if (inputData && Object.keys(inputData).length > 0) {
      const timer = setTimeout(() => {
        setIsLoading(false);
        setEditableScenarios([...inputData.scenarios]);
        setTimeout(() => setAnimateIn(true), 100);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [inputData]);

  const handleScenarioChange = (index: number, field: keyof Scenario, value: any) => {
    const updatedScenarios = [...editableScenarios];
    if (field === 'additional_instructions') {
      // Handle array fields differently
      updatedScenarios[index][field] = value.split(',').map((item: string) => item.trim());
    } else {
      // For simple fields
      (updatedScenarios[index][field] as typeof value) = value;
    }
    
    setEditableScenarios(updatedScenarios);
    
    // Also update the main inputData with the new changes
    const newInputData = {...inputData};
    newInputData.scenarios = updatedScenarios;
    setInputData(newInputData);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loader">
          <div className="loader-inner"></div>
        </div>
        <p>Loading Test Data...</p>
      </div>
    );
  }

  // Check if inputData is valid and contains the expected structure
  if (!inputData || !inputData.scenarios || !inputData.background) {
    return (
      <div className="error-message">
        <h3>Error: Invalid Data Format</h3>
        <p>The data received does not match the expected format. Please try again.</p>
      </div>
    );
  }

  return (
    <div className={`show-table-container ${animateIn ? 'animate-in' : ''}`}>
      <div className="header">
        <div className="logo-container">
          <div className="logo">WF</div>
          <h1>Wells Fargo Test <span>Dashboard</span></h1>
        </div>
        <div className="ticket-info">
          <div className="ticket-badge">
            <span className="ticket-icon">🎫</span>
            <span>{inputData.file_name.replace(".feature", "")}</span>
          </div>
        </div>
      </div>

      <div className="tabs">
        <button 
          className={activeTab === 'overview' ? 'active' : ''} 
          onClick={() => setActiveTab('overview')}
        >
          <i className="icon">📊</i> Overview & Configuration
        </button>
        <button 
          className={activeTab === 'scenarios' ? 'active' : ''} 
          onClick={() => setActiveTab('scenarios')}
        >
          <i className="icon">📝</i> Scenarios
        </button>
        <button 
          className={activeTab === 'locations' ? 'active' : ''} 
          onClick={() => setActiveTab('locations')}
        >
          <i className="icon">📁</i> File Locations
        </button>
      </div>

      <div className="content-area">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="overview-header">
              <h2>Test Feature Overview</h2>
              <div className="status-indicator success">Ready for Testing</div>
            </div>
            
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-info">
                  <h3>Total Scenarios</h3>
                  <p>{inputData.scenarios.length}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🔄</div>
                <div className="stat-info">
                  <h3>HTTP Methods</h3>
                  <p>{Array.from(new Set(inputData.scenarios.map(s => s.method))).join(', ')}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🔗</div>
                <div className="stat-info">
                  <h3>Base URL</h3>
                  <p className="full-text">{inputData.background.base_url}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📄</div>
                <div className="stat-info">
                  <h3>Header File</h3>
                  <p className="file-path">{inputData.background.header.split('/').pop()}</p>
                </div>
              </div>
            </div>

            <div className="config-section">
              <h3>Configuration Parameters</h3>
              <div className="config-grid">
                <div className="config-card">
                  <h4>Test Annotations</h4>
                  <div className="tags-container">
                    {inputData.background.annotations.map((annotation, index) => (
                      <span key={index} className="tag">{annotation}</span>
                    ))}
                  </div>
                </div>

                <div className="config-card">
                  <h4>Config Parameters</h4>
                  {inputData.background.config.map((config, index) => (
                    <div key={index} className="config-item">
                      <span className="config-value">{config}</span>
                    </div>
                  ))}
                </div>

                <div className="config-card">
                  <h4>Additional Instructions</h4>
                  {inputData.background.additional_instructions.map((instruction, index) => (
                    <div key={index} className="config-item">
                      <span className="config-value">{instruction}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'scenarios' && (
          <div className="scenarios-section">
            <h2>Test Scenarios</h2>
            <p className="section-description">All scenarios defined for the current test feature</p>
            
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Endpoint</th>
                    <th>Method</th>
                    <th>Status Code</th>
                    <th>Request File</th>
                    <th>Instructions</th>
                  </tr>
                </thead>
                <tbody>
                  {editableScenarios.map((scenario, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                      <td>{index + 1}</td>
                      <td>
                        <input 
                          type="text" 
                          className="editable-input" 
                          value={scenario.endPoint}
                          onChange={(e) => handleScenarioChange(index, 'endPoint', e.target.value)}
                        />
                      </td>
                      <td>
                        <select 
                          className="editable-select"
                          value={scenario.method}
                          onChange={(e) => handleScenarioChange(index, 'method', e.target.value)}
                        >
                          <option value="GET">GET</option>
                          <option value="POST">POST</option>
                          <option value="PUT">PUT</option>
                          <option value="DELETE">DELETE</option>
                          <option value="PATCH">PATCH</option>
                        </select>
                      </td>
                      <td>
                        <input 
                          type="number" 
                          className="editable-input status-input" 
                          value={scenario.statuscode}
                          onChange={(e) => handleScenarioChange(index, 'statuscode', parseInt(e.target.value))}
                        />
                      </td>
                      <td className="file-path">
                        <div className="tooltip">
                          {scenario.request.split('/').pop()}
                          <span className="tooltiptext">{scenario.request}</span>
                        </div>
                      </td>
                      <td>
                        <textarea 
                          className="editable-textarea"
                          value={scenario.additional_instructions.join(', ')}
                          onChange={(e) => handleScenarioChange(index, 'additional_instructions', e.target.value)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'locations' && (
          <div className="locations-section">
            <h2>File Locations</h2>
            <p className="section-description">Resource file paths for the current test feature</p>
            
            <div className="location-cards">
              <div className="location-card">
                <div className="location-icon">📄</div>
                <div className="location-details">
                  <h3>Feature File</h3>
                  <p className="location-path">{inputData.file_name}</p>
                </div>
              </div>
              
              <div className="location-card">
                <div className="location-icon">📁</div>
                <div className="location-details">
                  <h3>Request Files Location</h3>
                  <p className="location-path">{inputData.file_save_location.requestFileSaveLocation}</p>
                </div>
              </div>

              <div className="location-card">
                <div className="location-icon">📁</div>
                <div className="location-details">
                  <h3>Header Files Location</h3>
                  <p className="location-path">{inputData.file_save_location.headerFileSaveLocation}</p>
                </div>
              </div>
            </div>

            <div className="file-structure">
              <h3>File Structure Overview</h3>
              <div className="structure-tree">
                <div className="tree-item">
                  <span className="folder-icon">📁</span> test/resources/features
                  <div className="tree-item-children">
                    <div className="tree-item">
                      <span className="folder-icon">📁</span> requests
                      <div className="tree-item-children">
                        <div className="tree-item">
                          <span className="file-icon">📄</span> {inputData.scenarios[0]?.request.split('/').pop()}
                        </div>
                        {inputData.scenarios.length > 1 && (
                          <div className="tree-item">
                            <span className="file-icon">📄</span> {inputData.scenarios[1]?.request.split('/').pop()}
                          </div>
                        )}
                        {inputData.scenarios.length > 2 && (
                          <div className="tree-item">
                            <span className="file-icon">📄</span> {inputData.scenarios[2]?.request.split('/').pop()}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="tree-item">
                      <span className="folder-icon">📁</span> headers
                      <div className="tree-item-children">
                        <div className="tree-item">
                          <span className="file-icon">📄</span> {inputData.background.header.split('/').pop()}
                        </div>
                      </div>
                    </div>
                    <div className="tree-item">
                      <span className="file-icon">📄</span> {inputData.file_name}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="footer">
        <div className="footer-info">
          <p>Wells Fargo Test Dashboard • {new Date().toLocaleDateString()}</p>
        </div>
        <div className="footer-links">
          <button className="action-button" onClick={() => window.print()}>
            <i className="icon">🖨️</i> Print Report
          </button>
          <button className="action-button" onClick={() => { 
            setInputData({} as UserData);
            window.location.reload();
          }}>
            <i className="icon">🔄</i> New Search
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShowTable;