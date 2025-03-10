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
  boLoginPage,
  boOrdersPage,
  // Import data
  dataOrders,
  dataOrderStatuses,
} from '@prestashop-core/ui-testing';

import {
  test, expect,
} from '@playwright/test';
import semver from 'semver';
import {goToMenu} from '../../../fixtures/go-to-menu';

const psVersion = utilsTest.getPSVersion();

goToMenu.use({
  link: {menu: boDashboardPage.ordersParentLink, subMenu: boDashboardPage.ordersLink},
});

/*
  Filter the Orders table
 */
goToMenu('BO - Orders - Orders : Filter the Orders table by ID, REFERENCE, STATUS', async ({page, navigateTo}) => {
  let numberOfOrders: number;

  await test.step('should reset all filters and get number of orders', async () => {
    numberOfOrders = await boOrdersPage.resetAndGetNumberOfLines(page);
    expect(numberOfOrders).toBeGreaterThan(0);
  });

  const tests = [
    {
      args: {
        identifier: 'filterId', filterType: 'input', filterBy: 'id_order', filterValue: dataOrders.order_4.id,
      },
    },
    {
      args: {
        identifier: 'filterReference',
        filterType: 'input',
        filterBy: 'reference',
        filterValue: dataOrders.order_2.reference,
      },
    },
    {
      args: {
        identifier: 'filterOsName',
        filterType: 'select',
        filterBy: 'osname',
        filterValue: dataOrderStatuses.paymentError.name,
      },
    },
  ];

  tests.forEach(async (tst, index: number) => {
    await test.step(`should filter the Orders table by '${tst.args.filterBy}' and check the result`, async () => {
      if (semver.lte(psVersion, '7.6.9') && index === 2) {
        await boOrdersPage.filterOrders(
          page,
          tst.args.filterType,
          'os!id_order_state',
          tst.args.filterValue.toString(),
        );
      } else {
        await boOrdersPage.filterOrders(
          page,
          tst.args.filterType,
          tst.args.filterBy,
          tst.args.filterValue.toString(),
        );
      }

      const textColumn = await boOrdersPage.getTextColumn(page, tst.args.filterBy, 1);
      await expect(textColumn).toEqual(tst.args.filterValue.toString());
    });

    await test.step(`should reset filter by '${tst.args.filterBy}'`, async () => {
      const numberOfOrdersAfterReset = await boOrdersPage.resetAndGetNumberOfLines(page);
      await expect(numberOfOrdersAfterReset).toEqual(numberOfOrders);
    });
  });

  //TODO worker clean after test: why logout?
  // NEED teardown?
  // Logout from BO
  await test.step('should log out from BO', async () => {
    await boLoginPage.logoutBO(page);

    const pageTitle = await boLoginPage.getPageTitle(page);
    expect(pageTitle).toContain(boLoginPage.pageTitle);
  });
});