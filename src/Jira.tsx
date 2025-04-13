import React, { useEffect, useRef, useState, FormEvent } from "react";
import ShowTable from "./ShowTable";

interface FileSaveLocation {
  requestFileSaveLocation: string;
  headerFileSaveLocation: string;
}

// Updated Background interface to match ShowTable.tsx
interface Background {
  base_url: string;
  header: string;  // Changed from 'headers' to 'header'
  annotations: string[];
  config: string[];  // Changed from string | string[] to string[] only
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

// Modified mock response data to match the updated interface
const mockResponseData: UserData = {
  file_save_location: {
    requestFileSaveLocation: "bdd/test/resources/features/requests",
    headerFileSaveLocation: "bdd/test/resources/features/headers"
  },
  file_name: "abid.feature",
  background: {
    base_url: "https:///abidahmed/junaidamed",
    header: "bdd/test/resources/features/headers//header.json", // Changed from 'headers' to 'header'
    annotations: ["@requestvalidationtag", "@smoke", "@sitTest"],
    config: ["This story will be converted to karate"], // Changed to array
    additional_instructions: ["This story will be converted to karate"]
  },
  scenarios: [
    {
      endPoint: "v1/",
      request: "scenario1.json",
      method: "POST",
      statuscode: 404,
      additional_instructions: ["This story will be converted to karate"]
    },
    {
      endPoint: "v1/",
      request: "bscenario2.json",
      method: "POST",
      statuscode: 404,
      additional_instructions: ["This story will be converted to karate"]
    },
    {
      endPoint: "v1/",
      request: "scenario3.json",
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
            // Use the pre-defined mockResponseData to avoid type issues
            setUserData(mockResponseData);
            setShow(true);
        } catch (error) {
            console.error("Error with mock data:", error);
        }
    };

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                background: "linear-gradient(to bottom right, #f7fafc, #d1d5db)",
                minHeight: "100vh",
                width: "100%",
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                overflowX: "auto"
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    paddingTop: "2.5rem",
                    width: "100%"
                }}
            >
                <form
                    onSubmit={handleSubmit}
                    style={{
                        backgroundColor: "white",
                        borderRadius: "9999px",
                        boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1)",
                        border: "2px solid #facc15",
                        padding: "0.5rem 1rem",
                        width: "24rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        transition: "all 0.3s ease-in-out"
                    }}
                    onMouseEnter={(e) => {
                        (e.currentTarget.style.boxShadow = "0 20px 25px rgba(0, 0, 0, 0.15)");
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget.style.boxShadow = "0 10px 15px rgba(0, 0, 0, 0.1)");
                    }}
                >
                    <input
                        type="text"
                        id="jira"
                        name="jira"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="🔍 Search Jira Ticket ID..."
                        required
                        style={{
                            flex: 1,
                            backgroundColor: "transparent",
                            outline: "none",
                            padding: "0.5rem 1rem",
                            color: "#1f2937",
                            border: "none",
                            fontSize: "1rem",
                            fontFamily: "inherit"
                        }}
                    />
                    <button
                        type="submit"
                        style={{
                            background: "linear-gradient(to right, #facc15, #ef4444)",
                            color: "white",
                            fontWeight: "bold",
                            padding: "0.5rem 1.25rem",
                            borderRadius: "9999px",
                            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                            border: "none",
                            cursor: "pointer",
                            transition: "all 0.3s ease-in-out",
                            transform: "scale(1)"
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "linear-gradient(to right, #fde047, #b91c1c)";
                            e.currentTarget.style.transform = "scale(1.1)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "linear-gradient(to right, #facc15, #ef4444)";
                            e.currentTarget.style.transform = "scale(1)";
                        }}
                    >
                        🚀
                    </button>
                </form>
            </div>

            {show && userData && (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "flex-start",
                        marginTop: "6rem",
                        width: "100%"
                    }}
                    ref={scrollRef}
                >
                    <ShowTable 
                        inputData={userData} 
                        setInputData={setUserData as React.Dispatch<React.SetStateAction<UserData>>} 
                    />
                </div>
            )}
        </div>
    );
};

export default Jira;