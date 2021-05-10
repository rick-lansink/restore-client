export default class RevisionCompareService {
    constructor(reStoreRequests, rootMaterials, rootComponents) {
        this.oldSearchRequests = reStoreRequests;
        this.newRootMaterials = Object.entries(rootMaterials).map(([, entry]) => {return entry;});
        this.newRootComponents = this.convertRootComponents(rootComponents);

        this.compareReport = [];
    }

    startCompare() {
        if(!this.oldSearchRequests || !this.newRootMaterials || !this.newRootComponents) {
            this.addMessageToReport(
                'no_data',
                'There are no requests or the service has not yet finished collecting information on root materials and components. Please contact your administrator or try again later.'
            )
        }
        let newRequests = this.oldSearchRequests.map((request) => {
            if (request.RootComponents && request.RootComponents[0]) {
                request.Rootcomponents[0] = this.compareRootComponent(request.RootComponents[0], request);
            } else if (request.RootMaterials && request.RootMaterials[0]) {
                request.RootMaterials[0] = this.compareRootMaterial(request.RootMaterials[0], request)
            } else {
                this.addMessageToReport(
                    'no_material_component',
                    `Request ${request.name} was skipped because it has no material or component set`
                )
                return null;
            }
            return request;
        })
        console.log(this.compareReport);
        console.log(newRequests);
    }

    convertRootComponents(components) {
        return Object.entries(components).map(([,entry]) => {
            return entry.values.children;
        }).reduce((accumulator, entry) => {
            return [...accumulator, ...entry];
        }, [])
    }

    compareRootComponent(component, request) {
        let newComponent = this.findNewRootComponent(component);
        console.log(newComponent);
        //let componentCopy = JSON.parse(JSON.stringify(component));
        if(!newComponent) {
            this.addMessageToReport(
                'no_new_component',
                `This component cannot be found in the new revision. The component ${component.name} was therefore removed from ${request.name}`
            )
            return this.unsetRootComponentOnRequest(request, component)
        } else {
            return this.compareComponentDetails(component, newComponent);
        }
    }

    compareComponentDetails(oldComponent, newComponent) {
        console.log(oldComponent, newComponent)
    }

    compareRootMaterial(material, request) {
        let newMaterial = this.findNewRootMaterial(material);
        console.log(newMaterial);
        if(!newMaterial) {
            this.addMessageToReport(
                'no_new_material',
                `This material cannot be found in the new revision. The material ${material.name} was therefore removed from ${request.name}`
            )
            return this.unsetRootComponentOnRequest(request, material)
        } else {
            return this.compareMaterialDetails(material, newMaterial)
        }
    }

    compareMaterialDetails(oldMaterial, newMaterial) {
        if (
            oldMaterial.volume !== newMaterial.values.volume ||
            oldMaterial.surfaceArea !== newMaterial.values.surfaceArea ||
            oldMaterial.usedBy.length !== newMaterial.values.usedBy.length
        ) {
            return this.setNewPropertiesOnMaterial(oldMaterial, newMaterial);
        } else {
            this.addMessageToReport(
                'no_changes',
                `Material ${oldMaterial.name} was skipped because no changes were made to it.`
                )
            return oldMaterial;
        }
    }

    setNewPropertiesOnMaterial(oldMaterial, newMaterial) {
        let materialCopy = JSON.parse(JSON.stringify(oldMaterial));
        materialCopy.volume = newMaterial.values.volume;
        materialCopy.surfaceArea = newMaterial.values.surfaceArea;
        materialCopy.usedBy = newMaterial.values.usedBy
        this.addMessageToReport(
            'set_material_properties',
            [
                `Updated volume on ${oldMaterial.name} from ${oldMaterial.volume} to ${newMaterial.values.volume}`,
                `Updated surface area on ${oldMaterial.name} from ${oldMaterial.surfaceArea} to ${newMaterial.values.surfaceArea}`,
                `Updated items on ${oldMaterial.name} from ${oldMaterial.usedBy.length} items to ${newMaterial.values.usedBy.length}`
            ]
        )
        delete materialCopy.__typename;
        return materialCopy;
    }

    findNewRootComponent(component) {
        return this.newRootComponents.find((newComponent) => {
            return newComponent.valueHash === component.valueHash
        })
    }

    findNewRootMaterial(material) {
        return this.newRootMaterials.find((newMaterial) => {
            return newMaterial.values.oid === material.objectId || newMaterial.values.materialName === material.name
        })
    }

    unsetRootComponentOnRequest(request, component) {
        console.log(request, component);
    }

    unsetRootMaterialOnRequest() {
        return null;
    }

    addMessageToReport(key, message) {
        this.compareReport.push({
            key: key,
            message: message
        })
    }
}