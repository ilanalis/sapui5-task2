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
          isDialogInEditMode: false,
          editProductPath: "",
        });
        this.getView().setModel(this._oConfigModel, "configModel");
      },

      _getDialogFormData(oContext) {
        const formData = {
          name: { value: "", valueState: "None", isValid: false },
          description: { value: "", valueState: "None", isValid: false },
          releaseDate: { value: null, valueState: "None", isValid: false },
          rating: { value: null, valueState: "None", isValid: false },
          price: { value: null, valueState: "None", isValid: false },
        };
        if (oContext) {
          const oModel = this.getModel("ODataV2");
          const sPath = oContext.getPath();
          for (const field in formData) {
            const formattedField = `${sPath}/${
              field[0].toUpperCase() + field.slice(1)
            }`;
            formData[field].value = oModel.getProperty(formattedField);
            formData[field].isValid = true;
          }
        }
        return formData;
      },

      onAddNewProductButtonPress() {
        this._onOpenProductDialog();
      },

      onEditProductButtonPress(oEvent) {
        this._onOpenProductDialog(
          oEvent.getSource().getBindingContext("ODataV2")
        );
      },

      async _onOpenProductDialog(oContext) {
        if (!this._oDialog) {
          this._oDialog = await this.loadFragment({
            name: "project1.view.fragment.ProductFormDialog",
          });
        }
        this._oDialog.bindObject({
          path: "/newProduct",
          model: "configModel",
        });

        const isEditing = !!oContext;

        this._oConfigModel.setProperty("/isDialogInEditMode", isEditing);

        let dialogData;
        if (isEditing) {
          dialogData = this._getDialogFormData(oContext);
          this._oConfigModel.setProperty(
            "/editProductPath",
            oContext.getPath()
          );
        } else {
          dialogData = this._getDialogFormData();
          this._oConfigModel.setProperty("/editProductPath", "");
        }

        this._oConfigModel.setProperty("/newProduct", dialogData);
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

      onProductFormDialogAddButtonPress() {
        if (this._validateForm()) {
          this._onCreateNewProduct();
        }
      },

      onProductFormDialogSaveButtonPress() {
        if (this._validateForm()) {
          this._onUpdateProduct();
        }
      },

      _onUpdateProduct() {
        const oModel = this.getModel("ODataV2");
        const sEditPath = this._oConfigModel.getProperty("/editProductPath");
        const oNewProduct = this._oConfigModel.getProperty("/newProduct");
        const oPayload = this._getPayload(oNewProduct);
        oModel.update(sEditPath, oPayload, {
          success: () => {
            this._showMessageToast("productFormDialogProductUpdatedSuccess");
            this._oDialog.close();
          },
          error: (oError) => MessageBox.error(oError.message),
        });
      },

      _onCreateNewProduct() {
        const oModel = this.getModel("ODataV2");
        const oNewProduct = this._oConfigModel.getProperty("/newProduct");
        const oPayload = this._getPayload(oNewProduct);

        oModel.create("/Products", oPayload, {
          success: () => {
            this._showMessageToast("productFormDialogProductCreatedSuccess");
            this._oDialog.close();
          },
          error: (oError) => MessageBox.error(oError.message),
        });
      },

      _getPayload(oNewProduct) {
        return {
          Name: oNewProduct.name.value,
          Description: oNewProduct.description.value,
          ReleaseDate: new Date(oNewProduct.releaseDate.value),
          Rating: parseInt(oNewProduct.rating.value, 10),
          Price: parseFloat(oNewProduct.price.value),
        };
      },

      onDialogCancelButtonPress() {
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
