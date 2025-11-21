sap.ui.define(
  [
    "project1/controller/BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
  ],
  (
    BaseController,
    Filter,
    FilterOperator,
    MessageBox,
    MessageToast,
    JSONModel
  ) => {
    "use strict";

    return BaseController.extend("project1.controller.JSONModel", {
      onInit() {
        this._oResourceBundle = this.getOwnerComponent()
          .getModel("i18n")
          .getResourceBundle();
      },

      _getAddNewRecordDialogModelInitialData() {
        return {
          name: { value: "", valueState: "None" },
          author: { value: "", valueState: "None" },
          genre: { value: "", valueState: "None" },
          releaseDate: { value: "", valueState: "None", isValid: false },
          availableQuantity: { value: "", valueState: "None" },
        };
      },

      _setAddNewRecordDialogModelInitialData() {
        this._oTempModel.setData(this._getAddNewRecordDialogModelInitialData());
      },

      async onAddRecordButtonPress() {
        if (!this._oTempModel) {
          this._oTempModel = new JSONModel(
            this._getAddNewRecordDialogModelInitialData()
          );
        }
        if (!this._oDialog) {
          this._oDialog = await this.loadFragment({
            name: "project1.view.fragment.AddNewRecordDialog",
          });
          this._oDialog.setModel(this._oTempModel, "temp");
        }
        this._oDialog.open();
      },

      onReleaseDateChange(oEvent) {
        this._oTempModel.setProperty(
          "/releaseDate/isValid",
          oEvent.getParameter("valid")
        );
      },

      onAddNewRecordDialogAddRecordButtonPress() {
        if (!this._validateForm()) return;
        this.saveNewRecord();
      },

      _validateForm() {
        const oData = this._oTempModel.getData();
        let bIsValid = true;
        for (const sField in oData) {
          const oField = oData[sField];
          let bFieldValid = true;

          if (!oField.value) {
            bFieldValid = false;
          }

          if (sField === "availableQuantity" && oField.value < 1) {
            bFieldValid = false;
          }

          this._oTempModel.setProperty(
            `/${sField}/valueState`,
            bFieldValid ? "None" : "Error"
          );

          if (!bFieldValid) {
            bIsValid = false;
          }
        }
        if (!oData.releaseDate.isValid) {
          this._oTempModel.setProperty("/releaseDate/valueState", "Error");
          bIsValid = false;
        }

        return bIsValid;
      },

      saveNewRecord() {
        const oBookModel = this.getModel("booksModel");
        const aBooks = oBookModel.getProperty("/books");
        const oData = this._oTempModel.getData();
        const oNewRecord = {};

        for (const sField in oData) {
          oNewRecord[sField] = oData[sField].value;
        }
        oNewRecord.id = `book-${Date.now()}`;
        oNewRecord.isEditMode = false;

        aBooks.push(oNewRecord);
        oBookModel.setProperty("/books", aBooks);
        this._oDialog.close();
      },

      onAddNewRecordDialogCancelButtonPress() {
        this._oDialog.close();
      },

      onDeleteRecordButtonPress() {
        MessageBox.confirm(
          this._oResourceBundle.getText("deleteRecordsConfirmationText"),
          {
            actions: [MessageBox.Action.YES, MessageBox.Action.NO],
            emphasizedAction: MessageBox.Action.YES,
            onClose: (sAction) => {
              if (sAction === MessageBox.Action.YES) {
                this._deleteSelectedRecords();
                MessageToast.show(
                  this._oResourceBundle.getText("recordsDeletedSuccess")
                );
              }
            },
          }
        );
      },

      _deleteSelectedRecords() {
        const oBookModel = this.getModel("booksModel");
        let aBooks = oBookModel.getProperty("/books");
        const oBooksList = this.byId("booksList");
        const aSelectedBooks = oBooksList.getSelectedContexts();
        const aSelectedBookIds = aSelectedBooks.map(
          (ctx) => ctx.getObject().id
        );
        const aUpdatedBooks = aBooks.filter(
          (book) => !aSelectedBookIds.includes(book.id)
        );

        oBookModel.setProperty("/books", aUpdatedBooks);
        oBooksList.removeSelections(true);
      },

      onFilterButtonPress() {
        const aFilter = [];
        const oTitleInput = this.byId("titleInput");
        const oGenreSelect = this.byId("genreSelect");
        const sSearchTitle = oTitleInput.getValue();
        const sSelectedGenre = oGenreSelect.getSelectedItem().getKey();

        if (sSearchTitle) {
          aFilter.push(
            new Filter("name", FilterOperator.Contains, sSearchTitle)
          );
        }
        if (sSelectedGenre !== "All") {
          aFilter.push(new Filter("genre", FilterOperator.EQ, sSelectedGenre));
        }

        const oList = this.byId("booksList");
        const oBinding = oList.getBinding("items");
        oBinding.filter(aFilter);
      },

      onEditTitleButtonPress(oEvent) {
        this.setTitleEditMode(oEvent, true);
      },

      onSaveTitleButtonPress(oEvent) {
        this.setTitleEditMode(oEvent, false);
      },

      setTitleEditMode(oEvent, bMode) {
        const oContext = oEvent.getSource().getBindingContext("booksModel");
        const sPath = oContext.getPath();
        const oBooksModel = this.getModel("booksModel");
        oBooksModel.setProperty(`${sPath}/isEditMode`, bMode);
      },

      onBooksTableSelectionChange(oEvent) {
        this.getModel("booksModel").setProperty(
          "/isDeleteButtonEnabled",
          !!oEvent.getSource().getSelectedItems().length
        );
      },
    });
  }
);
