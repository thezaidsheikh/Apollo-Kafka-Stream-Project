function getRandomNumber(field_name) {
  try {
    switch (field_name) {
      case "RPM":
        return Math.floor(Math.random() * 99);
        break;
      case "SPM1":
        return Math.floor(Math.random() * 100);
        break;
      case "SPM2":
        return Math.floor(Math.random() * 100);
        break;
      case "SPP":
        return (Math.random() * 1000.00).toFixed(2);
        break;
      case "BPOS":
        return (Math.random() * 1000.00).toFixed(2);
        break;
      case "DBTM":
        return (Math.random() * 99.00).toFixed(2);
        break;
      case "HKLD":
        return (Math.random() * 100.00).toFixed(2);
        break;
      case "HKLX":
        return (Math.random() * 100.00).toFixed(2);
        break;
      case "WOB":
        return (Math.random() * 100.00).toFixed(2);
        break;
      case "WOBX":
        return (Math.random() * 100.00).toFixed(2);
        break;
      case "ROP":
        return (Math.random() * 100.00).toFixed(2);
        break;
      case "TOR":
        return (Math.random() * 100.00).toFixed(2);
        break;
      case "TQX":
        return (Math.random() * 100.00).toFixed(2);
        break;

      default:
        break;
    }
  } catch (error) {
    console.log("error in randomization ============>", error);
  }
}

// Exporting required modules
module.exports = {
  getRandomNumber: getRandomNumber,
};
