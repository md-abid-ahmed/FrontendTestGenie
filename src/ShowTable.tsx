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
  const [isEditingScenarios, setIsEditingScenarios] = useState<boolean>(false);
  const [editState, setEditState] = useState<{ [key: number]: Scenario }>({});
  const [isEditingOverview, setIsEditingOverview] = useState<boolean>(false);
  const [editedBackground, setEditedBackground] = useState<Background | null>(null);
  const [originalData, setOriginalData] = useState<UserData | null>(null);
  const [isEditingFileName, setIsEditingFileName] = useState<boolean>(false);
  const [editedFileName, setEditedFileName] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    // Simulate data loading
    if (inputData && Object.keys(inputData).length > 0) {
      const timer = setTimeout(() => {
        setIsLoading(false);
        setEditableScenarios([...inputData.scenarios]);
        setOriginalData({...inputData});
        setTimeout(() => setAnimateIn(true), 100);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [inputData]);

  // Start editing based on current tab
  const startEditing = () => {
    setIsEditing(true);
    
    if (activeTab === 'overview') {
      setIsEditingOverview(true);
      setEditedBackground({...inputData.background});
      setIsEditingFileName(true);
      setEditedFileName(inputData.file_name);
    } else if (activeTab === 'scenarios') {
      setIsEditingScenarios(true);
      const newEditState: { [key: number]: Scenario } = {};
      editableScenarios.forEach((scenario, index) => {
        newEditState[index] = { ...scenario };
      });
      setEditState(newEditState);
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setIsEditingOverview(false);
    setIsEditingScenarios(false);
    setIsEditingFileName(false);
    setEditedBackground(null);
  };

  const saveChanges = () => {
    const newInputData = {...inputData};
    
    if (activeTab === 'overview') {
      if (editedBackground) {
        newInputData.background = editedBackground;
      }
      if (isEditingFileName) {
        newInputData.file_name = editedFileName;
      }
    } else if (activeTab === 'scenarios') {
      const updatedScenarios = [...editableScenarios];
      Object.keys(editState).forEach(key => {
        const index = parseInt(key);
        updatedScenarios[index] = editState[index];
      });
      newInputData.scenarios = updatedScenarios;
      setEditableScenarios(updatedScenarios);
    }
    
    setInputData(newInputData);
    setIsEditing(false);
    setIsEditingOverview(false);
    setIsEditingScenarios(false);
    setIsEditingFileName(false);
  };

  const handleScenarioEditChange = (index: number, field: keyof Scenario, value: any) => {
    setEditState({
      ...editState,
      [index]: {
        ...editState[index],
        [field]: field === 'additional_instructions' 
          ? value.split(',').map((item: string) => item.trim())
          : value
      }
    });
  };

  const handleOverviewChange = (field: keyof Background, value: any) => {
    if (editedBackground) {
      let newValue;
      
      if (Array.isArray(editedBackground[field])) {
        // Handle array fields (annotations, config, additional_instructions)
        newValue = value.split(',').map((item: string) => item.trim());
      } else {
        // Handle string fields (base_url, header)
        newValue = value;
      }
      
      setEditedBackground({
        ...editedBackground,
        [field]: newValue
      });
    }
  };

  const getMethodBadgeClass = (method: string) => {
    const methodLower = method.toLowerCase();
    return `method-badge ${methodLower}`;
  };

  const getStatusBadgeClass = (statusCode: number) => {
    return statusCode >= 200 && statusCode < 400 
      ? 'status-badge success' 
      : 'status-badge error';
  };

  // Fixed function to show the full file path without extracting only the filename
  const displayFileName = (path: string) => {
    if (!path) return '';
    return path; // Return the full path as is
  };

  // For header files, we'll keep the original extraction
  const extractFilename = (path: string) => {
    if (!path) return '';
    const lastSlashIndex = path.lastIndexOf('/');
    return lastSlashIndex >= 0 ? path.substring(lastSlashIndex + 1) : path;
  };

  // Function to submit the data to an API
  const handleSubmit = async () => {
    try {
      // Log changes for verification
      console.log("Original data:", originalData);
      console.log("Updated data:", inputData);
      
      // Calculate what changed
      const hasChanges = JSON.stringify(originalData) !== JSON.stringify(inputData);
      console.log("Has changes:", hasChanges);
      
      // Send to API
      const response = await fetch('https://your-api-endpoint.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inputData),
      });
      
      if (response.ok) {
        alert('Data successfully submitted!');
        // Update the original data reference after successful submission
        setOriginalData({...inputData});
      } else {
        alert('Failed to submit data. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting data:', error);
      alert('Error submitting data. Please check console for details.');
    }
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
          <h1>Test Genie has retrived your JIRA details!</h1>
        </div>
        <div className="ticket-info">
          <div className="ticket-badge">
            <span className="ticket-icon">🎫</span>
            {isEditingFileName ? (
              <input 
                type="text" 
                className="editable-input" 
                value={editedFileName} 
                onChange={(e) => setEditedFileName(e.target.value)}
              />
            ) : (
              <span>{inputData.file_name.replace(".feature", "")}</span>
            )}
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
        <div className="status-indicator success">Ready for Testing</div>
      </div>

      <div className="content-area">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="overview-header">
              <h2>Test Feature Overview</h2>
              <div className="edit-actions">
                {isEditing ? (
                  <>
                    <button className="global-action-btn save-btn" onClick={saveChanges} title="Save all changes">
                      <span className="icon">💾</span> Save
                    </button>
                    <button className="global-action-btn cancel-btn" onClick={cancelEditing} title="Cancel editing">
                      <span className="icon">❌</span> Cancel
                    </button>
                  </>
                ) : (
                  <button className="global-action-btn edit-btn" onClick={startEditing} title="Edit data">
                    <span className="icon">✏️</span> Edit
                  </button>
                )}
              </div>
             
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
                  {isEditingOverview ? (
                    <input 
                      type="text" 
                      className="editable-input" 
                      value={editedBackground?.base_url || ''} 
                      onChange={(e) => handleOverviewChange('base_url', e.target.value)}
                    />
                  ) : (
                    <p className="full-text">{inputData.background.base_url}</p>
                  )}
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📄</div>
                <div className="stat-info">
                  <h3>Header File</h3>
                  <p className="file-path">{extractFilename(inputData.background.header)}</p>
                </div>
              </div>
            </div>

            <div className="config-section">
              <h3>Configuration Parameters</h3>
              <div className="config-grid">
                <div className="config-card">
                  <h4>Test Annotations</h4>
                  {isEditingOverview ? (
                    <textarea 
                      className="editable-textarea"
                      value={editedBackground?.annotations.join(', ') || ''}
                      onChange={(e) => handleOverviewChange('annotations', e.target.value)}
                    />
                  ) : (
                    <div className="tags-container">
                      {inputData.background.annotations.map((annotation, index) => (
                        <span key={index} className="tag">{annotation}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="config-card">
                  <h4>Config Parameters</h4>
                  {isEditingOverview ? (
                    <textarea 
                      className="editable-textarea"
                      value={editedBackground?.config.join(', ') || ''}
                      onChange={(e) => handleOverviewChange('config', e.target.value)}
                    />
                  ) : (
                    inputData.background.config.map((config, index) => (
                      <div key={index} className="config-item">
                        <span className="config-value">{config}</span>
                      </div>
                    ))
                  )}
                </div>

                <div className="config-card">
                  <h4>Additional Instructions</h4>
                  {isEditingOverview ? (
                    <textarea 
                      className="editable-textarea"
                      value={editedBackground?.additional_instructions.join(', ') || ''}
                      onChange={(e) => handleOverviewChange('additional_instructions', e.target.value)}
                    />
                  ) : (
                    inputData.background.additional_instructions.map((instruction, index) => (
                      <div key={index} className="config-item">
                        <span className="config-value">{instruction}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'scenarios' && (
          <div className="scenarios-section">
            <div className="section-header">
              <h2>Test Scenarios</h2>
              <div className="edit-actions">
                {isEditing ? (
                  <>
                    <button className="global-action-btn save-btn" onClick={saveChanges} title="Save all changes">
                      <span className="icon">💾</span> Save
                    </button>
                    <button className="global-action-btn cancel-btn" onClick={cancelEditing} title="Cancel editing">
                      <span className="icon">❌</span> Cancel
                    </button>
                  </>
                ) : (
                  <button className="global-action-btn edit-btn" onClick={startEditing} title="Edit data">
                    <span className="icon">✏️</span> Edit
                  </button>
                )}
              </div>
            </div>
            <p className="section-description">All scenarios defined for the current test feature</p>
            
            <div className="table-container enhanced-table">
              <table className="data-table scenarios-table">
                <thead>
                  <tr>
                    <th className="id-col">#</th>
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
                      <td className="id-col">
                        <div className="scenario-number">{index + 1}</div>
                      </td>
                      <td>
                        {isEditingScenarios ? (
                          <input 
                            type="text" 
                            className="editable-input" 
                            value={editState[index]?.endPoint || scenario.endPoint}
                            onChange={(e) => handleScenarioEditChange(index, 'endPoint', e.target.value)}
                          />
                        ) : (
                          <div className="endpoint-display">{scenario.endPoint}</div>
                        )}
                      </td>
                      <td>
                        {isEditingScenarios ? (
                          <select 
                            className="editable-select"
                            value={editState[index]?.method || scenario.method}
                            onChange={(e) => handleScenarioEditChange(index, 'method', e.target.value)}
                          >
                            <option value="GET">GET</option>
                            <option value="POST">POST</option>
                            <option value="PUT">PUT</option>
                            <option value="DELETE">DELETE</option>
                            <option value="PATCH">PATCH</option>
                          </select>
                        ) : (
                          <div className={getMethodBadgeClass(scenario.method)}>{scenario.method}</div>
                        )}
                      </td>
                      <td>
                        {isEditingScenarios ? (
                          <input 
                            type="number" 
                            className="editable-input status-input" 
                            value={editState[index]?.statuscode || scenario.statuscode}
                            onChange={(e) => handleScenarioEditChange(index, 'statuscode', parseInt(e.target.value))}
                          />
                        ) : (
                          <div className={getStatusBadgeClass(scenario.statuscode)}>{scenario.statuscode}</div>
                        )}
                      </td>
                      <td className="file-path">
                        <div className="tooltip request-file">
                          <div className="file-icon">📄</div>
                          <span>{displayFileName(scenario.request)}</span>
                          <span className="tooltiptext">{scenario.request}</span>
                        </div>
                      </td>
                      <td>
                        {isEditingScenarios ? (
                          <textarea 
                            className="editable-textarea"
                            value={editState[index]?.additional_instructions.join(', ') || scenario.additional_instructions.join(', ')}
                            onChange={(e) => handleScenarioEditChange(index, 'additional_instructions', e.target.value)}
                          />
                        ) : (
                          <div className="instructions-container">
                            {scenario.additional_instructions.length > 0 ? 
                              scenario.additional_instructions.map((instruction, i) => (
                                <div key={i} className="instruction-item">• {instruction}</div>
                              )) : 
                              <span className="empty-instructions">No instructions</span>
                            }
                          </div>
                        )}
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
            <div className="section-header">
              <h2>File Locations</h2>
             
            </div>
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
                        {inputData.scenarios.slice(0, 3).map((scenario, index) => (
                          <div className="tree-item" key={index}>
                            <span className="file-icon">📄</span> {displayFileName(scenario.request)}
                          </div>
                        ))}
                        {inputData.scenarios.length > 3 && (
                          <div className="tree-item">
                            <span className="file-icon">...</span> and {inputData.scenarios.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="tree-item">
                      <span className="folder-icon">📁</span> headers
                      <div className="tree-item-children">
                        <div className="tree-item">
                          <span className="file-icon">📄</span> {extractFilename(inputData.background.header)}
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
          <button className="action-button submit-button" onClick={handleSubmit}>
            <i className="icon">📤</i> Submit
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