const db = require("../models");
const LineByLineReader = require("line-by-line");
const constant = require("../constant");
const ObjectId = require("mongodb").ObjectId;
const fs = require("fs");
const helper = require("../helper");
const { join } = require("path");
const producer = require("../helper/producer");

// Global object to use for time source.
var time_global_obj = {
  isSourceLogCreated: false,
  isParameterCreated: false,
  source_log_id: null,
  complete_time: false,
  time_index: 0.0,
  time_number: 1,
  sourceid: ObjectId().toString(),
};

/* ****************************************************** Time file *********************************************** */

// Initializing time program.
const initializeTime = async () => {
  try {
    let file_path = join(process.cwd(), "../log_time_data.txt");
    let file_exists = fs.existsSync(file_path);
    writeTimeTxt(file_path, file_exists);
    setInterval(() => {
      writeTimeTxt(file_path, file_exists);
    }, 1000);
  } catch (error) {
    console.log("error in creating a file ====================>", error);
  }
};

// Program that will continously run
const writeTimeTxt = async (file_path, file_exists) => {
  return new Promise((resolve, reject) => {
    console.time("writeTimeStarted");
    if (time_global_obj.complete_time) {
      time_global_obj.time_index = 1e-2;
      time_global_obj.complete_time = false;
    }
    if (time_global_obj.time_index <= 26e3) {
      insertData(time_global_obj.time_index.toFixed(2), file_exists, file_path);
      time_global_obj.time_index = Number(
        (time_global_obj.time_index + 1e-2).toFixed(2)
      );
      file_exists = fs.existsSync(file_path);
    } else {
      time_global_obj.complete_time = true;
    }
    console.timeEnd("writeTimeStarted");
  });
};

// Inserting data in time file
const insertData = async (data, file_exists, file_path) => {
  file_exists = fs.existsSync(file_path);
  let time_obj = {
    TIMESTAMP: new Date().toISOString(),
    Well124: constant.DEPTH_DATA["Well124"],
    AZIMUTH: helper.getRandomNumber("AZIMUTH", 22, 338),
    BITWISE: helper.getRandomNumber("BITWISE", 12.25, 23.5),
    BPOS: helper.getRandomNumber("BPOS", 0, 30),
    DBTM: helper.getRandomNumber("DBTM", 0, 4000),
    DIFF: helper.getRandomNumber("DIFF", 0, 1000),
    DLS: helper.getRandomNumber("DLS", 0, 1000),
    GASA: helper.getRandomNumber("GASA", 0, 15),
    GR: helper.getRandomNumber("GR", 0, 1000),
    GTF: helper.getRandomNumber("GTF", 0, 1000),
    HKL: helper.getRandomNumber("HKL", 0, 1000),
    INCLINATION: helper.getRandomNumber("INCLINATION", 0.25, 65.0),
    MDOA: helper.getRandomNumber("MDOA", 0, 1000),
    MFI: helper.getRandomNumber("MFI", 0, 1000),
    MFOP: helper.getRandomNumber("MFOP", 0, 1000),
    MSE: helper.getRandomNumber("MSE", 0, 500000),
    MTF: helper.getRandomNumber("MTF", 0, 1000),
    MWIT: helper.getRandomNumber("MWIT", 1.0, 1.5),
    ONBTM: helper.getRandomNumber("ONBTM", 0, 1),
    ROP: helper.getRandomNumber("ROP", 0, 30),
    RPM: helper.getRandomNumber("RPM", 0, 200),
    SPM: helper.getRandomNumber("SPM", 0, 1000),
    SPP: helper.getRandomNumber("SPP", 300, 3000),
    TFLO: helper.getRandomNumber("TFLO", 500, 3600),
    DMEA: `${data}`,
    TQA: helper.getRandomNumber("TQA", 0.5, 25.0),
    TVA: helper.getRandomNumber("TVA", 0, 1000),
    TVD: helper.getRandomNumber("TVD", 2800, 3500),
    WOB: helper.getRandomNumber("WOB", 3, 30),
  };
  data = "";
  if (file_exists) {
    data = `\r\n`;
  }
  for (const key in time_obj) {
    if (key != "TIMESTAMP") {
      data = data + "\t";
    }
    data = data + time_obj[key];
  }
  fs.appendFileSync(file_path, data);
  producer.run("time", data);
  const count = await db["source_time"].countDocuments({});
  saveSourceTimeData(count, time_obj);
  createSourceParam(constant.SOURCE_PARAMETER);
  createTimeSourceLog(count, time_obj);
};

