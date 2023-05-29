CREATE TABLE users(
    userid SERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL,
    password VARCHAR(100) NOT NULL,
    role VARCHAR (20) NOT NULL
);


CREATE TABLE goods(
    barcode VARCHAR(20) PRIMARY KEY NOT NULL,
    name VARCHAR(150) NOT NULL,
    stock INTEGER NOT NULL,
    purchaseprice NUMERIC(19,2) NOT NULL,
    sellingprice NUMERIC(19,2) NOT NULL, 
    unit VARCHAR(10) NOT NULL,
    picture TEXT NOT NULL,
    FOREIGN KEY(unit) REFERENCES units(unit)
);

CREATE TABLE suppliers(
    supplierid SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL
)