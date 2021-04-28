<template>
  <div>
    <page-title>Request information</page-title>
    <div>
      <div
        v-if="requestComponent"
      >
        <component-title>{{requestComponent.name}}</component-title>
        <b-table
          :items="requestComponent.DimensionSets"
          :fields="requestComponentFields"
        />
      </div>
      <div v-else-if="requestMaterial">
        <component-title>{{requestMaterial.name}}</component-title>
        <table class="overview-table">
          <tr>
            <td><b>Number of components</b></td>
            <td>{{requestMaterial.usedBy.length}}</td>
          </tr>
          <tr>
            <td><b>Surface area</b></td>
            <td>{{requestMaterial.surfaceArea.toFixed(2)}} M2</td>
          </tr>
          <tr>
            <td><b>Volume</b></td>
            <td>{{requestMaterial.volume.toFixed(2)}} M3</td>
          </tr>
        </table>
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
    },
    requestMaterial() {
      return this.searchRequest.RootMaterials ? this.searchRequest.RootMaterials[0] : null;
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
    },
    requestMaterial: function(material) {
      this.setRequestMaterialItemsXray(material);
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
    setRequestMaterialItemsXray(material) {
      if (material) {
        this.$store.dispatch('viewer/setItems', {
          items: material.usedBy
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
      this.$apollo.queries.searchRequest.refresh();
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