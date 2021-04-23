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
          @click="() => {
              $router.push(`/project/${$route.params.projectId}/create`)
            }"
      >New request</b-button>
    </div>
  </div>
</template>
<script>
import PageTitle from "../../../components/typography/PageTitle";
import {getProjectSearchRequests} from '@/graphql/SearchRequest.graphql';
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
      searchRequests: []
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
    }
  },
  methods: {
  }
}
</script>
