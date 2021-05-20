<template>
  <div
      :id="`request-${searchRequest.id}`"
      :class="{
        'print-request': printing
      }"
  >
    <div class="share--title-bar">
      <page-title>Request: {{ searchRequest.name }}</page-title>
      <b-btn
          v-if="requestPage"
          variant="outline-dark"
          @click="printRequest"
      >
        <b-icon icon="printer" />
        Print request
      </b-btn>
    </div>
    <component-text
      v-if="searchRequest.deliveryFrom && searchRequest.deliveryUntil"
    >
      Delivery between {{ searchRequest.deliveryFrom }} and {{searchRequest.deliveryUntil}}
    </component-text>
    <b-card>
      <b-row>
        <b-col>
          <component-title>
            General request information
          </component-title>
          <b-table-simple>
            <b-tbody>
              <b-tr>
                <b-th>Belongs to project</b-th>
                <b-th>{{ searchRequest.Project.name }}</b-th>
              </b-tr>
              <b-tr>
                <b-th>Request name</b-th>
                <b-th>
                  {{ searchRequest.name }}
                </b-th>
              </b-tr>
              <b-tr>
                <b-th>Request type</b-th>
                <b-th>{{requestType}}</b-th>
              </b-tr>
              <b-tr>
                <b-th>Material / component name</b-th>
                <b-th>{{materialComponentName}}</b-th>
              </b-tr>
              <b-tr>
                <b-th>Required quantity</b-th>
                <b-th>{{requiredQuantity}}</b-th>
              </b-tr>
              <b-tr>
                <b-th>Delivery</b-th>
                <b-th>{{searchRequest.deliveryFrom}} - {{searchRequest.deliveryUntil}}</b-th>
              </b-tr>
            </b-tbody>
          </b-table-simple>
        </b-col>
      </b-row>
      <b-row style="margin-bottom: 20px;">
        <b-col>
          <component-title>
            Required quantity
            <span v-if="rootComponent && rootComponent.DimensionSets.length > 1">
              ({{rootComponent.DimensionSets.length}} different dimensions)
            </span>
          </component-title>
          <div v-if="rootMaterial">
            <component-text>{{requiredQuantity}}</component-text>
          </div>
          <component-quantity
            v-if="rootComponent"
            :root-component="rootComponent"
            :request-unit="searchRequest.unitOfMeasurement"
          />
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <component-title>Request description</component-title>
          <component-text>
            {{searchRequest.extraRequirements || '(This request has no description yet.)'}}
          </component-text>
        </b-col>
      </b-row>
      <b-row v-if="searchRequest.extraWishes">
        <b-col>
          <component-title>Additional wishes</component-title>
          <component-text>
            {{searchRequest.extraWishes}}
          </component-text>
        </b-col>
      </b-row>
      <properties
        :item="rootComponent || rootMaterial"
        :search-request="searchRequest"
        :open-all="openAll || internalOpenAll"
      />
    </b-card>
  </div>
</template>

<script>
import PageTitle from "../../../components/typography/PageTitle";
import ComponentTitle from "../../../components/typography/ComponentTitle";
import ComponentText from "../../../components/typography/ComponentText";
import Properties from "./properties";
import ComponentQuantity from "./componentQuantity";
export default {
name: "SearchRequestShare",
  components: {
    ComponentQuantity,
    Properties,
    ComponentText,
    PageTitle,
    ComponentTitle
  },
  props: {
    searchRequest: {
      type: Object,
      default: () => {}
    },
    openAll: {
      type: Boolean,
      default: null
    },
    requestPage: {
      type: Boolean,
      default: false
    }
  },
  data: function () {
    return {
      printing: false,
      internalOpenAll: false
    }
  },
  computed: {
    rootMaterial() {
      return this.searchRequest.RootMaterials[0] ?
          this.searchRequest.RootMaterials[0] : null
    },
    rootComponent() {
      return this.searchRequest.RootComponents[0] ?
          this.searchRequest.RootComponents[0] : null
    },
    requestType() {
      if (this.rootMaterial) {
        return 'Material'
      } else if (this.rootComponent) {
        return 'Component'
      }
      return '';
    },
    materialComponentName() {
      if (this.rootMaterial) {
        return this.rootMaterial.name;
      } else if (this.rootComponent) {
        return this.rootComponent.name;
      }
      return '';
    },
    requiredQuantity() {
      if (this.rootMaterial) {
        return this.getRootMaterialQuantity(
            this.rootMaterial,
            this.searchRequest.unitOfMeasurement
        );
      } else if (this.rootComponent) {
        return this.getRootComponentQuantity(
            this.rootComponent,
            this.searchRequest.unitOfMeasurement
        );
      }
      return '';
    },
  },
  methods: {
    printRequest() {
      this.internalOpenAll = true;
      window.setTimeout(() => {
        window.print();
      }, 100)
    },
    getRootMaterialQuantity(rootMaterial, requestUnit) {
      switch (requestUnit) {
        case 'm2':
          return !isNaN(rootMaterial.surfaceArea) ?
              `${rootMaterial.surfaceArea.toFixed(2)} m2`
              : 'N/A'
        case 'm3':
          return !isNaN(rootMaterial.volume) ?
              `${rootMaterial.volume.toFixed(2)} m3`
              : 'N/A'
        default:
          return 'N/A';
      }
    },
    getRootComponentQuantity(rootComponent, requestUnit) {
      switch (requestUnit) {
        case 'm2':
          return `${rootComponent.DimensionSets.reduce((a, b) => {
            return a + b.surfaceArea
          }, 0).toFixed(2)} m2`
        case 'm3':
          return `${rootComponent.DimensionSets.reduce((a, b) => {
            return a + b.volume
          }, 0).toFixed(2)} m3`
        case 'dimensions':
          return rootComponent.DimensionSets.length > 1 ? `${rootComponent.DimensionSets.reduce((a,b) => {
                return a + b.usedBy.length
              }, 0)} units (in ${rootComponent.DimensionSets.length} different dimensions)`
              :  `${rootComponent.DimensionSets.reduce((a,b) => {
                return a + b.usedBy.length
              }, 0)} units`
        default:
          return 'N/A';
      }
    },
  }
}
</script>

<style lang="scss">

</style>