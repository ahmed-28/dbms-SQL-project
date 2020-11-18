var odbc = require("odbc");

var cn = "DRIVER={MYSQL};SERVER=127.0.0.1;UID=root;PWD=rootpass;DATABASE=dbms_lab";

async function setup(){
const db = await odbc.connect(cn);
if(db) console.log("connected to your DB!!"); 

const userTableQuery = `CREATE TABLE USERS(
                                ID INT PRIMARY KEY AUTO_INCREMENT,
                                USERNAME VARCHAR(200),
                                PASSWORD VARCHAR(200)
                                );`;
db.query(userTableQuery)
.then(res => console.log("users table created!!"))
.catch(err => console.log(err));


const productTableQuery = `CREATE TABLE PRODUCT(
                                ID INT PRIMARY KEY AUTO_INCREMENT,
                                SELLER_ID INT,
                                NAME VARCHAR(200),
                                PRICE INT,
                                DESCRIPTION VARCHAR(200),
                                TYPE VARCHAR(200),
                                BRAND VARCHAR(200),
                                FOREIGN KEY (SELLER_ID) REFERENCES USERS(ID)
                                );`;

db.query(productTableQuery)
    .then(res => console.log("product table created!!"))
    .catch( (err) => {throw err} );

const purchaseTableQuery = `CREATE TABLE PURCHASE(
                                ID INT PRIMARY KEY AUTO_INCREMENT,
                                BUYER_ID INT,
                                SELLER_ID INT,
                                PRODUCT_ID INT,
                                FOREIGN KEY (PRODUCT_ID) REFERENCES PRODUCT(ID) ON DELETE CASCADE,
                                FOREIGN KEY (BUYER_ID) REFERENCES USERS(ID) ON DELETE CASCADE  
                                );`;
                            

db.query(purchaseTableQuery,(err,res)=>{
    if(err) throw err;
    else console.log("PURCHASE tbale created !!");
});
}

setup();
                                