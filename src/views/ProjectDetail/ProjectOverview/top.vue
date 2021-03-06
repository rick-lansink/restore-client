<template>
<div>
  <b-alert
      :show="bimLastRevisionDate > new Date(internalProject.lastRevisionUpdate)"
      variant="warning"
      style="display: flex; flex-direction: row; justify-content: space-between; align-items: flex-start"
  >
    <span style="display: flex; flex-direction: row">
      <b-icon variant="exclamation-circle" />
      <p style="margin-bottom: 0">This project's IFC file has been updated</p>
    </span>
    <b-btn
      class="update-requests-btn alert-heading"
      variant="link"
      size="sm"
      @click="startCompareService"
    >
      Update requests data
    </b-btn>
    <b-toast
        id="service-toast"
        variant="info"
        solid
        no-auto-hide
        no-close-button
    >
      <template #toast-title>
        <div class="d-flex flex-grow-1 align-items-baseline">
          <b-spinner small label="Spinning"></b-spinner>
          <strong class="mr-auto" style="margin-left: 10px;">Updating request info</strong>
        </div>
      </template>
      Fetching and updating request information (this might take a while)
    </b-toast>
    <b-toast
        id="service-success-toast"
        variant="success"
        solid
        no-auto-hide
    >
      <template #toast-title>
        <div class="d-flex flex-grow-1 align-items-baseline">
          <strong class="mr-auto" style="margin-left: 10px;">Updated requests</strong>
        </div>
      </template>
      Request information was succesfully updated to the new revision
      <b-link
          v-if="generatedReport"
          :href="generatedReport"
          download="generated_restore_comparison_report.txt"
      >
        Download generated report
      </b-link>
    </b-toast>
  </b-alert>
  <div style="display: flex; flex-direction: row; justify-content: space-between">
    <page-title>Project information</page-title>
    <b-btn
        variant="outline-dark"
        v-clipboard:copy="shareRequestLink"
        v-clipboard:success="() => {
          $toasted.info('Shareable project overview was copied to your clipboard!', {
            duration: 5000
          })
        }"
        size="sm"
    >
      <b-icon icon="share" font-scale="1" />
      Share project
    </b-btn>
  </div>
  <component-title>Model {{ project.name }}</component-title>
  <table class="overview-table">
    <tr>
      <td><b>Unit of measurement</b></td>
      <td>{{ project.exportLengthMeasurePrefix }}</td>
    </tr>
    <tr>
      <td><b>Schema</b></td>
      <td>{{ project.schema }}</td>
    </tr>
    <tr>
      <td><b>Created on</b></td>
      <td>{{ new Date(project.createdDate).toLocaleDateString() }}</td>
    </tr>
    <tr>
      <td><b>Revisions</b></td>
      <td>{{ project.revisions ? project.revisions.length : 0 }}</td>
    </tr>
    <tr>
      <td><b>Connected services</b></td>
      <td>{{project.services ? project.services.length : 0}}</td>
    </tr>
  </table>
</div>
</template>
<script>
import PageTitle from "../../../components/typography/PageTitle";
import ComponentTitle from "../../../components/typography/ComponentTitle";
import viewerApi from "@/viewer/ViewerApi";
import {getSearchRequestsCompareData} from '@/graphql/SearchRequest.graphql'
import {updateProjectRequests} from '@/graphql/Project.graphql'
import RevisionCompareService from '@/libs/RevisionCompareService'
export default {
  name: 'ProjectDetail',
  components: {
    ComponentTitle,
    PageTitle
  },
  props: {
    project: {
      type: Object,
      default: () => {}
    },
    internalProject: {
      type: Object,
      default: () => {}
    },
    client: {
      type: Object,
      default: () => {}
    }
  },
  data: function() {
    return {
      rootMaterial: {
        schemaId: null,
        fileId: null,
        items: [],
      },
      rootComponent: {
        schemaId: null,
        fileId: null,
        items: [],
        rootType: null,
      },
      bimLastRevisionDate: null,
      generatedReport: null
    }
  },
  computed: {
    shareRequestLink() {
      if (window.location.port) {
        return `${window.location.hostname}:${window.location.port}/share/project/${this.internalProject.internalId}`
      }
      return `${window.location.hostname}/share/project/${this.internalProject.internalId}`
    }
  },
  mounted() {
    if (this.client && this.project) {
      this.fetchLastRevisionUpdateDate();
    }
  },
  watch: {
    'client': function(client) {
      if (client && this.project) {
        this.fetchLastRevisionUpdateDate();
      }
    },
    'project': function(project) {
      if (this.client && project) {
        this.fetchLastRevisionUpdateDate();
      }
    }
  },
  methods: {
    async startCompareService() {
      this.$bvToast.show('service-toast')
      await this.getProjectMaterials(this.project);
      await this.getProjectComponents(this.project);
      let searchRequests = await this.$apollo.query({
        query: getSearchRequestsCompareData,
        variables: {
          projectId: this.internalProject.internalId
        }
      });
      if(searchRequests.data.SearchRequest) {
        let matchService = new RevisionCompareService(searchRequests.data.SearchRequest, this.rootMaterial.items, this.rootComponent.items)
        let matches = matchService.startCompare();
        await this.saveUpdatedRequests(matches);
        let generatedReport = matchService.getGeneratedReport();
        this.generatedReport = URL.createObjectURL(generatedReport);
        this.$bvToast.hide('service-toast');
        this.$bvToast.show('service-success-toast');
      }
    },
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
    async fetchLastRevisionUpdateDate() {
      let response = await viewerApi.callClient(this.client, {
        interfaceName: 'ServiceInterface',
        methodName: 'getRevision',
        data: {
          roid: this.project.lastRevisionId
        }
      });
      this.bimLastRevisionDate = new Date(response.date);
    },
    async saveUpdatedRequests(requests) {
      let updateData = {
        internalId: this.internalProject.internalId,
        lastRevisionUpdate: new Date(),
        SearchRequests: {
          data: [
            ...requests
          ],
          on_conflict: {
            constraint: 'SearchRequest_pkey',
            update_columns: [
                'name'
            ]
          }
        }
      }
      console.log(updateData);
      let response = await this.$apollo.mutate({
        mutation: updateProjectRequests,
        variables: {
          object: updateData
        }
      })
      console.log(response);
    }
  }
}
</script>

<style lang="scss" >
.overview-table {
  font-size: 16px;
  min-width: 300px;
  margin-bottom: 20px;
}

.update-requests-btn {
  font-size: 10px !important;
  font-weight: bold !important;
  padding: 0 !important;
}
</style>