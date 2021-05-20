<template>
  <div>
    <div>
      <page-title inverse>Select material or component</page-title>
      <b-tabs pills>
        <b-tab
            class="selector-tab"
            title="Components"
            title-link-class="text-light"
        >
          <ul class="components-list">
            <li
              v-for="(components, rootType) in rootComponent.items"
              :key="rootType"
            >
              <b-btn
                  v-b-toggle="`collapse-component-${rootType}`"
                  variant="link">
                  <b-icon font-scale="0.8" icon="caret-down-fill" class="when-closed" />
                  <b-icon font-scale="0.8" icon="caret-up-fill" class="when-opened" />
                {{rootType}} ({{components.values.children.length}})
              </b-btn>
              <b-collapse
                :id="`collapse-component-${rootType}`"
              >
                <ul>
                  <li
                    v-for="component in sortedComponents(components.values.children)"
                    :key="component.valueHash"
                  >
                    <b-btn
                        variant="link"
                        @click="selectRootComponent(rootType, component.valueHash)"
                    >
                      {{component.componentName}} ({{component.dimensionSets.length}})
                    </b-btn>
                  </li>
                </ul>
              </b-collapse>
            </li>
          </ul>
        </b-tab>
        <b-tab
            title-link-class="text-light"
            class="selector-tab"
            title="Materials"
        >
          <ul class="components-list">
            <li
              v-for="rootMaterialKey in sortedRootMaterials"
              :key="rootMaterialKey"
            >
              <b-btn
                  variant="link"
                  @click="selectRootMaterial(rootMaterialKey)"
              >
                {{rootMaterialKey}} ({{rootMaterial.items[rootMaterialKey].values.usedBy.length}})
              </b-btn>
            </li>
          </ul>
        </b-tab>
      </b-tabs>
      <div>
        <b-btn
            class="inverse"
            variant="link"
            @click="() => {
              $router.push(`/project/${$route.params.projectId}/request/${$route.params.requestId}`)
            }"
        >Go back</b-btn>
      </div>
    </div>
  </div>
</template>
<script>
import viewerApi from "@/viewer/ViewerApi";
import PageTitle from "../../../components/typography/PageTitle";
export default {
  name: 'ProjectDetail',
  components: {
    PageTitle,
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
    setTopData: {
      type: Function,
      default: () => {}
    }
  },
  data: function() {
    return {
      rootMaterial: {
        schemaId: null,
        fileId: null,
        items: [],
        selectedMaterial: null
      },
      rootComponent: {
        schemaId: null,
        fileId: null,
        items: [],
        rootType: null,
        selectedComponent: null,
        selectedDimension: null
      }
    }
  },
  computed: {
    sortedRootMaterials() {
      return Object.keys(this.rootMaterial.items).sort();
    },
    selectedMaterial() {
      return this.rootMaterial.items[this.rootMaterial.selectedMaterial]
    },
    selectedRootType() {
      return this.rootComponent.items[this.rootComponent.rootType];
    },
    selectedComponent() {
      return this.selectedRootType.values.children.find((component) => {
        return component.valueHash === this.rootComponent.selectedComponent;
      })
    },
    selectedDimensionSet() {
      return this.selectedComponent.dimensionSets.find((dimensionSet) => {
        return dimensionSet.dimensionHash === this.rootComponent.selectedDimension;
      })
    }
  },
  watch: {
    project: async function(project) {
      if (project.lastRevisionId) {
        await this.getProjectMaterials(project);
        await this.getProjectComponents(project);
      }
    },
  },
  async mounted() {
    if (this.project.lastRevisionId) {
      await this.getProjectMaterials(this.project);
      await this.getProjectComponents(this.project);
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
    selectRootMaterial(name) {
      this.rootMaterial.selectedMaterial = name;
      this.$store.dispatch('viewer/setItems', {
        items: this.selectedMaterial.values.usedBy.map((object) => {
          return object.globalId;
        })
      });
      this.setTopData({
        selectedRootMaterialName: name,
        rootMaterials:  this.rootMaterial.items
      })
    },
    selectRootComponent(rootType, componentName) {
      this.rootComponent.rootType = rootType;
      this.rootComponent.selectedComponent = componentName;
      this.setTopData({
        selectedRootComponent: this.selectedComponent
      })
    },
    selectRootComponentDimensionSet(rootType, componentName, dimensionName) {
      this.rootComponent.rootType = rootType;
      this.rootComponent.selectedComponent = componentName;
      this.rootComponent.selectedDimension = dimensionName;
      this.$store.dispatch('viewer/setItems', {
        items: this.selectedDimensionSet.usedByObjects
      })
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
    sortedComponents(components) {
      return [...components].sort((a, b) => {
        return (a.componentName > b.componentName) ? 1 : ((b.componentName > a.componentName) ? -1 : 0);
      })
    }
  }
}
</script>

<style lang="scss">
@import "@/assets/styling/colors";
@import "@/assets/styling/typography";
.components-list {
  margin-top: 20px;
  color: $inverse-text-color !important;
  list-style: none;
  padding-left: 0;
  ul {
    list-style: none;
  }
  .btn-link {
    color: $inverse-text-color !important;
    font-weight: bold;
    &.collapsed > .when-opened,
    :not(&.collapsed) > .when-closed {
      display: none;
    }
  }
}

.nav-pills .nav-link.active {
  background-color: rgba(0,0,0,0) !important;
  border: 1px solid $inverse-text-color;
}

.nav-pills .text-light {
  @include base-text;
  font-weight: bold;
}

.selector-tab {
  height: 75vh;
  margin-bottom: 20px;
  overflow-y: scroll;
}
</style>