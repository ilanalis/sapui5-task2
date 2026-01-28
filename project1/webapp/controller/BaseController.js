sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/ui/core/routing/History"],
  (Controller, History) => {
    "use strict";
    return Controller.extend("project1.controller.BaseController", {
      getModel(sName) {
        return this.getView().getModel(sName);
      },

      handleTableSelectionChange(oEvent, sModelName) {
        this.getModel(sModelName).setProperty(
          "/isDeleteButtonEnabled",
          !!oEvent.getSource().getSelectedItems().length,
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
      onNavBack() {
        const oHistory = History.getInstance();
        const sPreviousHash = oHistory.getPreviousHash();

        if (sPreviousHash !== undefined) {
          window.history.go(-1);
        } else {
          const oRouter = this.getOwnerComponent().getRouter();
          oRouter.navTo("tab", { tabName: "JSONModel" }, true);
        }
      },
    });
  },
);
