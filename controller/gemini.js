const dotenv = require("dotenv")
dotenv.config()
const axios = require("axios")

const gemnikey = process.env.Gemini_key

const getSchedule = async (req, res) => {
  const { name, goal, level,height,weight, daysAvailable } = req.body;

  const prompt = `
Create a personalized 1-week gym workout schedule in pure JSON format.
Do not include any explanation or text — only output a JSON object.do not include any user information.
User: ${name}
Height:${height}
Wight:${weight}
Goal: ${goal}
Level: ${level}
Available days: ${daysAvailable}

Format:
{
  "Monday": {
    "Title": "...",
    "exercises": [ ... ]
  },
  ...
}
`;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${gemnikey}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
      }
    );

    const rawText = response.data.candidates[0].content.parts[0].text;

// Use RegExp to extract the JSON block from the response
const match = rawText.match(/\{[\s\S]*\}/); // Matches the first {...} block

if (match) {
  const scheduleJson = JSON.parse(match[0]);
  res.json({ schedule: scheduleJson });
} else {
  throw new Error("No valid JSON object found in response");
}
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Failed to generate schedule" });
  }
};

const getDietplan = async (req, res) => {
  const { name, goal, level, weight, height } = req.body;

  const prompt = `
Create a personalized diet plan in pure JSON format.
Only return JSON — no explanation or extra text.
Include a "user" object with the daily meal breakdowns (breakfast, lunch, dinner, snacks) for each day of the week.do not include user information.

User: ${name}
Goal: ${goal}
Weight: ${weight}
Height: ${height}
Level: ${level}

Format:
{
  
  "Monday": {
    "breakfast": { ... },
    "lunch": { ... },
    "dinner": { ... },
    "snacks": [ ... ],
    "total_calories": 0,
    ...
  },
  ...
}
`;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${gemnikey}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
      }
    );

    const rawText = response.data.candidates[0].content.parts[0].text;

    const match = rawText.match(/\{[\s\S]*\}/); // Extract full JSON block
    if (match) {
      const fullJson = JSON.parse(match[0]);
      res.json({ schedule: fullJson }); // send full JSON
    } else {
      throw new Error("No valid JSON object found in response");
    }
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Failed to generate diet plan" });
  }
};

module.exports = { getSchedule,getDietplan};
