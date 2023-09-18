const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore,  FieldValue ,Timestamp} = require('firebase-admin/firestore');
// const serviceAccount = require('./reverr-25fb3-firebase-adminsdk-g8tph-a9d7f58699.json');
const serviceAccount2 = require('./dsquare-242c3-firebase-adminsdk-dgcnn-70a4b17d66.json');
const { getStorage } = require('firebase-admin/storage');

// const app = initializeApp({
//   credential: cert(serviceAccount)
// });


// const db = getFirestore();
//   const Admin=db.collection("Admin");
//   const Blogs=db.collection("Blogs");
//   const Blogs2=db.collection("Blogs2");
//   const Books=db.collection("Books");
//   const Courses=db.collection("Courses");
//   const DocumentTemplates=db.collection("DocumentTemplates");
//   const Expertise=db.collection("Expertise");
//   const Forms=db.collection("Forms");
//   const Funding=db.collection("Funding");
//   const Groups=db.collection("Groups");
//   const Images=db.collection("Images");
//   const Investordeals=db.collection("Investordeals");
//   const Mentors=db.collection("Mentors");
//   const Messages=db.collection("Messages");
//   const Newsletter=db.collection("Newsletter");
//   const Posts=db.collection("Posts");
//   const PptTemplate=db.collection("PptTemplate");
//   const Register=db.collection("Register");
//   const Users=db.collection("Users");
//   const WhatsappMessages=db.collection("WhatsappMessages");
//   const demo=db.collection("demo");
//   const meta=db.collection("meta");
//   const metaData=db.collection("metaData");
//   const Data=db.collection("Data");
//   const Payment=db.collection("Payments");
//   const Refund=db.collection("Refunds");
//   const bucket = getStorage().bucket(`gs://reverr-25fb3.appspot.com`);
//   const MessagesSend = db.collection("WhatsAppSend");
//   const MessagesReceived = db.collection("WhatsAppReceived");

const app2 = initializeApp({
  credential: cert(serviceAccount2)
})

const db = getFirestore();
const test=db.collection("test");
const Admin2=db.collection("Admin");
const Blogs1=db.collection("Blogs");
const Blogs22=db.collection("Blogs2");
const Books2=db.collection("Books");
const Courses2=db.collection("Courses");
const DocumentTemplates2=db.collection("DocumentTemplates");
const Expertise2=db.collection("Expertise");
const Forms2=db.collection("Forms");
const Funding2=db.collection("Funding");
const Groups2=db.collection("Groups");
const Images2=db.collection("Images");
const Investordeals2=db.collection("Investordeals");
const Mentors2=db.collection("Mentors");
const Messages2=db.collection("Messages");
const Newsletter2=db.collection("Newsletter");
const Posts2=db.collection("Posts");
const PptTemplate2=db.collection("PptTemplate");
const Register2=db.collection("Register");
const Users2=db.collection("Users");
const WhatsappMessages2=db.collection("WhatsappMessages");
const demo2=db.collection("demo");
const meta2=db.collection("meta");
const metaData2=db.collection("metaData");
const Data2=db.collection("Data");
const Payment=db.collection("Payments");
const Refund=db.collection("Refunds");
const bucket= getStorage().bucket(`gs://reverr-25fb3.appspot.com`);
  const MessagesSend = db.collection("WhatsAppSend");
  const MessagesReceived = db.collection("WhatsAppReceived");
  
  module.exports = { Payment, Refund,MessagesSend,MessagesReceived,bucket,db,FieldValue,Timestamp};