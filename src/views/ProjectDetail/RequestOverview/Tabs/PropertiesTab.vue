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
          :label="`${property.propertySet.toProperCase()} ${property.propertyKey.toProperCase()} ${property.fromModel ? '(Imported from model)' : ''}`"
          :description="property.predefinedPropertyId ? property.PredefinedProperty.propertyDescription : ''"
          class="inverted property"
        >
          <b-form-input
            :id="property.id"
            v-model="property.propertyValue"
            :type="property.predefinedPropertyId ? property.PredefinedProperty.valueType : 'text'"
            :plaintext="property.fromModel"
          />
          <b-icon
              icon="x-circle"
              class="property--remove-button"
              @click="() => {removeProperty(property.id)}"
          />
        </b-form-group>
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
import {restoreProperties, newProperty, deleteProperty} from '@/graphql/Property.graphql';
import ComponentTitle from "../../../../components/typography/ComponentTitle";

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
      rawPropertiesArray: [],
      rawRestoreProperties: [],
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
    rawRestoreProperties: {
      query: restoreProperties,
      update: data => data.PredefinedProperty,
      fetchPolicy: 'no-cache'
    }
  },
  computed: {
    requestMaterial() {
      return this.searchRequest.RootMaterials[0];
    },
    requestComponent() {
      return this.searchRequest.RootComponents[0];
    },
    properties() {
      let groupedProperties = [];
      this.rawPropertiesArray.filter((property) => {
        const splitPropertyNameArray = property.split('__');
        const savedProperty = this.savedProperties.find(p => {
          return p.propertySet === splitPropertyNameArray[0] && p.propertyKey === splitPropertyNameArray[1];
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
      this.rawRestoreProperties.map((property) => {
        const existingPropertySet = groupedProperties.find(p => p.name === property.propertyKey);
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
      return [
          ...this.properties, ...this.restoreProperties
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
          return selectedItem.values.properties[key].length > 0;
        })
        this.rawPropertiesArray = filteredProperties;
        this.rawProperties = selectedItem.values.properties;
      }
    },
    'rootComponent.items': function(items) {
      if (this.hasRootComponent) {
        let selectedItem = items[this.requestComponent.type].find((item) => {
          return item.valueHash === this.requestComponent.valueHash;
        });
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
      const restoreProperty = this.rawRestoreProperties.find((prop) => {
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
    async saveProperties(e) {
      e.preventDefault();
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
    top: 0;
    bottom: 0;
    margin: auto 0;
    cursor: pointer;
  }
}
</style>