const db = require("../models");
const LineByLineReader = require("line-by-line");
const constant = require("../constant");

const getFile = async (req, callback) => {
  try {
    let file_path = "public/raj.txt";
    let line_number = 0;
    const fileStatus = await readFile(file_path,line_number);
    callback(200,{status:200,message:"File readed successfully"})
  } catch (error) {
    console.log("error in get and writing file =====>", error);
    callback(500, {
      staus: 500,
      message: "Internal server error",
      error: error,
    });
  }
};

const readFile = async (file_path,line_number) => {
  return new Promise((resolve, reject) => {
    let lr = new LineByLineReader(file_path);
    lr.on("line", async function (line) {
      lr.pause();
      console.log("line number ===>",line_number+1)
      let jsonRow = await txtToJson(line);
      jsonRow[0].sourceid = constant.SOURCE_ID;
      if(jsonRow[0].date.length == 6 && jsonRow[0].time.length == 6) {
        const finalObj = await validateSourceData(jsonRow[0]);
      const newSource = await db["source_data"].create(jsonRow[0]);
      }
      lr.resume();
    })
      .on("error", function (e) {
        console.log("error in fetch file inside", e);
        if (
          e.code == "ENOENT" &&
          e.message.includes("ENOENT: no such file or directory")
        ) {
          resolve("There is no file");
        }
        lr.resume();
        resolve(e);
      })
      .on("end", async function () {
        lr.resume();
        resolve("success");
      });
  });
};

const txtToJson = async (line) => {
  let lines = [];
  let obj = {};
  lines.push(line.split("\t").join("\t"));
  return lines.map((record) => {
    const data = line.split("\t");

    obj.date = data[0];
    obj.time = data[1];
    obj.sourcedata = {}
    constant.SOURCE_DATA.reduce((initialKey, nextKey, index) => {
      obj.sourcedata[nextKey] = data[index].trimStart();
      return obj;
    }, {});
    return obj;
  });
};

const validateSourceData = async (row) => {
  return new Promise ((resolve,reject) => {
    let finalTime = null, date =null;
    if(row.date) {
      let splitDate = row.date.match(/.{1,2}/g).join("-");
      date = new Date("20" + splitDate);
    }
    if(row.time && row.date) {
      let splitTime = row.time.match(/.{1,2}/g);
      finalTime = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      splitTime[0],
      splitTime[1],
      splitTime[2]
    );
    }
    row.time = finalTime?finalTime:null,
    row.day = date?date.getDate():null;
    row.month = date?date.getMonth():null;
    resolve(row);
  })
}


module.exports = {
  getFile: getFile,
};
