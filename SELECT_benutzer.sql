SELECT * FROM `flusskraftwerk`.`benutzer` LIMIT 10;

SELECT * FROM `flusskraftwerk`.`ansicht` INNER JOIN `flusskraftwerk`.`benutzer` ON `FK_Benutzer`=`idBenutzer` WHERE `FK_Anlage` = 1;

