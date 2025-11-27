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

        this._oConfigModel = new JSONModel({
          isDeleteButtonEnabled: false,
          isFormValid: false,
        });
        this.getView().setModel(this._oConfigModel, "configModel");
      },

      _getAddNewProductDialogInitialData() {
        return {
          name: { value: "", valueState: "None" },
          description: { value: "", valueState: "None" },
          releaseDate: { value: "", valueState: "None", isValid: false },
          rating: { value: null, valueState: "None" },
          price: { value: null, valueState: "None" },
        };
      },

      async onAddProductButtonPress() {
        if (!this._oDialog) {
          this._oDialog = await this.loadFragment({
            name: "project1.view.fragment.AddNewProductDialog",
          });

          this._oDialog.setModel(this._oConfigModel, "configModel");
        }
        this._oConfigModel.setProperty(
          "/newProduct",
          this._getAddNewProductDialogInitialData()
        );
        this._oConfigModel.setProperty("/isFormValid", false);
        this._oDialog.open();
      },

      onInputLiveChange(oEvent) {
        const oControl = oEvent.getSource();
        const sPath = oControl.getBindingPath("value");
        let vValue = oControl.getValue();
        if (oControl.getType() === "Number") {
          vValue = vValue === "" ? 0 : parseFloat(vValue);
        }

        this._validateField(vValue, sPath);
        this._validateForm();
      },

      _validateField(vValue, sPath) {
        let isInputValid = true;

        if (typeof vValue === "number") {
          vValue = parseFloat(vValue);
          if (sPath.includes("rating")) {
            isInputValid = vValue >= 1 && vValue <= 5;
          } else if (sPath.includes("price")) {
            isInputValid = vValue > 0;
          }
        } else if (typeof vValue === "string") {
          isInputValid = !!vValue.trim();
        }

        this._oConfigModel.setProperty(sPath, vValue);

        this._oConfigModel.setProperty(
          sPath.replace("/value", "/valueState"),
          isInputValid ? "None" : "Error"
        );

        this._oConfigModel.setProperty(
          sPath.replace("/value", "/valueStateText"),
          !isInputValid && sPath.includes("rating")
            ? this._oResourceBundle.getText(
                "addNewProductDialogRatingOutOfRangeError"
              )
            : ""
        );
      },

      _validateForm() {
        const oData = this._oConfigModel.getData();
        let bIsValid = true;
        for (const sField in oData.newProduct) {
          const oFieldData = oData.newProduct[sField];
          if (oFieldData.valueState !== "None") {
            bIsValid = false;
          }
        }
        if (!oData.newProduct.releaseDate.isValid) {
          bIsValid = false;
        }

        this._oConfigModel.setProperty("/isFormValid", bIsValid);
      },

      onReleaseDateChange(oEvent) {
        const bIsValid = oEvent.getParameter("valid");
        this._oConfigModel.setProperty(
          "/newProduct/releaseDate/isValid",
          bIsValid
        );
        if (bIsValid) {
          this._oConfigModel.setProperty(
            "/newProduct/releaseDate/valueState",
            "None"
          );
        } else {
          this._oConfigModel.setProperty(
            "/newProduct/releaseDate/valueState",
            "Error"
          );
        }
        this._validateForm();
      },

      onAddnewProductDialogAddButtonPress() {
        const oModel = this.getModel("ODataV2");
        const oNewProduct = this._oConfigModel.getData().newProduct;
        const oPayload = {
          Name: oNewProduct.name.value,
          Description: oNewProduct.description.value,
          ReleaseDate: new Date(oNewProduct.releaseDate.value),
          Rating: parseInt(oNewProduct.rating.value, 10),
          Price: parseFloat(oNewProduct.price.value),
        };

        oModel.create("/Products", oPayload, {
          success: () =>
            this._showMessageToast("addNewProductDialogProductCreatedSuccess"),
          error: () =>
            this._showMessageToast("addNewProductDialogProductCreatedError"),
        });
      },

      onAddNewProductDialogCancelButtonPress() {
        this._oDialog.close();
      },

      onDeleteProductButtonPress() {
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
