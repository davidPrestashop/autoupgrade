import {boDashboardPage, boNewExperimentalFeaturesPage, boProductsPage} from '@prestashop-core/ui-testing';
import {expect, Page} from '@playwright/test';
import semver from 'semver';

const closeSymfonyToolBar = async (page:Page, psVersion: string, isProductPageV1:boolean) => {
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
};

const enableProductPageV2 = async (page:Page, psVersion: string, isProductPageV1:boolean) => {
  if (semver.gte(psVersion, '8.1.0') && isProductPageV1) {
    //Go to 'Advanced Parameters > New & Experimental Features' page
    await boDashboardPage.goToSubMenu(
      page,
      boDashboardPage.advancedParametersLink,
      boDashboardPage.featureFlagLink,
    );
    await boNewExperimentalFeaturesPage.closeSfToolBar(page);

    let pageTitle = await boNewExperimentalFeaturesPage.getPageTitle(page);
    await expect(pageTitle).toContain(boNewExperimentalFeaturesPage.pageTitle);

    // Enable product page V2
    const successMessage = await boNewExperimentalFeaturesPage.setFeatureFlag(
      page, boNewExperimentalFeaturesPage.featureFlagProductPageV2, true);
    await expect(successMessage).toContain(boNewExperimentalFeaturesPage.successfulUpdateMessage);

    // Go back to 'Catalog > Products' page
    await boDashboardPage.goToSubMenu(
      page,
      boDashboardPage.catalogParentLink,
      boDashboardPage.productsLink,
    );
    await boProductsPage.closeSfToolBar(page);

    pageTitle = await boProductsPage.getPageTitle(page);
    expect(pageTitle).toContain(boProductsPage.pageTitle);
  }
};

export default {
  closeSymfonyToolBar,
  enableProductPageV2,
};