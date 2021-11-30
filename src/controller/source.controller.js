const db = require("../models");
const LineByLineReader = require("line-by-line");
const constant = require("../constant");
const ObjectId = require("mongodb").ObjectId;
const fs = require("fs");
const helper = require("../helper");
const { join } = require("path");
var file_header = Object.keys(constant.SOURCE_DATA);
// Global object to use for time source.
var global_obj = {
  isSourceLogCreated: false,
  isParameterCreated: false,
  line_number: 0,
  source_log_id: null,
  complete_depth: false,
  i: 0.0,
};

// Global object to use for depth source.
var depth_global_obj = {
  isSourceLogCreated: false,
  isParameterCreated: false,
  line_number: 0,
  source_log_id: null,
  complete_depth: false,
  i: 0.0,
  depth_number: 1,
};

constant.SOURCE_ID = ObjectId().toString();
constant.SOURCE_ID_DEPTH = ObjectId().toString();

// Get the file to read.
const getTimeFile = async () => {
  try {
    let file_path = join(process.cwd(), "../log_time_data.txt");
    let fileExists = fs.existsSync(file_path);
    if (fileExists) {
      console.time("getTimeFile");
      let new_file_reading = join(process.cwd(), "../log_time_data_reading.txt");
      fs.renameSync(file_path, new_file_reading);
      file_path = new_file_reading;
      let header = null;
      global_obj.line_number = 0;
      const fileStatus = await readTimeFile(file_path, header);
    }
    // callback(200, { status: 200, message: "File readed successfully" });
  } catch (error) {
    console.log("error in get and writing file =====>", error);
    // callback(500, {
    //   staus: 500,
    //   message: "Internal server error",
    //   error: error,
    // });
  }
};

