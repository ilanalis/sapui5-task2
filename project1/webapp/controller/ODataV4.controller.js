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
          isDialogInEditMode: false,
        });
        this.getView().setModel(this._oConfigModel, "configModel");
      },

      _getInitialProductData() {
        return {
          Name: "",
          Description: "",
          ReleaseDate: null,
          Rating: null,
          Price: null,
        };
      },

      async onDeleteProductButtonPress() {
        const oModel = this.getModel("ODataV4");
        const oProductsList = this.byId("ODataV4List");
        const aSelectedProducts = oProductsList.getSelectedItems();
        const aSelectedProductsContexts = aSelectedProducts.map((product) =>
          product.getBindingContext("ODataV4")
        );

        try {
          aSelectedProductsContexts.map((ctx) => ctx.delete());
          await oModel.submitBatch("updateGroup");
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

      async onAddNewProductButtonPress() {
        const oModel = this.getModel("ODataV4");
        const oCreatedContext = oModel
          .bindList("/Products", null, null, null, {
            $$updateGroupId: "updateGroup",
          })
          .create(this._getInitialProductData(), true);

        this._oConfigModel.setProperty("/isDialogInEditMode", false);
        this._openProductFormDialog(oCreatedContext);
      },

      async _openProductFormDialog(oContext) {
        if (!this._oDialog) {
          this._oDialog = await this.loadFragment({
            name: "project1.view.fragment.ProductFormV4Dialog",
          });
        }

        const sDialogTitle = this._oConfigModel.getProperty(
          "/isDialogInEditMode"
        )
          ? this._oResourceBundle.getText("editProductDialogTitle")
          : this._oResourceBundle.getText("createProductDialogTitle");

        this._oDialog.setTitle(sDialogTitle);
        this._oDialog.setBindingContext(oContext, "ODataV4");
        this._oDialog.open();
      },

      async onDialogAddButtonPress() {
        const oModel = this.getModel("ODataV4");

        if (!this._validateForm()) {
          return;
        }

        try {
          await oModel.submitBatch("updateGroup");
          this._showMessageToast("productFormDialogProductCreatedSuccess");
          this._oConfigModel.setProperty("/isDialogInEditMode", false);
          this._oDialog.close();
          this.byId("ODataV4List").getBinding("items").refresh();
        } catch (oError) {
          MessageBox.error(oError.message);
        }
      },

      async onDialogCancelButtonPress() {
        const oDialogContext = this._oDialog.getBindingContext("ODataV4");
        await oDialogContext.delete();
        this._oDialog.close();
      },

      onTextInputLiveChange(oEvent) {
        const oControl = oEvent.getSource();
        const sValue = oControl.getValue()?.trim();

        oControl.setValueState(sValue ? "None" : "Error");
      },

      onPriceInputLiveChange(oEvent) {
        const oControl = oEvent.getSource();
        const iValue = parseFloat(oControl.getValue());
        const bIsInputValid = iValue > 0;

        oControl.setValueState(bIsInputValid ? "None" : "Error");
      },

      onReleaseDateChange(oEvent) {
        const oControl = oEvent.getSource();
        const bIsValid = oEvent.getParameter("valid");

        oControl.setValueState(bIsValid ? "None" : "Error");
      },

      onRatingChange(oEvent) {
        const nValue = oEvent.getParameter("value");

        if (nValue < 1) {
          oEvent.getSource().setValue(1);
        }
      },

      _validateForm() {
        const oProductForm = this.byId("productFormV4");
        const aInputs = oProductForm.getControlsByFieldGroupId("productData");
        var bIsValid = true;

        aInputs.forEach(function (oControl) {
          if (oControl.getValueState) {
            if (
              !oControl.isA("sap.m.RatingIndicator") &&
              !oControl.getValue()?.trim()
            ) {
              oControl.setValueState("Error");
            }
            if (oControl.getValueState() !== "None") {
              bIsValid = false;
            }
          }
        });
        return bIsValid;
      },

      _showMessageToast(sKey) {
        MessageToast.show(this._oResourceBundle.getText(sKey));
      },
    });
  }
);
