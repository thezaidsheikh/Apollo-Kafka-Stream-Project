const constant = require("../constant");

// Generate random number
function getRandomNumber(field_name, min, max) {
  try {
    switch (field_name) {
      case "AZIMUTH":
        return Math.floor(Math.random() * (max - min + 1) + min);
        break;
      case "BITWISE":
        return (Math.random() * (max - min + 1) + min).toFixed(2);
        break;
      case "BPOS":
        return Math.floor(Math.random() * (max - min + 1) + min);
        break;
      case "DBTM":
        return Math.floor(Math.random() * (max - min + 1) + min);
        break;
      case "DIFF":
        return Math.floor(Math.random() * (max - min + 1) + min);
        break;
      case "DLS":
        return Math.floor(Math.random() * (max - min + 1) + min);
        break;
      case "GASA":
        return Math.floor(Math.random() * (max - min + 1) + min);
        break;
      case "GR":
        return Math.floor(Math.random() * (max - min + 1) + min);
        break;
      case "GTF":
        return Math.floor(Math.random() * (max - min + 1) + min);
        break;
      case "HKL":
        return Math.floor(Math.random() * (max - min + 1) + min);
        break;
      case "INCLINATION":
        return (Math.random() * (max - min + 1) + min).toFixed(2);
        break;
      case "MDOA":
        return Math.floor(Math.random() * (max - min + 1) + min);
        break;
      case "MFI":
        return Math.floor(Math.random() * (max - min + 1) + min);
        break;
      case "MFOP":
        return Math.floor(Math.random() * (max - min + 1) + min);
        break;
      case "MSE":
        return Math.floor(Math.random() * (max - min + 1) + min);
        break;
      case "MTF":
        return Math.floor(Math.random() * (max - min + 1) + min);
        break;
      case "MWIT":
        return (Math.random() * (max - min + 1) + min).toFixed(2);
        break;
      case "ONBTM":
        return Math.floor(Math.random() * (max - min + 1) + min);
        break;
      case "ROP":
        return Math.floor(Math.random() * (max - min + 1) + min);
        break;
      case "RPM":
        return Math.floor(Math.random() * (max - min + 1) + min);
        break;
      case "SPM":
        return Math.floor(Math.random() * (max - min + 1) + min);
        break;
      case "SPP":
        return Math.floor(Math.random() * (max - min + 1) + min);
        break;
      case "TFLO":
        return Math.floor(Math.random() * (max - min + 1) + min);
        break;
      case "TQA":
        return (Math.random() * (max - min + 1) + min).toFixed(2);
        break;
      case "TVA":
        return Math.floor(Math.random() * (max - min + 1) + min);
        break;
      case "TVD":
        return Math.floor(Math.random() * (max - min + 1) + min);
        break;
      case "WOB":
        return Math.floor(Math.random() * (max - min + 1) + min);
        break;
      default:
        break;
    }
  } catch (error) {
    console.log("error in randomization ============>", error);
  }
}

// Arrange the data to insert in source_log table.
const creatingSourceLogData = (record, file_header) => {
  return new Promise((resolve, reject) => {
    let sourceLogObj = constant.SOURCE_LOG_DATA;
    sourceLogObj.start_time = record.TIMESTAMP;
    sourceLogObj.end_time = record.TIMESTAMP;
    sourceLogObj.sourceid = record.SOURCEID;
    sourceLogObj.start_depth = record.DMEA;
    sourceLogObj.end_depth = record.DMEA;
    sourceLogObj.log = record.log;
    sourceLogObj.count = record.count;
    sourceLogObj.laststatusupdate = new Date().toISOString();
    sourceLogObj.log_data = record.log_data;
    sourceLogObj.stdMnemonicsData = file_header.map((header) => {
      let stdMnemonicsObj = {};
      stdMnemonicsObj.std_mnemonic = constant.STD_MNEMONIC[header]
        ? constant.STD_MNEMONIC[header]
        : null;
      stdMnemonicsObj.std_unit = constant.UNIT[header]
        ? constant.UNIT[header]
        : null;
      stdMnemonicsObj.std_mnemonic_displayname = constant.STD_MNEMONIC[header]
        ? constant.STD_MNEMONIC[header]
        : null;
      return stdMnemonicsObj;
    });
    resolve(sourceLogObj);
  });
};

// Exporting required modules
module.exports = {
  getRandomNumber: getRandomNumber,
  creatingSourceLogData: creatingSourceLogData,
};
