<template>
  <div style="flex: 1; height: 100%;">
    <div style="flex: 1; height: 100%;">
      <page-title inverse>{{searchRequest.name}}</page-title>
      <b-tabs pills style="flex: 1; height: 100%;">
        <b-tab
          class="selector-tab"
          title="General"
          title-link-class="text-light"
        >
          <general-tab />
        </b-tab>
        <b-tab
          class="selector-tab"
          title="Request requirements"
          title-link-class="text-light"
        >
          <requirements-tab />
        </b-tab>
        <b-tab
          class="selector-tab"
          title="Material properties"
          title-link-class="text-light"
          lazy
        >
          <properties-tab
            :client="client"
            :project="project"
          />
        </b-tab>
      </b-tabs>
    </div>
  </div>
</template>
<script>
import PageTitle from "../../../components/typography/PageTitle";
import {getSearchRequestById} from '@/graphql/SearchRequest.graphql'
import GeneralTab from "./Tabs/GeneralTab";
import RequirementsTab from "./Tabs/RequirementsTab";
import PropertiesTab from "./Tabs/PropertiesTab";
export default {
  name: 'ProjectDetail',
  components: {
    PropertiesTab,
    RequirementsTab,
    GeneralTab,
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
    },
    setTopData: {
      type: Function,
      default: () => {}
    }
  },
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
}
</script>

<style lang="scss">
@import "@/assets/styling/colors";
@import "@/assets/styling/typography";
.components-list {
  margin-top: 20px;
  color: $inverse-text-color !important;
  list-style: none;
  padding-left: 0;
  ul {
    list-style: none;
  }
  .btn-link {
    color: $inverse-text-color !important;
    font-weight: bold;
    &.collapsed > .when-opened,
    :not(&.collapsed) > .when-closed {
      display: none;
    }
  }
}

.nav-pills .nav-link.active {
  background-color: rgba(0,0,0,0) !important;
  border: 1px solid $inverse-text-color;
}

.nav-pills .text-light {
  @include base-text;
  font-weight: bold;
}

.selector-tab {
  height: 100%;
  max-height: 65vh;
  margin-bottom: 20px;
  overflow-y: scroll;
}

.tab-content {
  height: 100%;
}

.form-group.inverted {
  margin-top: 10px;
  color: $inverse-text-color;
  label.d-block, legend.col-form-label {
    color: $inverse-text-color !important;
    font-weight: bold;
  }
  input.form-control {
    background-color: rgba(0,0,0,0);
    color: $inverse-text-color;
    &.text-muted {
      color: $inverse-text-color !important;
    }
  }
  .form-control-plaintext {
    color: $inverse-text-color !important;
    font-size: 14px;
  }
  textarea.form-control {
    background-color: rgba(0,0,0,0);
    color: $inverse-text-color;
    border: 1px solid $inverse-text-color;
    &::-webkit-input-placeholder{
      color: $inverse-text-color;
    }
  }
  label.form-control {
    color: $inverse-text-color !important;
  }
  .form-text {
    color: $inverse-text-color !important;
  }
  .b-form-datepicker {
    background-color: rgba(0,0,0,0);
    color: $inverse-text-color !important;
    > button {
      color: $inverse-text-color !important;
    }
  }
  .custom-select {
    background: rgba(0,0,0,0) url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='4' height='5' viewBox='0 0 4 5'%3e%3cpath fill='%23ffffff' d='M2 0L0 2h4zm0 5L0 3h4z'/%3e%3c/svg%3e") right 0.75rem center/8px 10px no-repeat;
    color: $inverse-text-color;
  }
  .input-group-text {
    color: $inverse-text-color;
  }
}
</style>