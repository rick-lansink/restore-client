<template>
  <div>
    <b-table
        :items="rootComponent.DimensionSets"
        :fields="requestComponentFields"
        :head-variant="'primary-background'"
    />
  </div>
</template>

<script>
export default {
  name: "ComponentQuantity",
  props: {
    rootComponent: {
      type: Object,
      default: () => {}
    },
    requestUnit: {
      type: String,
      default: ''
    }
  },
  data: function() {
    return {

    }
  },
  computed: {
    requestComponentFields() {
      let fields = [{
        key: 'dimensionHash',
        label: 'Dimensions',
        formatter: (dimensionHash) => {
          const dimensionArray = dimensionHash.replace(/^\[|\]$/g, "").split(', ');
          return `${dimensionArray[0]}m x ${dimensionArray[1]}m x ${dimensionArray[2]}m`
        }
      }];
      switch (this.requestUnit) {
        case 'm2':
          fields.push({
            key: 'surfaceArea',
            label: 'Surface area',
            formatter: (area) => {
              return `${area.toFixed(2)} M2`
            }
          });
          break;
        case 'm3':
          fields.push({
            key: 'volume',
            label: 'Volume',
            formatter: (volume) => {
              return volume.toFixed(2) > 0.00 ? `${volume.toFixed(2)} M3` : 'N/A'
            }
          });
          break;
        default:
          break;
      }
      fields.push({
        key: 'usedBy',
        label: 'Number of items',
        formatter: (objects) => objects.length
      });
      return fields;
    }
  }
}
</script>

<style scoped>

</style>