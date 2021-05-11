export default class RevisionCompareService {
    constructor(reStoreRequests, rootMaterials, rootComponents) {
        this.oldSearchRequests = reStoreRequests;
        this.newRootMaterials = Object.entries(rootMaterials).map(([, entry]) => {return entry;});
        this.newRootComponents = this.convertRootComponents(rootComponents);

        this.compareReport = [];

        this.entityLists = {
            rootComponents: [],
            dimensionSets: [],
            rootMaterials: [],
        }
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
                let newRootComponents = this.compareRootComponent(request.RootComponents[0], request)
                if (newRootComponents) {
                    request.RootComponents = {
                        data: [newRootComponents],
                        on_conflict: {
                            constraint: 'RootComponent_pkey',
                            update_columns: ['name']
                        }
                    };
                } else {
                    delete request.RootComponents;
                }
                delete request.RootMaterials;
            } else if (request.RootMaterials && request.RootMaterials[0]) {
                let newRootMaterials = this.compareRootMaterial(request.RootMaterials[0], request)
                if (newRootMaterials) {
                    request.RootMaterials = {
                        data: [newRootMaterials],
                        on_conflict: {
                            constraint: 'RootMaterial_pkey',
                            update_columns: [
                                'volume', 'surfaceArea', 'usedBy'
                            ]
                        }
                    }
                } else {
                    delete request.rootMaterials;
                }
                delete request.RootComponents;
            } else {
                this.addMessageToReport(
                    'no_material_component',
                    `Request ${request.name} was skipped because it has no material or component set`
                )
                return null;
            }
            delete request.__typename;
            delete request.created_at;
            delete request.updated_at;
            return request;
        })

        return newRequests;
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
        if(!newComponent) {
            console.log(component);
            this.addMessageToReport(
                'no_new_component',
                `This component cannot be found in the new revision. The component ${component.name} was therefore removed from ${request.name}`
            )
            return null
        } else {
            let updatedComponent = component;
            updatedComponent.Properties = {
                data: this.compareProperties(updatedComponent.Properties, newComponent.inheritedProperties),
                on_conflict: {
                    constraint: 'Property_pkey',
                    update_columns: ['propertyValue']
                }
            }
            updatedComponent.DimensionSets = {
                data: this.compareDimensionSets(updatedComponent.DimensionSets, newComponent.dimensionSets),
                on_conflict: {
                    constraint: 'DimensionSet_pkey',
                    update_columns: [
                        'surfaceArea', 'volume', 'usedBy'
                    ]
                }
            }
            delete updatedComponent.__typename
            return updatedComponent;
        }
    }

    compareRootMaterial(material, request) {
        let newMaterial = this.findNewRootMaterial(material);
        if(!newMaterial) {
            this.addMessageToReport(
                'no_new_material',
                `This material cannot be found in the new revision. The material ${material.name} was therefore removed from ${request.name}`
            )
            return null;
        } else {
            let updatedMaterial = this.compareMaterialDetails(material, newMaterial)
            updatedMaterial.Properties = {
                data: this.compareProperties(updatedMaterial.Properties, newMaterial.values.properties),
                on_conflict: {
                    constraint: 'Property_pkey',
                    update_columns: ['propertyValue']
                }
            };
            delete updatedMaterial.__typename;
            return updatedMaterial;
        }
    }

    compareMaterialDetails(oldMaterial, newMaterial) {
        if (
            oldMaterial.volume !== newMaterial.values.volume ||
            oldMaterial.surfaceArea !== newMaterial.values.surfaceArea ||
            oldMaterial.usedBy.length !== newMaterial.values.usedBy.length
        ) {
            this.entityLists.rootMaterials.push(oldMaterial.id)
            return this.setNewPropertiesOnMaterial(oldMaterial, newMaterial);
        } else {
            this.addMessageToReport(
                'no_changes',
                `Material ${oldMaterial.name} was skipped because no changes were made to it.`
                )
            this.entityLists.rootMaterials.push(oldMaterial.id)
            return oldMaterial;
        }
    }

    setNewPropertiesOnMaterial(oldMaterial, newMaterial) {
        let materialCopy = JSON.parse(JSON.stringify(oldMaterial));
        materialCopy.volume = newMaterial.values.volume;
        materialCopy.surfaceArea = newMaterial.values.surfaceArea;
        materialCopy.usedBy = newMaterial.values.usedBy.map((comp) => comp.globalId)
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

    compareDimensionSets(oldDimensionSets, newDimensionSets) {
        let updatedDimensionSets = [];
        oldDimensionSets.map((oldDSet) => {
            let newDimensionSet = newDimensionSets.find((newDSet) => newDSet.dimensionHash === oldDSet.dimensionHash)
            if (newDimensionSet) {
                this.addMessageToReport(
                    'set_dimensionset_properties',
                    [
                        `Updated volume on ${oldDSet.dimensionHash} from ${oldDSet.volume} to ${newDimensionSet.totalVolume}`,
                        `Updated surface area on ${oldDSet.dimensionHash} from ${oldDSet.surfaceArea} to ${newDimensionSet.totalSurfaceArea}`,
                        `Updated items on ${oldDSet.dimensionHash} from ${oldDSet.usedBy.length} items to ${newDimensionSet.usedByObjects.length}`
                    ]
                );
                oldDSet.usedBy = newDimensionSet.usedByObjects;
                oldDSet.surfaceArea = newDimensionSet.totalSurfaceArea;
                oldDSet.volume = newDimensionSet.totalVolume;
                delete oldDSet.__typename;
                updatedDimensionSets.push(oldDSet);
                this.entityLists.dimensionSets.push(oldDSet.id);
            }
        });
        if (updatedDimensionSets.length === 0) {
            newDimensionSets.map((newDSet) => {
                let splitDimensions = newDSet.dimensionHash.replace(/^\[|\]$/g, "").split(', ')
                updatedDimensionSets.push({
                    dimensionHash:  newDSet.dimensionHash,
                    dimensionOne:   splitDimensions[0],
                    dimensionTwo:   splitDimensions[1],
                    dimensionThree: splitDimensions[2],
                    usedBy:         newDSet.usedByObjects,
                    surfaceArea:    newDSet.totalSurfaceArea,
                    volume:         newDSet.totalVolume
                });
            });
            this.addMessageToReport(
                'replaced_dimensionsets',
                'No dimensions sets remained the same in the new revision. All sets were replaced.'
            );
        }
        return updatedDimensionSets;
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

    compareProperties(oldProperties, newProperties) {
        return oldProperties.map((oldProp) => {
            let newProp = newProperties[`${oldProp.propertySet}__${oldProp.propertyKey}`];
            if (newProp && newProp.length === 1) {
                let oldValue = oldProp.propertyValue;
                oldProp.propertyValue = newProp[0];
                if (oldValue !== newProp[0]) {
                    this.addMessageToReport(
                        'set_property_update',
                        `property ${oldProp.propertySet} ${oldProp.propertyKey} was updated from ${oldValue} to ${oldProp.propertyValue}.`
                    )
                }
            } else if (oldProp.fromModel) {
                oldProp.fromModel = false;
                this.addMessageToReport(
                    'set_property_unset',
                    `property ${oldProp.propertySet} ${oldProp.propertyKey} was unset as model property because it does not exist anymore.`
                )
            } else {
                this.addMessageToReport(
                    'skip_property_update',
                    `property ${oldProp.propertySet} ${oldProp.propertyKey} was skipped because it is not a model property.`
                )
            }
            if(oldProp) {
                delete oldProp.__typename;
                delete oldProp.PredefinedProperty;
                return oldProp;
            }
        }).filter(Boolean);
    }

    addMessageToReport(key, message) {
        this.compareReport.push({
            key: key,
            message: message
        })
    }

    getGeneratedReport() {
        let reportText = '[ReStore] Generated compare report \n';
        reportText += '------------------------------- \n'
        this.compareReport.map((reportLine) => {
            if (Array.isArray(reportLine.message)) {
                reportLine.message.map((innerMessage) => {
                    reportText += `- ${innerMessage} \n`
                })
            } else {
                reportText += `- ${reportLine.message} \n`
            }
        });
        return new Blob([reportText], {
            type: 'text/plain'
        });
    }
}