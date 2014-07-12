<?php 
/**
 * @version $Id$
 * @package Abricos
 * @subpackage Raphael
 * @copyright Copyright (C) 2008 Abricos. All rights reserved.
 * @license http://www.gnu.org/copyleft/gpl.html GNU/GPL, see LICENSE.php
 * @author Gabidullin Mansur (mansurrescue@mail.ru)
 */

class ChartModule extends Ab_Module {
	
	public function ChartModule(){
		$this->version = "0.1.1";
		$this->name = "chart";
	}
}

Abricos::ModuleRegister(new ChartModule());

?>