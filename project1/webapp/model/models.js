sap.ui.define(
  ["sap/ui/model/json/JSONModel", "sap/ui/Device"],
  function (JSONModel, Device) {
    "use strict";

    return {
      /**
       * Provides runtime information for the device the UI5 app is running on as a JSONModel.
       * @returns {sap.ui.model.json.JSONModel} The device model.
       */
      createDeviceModel: function () {
        var oModel = new JSONModel(Device);
        oModel.setDefaultBindingMode("OneWay");
        return oModel;
      },
      createBooksModel: function () {
        const oBooks = {
          books: [
            {
              id: "book-001",
              name: "The Count of Monte Cristo",
              author: "Alexandre Dumas",
              genre: "Historical novel / Adventure",
              releaseDate: "1846",
              availableQuantity: 4,
            },
            {
              id: "book-002",
              name: "To Kill a Mockingbird",
              author: "Harper Lee",
              genre: "Southern Gothic / Bildungsroman",
              releaseDate: "1960",
              availableQuantity: 7,
            },
            {
              id: "book-003",
              name: "Madame Bovary",
              author: "Gustave Flaubert",
              genre: "Realist novel",
              releaseDate: "1857",
              availableQuantity: 3,
            },
            {
              id: "book-004",
              name: "The Thursday Murder Club",
              author: "Richard Osman",
              genre: "Crime / Mystery",
              releaseDate: "2020",
              availableQuantity: 5,
            },
            {
              id: "book-005",
              name: "Cujo",
              author: "Stephen King",
              genre: "Horror",
              releaseDate: "1981",
              availableQuantity: 2,
            },
          ],
        };
        const oModel = new JSONModel(oBooks);

        return oModel;
      },
    };
  }
);
