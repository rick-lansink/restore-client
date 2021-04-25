<template>
  <div>
    <page-title>Request information</page-title>
    <div v-if="selectedRootMaterialName">
      <component-title>{{selectedMaterial.values.materialName}}</component-title>
      <p>Number of components: {{selectedMaterial.values.usedByQuantity}}</p>
      <p>Area: {{selectedMaterial.values.surfaceArea.toFixed(2)}} M2</p>
      <p>Volume: {{selectedMaterial.values.volume.toFixed(2)}} M3</p>
      <b-btn
          variant="outline-dark"
      >
        Set material
      </b-btn>
    </div>
    <div
        v-else-if="rootComponent && rootComponent.dimensionSets && rootComponent.dimensionSets.length > 0"
        :style="{height: '100%'}"
    >
      <component-title>
        {{ rootComponent.componentName }} <b-icon @click="closeCurrentComponent" icon="x-circle-fill" />
      </component-title>
      <div class="table-height-overflow">
        <b-table
            v-if="rootComponent.dimensionSets && rootComponent.dimensionSets.length > 0"
            :items="rootComponent.dimensionSets"
            :fields="rootComponentFields"
            :sticky-header="true"
            :borderless="true"
            :small="true"
            :head-variant="'primary-background'"
            :select-mode="'multi'"
            ref="componentsTable"
            selectable
            @row-selected="onRowSelected"
        >
        <template #head(selected)>
          <b-form-checkbox
            :checked="selected.length === rootComponent.dimensionSets.length"
            :indeterminate="selected.length > 0 && selected.length !== rootComponent.dimensionSets.length"
            @change="selectAll"
          />
        </template>
        <template #cell(selected)="{ rowSelected }">
          <b-form-checkbox
              disabled
              :checked="rowSelected"
          />
        </template>
        </b-table>
      </div>
      <br/>
      <b-btn
          :disabled="selected.length === 0"
          variant="outline-dark"
          @click="setRootComponentOnRequest"
      >
        Set components
      </b-btn>
    </div>
    <div v-else>

      <div
        v-if="requestComponent"
      >
        <component-title>{{requestComponent.name}}</component-title>
        <b-table
          :items="requestComponent.DimensionSets"
          :fields="requestComponentFields"
        />
      </div>
      <b-btn variant="outline-dark">
        Delete request
      </b-btn>
    </div>
  </div>
</template>
<script>

