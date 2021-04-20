<template>
  <restore-container>
    <div class="restore__container__header">
      <page-title>{{ project.name }}</page-title>
    </div>
    <restore-tree-sidebar>
      <page-title inverse>Search</page-title>
      <b-list-group>
        <b-list-group-item
          v-for="rootMaterial in rootMaterials"
          :key="rootMaterial.values.oid"
          @click="selectRootMaterial(rootMaterial.values.materialName)"
        >
          {{ rootMaterial.values.materialName }}
        </b-list-group-item>
      </b-list-group>
    </restore-tree-sidebar>

    <restore-main-view>
      <restore-top-main>
        <page-title>Component information</page-title>
        <div v-if="selectedRootMaterialName">
          <p>{{selectedMaterial.values.materialName}}</p>
          <p>Number of components: {{selectedMaterial.values.usedByQuantity}}</p>
          <p>Area: {{selectedMaterial.values.surfaceArea.toFixed(2)}} M2</p>
          <p>Volume: {{selectedMaterial.values.volume.toFixed(2)}} M3</p>
        </div>
      </restore-top-main>
      <restore-bottom-main>
        <bim-viewer
            v-if="project.oid"
            ref="viewer"
            :project="project"
            :client="client"
        />
      </restore-bottom-main>
    </restore-main-view>

  </restore-container>
</template>
<script>
import RestoreContainer from "../components/layout/RestoreContainer";
import RestoreTopMain from "../components/layout/RestoreTopMain";
import RestoreBottomMain from "../components/layout/RestoreBottomMain";
import RestoreTreeSidebar from "../components/layout/RestoreTreeSidebar";
import RestoreMainView from "../components/layout/RestoreMainView";
import viewerApi from "@/viewer/ViewerApi";
import PageTitle from "../components/typography/PageTitle";
import BimViewer from "../components/viewer/BimViewer";
export default {
  components: {
    BimViewer,
    PageTitle,
    RestoreBottomMain,
    RestoreMainView,
    RestoreTopMain,
    RestoreContainer,
    RestoreTreeSidebar
  },
  data: function() {
    return {
      client: null,
      project: {},
      rootMaterialSchemaId: null,
      rootMaterialFileId: null,
      rootMaterials: [],
      selectedRootMaterialName: null
    }
  },
  computed: {
    selectedMaterial() {
      return this.rootMaterials[this.selectedRootMaterialName]
    }
  },
  watch: {
    project: async function(project) {
      if (project.lastRevisionId) {
        this.rootMaterialSchemaId = await this.getRootMaterialSchemaId();
        this.rootMaterialFileId = await this.getExtendedDataFileId(project.lastRevisionId, this.rootMaterialSchemaId);
        this.rootMaterials = await this.getRootMaterials(this.rootMaterialFileId);
      }
    },
  },
  async mounted() {
    this.initClient();
    await this.clientLogin();
    await this.getUserProject(this.$route.params.projectId);
  },
  methods: {
    initClient() {
      this.client = viewerApi.initClient();
    },
    selectRootMaterial(name) {
      this.selectedRootMaterialName = name;
      this.highlightMaterial(this.selectedMaterial.values.usedBy.map((object) => {
        return object.globalId;
      }));
    },
    highlightMaterial(objectIds) {
      this.$refs.viewer.xrayOthers(objectIds);
    },
    async clientLogin() {
      await viewerApi.clientLogin(this.client);
    },
    async getUserProject(poid) {
      this.project = await viewerApi.callClient(this.client, {
        interfaceName: 'ServiceInterface',
        methodName: 'getProjectByPoid',
        data: {
          poid: poid
        }
      })
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
    async getRootMaterialSchemaId() {
      let response = await viewerApi.callClient(this.client, {
        interfaceName: 'ServiceInterface',
        methodName: 'getExtendedDataSchemaByName',
        data: {
          name: "GUID_PROPERTIES_DATASET_0_0_1"
        }
      });
      return response.oid;
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
    }
  }
}
</script>