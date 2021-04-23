<template>
  <div>
    <page-title>Component information</page-title>
    <div v-if="selectedRootMaterialName">
      <p>{{selectedMaterial.values.materialName}}</p>
      <p>Number of components: {{selectedMaterial.values.usedByQuantity}}</p>
      <p>Area: {{selectedMaterial.values.surfaceArea.toFixed(2)}} M2</p>
      <p>Volume: {{selectedMaterial.values.volume.toFixed(2)}} M3</p>
    </div>
  </div>
</template>
<script>

import PageTitle from "../../../components/typography/PageTitle";
export default {
  name: 'ProjectDetail',
  components: {
    PageTitle
  },
  props: {
    project: {
      type: Object,
      default: () => {}
    },
    data: {
      type: Object,
      default: () => {}
    }
  },
  data: function() {
    return {
    }
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
    }
  }
}
</script>