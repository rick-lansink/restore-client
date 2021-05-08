<template>
  <b-container>
    <div class="share--title-bar" style="margin-bottom: 20px;">
      <page-title>{{project.name}}</page-title>
      <b-btn
        variant="outline-dark"
        @click="printPage"
      >
        <b-icon icon="printer" />
      </b-btn>
    </div>
    <b-card>
      <b-row>
        <b-col>
          <component-title>Project information</component-title>
          <br />
          <b-table-simple>
            <b-tbody>
              <b-tr>
                <b-th>Project name</b-th>
                <b-th>{{project.name}}</b-th>
              </b-tr>
              <b-tr>
                <b-th>Due date</b-th>
                <b-th>{{project.dueDate}} ({{daysRemaining(project.dueDate)}} days remaining)</b-th>
              </b-tr>
              <b-tr>
                <b-th>Number of search requests</b-th>
                <b-th>{{project.SearchRequests ? project.SearchRequests.length : 'None'}}</b-th>
              </b-tr>
            </b-tbody>
          </b-table-simple>
        </b-col>
      </b-row>
      <br />
      <b-row>
        <b-col>
          <component-title>Project timeline</component-title>
          <search-requests-subtable
              v-if="project.SearchRequests"
              :search-requests="project.SearchRequests"
              :project="project"
              :parent-id="project.projectId"
              hide-view-button
          />
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <component-title>Request summary</component-title>
          <b-table
            hover
            show-empty
            :items="project.SearchRequests"
            :fields="searchRequestFields"
          >
            <template #cell(material)="data">
              {{ materialComponentName(data.item) }}
            </template>
            <template #cell(requestType)="data">
              {{ materialOrComponent(data.item) }}
            </template>
            <template #cell(requiredQuantity)="data">
              {{ requiredQuantity(data.item) }}
            </template>
            <template #cell(deliveryBetween)="data">
              {{data.item.deliveryFrom}} - {{data.item.deliveryUntil}}
            </template>
            <template #empty>
              <p>It looks like this project has no public search requests.</p>
            </template>
          </b-table>
        </b-col>
      </b-row>
      <br/>
    </b-card>

    <search-request-share
      v-for="request in project.SearchRequests"
      :key="request.id"
      :search-request="request"
      :open-all="openAll"
      style="margin-top: 20px;"
    />
  </b-container>
</template>

<script>
import {publicProject} from '@/graphql/SharePages.graphql';
import PageTitle from "../../../components/typography/PageTitle";
import ComponentTitle from "../../../components/typography/ComponentTitle";
import SearchRequestsSubtable from "../../Projects/SearchRequestsSubtable";
import moment from "moment";
import SearchRequestShare from "../SearchRequest";
export default {
  name: "ProjectShare",
  components: {
    SearchRequestShare,
    ComponentTitle,
    PageTitle,
    SearchRequestsSubtable
  },
  data() {
    return {
      project: {},
      openAll: false,
      searchRequestFields: [{
        key: 'name',
        label: 'Request name'
      }, {
        key: 'requestType'
      }, {
        key: 'material',
        label: 'Material / component name'
      }, {
        key: 'requiredQuantity'
      }, {
        key: 'deliveryBetween',
      }]
    }
  },
  apollo: {
    project: {
      query: publicProject,
      update: data => data.Project[0],
      fetchPolicy: 'no-cache',
      variables() {
        return {
          projectId: this.$route.params.projectId
        }
      }
    }
  },
  computed: {
  },
  methods: {
    rootMaterial(searchRequest) {
      return (searchRequest.RootMaterials && searchRequest.RootMaterials[0])
          ? searchRequest.RootMaterials[0] : null
    },
    rootComponent(searchRequest) {
      return (searchRequest.RootComponents && searchRequest.RootComponents[0])
          ? searchRequest.RootComponents[0] : null
    },
    materialComponentName(searchRequest) {
      if (this.rootMaterial(searchRequest)) {
        return this.rootMaterial(searchRequest).name;
      } else if (this.rootComponent(searchRequest)) {
        return this.rootComponent(searchRequest).name;
      }
      return '';
    },
    materialOrComponent(searchRequest) {
      if (this.rootMaterial(searchRequest)) {
        return 'Material'
      } else if (this.rootComponent(searchRequest)) {
        return 'Component'
      }
      return '';
    },
    requiredQuantity(searchRequest) {
      if (this.rootMaterial(searchRequest)) {
        return this.getRootMaterialQuantity(
            this.rootMaterial(searchRequest),
            searchRequest.unitOfMeasurement
        );
      } else if (this.rootComponent(searchRequest)) {
        return this.getRootComponentQuantity(
            this.rootComponent(searchRequest),
            searchRequest.unitOfMeasurement
        );
      }
      return '';
    },
    getRootMaterialQuantity(rootMaterial, requestUnit) {
      switch (requestUnit) {
        case 'm2':
          return !isNaN(rootMaterial.surfaceArea) ?
              `${rootMaterial.surfaceArea.toFixed(2)} m2`
              : 'N/A'
        case 'm3':
          return !isNaN(rootMaterial.volume) ?
              `${rootMaterial.volume.toFixed(2)}`
              : 'N/A'
        default:
            return 'N/A';
      }
    },
    getRootComponentQuantity(rootComponent, requestUnit) {
      switch (requestUnit) {
        case 'm2':
          return `${rootComponent.DimensionSets.reduce((a, b) => {
            return a + b.surfaceArea
          }, 0).toFixed(2)} m2`
        case 'm3':
          return `${rootComponent.DimensionSets.reduce((a, b) => {
            return a + b.volume
          }, 0).toFixed(2)} m3`
        case 'dimensions':
          return rootComponent.DimensionSets.length > 1 ? `${rootComponent.DimensionSets.reduce((a,b) => {
            return a + b.usedBy.length
          }, 0)} units (in ${rootComponent.DimensionSets.length} different dimensions)`
              :  `${rootComponent.DimensionSets.reduce((a,b) => {
                return a + b.usedBy.length
              }, 0)} units`
        default:
          return 'N/A';
      }
    },
    daysRemaining(date) {
      return moment(date).diff(moment(new Date().toISOString().split('T')[0]), 'days')
    },
    printPage() {
      this.openAll = true;
      window.setTimeout(() => {
        window.print();
      }, 100)
    }
  }
}
</script>

<style lang="scss">
.share {
  &--title-bar {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
}
</style>