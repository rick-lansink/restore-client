<template>
<div>
  <div style="display: flex; flex-direction: row; justify-content: space-between">
    <page-title>Project information</page-title>
    <b-btn
        variant="outline-dark"
        v-clipboard:copy="shareRequestLink"
        v-clipboard:success="() => {
          $toasted.info('Shareable project overview was copied to your clipboard!', {
            duration: 5000
          })
        }"
        size="sm"
    >
      <b-icon icon="share" font-scale="1" />
    </b-btn>
  </div>
  <component-title>Model {{ project.name }}</component-title>
  <table class="overview-table">
    <tr>
      <td><b>Unit of measurement</b></td>
      <td>{{ project.exportLengthMeasurePrefix }}</td>
    </tr>
    <tr>
      <td><b>Schema</b></td>
      <td>{{ project.schema }}</td>
    </tr>
    <tr>
      <td><b>Created on</b></td>
      <td>{{ new Date(project.createdDate).toLocaleDateString() }}</td>
    </tr>
    <tr>
      <td><b>Revisions</b></td>
      <td>{{ project.revisions ? project.revisions.length : 0 }}</td>
    </tr>
    <tr>
      <td><b>Connected services</b></td>
      <td>{{project.services ? project.services.length : 0}}</td>
    </tr>
  </table>
</div>
</template>
<script>
import PageTitle from "../../../components/typography/PageTitle";
import ComponentTitle from "../../../components/typography/ComponentTitle";
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
    internalProject: {
      type: Object,
      default: () => {}
    }
  },
  computed: {
    shareRequestLink() {
      if (window.location.port) {
        return `${window.location.hostname}:${window.location.port}/share/project/${this.internalProject.internalId}`
      }
      return `${window.location.hostname}/share/project/${this.internalProject.internalId}`
    }
  }
}
</script>

<style lang="scss" >
.overview-table {
  font-size: 16px;
  min-width: 300px;
  margin-bottom: 20px;
}
</style>