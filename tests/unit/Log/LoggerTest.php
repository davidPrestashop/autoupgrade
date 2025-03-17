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

namespace unit\Log;

use NullLogger;
use PHPUnit\Framework\TestCase;
use PrestaShop\Module\AutoUpgrade\Log\Logger;

class LoggerTest extends TestCase
{
    public static function setUpBeforeClass()
    {
        require_once __DIR__ . '/Mock/NullLogger.php';
    }

    public function testLastInfoIsRegistered()
    {
        $fd = fopen('php://temp', 'w+');

        $logger = new NullLogger($fd);
        $logger->log(Logger::INFO, 'Hello');

        rewind($fd);

        $contents = stream_get_contents($fd);
        fclose($fd);

        $this->assertStringEndsWith(
            "INFO - LoggerTest - Hello\n",
            $contents
        );
    }
}
