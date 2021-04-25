<template>
  <div>
    <div>
      <page-title inverse>Search requests</page-title>
      <b-container :fluid="true" :style="{
        marginTop: '40px'
      }">
        <search-request-item
            v-for="request in searchRequests"
            :key="request.id"
            :search-request="request"
        />
      </b-container>
    </div>
    <div>
      <b-button
          class="inverse"
          variant="link"
          @click="() => {
              $router.push('/projects')
            }"
      >Cancel</b-button> &nbsp;
      <b-button
          variant="outline-light"
          @click="createNewRequest"
      >
        New request
      </b-button>
    </div>
  </div>
</template>
<script>
import PageTitle from "../../../components/typography/PageTitle";
import {getProjectSearchRequests, newSearchRequest} from '@/graphql/SearchRequest.graphql';
import {getProjectById} from '@/graphql/Project.graphql'
import SearchRequestItem from "../../../components/request/SearchRequestItem";
export default {
  name: 'ProjectDetail',
  components: {
    SearchRequestItem,
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
    }
  },
  data: function() {
    return {
      searchRequests: [],
      internalProject: {}
    }
  },
  apollo: {
    searchRequests: {
      query: getProjectSearchRequests,
      update: data => data.SearchRequest,
      fetchPolicy: 'no-cache',
      variables() {
        return {
          projectId: this.$route.params.projectId
        }
      }
    },
    internalProject: {
      query: getProjectById,
      fetchPolicy: 'no-cache',
      update: data => data.Project[0],
      variables() {
        return {
          projectId: this.$route.params.projectId
        }
      }
    }
  },
  methods: {
    async createNewRequest() {
      let newRequest = await this.$apollo.mutate({
        mutation: newSearchRequest,
        variables: {
          internalProjectId: this.internalProject.internalId
        }

      });
      if (newRequest.data && newRequest.data.insert_SearchRequest) {
        this.$router.push(`/project/${this.$route.params.projectId}/request/${newRequest.data.insert_SearchRequest.returning[0].id}`)
      }
    }
  }
}
</script>
