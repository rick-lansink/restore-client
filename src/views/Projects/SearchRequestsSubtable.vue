<template>
  <b-container :fluid="true">
    <page-title small>Search requests</page-title>
    <b-table show-empty :fields="fields" :items="searchRequests">
      <template #empty>
        <p>This project has no requests yet.</p>
      </template>
    </b-table>
    <b-button variant="primary" @click="() => {
      $router.push(`/project/${parentId}/create`)
    }">
      <b-icon icon="plus" /> Create
    </b-button>
  </b-container>
</template>

<script>
import PageTitle from "../../components/typography/PageTitle";
export default {
  name: "SearchRequestsSubtable",
  components: {PageTitle},
  props: {
    searchRequests: {
      type: Array,
      default: () => []
    },
    parentId: {
      type: String,
      default: ''
    }
  },
  data: function() {
    return {
      fields: [{
        key: 'name'
      }]
    }
  }
}
</script>

<style scoped>

</style>