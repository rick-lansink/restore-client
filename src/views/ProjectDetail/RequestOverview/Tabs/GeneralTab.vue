<template>
  <b-container fluid>
    <b-form
        @submit="saveRequest"
    >
      <b-form-group
          class="inverted"
          label="Request name"
          label-for="form-request-name"
          description="This name will be used when communicating on this request."
      >
        <b-form-input
            id="form-request-name"
            v-model="searchRequest.name"
            type="text"
            placeholder="Enter request name"
            required
        ></b-form-input>
      </b-form-group>
      <b-form-group
          class="inverted"
          description="This material or component will be used to calculate the quantities or dimensions and to set the right requirements for the request."
      >
        <label class="d-block">Selected material / component</label>
        <h5 v-if="searchRequest.RootComponents && searchRequest.RootComponents.length > 0 && searchRequest.RootComponents[0].name">
          <b-badge variant="light">{{searchRequest.RootComponents[0].name}}</b-badge>
        </h5>
        <h5 v-else-if="searchRequest.RootMaterials && searchRequest.RootMaterials.length > 0 && searchRequest.RootMaterials[0].name">
          <b-badge variant="light">{{searchRequest.RootMaterials[0].name}}</b-badge>
        </h5>
        <p v-else>
          Looks like no material or component was set. Click the button to set it.
        </p>
        <b-btn
            variant="outline-light"
            size="sm"
            @click="() => {
                    $router.push(`/project/${$route.params.projectId}/request/${$route.params.requestId}/material_component`)
                  }"
        >
          {{ (searchRequest.RootComponents &&
            searchRequest.RootComponents. length > 0 &&
            searchRequest.RootComponents[0].name) || (
            searchRequest.RootMaterials &&
            searchRequest.RootMaterials.length > 0 &&
            searchRequest.RootMaterials.name
        ) ? 'Change material' : 'Set material'}}
        </b-btn>
      </b-form-group>
      <b-row>
        <b-col>
          <b-form-group
            class="inverted"
            description="Set to which kind of unit should be searched on"
          >
            <label class="d-block" for="form-request-unit">Unit of measurement</label>
            <b-form-select
              id="form-request-unit"
              v-model="searchRequest.unitOfMeasurement"
              :options="unitOptions"
            />
          </b-form-group>
        </b-col>
        <b-col>
          <b-form-group
              class="inverted"
              description="Set a due date for when this request should be finished"
          >
            <label class="d-block" for="form-request-duedate">Due date</label>
            <b-form-datepicker
                id="form-request-duedate"
                v-model="searchRequest.dueDate"
            />
          </b-form-group>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <b-form-group
              class="inverted"
              description="Set a date for the request at which this item can be delivered at the earliest"
          >
            <label class="d-block" for="form-request-deliveryfrom">Deliver from</label>
            <b-form-datepicker
                id="form-request-deliveryfrom"
                v-model="searchRequest.deliveryFrom"
            />
          </b-form-group>
        </b-col>
        <b-col>
          <b-form-group
              class="inverted"
              description="Set a date for the request at which this item at the latest can be deliverd"
          >
            <label class="d-block" for="form-request-deliveryuntil">Deliver until</label>
            <b-form-datepicker
                id="form-request-deliveryuntil"
                v-model="searchRequest.deliveryUntil"
            />
          </b-form-group>
        </b-col>
      </b-row>
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
  name: "GeneralTab",
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
  computed: {
    unitOptions() {
      if (this.searchRequest && this.searchRequest.RootComponents && this.searchRequest.RootComponents.length > 0) {
        return [
          {value: null, text: 'Select a unit'},
          {value: 'm2', text: 'Surface area (m2)'},
          {value: 'm3', text: 'Volume (m3)'},
          {value: 'dimensions', text: 'Dimensions (width, height, depth)'}
        ]
      } else if (this.searchRequest && this.searchRequest.RootMaterials && this.searchRequest.RootMaterials.length > 0) {
        return [
          {value: null, text: 'Select a unit'},
          {value: 'm2', text: 'surface area (m2)'},
          {value: 'm3', text: 'volume (m3)'},
        ]
      } else {
        return [
          {value: null, text: 'Please first set a material or component'},
        ]
      }
    }
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
        this.$toasted.info('Search request updated', {
          duration: 5000
        });
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