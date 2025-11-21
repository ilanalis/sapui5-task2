sap.ui.define([], () => {
  "use strict";

  return {
    getYearFromDate(sDate) {
      return sDate.split("-")[0];
    },

    formatDate(value) {
      if (!value) return "";
      const d = new Date(value);
      if (isNaN(d)) return value;
      return d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    },
  };
});
