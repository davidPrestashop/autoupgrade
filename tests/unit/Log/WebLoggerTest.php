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
use PrestaShop\Module\AutoUpgrade\Log\WebLogger;

class WebLoggerTest extends TestCase
{
    public function testLastInfoIsRegistered()
    {
        $logger = new WebLogger();
        $logger->log(WebLogger::INFO, 'Hello');

        $this->assertSame('Hello', $logger->getLastInfo());
    }

    public function testSeveralLastInfoAreRegistered()
    {
        $logger = new WebLogger();
        $logger->log(WebLogger::INFO, 'Hello');
        $logger->log(WebLogger::INFO, 'Good bye');

        $this->assertSame('Good bye', $logger->getLastInfo());
        $infos = $logger->getLogs();
        $this->assertSame([
            'INFO - Hello',
            'INFO - Good bye',
        ], $infos);
        $this->assertCount(2, $infos);
    }

    public function testSensitiveDataAreReplaced()
    {
        $logger = new WebLogger();
        $logger->setSensitiveData([
            'my-aldmin-folder' => '******',
            '🚬' => '🚭',
            'some@email.com' => '***@****.**',
        ]);

        $this->assertSame(
            'File /shop/******/config.yml created',
            $logger->cleanFromSensitiveData('File /shop/my-aldmin-folder/config.yml created')
        );

        $this->assertSame(
            '***@****.** suggested 🚭',
            $logger->cleanFromSensitiveData('some@email.com suggested 🚬')
        );
    }

    public function testWholeLogContentIsProperlyOrdered()
    {
        $logger = new WebLogger();
        $logger->log(WebLogger::INFO, 'INFO #1');
        $logger->log(WebLogger::WARNING, 'Oh no');
        $logger->log(WebLogger::WARNING, 'Oh no 2');
        $logger->log(WebLogger::INFO, 'INFO #2');

        $this->assertEquals('INFO #2', $logger->getLastInfo());

        $this->assertEquals([
            'INFO - INFO #1',
            'WARNING - Oh no',
            'WARNING - Oh no 2',
            'INFO - INFO #2',
        ], $logger->getLogs());
    }
}
