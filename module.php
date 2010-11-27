<?php 
/**
 * @version $Id$
 * @package Abricos
 * @subpackage Raphael
 * @copyright Copyright (C) 2008 Abricos. All rights reserved.
 * @license http://www.gnu.org/copyleft/gpl.html GNU/GPL, see LICENSE.php
 * @author Gabidullin Mansur (mansurrescue@mail.ru)
 */

$mod = new ChartModule();
CMSRegistry::$instance->modules->Register($mod);;

class ChartModule extends CMSModule {
	
	public function ChartModule(){
		$this->version = "0.1";
		$this->name = "chart";
	}
}

?>