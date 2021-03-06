<template>
  <b-container fluid>
    <div>
      <component-title inverse>Add new property</component-title>
      <div class="property-selector">
        <multiselect
            v-model="selectedProperty"
            :options="combinedProperties"
            :group-values="'properties'"
            :group-label="'name'"
            :custom-label="(label) => {
              return label.name ? label.name.split(/(?=[A-Z])/).join(' ') : ''
            }"
            track-by="name"
            label="name"
        />
        <b-btn
            variant="outline-light"
            :disabled="!selectedProperty"
            @click="addNewProperty"
        >Add</b-btn>
      </div>
    </div>
    <div class="property-container">
      <b-form
        @submit="saveProperties"
      >
        <b-form-group
          v-for="property in savedProperties"
          :key="property.id"
          :label="`${property.propertyKey.split(/(?=[A-Z])/).join(' ').toProperCase()} ${property.fromModel ? '(Imported from model)' : ''}`"
          :description="property.PredefinedProperty ? property.PredefinedProperty.propertyDescription : ''"
          class="inverted property"
        >
          <b-input-group
              v-if="property.PredefinedProperty && ['text', 'number', 'email', 'password', 'search', 'url', 'tek', 'date', 'time', 'range'].includes(property.PredefinedProperty.valueType)"
          >
            <b-input-group-prepend
                v-if="property.predefinedPropertyId && property.PredefinedProperty.valuePrefix"
                class="border-right-0"
            >
              <b-input-group-text class="bg-transparent font-weight-bold">
                {{ property.PredefinedProperty.valuePrefix }}
              </b-input-group-text>
            </b-input-group-prepend>
            <b-form-input
                :id="property.id"
                v-model="property.propertyValue"
                :type="property.predefinedPropertyId ? property.PredefinedProperty.valueType : 'text'"
                :step="0.01"
                :min="0.00"
                :plaintext="property.fromModel"
                :class="{
              'border-right-0': (property.predefinedPropertyId && property.PredefinedProperty.valueSuffix),
              'border-left-0': (property.predefinedPropertyId && property.PredefinedProperty.valuePrefix)
            }"
            />
            <b-input-group-append v-if="property.predefinedPropertyId && property.PredefinedProperty.valueSuffix">
              <b-input-group-text class="bg-transparent font-weight-bold">
                {{ property.PredefinedProperty.valueSuffix }}
              </b-input-group-text>
            </b-input-group-append>
          </b-input-group>
          <b-checkbox
            v-else-if="property.PredefinedProperty && property.PredefinedProperty.valueType === 'boolean'"
            :id="property.id"
            v-model="property.propertyValue"
            :unchecked-value="false"
            :value="true"
            switch
          />
          <b-form-input
              v-else
              :id="property.id"
              v-model="property.propertyValue"
              type="text"
              :step="0.01"
              :min="0.00"
              :plaintext="property.fromModel"
          />
          <b-icon
              icon="x-circle"
              :class="{
                'property--remove-button': true,
                'property--remove-button__margin': property.predefinedPropertyId && property.PredefinedProperty.valueSuffix
              }"
              @click="() => {removeProperty(property.id)}"
          />
        </b-form-group>
        <b-button
            class="inverse"
            variant="link"
            type="cancel"
            @click="() => {
                  $router.push(`/project/${$route.params.projectId}/overview`)
                }"
        >Go back</b-button> &nbsp;
        <b-btn
            type="submit"
            variant="outline-light"
        >
          Save
        </b-btn>
      </b-form>
    </div>
  </b-container>
</template>

<script>
import viewerApi from "@/viewer/ViewerApi";
import Multiselect from 'vue-multiselect'
import {getSearchRequestById} from '@/graphql/SearchRequest.graphql';
import {restoreProperties, newProperty, upsertProperties, deleteProperty} from '@/graphql/Property.graphql';
import ComponentTitle from "../../../../components/typography/ComponentTitle";
import LowLevelApi from "@/libs/LowLevelApi";

