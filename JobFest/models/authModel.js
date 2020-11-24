const express = require('express')
const router = express.Router()

const User = require('../schema/authSchema')
const userData = require('../schema/userDataSchema')
const jobData = require('../schema/jobSchema')
const feedsData = require('../schema/feedsSchema');
const { check, validationResult } 
    = require('express-validator'); 
const mongoose = require('mongoose');
const fs = require("fs");
const PDFDocument = require('pdfkit');
const bcrypt = require('bcrypt');
const passport = require('passport');
const nodemailer = require('nodemailer');
const flash = require('flash')
var errors = []
require('../passport')(passport);
require('dotenv').config()

exports.getRegisterPage = function(req,res,next){
    res.render('register');
}

exports.getLoginPage = function(req,res,next){
    res.render('login');      
}

exports.getSelectionPage = function(req,res,next){
    // console.log(req.user.email);
    User.findOne({email: req.user.email},(err, data)=>{
        if(data.usertype==="User"){
            res.render('selection',{type: "User", user:data});
        }
        if(data.usertype==="Admin"){
            res.render('selection',{type: "Admin", user:data});
        }
        else{
            res.render('selection',{type: "User", user:data});
        }
    })
}
exports.getJobpostPage = function(req,res,next){
    res.render('employer',{user:req.user})
}
exports.getDashboardPage = function(req,res,next){
    userData.findOne({email: req.user.email},(err, data)=>{
        if(err) throw err
        if(data){
            res.render('dashboard', {user: data, current_user: req.user, errors:errors });
        }
        else{
            res.render('dashboard',{user: req.user, current_user: req.user, errors:errors })
        }
    })
}


// Registering the user!
exports.registerUser = function(req,res,next){
    var { email, username, password, confirmpassword, usertype } = req.body;
    var err;
    if (!email || !username || !password || !confirmpassword || !usertype) {
        err = "Please Fill All The Fields...";
        res.render('register', { 'err': err });
    }
    if (password != confirmpassword) {
        err = "Passwords Don't Match";
        res.render('register', { 'err': err, 'email': email, 'username': username });
    }
    if (typeof err == 'undefined') {
        User.findOne({ email: email }, function (err, data) {
            if (err) throw err;
            if (data) {
                console.log("User Exists");
                err = "User Already Exists With This Email...";
                res.render('register', { 'err': err, 'email': email, 'username': username });
            } else {
                bcrypt.genSalt(10, (err, salt) => {
                    if (err) throw err;
                    bcrypt.hash(password, salt, (err, hash) => {
                        if (err) throw err;
                        password = hash;
                        User({
                            email,
                            username,
                            password,
                            usertype
                        }).save((err, data) => {
                            if (err) throw err;
                            req.flash('success', "User registered Successfully.");
                            res.redirect('/api/user/login');
                        });
                    });
                });
            }
        });
    }
}

// Login User
exports.loginUser = function(req, res, next){
    passport.authenticate('local', {
        failureRedirect: '/api/user/login',
        successRedirect: '/api/user/selection',
        failureFlash: true,
    })(req, res, next);
};

exports.checkAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, post-check=0, pre-check=0');
        return next();
    } else {
        res.redirect('/api/user/login');
    }
}

exports.logoutUser=function(req, res){
    if(req.user.usertype){
        req.logout();
        req.flash('success', 'Successfully logged out!');
        res.redirect('/api/user/login');
    }
    else{
        User.findByIdAndDelete(req.user.id,(err,data)=>{
            if(err) throw err
            req.logout();
            res.redirect('/api/user/login');
        });
    }
};


