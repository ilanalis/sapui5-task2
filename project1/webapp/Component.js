sap.ui.define(
  [
    "sap/ui/core/UIComponent",
    "project1/model/models",
    "sap/ui/model/json/JSONModel",
  ],
  (UIComponent, models, JSONModel) => {
    "use strict";

    return UIComponent.extend("project1.Component", {
      metadata: {
        manifest: "json",
        interfaces: ["sap.ui.core.IAsyncContentCreation"],
      },

      init() {
        // call the base component's init function
        UIComponent.prototype.init.apply(this, arguments);

        // set the device model
        this.setModel(models.createDeviceModel(), "device");

        const aBooks = {
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

        const oModel = new JSONModel(aBooks);
        this.setModel(oModel);

        // enable routing
        this.getRouter().initialize();
      },
    });
  }
);
