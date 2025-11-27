sap.ui.define(
  [
    "project1/controller/BaseController",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
  ],
  (BaseController, MessageToast, MessageBox, JSONModel) => {
    "use strict";

    return BaseController.extend("project1.controller.ODataV2", {
      onInit() {
        this._oResourceBundle = this.getOwnerComponent()
          .getModel("i18n")
          .getResourceBundle();

        this._oConfigModel = new JSONModel({
          isDeleteButtonEnabled: false,
        });
        this.getView().setModel(this._oConfigModel, "configModel");
      },

      _getAddNewProductDialogInitialData() {
        return {
          name: { value: "", valueState: "None", isValid: false },
          description: { value: "", valueState: "None", isValid: false },
          releaseDate: { value: "", valueState: "None", isValid: false },
          rating: { value: null, valueState: "None", isValid: false },
          price: { value: null, valueState: "None", isValid: false },
        };
      },

      async onAddProductButtonPress() {
        if (!this._oDialog) {
          this._oDialog = await this.loadFragment({
            name: "project1.view.fragment.AddNewProductDialog",
          });

          this._oDialog.bindObject({
            path: "/newProduct",
            model: "configModel",
          });
        }
        this._oConfigModel.setProperty(
          "/newProduct",
          this._getAddNewProductDialogInitialData()
        );
        this._oDialog.open();
      },

      onTextInputLiveChange(oEvent) {
        const oControl = oEvent.getSource();
        const sPath = oControl.getBindingPath("value").split("/")[0];
        let sValue = oControl.getValue()?.trim();

        this._oConfigModel.setProperty(
          `/newProduct/${sPath}/valueState`,
          sValue ? "None" : "Error"
        );

        this._oConfigModel.setProperty(
          `/newProduct/${sPath}/isValid`,
          !!sValue
        );
      },

      onPriceInputLiveChange(oEvent) {
        const oControl = oEvent.getSource();
        const sPath = oControl.getBindingPath("value").split("/")[0];
        let iValue = parseFloat(oControl.getValue());
        const bIsInputValid = iValue > 0;

        this._oConfigModel.setProperty(
          `/newProduct/${sPath}/valueState`,
          bIsInputValid ? "None" : "Error"
        );

        this._oConfigModel.setProperty(
          `/newProduct/${sPath}/isValid`,
          bIsInputValid
        );
      },

      onRatingInputLiveChange(oEvent) {
        const oControl = oEvent.getSource();
        const sPath = oControl.getBindingPath("value").split("/")[0];
        let iValue = parseFloat(oControl.getValue());
        const bIsInputValid = iValue >= 1 && iValue <= 5;

        this._oConfigModel.setProperty(
          `/newProduct/${sPath}/valueState`,
          bIsInputValid ? "None" : "Error"
        );

        this._oConfigModel.setProperty(
          `/newProduct/${sPath}/isValid`,
          bIsInputValid
        );
      },

      _validateForm() {
        const oNewProductData = this._oConfigModel.getProperty("/newProduct");
        let bIsValid = true;
        for (const sField in oNewProductData) {
          const oFieldData = oNewProductData[sField];

          bIsValid = oFieldData.isValid;
          this._oConfigModel.setProperty(
            `/newProduct/${sField}/valueState`,
            oFieldData.isValid ? "None" : "Error"
          );
        }

        return bIsValid;
      },

      onReleaseDateChange(oEvent) {
        const bIsValid = oEvent.getParameter("valid");
        this._oConfigModel.setProperty(
          "/newProduct/releaseDate/isValid",
          bIsValid
        );

        this._oConfigModel.setProperty(
          "/newProduct/releaseDate/valueState",
          bIsValid ? "None" : "Error"
        );
      },

      onAddNewProductDialogAddButtonPress() {
        if (this._validateForm()) {
          this._onCreateNewProduct();
        }
      },

      _onCreateNewProduct() {
        const oModel = this.getModel("ODataV2");
        const oNewProduct = this._oConfigModel.getProperty("/newProduct");
        const oPayload = {
          Name: oNewProduct.name.value,
          Description: oNewProduct.description.value,
          ReleaseDate: new Date(oNewProduct.releaseDate.value),
          Rating: parseInt(oNewProduct.rating.value, 10),
          Price: parseFloat(oNewProduct.price.value),
        };

        oModel.create("/Products", oPayload, {
          success: () => {
            this._showMessageToast("addNewProductDialogProductCreatedSuccess");
            this._oDialog.close();
          },
          error: (oError) => MessageBox.error(oError.message),
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
