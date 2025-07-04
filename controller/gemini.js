const dotenv = require("dotenv")
dotenv.config()
const axios = require("axios")
const aidietplan = require("../model/aidietplan")
const gemnikey = process.env.Gemini_key
const aischedule = require("../model/aischedule")
const getSchedule = async (req, res) => {
  const { name, goal, level,height,weight, daysAvailable,duration,durationunit } = req.body;

  const prompt = `
Create a personalized 1-week gym workout schedule in pure JSON format.
Do not include any explanation or text — only output a JSON object.do not include any user information.
User: ${name}
Height:${height}
Wight:${weight}
Goal: ${goal}
Level: ${level}
Available days: ${daysAvailable}
validtime:${duration}${durationunit}
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
  const { name, goal, level, weight, height,duration,durationunit } = req.body;

  const prompt = `
Create a personalized diet plan in pure JSON format.
Only return JSON — no explanation or extra text.
Include a "user" object with the daily meal breakdowns (breakfast, lunch, dinner, snacks) for each day of the week.do not include user information.

User: ${name}
Goal: ${goal}
Weight: ${weight}
Height: ${height}
Level: ${level}
dietplanduration:${duration}
durationunit:${durationunit}
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
const adddietplandata = async(req,res) =>{
    const {duration,durationunit,dietplan,memberusername} = req.body  
    if(!duration || !durationunit ||!dietplan || !memberusername)
    {
      return res.status(400).json({message:"Missing fields"})
    }else
    {
        const matchdietplan = await aidietplan.findOne({memberusername})
        if(matchdietplan)
        {
            const nowdate = Date.now()
            var expiredate = null 
            if(matchdietplan.durationUnit=="day")
            {
                expiredate = matchdietplan.createddata.getTime() + matchdietplan.duration * 24 * 60 * 60 * 1000;
            }else if(matchdietplan.durationUnit=="week")
            {
                expiredate = matchdietplan.createddata.getTime() + matchdietplan.duration * 7 * 24 * 60 * 60 * 1000;
            }else if(matchdietplan.durationUnit=="month")
            {
                expiredate = new Date(matchdietplan.createddata);
                expiredate.setMonth(expiredate.getMonth() + matchdietplan.duration);
                expiredate = expiredate.getTime();
            }else if(matchdietplan.durationUnit=="year")
            {
                expiredate = new Date(matchdietplan.createddata);
                expiredate.setFullYear(expiredate.getFullYear() + matchdietplan.duration);
                expiredate = expiredate.getTime();
            }

            if (nowdate < expiredate)
               {
                 return res.status(400).json({ message: "Existing diet plan still active" });
                }
            
        }
        const newdietplan = new aidietplan({
          memberusername:memberusername,
          dietplan:dietplan,
          durationUnit:durationunit,
          duration:duration
        })
        try{
            newdietplan.save()
            return res.status(200).json({message:`Successfully send to the ${memberusername}`})
        }catch(error)
        {
            return res.status(400).json({message:error})
        }
    }
}
const addSchedule = async(req,res) =>{
  const {memberusername,duration,durationunit,schedule} = req.body
  if(!memberusername || !duration || !durationunit || !schedule)
  {
       return res.status(400).json({message:"Missing fields"})
  }else
  {
    const matchschedule = await aischedule.findOne({memberusername})
        if(matchschedule)
        {
            const nowdate = Date.now()
            var expiredate = null 
            if(matchschedule.durationUnit=="day")
            {
                expiredate = matchschedule.createddata.getTime() + matchschedule.duration * 24 * 60 * 60 * 1000;
            }else if(matchschedule.durationUnit=="week")
            {
                expiredate = matchschedule.createddata.getTime() + matchschedule.duration * 7 * 24 * 60 * 60 * 1000;
            }else if(matchschedule.durationUnit=="month")
            {
                expiredate = new Date(matchschedule.createddata);
                expiredate.setMonth(expiredate.getMonth() +matchschedule.duration);
                expiredate = expiredate.getTime();
            }else if(matchschedule.durationUnit=="year")
            {
                expiredate = new Date(matchschedule.createddata);
                expiredate.setFullYear(expiredate.getFullYear() + matchschedule.duration);
                expiredate = expiredate.getTime();
            }

            if (nowdate < expiredate)
               {
                 return res.status(400).json({ message: "Existing schedule plan still active" });
                }
            
        }
      const newschedule = new aischedule({
          memberusername:memberusername,
          schedule:schedule,
          durationUnit:durationunit,
          duration:duration
      })
      try{
          await newschedule.save()
          return res.status(200).json({message:`Successfully send to the ${memberusername}`})
      }catch(error)
      {
          return res.status(400).json({message:error})
      }
  }
}
module.exports = { getSchedule,getDietplan,adddietplandata,addSchedule};