// Profile data submission
exports.submitProfile= function(req,res){
    var {_id, email, username, dob, yog, lastDegree, ylastDegree, jobrole, yoe, textpro, expectSal, genre} = req.body
    errors = validationResult(req); 
    // If some error occurs, then this 
    // block of code will run 
    if (!errors.isEmpty()) { 
        res.redirect('/api/user/dashboard')
    } 
    else{
    userData.findOne({email: email},(err, data)=>{
        if (err) throw err
        if(data){
            userData.updateOne({email:email},{$set:{
                email, username, dob, yog, lastDegree, ylastDegree, jobrole, yoe, textpro, expectSal, genre
            }},(err,data)=>{
                if(err) throw err
            })
        }else{
            userData({
                email, username, dob, yog, lastDegree, ylastDegree, jobrole, yoe, textpro, expectSal, genre
            }).save((err,data)=>{
                if(err) throw err
            })
        }        
    });

    // Generating the PDF
    var invoice={
        email, username, dob, yog, lastDegree, ylastDegree, jobrole, yoe, textpro, expectSal, genre
    }
    
    function generateHeader(doc) {
        doc
          .fillColor("#444444")
          .fontSize(20)
          .text("JobFest", 50, 57)
          .fontSize(10)
          .text("A Job Portal", 200, 57, { align: "right" })
          .text("West Bengal, India", 200, 75, { align: "right" })
          .moveDown();
    }
    function generateHeadings(doc) {
        doc
          .font('Courier-Bold')
          .fillColor("#444444")
          .fontSize(14)
          .text(`Personal Details`, 50, 120)
          .text(`Academic Details`, 50, 260)
          .text(`Professional Details`, 50, 380)
          .moveDown();
    }
    function generateFooter(doc) {
        doc
          .fontSize(10)
          .text(
            "Thanks for using this JobFest Web App!",
            50,
            710,
            { align: "center", width: 500 }
          );
    }
    function generateCustomerInformation(doc, invoice) {
        doc
        .fontSize(12)
        .font('Times-Roman')
          .text(`Name: ${username}`, 50, 160)
          .text(`Bio: ${textpro}`, 50, 180)
          .text(`E-mail: ${email}`, 50, 200)
          .text(`Date of Birth: ${dob}`, 50, 220)
          .text(`Year of Graduation ${yog}`, 50, 300)
          .text(`Last degree obtained: ${lastDegree}`, 50, 320)
          .text(`Year of obtaining last degree: ${ylastDegree}`, 50, 340)
          .text(`Job Role: ${jobrole}`, 50, 420)
          .text(`Year of experience: ${yoe}`, 50, 440)
          .text(`Genre of work: ${genre}`, 50, 460)
          .text(`Expected Salary: ${expectSal} `, 50, 490)
      
    }  
    function createInvoice(invoice, path) {
        let doc = new PDFDocument({ margin: 50 });
      
        generateHeader(doc);
        generateHeadings(doc)
        generateCustomerInformation(doc, invoice);
        generateFooter(doc);
      
        doc.end();
        doc.pipe(fs.createWriteStream(path));
    }
    try{
        fs.unlink(`./JobResume/${email}.pdf`,(err,data)=>{
            if(err) {
                createInvoice(invoice,`./JobResume/${email}.pdf`);
                userData.updateOne({email:req.user.email},{$set:{"resume":`./JobResume/${email}.pdf`}},(err,data)=>{
                if(err) throw err
                    console.log(data)
                });
            }
            else{
                createInvoice(invoice,`./JobResume/${email}.pdf`);
                userData.updateOne({email:req.user.email},{$set:{"resume":`./JobResume/${email}.pdf`}},(err,data)=>{
                if(err) throw err
                    console.log(data)
                });
            }
        });
    }
    catch(err){
        console.log(err);
    }
    res.redirect('/api/user/profile');
}
}
exports.getProfile = function(req,res){
    userData.findOne({email: req.user.email},(err, data)=>{
        // userData.findOne({email: req.params.email},(err, data)=>{
        if(err) throw err
        if(data){
            res.render('profile', {user: data, current_user: req.user});
        }
        else{
            res.redirect('/api/user/dashboard');
        }
    })
}

exports.submitJobData= function(req,res,next){
    var {jobtitle, company, skills, aq, exp, sal, contact} = req.body
    if(!jobtitle || !company || !skills || !aq || !exp || !sal || !contact){
        res.redirect('/api/user/employer')
    }
    else{
        jobData({
            jobtitle, company, skills, aq, exp, sal, contact,"PostedBy": req.user.email
        }).save((err,data)=>{
            if(err) throw err
        })
    }
    res.redirect('/api/user/selection')
}

