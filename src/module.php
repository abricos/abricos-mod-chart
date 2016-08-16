<?php
/**
 * @package Abricos
 * @subpackage Chart
 * @copyright 2011-2015 Alexander Kuzmin
 * @license http://opensource.org/licenses/mit-license.php MIT License
 * @author Alexander Kuzmin <roosit@abricos.org>
 */

/**
 * Class ChartModule
 */
class ChartModule extends Ab_Module {
	
	public function __construct(){
		$this->version = "0.1.2";
		$this->name = "chart";
	}
}

Abricos::ModuleRegister(new ChartModule());
