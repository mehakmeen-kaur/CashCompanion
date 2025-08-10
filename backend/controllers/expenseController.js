const xlsx = require("xlsx");
const User=require("../models/User");
const Expense=require("../models/Expense");

//Add Expense Source
exports.addExpense=async (req,res)=>{
    const userId=req.user.id;
    try{
        const {icon,category,amount,date}=req.body;

        //Validation : Cgeck for missing fields
        if(!category || !amount || !date){
            return res.status(400).json({message:"All fields are required"});
        }

        const newExpense=new Expense({
            userId,
            icon,
            category,
            amount,
            date: new Date(date) // Ensure date is a Date object
        });

        await newExpense.save();
        res.status(200).json(newExpense);
    }catch(error){
        console.error(error);
        res.status(500).json({message:"Server Error"});

    }
}

//Get all Expense Source
exports.getAllExpense=async (req,res)=>{
    const userId=req.user.id;
    try{
        const expense=await Expense.find({userId}).sort({date:-1});
        res.json(expense);
    }catch(error){
        res.status(500).json({message:"Server Error"});
    }
};

//Delete Expense Source
exports.deleteExpense=async (req,res)=>{
    try{
        await Expense.findByIdAndDelete(req.params.id);
        // res.status(200).json({message:"Expense Source deleted successfully"});
        res.json({message:"Expense deleted successfully"});
    }
    catch(error){
        res.status(500).json({message:"Server Error"});
    }
};

//Download Expense Source as Excel
exports.downloadExpenseExcel=async (req,res)=>{
    const userId=req.user.id;
    try{
        const expense=await Expense.find({userId}).sort({date:-1});

        //Prepare data for Excel

        const data=expense.map((item)=>({
            category:item.category,
            Amount:item.amount,
            Date:item.date,
    }));
    const wb=xlsx.utils.book_new();
    const ws=xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(wb,ws,"Expense");
    xlsx.writeFile(wb,"Expense_details.xlsx");
    res.download("Expense_details.xlsx");
    }catch(error){
        res.status(500).json({message:"Server Error"});
    }
};