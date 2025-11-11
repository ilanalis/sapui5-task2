sap.ui.define(
  ["sap/ui/core/UIComponent", "project1/model/models"],
  (UIComponent, models) => {
    "use strict";

    return UIComponent.extend("project1.Component", {
      metadata: {
        manifest: "json",
        interfaces: ["sap.ui.core.IAsyncContentCreation"],
      },

      init() {
        UIComponent.prototype.init.apply(this, arguments);

        this.setModel(models.createDeviceModel(), "device");
        this.setModel(models.createBooksModel(), "booksModel");

        this.getRouter().initialize();
      },
    });
  }
);