// Read a file to perform task.
const readTimeFile = async (file_path, header) => {
  return new Promise((resolve, reject) => {
    let lr = new LineByLineReader(file_path, { skipEmptyLines: true });
    let all_records = [];
    console.log("file is reading =====================>");
    lr.on("line", async function (line) {
      lr.pause();
      global_obj.line_number++;
      
      // Converting first row of file to headers
      if (!header && file_header.includes(line.split("\t")[0])) {
        header = line.split("\t");
        file_header = line.split("\t");
        createSourceParam("time", file_header);
      } else {
        let jsonRow = await txtToJson(line, file_header);
        jsonRow[0].sourceid = constant.SOURCE_ID;
        if (jsonRow[0].date.length == 6 && jsonRow[0].time.length == 6) {
          const finalObj = await validateSourceData(jsonRow[0]);
          all_records.push(jsonRow[0]);
          // const newSource = await db["source_data"].create(jsonRow[0]);
        }

        // Creating document in source_log when server restarted.
        if (!global_obj.isSourceLogCreated) {
          const source_log_obj = await sourceLogData(
            "time",
            jsonRow[0],
            file_header
          );
          const new_source_log = await db["source_log"].create(source_log_obj);
          global_obj.source_log_id = new_source_log._id.toString();
          global_obj.isSourceLogCreated = true;
        }

        // Updating the end time and end depth in source_log
        else if (global_obj.isSourceLogCreated) {
          const source_log_obj = {
            end_time: jsonRow[0].time.toISOString(),
            end_depth: jsonRow[0].sourcedata.DMEA,
            laststatusupdate: new Date().toISOString(),
          };
          const source_log_update = await db["source_log"].updateOne(
            { _id: global_obj.source_log_id },
            source_log_obj
          );
        }
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
        console.log(
          "error in file line number =================>",
          global_obj.line_number
        );
        lr.resume();
        resolve(e);
      })
      .on("end", async function () {
        console.log(
          "file line number =================>",
          global_obj.line_number
        );
        console.log(
          "number of records created =================>",
          all_records.length
        );
        const newSource = db["source_data"].insertMany(all_records);
        lr.close();
        let new_file_done = join(process.cwd(), "../log_time_data_done.txt")
        fs.renameSync(file_path, new_file_done);
        console.timeEnd("getTimeFile");

        resolve("success");
      });
  });
};

// Convert txt file to json format.
const txtToJson = async (line, file_header) => {
  let lines = [];
  let obj = {};
  lines.push(line.split("\t").join("\t"));
  return lines.map((record) => {
    const data = line.split("\t");

    obj.date = data[0];
    obj.time = data[1];
    obj.sourcedata = {};
    file_header.reduce((initialKey, nextKey, index) => {
      if (index != 17) {
        obj.sourcedata[constant.SOURCE_DATA[nextKey]] = data[index].trimStart();
        return obj;
      }
    }, {});
    return obj;
  });
};

// Creating date and time from the number.
const validateSourceData = async (row) => {
  return new Promise((resolve, reject) => {
    let finalTime = null,
      date = null;
    if (row.date) {
      let splitDate = row.date.match(/.{1,2}/g).join("-");
      date = new Date("20" + splitDate);
    }
    if (row.time && row.date) {
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
    (row.time = finalTime ? finalTime : null),
      (row.day = date ? date.getDate() : null);
    row.month = date ? date.getMonth() : null;
    row.year = date ? date.getFullYear() : null;
    resolve(row);
  });
};

// Creating the source log document.
const sourceLogData = async (type, record, file_header) => {
  return new Promise((resolve, reject) => {
    try {
      let sourceLogObj = constant.SOURCE_LOG_DATA;
      switch (type) {
        case "time":
          console.log("Creating the source log document");
          sourceLogObj.start_time = record.time.toISOString();
          sourceLogObj.end_time = record.time.toISOString();
          sourceLogObj.sourceid = constant.SOURCE_ID;
          sourceLogObj.start_depth = record.sourcedata.DMEA;
          sourceLogObj.end_depth = record.sourcedata.DMEA;
          sourceLogObj.log = "time";
          sourceLogObj.laststatusupdate = new Date().toISOString();
          sourceLogObj.log_data = "source_time_data";
          sourceLogObj.stdMnemonicsData = file_header.map((header) => {
            let stdMnemonicsObj = {};
            stdMnemonicsObj.std_mnemonic = constant.STD_MNEMONIC[header];
            stdMnemonicsObj.std_unit = constant.STD_UNIT[header];
            stdMnemonicsObj.std_mnemonic_displayname =
              constant.STD_MNEMONIC[header];
            return stdMnemonicsObj;
          });
          resolve(sourceLogObj);
          break;

        case "depth":
          console.log("Creating the source log document depth");
          sourceLogObj.start_time = record.TIME;
          sourceLogObj.end_time = record.TIME;
          sourceLogObj.sourceid = constant.SOURCE_ID_DEPTH;
          sourceLogObj.start_depth = record.DMEA;
          sourceLogObj.end_depth = record.DMEA;
          sourceLogObj.log = "depth";
          sourceLogObj.laststatusupdate = new Date().toISOString();
          sourceLogObj.log_data = "source_depth_data";
          sourceLogObj.stdMnemonicsData = file_header.map((header) => {
            let stdMnemonicsObj = {};
            stdMnemonicsObj.std_mnemonic = constant.STD_MNEMONIC[header];
            stdMnemonicsObj.std_unit = constant.STD_UNIT[header];
            stdMnemonicsObj.std_mnemonic_displayname =
              constant.STD_MNEMONIC[header];
            return stdMnemonicsObj;
          });
          resolve(sourceLogObj);
          break;
        default:
          break;
      }
    } catch (error) {
      console.log("error in source log data ===========+>", error);
      reject(error);
    }
  });
};

// Creating the source pramater document.
const createSourceParam = async (type, file_header) => {
  try {
    if (type == "time" && !global_obj.isParameterCreated) {
      console.log("Creating the source paramater document");
      let all_parameter = [];
      const date_time_obj = {};
      for (let index = 0; index < file_header.length; index++) {
        const parameter_obj = {};
        const element = file_header[index];
        if (constant.SOURCE_DATA[element] == "Date") {
          date_time_obj.parameter = constant.SOURCE_DATA[element]
            ? constant.SOURCE_DATA[element]
            : null;
          date_time_obj.std_mnemonic = constant.STD_MNEMONIC[element]
            ? constant.STD_MNEMONIC[element]
            : null;
          date_time_obj.std_mnemonic_displayname = constant.STD_MNEMONIC[
            element
          ]
            ? constant.STD_MNEMONIC[element]
            : null;
          date_time_obj.unit = constant.UNIT[element]
            ? constant.UNIT[element]
            : null;
          date_time_obj.type = "java.util.Date";
          date_time_obj.std_unit = constant.STD_UNIT[element]
            ? constant.STD_UNIT[element]
            : null;
          date_time_obj.description = constant.DESCRIPTION[element]
            ? constant.DESCRIPTION[element]
            : null;
          date_time_obj.source = null;
          date_time_obj.sourceid = constant.SOURCE_ID;
          continue;
        } else if (constant.SOURCE_DATA[element] == "Time") {
          date_time_obj.parameter = `${date_time_obj.parameter}And${constant.SOURCE_DATA[element]}`;
          date_time_obj.std_mnemonic = `${date_time_obj.std_mnemonic} ${constant.STD_MNEMONIC[element]}`;
          date_time_obj.std_mnemonic_displayname = `${date_time_obj.std_mnemonic_displayname} ${constant.STD_MNEMONIC[element]}`;
          date_time_obj.unit = `${date_time_obj.unit} ${constant.UNIT[element]}`;
          date_time_obj.std_unit = `${date_time_obj.std_unit} ${constant.STD_UNIT[element]}`;
          continue;
        } else {
          parameter_obj.parameter = constant.SOURCE_DATA[element]
            ? constant.SOURCE_DATA[element]
            : null;
          parameter_obj.std_mnemonic = constant.STD_MNEMONIC[element]
            ? constant.STD_MNEMONIC[element]
            : null;
          parameter_obj.std_mnemonic_displayname = constant.STD_MNEMONIC[
            element
          ]
            ? constant.STD_MNEMONIC[element]
            : null;
          parameter_obj.unit = constant.UNIT[element]
            ? constant.UNIT[element]
            : null;
          parameter_obj.type = "java.util.String";
          parameter_obj.std_unit = constant.STD_UNIT[element]
            ? constant.STD_UNIT[element]
            : null;
          parameter_obj.description = constant.DESCRIPTION[element]
            ? constant.DESCRIPTION[element]
            : null;
          parameter_obj.source = null;
          parameter_obj.sourceid = constant.SOURCE_ID;
          all_parameter.push(parameter_obj);
        }
      }
      all_parameter.push(date_time_obj);
      const source_parameter = db["source_parameter"].insertMany(all_parameter);
      global_obj.isParameterCreated = true;
    }
    if (type == "depth" && !depth_global_obj.isParameterCreated) {
      console.log("Creating the source paramater document");
      let all_parameter = [];
      const date_time_obj = {};
      for (let index = 0; index < file_header.length; index++) {
        const parameter_obj = {};
        const element = file_header[index];
        if (constant.SOURCE_DATA[element] == "Date") {
          date_time_obj.parameter = constant.SOURCE_DATA[element]
            ? constant.SOURCE_DATA[element]
            : null;
          date_time_obj.std_mnemonic = constant.STD_MNEMONIC[element]
            ? constant.STD_MNEMONIC[element]
            : null;
          date_time_obj.std_mnemonic_displayname = constant.STD_MNEMONIC[
            element
          ]
            ? constant.STD_MNEMONIC[element]
            : null;
          date_time_obj.unit = constant.UNIT[element]
            ? constant.UNIT[element]
            : null;
          date_time_obj.type = "java.util.Date";
          date_time_obj.std_unit = constant.STD_UNIT[element]
            ? constant.STD_UNIT[element]
            : null;
          date_time_obj.description = constant.DESCRIPTION[element]
            ? constant.DESCRIPTION[element]
            : null;
          date_time_obj.source = null;
          date_time_obj.sourceid = constant.SOURCE_ID;
          continue;
        } else if (constant.SOURCE_DATA[element] == "Time") {
          date_time_obj.parameter = `${date_time_obj.parameter}And${constant.SOURCE_DATA[element]}`;
          date_time_obj.std_mnemonic = `${date_time_obj.std_mnemonic} ${constant.STD_MNEMONIC[element]}`;
          date_time_obj.std_mnemonic_displayname = `${date_time_obj.std_mnemonic_displayname} ${constant.STD_MNEMONIC[element]}`;
          date_time_obj.unit = `${date_time_obj.unit} ${constant.UNIT[element]}`;
          date_time_obj.std_unit = `${date_time_obj.std_unit} ${constant.STD_UNIT[element]}`;
          continue;
        } else {
          parameter_obj.parameter = constant.SOURCE_DATA[element]
            ? constant.SOURCE_DATA[element]
            : null;
          parameter_obj.std_mnemonic = constant.STD_MNEMONIC[element]
            ? constant.STD_MNEMONIC[element]
            : null;
          parameter_obj.std_mnemonic_displayname = constant.STD_MNEMONIC[
            element
          ]
            ? constant.STD_MNEMONIC[element]
            : null;
          parameter_obj.unit = constant.UNIT[element]
            ? constant.UNIT[element]
            : null;
          parameter_obj.type = "java.util.String";
          parameter_obj.std_unit = constant.STD_UNIT[element]
            ? constant.STD_UNIT[element]
            : null;
          parameter_obj.description = constant.DESCRIPTION[element]
            ? constant.DESCRIPTION[element]
            : null;
          parameter_obj.source = null;
          parameter_obj.sourceid = constant.SOURCE_ID_DEPTH;
          all_parameter.push(parameter_obj);
        }
      }
      all_parameter.push(date_time_obj);
      const source_parameter = db["source_parameter"].insertMany(all_parameter);
      depth_global_obj.isParameterCreated = true;
    }
  } catch (error) {
    console.log("error in creating the source parameter ==========>", error);
  }
};

// Write a depth file
const createDepthFile = async () => {
  try {
    let file_path = join(process.cwd(), "../log_depth_data.txt");
    let file_exists = fs.existsSync(file_path);
    setInterval(() => {
      writeDepthTxt(file_path, file_exists);
    }, 1000);
  } catch (error) {
    console.log("error in creating a file ====================>", error);
  }
};

// Creating a file
const writeDepthTxt = async (file_path, file_exists) => {
  return new Promise((resolve, reject) => {
    console.time("writeStarted");
    if (depth_global_obj.complete_depth) {
      depth_global_obj.i = 1e-2;
      depth_global_obj.complete_depth = false;
    }
    console.log(depth_global_obj.i);
    if (depth_global_obj.i <= 26e3) {
      insertData(depth_global_obj.i.toFixed(2), file_exists, file_path);
      depth_global_obj.i = Number((depth_global_obj.i + 1e-2).toFixed(2));
      file_exists = fs.existsSync(file_path);
    } else {
      depth_global_obj.complete_depth = true;
    }
    console.timeEnd("writeStarted");
  });
};

// Inserting data in depth file
const insertData = (data, file_exists, file_path) => {
  file_exists = fs.existsSync(file_path);
  let depth_obj = {
    DMEA: `${data}`,
    Well124: constant.DEPTH_DATA["Well124"],
    RPM: helper.getRandomNumber("RPM"),
    SPM1: helper.getRandomNumber("SPM1"),
    SPM2: helper.getRandomNumber("SPM2"),
    SPP: helper.getRandomNumber("SPP"),
    BPOS: helper.getRandomNumber("BPOS"),
    DBTM: helper.getRandomNumber("DBTM"),
    DATEANDTIME: new Date().toISOString(),
    HKLD: helper.getRandomNumber("HKLD"),
    HKLX: helper.getRandomNumber("HKLX"),
    WOB: helper.getRandomNumber("WOB"),
    WOBX: helper.getRandomNumber("WOBX"),
    ROP: helper.getRandomNumber("ROP"),
    TOR: helper.getRandomNumber("TOR"),
    TQX: helper.getRandomNumber("TQX"),
  };
  if (!file_exists) {
    data = depth_obj["DMEA"];
    data = data + "\t" + depth_obj["Well124"];
    data = data + "\t" + depth_obj["RPM"];
    data = data + "\t" + depth_obj["SPM1"];
    data = data + "\t" + depth_obj["SPM2"];
    data = data + "\t" + depth_obj["SPP"];
    data = data + "\t" + depth_obj["BPOS"];
    data = data + "\t" + depth_obj["DBTM"];
    data = data + "\t" + depth_obj["DATEANDTIME"];
    data = data + "\t" + depth_obj["HKLD"];
    data = data + "\t" + depth_obj["HKLX"];
    data = data + "\t" + depth_obj["WOB"];
    data = data + "\t" + depth_obj["WOBX"];
    data = data + "\t" + depth_obj["ROP"];
    data = data + "\t" + depth_obj["TOR"];
    data = data + "\t" + depth_obj["TQX"];
  } else {
    data = `\r\n${depth_obj["DMEA"]}`;
    data = data + "\t" + depth_obj["Well124"];
    data = data + "\t" + depth_obj["RPM"];
    data = data + "\t" + depth_obj["SPM1"];
    data = data + "\t" + depth_obj["SPM2"];
    data = data + "\t" + depth_obj["SPP"];
    data = data + "\t" + depth_obj["BPOS"];
    data = data + "\t" + depth_obj["DBTM"];
    data = data + "\t" + depth_obj["DATEANDTIME"];
    data = data + "\t" + depth_obj["HKLD"];
    data = data + "\t" + depth_obj["HKLX"];
    data = data + "\t" + depth_obj["WOB"];
    data = data + "\t" + depth_obj["WOBX"];
    data = data + "\t" + depth_obj["ROP"];
    data = data + "\t" + depth_obj["TOR"];
    data = data + "\t" + depth_obj["TQX"];
  }
  fs.appendFileSync(file_path, data);
  saveSourceDepthData(depth_obj);
  createDepthSourceLog(depth_obj);
  createSourceParam("depth", Object.keys(constant.SOURCE_DATA));
};

const createDepthSourceLog = async (depth_obj) => {
  return new Promise(async (resolve, reject) => {
    if (!depth_global_obj.isSourceLogCreated) {
      const source_log_obj = await sourceLogData(
        "depth",
        depth_obj,
        Object.keys(constant.SOURCE_DATA)
      );
      const new_source_log = await db["source_log"].create(source_log_obj);
      depth_global_obj.source_log_id = new_source_log._id.toString();
      depth_global_obj.isSourceLogCreated = true;
    }

    // Updating the end time and end depth in source_log
    else if (depth_global_obj.isSourceLogCreated) {
      const source_log_obj = {
        end_time: depth_obj.DATEANDTIME,
        end_depth: depth_obj.DMEA,
        laststatusupdate: depth_obj.DATEANDTIME,
      };
      const source_log_update = await db["source_log"].updateOne(
        { _id: depth_global_obj.source_log_id },
        source_log_obj
      );
    }
  });
};

const saveSourceDepthData = async (depth_obj) => {
  try {
    let source_depth_data = {};
    source_depth_data.depth = depth_global_obj.depth_number;
    source_depth_data.id = depth_global_obj.depth_number;
    source_depth_data.sourceid = constant.SOURCE_ID_DEPTH;
    source_depth_data.sourcedata = depth_obj;
    db["source_depth"].create(source_depth_data);
    depth_global_obj.depth_number++;
  } catch (error) {
    console.log("error in saving the source depth ========>", error);
  }
};
// Exporting the required controller
module.exports = {
  getTimeFile: getTimeFile,
  createDepthFile: createDepthFile,
};