String.prototype.toProperCase = function () {
  return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

export default {
  name: "PropertiesTab",
  components: {
    ComponentTitle,
    Multiselect
  },
  props: {
    client: {
      type: Object,
      default: () => {}
    },
    project: {
      type: Object,
      default: () => {}
    },
  },
  data: function() {
    return {
      selectedProperty: null,
      lowLevelApi: {},
      rawPropertiesArray: [],
      predefinedProperties: [],
      rawProperties: {},
      searchRequest: {},
      hasRootComponent: false,
      hasRootMaterial: false,
      rootMaterial: {
        schemaId: null,
        fileId: null,
        items: [],
      },
      rootComponent: {
        schemaId: null,
        fileId: null,
        items: [],
      }
    }
  },
  apollo: {
    searchRequest: {
      query: getSearchRequestById,
      update: data => data.SearchRequest[0],
      fetchPolicy: 'no-cache',
      variables() {
        return {
          requestId: this.$route.params.requestId
        }
      }
    },
    predefinedProperties: {
      query: restoreProperties,
      update: data => data.PredefinedProperty,
      fetchPolicy: 'no-cache',
      variables() {
        return {
          requestUnit: this.apolloRequestUnit,
          componentType: this.apolloComponentType
        }
      },
      skip () {
        return !this.searchRequest.id
      },
    }
  },
  computed: {
    requestMaterial() {
      return this.searchRequest.RootMaterials[0];
    },
    requestComponent() {
      return this.searchRequest.RootComponents[0];
    },
    apolloRequestUnit() {
      console.log(this.searchRequest, this.searchRequest.unitOfMeasurement);
      return this.searchRequest.unitOfMeasurement ? this.searchRequest.unitOfMeasurement : 'NONE'
    },
    apolloComponentType() {
      return this.searchRequest.RootComponents && this.searchRequest.RootComponents[0]
          ? this.searchRequest.RootComponents[0].type : 'NONE'
    },
    objectIds() {
      if (this.hasRootComponent) {
        return this.searchRequest.RootComponents[0].Properties;
      } else if (this.hasRootMaterial) {
        return this.searchRequest.RootMaterials[0].usedBy;
      }
      return [];
    },
    properties() {
      let groupedProperties = [];
      this.rawPropertiesArray.filter((property) => {
        const splitPropertyNameArray = property.split('__');
        const savedProperty = this.savedProperties.find(p => {
          return p.propertySet.toLowerCase()  === splitPropertyNameArray[0].toLowerCase()
              && p.propertyKey.toLowerCase()  === splitPropertyNameArray[1].toLowerCase() ;
        });
        return !savedProperty;
      }).map((property) => {
        const splitPropertyNameArray = property.split('__');
        const existingPropertySet = groupedProperties.find(p => p.name === splitPropertyNameArray[0]);
        if (existingPropertySet) {
          existingPropertySet.properties.push({
            name: splitPropertyNameArray[1],
            propertySet: splitPropertyNameArray[0]
          })
        } else {
          groupedProperties.push({
            name: splitPropertyNameArray[0],
            properties: [{
              name: splitPropertyNameArray[1],
              propertySet: splitPropertyNameArray[0]
            }]
          })
        }
      });
      return groupedProperties;
    },
    restoreProperties() {
      let groupedProperties = [];
      this.predefinedProperties.filter((property) => {
        const savedProperty = this.savedProperties.find(p => {
          return p.propertySet.toLowerCase() === property.propertySet.toLowerCase()
              && p.propertyKey.toLowerCase()  === property.propertyKey.toLowerCase() ;
        });
        return !savedProperty;
      }).map((property) => {
        const existingPropertySet = groupedProperties.find(p => p.name === property.propertySet);
        if (existingPropertySet) {
          existingPropertySet.properties.push({
            name: property.propertyKey,
            propertySet: property.propertySet,
            restoreProperty: true
          })
        } else {
          groupedProperties.push({
            name: property.propertySet,
            properties: [{
              name: property.propertyKey,
              propertySet: property.propertySet,
              restoreProperty: true
            }]
          })
        }
      });
      return groupedProperties;
    },
    combinedProperties() {
      let modelProperties = [...this.properties];
      let restoreProperties = this.restoreProperties.map((propertySet) => {
        let modelPropertySet = modelProperties.find((p) => p.name.toLowerCase() === propertySet.name.toLowerCase());
        if (modelPropertySet) {
          propertySet.properties = propertySet.properties.map((property) => {
            let modelProperty = modelPropertySet.properties.find((p) => p.name.toLowerCase() === property.name.toLowerCase());
            if (modelProperty) {
              return modelProperty
            } else {
              return property;
            }
          });
        }
        return propertySet;
      })
      return [
          ...restoreProperties, ...this.properties.filter((pset) => {
            let restorePset = restoreProperties.find((rPset) => rPset.name === pset.name);
            return !restorePset;
        })
      ]
    },
    savedProperties() {
      if (this.hasRootComponent) {
        return this.searchRequest.RootComponents[0].Properties;
      } else if (this.hasRootMaterial) {
        return this.searchRequest.RootMaterials[0].Properties;
      }
      return [];
    }
  },
  mounted() {
    if (this.client) {
      this.lowLevelApi = new LowLevelApi(this.client);
    }
  },
  watch: {
    searchRequest: async function(request) {
      if (request.RootComponents[0]) {
        this.hasRootComponent = true;
        await this.getProjectComponents(this.project);
      } else if (request.RootMaterials[0]) {
        this.hasRootMaterial = true;
        await this.getProjectMaterials(this.project);
      }
    },
    'rootMaterial.items': function(items) {
      if (this.hasRootMaterial) {
        let selectedItem = items[this.requestMaterial.name];
        let filteredProperties = Object.keys(selectedItem.values.properties).filter((key) => {
          return (selectedItem.values.properties[key] && selectedItem.values.properties[key][0]) &&
              selectedItem.values.properties[key][0].length > 0;
        })
        this.rawPropertiesArray = filteredProperties;
        this.rawProperties = selectedItem.values.properties;
      }
    },
    'rootComponent.items': function(items) {
      if (this.hasRootComponent && items[this.requestComponent.type] && items[this.requestComponent.type].values) {
        let selectedItem = items[this.requestComponent.type].values.children.find((item) => {
          return item.valueHash === this.requestComponent.valueHash;
        });
        let filteredProperties = Object.keys(selectedItem.inheritedProperties).filter((key) => {
          return selectedItem.inheritedProperties[key] && selectedItem.inheritedProperties[key][0] &&
              selectedItem.inheritedProperties[key][0].length > 0
        })
        this.rawPropertiesArray = filteredProperties;
        this.rawProperties = selectedItem.inheritedProperties;
      }
    }
  },
  methods: {
    async getProjectMaterials(project) {
      this.rootMaterial.schemaId = await this.getRootMaterialSchemaId();
      this.rootMaterial.fileId = await this.getExtendedDataFileId(project.lastRevisionId, this.rootMaterial.schemaId);
      this.rootMaterial.items = await this.getRootMaterials(this.rootMaterial.fileId);
    },
    async getProjectComponents(project) {
      this.rootComponent.schemaId = await this.getRootComponentSchemaId();
      this.rootComponent.fileId = await this.getExtendedDataFileId(project.lastRevisionId, this.rootComponent.schemaId);
      this.rootComponent.items = await this.getRootComponents(this.rootComponent.fileId);
    },
    async getRootMaterialSchemaId() {
      let response = await viewerApi.callClient(this.client, {
        interfaceName: 'ServiceInterface',
        methodName: 'getExtendedDataSchemaByName',
        data: {
          name: "ROOT_MATERIALS_DATASET_0_0_1"
        }
      });
      return response.oid;
    },
    async getExtendedDataFileId(roid, soid) {
      let response = await viewerApi.callClient(this.client, {
        interfaceName: 'ServiceInterface',
        methodName: 'getLastExtendedDataOfRevisionAndSchema',
        data: {
          roid: roid,
          schemaId: soid
        }
      });
      return response.fileId;
    },
    async getRootMaterials(fileId) {
      let response = await viewerApi.callClient(this.client, {
        interfaceName: 'ServiceInterface',
        methodName: 'getFile',
        data: {
          fileId: fileId
        }
      })
      let data = atob(response.data);
      return (JSON.parse(data)).records;
    },
    async getRootComponentSchemaId() {
      let response = await viewerApi.callClient(this.client, {
        interfaceName: 'ServiceInterface',
        methodName: 'getExtendedDataSchemaByName',
        data: {
          name: "ROOT_COMPONENTS_DATASET_0_0_1"
        }
      });
      return response.oid;
    },
    async getRootComponents(fileId) {
      let response = await viewerApi.callClient(this.client, {
        interfaceName: 'ServiceInterface',
        methodName: 'getFile',
        data: {
          fileId: fileId
        }
      })
      let data = atob(response.data);
      return (JSON.parse(data)).records;
    },
    async addNewProperty() {
      const rawProperty = `${this.selectedProperty.propertySet}__${this.selectedProperty.name}`;
      if (this.rawProperties[rawProperty]) {
        await this.addModelProperty(rawProperty)
      } else {
        await this.addRestoreProperty();
      }
    },
    async addModelProperty(rawProperty) {
      const propertyValue = this.rawProperties[rawProperty][0];
      const propertyObject = {
        propertySet: this.selectedProperty.propertySet,
        propertyKey: this.selectedProperty.name,
        propertyValue: propertyValue,
        fromModel: true
      }
      if (this.hasRootMaterial) {
        propertyObject.materialId = this.searchRequest.RootMaterials[0].id
      } else if (this.hasRootComponent) {
        propertyObject.componentId = this.searchRequest.RootComponents[0].id
      }
      await this.createNewProperty(propertyObject);
    },
    async addRestoreProperty() {
      const restoreProperty = this.predefinedProperties.find((prop) => {
        return prop.propertySet === this.selectedProperty.propertySet && prop.propertyKey === this.selectedProperty.name;
      });
      const propertyObject = {
        propertySet: restoreProperty.propertySet,
        propertyKey: restoreProperty.propertyKey,
        propertyValue: '',
        predefinedPropertyId: restoreProperty.id
      }
      if (this.hasRootMaterial) {
        propertyObject.materialId = this.searchRequest.RootMaterials[0].id
      } else if (this.hasRootComponent) {
        propertyObject.componentId = this.searchRequest.RootComponents[0].id
      }
      await this.createNewProperty(propertyObject);
    },
    async createNewProperty(propertyObject) {
      await this.$apollo.mutate({
        mutation: newProperty,
        variables: {
          property: propertyObject
        }
      });
      this.$apollo.queries.searchRequest.refresh();
    },
    async removeProperty(propertyId) {
      await this.$apollo.mutate({
        mutation: deleteProperty,
        variables: {
          propertyId
        }
      });
      this.$apollo.queries.searchRequest.refresh();
    },
    cleanSavedProperties(properties) {
      return JSON.parse(JSON.stringify([...properties])).filter(p => !p.fromModel).map((property) => {
        delete property.__typename;
        delete property.PredefinedProperty
        property.propertyValue = `${property.propertyValue}`
        return property
      });
    },
    async saveProperties(e) {
      e.preventDefault();
      await this.$apollo.mutate({
        mutation: upsertProperties,
        variables: {
          properties: this.cleanSavedProperties(this.savedProperties)
        }
      });
      this.$toasted.info('Search request properties updated', {
        duration: 5000
      })
      this.$apollo.queries.predefinedProperties.refresh();
      // await this.lowLevelApi.startTransaction(this.project.oid);
      // let requests = this.cleanSavedProperties(this.savedProperties).map((property) => {
      //   return this.lowLevelApi.setPropertyForObjects(
      //       property.propertyKey, property.propertyValue, 'double', this.objectIds, this.project.lastRevisionId
      //   );
      // });
      // await Promise.all(requests);
      // await this.lowLevelApi.commitTransaction();


    }
  }
}
</script>
<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
<style lang="scss">
.property-selector {
  display: flex;
  flex-direction: row;
  .multiselect {
    margin-right: 10px;
  }
}

.property {
  position: relative;
  &--remove-button {
    position: absolute;
    right: 20px;
    top: 14px;
    cursor: pointer;
    &__margin {
      right: 50px;
    }
  }
}
</style>