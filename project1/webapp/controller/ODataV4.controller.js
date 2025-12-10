sap.ui.define(
  [
    "project1/controller/BaseController",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
  ],
  (BaseController, MessageToast, MessageBox, JSONModel) => {
    "use strict";

    return BaseController.extend("project1.controller.ODataV4", {
      onInit() {
        this._oResourceBundle = this.getOwnerComponent()
          .getModel("i18n")
          .getResourceBundle();

        this._oConfigModel = new JSONModel({
          isDeleteButtonEnabled: false,
        });
        this.getView().setModel(this._oConfigModel, "configModel");
      },

      async onDeleteProductButtonPress() {
        const oModel = this.getModel("ODataV4");
        const oProductsList = this.byId("ODataV4List");
        const aSelectedProducts = oProductsList.getSelectedItems();
        const aSelectedProductsContexts = aSelectedProducts.map((product) =>
          product.getBindingContext("ODataV4")
        );
        const aDelitionPromises = aSelectedProductsContexts.map((ctx) =>
          ctx.delete()
        );

        try {
          await Promise.all(aDelitionPromises);
          await oModel.submitBatch("$auto");
          MessageToast.show(
            this._oResourceBundle.getText("recordsDeletedSuccess")
          );
          oProductsList.removeSelections(true);
        } catch (oError) {
          MessageBox.error(oError.message);
        }
      },

      onProductsTableSelectionChange(oEvent) {
        this.handleTableSelectionChange(oEvent, "configModel");
      },
    });
  }
);
