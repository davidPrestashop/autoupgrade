/**
 * Copyright since 2007 PrestaShop SA and Contributors
 * PrestaShop is an International Registered Trademark & Property of PrestaShop SA
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Academic Free License version 3.0
 * that is bundled with this package in the file LICENSE.md.
 * It is also available through the world-wide-web at this URL:
 * https://opensource.org/licenses/AFL-3.0
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@prestashop.com so we can send you a copy immediately.
 *
 * @author    PrestaShop SA and Contributors <contact@prestashop.com>
 * @copyright Since 2007 PrestaShop SA and Contributors
 * @license   https://opensource.org/licenses/AFL-3.0 Academic Free License version 3.0
 */
import {
  // Import utils
  utilsTest,
  // Import BO pages
  boDashboardPage,
  boProductsPage,
  // Import data
  dataProducts,
  dataCategories,
} from '@prestashop-core/ui-testing';

import {
  test, expect,
} from '@playwright/test';
import semver from 'semver';
import {goToMenu} from '../../../fixtures/go-to-menu';

const psVersion = utilsTest.getPSVersion();

goToMenu.use({
  link: {menu: boDashboardPage.catalogParentLink, subMenu: boDashboardPage.productsLink},
});

/*
  Connect to the BO
  Go to Catalog > Products page
  Filter products table by ID, Name, Reference, Category, Price, Quantity and Status
  Logout from the BO
 */
goToMenu('BO - Catalog - Products : Filter the products table by ID, Name, Reference, Category, Price, Quantity and Status',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async ({page, productLink}) => {
    let numberOfProducts: number = 0;

    await test.step('should check that no filter is applied by default', async () => {
      const isVisible = await boProductsPage.isResetButtonVisible(page);
      expect(isVisible, 'Reset button is visible!').toEqual(false);
    });

    await test.step('should get the number of products', async () => {
      const isProductPageV1 = !await boProductsPage.isProductPageV2(page);

      if (semver.lt(psVersion, '8.1.0') || isProductPageV1) {
        numberOfProducts = await boProductsPage.getNumberOfProductsFromList(page);
      } else {
        numberOfProducts = await boProductsPage.getNumberOfProductsFromHeader(page);
      }
      expect(numberOfProducts).toBeGreaterThan(0);
    });

    const executeStep = async (args :{
      identifier: string,
      filterBy: string,
      filterValue: string | {min: number, max: number},
      // For PS version <= 1.7.2
      oldFilterValue: string | {min: number, max: number},
      filterType: string,
    }) => {
      await test.step(`should filter list by '${args.filterBy}' and check result`, async () => {
        let filterValue: any = '';

        if (numberOfProducts > 7) {
          // For PS version > 1.7.2
          filterValue = args.filterValue;
        } else {
          // For PS version <= 1.7.2
          filterValue = args.oldFilterValue;
        }

        if (semver.lt(psVersion, '8.1.0') && args.filterBy === 'active') {
          await boProductsPage.filterProducts(page, args.filterBy, 'Active', args.filterType);
        } else {
          await boProductsPage.filterProducts(page, args.filterBy, filterValue, args.filterType);
        }
        const numberOfProductsAfterFilter = await boProductsPage.getNumberOfProductsFromList(page);

        if (args.filterBy === 'active') {
          expect(numberOfProductsAfterFilter).toBeGreaterThan(0);
        } else {
          expect(numberOfProductsAfterFilter).toBeLessThan(numberOfProducts);
        }

        for (let i = 1; i <= numberOfProductsAfterFilter; i++) {
          const textColumn = await boProductsPage.getTextColumn(page, args.filterBy, i);

          if (typeof filterValue !== 'string') {
            expect(textColumn).toBeGreaterThanOrEqual(filterValue.min);
            expect(textColumn).toBeLessThanOrEqual(filterValue.max);
          } else if (args.filterBy === 'active') {
            expect(textColumn).toEqual(true);
          } else {
            expect(textColumn).toContain(filterValue);
          }
        }
      });
    };

    const params = [
      {
        identifier: 'filterIDMinMax',
        filterBy: 'id_product',
        filterValue: {min: 5, max: 10},
        // For PS version <= 1.7.2
        oldFilterValue: {min: 3, max: 7},
        filterType: 'input',
      },
      {
        identifier: 'filterName',
        filterBy: 'product_name',
        filterValue: dataProducts.demo_14.name,
        // For PS version <= 1.7.2
        oldFilterValue: dataProducts.old_demo_4.name,
        filterType: 'input',
      },
      {
        identifier: 'filterReference',
        filterBy: 'reference',
        filterValue: dataProducts.demo_14.reference,
        // For PS version <= 1.7.2
        oldFilterValue: dataProducts.old_demo_7.reference,
        filterType: 'input',
      },
      {
        identifier: 'filterCategory',
        filterBy: 'category',
        filterValue: dataCategories.art.name,
        // For PS version <= 1.7.2
        oldFilterValue: dataProducts.old_demo_3.category,
        filterType: 'input',
      },
      {
        identifier: 'filterPriceMinMax',
        filterBy: 'price',
        filterValue: {min: 5, max: 10},
        // For PS version <= 1.7.2
        oldFilterValue: {min: 20, max: 30},
        filterType: 'input',
      },
      {
        identifier: 'filterQuantityMinMax',
        filterBy: 'quantity',
        filterValue: {min: 1300, max: 1500},
        // For PS version <= 1.7.2
        oldFilterValue: {min: 900, max: 1500},
        filterType: 'input',
      },
      {
        identifier: 'filterStatus',
        filterBy: 'active',
        filterValue: 'Yes',
        // For PS version <= 1.7.2
        oldFilterValue: 'Yes',
        filterType: 'select',
      },
    ];

    params.forEach(async (args) => {
      await executeStep(args);

      await test.step(`should reset filter by '${args.filterBy}'`, async () => {
        const numberOfProductsAfterReset = await boProductsPage.resetAndGetNumberOfLines(page);
        expect(numberOfProductsAfterReset).toEqual(numberOfProducts);
      });
    });
  });