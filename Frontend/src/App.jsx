import { useState, useEffect } from "react";
import axios from "axios";
const App = () => {
  const [engagementData, setEngagementData] = useState({});
  const [markdownInsights, setMarkdownInsights] = useState("");
  const [input, setInput] = useState("");
  const [darkMode, setDarkMode] = useState(false); // State for dark mode
  const [loading, setLoading] = useState(false); // State for loading
  const [loadingMessage, setLoadingMessage] = useState("Analyzing...");
  const [parseSuccess, setParseSuccess] = useState(false);
  const [error, setError] = useState(null);

  const loadingMessages = [
    "🔍 FullStackForce is Analyzing...",
    "🤔 Gathering data...",
    "📊 Generating insights...",
    "✨ Almost there...",
    "🚀 Final",
    "🎉 Done!",
    "🔥 Just lil more :)",
    
  ];
  useEffect(() => {
    let messageIndex = 0;
    if (loading) {
      const interval = setInterval(() => {
        setLoadingMessage(loadingMessages[messageIndex]);
        messageIndex = (messageIndex + 1) % loadingMessages.length;
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [loading]);

  useEffect(() => {
    // Check if the browser supports dark mode
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      setDarkMode(true);
    }

    //health check
    axios
      .get(`${import.meta.env.VITE_APP_BACKEND_URL}/health`)
      .then((response) => {
        console.log("Health check response:", response.data);
      })
      .catch((error) => {
        console.error("Health check error:", error);
      });
  }, []);

  const handleInputChange = (event) => {
    setInput(event.target.value);
  };

  const handleFormSubmit = (event) => {
    if (!input) {
      alert("Please enter a keyword (Post Types) to analyze");
      return;
    }
    event.preventDefault();
    setLoading(true);
    console.log(input);
    // Fetch data and insights from Python backend
    axios
    .post(`${import.meta.env.VITE_APP_BACKEND_URL}/runFlow`, { inputValue: input })
    .then((response) => {
      try {
        console.log(response); // Log full response for debugging
  
        // Extract the response message
        const jsonString = response.data?.message;
  
        // Initialize variables for parsed data
        let mainString = "";
        let parsedData = {};
  
        try {
          // Split and extract the JSON part from the string
          mainString = jsonString.split("```json")[1].split("```")[0];
  
          // Parse the JSON string into an object
          parsedData = JSON.parse(mainString);
  
          setParseSuccess(true); // Indicate successful parsing
        } catch (parseError) {
          console.error("Error parsing response JSON:", parseError);
  
          // Fall back to using the raw JSON string
          mainString = jsonString;
          setError(mainString);
          setParseSuccess(false);
        }
  
        // Set state with parsed data
        setEngagementData(parsedData[0]?.engagement_metrics || {}); // Ensure fallback if engagement_metrics is undefined
        setMarkdownInsights(parsedData[0]?.insights || ""); // Ensure fallback if insights is undefined
      } catch (error) {
        console.error("Unexpected error while processing response:", error);
      } finally {
        setLoading(false); // Stop loading in all cases
      }
    })
    .catch((error) => {
      setLoading(false); // Stop loading on request failure
      console.error("Error fetching data:", error);
      alert("Error fetching data. Please try again later. " + error.message);
    });
  };  

  return (
    <div
      className={
        darkMode ? "dark bg-gray-900 text-white" : "bg-white text-black"
      }
    >
      <div className="container mx-auto p-6">
        {/* Theme Toggle Switch */}
        <div className="flex justify-end mb-4">
          <button
            className="py-2 px-4 rounded-lg font-bold border focus:outline-none"
            onClick={() => setDarkMode(!darkMode)}
            style={{
              backgroundColor: darkMode ? "white" : "black",
              color: darkMode ? "black" : "white",
            }}
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        <input
          className={`w-full border p-2 mb-4 ${darkMode ? "bg-gray-800 text-white" : "bg-gray-100"}`}
          type="text"
          placeholder="Enter a keyword (Post Types) Here..."
          onChange={handleInputChange}
          disabled={loading}
        />
        <p className="text-sm text-gray-500 mb-4">
          &bull; Available Post Types: <b> carousel, reels, static_image,image,video,text, & text_post</b>
        </p>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mx-auto w-full"
          onClick={handleFormSubmit}
          disabled={loading}
        >
          Submit ---&gt;
        </button>

        
    </div>
    </div>
  );
};

export default App;

