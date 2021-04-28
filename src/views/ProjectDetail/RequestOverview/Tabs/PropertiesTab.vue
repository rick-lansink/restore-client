<template>
  <b-container fluid>
    <div>
      <multiselect
        v-model="selectedProperty"
        :options="properties"
        :group-values="'properties'"
        :group-label="'name'"
        track-by="name"
        label="name"
      />
    </div>
  </b-container>
</template>

<script>
import viewerApi from "@/viewer/ViewerApi";
import Multiselect from 'vue-multiselect'
import {getSearchRequestById} from '@/graphql/SearchRequest.graphql';
export default {
  name: "PropertiesTab",
  components: {
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
      rawProperties: [],
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
      this.rawProperties.map((property) => {
        const splitPropertyNameArray = property.split('__');
        const existingPropertySet = groupedProperties.find(p => p.name === splitPropertyNameArray[0]);
        if (existingPropertySet) {
          existingPropertySet.properties.push({
            name: splitPropertyNameArray[1]
          })
        } else {
          groupedProperties.push({
            name: splitPropertyNameArray[0],
            properties: [{
              name: splitPropertyNameArray[1]
            }]
          })
        }
      });
      return groupedProperties;
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
        this.rawProperties = filteredProperties;
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
  }
}
</script>
<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
<style scoped>

</style>