exports.getCandidates= function(req,res,next){
    userData.find({},(err,datas)=>{
        if(err) throw err
        res.render('candidates',{users: datas, current_user: req.user, search: ""});
    });
}
exports.getJobs= function(req,res,next){
    jobData.find({},(err,datas)=>{
        if(err) throw err
        res.render('jobspage',{jobs: datas, current_user: req.user, search: "" });
    });
}
exports.getPostedJobs = function(req,res,next){
    jobData.find({"PostedBy": req.user.email},(err,datas)=>{
        if(err) throw err
        res.render('postedjobs',{jobs: datas, current_user: req.user});
    });
}
exports.deleteJob = function(req,res,next){
    jobData.deleteOne({_id: req.params.id},(err,data)=>{
        if(err) throw err
        res.redirect('/api/user/postedjobs')
    })
}

exports.jobApply = function(req,res,next){
    jobData.findOne({_id: req.params.id},(err,data)=>{
        if(err) throw err
        let mailTransporter = nodemailer.createTransport({ 
            service: 'gmail', 
            auth: { 
                user: process.env.EMAIL, // Put your own email here and register yourself as Employee
                pass: process.env.PASSWORD // Your own email password & Enable 3rd Party Option
            } 
        }); 
          
        let mailDetails = { 
            from: `${req.user.email}`, 
            to: `${data.contact}`, 
            subject: 'Applying for job in your esteemed company',
            text: `Respected Sir/Ma'am,\n     I am ${req.user.username} would like to apply for the job of ${data.jobtitle} in your esteemed company ${data.company}. I have sufficient experience of working in the mentioned field. I would be highly grateful, if you give me a chance to interview.\nMy email: ${req.user.email}\n\nFrom,\nYours Sincerely,\n${req.user.username}`
        }; 
          
        mailTransporter.sendMail(mailDetails, function(err, data) { 
            if(err) { 
                console.log('Error Occurs'); 
            } else { 
                console.log('Email sent successfully'); 
            }
            res.redirect('/api/user/jobs') 
        }); 
    }) 
         
}

exports.searchJob = function(req,res,next){
    var jobskill = req.body.skillsearch
    if(jobskill){
        jobData.find({"skills":{$all:[`${jobskill}`]}},(err,datas)=>{
            if (err) throw err
            else{
                res.render('jobspage',{jobs: datas, current_user: req.user, search:jobskill});
            }
        });
    }
    else{
        res.redirect('/api/user/jobs');
    }
}
exports.candsearch = function(req,res,next){
    var jobskill = req.body.skillsearch
    if(jobskill){
        userData.find({"genre":{$all:[`${jobskill}`]}},(err,datas)=>{
            if (err) throw err
            else{
                res.render('candidates',{users: datas, current_user: req.user, search: jobskill});
            }
        });
    }
    else{
        res.redirect('/api/user/candidates');
    }
}

exports.sendcv = function(req,res,next){
    memail = req.params.id.replace('.pdf','')
    userData.findOne({email:memail},(err,data)=>{
        if(err) throw err
        var data2 =fs.readFileSync(`./JobResume/${memail}.pdf`);
        res.contentType("application/pdf");
        res.send(data2);
    });
}

exports.sendFeeds = function(req,res,next){
   feedsData.find().where().sort("-timesort2").exec((err,datas)=>{
       if(err) throw err
        res.render('feeds', {feeds : datas, username: req.user.username, userid: req.user.id, type: req.user.usertype });
   });  
}

exports.deleteFeed = function(req,res,next){
    feedsData.findByIdAndDelete(req.params.id, (err,data)=>{
        if(err) throw err
        else{
            res.redirect('/api/user/feeds/');
        }
    });
}

exports.deleteaccount = function(req,res,next){
    User.findByIdAndDelete(req.params.id, (err,data)=>{
        if (err) throw err
        else{
            req.flash('success',"Account deleted successfully!");
            res.redirect('/api/user/register')
        }
    })
}