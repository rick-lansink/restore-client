<template>
  <b-card>
    <page-title>My projects</page-title>
    <b-table
        hover
        show-empty
        :items="projects"
        :fields="fields"
        @row-clicked="(record) => {
          $router.push(`/project/${record.projectId}`)
        }"
    >
      <template #empty>
        <p>It looks like no BIMServer projects have been configured yet</p>
      </template>
    </b-table>
    <b-button
        primary
        @click="() => {
          $router.push('/projects/create')
        }"
    >Create new project</b-button>
  </b-card>
</template>

<script>
// @ is an alias to /src

import PageTitle from "../../components/typography/PageTitle";
import { userProjects } from '@/graphql/BimOAuth.graphql';
import {mapActions} from "vuex";
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
        key: 'dueDate',
        sortable: true,
      }]
    }
  },
  apollo: {
    projects: {
      query: userProjects,
      update: data => data.Project,
      fetchPolicy: 'no-cache'
    }
  },
  async mounted() {
    //this.initClient();
    //await this.clientLogin();
  },
  methods: {
    ...mapActions({
      'dispatchOAuthLogin': 'bimAuth/performOAuthLogin'
    }),
  }
}
</script>
