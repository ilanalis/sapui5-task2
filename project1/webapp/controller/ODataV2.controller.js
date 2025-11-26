sap.ui.define(
  [
    "project1/controller/BaseController",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
  ],
  (BaseController, MessageToast, JSONModel) => {
    "use strict";

    return BaseController.extend("project1.controller.ODataV2", {
      onInit() {
        this._oResourceBundle = this.getOwnerComponent()
          .getModel("i18n")
          .getResourceBundle();

        this._configModel = new JSONModel({
          isDeleteButtonEnabled: false,
        });
        this.getView().setModel(this._configModel, "configModel");
      },

      onDeleteRecordButtonPress() {
        const oModel = this.getModel("ODataV2");
        const oProductsList = this.byId("ODataV2List");
        const aSelectedProducts = oProductsList.getSelectedContexts();
        const aSelectedProductIds = aSelectedProducts.map(
          (ctx) => ctx.getObject().ID
        );
        aSelectedProductIds.forEach((id) => {
          oModel.remove(`/Products(${id})`);
        });

        oModel.submitChanges({
          success: () => this._showMessageToast("recordsDeletedSuccess"),
          error: () => this._showMessageToast("recordsDeletedError"),
        });
        oProductsList.removeSelections(true);
      },

      _showMessageToast(sKey) {
        MessageToast.show(this._oResourceBundle.getText(sKey));
      },

      onProductsTableSelectionChange(oEvent) {
        this.handleTableSelectionChange(oEvent, "configModel");
      },
    });
  }
);
