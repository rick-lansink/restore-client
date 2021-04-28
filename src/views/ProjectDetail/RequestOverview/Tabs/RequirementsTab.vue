<template>
  <b-container>
    <b-form @submit="saveRequest">
      <b-form-group class="inverted">
        <label class="d-block">Extra requirements</label>
        <b-form-textarea
          v-model="searchRequest.extraRequirements"
          placeholder="Enter extra requirements that the request material or component must adhere to..."
          rows="4"
        />
      </b-form-group>
      <b-form-group class="inverted">
        <label class="d-block">Additional wishes</label>
        <b-form-textarea
            v-model="searchRequest.extraWishes"
            placeholder="Enter extra wishes that would be nice that the requested material or component should adhere to..."
            rows="4"
        />
      </b-form-group>
      <b-button
          class="inverse"
          variant="link"
          type="cancel"
          @click="() => {
                  $router.push(`/project/${$route.params.projectId}/overview`)
                }"
      >Go back</b-button> &nbsp;
      <b-button
          variant="outline-light"
          type="submit"
      >
        Save
      </b-button>
    </b-form>
  </b-container>
</template>

<script>
import {getSearchRequestById, updateSearchRequest} from '@/graphql/SearchRequest.graphql'
export default {
  name: "RequirementsTab",
  data: function() {
    return {
      searchRequest: {}
    }
  },
  apollo: {
    searchRequest: {
      query: getSearchRequestById,
      update: data => data.SearchRequest[0],
      fetchPolicy: 'no-cache',
      variables() {
        return {
          requestId: this.$route.params.requestId
        }
      }
    },
  },
  methods: {
    async saveRequest(event) {
      event.preventDefault();
      if (this.searchRequest) {
        const updateRequest = this.removeFieldsFromUpdate(this.searchRequest);
        await this.$apollo.mutate({
          mutation: updateSearchRequest,
          variables: {
            requestId: this.searchRequest.id,
            object: updateRequest
          }
        });
        this.$toasted.info('Search request updated');
        this.$apollo.queries.searchRequest.refresh();
      }
    },
    removeFieldsFromUpdate(object) {
      let objectCopy = {...object};
      delete objectCopy.__typename;
      delete objectCopy.id
      delete objectCopy.RootComponents;
      delete objectCopy.RootMaterials;
      return objectCopy;
    }
  }
}
</script>

<style scoped>

</style>