import React, { useEffect, useRef, useState, FormEvent } from "react";
import ShowTable from "./ShowTable";
import "./Jira.css";

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

interface Scenario {
  endPoint: string;
  request: string;
  method: string;
  statuscode: number;
  additional_instructions: string[];
}

interface DynamicData {
  file_save_location: FileSaveLocation;
  file_name: string;
  background: Background;
  scenarios: Scenario[];
}

const successMetrics = {
  timeSaved: "73%",
  testsGenerated: "10,000+",
  companiesUsing: "50+",
};

const mockResponseData: DynamicData = {
  file_save_location: {
    requestFileSaveLocation: "bdd/test/resources/features/requests",
    headerFileSaveLocation: "bdd/test/resources/features/headers",
  },
  file_name: "RequestValidations.feature",
  background: {
    base_url: "https:///abidahmed/junaidamed",
    header: "bdd/test/resources/features/headers//header.json",
    annotations: ["@requestvalidationtag", "@smoke", "@sitTest"],
    config: ["This story will be converted to karate", "Another config 2"],
    additional_instructions: [
      "This story will be converted to karate",
      "second addditonal",
    ],
  },
  scenarios: [
    {
      endPoint: "v1/customer/cust/custv1/customer/cust/cust",
      request: "scenarioustscenarioust/abidjunaid",
      method: "POST",
      statuscode: 404,
      additional_instructions: ["This story will be converted to karate"],
    },
    {
      endPoint: "v1/customer/cust/custv1/customer/cust/cust/",
      request: "hellobhai/byebhai/hellokahaho/areykahahaibhai/areyhello/",
      method: "POST",
      statuscode: 404,
      additional_instructions: ["This story will be converted to karate"],
    },
    {
      endPoint: "v1/customer/cust/custv1/customer/cust/cust/",
      request: "v1/customer/cust/cust.json",
      method: "GET",
      statuscode: 405,
      additional_instructions: ["This story will be converted to karate"],
    },
  ],
};

const Jira: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [input, setInput] = useState<string>("");
  const [show, setShow] = useState<boolean>(false);
  const [userData, setUserData] = useState<DynamicData | null>(null);
  const [selectedTestType, setSelectedTestType] = useState<string>("API");
  const [selectedRole, setSelectedRole] = useState<string>("qa");

  useEffect(() => {
    if (show && scrollRef.current) {
      scrollRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [show]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    try {
      console.log("Using mock data for JIRA ticket:", input);
      console.log("Selected test type:", selectedTestType);
      setUserData(mockResponseData);
      setShow(true);
    } catch (error) {
      console.error("Error with mock data:", error);
    }
  };

  return (
    <div className="jira-container">
      {/* Header */}
      <header className="wf-header">
        <div className="logo-container">
          <span className="wf-logo">TestGenie</span>
        </div>
      </header>

      {/* Success Metrics */}
      <div className="metrics-strip">
        <div className="metrics-item">
          <span className="metrics-icon">⚡</span>
          <span className="metrics-text">
            Average time saved: {successMetrics.timeSaved}
          </span>
        </div>
        <div className="metrics-item">
          <span className="metrics-icon">🧪</span>
          <span className="metrics-text">
            {successMetrics.testsGenerated} tests generated
          </span>
        </div>
        <div className="metrics-item">
          <span className="metrics-icon">🛠</span>
          <span className="metrics-text">Built with Karate Framework</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="wf-main">
        <h1 className="wf-title">Convert JIRA story into Karate framework</h1>

        {/* Search Form */}
        <div className="search-container">
          <form onSubmit={handleSubmit} className="search-form">
            <div className="search-input-wrapper">
              <i className="search-icon">🔍</i>
              <input
                type="text"
                id="jira"
                name="jira"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Search Jira Ticket ID..."
                required
                className="search-input"
              />
            </div>

            <div className="select-wrapper">
              <select
                className="test-type-select"
                value={selectedTestType}
                onChange={(e) => setSelectedTestType(e.target.value)}
              >
                <option value="">Select Test Type</option>
                <option value="API">API</option>
                <option value="UI">UI</option>
                <option value="Integration">Integration</option>
                <option value="Performance">Performance</option>
              </select>
            </div>

            <button type="submit" className="search-button">
              <i className="search-button-icon">🚀</i>
            </button>
          </form>
        </div>

        {/* Show Results */}
        {show && userData && (
          <div className="results-container" ref={scrollRef}>
            <ShowTable
              inputData={userData}
              setInputData={setUserData as React.Dispatch<
                React.SetStateAction<DynamicData>
              >}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default Jira;