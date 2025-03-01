const express = require("express");
const router = express.Router();
const { exec } = require("child_process");
const path = require("path");

// ✅ Correct script path
const scriptPath = "E:/multitransfer/graph/generate_graph.py";
console.log("Executing script at:", scriptPath);


router.get("/generate-graph", (req, res) => {
          exec(`python "E:/multitransfer/graph/generate_graph.py"`, (error, stdout, stderr) => {
        if (error) {
            console.error("Error generating graph:", error);
            return res.status(500).json({ error: "Graph generation failed" });
        }

        // ✅ Check script output
        const graphPath = stdout.trim();
        if (!graphPath || !graphPath.endsWith(".png")) {
            console.error("Invalid graph path:", graphPath);
            return res.status(500).json({ error: "Invalid graph file path" });
        }

        // ✅ Return correct graph URL
        res.json({ graphUrl: `http://localhost:5000/graph/graph.png` });
    });
});




module.exports = router;
