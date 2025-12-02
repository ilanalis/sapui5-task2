sap.ui.define(["project1/controller/BaseController"], (BaseController) => {
  "use strict";

  return BaseController.extend("project1.controller.Main", {
    onInit() {
      const oRouter = this.getOwnerComponent().getRouter();

      oRouter.getRoute("RouteMain").attachPatternMatched(() => {
        oRouter.navTo("tab", { tabName: "JSONModel" }, true);
      });
      oRouter.getRoute("tab").attachPatternMatched(this._onTabMatched, this);
    },

    _onTabMatched(oEvent) {
      const tabName = oEvent.getParameter("arguments").tabName;

      const oIconTabBar = this.byId("mainIconTabBar");
      oIconTabBar.setSelectedKey(tabName);
    },

    onFilterSelect(oEvent) {
      const key = oEvent.getParameter("key");
      this.getOwnerComponent().getRouter().navTo("tab", { tabName: key });
    },
  });
});
