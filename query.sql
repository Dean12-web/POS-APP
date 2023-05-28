CREATE TABLE users(
    userid SERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL,
    password VARCHAR(100) NOT NULL,
    role VARCHAR (20) NOT NULL
);

INSERT INTO users(email,name,password,role) VALUES('admin@gmail.com','admin','123','admin');