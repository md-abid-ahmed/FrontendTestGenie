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

interface UserData {
  file_save_location: FileSaveLocation;
  file_name: string;
  background: Background;
  scenarios: Scenario[];
}

const successMetrics = {
  timeSaved: "73%",
  testsGenerated: "10,000+",
  companiesUsing: "50+"
};

const mockResponseData: UserData = {
  file_save_location: {
    requestFileSaveLocation: "bdd/test/resources/features/requests",
    headerFileSaveLocation: "bdd/test/resources/features/headers"
  },
  file_name: "RequestValidations.feature",
  background: {
    base_url: "https:///abidahmed/junaidamed",
    header: "bdd/test/resources/features/headers//header.json",
    annotations: ["@requestvalidationtag", "@smoke", "@sitTest"],
    config: ["This story will be converted to karate","Another config 2"],
    additional_instructions: ["This story will be converted to karate","second addditonal"],
  },
  scenarios: [
    {
      endPoint: "v1/customer/cust/custv1/customer/cust/cust",
      request: "scenarioustscenarioust/abidjunaid",
      method: "POST",
      statuscode: 404,
      additional_instructions: ["This story will be converted to karate"]
    },
    {
      endPoint: "v1/customer/cust/custv1/customer/cust/cust/",
      request: "hellobhai/byebhai/hellokahaho/areykahahaibhai/areyhello/",
      method: "POST",
      statuscode: 404,
      additional_instructions: ["This story will be converted to karate"]
    },
    {
      endPoint: "v1/customer/cust/custv1/customer/cust/cust/",
      request: "v1/customer/cust/cust.json",
      method: "GET",
      statuscode: 405,
      additional_instructions: ["This story will be converted to karate"]
    }
  ]
};

