#!/bin/bash
# DEPRECATED -- DO NOT USE

echo 'Updating /var/www/ with new data...';

cp -R ./$1 /var/www/;
cd /var/www/$1;
chmod 777 fixPerms.sh;
sudo ./fixPerms.sh;
sudo systemctl restart nginx;
echo 'Restarted NGINX -- showing status.';
sudo systemctl status nginx;
