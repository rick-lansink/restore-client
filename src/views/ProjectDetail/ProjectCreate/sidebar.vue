<template>
  <div>
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
        await this.getProjectMaterials(project)
      }
    },
  },
  async mounted() {
    if (this.project.lastRevisionId) {
      await this.getProjectMaterials(this.project);
    }
  },
  methods: {
    async getProjectMaterials(project) {
      this.rootMaterialSchemaId = await this.getRootMaterialSchemaId();
      this.rootMaterialFileId = await this.getExtendedDataFileId(project.lastRevisionId, this.rootMaterialSchemaId);
      this.rootMaterials = await this.getRootMaterials(this.rootMaterialFileId);
    },
    selectRootMaterial(name) {
      this.selectedRootMaterialName = name;
      this.$store.dispatch('viewer/setItems', {
        items: this.selectedMaterial.values.usedBy.map((object) => {
          return object.globalId;
        })
      });
      console.log('set that data!')
      this.setTopData({
        selectedRootMaterialName: name,
        rootMaterials:  this.rootMaterials
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