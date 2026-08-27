ALTER TABLE Sys_Menus
ADD IconFont NVARCHAR(50) NULL;

UPDATE Sys_Menus
SET IconFont = 'icon ni ni-coins'
WHERE MenuType = 'Menu' AND MenuName = 'Accounting';

UPDATE Sys_Menus
SET IconFont = 'icon ni ni-wallet'
WHERE MenuType = 'Menu' AND MenuName = 'Cash & Banks';

UPDATE Sys_Menus
SET IconFont = 'icon ni ni-building'
WHERE MenuType = 'Menu' AND MenuName = 'Fixed Assets';

UPDATE Sys_Menus
SET IconFont = 'icon ni ni-users'
WHERE MenuType = 'Menu' AND MenuName = 'Human Resources';

UPDATE Sys_Menus
SET IconFont = 'icon ni ni-user-check'
WHERE MenuType = 'Menu' AND MenuName = 'Self Service';

UPDATE Sys_Menus
SET IconFont = 'icon ni ni-box'
WHERE MenuType = 'Menu' AND MenuName = 'Materials';

UPDATE Sys_Menus
SET IconFont = 'icon ni ni-cart'
WHERE MenuType = 'Menu' AND MenuName = 'Procurements';

UPDATE Sys_Menus
SET IconFont = 'icon ni ni-growth'
WHERE MenuType = 'Menu' AND MenuName = 'Sales';

UPDATE Sys_Menus
SET IconFont = 'icon ni ni-shop'
WHERE MenuType = 'Menu' AND MenuName = 'Retail';

UPDATE Sys_Menus
SET IconFont = 'icon ni ni-setting-alt'
WHERE MenuType = 'Menu' AND MenuName = 'Services';

UPDATE Sys_Menus
SET IconFont = 'icon ni ni-setting'
WHERE MenuType = 'Menu' AND MenuName = 'Settings / Development';

UPDATE Sys_Menus
SET IconFont = 'icon ni ni-laptop'
WHERE MenuType = 'Menu' AND MenuName = 'Information Technology';

UPDATE Sys_Menus
SET IconFont = 'icon ni ni-tools'
WHERE MenuType = 'Menu' AND MenuName = 'Manufacturing';

UPDATE Sys_Menus
SET IconFont = 'icon ni ni-users-fill'
WHERE MenuType = 'Menu' AND MenuName = 'CRM';

UPDATE Sys_Menus
SET IconFont = 'icon ni ni-list-check'
WHERE MenuType = 'Menu' AND MenuName = 'PM';

UPDATE Sys_Menus
SET IconFont = 'icon ni ni-pie'
WHERE MenuType = 'Menu' AND MenuName = 'Balanced Scorecard';

UPDATE Sys_Menus
SET IconFont = 'icon ni ni-upload-cloud'
WHERE MenuType = 'Menu' AND MenuName = 'Release Manager';

UPDATE Sys_Menus
SET IconFont = 'icon ni ni-user-circle'
WHERE MenuType = 'Menu' AND MenuName = 'Customer Portal';

UPDATE Sys_Menus
SET IconFont = 'icon ni ni-briefcase'
WHERE MenuType = 'Menu' AND MenuName = 'Vendor Portal';

UPDATE Sys_Menus
SET IconFont = 'icon ni ni-percent'
WHERE MenuType = 'Menu' AND MenuName = 'Taxes';

UPDATE Sys_Menus
SET IconFont = 'icon ni ni-reports'
WHERE MenuType = 'Menu' AND MenuName = 'Reports';

UPDATE Sys_Menus
SET IconFont = 'icon ni ni-shield-check'
WHERE MenuType = 'Menu' AND MenuName = 'Auditing';