// Creating source_time in DB.
const saveSourceTimeData = (count, time_obj) => {
  try {
    let source_time_data = {};
    source_time_data.time = time_obj.TIMESTAMP;
    source_time_data.day = new Date(time_obj.TIMESTAMP).getDate();
    source_time_data.month = new Date(time_obj.TIMESTAMP).getMonth() + 1;
    source_time_data.year = new Date(time_obj.TIMESTAMP).getFullYear();
    source_time_data.id = count + 1;
    // source_time_data.id = time_global_obj.time_number;
    source_time_data.sourceid = time_global_obj.sourceid;
    source_time_data.sourcedata = time_obj;
    db["source_time"].create(source_time_data);
    // time_global_obj.time_number++;
  } catch (error) {
    console.log("error in saving the source time ========>", error);
  }
};

// Creating source_log for time.
const createTimeSourceLog = (count, time_obj) => {
  return new Promise(async (resolve, reject) => {
    if (!time_global_obj.isSourceLogCreated) {
      time_obj.SOURCEID = time_global_obj.sourceid;
      time_obj.log_data = "source_time_data";
      time_obj.log = "time";
      time_obj.count = count + 1;
      const source_log_obj = await helper.creatingSourceLogData(
        time_obj,
        constant.SOURCE_PARAMETER
      );
      const new_source_log = await db["source_log"].create(source_log_obj);
      time_global_obj.source_log_id = new_source_log._id.toString();
      time_global_obj.isSourceLogCreated = true;
    }

    // Updating the end time and end time in source_log
    else if (time_global_obj.isSourceLogCreated) {
      const source_log_obj = {
        end_time: time_obj.TIMESTAMP,
        end_depth: time_obj.DMEA,
        laststatusupdate: time_obj.TIMESTAMP,
        count: count + 1,
      };
      const source_log_update = await db["source_log"].updateOne(
        { _id: time_global_obj.source_log_id },
        source_log_obj
      );
    }
  });
};

/* ****************************************************** End Depth file *********************************************** */

const createSourceParam = (file_header) => {
  if (!time_global_obj.isParameterCreated) {
    console.log("Creating the source paramater document time");
    let all_parameter = [];
    for (let index = 0; index < file_header.length; index++) {
      const parameter_obj = {};
      const element = file_header[index];
      parameter_obj.parameter = element ? element : null;
      parameter_obj.std_mnemonic = constant.STD_MNEMONIC[element]
        ? constant.STD_MNEMONIC[element]
        : null;
      parameter_obj.std_mnemonic_displayname = constant
        .STD_MNEMONIC_DISPLAYNAME[element]
        ? constant.STD_MNEMONIC_DISPLAYNAME[element]
        : null;
      parameter_obj.unit = constant.UNIT[element]
        ? constant.UNIT[element]
        : null;
      parameter_obj.type = "java.util.String";
      if (element == "TIMESTAMP") {
        all_parameter.type = "java.util.Date";
      }
      parameter_obj.std_unit = constant.UNIT[element]
        ? constant.UNIT[element]
        : null;
      parameter_obj.description = constant.DESCRIPTION[element]
        ? constant.DESCRIPTION[element]
        : null;
      parameter_obj.source = null;
      parameter_obj.sourceid = time_global_obj.sourceid;
      all_parameter.push(parameter_obj);
    }
    const source_parameter = db["source_parameter"].insertMany(all_parameter);
    time_global_obj.isParameterCreated = true;
  }
};

// Exporting the required controller
module.exports = {
  initializeTime: initializeTime,
};
