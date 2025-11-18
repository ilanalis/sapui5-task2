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
        const oBookModel = this.getModel("booksModel");
        let aBooks = oBookModel.getProperty("/books");
        const oBooksList = this.byId("booksList");
        const aSelectedBooks = oBooksList.getSelectedContexts();
        const aSelectedBookIds = aSelectedBooks.map(
          (ctx) => ctx.getObject().id
        );

        if (aSelectedBookIds.length === 0) return;

        MessageBox.confirm(
          "Are you sure you want to delete selected records?",
          {
            actions: ["Yes", "No"],
            emphasizedAction: "Yes",
            onClose: (sAction) => {
              if (sAction === "Yes") {
                const aUpdatedBooks = aBooks.filter(
                  (book) => !aSelectedBookIds.includes(book.id)
                );
                oBookModel.setProperty("/books", aUpdatedBooks);
                oBooksList.removeSelections(true);
                MessageToast.show("Records are deleted successfully");
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
    });
  }
);
