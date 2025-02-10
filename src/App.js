import React, { useState, useEffect } from "react";
// import "./App.css"; 
import "./Dark.css";

const API_URL = "http://localhost:8000"; 
const GITHUB_BASE_URL = "https://github.com/shiv-01"; 

function App() {
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState("");
  const [issues, setIssues] = useState([]);

  // Fetch the list of repositories
  useEffect(() => {
    fetch(`${API_URL}/repos`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch repositories");
        }
        return res.json();
      })
      .then((data) => {
        console.log("Fetched repos:", data.repos); // Debugging log
        if (data.repos && Array.isArray(data.repos)) {
          setRepos(data.repos);
        } else {
          console.error("Invalid repo data format:", data);
          setRepos([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching repos:", err);
        setRepos([]); // Ensure UI handles errors gracefully
      });
  }, []);
  

  // Fetch scan results for the selected repo
  const fetchRepoIssues = (repo) => {
    fetch(`${API_URL}/results/${repo}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.results) {
          setIssues(data.results);
        }
      })
      .catch((err) => console.error("Error fetching scan results:", err));
  };

  // Generate file link to open specific line in GitHub or local VS Code
  const getFileLink = (filePath, lineNumber) => {
    if (filePath.startsWith("repos")) {
      // Extract repo name and file name
      const githubFilePath = filePath.replace("repos/", "");
      let parts = githubFilePath.split("/");
      let repoName = parts[0]; // Repo name
      let filePathInRepo = parts.slice(1).join("/"); // Remaining path
  
      // Return GitHub link with line highlight
      return `${GITHUB_BASE_URL}/${repoName}/blob/main/${filePathInRepo}#L${lineNumber}`;
    }
  };
  

  return (
    <div className="container">
      <h1 className="title">Semgrep Scan Results</h1>

      {/* Repo Selection Dropdown */}
      <div className="dropdown-container">
        <label>Select a Repository:</label>
        <select
          className="dropdown"
          onChange={(e) => {
            setSelectedRepo(e.target.value);
            fetchRepoIssues(e.target.value);
          }}
          value={selectedRepo}
        >
          <option value="">-- Choose a repo --</option>
          {repos.map((repo, index) => (
            <option key={index} value={repo}>
              {repo}
            </option>
          ))}
        </select>
      </div>

      {/* Issues Table */}
      {selectedRepo && (
        <div className="table-container">
          <h2 className="table-title">Issues for {selectedRepo}</h2>

          {issues.length === 0 ? (
            <p className="no-issues">No issues found for this repository.</p>
          ) : (
            <table className="issues-table">
              <thead>
                <tr>
                  <th>Line No</th>
                  <th>Message</th>
                  <th>File Path</th>
                  <th>View File</th>
                </tr>
              </thead>
              <tbody>
                {issues.map((issue, index) => (
                  <tr key={index}>
                    <td>{issue.start.line}</td>
                    <td>{issue.extra.message}</td>
                    <td>{issue.path}</td>
                    <td>
                      <a
                        href={getFileLink(issue.path, issue.start.line)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open File
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