const Jira: React.FC = () => {
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const [input, setInput] = useState<string>("");
    const [show, setShow] = useState<boolean>(false);
    const [userData, setUserData] = useState<UserData | null>(null);
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

    // Role-specific content
    const roleContent = {
        qa: {
            title: "For QA Engineers",
            description: "Reduce test creation time by up to 80%. Automatically generate standardized Karate tests directly from JIRA stories and maintain consistent test coverage across sprints.",
            icon: "🧪"
        },
        scrum: {
            title: "For Scrum Masters",
            description: "Improve team velocity by eliminating test case creation bottlenecks. Track test coverage metrics across sprints and ensure quality gates are consistently met.",
            icon: "📊"
        },
        dev: {
            title: "For Developers",
            description: "Focus on writing code, not test cases. TestGenie creates test scripts that align with your API contracts, helping catch integration issues early.",
            icon: "💻"
        }
    };

    return (
        <div className="jira-container">
            <header className="wf-header">
                <div className="logo-container">
                    <span className="wf-logo">TestGenie</span>
                </div>
            </header>

            {/* Success Metrics Strip */}
            <div className="metrics-strip">
                <div className="metrics-item">
                    <span className="metrics-icon">⚡</span>
                    <span className="metrics-text">Average time saved: {successMetrics.timeSaved}</span>
                </div>
                <div className="metrics-item">
                    <span className="metrics-icon">🧪</span>
                    <span className="metrics-text">{successMetrics.testsGenerated} tests generated</span>
                </div>
                <div className="metrics-item">
                    <span className="metrics-icon">🛠</span>
                    <span className="metrics-text">Built with Karate Framework</span>
                </div>
            </div>

            <main className="wf-main">
                <h1 className="wf-title">Convert JIRA story into Karate framework</h1>
                
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

                {/* Only show role-based content, process flow, and features if not showing results */}
                {!show && (
                    <>
                        {/* Role-based tabs */}
                        <div className="role-tabs">
                            <button 
                                className={`role-tab ${selectedRole === 'qa' ? 'active' : ''}`}
                                onClick={() => setSelectedRole('qa')}
                            >
                                <span className="role-icon">{roleContent.qa.icon}</span>
                                <span className="role-label">For QA Engineers</span>
                            </button>
                            <button 
                                className={`role-tab ${selectedRole === 'scrum' ? 'active' : ''}`}
                                onClick={() => setSelectedRole('scrum')}
                            >
                                <span className="role-icon">{roleContent.scrum.icon}</span>
                                <span className="role-label">For Scrum Masters</span>
                            </button>
                            <button 
                                className={`role-tab ${selectedRole === 'dev' ? 'active' : ''}`}
                                onClick={() => setSelectedRole('dev')}
                            >
                                <span className="role-icon">{roleContent.dev.icon}</span>
                                <span className="role-label">For Developers</span>
                            </button>
                        </div>

                        {/* Role-specific content */}
                        <div className="role-content">
                            <div className="role-header">
                                <div className="role-title-icon">{roleContent[selectedRole as keyof typeof roleContent].icon}</div>
                                <h2 className="role-title">{roleContent[selectedRole as keyof typeof roleContent].title}</h2>
                            </div>
                            <p className="role-description">
                                {roleContent[selectedRole as keyof typeof roleContent].description}
                            </p>
                        </div>

                        {/* Process flow visualization */}
                        <div className="process-flow-container">
                            <h2 className="section-title">How It Works</h2>
                            <div className="process-steps">
                                <div className="process-step">
                                    <div className="step-number">1</div>
                                    <div className="step-icon">📋</div>
                                    <h3 className="step-title">JIRA Story</h3>
                                    <p className="step-description">Enter your JIRA ticket ID to import the story details</p>
                                </div>
                                <div className="step-arrow">→</div>
                                <div className="process-step">
                                    <div className="step-number">2</div>
                                    <div className="step-icon">🧠</div>
                                    <h3 className="step-title">Smart Parsing</h3>
                                    <p className="step-description">TestGenie parses acceptance criteria and technical requirements</p>
                                </div>
                                <div className="step-arrow">→</div>
                                <div className="process-step">
                                    <div className="step-number">3</div>
                                    <div className="step-icon">✨</div>
                                    <h3 className="step-title">Test Generation</h3>
                                    <p className="step-description">Generates test scenarios in Karate framework format</p>
                                </div>
                                <div className="step-arrow">→</div>
                                <div className="process-step">
                                    <div className="step-number">4</div>
                                    <div className="step-icon">🚀</div>
                                    <h3 className="step-title">Ready to Run</h3>
                                    <p className="step-description">Download or directly integrate with your CI/CD pipeline</p>
                                </div>
                            </div>
                        </div>

                        <div className="section-container">
                            <h2 className="section-title">Key Features</h2>
                            <div className="features-container">
                                <div className="feature-card">
                                    <div className="feature-icon">🔥</div>
                                    <h3 className="feature-title">Generate Karate Tests</h3>
                                    <p className="feature-description">
                                        Automatically generate Karate test cases from JIRA stories. This feature
                                        simplifies the process of creating test cases by converting JIRA tickets into
                                        ready-to-use Karate test scripts.
                                    </p>
                                </div>

                                <div className="feature-card">
                                    <div className="feature-icon">🔄</div>
                                    <h3 className="feature-title">Multi-Test Support</h3>
                                    <p className="feature-description">
                                        Supports multiple test types such as API testing, integration testing, and
                                        Contract Testing. This ensures comprehensive test coverage for your
                                        application.
                                    </p>
                                </div>

                                <div className="feature-card">
                                    <div className="feature-icon">💡</div>
                                    <h3 className="feature-title">Real-Time Feedback</h3>
                                    <p className="feature-description">
                                        Get real-time feedback and results for your test cases. This feature helps
                                        you quickly identify issues and improve the quality of your tests.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {show && userData && (
                    <div className="results-container" ref={scrollRef}>
                        <ShowTable 
                            inputData={userData} 
                            setInputData={setUserData as React.Dispatch<React.SetStateAction<UserData>>} 
                        />
                    </div>
                )}
            </main>
        </div>
    );
};

export default Jira;