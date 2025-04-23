import React, { useState, useEffect } from 'react';
import './ShowTable.css';

// Generic type for dynamic data
interface DynamicData {
  [key: string]: any;
}

interface ShowTableProps {
  inputData: DynamicData;
  setInputData: React.Dispatch<React.SetStateAction<DynamicData>>;
}

const ShowTable: React.FC<ShowTableProps> = ({ inputData, setInputData }) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [animateIn, setAnimateIn] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editState, setEditState] = useState<DynamicData>({});
  const [originalData, setOriginalData] = useState<DynamicData | null>(null);

  // Extract main sections for tabs
  const getMainSections = () => {
    // Default sections if they exist in the data
    const knownSections = ['scenarios', 'background', 'file_save_location'];
    const availableSections = Object.keys(inputData).filter(key => {
      // Include known sections if they exist and are objects or arrays
      if (knownSections.includes(key)) {
        return typeof inputData[key] === 'object' && inputData[key] !== null;
      }
      // Include other object/array properties that might be significant sections
      return typeof inputData[key] === 'object' && 
             inputData[key] !== null && 
             !Array.isArray(inputData[key]);
    });

    // Always include overview tab
    return ['overview', ...availableSections];
  };

  useEffect(() => {
    // Simulate data loading
    if (inputData && Object.keys(inputData).length > 0) {
      const timer = setTimeout(() => {
        setIsLoading(false);
        setOriginalData({...inputData});
        setTimeout(() => setAnimateIn(true), 100);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [inputData]);

  const startEditing = () => {
    setIsEditing(true);
    setEditState(deepClone(inputData));
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditState({});
  };

  const saveChanges = () => {
    setInputData({...editState});
    setIsEditing(false);
    setEditState({});
  };

  // Deep clone function for objects/arrays
  const deepClone = (obj: any): any => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(deepClone);
    
    const cloned: DynamicData = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  };

  // Handle changes at any level in the data structure
  const handleEditChange = (path: string[], value: any) => {
    const newEditState = {...editState};
    let current = newEditState;
    
    // Navigate to the parent object of the property to change
    for (let i = 0; i < path.length - 1; i++) {
      if (typeof current[path[i]] === 'undefined') {
        if (isNaN(Number(path[i+1]))) {
          current[path[i]] = {};
        } else {
          current[path[i]] = [];
        }
      }
      current = current[path[i]];
    }
    
    // Set the new value
    current[path[path.length - 1]] = value;
    setEditState(newEditState);
  };

  // Extract value at a given path
  const getValueAtPath = (obj: any, path: string[]): any => {
    let current = obj;
    for (let i = 0; i < path.length; i++) {
      if (current === undefined || current === null) return undefined;
      current = current[path[i]];
    }
    return current;
  };

  // Format value based on type for display
  const formatValueForDisplay = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return value.toString();
    if (Array.isArray(value)) return `[${value.length} items]`;
    if (typeof value === 'object') return '{...}';
    return String(value);
  };

  // Get class for method badges if value looks like an HTTP method
  const getMethodBadgeClass = (value: string) => {
    const methodRegex = /^(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)$/i;
    const valueLower = value.toUpperCase();
    return methodRegex.test(valueLower) ? `method-badge ${valueLower.toLowerCase()}` : '';
  };

  // Get class for status codes if value looks like an HTTP status
  const getStatusBadgeClass = (value: number) => {
    if (value >= 100 && value < 600) {
      return value >= 200 && value < 400 ? 'status-badge success' : 'status-badge error';
    }
    return '';
  };

  // Determine if a value looks like a file path
  const isFilePath = (value: string): boolean => {
    return typeof value === 'string' && 
           (value.includes('/') || value.includes('\\') || value.endsWith('.txt') || 
            value.endsWith('.json') || value.endsWith('.feature') || 
            value.endsWith('.js') || value.endsWith('.ts'));
  };

  // Extract filename from path
  const extractFilename = (path: string) => {
    if (!path || typeof path !== 'string') return '';
    const lastSlashIndex = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));
    return lastSlashIndex >= 0 ? path.substring(lastSlashIndex + 1) : path;
  };

  // Render editor based on value type
  const renderEditor = (path: string[], value: any) => {
    const currentPath = path.join('.');
    const currentValue = getValueAtPath(editState, path);
    
    if (Array.isArray(value)) {
      // For arrays, we'll render a textarea with comma-separated values
      return (
        <textarea 
          className="editable-textarea"
          value={Array.isArray(currentValue) ? currentValue.join(', ') : ''}
          onChange={(e) => {
            const newValue = e.target.value.split(',').map(item => item.trim());
            handleEditChange(path, newValue);
          }}
        />
      );
    }
    
    if (typeof value === 'object' && value !== null) {
      // For objects, we'll show a special message
      return <div className="edit-object-note">Edit individual properties below</div>;
    }
    
    if (typeof value === 'boolean') {
      // For booleans, render a checkbox
      return (
        <input 
          type="checkbox" 
          checked={!!currentValue}
          onChange={(e) => handleEditChange(path, e.target.checked)}
        />
      );
    }
    
    if (typeof value === 'number') {
      // For numbers, render a number input
      return (
        <input 
          type="number" 
          className="editable-input" 
          value={currentValue !== undefined ? currentValue : 0}
          onChange={(e) => handleEditChange(path, Number(e.target.value))}
        />
      );
    }
    
    // Default: text input for strings and other types
    return (
      <input 
        type="text" 
        className="editable-input" 
        value={currentValue !== undefined ? currentValue : ''}
        onChange={(e) => handleEditChange(path, e.target.value)}
      />
    );
  };

  // Recursively render property cards for objects
  const renderPropertyCards = (obj: any, path: string[] = []) => {
    if (!obj || typeof obj !== 'object') return null;
    
    return Object.keys(obj).map(key => {
      const value = obj[key];
      const currentPath = [...path, key];
      const displayKey = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
      
      // Skip rendering huge arrays in the overview
      if (Array.isArray(value) && value.length > 10) {
        return (
          <div className="property-card" key={currentPath.join('.')}>
            <h4>{displayKey}</h4>
            <div className="property-value">
              {isEditing ? renderEditor(currentPath, value) : (
                <span className="array-summary">{value.length} items</span>
              )}
            </div>
          </div>
        );
      }
      
      // If it's an object but not an array, render recursively
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        return (
          <div className="nested-property-card" key={currentPath.join('.')}>
            <h4>{displayKey}</h4>
            <div className="nested-properties">
              {renderPropertyCards(value, currentPath)}
            </div>
          </div>
        );
      }
      
      // For simple values or arrays, render directly
      return (
        <div className="property-card" key={currentPath.join('.')}>
          <h4>{displayKey}</h4>
          <div className="property-value">
            {isEditing ? renderEditor(currentPath, value) : renderValueDisplay(value, key)}
          </div>
        </div>
      );
    });
  };
  
  // Render a value based on its type and likely meaning
  const renderValueDisplay = (value: any, key?: string) => {
    if (value === null || value === undefined) return <span className="empty-value">N/A</span>;
    
    // Handle arrays specially
    if (Array.isArray(value)) {
      return (
        <div className="tags-container">
          {value.length > 0 ? value.map((item, index) => (
            <span key={index} className="tag">{formatValueForDisplay(item)}</span>
          )) : <span className="empty-value">Empty array</span>}
        </div>
      );
    }
    
    // Handle objects
    if (typeof value === 'object' && value !== null) {
      return <span className="object-value">{JSON.stringify(value)}</span>;
    }
    
    // Handle string paths
    if (typeof value === 'string' && isFilePath(value)) {
      return (
        <div className="tooltip file-path">
          <div className="file-icon">📄</div>
          <span>{extractFilename(value)}</span>
          <span className="tooltiptext">{value}</span>
        </div>
      );
    }
    
    // Handle HTTP method-like strings
    if (typeof value === 'string' && getMethodBadgeClass(value)) {
      return <div className={getMethodBadgeClass(value)}>{value}</div>;
    }
    
    // Handle status code-like numbers
    if (typeof value === 'number' && getStatusBadgeClass(value)) {
      return <div className={getStatusBadgeClass(value)}>{value}</div>;
    }
    
    // Default display for other types
    return <span>{formatValueForDisplay(value)}</span>;
  };

  // Get a count of important items for stats
  const getItemCount = (key: string): number => {
    const value = inputData[key];
    if (Array.isArray(value)) return value.length;
    if (typeof value === 'object' && value !== null) return Object.keys(value).length;
    return 0;
  };

  // Find a field by likely name in the data
  const findFieldByPossibleNames = (possibleNames: string[]): any => {
    for (const name of possibleNames) {
      // Check top level
      if (inputData[name] !== undefined) return inputData[name];
      
      // Check one level down in common containers
      for (const key of Object.keys(inputData)) {
        if (
          typeof inputData[key] === 'object' && 
          inputData[key] !== null && 
          inputData[key][name] !== undefined
        ) {
          return inputData[key][name];
        }
      }
    }
    return undefined;
  };

  // Get display name for the feature
  const getFeatureName = (): string => {
    const possibleNames = ['file_name', 'name', 'title', 'feature'];
    const featureName = findFieldByPossibleNames(possibleNames);
    
    if (typeof featureName === 'string') {
      return featureName.replace(/\.feature$/, '');
    }
    
    return "Test Feature";
  };

  // Get base URL for display
  const getBaseUrl = (): string => {
    const possibleNames = ['base_url', 'baseUrl', 'url', 'api_url'];
    const background = inputData.background || {};
    
    for (const name of possibleNames) {
      if (background[name]) return background[name];
      if (inputData[name]) return inputData[name];
    }
    
    return "N/A";
  };

  // Get data for table display (for array of objects)
  const renderTableForArray = (array: any[], path: string[] = []) => {
    if (!Array.isArray(array) || array.length === 0) return null;
    
    // Extract all possible column keys from all objects
    const allKeys = new Set<string>();
    array.forEach(item => {
      if (item && typeof item === 'object') {
        Object.keys(item).forEach(key => allKeys.add(key));
      }
    });
    
    // Filter out columns that are too complex (objects/arrays) unless they are common types
    const columnKeys = Array.from(allKeys).filter(key => {
      const firstValueWithKey = array.find(item => item && item[key] !== undefined);
      if (!firstValueWithKey) return false;
      
      const value = firstValueWithKey[key];
      if (value === null) return true;
      
      // Keep strings, numbers, booleans
      if (typeof value !== 'object') return true;
      
      // Keep short arrays with primitive values
      if (Array.isArray(value) && value.length <= 3 && 
          value.every(v => typeof v !== 'object' || v === null)) {
        return true;
      }
      
      // Filter out complex objects
      return false;
    });
    
    // Identify special columns for styling
    const methodColumnIndex = columnKeys.findIndex(key => 
      key.toLowerCase().includes('method') || 
      (array[0] && array[0][key] && typeof array[0][key] === 'string' && getMethodBadgeClass(array[0][key]))
    );
    
    const statusColumnIndex = columnKeys.findIndex(key => 
      key.toLowerCase().includes('status') || key.toLowerCase().includes('code') ||
      (array[0] && array[0][key] && typeof array[0][key] === 'number' && array[0][key] >= 100 && array[0][key] < 600)
    );
    
    const fileColumnIndices = columnKeys.map((key, index) => {
      const hasFilePaths = array.some(item => 
        item && item[key] && typeof item[key] === 'string' && isFilePath(item[key])
      );
      return hasFilePaths ? index : -1;
    }).filter(index => index !== -1);
    
    return (
      <div className="table-container enhanced-table">
        <table className="data-table dynamic-table">
          <thead>
            <tr>
              <th className="id-col">#</th>
              {columnKeys.map(key => (
                <th key={key}>{key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {array.map((item, rowIndex) => (
              <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'even-row' : 'odd-row'}>
                <td className="id-col">
                  <div className="scenario-number">{rowIndex + 1}</div>
                </td>
                {columnKeys.map((key, colIndex) => {
                  const fullPath = [...path, rowIndex.toString(), key];
                  const value = item ? item[key] : undefined;
                  
                  // Special cell rendering based on column type
                  let cellContent;
                  if (isEditing) {
                    cellContent = renderEditor(fullPath, value);
                  } else {
                    if (colIndex === methodColumnIndex) {
                      cellContent = typeof value === 'string' ? 
                        <div className={getMethodBadgeClass(value)}>{value}</div> : 
                        renderValueDisplay(value);
                    } else if (colIndex === statusColumnIndex && typeof value === 'number') {
                      cellContent = <div className={getStatusBadgeClass(value)}>{value}</div>;
                    } else if (fileColumnIndices.includes(colIndex) && typeof value === 'string') {
                      cellContent = (
                        <div className="tooltip file-path">
                          <div className="file-icon">📄</div>
                          <span>{extractFilename(value)}</span>
                          <span className="tooltiptext">{value}</span>
                        </div>
                      );
                    } else if (Array.isArray(value)) {
                      cellContent = (
                        <div className="cell-array">
                          {value.length > 0 ? value.map((v, i) => (
                            <div key={i} className="cell-array-item">• {formatValueForDisplay(v)}</div>
                          )) : <span className="empty-array">None</span>}
                        </div>
                      );
                    } else {
                      cellContent = renderValueDisplay(value);
                    }
                  }
                  
                  return <td key={`${rowIndex}-${colIndex}`}>{cellContent}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Get file structure for display
  const getFileStructure = () => {
    const fileLocations: Record<string, string[]> = {};
    
    // Try to find file save locations
    const fileSaveLocation = inputData.file_save_location || {};
    
    // Try to find file references anywhere in the data
    const collectFilePaths = (obj: any, prefix: string = ''): void => {
      if (!obj || typeof obj !== 'object') return;
      
      Object.entries(obj).forEach(([key, value]) => {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        
        if (typeof value === 'string' && isFilePath(value)) {
          const folder = value.includes('/') ? value.substring(0, value.lastIndexOf('/')) : '';
          if (!fileLocations[folder]) fileLocations[folder] = [];
          fileLocations[folder].push(value);
        } else if (typeof value === 'object' && value !== null) {
          collectFilePaths(value, fullKey);
        }
      });
    };
    
    collectFilePaths(inputData);
    
    return fileLocations;
  };

  // Handles submitting data
  const handleSubmit = async () => {
    try {
      console.log("Original data:", originalData);
      console.log("Updated data:", inputData);
      
      const hasChanges = JSON.stringify(originalData) !== JSON.stringify(inputData);
      console.log("Has changes:", hasChanges);
      
      // This would be replaced with actual API call
      alert('Data would be submitted here! Check console for what would be sent.');
      setOriginalData({...inputData});
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

  // Check if inputData is valid
  if (!inputData || Object.keys(inputData).length === 0) {
    return (
      <div className="error-message">
        <h3>Error: Invalid Data Format</h3>
        <p>The data received does not match the expected format. Please try again.</p>
      </div>
    );
  }

  // Dynamic sections available for tabs
  const mainSections = getMainSections();

  return (
    <div className={`show-table-container ${animateIn ? 'animate-in' : ''}`}>
      <div className="header">
        <div className="logo-container">
          <div className="logo">WF</div>
          <h1>Test Genie has retrieved your JIRA details!</h1>
        </div>
        <div className="ticket-info">
          <div className="ticket-badge">
            <span className="ticket-icon">🎫</span>
            {isEditing && inputData.file_name !== undefined ? (
              <input 
                type="text" 
                className="editable-input" 
                value={getValueAtPath(editState, ['file_name']) || ''}
                onChange={(e) => handleEditChange(['file_name'], e.target.value)}
              />
            ) : (
              <span>{getFeatureName()}</span>
            )}
          </div>
        </div>
      </div>

      <div className="tabs">
        {/* Always show Overview tab */}
        <button 
          className={activeTab === 'overview' ? 'active' : ''} 
          onClick={() => setActiveTab('overview')}
        >
          <i className="icon">📊</i> Overview
        </button>
        
        {/* Dynamic tabs based on data structure */}
        {mainSections.filter(section => section !== 'overview').map(section => (
          <button 
            key={section}
            className={activeTab === section ? 'active' : ''} 
            onClick={() => setActiveTab(section)}
          >
            <i className="icon">{section === 'scenarios' ? '📝' : 
                             section === 'file_save_location' ? '📁' : '⚙️'}</i> 
            {section.charAt(0).toUpperCase() + section.slice(1).replace(/_/g, ' ')}
          </button>
        ))}
        
        <div className="status-indicator success">Ready for Testing</div>
      </div>

      <div className="content-area">
        {/* Overview Tab */}
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
            
            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-info">
                  <h3>Total Scenarios</h3>
                  <p>{getItemCount('scenarios')}</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">🔗</div>
                <div className="stat-info">
                  <h3>Base URL</h3>
                  {isEditing ? (
                    <input 
                      type="text" 
                      className="editable-input" 
                      value={getValueAtPath(editState, ['background', 'base_url']) || ''}
                      onChange={(e) => handleEditChange(['background', 'base_url'], e.target.value)}
                    />
                  ) : (
                    <p className="full-text">{getBaseUrl()}</p>
                  )}
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">📄</div>
                <div className="stat-info">
                  <h3>Feature File</h3>
                  <p className="file-path">{inputData.file_name || "Not specified"}</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">🔄</div>
                <div className="stat-info">
                  <h3>Last Updated</h3>
                  <p>{new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Dynamic Overview Cards */}
            <div className="config-section">
              <h3>Configuration Overview</h3>
              <div className="config-grid">
                {renderPropertyCards(inputData)}
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Section Content */}
        {activeTab !== 'overview' && inputData[activeTab] && (
          <div className="dynamic-section">
            <div className="section-header">
              <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace(/_/g, ' ')}</h2>
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
            <p className="section-description">
              {activeTab === 'scenarios' ? 'All scenarios defined for the current test feature' : 
               activeTab === 'file_save_location' ? 'Resource file paths for the current test feature' :
               `Details for ${activeTab.replace(/_/g, ' ')}`}
            </p>

            {/* If it's an array of objects, show table view */}
            {Array.isArray(inputData[activeTab]) && inputData[activeTab].length > 0 && 
             typeof inputData[activeTab][0] === 'object' && 
             renderTableForArray(inputData[activeTab], [activeTab])}

            {/* If it's not an array of objects, show property cards */}
            {(!Array.isArray(inputData[activeTab]) || 
              inputData[activeTab].length === 0 || 
              typeof inputData[activeTab][0] !== 'object') && 
             typeof inputData[activeTab] === 'object' && 
             <div className="config-grid">{renderPropertyCards(inputData[activeTab], [activeTab])}</div>}

            {/* Special handling for file locations */}
            {activeTab === 'file_save_location' && (
              <div className="file-structure">
                <h3>File Structure Overview</h3>
                <div className="structure-tree">
                  <div className="tree-item">
                    <span className="folder-icon">📁</span> test/resources/features
                    <div className="tree-item-children">
                      {Object.entries(getFileStructure()).map(([folder, files], index) => (
                        <div className="tree-item" key={index}>
                          <span className="folder-icon">📁</span> {extractFilename(folder) || "root"}
                          <div className="tree-item-children">
                            {files.slice(0, 5).map((file, fileIndex) => (
                              <div className="tree-item" key={fileIndex}>
                                <span className="file-icon">📄</span> {extractFilename(file)}
                              </div>
                            ))}
                            {files.length > 5 && (
                              <div className="tree-item">
                                <span className="file-icon">...</span> and {files.length - 5} more
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      <div className="tree-item">
                        <span className="file-icon">📄</span> {inputData.file_name || "feature_file.feature"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
            setInputData({} as DynamicData);
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