import PageTitle from "../../../components/typography/PageTitle";
import ComponentTitle from "../../../components/typography/ComponentTitle";
import {getSearchRequestById, setRootComponent} from '@/graphql/SearchRequest.graphql'
export default {
  name: 'ProjectDetail',
  components: {
    ComponentTitle,
    PageTitle
  },
  props: {
    project: {
      type: Object,
      default: () => {}
    },
    data: {
      type: Object,
      default: () => {
        return {
          rootMaterials: [],
          selectedRootMaterialName: '',
          selectedRootComponent: {}
        }
      }
    }
  },
  data: function() {
    return {
      rootComponentFields: [{
        key: 'selected',
        label: ''
      }, {
        key: 'dimensionHash',
        label: 'Dimensions',
        formatter: (dimensionHash) => {
          const dimensionArray = dimensionHash.replace(/^\[|\]$/g, "").split(', ');
          return `${dimensionArray[0]}m x ${dimensionArray[1]}m x ${dimensionArray[2]}m`
        }
      }, {
        key: 'usedByObjects',
        label: 'Number of items',
        formatter: (objects) => objects.length
      }],
      requestComponentFields: [{
          key: 'dimensionHash',
          label: 'Dimensions',
          formatter: (dimensionHash) => {
            const dimensionArray = dimensionHash.replace(/^\[|\]$/g, "").split(', ');
            return `${dimensionArray[0]}m x ${dimensionArray[1]}m x ${dimensionArray[2]}m`
          }
        }, {
          key: 'usedBy',
          label: 'Number of items',
          formatter: (objects) => objects.length
        }
      ],
      selected: [],
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
    rootMaterials() {
      return this.data.rootMaterials;
    },
    selectedRootMaterialName() {
      return this.data.selectedRootMaterialName;
    },
    selectedMaterial() {
      return this.rootMaterials[this.selectedRootMaterialName]
    },
    rootComponent() {
      return this.data.selectedRootComponent;
    },
    selectedDimensionMaps(){
      return this.selected.map(s => s.dimensionHash);
    },
    selectedObjects() {
      if (this.selected && this.selected.length > 0) {
        return this.selected.reduce((accumulated, currentValue) => [...accumulated, ...currentValue.usedByObjects], []);
      } else {
        return []
      }
    },
    requestComponent() {
      return this.searchRequest.RootComponents ? this.searchRequest.RootComponents[0] : null;
    }
  },
  watch: {
    selectedObjects: function(selectedObjects) {
      this.$store.dispatch('viewer/setItems', {
        items: selectedObjects
      })
    },
    requestComponent: function(component) {
      this.setRequestComponentItemsXray(component);
    }
  },
  methods: {
    onRowSelected(items) {
      this.selected = items;
    },
    selectAll(selected) {
      if (selected) {
        this.$refs.componentsTable.selectAllRows();
      } else {
        this.$refs.componentsTable.clearSelected();
      }
    },
    setRequestComponentItemsXray(component) {
      if (component) {
        const usedObjects = component.DimensionSets.reduce((accumulated, currentValue) => [...accumulated, ...currentValue.usedBy], []);
        this.$store.dispatch('viewer/setItems', {
          items: usedObjects
        })
      }
    },
    dimensionHashToArray(dimensionHash) {
      return dimensionHash.replace(/^\[|\]$/g, "").split(', ');
    },
    closeCurrentComponent() {
      this.$emit('reset')
      this.selected = [];
      this.$nextTick(() => {
        this.setRequestComponentItemsXray(this.requestComponent)
      })
    },
    buildRootComponentRequestData() {
      return {
        searchRequestId: this.searchRequest.id,
        name: this.rootComponent.componentName,
        type: this.rootComponent.componentType,
        valueHash: this.rootComponent.valueHash,
        DimensionSets: {
          data: [...this.rootComponent.dimensionSets.filter(dSet => this.selectedDimensionMaps.includes(dSet.dimensionHash)).map((dSet) => {
            return {
              dimensionHash: dSet.dimensionHash,
              dimensionOne: this.dimensionHashToArray(dSet.dimensionHash)[0],
              dimensionTwo: this.dimensionHashToArray(dSet.dimensionHash)[1],
              dimensionThree: this.dimensionHashToArray(dSet.dimensionHash)[2],
              usedBy: dSet.usedByObjects
            }
          })],
          on_conflict: {
            constraint: 'DimensionSet_pkey',
            update_columns: ['dimensionOne', 'dimensionTwo', 'dimensionThree', 'usedBy']
          }
        }
      }
    },
    async setRootComponentOnRequest() {
      if (this.requestComponent) {
        this.$toasted.error('Changing the component will overwrite the properties for this request. Are you sure you want to do this?', {
          action: [
            {
              text: 'Cancel',
              onClick: (_, toastObject) => {
                toastObject.goAway(0);
              }
            }, {
              text: 'Set new',
              onClick: async (_, toastObject) => {
                toastObject.goAway(0);
                await this.rootComponentRequest();

              }
              }
          ]
        })
      } else {
        await this.rootComponentRequest();
      }
    },
    async rootComponentRequest() {
      let response = await this.$apollo.mutate({
        mutation: setRootComponent,
        variables: {
          object: this.buildRootComponentRequestData(),
          rootHash: this.rootComponent.valueHash,
          requestId: this.searchRequest.id,
          dimensionSets: this.selectedDimensionMaps
        }
      });
      this.$toasted.info('Search request component updated');
      return response;
    }
  }
}
</script>

<style lang="scss">
@import "@/assets/styling/colors";
.table-height-overflow {
  height: calc(100% - 130px);
  overflow: hidden;
}

.thead-primary-background {
  background-color: $background-color;
  th {
    background-color: $background-color;
  }
}
</style>