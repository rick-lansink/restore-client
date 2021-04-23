<template>
  <b-row class="search-request">
    <b-col cols="8" md="12" xs="12" class="search-request__body">
      <component-title inverse>
        {{ searchRequest.name }}
      </component-title>
      <component-text inverse>
        This is a short description of the search request or some additional info such as the due date.
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
      }
    }
  }
}
</script>

<style lang="scss">
@import "@/assets/styling/colors.scss";
.search-request {
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