import sequelize from "sequelize";

const db = new sequelize('fikri_auth_db','root','', {
    host: "localhost",
    dialect: "mysql"
});

export default db;