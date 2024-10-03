import User from "../models/userModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/createToken.js";
import connectDB from "../config/db.js";


export const createUser = asyncHandler(async (req, res) => {
	const { username, email, password } = req.body;

	if (!username || !email || !password) {
		throw new Error("Please fill all the fields");
	}

	const userExists = await User.findOne({ email });

	if (userExists) {
		res.status(400).send("User already exists");
        return
	}

	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(password, salt);

	const newUser = await User({ username, email, password: hashedPassword });

	try {
		await newUser.save();
		generateToken(res, newUser._id);
		res
			.status(201)
			.json({
				_id: newUser._id,
				username: newUser.username,
				email: newUser.email,
				isAdmin: newUser.isAdmin,
			});
	} catch (error) {
		res.status(400);
		throw new Error("Invalid User data");
	}
});


export const loginUser = async (req, res) => {
	const { email, password } = req.body;

	const existingUser = await User.findOne({ email });

	if (existingUser) {
		const isPasswordValid = await bcrypt.compare(
			password,
			existingUser.password
		);

		if (isPasswordValid) {
			generateToken(res, existingUser._id);

            res
			.status(201)
			.json({
				_id: existingUser._id,
				username: existingUser.username,
				email: existingUser.email,
				isAdmin: existingUser.isAdmin,
			});
            return
		}

	}

    res.status(401).send("Incorrect email or password!")
    
};


export const logoutUser = async (req,res)=>{

    res.cookie("jwt"," ",{
        http:true,
        expires: new Date(0)
    })

    res.status(200).json({message:"Logged out successfully"})
}


export const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}) 
    res.json(users)
})


export const getUser = asyncHandler(async (req,res)=>{
    const user = await User.findById(req.user._id)

    if (user){
        res.json({
            _id:user._id,
            username:user.username,
            email:user.email
        }) 
    }else{
        res.status(404)
        throw new Error("User not found")
    }
})


export const updateUser = asyncHandler(async (req,res)=>{
    const user = await User.findById(req.user._id)

    if (user){
        user.username = req.body.username || user.username
        user.email = req.body.email || user.email

        if(req.body.password){
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);
            user.password = hashedPassword
        }

        const updatedUser  = await user.save()

        res.status(201).json({
            username:updatedUser.username,
            email:updatedUser.email
        })
    }
    else{
        res.status(404)
        throw new Error("User not found")
    }


})


export const deleteUserById = asyncHandler (async (req,res)=>{
	const user  = await User.findById(req.params.id)

	if(user){
		if (user.isAdmin){
			return res.status(400).send("You cannot delete an admin")	
		}

		await User.deleteOne({_id:user._id})
		res.status(200).send("User deleted successfully")

	}
	else{
		res.status(404).send("User not found")
	}
})


export const getUserById = asyncHandler (async (req,res)=>{

	const user  = await User.findById(req.params.id).select("-password")

	if (user){
		res.status(202).json(user)
	}
	else{
		res.status(404).send("User not found")
	}
})


export const updateUserById = asyncHandler (async (req,res)=>{

	const user = await User.findById(req.params.id)
	console.log(user)
	if (user){
		user.username = req.body.username || user.username
		user.email = req.body.email || user.email
		user.isAdmin = Boolean(req.body.isAdmin) || user.isAdmin

		if(req.body.password){
			const salt = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash(req.body.password,salt)
			user.password = hashedPassword	
		}

		const updatedUser = await user.save()
		res.status(200).json({
			username:updatedUser.username,
			email:updatedUser.email,
			isAdmin:updatedUser.isAdmin
		})
	}
	else{
		res.status(404).send("User not found")
	}
})