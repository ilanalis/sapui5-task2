sap.ui.define(["sap/ui/core/mvc/Controller"], (Controller) => {
  "use strict";
  return Controller.extend("project1.controller.BaseController", {
    getModel(sName) {
      return this.getView().getModel(sName);
    },

    handleTableSelectionChange(oEvent, sModelName) {
      this.getModel(sModelName).setProperty(
        "/isDeleteButtonEnabled",
        !!oEvent.getSource().getSelectedItems().length
      );
    },

    submitODataChanges(oModel) {
      return new Promise((resolve, reject) => {
        oModel.submitChanges({
          success: resolve,
          error: reject,
        });
      });
    },
  });
});
