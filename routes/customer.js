var express = require("express");
var router = express.Router();
var odbc = require("odbc");

var cn = "DRIVER={MYSQL};SERVER=127.0.0.1;UID=root;PWD=rootpass;DATABASE=dbms_lab";

odbc.connect(cn,(err,db)=>{
    console.log("db connected!!");
    router.get('/home',async (req,res) => {
        console.log(req.user);
        const user = req.user;

        const products = await db.query("SELECT * FROM PRODUCT");
        const brands = await db.query("SELECT BRAND FROM PRODUCT");
        const types = await db.query("SELECT TYPE FROM PRODUCT");
        res.render('customer/home',{
            user:user,
            products : products,
            brands:brands,
            types:types
        });
    });

    router.get('/history',async (req,res)=>{
        const user = req.user;
        const rows = await db.query("SELECT * FROM USERS WHERE USERNAME=?",[user]);
        let buyer_id = rows[0].ID;
        const products = await db.query("SELECT PRODUCT.*,USERS.ID AS UID FROM PRODUCT INNER JOIN USERS ON PRODUCT.SELLER_ID=USERS.ID AND USERNAME=?",[user]);
        console.log(products);
        const buyings = await db.query("SELECT PRODUCT.*,PURCHASE.ID AS PURID FROM PRODUCT INNER JOIN PURCHASE WHERE BUYER_ID=? AND PRODUCT_ID=PRODUCT.ID",[buyer_id])
        res.render('customer/history',{
            user:user,
            products:products,
            buyings:buyings
        });
    });

    router.post('/buy', async (req,res) => {
        const user = req.user;
        const prod_id = req.body.id;
        console.log(prod_id);
        const rows = await db.query("SELECT * FROM USERS WHERE USERNAME=?",[user]);
        let buyer_id = rows[0].ID;
        const result = await db.query("INSERT INTO PURCHASE(BUYER_ID,PRODUCT_ID) VALUES(?,?)",[buyer_id,prod_id]);
        res.redirect('/history');
    });

    router.post('/delete_item',async (req,res)=>{
        const user = req.user;
        const prod_id = req.body.id;
        console.log("in delete" , prod_id);
        const result = await db.query("DELETE FROM PRODUCT WHERE ID=?",[prod_id]);
        res.redirect('/history');
    });

    router.post('/sell_update',async (req,res)=>{
        const user = req.user;

        let name = req.body.product_name;
        let price = req.body.price;
        let desc = req.body.description;
        let type = req.body.type;
        let brand = req.body.brand;
        let prod_id = req.body.prod_id;
        
        const result = await db.query("SELECT * FROM USERS WHERE USERNAME=?",[user]);
        let seller_id = result[0].ID;
        console.log("past");
        const query = `UPDATE PRODUCT SET SELLER_ID=?,NAME=?,PRICE=?,DESCRIPTION=?,TYPE=?,BRAND=? WHERE ID=?`;
        const new_prods = await db.query(query,[seller_id,name,price,desc,type,brand,prod_id]);

        const buyings = await db.query("SELECT PRODUCT.*,PURCHASE.ID AS PURID FROM PRODUCT INNER JOIN PURCHASE WHERE BUYER_ID=? AND PRODUCT_ID=PRODUCT.ID",[seller_id])
        const products = await db.query("SELECT PRODUCT.*,USERS.ID AS UID FROM PRODUCT INNER JOIN USERS ON PRODUCT.SELLER_ID=USERS.ID AND USERNAME=?",[user]);
        res.render('customer/history',{
            user:user,
            products:products,
            buyings:buyings
        });
    })
    router.get('/sell',(req,res) => {
        const user = req.user;
        
        res.render('customer/sell',{
            user:user,
            msg:null,
        });
    });

    router.post('/sell',async (req,res)=>{
        const user = req.user;
        console.log(req.body);

        let name = req.body.product_name;
        let price = req.body.price;
        let desc = req.body.description;
        let type = req.body.type;
        let brand = req.body.brand;

        const result = await db.query("SELECT * FROM USERS WHERE USERNAME=?",[user]);
        //console.log(result);
        const id = result[0].ID;
        const query = `INSERT INTO PRODUCT(SELLER_ID,NAME,PRICE,DESCRIPTION,TYPE,BRAND) VALUES (?,?,?,?,?,?)`;
        await db.query(query,[id,name,price,desc,type,brand]);
        res.render('customer/sell',{
            user:user,
            msg:'success'
        });
    });

    router.get('/login',(req,res)=>{
        res.render('customer/login',{
            error:null
        });
    })

    router.post('/login',async (req,res) => {
        let username = req.body.username;
        let password = req.body.password;

        const rows = await db.query("SELECT * FROM USERS WHERE USERNAME = ?",[username]);
        if(rows.count==0){
            res.render('customer/login',{
                error:"no such user"
            });
        }
        else{
            if(rows[0].PASSWORD==password){
                res.cookie('username',username);
                res.redirect('/home');
            }
            else
                res.render('customer/login',{
                    error:"wrong password"
                });
        }
        
        //res.redirect('/home');

    });

    router.get('/register',async (req,res)=>{
        res.render('customer/register',{
            error:null
        });
    });

    router.post('/register',async (req,res)=>{
        console.log(req.body);

        let user = req.body.username;
        let password = req.body.password;


        console.log(db);
        const q = 'SELECT * FROM USERS WHERE USERNAME = ?';
        const rows = await db.query(q,[user]);
        console.log(rows,rows.count);
        if(rows.count!=0){
            res.render('customer/register',{
                error:"username existing"
            });
        }
        else{
            const rows = await db.query("INSERT INTO USERS(USERNAME,PASSWORD) VALUES (?,?)",[user,password])
            res.redirect('/login');
        }
    });
});

module.exports = router;
