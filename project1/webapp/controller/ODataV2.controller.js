sap.ui.define(
  [
    "project1/controller/BaseController",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "../model/constants",
  ],
  (
    BaseController,
    MessageToast,
    MessageBox,
    JSONModel,
    Filter,
    FilterOperator,
    Sorter,
    constants
  ) => {
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

      onFilterProductsByProductName(oEvent) {
        const aFilter = [];
        const sQuery = oEvent.getParameter("newValue");
        if (sQuery) {
          aFilter.push(new Filter("Name", FilterOperator.Contains, sQuery));
        }

        const oList = this.byId("ODataV2List");
        const oBinding = oList.getBinding("items");
        oBinding.filter(aFilter);
      },

      onSorterProducts(oEvent) {
        const oSelectedItem = oEvent.getParameter("selectedItem");
        const sSortPath = oSelectedItem.getKey();
        const oList = this.byId("ODataV2List");
        const oBinding = oList.getBinding("items");
        oBinding.sort([new Sorter(sSortPath, true)]);
      },

      _getDialogFormData(oContext) {
        const oFormData = {
          name: { value: "", valueState: "None", isValid: false },
          description: { value: "", valueState: "None", isValid: false },
          releaseDate: { value: null, valueState: "None", isValid: false },
          rating: { value: null, valueState: "None", isValid: false },
          price: { value: null, valueState: "None", isValid: false },
        };
        if (oContext) {
          const oModel = this.getModel("ODataV2");
          const sPath = oContext.getPath();
          for (const field in oFormData) {
            const formattedField = `${sPath}/${
              field[0].toUpperCase() + field.slice(1)
            }`;
            oFormData[field].value = oModel.getProperty(formattedField);
            oFormData[field].isValid = true;
          }
        }
        return oFormData;
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
          path: "/productData",
          model: "configModel",
        });

        const bIsEditing = !!oContext;
        this._oConfigModel.setProperty("/isDialogInEditMode", bIsEditing);

        let dialogData;
        if (bIsEditing) {
          dialogData = this._getDialogFormData(oContext);
          this._oConfigModel.setProperty(
            "/editProductPath",
            oContext.getPath()
          );
        } else {
          dialogData = this._getDialogFormData();
          this._oConfigModel.setProperty("/editProductPath", "");
        }

        this._oConfigModel.setProperty("/productData", dialogData);
        this._oDialog.open();
      },

      onTextInputLiveChange(oEvent) {
        const oControl = oEvent.getSource();
        const sPath = oControl.getBindingPath("value").split("/")[0];
        let sValue = oControl.getValue()?.trim();

        this._oConfigModel.setProperty(
          `/productData/${sPath}/valueState`,
          sValue ? "None" : "Error"
        );

        this._oConfigModel.setProperty(
          `/productData/${sPath}/isValid`,
          !!sValue
        );
      },

      onPriceInputLiveChange(oEvent) {
        const oControl = oEvent.getSource();
        const sPath = oControl.getBindingPath("value").split("/")[0];
        let iValue = parseFloat(oControl.getValue());
        const bIsInputValid = iValue > 0;

        this._oConfigModel.setProperty(
          `/productData/${sPath}/valueState`,
          bIsInputValid ? "None" : "Error"
        );

        this._oConfigModel.setProperty(
          `/productData/${sPath}/isValid`,
          bIsInputValid
        );
      },

      onRatingInputLiveChange(oEvent) {
        const oControl = oEvent.getSource();
        const sPath = oControl.getBindingPath("value").split("/")[0];
        let iValue = parseFloat(oControl.getValue());
        const bIsInputValid = iValue >= 1 && iValue <= 5;

        this._oConfigModel.setProperty(
          `/productData/${sPath}/valueState`,
          bIsInputValid ? "None" : "Error"
        );

        this._oConfigModel.setProperty(
          `/productData/${sPath}/isValid`,
          bIsInputValid
        );
      },

      _validateForm() {
        const oProductDataData = this._oConfigModel.getProperty("/productData");
        let bIsValid = true;
        for (const sField in oProductDataData) {
          const oFieldData = oProductDataData[sField];

          bIsValid = oFieldData.isValid;
          this._oConfigModel.setProperty(
            `/productData/${sField}/valueState`,
            oFieldData.isValid ? "None" : "Error"
          );
        }

        return bIsValid;
      },

      onReleaseDateChange(oEvent) {
        const bIsValid = oEvent.getParameter("valid");
        this._oConfigModel.setProperty(
          "/productData/releaseDate/isValid",
          bIsValid
        );

        this._oConfigModel.setProperty(
          "/productData/releaseDate/valueState",
          bIsValid ? "None" : "Error"
        );
      },

      onProductFormDialogAddButtonPress() {
        if (this._validateForm()) {
          this._onCreateproductData();
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

        oModel.update(sEditPath, this._getPayload(), {
          success: () => {
            this._showMessageToast("productFormDialogProductUpdatedSuccess");
            this._oDialog.close();
          },
          error: (oError) => MessageBox.error(oError.message),
        });
      },

      _onCreateproductData() {
        const oModel = this.getModel("ODataV2");

        oModel.create("/Products", this._getPayload(), {
          success: () => {
            this._showMessageToast("productFormDialogProductCreatedSuccess");
            this._oDialog.close();
          },
          error: (oError) => MessageBox.error(oError.message),
        });
      },

      _getPayload() {
        const oProductData = this._oConfigModel.getProperty("/productData");

        return {
          Name: oProductData.name.value,
          Description: oProductData.description.value,
          ReleaseDate: new Date(oProductData.releaseDate.value),
          Rating: parseInt(oProductData.rating.value, 10),
          Price: parseFloat(oProductData.price.value),
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

      onProductPress(oEvent) {
        const oItemCtx = oEvent.getSource().getBindingContext("ODataV2");
        const oRouter = this.getOwnerComponent().getRouter();
        const sId = oItemCtx.getProperty("ID");

        oRouter.navTo("product", {
          productPath: sId,
          mode: constants.APP_MODE.DISPLAY,
        });
      },
    });
  }
);
