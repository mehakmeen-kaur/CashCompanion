const xlsx = require("xlsx");
const User=require("../models/User");
const Income=require("../models/Income");

//Add Income Source
exports.addIncome=async (req,res)=>{
    const userId=req.user.id;
    try{
        const {icon,source,amount,date}=req.body;

        //Validation : Cgeck for missing fields
        if(!source || !amount || !date){
            return res.status(400).json({message:"All fields are required"});
        }

        const newIncome=new Income({
            userId,
            icon,
            source,
            amount,
            date: new Date(date) // Ensure date is a Date object
        });

        await newIncome.save();
        res.status(200).json(newIncome);
    }catch(error){
        console.error(error);
        res.status(500).json({message:"Server Error"});

    }
}

//Get all Income Source
exports.getAllIncome=async (req,res)=>{
    const userId=req.user.id;
    try{
        const income=await Income.find({userId}).sort({date:-1});
        res.json(income);
    }catch(error){
        res.status(500).json({message:"Server Error"});
    }
};

//Delete Income Source
exports.deleteIncome=async (req,res)=>{
    try{
        await Income.findByIdAndDelete(req.params.id);
        res.status(200).json({message:"Income Source deleted successfully"});
        res.json({message:"Income deleted successfully"});
    }
    catch(error){
        res.status(500).json({message:"Server Error"});
    }
};

//Download Income Source as Excel
exports.downloadIncomeExcel=async (req,res)=>{
    const userId=req.user.id;
    try{
        const income=await Income.find({userId}).sort({date:-1});

        //Prepare data for Excel

        const data=income.map((item)=>({
            Source:item.source,
            Amount:item.amount,
            Date:item.date,
    }));
    const wb=xlsx.utils.book_new();
    const ws=xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(wb,ws,"Income");
    xlsx.writeFile(wb,"Income_details.xlsx");
    res.download("Income_details.xlsx");
    }catch(error){
        res.status(500).json({message:"Server Error"});
    }
};