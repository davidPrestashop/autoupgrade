<?php
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
use PHPUnit\Framework\TestCase;
use PrestaShop\Module\AutoUpgrade\Router\UrlGenerator;
use Symfony\Component\HttpFoundation\Request;

class UrlGeneratorTest extends TestCase
{
    /** @var UrlGenerator */
    private $urlGenerator;

    protected function setUp()
    {
        $shopBasePath = '/yo/doge';
        $adminPath = 'wololo';
        $this->urlGenerator = new UrlGenerator($shopBasePath, $adminPath);
    }

    public function testGetShopUrlReturnsUrl()
    {
        $server = [
            'HTTP_HOST' => 'localhost',
            'SERVER_PORT' => '80',
            'QUERY_STRING' => '',
            'PHP_SELF' => '/admin-wololo/index.php',
            'SCRIPT_FILENAME' => '/yo/doge/admin-wololo/index.php',
            'REQUEST_URI' => 'index.php',
        ];

        $request = new Request([], [], [], [], [], $server);

        $expectedAbsoluteUrlPathToShop = '/';
        $expectedAbsoluteUrlPathToAdmin = '/wololo';
        $this->assertSame($expectedAbsoluteUrlPathToShop, $this->urlGenerator->getShopAbsolutePathFromRequest($request));
        $this->assertSame($expectedAbsoluteUrlPathToAdmin, $this->urlGenerator->getShopAdminAbsolutePathFromRequest($request));
    }

    public function testGetShopUrlReturnsUrlWithShopInSubFolder()
    {
        $server = [
            'HTTP_HOST' => 'localhost',
            'SERVER_PORT' => '80',
            'QUERY_STRING' => '',
            'PHP_SELF' => '/hello-world/admin-wololo/index.php',
            'SCRIPT_FILENAME' => '/yo/doge/admin-wololo/index.php',
            'REQUEST_URI' => 'hello-world/index.php',
        ];

        $request = new Request([], [], [], [], [], $server);

        $expectedAbsoluteUrlPathToShop = '/hello-world';
        $expectedAbsoluteUrlPathToAdmin = '/hello-world/wololo';
        $this->assertSame($expectedAbsoluteUrlPathToShop, $this->urlGenerator->getShopAbsolutePathFromRequest($request));
        $this->assertSame($expectedAbsoluteUrlPathToAdmin, $this->urlGenerator->getShopAdminAbsolutePathFromRequest($request));
    }

    public function testGetShopUrlReturnsUrlWithCustomEntrypoint()
    {
        $server = [
            'HTTP_HOST' => 'localhost',
            'SERVER_PORT' => '80',
            'QUERY_STRING' => '',
            'PHP_SELF' => '/admin-wololo/autoupgrade/ajax-upgradetab.php',
            'SCRIPT_FILENAME' => '/yo/doge/admin-wololo/autoupgrade/ajax-upgradetab.php',
            'REQUEST_URI' => '/admin-wololo/autoupgrade/ajax-upgradetab.php?route=update-step-backup-submit',
        ];

        $request = new Request([], [], [], [], [], $server);

        $expectedAbsoluteUrlPathToShop = '/';
        $expectedAbsoluteUrlPathToAdmin = '/wololo';
        $this->assertSame($expectedAbsoluteUrlPathToShop, $this->urlGenerator->getShopAbsolutePathFromRequest($request));
        $this->assertSame($expectedAbsoluteUrlPathToAdmin, $this->urlGenerator->getShopAdminAbsolutePathFromRequest($request));
    }

    public function testGetShopUrlReturnsUrlWithShopInSubFolderAndParams()
    {
        $server = [
            'HTTP_HOST' => 'localhost',
            'SERVER_PORT' => '80',
            'QUERY_STRING' => '',
            'PHP_SELF' => '/hello-world/admin-wololo/index.php',
            'SCRIPT_FILENAME' => '/yo/doge/admin-wololo/index.php',
            'REQUEST_URI' => 'hello-world/admin-wololo/index.php?controller=AdminSelfUpgrade',
        ];

        $request = new Request([], [], [], [], [], $server);

        $expectedAbsoluteUrlPathToShop = '/hello-world';
        $expectedAbsoluteUrlPathToAdmin = '/hello-world/wololo';
        $this->assertSame($expectedAbsoluteUrlPathToShop, $this->urlGenerator->getShopAbsolutePathFromRequest($request));
        $this->assertSame($expectedAbsoluteUrlPathToAdmin, $this->urlGenerator->getShopAdminAbsolutePathFromRequest($request));
    }
}
