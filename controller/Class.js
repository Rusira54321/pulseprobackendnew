const classes = require("../model/Class")
const members = require("../model/member")
const addClass = async (req, res) => {
  const { memberUsername, trainerusername, classname, date, newstartTime, newendTime, Description } = req.body;
  if (!memberUsername || !trainerusername || !classname || !date || !newstartTime || !newendTime || !Description) {
    return res.status(400).json({ message: "Missing fields" });
  }

  // Normalize input date
  const dateStr = new Date(date).toISOString().split('T')[0];
  const newStart = new Date(`1970-01-01T${newstartTime}:00Z`);
  const newEnd = new Date(`1970-01-01T${newendTime}:00Z`);

  for (const member of memberUsername) {
    const matchmembers = await classes.find({ memberUsername: member });

    for (const m of matchmembers) {
      const existingDateStr = new Date(m.date).toISOString().split('T')[0];

      if (dateStr === existingDateStr) {
        const starttime = new Date(`1970-01-01T${m.startTime}:00Z`);
        const endtime = new Date(`1970-01-01T${m.endTime}:00Z`);

        if (newStart < endtime && newEnd > starttime) {
          return res.status(400).json({ message: "Cannot create class because the members have another class in this time" });
        }
      }
    }
  }

  const newclass = new classes({
    memberUsername,
    trainerusername,
    classname,
    date,
    startTime: newstartTime,
    endTime: newendTime,
    Description
  });

  try {
    await newclass.save();
    return res.status(201).json({ message: "Class added successfully" });
  } catch (error) {
    return res.status(400).json({ message: "Class adding unsuccessful", error: error.message });
  }
};
const getClasses = async(req,res) =>{
  const {trainerusername} = req.body
  const classess = await classes.find({trainerusername})
  if(classess)
  {
    return res.status(200).json({classes:classess})
  }
}
const getmembersdata = async(req,res) =>{
    const {id} = req.params
    const matchclass = await classes.findById(id)
    const membersss = []
    if(matchclass)
    {
      const memberss = matchclass.memberUsername
      for(const member of memberss)
      {
        const memberdata = await members.findOne({username:member})
        if(memberdata)
        {
          membersss.push(memberdata)
        }
      }
      return res.status(200).json({members:membersss})
    }
}
const deleteClass = async(req,res) =>{
  const {id} = req.params
  await classes.findByIdAndDelete(id).then(()=>{
    return res.status(200).json({message:"Class deleted successfully"})
}).catch((error)=>{
    return res.status(400).json({message:"Class deletion unsuccessful",error:error.message})
})
}
const getClassess = async(req,res) =>{
  const {memberUsername} = req.body
  const matchclass = await classes.find({memberUsername})
  if(matchclass.length!=0)
  {
    return res.status(200).json({classesss:matchclass})
  }
}
module.exports = {addClass,getClasses,getmembersdata,deleteClass,getClassess}