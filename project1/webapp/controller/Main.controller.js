sap.ui.define(
  [
    "project1/controller/BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  (BaseController, Filter, FilterOperator) => {
    "use strict";

    return BaseController.extend("project1.controller.Main", {
      onInit() {},

      onAddRecord() {
        const bookModel = this.getModel("booksModel");
        const aBooks = bookModel.getProperty("/books");
        const newBook = {
          id: `book-${Date.now()}`,
        };
        aBooks.push(newBook);
        bookModel.setProperty("/books", aBooks);
      },

      onDeleteRecord() {
        const bookModel = this.getModel("booksModel");
        let aBooks = bookModel.getProperty("/books");
        const oBooksList = this.byId("booksList");
        const aSelectetBooks = oBooksList.getSelectedContexts();

        const aSelectedBookIds = aSelectetBooks.map(
          (ctx) => ctx.getObject().id
        );
        aBooks = aBooks.filter((book) => !aSelectedBookIds.includes(book.id));
        bookModel.setProperty("/books", aBooks);
        oBooksList.removeSelections(true);
      },

      onFilter() {
        const aFilter = [];
        const titleInput = this.byId("titleInut");
        const genreSelect = this.byId("genreSelect");
        const sSearchTitle = titleInput.getValue();
        const sSelectedGenre = genreSelect.getSelectedItem().getKey();

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

      onEdit(oEvent) {
        this.changeBooksModelEditMode(oEvent, true);
      },

      onSave(oEvent) {
        this.changeBooksModelEditMode(oEvent, false);
      },

      changeBooksModelEditMode(oEvent, mode) {
        const context = oEvent.getSource().getBindingContext("booksModel");
        const sPath = context.getPath();
        const booksModel = this.getModel("booksModel");
        booksModel.setProperty(`${sPath}/isEditing`, mode);
      },
    });
  }
);
