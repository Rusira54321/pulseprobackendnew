const memberModel = require("../model/member")
const attendanceModel = require("../model/Attendance")
const addAttendance = async(req,res) =>{
    const {id,name,username,attendance,key} = req.body
    if(!id || !name ||  !username || !attendance || !key)
    {
        return res.status(400).json({message:"Missing fields"})
    }
    const member = await memberModel.findById(id)
    const attendancedata = await attendanceModel.find({userID:id})
    var i 
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months start from 0
    const year = today.getFullYear();
    const customFormat = `${day}-${month}-${year}`;
    if(attendancedata)
    {
        for(i=0;i<attendancedata.length;i++)
        {
            if(attendancedata[i].date==customFormat)
            {
                return res.status(400).json({message:"Cannot add attendance"})
            }
        }
    }
    
    const newAttendance = new attendanceModel({
        userID:id,
        Membername:name,
        Username:username,
        Attendance_Status:attendance,
        date:customFormat,
        gym:key
    })
    await newAttendance.save().then(async()=>{
        member.attendance = attendance
        member.attendancedate = customFormat
        await member.save()
        return res.status(201).json({message:"Attendance successfully added"})
    })
}
const getAttendance = async(req,res) =>{
    const {day,key} = req.body
    const attendancessss= []
    const attendeces = await attendanceModel.find({date:day})
    for(const attendance of attendeces)
    {
        if(attendance.gym==key)
        {
            attendancessss.push(attendance)
        }
    }
    if(attendancessss.length ==0)
    {
        return res.status(400).json({message:"No attendences"})
    }
    else{
        return res.status(200).json({Attendance:attendancessss})
    }
}
const getmonthlyattendance = async(req,res) =>{
  const {key} = req.body;
  try {
    const result = await attendanceModel.aggregate([
      {
        $match: { gym: key }
      },
      {
        $addFields: {
          month: {
            $substr: ["$date", 3, 2] // Extract "MM" from "DD-MM-YYYY"
          },
          year: {
            $substr: ["$date", 6, 4] // Extract "YYYY" from "DD-MM-YYYY"
          }
        }
      },
      {
        $group: {
          _id: {
            month: "$month",
            year: "$year",
            status: "$Attendance_Status"
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1
        }
      }
    ]);

    // Format response into usable structure
    const monthsMap = {
      "01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr", "05": "May", "06": "Jun",
      "07": "Jul", "08": "Aug", "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dec"
    };

    const dataMap = {};

    for (const item of result) {
      const monthKey = `${monthsMap[item._id.month]}-${item._id.year}`;
      if (!dataMap[monthKey]) {
        dataMap[monthKey] = { Present: 0, Absent: 0, Sick: 0, Leave: 0, null: 0 };
      }
      const status = item._id.status === null ? "null" : item._id.status;
      dataMap[monthKey][status] = item.count;
    }

    const chartLabels = Object.keys(dataMap);
    const statuses = ["Present", "Absent", "Sick", "Leave", "null"];

    const datasets = statuses.map(status => ({
      label: status,
      data: chartLabels.map(month => dataMap[month][status] || 0),
      backgroundColor: {
        Present: "#4caf50",
        Absent: "#f44336",
        Sick: "#ff9800",
        Leave: "#2196f3",
        null: "#9e9e9e"
      }[status]
    }));

    res.json({ labels: chartLabels, datasets });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: err.message });
  }
}
module.exports = {addAttendance,getAttendance,getmonthlyattendance}