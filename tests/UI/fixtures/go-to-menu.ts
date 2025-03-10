import {expect, test as base} from '@playwright/test';
import {
  boDashboardPage,
  boLoginPage,
  boNewExperimentalFeaturesPage,
  boProductsPage,
  utilsTest,
} from '@prestashop-core/ui-testing';
import semver from 'semver';

export type MenuFixture = {
    login: string;
    link: {menu: string, subMenu: string},
    navigateTo: string;
    productLink: string; //To go to the Product page, the fixture has to consider the PS version and product page version.
};

/*
  Connect to the BO
  Go to Menu > SubMenu Page
 */
export const goToMenu = base.extend<MenuFixture>({
  login: async ({page}, use) => {
    await goToMenu.step('should login in BO', async () => {
      // await boLoginPage.goTo(page, global.BO.URL);
      // await boLoginPage.successLogin(page, global.BO.EMAIL, global.BO.PASSWD);
      await boLoginPage.goTo(page, 'http://localhost:8000/admin-dev');
      await boLoginPage.successLogin(page, 'admin@prestashop.com', 'prestashop');
    });

    await use('');
  },
  link: {menu: '', subMenu: ''},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  navigateTo: async ({page, link, login}, use) => {
    await goToMenu.step('should go to \'Catalog > Products\' page', async () => {
      await boDashboardPage.goToSubMenu(
        page,
        link.menu,
        link.subMenu,
      );
      await boProductsPage.closeSfToolBar(page);
    });
    await use('');
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  productLink: async ({page, link, navigateTo}, use) => {
    if (link.subMenu === boDashboardPage.productsLink) {
      const psVersion = utilsTest.getPSVersion();
      const isProductPageV1 = !await boProductsPage.isProductPageV2(page);

      await goToMenu.step('should go to \'Advanced Parameters > New & Experimental Features\' page', async () => {
        if (semver.gte(psVersion, '8.1.0') && isProductPageV1) {
          await boDashboardPage.goToSubMenu(
            page,
            boDashboardPage.advancedParametersLink,
            boDashboardPage.featureFlagLink,
          );
          await boNewExperimentalFeaturesPage.closeSfToolBar(page);

          const pageTitle = await boNewExperimentalFeaturesPage.getPageTitle(page);
          await expect(pageTitle).toContain(boNewExperimentalFeaturesPage.pageTitle);
        }
      });

      await goToMenu.step('should enable product page V2', async () => {
        if (semver.gte(psVersion, '8.1.0') && isProductPageV1) {
          const successMessage = await boNewExperimentalFeaturesPage.setFeatureFlag(
            page, boNewExperimentalFeaturesPage.featureFlagProductPageV2, true);
          await expect(successMessage).toContain(boNewExperimentalFeaturesPage.successfulUpdateMessage);
        }
      });

      await goToMenu.step('should go back to \'Catalog > Products\' page', async () => {
        if (semver.gte(psVersion, '8.1.0') && isProductPageV1) {
          await boDashboardPage.goToSubMenu(
            page,
            boDashboardPage.catalogParentLink,
            boDashboardPage.productsLink,
          );
          await boProductsPage.closeSfToolBar(page);

          const pageTitle = await boProductsPage.getPageTitle(page);
          expect(pageTitle).toContain(boProductsPage.pageTitle);
        }
      });
    }
    await use('');
  },
});