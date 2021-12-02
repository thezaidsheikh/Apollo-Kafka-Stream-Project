const db = require("../models");
const LineByLineReader = require("line-by-line");
const constant = require("../constant");
const ObjectId = require("mongodb").ObjectId;
const fs = require("fs");
const helper = require("../helper");
const { join } = require("path");

// Global object to use for depth source.
var depth_global_obj = {
  isSourceLogCreated: false,
  isParameterCreated: false,
  source_log_id: null,
  complete_depth: false,
  depth_index: 0.0,
  depth_number: 1,
  sourceid: ObjectId().toString(),
};
/* ****************************************************** Depth file *********************************************** */

// Initializing depth program.
const initializeDepth = async () => {
  try {
    let file_path = join(process.cwd(), "../log_depth_data.txt");
    let file_exists = fs.existsSync(file_path);
    setInterval(() => {
      writeDepthTxt(file_path, file_exists);
    }, 60000);
  } catch (error) {
    console.log("error in creating a file ====================>", error);
  }
};

// Program that will continously run
const writeDepthTxt = async (file_path, file_exists) => {
  return new Promise((resolve, reject) => {
    console.time("writeDepthStarted");
    if (depth_global_obj.complete_depth) {
      depth_global_obj.depth_index = 1e-2;
      depth_global_obj.complete_depth = false;
    }
    if (depth_global_obj.depth_index <= 26e3) {
      insertData(
        depth_global_obj.depth_index.toFixed(2),
        file_exists,
        file_path
      );
      depth_global_obj.depth_index = Number(
        (depth_global_obj.depth_index + 1e-2).toFixed(2)
      );
      file_exists = fs.existsSync(file_path);
    } else {
      depth_global_obj.complete_depth = true;
    }
    console.timeEnd("writeDepthStarted");
  });
};

// Inserting data in depth file
const insertData = async (data, file_exists, file_path) => {
  file_exists = fs.existsSync(file_path);
  let depth_obj = {
    DMEA: `${data}`,
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
    TIMESTAMP: new Date().toISOString(),
    TQA: helper.getRandomNumber("TQA", 0.5, 25.0),
    TVA: helper.getRandomNumber("TVA", 0, 1000),
    TVD: helper.getRandomNumber("TVD", 2800, 3500),
    WOB: helper.getRandomNumber("WOB", 3, 30),
  };
  data = "";
  if (file_exists) {
    data = `\r\n`;
  }
  for (const key in depth_obj) {
    if (key != "DMEA") {
      data = data + "\t";
    }
    data = data + depth_obj[key];
  }

  // data = data + depth_obj["DMEA"];
  // data = data + "\t" + depth_obj["Well124"];
  // data = data + "\t" + depth_obj["RPM"];
  // data = data + "\t" + depth_obj["SPM1"];
  // data = data + "\t" + depth_obj["SPM2"];
  // data = data + "\t" + depth_obj["SPP"];
  // data = data + "\t" + depth_obj["BPOS"];
  // data = data + "\t" + depth_obj["DBTM"];
  // data = data + "\t" + depth_obj["DATEANDTIME"];
  // data = data + "\t" + depth_obj["HKLD"];
  // data = data + "\t" + depth_obj["HKLX"];
  // data = data + "\t" + depth_obj["WOB"];
  // data = data + "\t" + depth_obj["WOBX"];
  // data = data + "\t" + depth_obj["ROP"];
  // data = data + "\t" + depth_obj["TOR"];
  // data = data + "\t" + depth_obj["TQX"];

  fs.appendFileSync(file_path, data);
  const count = await db["source_time"].countDocuments({});
  saveSourceDepthData(count, depth_obj);
  createSourceParam(constant.SOURCE_PARAMETER);
  createDepthSourceLog(count, depth_obj);
};

// Creating source_depth in DB.
const saveSourceDepthData = (count, depth_obj) => {
  try {
    let source_depth_data = {};
    source_depth_data.depth = count;
    // source_depth_data.depth = depth_global_obj.depth_number;
    source_depth_data.id = count;
    // source_depth_data.id = depth_global_obj.depth_number;
    source_depth_data.sourceid = depth_global_obj.sourceid;
    source_depth_data.sourcedata = depth_obj;
    db["source_depth"].create(source_depth_data);
    // depth_global_obj.depth_number++;
  } catch (error) {
    console.log("error in saving the source depth ========>", error);
  }
};

// Creating source_log for depth.
const createDepthSourceLog = (count, depth_obj) => {
  return new Promise(async (resolve, reject) => {
    if (!depth_global_obj.isSourceLogCreated) {
      depth_obj.SOURCEID = depth_global_obj.sourceid;
      depth_obj.log_data = "source_depth_data";
      depth_obj.log = "depth";
      depth_obj.count = 0;
      const source_log_obj = await helper.creatingSourceLogData(
        depth_obj,
        constant.SOURCE_PARAMETER
      );
      const new_source_log = await db["source_log"].create(source_log_obj);
      depth_global_obj.source_log_id = new_source_log._id.toString();
      depth_global_obj.isSourceLogCreated = true;
    }

    // Updating the end time and end depth in source_log
    else if (depth_global_obj.isSourceLogCreated) {
      const source_log_obj = {
        end_time: depth_obj.TIMESTAMP,
        end_depth: depth_obj.DMEA,
        laststatusupdate: depth_obj.TIMESTAMP,
        count: count,
      };
      const source_log_update = await db["source_log"].updateOne(
        { _id: depth_global_obj.source_log_id },
        source_log_obj
      );
    }
  });
};

/* ****************************************************** End Depth file *********************************************** */

const createSourceParam = (file_header) => {
  if (!depth_global_obj.isParameterCreated) {
    console.log("Creating the source paramater document depth");
    let all_parameter = [];
    for (let index = 0; index < file_header.length; index++) {
      const parameter_obj = {};
      const element = file_header[index];
      parameter_obj.parameter = element ? element : null;
      parameter_obj.std_mnemonic = constant.STD_MNEMONIC[element]
        ? constant.STD_MNEMONIC[element]
        : null;
      parameter_obj.std_mnemonic_displayname = constant.STD_MNEMONIC[element]
        ? constant.STD_MNEMONIC[element]
        : null;
      parameter_obj.unit = constant.UNIT[element]
        ? constant.UNIT[element]
        : null;
      parameter_obj.type = "java.util.String";
      if (element == "TIMESTAMP") {
        parameter_obj.type = "java.util.Date";
      }
      parameter_obj.std_unit = constant.UNIT[element]
        ? constant.UNIT[element]
        : null;
      parameter_obj.description = constant.DESCRIPTION[element]
        ? constant.DESCRIPTION[element]
        : null;
      parameter_obj.source = null;
      parameter_obj.sourceid = depth_global_obj.sourceid;
      all_parameter.push(parameter_obj);
    }
    const source_parameter = db["source_parameter"].insertMany(all_parameter);
    depth_global_obj.isParameterCreated = true;
  }
};

// Exporting the required controller
module.exports = {
  initializeDepth: initializeDepth,
};
