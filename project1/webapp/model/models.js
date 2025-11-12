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
              id: "book-1",
              name: "The Count of Monte Cristo",
              author: "Alexandre Dumas",
              genre: "Historical novel",
              releaseDate: "1846",
              availableQuantity: 4,
            },
            {
              id: "book-2",
              name: "To Kill a Mockingbird",
              author: "Harper Lee",
              genre: "Southern Gothic",
              releaseDate: "1960",
              availableQuantity: 7,
            },
            {
              id: "book-3",
              name: "Madame Bovary",
              author: "Gustave Flaubert",
              genre: "Realist novel",
              releaseDate: "1857",
              availableQuantity: 3,
            },
            {
              id: "book-4",
              name: "The Thursday Murder Club",
              author: "Richard Osman",
              genre: "Crime",
              releaseDate: "2020",
              availableQuantity: 5,
            },
            {
              id: "book-5",
              name: "Cujo",
              author: "Stephen King",
              genre: "Horror",
              releaseDate: "1981",
              availableQuantity: 2,
            },
            {
              id: "book-6",
              name: "Dracula",
              author: "Bram Stoker",
              genre: "Horror",
              releaseDate: "1897",
              availableQuantity: 3,
            },
            {
              id: "book-7",
              name: "Crime and Punishment",
              author: "Fyodor Dostoevsky",
              genre: "Crime",
              releaseDate: "1866",
              availableQuantity: 6,
            },
            {
              id: "book-8",
              name: "War and Peace",
              author: "Leo Tolstoy",
              genre: "Historical novel",
              releaseDate: "1869",
              availableQuantity: 5,
            },
            {
              id: "book-9",
              name: "Pride and Prejudice",
              author: "Jane Austen",
              genre: "Realist novel",
              releaseDate: "1813",
              availableQuantity: 4,
            },
            {
              id: "book-10",
              name: "Frankenstein",
              author: "Mary Shelley",
              genre: "Horror",
              releaseDate: "1818",
              availableQuantity: 2,
            },
          ],
          genres: [
            "All",
            "Horror",
            "Crime",
            "Realist novel",
            "Historical novel",
            "Southern Gothic",
          ],
        };
        const oModel = new JSONModel(oBooks);

        return oModel;
      },
    };
  }
);
