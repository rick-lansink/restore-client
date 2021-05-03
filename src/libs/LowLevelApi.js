
export default class LowLevelApi {
    constructor(client) {
        this.client = client;
        this.transactionId = null;
        this.projectId = null;
    }

    async startTransaction(projectId) {
        let response = await new Promise((resolve) => {
            this.client.call('LowLevelInterface', 'startTransaction', {
                poid: projectId
            }, (response) => {
                return resolve(response);
            })
        });
        this.projectId = projectId;
        this.transactionId = response;
    }

    async commitTransaction() {
        let response = await new Promise((resolve) => {
            this.client.call('LowLevelInterface', 'commitTransaction', {
                tid: this.transactionId,
                comment: 'Updated ReStore properties',
                regenerateAllGeometry: false
            }, (response) => {
                return resolve(response);
            })
        });
        console.log(response);
    }

    async objectGuidToOid(objectIds, revisionId) {
        let requestArray = [];
        objectIds.map((guid) => {
            requestArray.push([
                'LowLevelInterface', 'getDataObjectByGuid', {
                    roid: revisionId,
                    guid: guid
                }
            ]);
        });
        let response = await new Promise((resolve) => {
            this.client.multiCall(requestArray, (response) => {
                return resolve(response);
            })
        });
        console.log(response);
        return response;
    }


    async setPropertyForObjects(propertyName, propertyValue, propertyType, objectGuids, revisionId) {
        let requestArray = [];
        let oids = await this.objectGuidToOid(objectGuids, revisionId);
        //await this.checkRestorePropertySet(oids);
        console.log(requestArray, oids);
        oids.map((oid) => {
            requestArray.push([
                'LowLevelInterface', 'addStringAttribute', {
                    tid: this.transactionId,
                    oid: oid.result.oid,
                    attributeName: propertyName,
                    value: propertyValue
                }
            ]);
        });
        let response = await new Promise((resolve) => {
            this.client.multiCall(requestArray, (response) => {
                return resolve(response);
            })
        });
        console.log(response);
    }
}