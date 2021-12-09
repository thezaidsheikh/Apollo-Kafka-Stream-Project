const db = require("../models");
const LineByLineReader = require("line-by-line");
const constant = require("../constant");
const ObjectId = require("mongodb").ObjectId;
const fs = require("fs");
const helper = require("../helper");
const { join } = require("path");

// Global object to use for time source.
var sec_time_global_obj = {
  isSourceLogCreated: false,
  isParameterCreated: false,
  source_log_id: null,
  complete_time: false,
  sec_time_index: 0.0,
  sec_time_number: 1,
  sourceid: ObjectId().toString(),
};

/* ****************************************************** Time file *********************************************** */

// Initializing time program.
const initializeSecTime = async () => {
  try {
    let file_path = join(process.cwd(), "../log_sec_time_data.txt");
    let file_exists = fs.existsSync(file_path);
    writeSecTimeTxt(file_path, file_exists);
    setInterval(() => {
      writeSecTimeTxt(file_path, file_exists);
    }, 10000);
  } catch (error) {
    console.log("error in creating a file ====================>", error);
  }
};

// Program that will continously run
const writeSecTimeTxt = async (file_path, file_exists) => {
  return new Promise((resolve, reject) => {
    console.time("writeSecTimeStarted");
    if (sec_time_global_obj.complete_time) {
      sec_time_global_obj.sec_time_index = 1e-2;
      sec_time_global_obj.complete_time = false;
    }
    if (sec_time_global_obj.sec_time_index <= 26e3) {
      insertData(
        sec_time_global_obj.sec_time_index.toFixed(2),
        file_exists,
        file_path
      );
      sec_time_global_obj.sec_time_index = Number(
        (sec_time_global_obj.sec_time_index + 1e-2).toFixed(2)
      );
      file_exists = fs.existsSync(file_path);
    } else {
      sec_time_global_obj.complete_time = true;
    }
    console.timeEnd("writeSecTimeStarted");
  });
};

// Inserting data in second time file
const insertData = async (data, file_exists, file_path) => {
  file_exists = fs.existsSync(file_path);
  let sec_time_obj = {
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
  for (const key in sec_time_obj) {
    if (key != "TIMESTAMP") {
      data = data + "\t";
    }
    data = data + sec_time_obj[key];
  }
  fs.appendFileSync(file_path, data);
  const count = await db["source_sec"].countDocuments({});
  saveSourceSecTimeData(count, sec_time_obj);
  createSourceParam(constant.SOURCE_PARAMETER);
  createSecTimeSourceLog(count, sec_time_obj);
};

// Creating source_sec_time in DB.
const saveSourceSecTimeData = (count, sec_time_obj) => {
  try {
    let source_time_data = {};
    source_time_data.time = sec_time_obj.TIMESTAMP;
    source_time_data.day = new Date(sec_time_obj.TIMESTAMP).getDate();
    source_time_data.month = new Date(sec_time_obj.TIMESTAMP).getMonth() + 1;
    source_time_data.year = new Date(sec_time_obj.TIMESTAMP).getFullYear();
    source_time_data.id = count + 1;
    // source_time_data.id = sec_time_global_obj.sec_time_number;
    source_time_data.sourceid = sec_time_global_obj.sourceid;
    source_time_data.sourcedata = sec_time_obj;
    db["source_sec"].create(source_time_data);
    // sec_time_global_obj.sec_time_number++;
  } catch (error) {
    console.log("error in saving the source time ========>", error);
  }
};

// Creating source_log for time.
const createSecTimeSourceLog = (count, sec_time_obj) => {
  return new Promise(async (resolve, reject) => {
    if (!sec_time_global_obj.isSourceLogCreated) {
      sec_time_obj.SOURCEID = sec_time_global_obj.sourceid;
      sec_time_obj.log_data = "source_sec_data";
      sec_time_obj.log = "second";
      sec_time_obj.count = count + 1;
      const source_log_obj = await helper.creatingSourceLogData(
        sec_time_obj,
        constant.SOURCE_PARAMETER
      );
      const new_source_log = await db["source_log"].create(source_log_obj);
      sec_time_global_obj.source_log_id = new_source_log._id.toString();
      sec_time_global_obj.isSourceLogCreated = true;
    }

    // Updating the end time and end time in source_log
    else if (sec_time_global_obj.isSourceLogCreated) {
      const source_log_obj = {
        end_time: sec_time_obj.TIMESTAMP,
        end_depth: sec_time_obj.DMEA,
        laststatusupdate: sec_time_obj.TIMESTAMP,
        count: count + 1,
      };
      const source_log_update = await db["source_log"].updateOne(
        { _id: sec_time_global_obj.source_log_id },
        source_log_obj
      );
    }
  });
};

/* ****************************************************** End Depth file *********************************************** */

const createSourceParam = (file_header) => {
  if (!sec_time_global_obj.isParameterCreated) {
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
      parameter_obj.sourceid = sec_time_global_obj.sourceid;
      all_parameter.push(parameter_obj);
    }
    const source_parameter = db["source_parameter"].insertMany(all_parameter);
    sec_time_global_obj.isParameterCreated = true;
  }
};

// Exporting the required controller
module.exports = {
  initializeSecTime: initializeSecTime,
};
