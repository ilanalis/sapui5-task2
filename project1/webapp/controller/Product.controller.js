sap.ui.define(
  [
    "project1/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "sap/m/MessageToast",
    "../model/constants",
  ],
  (BaseController, JSONModel, History, MessageToast, constants) => {
    "use strict";

    return BaseController.extend("project1.controller.Product", {
      onInit() {
        this._oResourceBundle = this.getOwnerComponent()
          .getModel("i18n")
          .getResourceBundle();

        this.oViewModel = new JSONModel({
          currency: "EUR",
        });
        this.getView().setModel(this.oViewModel, "view");
        const oRouter = this.getOwnerComponent().getRouter();
        oRouter
          .getRoute("product")
          .attachPatternMatched(this.onObjectMatched, this);
      },

      onObjectMatched(oEvent) {
        this.getView().bindElement({
          path: `/Products(${window.decodeURIComponent(
            oEvent.getParameter("arguments").productPath
          )})`,
          model: "ODataV2",
          parameters: { expand: "Supplier" },
        });
        const sMode = oEvent.getParameter("arguments").mode;
        this.oViewModel.setProperty(
          "/isEditMode",
          sMode === constants.APP_MODE.EDIT
        );
      },

      onNavBack() {
        const oHistory = History.getInstance();
        const sPreviousHash = oHistory.getPreviousHash();

        if (sPreviousHash !== undefined) {
          window.history.go(-1);
        } else {
          const oRouter = this.getOwnerComponent().getRouter();
          oRouter.navTo("tab", { tabName: "ODataV2" }, true);
        }
      },

      onEdit() {
        this._setEditMode(true);
      },

      onCancel() {
        const oModel = this.getModel("ODataV2");
        oModel.resetChanges();
        this._setEditMode(false);
      },

      async onSave() {
        const oModel = this.getModel("ODataV2");
        if (!oModel.hasPendingChanges()) {
          this._showMessageToast("noChangesToSaveMessageText");
          return;
        }

        if (!this._validateForm()) {
          return;
        }

        try {
          await this.submitODataChanges(oModel);
          this._showMessageToast("productUpdatedSuccess");
          this._setEditMode(false);
        } catch (e) {
          this._showMessageToast("productUpdatedError");
        }
      },

      _setEditMode(bIsEditMode) {
        const oContext = this.getView().getBindingContext("ODataV2");
        const sId = oContext.getProperty("ID");
        const oRouter = this.getOwnerComponent().getRouter();

        oRouter.navTo("product", {
          productPath: sId,
          mode: bIsEditMode
            ? constants.APP_MODE.EDIT
            : constants.APP_MODE.DISPLAY,
        });
        this.oViewModel.setProperty("/isEditMode", bIsEditMode);
      },

      _showMessageToast(sKey) {
        MessageToast.show(this._oResourceBundle.getText(sKey));
      },

      _validateForm() {
        const oProductForm = this.byId("productForm");
        const aInputs = oProductForm.getControlsByFieldGroupId("productUpdate");
        var bIsValid = true;

        aInputs.forEach(function (oControl) {
          if (oControl.getValueState) {
            if (oControl.getValueState() !== "None") {
              bIsValid = false;
            }
          }
        });
        return bIsValid;
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
    });
  }
);
