#!/bin/bash
#

if [ $# -lt 1 ] 
then 
	echo "Usage: "
	echo " "
	echo " bash broadcastMessages.sh [directory where .json messages reside] "
	echo " "
	echo "Example: "
	echo " "
	echo " $ bash broadcastMessages.sh  /space/gitrepos/firefly-samples/broadcast-message-api/data"
	echo " "	
	exit -1
fi

dataDir=$1
datetimestamp=`date +%Y%m%d%H%M%S` 
datestamp=`date +%Y%m%d`

for file in $1/*
do
    if [[ -f $file ]]; then
        echo $file
        curl -X 'POST' 'http://127.0.0.1:5000/api/v1/namespaces/default/messages/broadcast' -H 'accept: application/json' -H 'Request-Timeout: 120s'  -H 'Content-Type: application/json' -d @$file --verbose
    fi
done

exit 0
