import mongoose from "mongoose";

export async function connect() {
  try {
    mongoose.connect(process.env.CONNECTION_STRING, {      
      dbName: "book_collections",
    });
    console.log("Dtabase connection is ready !!!");
  } catch (error) {
    console.log("error occured ", error);
  }
}
