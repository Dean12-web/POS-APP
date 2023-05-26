CREATE TABLE users(
    userid VARCHAR(100) PRIMARY KEY NOT NULL,
    email VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL,
    password VARCHAR(100) NOT NULL,
    role VARCHAR (20) NOT NULL
)

INSERT INTO users(userid,email,name,password,role) VALUES('001','admin@gmail.com','admin','123','admin');