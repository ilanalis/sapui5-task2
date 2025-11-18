sap.ui.define(
  [
    "project1/controller/BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
  ],
  (BaseController, Filter, FilterOperator, MessageBox, MessageToast) => {
    "use strict";

    return BaseController.extend("project1.controller.Main", {
      onInit() {},

      onAddRecordButtonPress() {
        const oBookModel = this.getModel("booksModel");
        const aBooks = oBookModel.getProperty("/books");
        const oNewBook = {
          id: `book-${Date.now()}`,
          isEditMode: false,
        };
        aBooks.push(oNewBook);
        oBookModel.setProperty("/books", aBooks);
      },

      onDeleteRecordButtonPress() {
        const oReourceBundle = this.getModel("i18n").getResourceBundle();
        const oBookModel = this.getModel("booksModel");
        let aBooks = oBookModel.getProperty("/books");
        const oBooksList = this.byId("booksList");
        const aSelectedBooks = oBooksList.getSelectedContexts();
        const aSelectedBookIds = aSelectedBooks.map(
          (ctx) => ctx.getObject().id
        );

        MessageBox.confirm(
          oReourceBundle.getText("deleteRecordsConfirmationText"),
          {
            actions: [MessageBox.Action.YES, MessageBox.Action.NO],
            emphasizedAction: MessageBox.Action.YES,
            onClose: (sAction) => {
              if (sAction === MessageBox.Action.YES) {
                const aUpdatedBooks = aBooks.filter(
                  (book) => !aSelectedBookIds.includes(book.id)
                );
                oBookModel.setProperty("/books", aUpdatedBooks);
                oBooksList.removeSelections(true);
                MessageToast.show(
                  oReourceBundle.getText("recordsDeletedSuccess")
                );
              }
            },
          }
        );
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
