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
use PrestaShop\Module\AutoUpgrade\Services\PrestashopVersionService;
use PrestaShop\Module\AutoUpgrade\UpgradeContainer;
use Symfony\Component\Filesystem\Exception\FileNotFoundException;
use Symfony\Component\Filesystem\Filesystem;

class PrestashopVersionServiceTest extends TestCase
{
    /**
     * @var PrestashopVersionService
     */
    private $versionService;

    protected function setUp(): void
    {
        $this->container = new UpgradeContainer('/html', '/html/admin');

        $this->fixturePath = __DIR__ . '/../../fixtures/localChannel/';

        $this->versionService = new PrestashopVersionService($this->container->getZipAction(), new Filesystem());
    }

    public function testExtractPrestashopVersionFromZipFileNotFound(): void
    {
        $this->expectException(FileNotFoundException::class);
        $this->expectExceptionMessage('Unable to find missing.zip file');

        $this->versionService->extractPrestashopVersionFromZip('missing.zip');
    }

    public function testExtractPrestashopVersionFromZipInvalidContent(): void
    {
        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('Unable to extract version from content');

        $this->versionService->extractPrestashopVersionFromZip($this->fixturePath . 'not_versioned_8.2.0.zip');
    }

    public function testExtractPrestashopVersionFromZipSuccess(): void
    {
        $result = $this->versionService->extractPrestashopVersionFromZip($this->fixturePath . 'versioned_8.2.0.zip');
        $this->assertEquals('8.2.0', $result);
    }

    public function testExtractPrestashopVersionFromXmlInvalidContent(): void
    {
        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('Prestashop version not found in file ' . $this->fixturePath . 'not_versioned_8.2.0.xml');

        $this->versionService->extractPrestashopVersionFromXml($this->fixturePath . 'not_versioned_8.2.0.xml');
    }

    public function testExtractPrestashopVersionFromXmlSuccess(): void
    {
        $result = $this->versionService->extractPrestashopVersionFromXml($this->fixturePath . 'versioned_8.2.0.xml');
        $this->assertEquals('8.2.0', $result);
    }
}
