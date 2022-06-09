import Users from "../models/User_Model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Cek data user
export const getUsers = async (req, res) =>{
    try {
        const users = await Users.findAll({
            attributes:['id','name', 'email', 'refresh_token']
        });
        res.json(users)
    } catch (error) {
        console.error(error);
    }
}

// register akun login
export const Register = async (req, res) =>{
    const { name, email, password, confPassword} = req.body;
    //jik password tidak sama
    if( password !== confPassword){
        return res.status(400).json({msg: "Password dan Confirm Password Tidak Cocok!"});
    }
    // Jika password cocok
    const salt = await bcrypt.genSalt();
    const hashPass = await bcrypt.hash(password, salt);
    try {
        //simpan ke database
        await Users.create({
            name: name,
            email: email,
            password: hashPass
        });
        res.json({msg: "Register Berhasil"});
    } catch (error) {
        console.log(error);        
    }
}

// akses login
export const Login = async (req, res) =>{
    try {
        //cek email
        const user = await Users.findAll({
            where: {
             email:   req.body.email
            }
        });
        // cek password
        const match = await bcrypt.compare(req.body.password, user[0].password);
        if (!match) {
            return req.status(400).json({msg: "Password salah!!"});
        }

        // jika email dan pass cocok data disimpan di variable
        const UserId = user[0].id;
        const name = user[0].name;
        const email = user[0].email;

        // membuat akses dan refresh token
        const accessToken = jwt.sign({UserId, name, email}, process.env.ACCESS_TOKEN_SECRET,{
            expiresIn: '20s'
        });
        const refrehToken = jwt.sign({UserId, name, email}, process.env.REFRESH_TOKEN_SECRET,{
            expiresIn: '1d'
        });

        // simpan token ke dalam database
        await Users.update({refresh_token: refrehToken},{
            where: {
                id: UserId
            }
        });

        res.cookie('refreshToken', refrehToken,{
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        });

        res.json({ accessToken});

    } catch (error) {
        res.status(404).json({msg : "Email tidak ditemukan!!"})
        console.error(error);
    }
}

// log out

export const Logout = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.sendStatus(204);
    }

    const user = await Users.findAll({
        where:{
            refresh_token : refreshToken
        }
    });

    if(!user[0]){
        console.log("tidak cocok dengan di database");
        return res.sendStatus(204);
    }   
    
    const userId = user[0].id;
    await Users.update({refresh_token:null},{
        where: {
            id: userId
        }
    });
    res.clearCookie('refreshToken');
    res.json({msg: "Anda Telah LogOut"});
    return res.sendStatus(200);

}