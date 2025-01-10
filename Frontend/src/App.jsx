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
    "🔍 CodeAstra is Analyzing...",
    "🤔 Gathering data...",
    "📊 Generating insights...",
    "✨ Almost there...",
    "🚀 Final",
    "🎉 Done!",
    "🔥 Just a little more :)",
  ];

  useEffect(() => {
    let messageIndex = 0;
    if (loading) {
      const interval = setInterval(() => {
        setLoadingMessage(loadingMessages[messageIndex]);
        messageIndex = (messageIndex + 1) % loadingMessages.length;
      }, 1500);
      return () => clearInterval(interval); // Cleanup
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

    // Health check
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
            mainString = jsonString.split("json")[1].split("")[0];

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

  // Extract data for charts
  const labels = Object.keys(engagementData); // post types: 'carousel', 'reels', 'static_image'
  const likesData = labels.map((label) => engagementData[label].avg_likes);
  const sharesData = labels.map((label) => engagementData[label].avg_shares);
  const commentsData = labels.map(
    (label) => engagementData[label].avg_comments
  );

  // Bar Chart Data
  const barData = {
    labels: labels,
    datasets: [
      {
        label: "Average Likes",
        data: likesData,
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
      {
        label: "Average Shares",
        data: sharesData,
        backgroundColor: "rgba(153, 102, 255, 0.2)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 1,
      },
      {
        label: "Average Comments",
        data: commentsData,
        backgroundColor: "rgba(255, 159, 64, 0.2)",
        borderColor: "rgba(255, 159, 64, 1)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div
      className={darkMode ? "dark bg-gray-900 text-white" : "bg-white text-black"}
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
          &bull; Available Post Types: <b> carousel, reels, static_image, image, video, text, & text_post</b>
        </p>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mx-auto w-full"
          onClick={handleFormSubmit}
          disabled={loading}
        >
          Submit ---&gt;
        </button>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-screen">
            <div className="flex space-x-1 mb-4">
              <div className="w-2 h-6 bg-blue-500 animate-pulse"></div>
              <div className="w-2 h-6 bg-blue-500 animate-pulse delay-75"></div>
              <div className="w-2 h-6 bg-blue-500 animate-pulse delay-150"></div>
            </div>
            <p className="text-xl font-semibold text-white">{loadingMessage}</p>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-center">
              Social Media Engagement Analysis Report  <br />Using LangFlow and DataStax Astra DB!!!
            </h1>
            <h2 className="text-2xl text-center mb-8">
              (Pre-Hackathon Assignment by Team- <b> CodeAstra🔥🧑🏻‍💻</b>)
            </h2>
            {parseSuccess && Object.keys(engagementData).length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8">
                  {/* Bar Chart */}
                  <div className={` ${darkMode ? "bg-gray-800 text-white" : "bg-gray-100"} shadow-md rounded-lg p-6`}>
                    <h2 className="text-xl font-semibold mb-4 text-center">
                      Bar Chart
                    </h2>
                    <Bar data={barData} style={{ color: darkMode ? "white" : "black" }} />
                  </div>
                  {/* Radar Chart */}
                  <div className={` ${darkMode ? "bg-gray-800 text-white" : "bg-gray-100"} shadow-md rounded-lg p-6`}>
                    <h2 className="text-xl font-semibold mb-4 text-center">
                      Radar Chart
                    </h2>
                    <Radar data={barData} />
                  </div>

                  {/* Pie Chart */}

                  <div className={` ${darkMode ? "bg-gray-800 text-white" : "bg-gray-100"} shadow-md rounded-lg p-6`}>
                    <h2 className="text-xl font-semibold mb-4 text-center">
                      Pie Chart (Likes)
                    </h2>
                    <Pie
                      data={{
                        labels: labels,
                        datasets: [
                          {
                            label: "Engagement Distribution (Likes)",
                            data: likesData,
                            backgroundColor: [
                              "rgba(75, 192, 192, 0.2)",
                              "rgba(153, 102, 255, 0.2)",
                              "rgba(255, 159, 64, 0.2)",
                            ],
                            borderColor: [
                              "rgba(75, 192, 192, 1)",
                              "rgba(153, 102, 255, 1)",
                              "rgba(255, 159, 64, 1)",
                            ],
                            borderWidth: 1,
                          },
                        ],
                      }}
                    />
                  </div>
                  {/* Pie Chart */}
                  <div className={` ${darkMode ? "bg-gray-800 text-white" : "bg-gray-100"} shadow-md rounded-lg p-6`}>
                    <h2 className="text-xl font-semibold mb-4 text-center">
                      Pie Chart (Comments)
                    </h2>
                    <Pie
                      data={{
                        labels: labels,
                        datasets: [
                          {
                            label: "Engagement Distribution (Comments)",
                            data: commentsData,
                            backgroundColor: [
                              "rgba(75, 192, 192, 0.2)",
                              "rgba(153, 102, 255, 0.2)",
                              "rgba(255, 159, 64, 0.2)",
                            ],
                            borderColor: [
                              "rgba(75, 192, 192, 1)",
                              "rgba(153, 102, 255, 1)",
                              "rgba(255, 159, 64, 1)",
                            ],
                            borderWidth: 1,
                          },
                        ],
                      }}
                    />
                  </div>
                  {/* Pie Chart */}
                  <div className={` ${darkMode ? "bg-gray-800 text-white" : "bg-gray-100"} shadow-md rounded-lg p-6`}>
                    <h2 className="text-xl font-semibold mb-4 text-center">
                      Pie Chart (Shares)
                    </h2>
                    <Pie
                      data={{
                        labels: labels,
                        datasets: [
                          {
                            label: "Engagement Distribution (Shares)",
                            data: sharesData,
                            backgroundColor: [
                              "rgba(75, 192, 192, 0.2)",
                              "rgba(153, 102, 255, 0.2)",
                              "rgba(255, 159, 64, 0.2)",
                            ],
                            borderColor: [
                              "rgba(75, 192, 192, 1)",
                              "rgba(153, 102, 255, 1)",
                              "rgba(255, 159, 64, 1)",
                            ],
                            borderWidth: 1,
                          },
                        ],
                      }}
                    />
                  </div>

                  {/* Line Chart */}
                  <div className={` ${darkMode ? "bg-gray-800 text-white" : "bg-gray-100"} shadow-md rounded-lg p-6  md:col-span-2 xl:col-span-2`}>
                    <h2 className="text-xl font-semibold mb-4 text-center">
                      Line Chart
                    </h2>
                    <Line data={barData} />
                  </div>
                </div>

                {/* Insights Section */}
                <div className={` ${darkMode ? "bg-gray-800 text-white" : "bg-gray-100"} shadow-md rounded-lg p-6 mt-8 w-5/6 mx-auto`}>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold mb-4 text-center font-mono">
                    Insights (By LangFlow + Gemini✨)
                  </h2>
                  <Markdown className="prose font-serif text-lg md:text-xl lg:text-2xl">{markdownInsights}</Markdown>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-semibold mb-4 text-center">Please Enter a Valid Keyword to Display Analytics...</h2>
                <div className={` ${darkMode ? "bg-gray-800 text-white" : "bg-gray-100"} shadow-md rounded-lg p-6`}>
                  <p className="text-lg font-semibold text-white">
                    Server Response: <b>  {error}</b>
                  </p>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default App;