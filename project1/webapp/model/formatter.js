sap.ui.define([], () => {
  "use strict";

  return {
    getYearFromDate(sDate) {
      return sDate.split("-")[0];
    },
  };
});
