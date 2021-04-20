<template>
  <b-card>
    <page-title>My projects</page-title>
    <b-table
        hover
        :items="projects"
        :fields="fields"
        @row-clicked="(record) => {
          $router.push(`/project/${record.oid}`)
        }"
    ></b-table>
  </b-card>
</template>

<script>
// @ is an alias to /src

import PageTitle from "../components/typography/PageTitle";
import viewerApi from "@/viewer/ViewerApi";
export default {
  name: 'Home',
  components: {
    PageTitle
  },
  data: function() {
    return {
      client: null,
      projects: [],
      fields: [{
        key: 'name',
        sortable: true
      }, {
        key: 'schema',
        sortable: true,
      }, {
        key: 'exportLengthMeasurePrefix',
        label: 'Unit',
        sortable: true
      }, {
        key: 'createdDate',
        label: 'Created at',
        sortable: true,
        formatter: (value) => {
          return new Date(value).toDateString()
        }
      }]
    }
  },
  async mounted() {
    this.initClient();
    await this.clientLogin();
    await this.fetchUserProjects();
  },
  methods: {
    initClient() {
      this.client = viewerApi.initClient()
    },
    async clientLogin() {
      await viewerApi.clientLogin(this.client);
    },
    async fetchUserProjects() {
      this.projects = await viewerApi.callClient(this.client, {
        interfaceName: 'ServiceInterface',
        methodName: 'getAllProjects',
        data: {
          onlyTopLevel: true,
          onlyActive: true
        }
      });
    }
  }
}
</script>
