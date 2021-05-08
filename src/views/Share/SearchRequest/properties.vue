<template>
  <b-row>
    <b-col>
      <b-btn
        variant="link"
        @click="tableOpen = !tableOpen"
      >
        <component-title>
          <b-icon :icon="tableOpen ? 'chevron-up' : 'chevron-down'" />
          Requirements for {{item.name}} ({{item.Properties.filter((p) => p.propertyValue).length}})
        </component-title>
      </b-btn>
      <b-collapse v-model="tableOpen" >
        <b-table-simple>
          <b-thead>
            <tr>
              <th>Property</th>
              <th></th>
            </tr>
          </b-thead>
          <b-tbody>
            <tr
                v-for="property in item.Properties.filter((p) => p.propertyValue)"
                :key="property.id"
            >
              <th>
                {{property.propertyKey.split(/(?=[A-Z])/).join(' ')}}
                <b-icon
                    v-if="property.PredefinedProperty && property.PredefinedProperty.propertyDescription"
                    v-b-popover.hover.top="property.PredefinedProperty.propertyDescription"
                    icon="info-circle"
                />
              </th>
              <th>
                {{property.PredefinedProperty ? property.PredefinedProperty.valuePrefix : ''}}
                {{property.propertyValue}}
                {{property.PredefinedProperty ? property.PredefinedProperty.valueSuffix : ''}}
              </th>
            </tr>
          </b-tbody>
        </b-table-simple>
      </b-collapse>
    </b-col>
  </b-row>
</template>

<script>
import ComponentTitle from "../../../components/typography/ComponentTitle";
export default {
  name: "rootComponent",
  components: {ComponentTitle},
  props: {
    item: {
      type: Object,
      default: () => {}
    },
    searchRequest: {
      type: Object,
      default: () => {}
    },
    openAll: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    openAll: function(open) {
      if (open) {
        this.tableOpen = true;
      }
    }
  },
  data: function() {
    return {
      tableOpen: false
    }
  }
}
</script>

<style scoped>

</style>