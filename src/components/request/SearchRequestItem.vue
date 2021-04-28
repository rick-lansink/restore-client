<template>
  <b-row class="search-request">
    <b-col cols="8" md="12" xs="12" class="search-request__body">
      <component-title inverse>
        {{ searchRequest.name }} ({{searchRequest.dueDate}})
      </component-title>
      <component-text v-if="searchRequest.RootComponents.length > 0" inverse>
        {{ searchRequest.RootComponents[0].name }}
      </component-text>
      <component-text v-else-if="searchRequest.RootMaterials.length > 0" inverse>
        {{ searchRequest.RootMaterials[0].name }}
      </component-text>
      <compnent-text v-else inverse>
        (No material or component has been set for this request)
      </compnent-text>
      <component-text inverse v-if="searchRequest.deliveryFrom && searchRequest.deliveryUntil">
        Delivery between {{searchRequest.deliveryFrom}} and {{searchRequest.deliveryUntil}}
      </component-text>
    </b-col>
    <b-col cols="8" md="12" xs="12">
      <b-form-radio-group
          v-model="selected"
          :options="options"
          name="radios-btn-default"
          buttons
          button-variant="stoplight"
      ></b-form-radio-group>
    </b-col>
    <b-col cols="12">
      <b-button
        @click="() => {
          $router.push(`/project/${$route.params.projectId}/request/${searchRequest.id}`)
        }"
        variant="outline-light"
      >
        View request
      </b-button>
    </b-col>
  </b-row>
</template>

<script>
import ComponentTitle from "../typography/ComponentTitle";
import ComponentText from "../typography/ComponentText";
import {updateSearchRequestStatus} from '@/graphql/SearchRequest.graphql';
export default {
  name: "SearchRequestItem",
  components: {ComponentText, ComponentTitle},
  props: {
    searchRequest: {
      type: Object,
      default: () => {}
    }
  },
  data: function() {
    return {
      internalSelected: null,
      options: [
        { text: '', value: 'NO_GO' },
        { text: '', value: 'ON_HOLD' },
        { text: '', value: 'GO' }
      ]
    }
  },
  computed: {
    selected: {
      get() {
        if (this.internalSelected) {
          return this.internalSelected
        } else {
          return this.searchRequest.priority
        }
      },
      set(value) {
        this.internalSelected = value;
        this.updateSearchRequestStatus(value);
      }
    }
  },
  methods: {
    async updateSearchRequestStatus(value) {
      await this.$apollo.mutate({
        mutation: updateSearchRequestStatus,
        variables: {
          status: value,
          requestId: this.searchRequest.id
        }
      })
    }
  }
}
</script>

<style lang="scss">
@import "@/assets/styling/colors.scss";
.search-request {
  margin-bottom: 20px;
  &__body {

  }
}

.btn-group > .btn.btn-stoplight:first-child {
  border: 2px solid $stoplight-one;
  &.active {
    &:before {
      background-color: $stoplight-one;
    }
  }
}

.btn-group > .btn.btn-stoplight:last-child {
  border: 2px solid $stoplight-three;
  &.active {
    &:before {
      background-color: $stoplight-three;
    }
  }
}

label.btn.btn-stoplight {
  width: 35px;
  height: 35px;
  border: 2px solid $stoplight-two;
  border-radius: 100% !important;
  margin-right: 20px;
  margin-bottom: 20px;
  position: relative;
  &.active {
    &:before {
      content: "";
      position: absolute;
      width: 20px;
      height: 20px;
      border-radius: 100%;
      background-color: $stoplight-two;
      top: 5px;
      left: 5px;
    }
  }
}
</style>