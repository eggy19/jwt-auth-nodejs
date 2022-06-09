import { Sequelize } from "sequelize";
import db from "../config/db.js";

const sq = Sequelize;

const Users = db.define('users',{
    name:{
        type: sq.STRING
    },
    email:{
        type: sq.STRING
    },
    password:{
        type: sq.STRING
    },
    refresh_token: {
        type: sq.TEXT
    },
},{
    freezTableName:true
});

export default Users;