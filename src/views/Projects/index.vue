<template>
  <div>
    <app-header />
    <b-card style="margin-top: 10px; overflow-y: scroll; max-height: 90vh;">
      <page-title>My projects</page-title>
      <b-table
          hover
          show-empty
          :items="projects"
          :fields="fields"
          style="table-layout: fixed; max-height: 73vh;"
      >
        <template #cell(show_details)="row">
          <b-icon
              @click="row.toggleDetails"
              :icon="row.detailsShowing ? 'caret-up' : 'caret-down'" />
        </template>
        <template #cell(actions)="row">
          <b-button
              variant="primary"
              @click="$router.push(`/project/${row.item.projectId}/overview`)"
          >Go to project</b-button>
          <b-button
              variant="link"
              @click="$router.push(`/projects/${row.item.projectId}/edit`)"
          >
            Edit
          </b-button>
        </template>
        <template #empty>
          <p>It looks like no BIMServer projects have been configured yet</p>
        </template>
        <template #row-details="row">
          <b-card>
            <search-requests-subtable
                :search-requests="row.item.SearchRequests"
                :project="row.item"
                :parent-id="row.item.projectId"
            />
          </b-card>
        </template>
      </b-table>
      <b-button
          variant="primary"
          @click="() => {
          $router.push('/projects/create')
        }"
      >Create new project</b-button>
    </b-card>
  </div>
</template>

<script>
// @ is an alias to /src

import PageTitle from "../../components/typography/PageTitle";
import { userProjects } from '@/graphql/BimOAuth.graphql';
import {mapActions} from "vuex";
import SearchRequestsSubtable from "./SearchRequestsSubtable";
import AppHeader from "../../components/layout/AppHeader";
export default {
  name: 'Home',
  components: {
    AppHeader,
    SearchRequestsSubtable,
    PageTitle
  },
  data: function() {
    return {
      client: null,
      projects: [],
      fields: [{
        key: 'show_details',
        label: ''
      }, {
        key: 'name',
        sortable: true
      }, {
        key: 'dueDate',
        sortable: true,
      }, {
        key: 'isPublic',
        sortable: true
      }, {
        key: 'actions',
        label: ''
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
