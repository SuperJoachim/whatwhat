# whatwhat
What what in the butt bot

Det er en fælles bot!!! Fælles - som i også Pede!

Invite
https://discordapp.com/oauth2/authorize?client_id=x&scope=bot&permissions=0

/aci/billeder/
{ "shareName": "billeder", "storageAccountName": "whatstoragebot" }


# Change these four parameters as needed
ACI_PERS_RESOURCE_GROUP=whatwhat
ACI_PERS_STORAGE_ACCOUNT_NAME=whatstoragebot
ACI_PERS_LOCATION=west_europe
ACI_PERS_SHARE_NAME=billeder
STORAGE_KEY=$(az storage account keys list --resource-group $ACI_PERS_RESOURCE_GROUP --account-name $ACI_PERS_STORAGE_ACCOUNT_NAME --query "[0].value" --output tsv)

az container create \
    --resource-group $ACI_PERS_RESOURCE_GROUP \
    --name joscontainers \
    --image joscontainers.azurecr.io/what/whatbot \
    --dns-name-label whatbilleder \
    --ports 80 \
    --azure-file-volume-account-name $ACI_PERS_STORAGE_ACCOUNT_NAME \
    --azure-file-volume-account-key $STORAGE_KEY \
    --azure-file-volume-share-name $ACI_PERS_SHARE_NAME \
    --azure-file-volume-mount-path /aci/billeder/