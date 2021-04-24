<template>
  <div>
    <div>
      <page-title inverse>Search</page-title>
      <b-tabs pills>
        <b-tab title="Components">
          <ul class="components-list">
            <li
              v-for="(rootComponents, rootType) in rootComponent.items"
              :key="rootType"
            >
              <b-btn
                  v-b-toggle="`collapse-component-${rootType}`"
                  variant="link">
                {{rootType}} ({{rootComponents.values.children.length}})
              </b-btn>
              <b-collapse
                :id="`collapse-component-${rootType}`"
              >
                <ul>
                  <li
                    v-for="rootComponent in rootComponents.values.children"
                    :key="rootComponent.valueHash"
                  >
                    <b-btn
                        v-b-toggle="`collapse-dimension-${rootComponent.valueHash.replace(/\s/g, '')}`"
                        variant="link">
                      {{rootComponent.componentName}} ({{rootComponent.dimensionSets.length}})
                    </b-btn>
                    <b-collapse
                      :id="`collapse-dimension-${rootComponent.valueHash.replace(/\s/g, '')}`"
                    >
                      <ul>
                        <li
                          v-for="dimensionSet in rootComponent.dimensionSets"
                        >
                          <b-btn
                              variant="link"
                              @click="selectRootComponentDimensionSet(rootType, rootComponent.valueHash, dimensionSet.dimensionHash)"
                          >
                            {{dimensionSet.dimensionHash}}
                          </b-btn>
                        </li>
                      </ul>
                    </b-collapse>
                  </li>
                </ul>
              </b-collapse>
            </li>
          </ul>
<!--          <b-collapse-->
<!--            v-for="(rootComponents, rootType) in rootComponent.items"-->
<!--            :key="rootType"-->
<!--            :text="rootType"-->
<!--          >-->
<!--            <b-dropdown-item>-->
<!--              <p v-for="rootComponent in rootComponents.values.rootComponents" :key="rootComponent.valueHash" :text="rootComponent.componentName">-->
<!--                {{}}-->
<!--              </p>-->
<!--              <b-dropdown-->
<!--                v-for="rootComponent in rootComponents"-->
<!--                :key="rootComponent.valueHash"-->
<!--                :text="rootComponent.componentName"-->
<!--              >-->
<!--                <b-dropdown-item>-->
<!--                  <b-dropdown-->
<!--                    v-for="dimensionSet in rootComponent.dimensionSets"-->
<!--                  >-->

<!--                  </b-dropdown>-->
<!--                </b-dropdown-item>-->
<!--              </b-dropdown>-->
            </b-dropdown-item>
          </b-collapse>
        </b-tab>
        <b-tab title="Materials">
          <b-list-group>
            <b-list-group-item
                v-for="rootMaterial in rootMaterial.items"
                :key="rootMaterial.values.oid"
                @click="selectRootMaterial(rootMaterial.values.materialName)"
            >
              {{ rootMaterial.values.materialName }}
            </b-list-group-item>
          </b-list-group>
        </b-tab>
      </b-tabs>
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
        items: this.rootMaterial.selectedMaterial.values.usedBy.map((object) => {
          return object.globalId;
        })
      });
      this.setTopData({
        selectedRootMaterialName: name,
        rootMaterials:  this.rootMaterial.items
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
  }
}
</script>

<style lang="scss">
@import "@/assets/styling/colors";
.components-list {
  color: $inverse-text-color !important;
}
</style>