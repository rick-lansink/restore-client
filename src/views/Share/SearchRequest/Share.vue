<template>
  <b-container>
    <search-request-share
        v-if="searchRequest"
        :search-request="searchRequest"
        :request-page="true"
    />
  </b-container>
</template>

<script>
import SearchRequestShare from "./index";
import {publicRequest} from '@/graphql/SharePages.graphql';
export default {
  name: "Share",
  components: {SearchRequestShare},
  data: function() {
    return {
      searchRequest: null,
    }
  },
  apollo: {
    searchRequest: {
      query: publicRequest,
      update: data => data.SearchRequest[0],
      fetchPolicy: 'no-cache',
      variables() {
        return {
          requestId: this.$route.params.requestId
        }
      }
    }
  }
}
</script>

<style scoped>

</style>