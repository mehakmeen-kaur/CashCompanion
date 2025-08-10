const Income=require("../models/Income");
const Expense=require("../models/Expense");
const {isValidObjectId, Types} = require("mongoose");

//Dashboard Data
exports.getDashboardData=async (req,res)=>{
    try{
        const userId=req.user.id;
        const userObjectId=new Types.ObjectId(String(userId));
        
        console.log("🔍 Dashboard API called for user:", userId);
        
        // Check if data exists first
        const incomeCount = await Income.countDocuments({ userId: userObjectId });
        const expenseCount = await Expense.countDocuments({ userId: userObjectId });
        
        console.log(`📊 Existing data - Income records: ${incomeCount}, Expense records: ${expenseCount}`);
        
        // If no data exists, create sample data
        if (incomeCount === 0 && expenseCount === 0) {
            console.log("📝 Creating sample data...");
            
            // Create sample income records
            await Income.create([
                {
                    userId: userObjectId,
                    source: "Salary",
                    amount: 5000,
                    date: new Date(),
                    icon: ""
                },
                {
                    userId: userObjectId,
                    source: "Freelance",
                    amount: 1200,
                    date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
                    icon: ""
                }
            ]);
            
            // Create sample expense records
            await Expense.create([
                {
                    userId: userObjectId,
                    category: "Groceries", 
                    amount: 300,
                    date: new Date(),
                    icon: ""
                },
                {
                    userId: userObjectId,
                    category: "Rent",
                    amount: 1500,
                    date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
                    icon: ""
                }
            ]);
            
            console.log("✅ Sample data created successfully!");
        }

        //Fetch total income and expenses
        const totalIncome=await Income.aggregate([
            { $match: { userId: userObjectId } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        
        const totalExpense=await Expense.aggregate([
            { $match: { userId: userObjectId } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);

        console.log("🧮 Aggregation results:", {
            totalIncomeResult: totalIncome,
            totalExpenseResult: totalExpense
        });

        //Get income transactions in the last 60 days
        const last60DaysIncomeTransactions=await Income.find({
            userId:userObjectId,
            date: { $gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) },
        }).sort({ date: -1 });

        //Get total income for last 60 days
        const incomeLast60Days=last60DaysIncomeTransactions.reduce(
            (sum, transaction) => sum + transaction.amount,
            0
        );

        //Get expense transactions in the last 30 days
        const last30DaysExpenseTransactions=await Expense.find({
            userId:userObjectId,
            date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        }).sort({ date: -1 });

        //Get total expense for last 30 days
        const expensesLast30Days=last30DaysExpenseTransactions.reduce(
            (sum, transaction) => sum + transaction.amount,
            0
        );

        //Fetch last 5 transactions (income+expense)
        const lastTransactions=[
            ...(await Income.find({userId:userObjectId}).sort({date:-1}).limit(5)).map(
                (txn)=>({
                    ...txn.toObject(),
                    type:"income",
                })
            ),
            ...(await Expense.find({userId:userObjectId}).sort({date:-1}).limit(5)).map(
                (txn)=>({
                    ...txn.toObject(),
                    type:"expense",
                })
            ),
        ].sort((a,b)=>new Date(b.date)-new Date(a.date));  //Sort latest first

        // Calculate final totals
        const finalTotalIncome = totalIncome[0]?.total || 0;
        const finalTotalExpense = totalExpense[0]?.total || 0;
        const finalTotalBalance = finalTotalIncome - finalTotalExpense;

        console.log("💰 Final calculations:", {
            totalIncome: finalTotalIncome,
            totalExpense: finalTotalExpense,
            totalBalance: finalTotalBalance,
            recentTransactionsCount: lastTransactions.length
        });

        //Final response
        res.json({
            totalBalance: finalTotalBalance,
            totalIncome: finalTotalIncome,
            totalExpense: finalTotalExpense,
            last30DaysExpenses:{
                total:expensesLast30Days,
                transactions:last30DaysExpenseTransactions,
            },
            last60DaysIncome:{
                total:incomeLast60Days,
                transactions:last60DaysIncomeTransactions,
            },
            recentTransactions:lastTransactions,
        });   
    } catch (error) {
        console.error("❌ Dashboard API Error:", error);
        res.status(500).json({message:"Server Error", error: error.message});
    }
}